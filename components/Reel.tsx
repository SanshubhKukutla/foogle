import React, { useRef, useEffect, useState, useContext } from 'react';
import { VideoRecipe } from '../types/shared';
import { Heart, BookOpen } from './icons/Icons';
import RecipeModal from './RecipeModal';
import { AppContext } from '../contexts/AppContext';

interface ReelProps {
  video: VideoRecipe;
  isVisible: boolean;
}

const formatCount = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const Reel: React.FC<ReelProps> = ({ video, isVisible }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const context = useContext(AppContext);

  const isFavorited = context?.favorites.includes(video._id) ?? false;

  useEffect(() => {
    if (isVisible) {
      videoRef.current?.play().then(() => {
        setIsPlaying(true);
      }).catch(e => console.log("Autoplay was prevented.", e));
    } else {
      videoRef.current?.pause();
      setIsPlaying(false);
    }
  }, [isVisible]);
  
  const handleVideoPress = () => {
    if (isPlaying) {
      videoRef.current?.pause();
      setIsPlaying(false);
    } else {
      videoRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    context?.toggleFavorite(video._id);
  };
  
  const handleRecipeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="relative h-full w-full bg-black rounded-lg overflow-hidden" onClick={handleVideoPress}>
        <video
          ref={videoRef}
          src={video.videoUrl}
          loop
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <h3 className="text-white font-bold text-lg">{video.title}</h3>
          <p className="text-white text-sm mt-1 line-clamp-2">{video.description}</p>
        </div>
        <div className="absolute right-2 bottom-20 flex flex-col items-center space-y-4">
          <button className="flex flex-col items-center text-white" onClick={handleFavoriteClick}>
            <Heart className={`w-8 h-8 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'fill-transparent'}`} />
            <span className="text-xs font-semibold">{formatCount(video.metrics?.likes ?? 0)}</span>
          </button>
          <button className="flex flex-col items-center text-white" onClick={handleRecipeClick}>
            <BookOpen className="w-8 h-8" />
            <span className="text-xs font-semibold">Recipe</span>
          </button>
        </div>
      </div>
      {isModalOpen && <RecipeModal video={video} onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

export default Reel;
