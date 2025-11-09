import React, { useState, useEffect } from 'react';
import FeedPage from './pages/FeedPage';
import UploadPage from './pages/UploadPage';
import RecommendedPage from './pages/RecommendedPage';
import { AppContext, AppContextType } from './contexts/AppContext';
import { VideoRecipe } from './types/shared';
import { Home, PlusSquare, Star } from './components/icons/Icons';

type Page = 'feed' | 'upload' | 'recommended';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('feed');
  const [videos, setVideos] = useState<VideoRecipe[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);

  // 🧩 Initialize feed (optional — skip mock data)
  useEffect(() => {
    setIsInitializing(false);
    // If you still want mock content, uncomment:
    // import('./services/initialContentService').then(({ generateInitialFeed }) =>
    //   generateInitialFeed().then(setVideos)
    // );
  }, []);

  // ✅ Add one or multiple videos at once (Gemini now can return several)
  const addVideos = (newVideos: VideoRecipe | VideoRecipe[]) => {
    const toAdd = Array.isArray(newVideos) ? newVideos : [newVideos];
    setVideos(prev => [...toAdd, ...prev]);
    setPage('feed');
  };

  const toggleFavorite = (videoId: string) => {
    setFavorites(prev =>
      prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const isRecommendationsUnlocked = favorites.length >= 3;

  const contextValue: AppContextType = {
    videos,
    favorites,
    isRecommendationsUnlocked,
    isInitializing,
    addVideo: addVideos, // ✅ supports arrays too
    toggleFavorite,
  };

  const renderPage = () => {
    switch (page) {
      case 'feed':
        return <FeedPage />;
      case 'upload':
        return <UploadPage />;
      case 'recommended':
        return <RecommendedPage />;
      default:
        return <FeedPage />;
    }
  };

  const NavItem: React.FC<{
    icon: React.ElementType;
    label: string;
    pageName: Page;
  }> = ({ icon: Icon, label, pageName }) => (
    <button
      onClick={() => setPage(pageName)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
        page === pageName ? 'text-green-400' : 'text-gray-400 hover:text-white'
      }`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-xs">{label}</span>
    </button>
  );

  return (
    <AppContext.Provider value={contextValue}>
      <div className="h-screen w-screen bg-black flex flex-col font-sans">
        <main className="flex-1 overflow-hidden">{renderPage()}</main>
        <nav className="flex-shrink-0 w-full bg-gray-900 border-t border-gray-700 grid grid-cols-3">
          <NavItem icon={Home} label="Feed" pageName="feed" />
          <NavItem icon={PlusSquare} label="Create" pageName="upload" />
          <NavItem icon={Star} label="For You" pageName="recommended" />
        </nav>
      </div>
    </AppContext.Provider>
  );
};

export default App;
