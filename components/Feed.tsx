
import React, { useRef, useEffect, useState } from 'react';
import { VideoRecipe } from '../types/shared';
import Reel from './Reel';

// TODO (T3 - Ananya): Implement robust video prefetching and optimize rendering for large feeds.

interface FeedProps {
  videos: VideoRecipe[];
}

const Feed: React.FC<FeedProps> = ({ videos }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleReelId, setVisibleReelId] = useState<string | null>(videos.length > 0 ? videos[0]._id : null);

  useEffect(() => {
    const options = {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: 0.75 // 75% of the reel must be visible
    };

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const videoId = (entry.target as HTMLElement).dataset.videoId;
          if (videoId) {
            setVisibleReelId(videoId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);
    const reels = containerRef.current?.querySelectorAll('.reel-item');
    if (reels) {
      reels.forEach(reel => observer.observe(reel));
    }

    return () => {
      if (reels) {
        reels.forEach(reel => observer.unobserve(reel));
      }
    };
  }, [videos]);

  if (videos.length === 0) {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-black">
            <h2 className="text-2xl font-bold text-green-400">Your Feed is Empty</h2>
            <p className="text-gray-400 mt-4">
                Click on "Create" to generate your first AI recipe reel!
            </p>
        </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-y-auto snap-y snap-mandatory"
    >
      {videos.map((video, index) => (
        <div 
          key={video._id} 
          data-video-id={video._id}
          className="reel-item h-full w-full snap-start flex-shrink-0"
        >
          <Reel
            video={video}
            isVisible={visibleReelId === video._id}
          />
        </div>
      ))}
    </div>
  );
};

export default Feed;
