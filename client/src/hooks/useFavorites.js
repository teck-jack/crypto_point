import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load favorites from localStorage
  const loadFavorites = () => {
    try {
      const localFavorites = localStorage.getItem('crypto-favorites');
      if (localFavorites) {
        const parsed = JSON.parse(localFavorites);
        setFavorites(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
      setFavorites([]);
    }
  };

  // Save favorites to localStorage
  const saveFavorites = (newFavorites) => {
    try {
      localStorage.setItem('crypto-favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
      toast.error('Failed to save favorites');
    }
  };

  // Toggle favorite status
  const toggleFavorite = (symbol) => {
    setIsLoading(true);
    
    try {
      const isFavorite = favorites.includes(symbol);
      let newFavorites;
      
      if (isFavorite) {
        newFavorites = favorites.filter(fav => fav !== symbol);
      } else {
        newFavorites = [...favorites, symbol];
      }
      
      setFavorites(newFavorites);
      saveFavorites(newFavorites);
      
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    } finally {
      setIsLoading(false);
    }
  };

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  return {
    favorites,
    toggleFavorite,
    isLoading
  };
};