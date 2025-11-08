import React from 'react';
import { VideoRecipe } from '../types/shared';

interface RecipeModalProps {
  video: VideoRecipe;
  onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ video, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-green-400">{video.title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-2xl"
            aria-label="Close recipe"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Ingredients</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              {video.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient.name}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Instructions</h3>
            <ol className="list-decimal list-inside text-gray-300 space-y-3">
              {video.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeModal;