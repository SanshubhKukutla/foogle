import React, { useState, useCallback, useContext } from 'react';
import ImageUploader from '../components/ImageUploader';
import { analyzeImagesAndSuggestRecipes } from '../services/geminiService';
import { AppContext } from '../contexts/AppContext';
import { Loader } from '../components/icons/Icons';

// TODO (T1 - Sachi): Add progress UI for Veo generation and handle Gemini/Veo errors gracefully.

const UploadPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('Upload images of your fridge or pantry.');
  const context = useContext(AppContext);

  const handleGenerateClick = useCallback(async () => {
    if (files.length === 0) {
      alert('Please upload at least one image.');
      return;
    }

    setIsLoading(true);

    try {
      // STEP 1️⃣ — Analyze fridge/pantry images with Gemini
      setStatus('🔍 Analyzing ingredients with Gemini...');
      const analysis = await analyzeImagesAndSuggestRecipes(files);
      const { visionData, recipes } = analysis;

      if (!recipes || recipes.length === 0) {
        throw new Error("The AI couldn't generate any recipes for these ingredients.");
      }

      // STEP 2️⃣ — Generate videos for all Gemini recipes via backend
      setStatus(`🎬 Creating ${recipes.length} video${recipes.length > 1 ? 's' : ''} with Veo & ElevenLabs...`);

      const videoRecipes = await Promise.all(
        recipes.map(async (recipe, idx) => {
          setStatus(`🎥 Generating video ${idx + 1} of ${recipes.length}: "${recipe.title}"...`);

          const response = await fetch('http://localhost:5000/api/generate-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recipe),
          });

          if (!response.ok) {
            throw new Error(`Video generation failed for "${recipe.title}"`);
          }

          return await response.json();
        })
      );

      // STEP 3️⃣ — Add generated videos to global feed
      videoRecipes.forEach((v) => context?.addVideo(v));

      setStatus(`✅ Done! ${videoRecipes.length} new AI-generated reel${videoRecipes.length > 1 ? 's' : ''} added to your feed.`);
    } catch (error) {
      console.error('❌ Generation failed:', error);
      setStatus(
        `⚠️ Error: ${error instanceof Error ? error.message : 'Unknown error occurred.'}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [files, context]);

  return (
    <div className="h-full w-full bg-gray-900 text-white flex flex-col p-4 overflow-y-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-400">Create a New Reel</h1>
        <p className="text-gray-400 mt-2">Let's see what you've got in your kitchen!</p>
      </div>

      <div className="flex-grow flex flex-col justify-center items-center my-6">
        <ImageUploader files={files} setFiles={setFiles} />
      </div>

      <div className="flex-shrink-0 text-center">
        <p className="text-sm text-gray-300 min-h-[40px] flex items-center justify-center">
          {isLoading && <Loader className="animate-spin mr-2" />}
          {status}
        </p>

        <button
          onClick={handleGenerateClick}
          disabled={isLoading || files.length === 0}
          className="mt-4 w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-lg transition-all duration-200 text-lg shadow-lg"
        >
          {isLoading ? 'Generating...' : `Generate Reel${files.length > 1 ? 's' : ''} (${files.length}/4)`}
        </button>
      </div>
    </div>
  );
};

export default UploadPage;
