
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { getRecommendations } from '../services/recommendationService';

// TODO (T3 - Ananya): Build a more appealing grid/list view for recommendations.
// TODO (T4 - Sanshubh): Implement the actual recommendation logic.
const RecommendedPage: React.FC = () => {
    const context = useContext(AppContext);

    const recommendedVideos = useMemo(() => {
        if (!context || !context.isRecommendationsUnlocked) return [];
        return getRecommendations(context.favorites, context.videos);
    }, [context]);

    if (!context) return null;

    if (!context.isRecommendationsUnlocked) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-gray-900">
                <h2 className="text-2xl font-bold text-green-400">Unlock Recommendations</h2>
                <p className="text-gray-400 mt-4">
                    Favorite {3 - context.favorites.length} more reel{3 - context.favorites.length === 1 ? '' : 's'} to unlock personalized recommendations!
                </p>
            </div>
        );
    }
    
    return (
        <div className="h-full w-full p-4 overflow-y-auto bg-gray-900">
            <h1 className="text-3xl font-bold text-green-400 mb-6">Recommended For You</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {recommendedVideos.map(video => (
                    <div key={video._id} className="relative aspect-w-9 aspect-h-16 bg-gray-800 rounded-lg overflow-hidden group">
                        <video 
                            src={video.videoUrl} 
                            className="w-full h-full object-cover" 
                            loop 
                            muted
                            onMouseOver={e => (e.target as HTMLVideoElement).play()}
                            onMouseOut={e => (e.target as HTMLVideoElement).pause()}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-2">
                            <p className="text-white text-sm font-semibold truncate">{video.title}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendedPage;
