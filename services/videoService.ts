import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { VideoRecipe } from '../types/shared';
import { GoogleGenAI } from '@google/genai';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import ffmpeg from 'fluent-ffmpeg';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Generates a 15s instructional video for a recipe:
 *  1. Uses Gemini (Veo model) to create visuals.
 *  2. Uses ElevenLabs to narrate the steps.
 *  3. Merges both and saves to ./output/
 */

export const generateVideo = async (recipe: any): Promise<VideoRecipe> => {
  console.log(`🎬 Generating AI video for: ${recipe.title}`);

  // --- 1️⃣ Prepare short, simple prompt for Gemini/Veo ---
  const prompt = `
  Create a short 15-second cooking tutorial video for the recipe "${recipe.title}".
  Focus on 4–5 visual shots that show:
  1. The ingredients on a kitchen counter.
  2. Preparation (mixing/chopping).
  3. Cooking (pan or oven scene).
  4. Final dish served attractively.
  Style: cinematic, bright lighting, realistic visuals.
  Do NOT include text or subtitles in the video itself.
  `;

  // --- 2️⃣ Generate video visuals using Veo (Gemini model) ---
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-generate-preview',
    prompt,
  });

  // Poll until video is ready
  while (!operation.done) {
    console.log('⏳ Waiting for video generation...');
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  // Download the video
  const videoFile = operation.response.generatedVideos[0].video;
  const videoPath = path.resolve(`./output/${recipe.title.replace(/\s+/g, '_')}.mp4`);

  await ai.files.download({
    file: videoFile,
    downloadPath: videoPath,
  });

  console.log(`✅ Video generated: ${videoPath}`);

  // --- 3️⃣ Generate a voiceover narration using ElevenLabs ---
  const narrationText = recipe.steps
    .map((s: string, i: number) => `Step ${i + 1}: ${s}.`)
    .join(' ');

  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });

  const voiceId = 'JBFqnCBsd6RMkjVDRZzb'; // sample: Rachel voice
  const audioStream = await elevenlabs.textToSpeech.convert(voiceId, {
    text: narrationText,
    modelId: 'eleven_multilingual_v2',
    outputFormat: 'mp3_44100_128',
  });

  const nodeStream = Readable.fromWeb(audioStream as any);
  const audioPath = path.resolve(`./output/${recipe.title.replace(/\s+/g, '_')}.mp3`);
  const audioFile = fs.createWriteStream(audioPath);
  nodeStream.pipe(audioFile);

  await new Promise<void>((resolve) => {
    audioFile.on('finish', () => resolve());
  });
  console.log(`✅ Voiceover generated: ${audioPath}`);

  // --- 4️⃣ Merge audio + video using ffmpeg ---
  const outputPath = path.resolve(`./output/${recipe.title.replace(/\s+/g, '_')}_final.mp4`);
  await new Promise<void>((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(audioPath)
      .outputOptions('-map 0:v', '-map 1:a', '-shortest')
      .on('end', () => {
        console.log(`🎉 Final video created: ${outputPath}`);
        resolve();
      })
      .on('error', reject)
      .save(outputPath);
  });

  // --- 5️⃣ Return the structured result (for DB/UI feed) ---
  const videoRecipe: VideoRecipe = {
    ...recipe,
    _id: `vid_${Date.now()}`,
    videoUrl: outputPath,
    durationSec: 15,
    metrics: {
      plays: Math.floor(Math.random() * 4000) + 500,
      likes: Math.floor(Math.random() * 1000) + 100,
    },
    createdAt: new Date(),
  };

  return videoRecipe;
};
