import { useState, useEffect, useRef } from 'react'
import { Camera, ChefHat, Heart, Settings, Sparkles, ChevronRight, X, ChevronLeft, Check, Utensils, Clock, Users } from 'lucide-react'

function Onboarding({ onComplete, onSkip }) {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [userName, setUserName] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const screens = [
    {
      id: 0,
      title: "Welcome to Recipee",
      subtitle: "Your AI kitchen companion",
      description: "Turn ingredients into delicious meals with smart recipe suggestions.",
      icon: ChefHat,
      bgColor: "from-orange-500 to-red-600",
      hasInput: true,
      inputPlaceholder: "Enter your name"
    },
    {
      id: 1,
      title: "Scan Ingredients",
      subtitle: "AI-powered detection",
      description: "Take photos of ingredients and let AI recognize everything automatically.",
      icon: Camera,
      bgColor: "from-blue-500 to-purple-600",
      steps: [
        "Tap Scanner tab",
        "Take or upload photo", 
        "AI identifies ingredients",
        "Add to pantry"
      ]
    },
    {
      id: 2,
      title: "Discover Recipes",
      subtitle: "Personalized meal suggestions",
      description: "Get 5 tailored recipes using ingredients you actually have.",
      icon: Heart,
      bgColor: "from-green-500 to-teal-600",
      steps: [
        "Tap Recipes tab",
        "Click Find Recipes",
        "AI analyzes pantry",
        "Get meal suggestions"
      ]
    },
    {
      id: 3,
      title: "Interactive Cooking",
      subtitle: "Step-by-step guidance",
      description: "Follow recipes with timers, progress tracking, and celebrations.",
      icon: Clock,
      bgColor: "from-purple-500 to-pink-600",
      features: [
        "Auto timers for steps",
        "Progress tracking", 
        "Confetti celebrations",
        "Audio alerts"
      ]
    },
    {
      id: 4,
      title: "Customize Experience",
      subtitle: "Make it yours",
      description: "Set preferences, upload avatar, and personalize your cooking journey.",
      icon: Settings,
      bgColor: "from-gray-700 to-gray-900",
      features: [
        "Dietary preferences",
        "Profile avatar",
        "Light/dark themes",
        "Personal settings"
      ]
    },
    {
      id: 5,
      title: `Ready to Cook, ${userName || 'Chef'}!`,
      subtitle: "Your AI kitchen companion awaits",
      description: "You're all set to create amazing meals with ingredients you have. Here's what you can do:",
      icon: Sparkles,
      bgColor: "from-yellow-500 to-orange-600",
      isFinal: true,
      features: [
        "📸 Scan ingredients with AI camera",
        "🍝 Get 5 personalized recipes daily",
        "👨‍🍳 Cook with interactive timers",
        "📊 Track your cooking progress",
        "🎉 Celebrate with confetti",
        "⚙️ Customize dietary preferences",
        "👤 Upload your profile avatar",
        "🌙 Switch between themes"
      ]
    }
  ]

  const handleNext = () => {
    if (currentScreen < screens.length - 1) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentScreen(currentScreen + 1)
        setIsAnimating(false)
        if (currentScreen === screens.length - 2) {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
        }
      }, 300)
    } else {
      // Final screen - complete onboarding and save user name
      if (userName.trim()) {
        localStorage.setItem('userName', userName.trim())
      }
      onComplete(userName)
    }
  }

  const handleSkip = () => {
    // Save user name even if skipping onboarding
    if (userName.trim()) {
      localStorage.setItem('userName', userName.trim())
    }
    onSkip(userName)
  }

  const handlePrev = () => {
    console.log('Back button clicked, currentScreen:', currentScreen)
    if (currentScreen > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentScreen(currentScreen - 1)
        setIsAnimating(false)
        console.log('Moved to screen:', currentScreen - 1)
      }, 300)
    }
  }

  const handleCardTap = () => {
    // Removed card tap functionality - users must use Next button or swipe
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = (e) => {
    touchEndX.current = e.targetTouches[0].clientX
    handleSwipe()
  }

  const handleSwipe = () => {
    const swipeThreshold = 50
    const diff = touchStartX.current - touchEndX.current
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && currentScreen < screens.length - 1) {
        handleNext()
      } else if (diff < 0 && currentScreen > 0) {
        handlePrev()
      }
    }
  }

  const currentScreenData = screens[currentScreen]
  const Icon = currentScreenData.icon

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-start justify-center p-4 pt-8 overflow-hidden z-[9999]">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div className={`w-2 h-2 rounded-full ${
                ['bg-yellow-400', 'bg-orange-400', 'bg-red-400', 'bg-pink-400', 'bg-purple-400', 'bg-blue-400'][Math.floor(Math.random() * 6)]
              }`}></div>
            </div>
          ))}
        </div>
      )}

      <div className="w-full max-w-md relative z-10">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentScreen + 1) / screens.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="absolute top-3 left-1/2 transform -translate-x-1/2 text-white/60 hover:text-white transition-colors text-sm font-medium"
        >
          Skip
        </button>

        {/* Main Card */}
        <div 
          className={`bg-gradient-to-br ${currentScreenData.bgColor} rounded-3xl p-16 text-white shadow-2xl transform transition-all duration-300 cursor-default ${
            isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
          }`}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
              <Icon size={40} className="text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">
              {currentScreenData.title}
            </h1>
            <p className="text-white/90 font-medium mb-3">
              {currentScreenData.subtitle}
            </p>
            <p className="text-white/80 text-sm leading-relaxed">
              {currentScreenData.description}
            </p>
          </div>

          {/* Input Field */}
          {currentScreenData.hasInput && (
            <div className="mb-8">
              <input
                type="text"
                placeholder={currentScreenData.inputPlaceholder}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/60 focus:bg-white/30 transition-all text-center"
                autoFocus
              />
            </div>
          )}

          {/* Steps */}
          {currentScreenData.steps && (
            <div className="mb-8 space-y-3">
              {currentScreenData.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 text-white/90 text-sm">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}

          {/* Features */}
          {currentScreenData.features && (
            <div className="mb-8 space-y-2">
              {currentScreenData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-white/90 text-sm">
                  <Check size={16} className="text-white/70" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePrev()
              }}
              disabled={currentScreen === 0}
              className={`p-3 rounded-xl transition-all flex items-center gap-2 ${
                currentScreen === 0 
                  ? 'bg-white/10 opacity-50 cursor-not-allowed' 
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <ChevronLeft size={20} />
              {currentScreen > 0 && <span className="text-sm font-medium">Back</span>}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              className="px-6 py-3 rounded-xl bg-white text-gray-900 font-semibold hover:bg-white/90 transition-all flex items-center gap-2"
            >
              {currentScreen === screens.length - 1 ? 'Start Cooking' : 'Next'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Onboarding