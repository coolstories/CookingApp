import { useState } from 'react'
import { Heart, Clock, Users, Flame, ChefHat, X, ExternalLink } from 'lucide-react'

function FavoritesTab({ favorites, setFavorites }) {
  const removeFromFavorites = (recipeId) => {
    setFavorites(prev => prev.filter(recipe => recipe.id !== recipeId))
  }

  const isFavorite = (recipeId) => {
    return favorites.some(recipe => recipe.id === recipeId)
  }

  const addToFavorites = (recipe) => {
    if (!isFavorite(recipe.id)) {
      setFavorites(prev => [recipe, ...prev])
    }
  }

  if (favorites.length === 0) {
    return (
      <div className="p-4">
        <div className="safe-area-top pt-4 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 animate-slideDown">Favorites</h1>
          <p className="text-gray-500 mt-1 animate-slideDown animation-delay-100">Your saved recipes</p>
        </div>

        <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
          <div className="bg-gradient-to-br from-pink-100 to-red-100 rounded-full p-6 mb-4 animate-float">
            <Heart size={48} className="text-pink-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">No Favorites Yet</h3>
          <p className="text-gray-500 text-center mt-2 max-w-xs">
            Save your favorite recipes to find them quickly later!
          </p>
          <div className="mt-6 flex items-center gap-2 text-pink-500">
            <Heart size={16} className="animate-pulse-slow" />
            <span className="text-sm font-medium">Start exploring recipes!</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="safe-area-top pt-4 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 animate-slideDown">Favorites</h1>
        <p className="text-gray-500 mt-1 animate-slideDown animation-delay-100">Your saved recipes ({favorites.length})</p>
      </div>

      <div className="space-y-4">
        {favorites.map((recipe, index) => (
          <div
            key={recipe.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 animate-slideUp"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg mb-1">{recipe.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{recipe.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {recipe.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {recipe.servings} servings
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame size={14} />
                    {recipe.difficulty}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => removeFromFavorites(recipe.id)}
                className="text-pink-500 hover:text-pink-600 p-2 rounded-full hover:bg-pink-50 transition-colors"
                title="Remove from favorites"
              >
                <Heart size={20} className="fill-current" />
              </button>
            </div>

            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="mb-3">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Ingredients</h4>
                <div className="flex flex-wrap gap-2">
                  {recipe.ingredients.slice(0, 5).map((ing, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                      {ing}
                    </span>
                  ))}
                  {recipe.ingredients.length > 5 && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-500">
                      +{recipe.ingredients.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <ChefHat size={16} className="text-green-500" />
                <span className="text-sm text-gray-600">Ready to cook</span>
              </div>
              
              {recipe.sources && recipe.sources.length > 0 && (
                <div className="flex gap-2">
                  {recipe.sources.slice(0, 2).map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      {source.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FavoritesTab
