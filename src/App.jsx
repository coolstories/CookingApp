import { useState, useEffect } from 'react'
import { Home, History, User, ChefHat, Heart } from 'lucide-react'
import ScannerTab from './components/ScannerTab'
import HistoryTab from './components/HistoryTab'
import ProfileTab from './components/ProfileTab'
import RecipesTab from './components/RecipesTab'
import FavoritesTab from './components/FavoritesTab'
import Onboarding from './components/Onboarding'

function App() {
  const [activeTab, setActiveTab] = useState('scanner')
  const [scanHistory, setScanHistory] = useState([])
  const [pantry, setPantry] = useState([])
  const [recipes, setRecipes] = useState([])
  const [favorites, setFavorites] = useState([])
  const [ingredients, setIngredients] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [userName, setUserName] = useState('')
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [preferences, setPreferences] = useState([
    { id: 'vegetarian', name: 'Vegetarian', emoji: '🥬', description: 'No meat or fish', enabled: false },
    { id: 'vegan', name: 'Vegan', emoji: '🌱', description: 'No animal products', enabled: false },
    { id: 'glutenfree', name: 'Gluten-Free', emoji: '🌾', description: 'No gluten', enabled: false },
    { id: 'dairyfree', name: 'Dairy-Free', emoji: '🥛', description: 'No dairy products', enabled: false },
    { id: 'sweettooth', name: 'Sweet Tooth', emoji: '🍰', description: 'Love desserts', enabled: false },
    { id: 'spicy', name: 'Spicy Food', emoji: '🌶️', description: 'Love spicy dishes', enabled: false },
    { id: 'lowcarb', name: 'Low Carb', emoji: '🥩', description: 'Reduce carbohydrates', enabled: false },
    { id: 'healthy', name: 'Healthy Eating', emoji: '💪', description: 'Nutritious meals', enabled: false },
  ])
  const [isAdmin, setIsAdmin] = useState(false) // Admin state for unlimited chat
  const [cookingLevel, setCookingLevel] = useState('intermediate') // Cooking level for recipe complexity

  // Check if onboarding should be shown
  useEffect(() => {
    try {
      const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding')
      const storedUserName = localStorage.getItem('userName')
      
      if (hasCompletedOnboarding !== 'true') {
        setShowOnboarding(true)
      }
      
      if (storedUserName) {
        setUserName(storedUserName)
      }
    } catch (error) {
      console.warn('Error checking onboarding status:', error)
    }
  }, [])

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      // Load all data in the correct order
      const storedHistory = localStorage.getItem('scanHistory')
      if (storedHistory) setScanHistory(JSON.parse(storedHistory))

      const storedPantry = localStorage.getItem('pantry')
      if (storedPantry) setPantry(JSON.parse(storedPantry))

      const storedRecipes = localStorage.getItem('recipes')
      if (storedRecipes) setRecipes(JSON.parse(storedRecipes))

      const storedFavorites = localStorage.getItem('favorites')
      if (storedFavorites) setFavorites(JSON.parse(storedFavorites))

      const storedPreferences = localStorage.getItem('preferences')
      if (storedPreferences) setPreferences(JSON.parse(storedPreferences))

      const storedActiveTab = localStorage.getItem('activeTab')
      console.log('Loading activeTab from localStorage:', storedActiveTab)
      if (storedActiveTab) setActiveTab(storedActiveTab)

      const storedImagePreview = localStorage.getItem('imagePreview')
      if (storedImagePreview) setImagePreview(storedImagePreview)

      const storedIngredients = localStorage.getItem('ingredients')
      if (storedIngredients) setIngredients(JSON.parse(storedIngredients))

      const storedIsAdmin = localStorage.getItem('isAdmin')
      if (storedIsAdmin) setIsAdmin(JSON.parse(storedIsAdmin))

      const storedCookingLevel = localStorage.getItem('cookingLevel')
      if (storedCookingLevel) setCookingLevel(storedCookingLevel)
    } catch (error) {
      console.warn('Error loading data from localStorage:', error)
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('scanHistory', JSON.stringify(scanHistory))
    } catch (error) {
      console.warn('Error saving scanHistory to localStorage:', error)
    }
  }, [scanHistory])

  useEffect(() => {
    try {
      localStorage.setItem('pantry', JSON.stringify(pantry))
    } catch (error) {
      console.warn('Error saving pantry to localStorage:', error)
    }
  }, [pantry])

  useEffect(() => {
    try {
      localStorage.setItem('recipes', JSON.stringify(recipes))
    } catch (error) {
      console.warn('Error saving recipes to localStorage:', error)
    }
  }, [recipes])

  useEffect(() => {
    try {
      localStorage.setItem('favorites', JSON.stringify(favorites))
    } catch (error) {
      console.warn('Error saving favorites to localStorage:', error)
    }
  }, [favorites])

  useEffect(() => {
    try {
      localStorage.setItem('preferences', JSON.stringify(preferences))
    } catch (error) {
      console.warn('Error saving preferences to localStorage:', error)
    }
  }, [preferences])

  useEffect(() => {
    try {
      localStorage.setItem('activeTab', activeTab)
      console.log('Saved activeTab to localStorage:', activeTab)
    } catch (error) {
      console.warn('Error saving activeTab to localStorage:', error)
    }
  }, [activeTab])

  useEffect(() => {
    try {
      localStorage.setItem('isAdmin', JSON.stringify(isAdmin))
    } catch (error) {
      console.warn('Error saving isAdmin to localStorage:', error)
    }
  }, [isAdmin])

  useEffect(() => {
    try {
      localStorage.setItem('cookingLevel', cookingLevel)
    } catch (error) {
      console.warn('Error saving cookingLevel to localStorage:', error)
    }
  }, [cookingLevel])

  useEffect(() => {
    try {
      localStorage.setItem('imagePreview', imagePreview || '')
    } catch (error) {
      console.warn('Error saving imagePreview to localStorage:', error)
    }
  }, [imagePreview])

  useEffect(() => {
    try {
      localStorage.setItem('ingredients', JSON.stringify(ingredients))
    } catch (error) {
      console.warn('Error saving ingredients to localStorage:', error)
    }
  }, [ingredients])

  const addToHistory = (scan) => {
    setScanHistory(prev => [scan, ...prev])
  }

  const handleOnboardingComplete = (name) => {
    try {
      localStorage.setItem('hasCompletedOnboarding', 'true')
      if (name) {
        localStorage.setItem('userName', name)
        setUserName(name)
      }
      // Load cooking level from onboarding
      const storedCookingLevel = localStorage.getItem('cookingLevel')
      if (storedCookingLevel) {
        setCookingLevel(storedCookingLevel)
      }
      // Load preferences from onboarding
      const storedPreferences = localStorage.getItem('preferences')
      if (storedPreferences) {
        setPreferences(JSON.parse(storedPreferences))
      }
      setShowOnboarding(false)
      setActiveTab('scanner') // Navigate to scanner after onboarding
    } catch (error) {
      console.warn('Error saving onboarding completion:', error)
    }
  }

  const handleOnboardingSkip = () => {
    try {
      localStorage.setItem('hasCompletedOnboarding', 'true')
      setShowOnboarding(false)
      setActiveTab('scanner') // Navigate to scanner after skipping onboarding
    } catch (error) {
      console.warn('Error saving onboarding skip:', error)
    }
  }

  const handleRedoOnboarding = () => {
    setShowOnboarding(true)
  }

  const tabs = [
    { id: 'scanner', label: 'Scanner', icon: Home },
    { id: 'recipes', label: 'Recipes', icon: ChefHat },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'history', label: 'History', icon: History },
    { id: 'profile', label: 'Profile', icon: User },
  ]

  const renderTab = () => {
    switch (activeTab) {
      case 'scanner':
        return (
          <ScannerTab 
            addToHistory={addToHistory} 
            pantry={pantry} 
            setPantry={setPantry}
            ingredients={ingredients}
            setIngredients={setIngredients}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            isAdmin={isAdmin}
            setActiveTab={setActiveTab}
          />
        )
      case 'recipes':
        return (
          <RecipesTab 
            pantry={pantry} 
            preferences={preferences}
            recipes={recipes}
            setRecipes={setRecipes}
            setPantry={setPantry}
            cookingLevel={cookingLevel}
            favorites={favorites}
            setFavorites={setFavorites}
          />
        )
      case 'favorites':
        return <FavoritesTab favorites={favorites} setFavorites={setFavorites} />
      case 'history':
        return <HistoryTab history={scanHistory} setHistory={setScanHistory} />
      case 'profile':
        return <ProfileTab preferences={preferences} setPreferences={setPreferences} onRedoOnboarding={handleRedoOnboarding} isAdmin={isAdmin} setIsAdmin={setIsAdmin} cookingLevel={cookingLevel} setCookingLevel={setCookingLevel} />
      default:
        return <ScannerTab addToHistory={addToHistory} pantry={pantry} setPantry={setPantry} />
    }
  }

  return (
    <div className="min-h-screen bg-[#f2f2f7] flex flex-col max-w-md mx-auto relative overflow-x-hidden">
      {/* Onboarding Overlay */}
      {showOnboarding && (
        <Onboarding 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      <main className="flex-1 overflow-auto pb-20 overflow-x-hidden">
        {renderTab()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 ios-blur border-t border-gray-200 safe-area-bottom max-w-md mx-auto overflow-x-hidden">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200"
              >
                <Icon
                  size={24}
                  className={isActive ? 'text-blue-500' : 'text-gray-400'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default App
