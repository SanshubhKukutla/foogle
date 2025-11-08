import React, { useContext } from 'react';
import Feed from '../components/Feed';
import { AppContext } from '../contexts/AppContext';
import { Loader } from '../components/icons/Icons';

// TODO (T3 - Ananya): Implement prefetching logic and infinite scroll.
const FeedPage: React.FC = () => {
    const context = useContext(AppContext);

    if (!context) {
        return <div>Loading...</div>; // Or some error state
    }

    const { videos, isInitializing } = context;

    if (isInitializing) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-black">
                <Loader className="w-12 h-12 animate-spin text-green-400" />
                <h2 className="text-xl font-bold text-green-400 mt-4">Generating Your First Recipes...</h2>
                <p className="text-gray-400 mt-2">
                    The AI is getting creative with some starter ingredients!
                </p>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-black">
            <Feed videos={videos} />
        </div>
    );
};

export default FeedPage;