import React, { useState, useCallback, useContext } from 'react';
import ImageUploader from '../components/ImageUploader';
import { analyzeImagesAndSuggestRecipes } from '../services/geminiService';
import { generateRecipe } from '../services/recipeService';
import { generateVideo } from '../services/videoService';
import { makeSignature } from '../utils/signature';
import { AppContext } from '../contexts/AppContext';
import { Loader } from '../components/icons/Icons';

// TODO (T1 - Sachi): Improve image cropping/editing UI. Handle API errors gracefully.
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
      // Step 1: Analyze images and get recipe ideas
      setStatus('Analyzing ingredients with Gemini...');
      const analysis = await analyzeImagesAndSuggestRecipes(files);
      const { visionData, recipeIdeas } = analysis;

      if (!recipeIdeas || recipeIdeas.length === 0) {
        throw new Error("The AI couldn't come up with any recipes for these ingredients.");
      }
      
      const signature = makeSignature(visionData.items.map(i => i.name), visionData.tags);
      const chosenRecipe = recipeIdeas[0]; // Auto-select the first recipe idea for this demo

      // Step 2: Generate a detailed recipe draft
      setStatus(`Crafting a recipe for "${chosenRecipe.title}"...`);
      const recipeDraft = await generateRecipe(signature, visionData, chosenRecipe);

      // Step 3: Generate the video
      setStatus('Generating video with Veo & ElevenLabs...');
      const videoRecipe = await generateVideo(recipeDraft);

      setStatus('Done! Your video is ready.');
      context?.addVideo(videoRecipe);

    } catch (error) {
      console.error('Generation failed:', error);
      setStatus(`An error occurred. Please try again. ${error instanceof Error ? error.message : ''}`);
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
          {isLoading && <Loader className="animate-spin mr-2"/>}
          {status}
        </p>
        <button
          onClick={handleGenerateClick}
          disabled={isLoading || files.length === 0}
          className="mt-4 w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-4 rounded-lg transition-all duration-200 text-lg shadow-lg"
        >
          {isLoading ? 'Generating...' : `Generate Reel (${files.length}/4)`}
        </button>
      </div>
    </div>
  );
};

export default UploadPage;
