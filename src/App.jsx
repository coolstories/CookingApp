import { useState, useEffect } from 'react'
import { Home, History, User, ChefHat } from 'lucide-react'
import ScannerTab from './components/ScannerTab'
import HistoryTab from './components/HistoryTab'
import ProfileTab from './components/ProfileTab'
import RecipesTab from './components/RecipesTab'
import Onboarding from './components/Onboarding'

function App() {
  const [activeTab, setActiveTab] = useState('scanner')
  const [scanHistory, setScanHistory] = useState([])
  const [pantry, setPantry] = useState([])
  const [recipes, setRecipes] = useState([])
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
      const storedHistory = localStorage.getItem('scanHistory')
      if (storedHistory) setScanHistory(JSON.parse(storedHistory))

      const storedPantry = localStorage.getItem('pantry')
      if (storedPantry) setPantry(JSON.parse(storedPantry))

      const storedRecipes = localStorage.getItem('recipes')
      if (storedRecipes) setRecipes(JSON.parse(storedRecipes))

      const storedPreferences = localStorage.getItem('preferences')
      if (storedPreferences) setPreferences(JSON.parse(storedPreferences))
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
      localStorage.setItem('preferences', JSON.stringify(preferences))
    } catch (error) {
      console.warn('Error saving preferences to localStorage:', error)
    }
  }, [preferences])

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
      setShowOnboarding(false)
    } catch (error) {
      console.warn('Error saving onboarding completion:', error)
    }
  }

  const handleOnboardingSkip = () => {
    try {
      localStorage.setItem('hasCompletedOnboarding', 'true')
      setShowOnboarding(false)
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
          />
        )
      case 'recipes':
        return (
          <RecipesTab 
            pantry={pantry} 
            preferences={preferences}
            recipes={recipes}
            setRecipes={setRecipes}
          />
        )
      case 'history':
        return <HistoryTab history={scanHistory} />
      case 'profile':
        return <ProfileTab preferences={preferences} setPreferences={setPreferences} onRedoOnboarding={handleRedoOnboarding} />
      default:
        return <ScannerTab addToHistory={addToHistory} pantry={pantry} setPantry={setPantry} />
    }
  }

  return (
    <div className="min-h-screen bg-[#f2f2f7] flex flex-col max-w-md mx-auto relative">
      {/* Onboarding Overlay */}
      {showOnboarding && (
        <Onboarding 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      <main className="flex-1 overflow-auto pb-20">
        {renderTab()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 ios-blur border-t border-gray-200 safe-area-bottom max-w-md mx-auto">
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
