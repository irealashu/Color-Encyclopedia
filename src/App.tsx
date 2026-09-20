import React, { useState, useEffect, useCallback } from 'react';
import {
  ActiveColor,
  NavTab,
  ToastMessage,
  HistoryItem,
} from './types';
import { buildActiveColor, generateRandomHex } from './utils/colorMath';
import { HeaderAnchor } from './components/HeaderAnchor';
import { SidebarNav } from './components/SidebarNav';
import { ToastContainer } from './components/ToastContainer';
import { ExploreTab } from './components/tabs/ExploreTab';
import { EnginesTab } from './components/tabs/EnginesTab';
import { StudiosTab } from './components/tabs/StudiosTab';
import { AccessibilityTab } from './components/tabs/AccessibilityTab';
import { ImageDownloaderTab } from './components/tabs/ImageDownloaderTab';
import { DeveloperExportTab } from './components/tabs/DeveloperExportTab';
import { FavoritesHistoryTab } from './components/tabs/FavoritesHistoryTab';

const LOCAL_STORAGE_THEME = 'color_encyclopedia_theme';
const LOCAL_STORAGE_FAVORITES = 'color_encyclopedia_favorites';
const LOCAL_STORAGE_HISTORY = 'color_encyclopedia_history';
const LOCAL_STORAGE_ACTIVE = 'color_encyclopedia_active_color';

export default function App() {
  // 1. Theme State: Default to Light Mode as specified
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_THEME);
      return saved === 'dark';
    } catch {
      return false;
    }
  });

  // 2. Active Color State
  const [activeColor, setActiveColor] = useState<ActiveColor>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ACTIVE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.hex) return buildActiveColor(parsed.hex, parsed.alpha ?? 1);
      }
    } catch {
      // fallback
    }
    return {
      ...buildActiveColor('#2563EB', 1),
      name: 'Royal Blue 600',
    };
  });

  // 3. Current Navigation Tab
  const [currentTab, setCurrentTab] = useState<NavTab>('explore');

  // 4. Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_FAVORITES);
      return saved ? JSON.parse(saved) : ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    } catch {
      return ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    }
  });

  // 5. Recent Activity History State (up to 35 items)
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 6. Toasts State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply dark class to document root
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_THEME, isDarkMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDarkMode]);

  // Persist Favorites
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_FAVORITES, JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  // Persist History
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Persist Active Color
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE, JSON.stringify(activeColor));
    } catch {
      // ignore
    }
  }, [activeColor]);

  // Helper: Trigger Toast
  const addToast = useCallback((type: ToastMessage['type'], title: string, detail?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, detail }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper: Copy text to clipboard
  const handleCopyText = (text: string, label: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => {
          addToast('copy', `Copied ${label} to clipboard`, text);
        },
        () => {
          addToast('info', `Copied ${label}`, text);
        }
      );
    } else {
      addToast('copy', `Copied ${label}`, text);
    }
  };

  // Helper: Select Color & record to history
  const handleSelectColor = (hex: string, name?: string) => {
    const newColor: ActiveColor = {
      ...buildActiveColor(hex, activeColor.alpha),
      name: name || undefined,
    };
    setActiveColor(newColor);

    // Record to history (max 35 entries)
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.hex.toUpperCase() !== hex.toUpperCase());
      return [{ hex, name, timestamp: Date.now() }, ...filtered].slice(0, 35);
    });
  };

  // Helper: Update full active color (from engines sliders etc.)
  const handleUpdateActiveColor = (newColor: ActiveColor) => {
    setActiveColor(newColor);
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.hex.toUpperCase() !== newColor.hex.toUpperCase());
      return [{ hex: newColor.hex, name: newColor.name, timestamp: Date.now() }, ...filtered].slice(0, 35);
    });
  };

  // Helper: Toggle Favorite for active or specific hex
  const handleToggleFavorite = (targetHex?: string) => {
    const hex = (targetHex || activeColor.hex).toUpperCase();
    if (favorites.includes(hex)) {
      setFavorites((prev) => prev.filter((h) => h !== hex));
      addToast('info', 'Removed from favorites', hex);
    } else {
      setFavorites((prev) => [hex, ...prev]);
      addToast('favorite', 'Saved to favorites', hex);
    }
  };

  // Helper: Clear history
  const handleClearHistory = () => {
    setHistory([]);
    addToast('info', 'Activity history cleared');
  };

  // Helper: Random Color Generator
  const handleRandomizeColor = () => {
    const randomHex = generateRandomHex();
    handleSelectColor(randomHex, 'Random Discovery');
    addToast('success', 'Generated random color', randomHex);
  };

  // Helper: Native EyeDropper API
  const hasEyeDropper = typeof window !== 'undefined' && 'EyeDropper' in window;
  const handleEyeDropper = async () => {
    if (hasEyeDropper) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          handleSelectColor(result.sRGBHex, 'EyeDropper Sample');
          addToast('success', 'Sampled pixel from screen', result.sRGBHex);
        }
      } catch (err) {
        // user cancelled or rejected picker
      }
    } else {
      addToast(
        'info',
        'EyeDropper requires Chrome or Edge',
        'Use Chromium-based desktop browsers to sample screen pixels'
      );
    }
  };

  // Helper: Dark Mode Toggle
  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const isCurrentFavorite = favorites.includes(activeColor.hex.toUpperCase());

  return (
    <div id="color-encyclopedia-app" className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Persistent Unified Canvas Display (Global Header Anchor) */}
      <HeaderAnchor
        activeColor={activeColor}
        isFavorite={isCurrentFavorite}
        onToggleFavorite={() => handleToggleFavorite()}
        onCopyText={handleCopyText}
        onOpenDownloader={() => setCurrentTab('downloader')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onRandomize={handleRandomizeColor}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <SidebarNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onRandomize={handleRandomizeColor}
          onEyeDropper={handleEyeDropper}
          hasEyeDropper={hasEyeDropper}
          favoritesCount={favorites.length}
          historyCount={history.length}
          activeHex={activeColor.hex}
        />

        {/* Content Area */}
        <main
          id="main-tab-content"
          className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto"
        >
          {currentTab === 'explore' && (
            <ExploreTab
              activeHex={activeColor.hex}
              onSelectColor={handleSelectColor}
              onCopyText={handleCopyText}
            />
          )}

          {currentTab === 'engines' && (
            <EnginesTab
              activeColor={activeColor}
              onChangeColor={handleUpdateActiveColor}
              onCopyText={handleCopyText}
            />
          )}

          {currentTab === 'studios' && (
            <StudiosTab
              activeColor={activeColor}
              onSelectColor={handleSelectColor}
              onCopyText={handleCopyText}
            />
          )}

          {currentTab === 'accessibility' && (
            <AccessibilityTab
              activeColor={activeColor}
              onSelectColor={handleSelectColor}
              onCopyText={handleCopyText}
            />
          )}

          {currentTab === 'downloader' && (
            <ImageDownloaderTab
              activeColor={activeColor}
              onDownloadTriggered={(filename, res) =>
                addToast('download', `Downloaded ${filename}`, res)
              }
            />
          )}

          {currentTab === 'exports' && (
            <DeveloperExportTab
              activeColor={activeColor}
              favorites={favorites}
              onCopyText={handleCopyText}
            />
          )}

          {currentTab === 'favorites' && (
            <FavoritesHistoryTab
              favorites={favorites}
              history={history}
              activeHex={activeColor.hex}
              onSelectColor={handleSelectColor}
              onToggleFavorite={handleToggleFavorite}
              onClearHistory={handleClearHistory}
              onCopyText={handleCopyText}
            />
          )}
        </main>
      </div>

      {/* Floating Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
