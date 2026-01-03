import { useState, useEffect, useRef } from 'react'
import { X, ArrowRight, ArrowLeft, Sparkles, Home, ChefHat, History, User, Camera, Search, Clock, Users, Flame, BookOpen } from 'lucide-react'

function AppTour({ onComplete, onStart }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [highlightPosition, setHighlightPosition] = useState(null)
  const tourRef = useRef(null)

  const tourSteps = [
    {
      id: 0,
      title: 'Welcome to Recipee! 🎉',
      description: "Let's take a quick tour of your AI-powered kitchen assistant. I'll show you how to make the most of every feature!",
      icon: Sparkles,
      position: 'center',
      action: 'Get Started'
    },
    {
      id: 1,
      title: 'Scanner Tab 🔍',
      description: 'Scan ingredients from your pantry or fridge with AI. Simply take a photo or upload an image, and we\'ll identify everything you have!',
      icon: Camera,
      target: '[data-tour="scanner"]',
      position: 'bottom',
      action: 'Next'
    },
    {
      id: 2,
      title: 'Smart Recipe Discovery 🍳',
      description: 'Get 5 personalized recipes based on your ingredients. Our AI finds dishes you can make right now with what you have!',
      icon: ChefHat,
      target: '[data-tour="recipes"]',
      position: 'bottom',
      action: 'Next'
    },
    {
      id: 3,
      title: 'Cooking History 📚',
      description: 'Keep track of all your cooking adventures. View past recipes, ingredients used, and build your personal cooking journal.',
      icon: History,
      target: '[data-tour="history"]',
      position: 'bottom',
      action: 'Next'
    },
    {
      id: 4,
      title: 'Your Profile 👤',
      description: 'Customize your experience! Set dietary preferences, change your avatar, and access settings for a personalized cooking journey.',
      icon: User,
      target: '[data-tour="profile"]',
      position: 'bottom',
      action: 'Next'
    },
    {
      id: 5,
      title: 'Interactive Cooking 🎯',
      description: 'Step-by-step cooking with timers! Check off steps, use built-in timers, and get confetti celebrations when you finish.',
      icon: Clock,
      position: 'center',
      action: 'Next'
    },
    {
      id: 6,
      title: 'Dietary Preferences 🥗',
      description: 'Tell us about your diet - vegetarian, vegan, gluten-free, sweet tooth, spicy food lover. We\'ll tailor recipes just for you!',
      icon: Leaf,
      position: 'center',
      action: 'Next'
    },
    {
      id: 7,
      title: 'Admin Access 🔐',
      description: 'Need unlimited scans? Tap the Scanner title 7 times and enter the admin password. Perfect for power users!',
      icon: Users,
      position: 'center',
      action: 'Next'
    },
    {
      id: 8,
      title: 'You\'re All Set! 🚀',
      description: 'Start your culinary adventure with Recipee. Scan ingredients, discover recipes, and cook amazing dishes. Happy cooking!',
      icon: Sparkles,
      position: 'center',
      action: 'Start Cooking'
    }
  ]

  useEffect(() => {
    if (isVisible && tourSteps[currentStep].target) {
      const targetElement = document.querySelector(tourSteps[currentStep].target)
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect()
        setHighlightPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        })
      }
    } else {
      setHighlightPosition(null)
    }
  }, [currentStep, isVisible])

  const startTour = () => {
    setIsVisible(true)
    setCurrentStep(0)
    onStart?.()
  }

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeTour = () => {
    setIsVisible(false)
    setCurrentStep(0)
    setHighlightPosition(null)
    onComplete?.()
  }

  const skipTour = () => {
    setIsVisible(false)
    setCurrentStep(0)
    setHighlightPosition(null)
    onComplete?.()
  }

  const currentStepData = tourSteps[currentStep]
  const Icon = currentStepData.icon

  if (!isVisible) {
    return (
      <button
        onClick={startTour}
        className="fixed bottom-20 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 z-40 group"
      >
        <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Take a Tour
        </span>
      </button>
    )
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={skipTour} />
      
      {/* Highlight Ring */}
      {highlightPosition && (
        <div
          className="absolute border-4 border-purple-400 rounded-lg shadow-2xl z-50 pointer-events-none"
          style={{
            top: highlightPosition.top - 4,
            left: highlightPosition.left - 4,
            width: highlightPosition.width + 8,
            height: highlightPosition.height + 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.5)'
          }}
        />
      )}

      {/* Tour Tooltip */}
      <div
        ref={tourRef}
        className={`fixed z-50 bg-white rounded-2xl shadow-2xl p-6 max-w-sm ${
          currentStepData.position === 'center' 
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
            : highlightPosition 
              ? `${highlightPosition.top + highlightPosition.height + 20}px left-1/2 -translate-x-1/2`
              : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500">Tour Progress</span>
            <span className="text-xs font-medium text-purple-600">{currentStep + 1}/{tourSteps.length}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
            <Icon size={24} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{currentStepData.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{currentStepData.description}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={skipTour}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Skip Tour
          </button>
          
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft size={16} className="text-gray-600" />
              </button>
            )}
            
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
            >
              {currentStepData.action}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AppTour
