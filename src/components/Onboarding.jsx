import { useState, useEffect, useRef } from 'react'
import { Camera, ChefHat, Heart, Moon, Settings, Sparkles, ChevronRight, X, ArrowLeft, Check } from 'lucide-react'

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
      title: "Welcome to Recipee! 🍳",
      subtitle: "Your AI-powered kitchen assistant",
      description: "Transform your ingredients into delicious meals with smart recipe suggestions tailored just for you.",
      icon: ChefHat,
      bgColor: "bg-gradient-to-br from-orange-400 via-red-500 to-pink-500",
      hasInput: true,
      inputPlaceholder: "What's your name?",
      inputValue: userName,
      onInputChange: setUserName,
      animation: "bounce"
    },
    {
      id: 1,
      title: "Scan Your Pantry 📸",
      subtitle: "AI-powered ingredient detection",
      description: "Point your camera at ingredients and watch our AI recognize everything from fresh vegetables to pantry staples. No more typing!",
      icon: Camera,
      bgColor: "bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600",
      features: ["📸 Smart camera scanning", "🧠 AI ingredient recognition", "⚡ Instant results"],
      animation: "pulse"
    },
    {
      id: 2,
      title: "Discover Recipes 🍝",
      subtitle: "5 personalized meals every time",
      description: "Get perfectly balanced recipes for breakfast, lunch, dinner, snack, and dessert using ingredients you actually have.",
      icon: Heart,
      bgColor: "bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600",
      features: ["🌅 Breakfast ideas", "🥗 Lunch options", "🍽️ Dinner recipes", "🍪 Snacks & desserts"],
      animation: "spin"
    },
    {
      id: 3,
      title: "Your Preferences 🥗",
      subtitle: "Cook your way, every day",
      description: "Vegetarian, gluten-free, sweet tooth, spicy? We'll remember your dietary needs and suggest recipes you'll love.",
      icon: Settings,
      bgColor: "bg-gradient-to-br from-purple-400 via-pink-500 to-rose-600",
      features: ["🥬 Dietary restrictions", "🌶️ Spice preferences", "🍰 Sweet or savory", "💪 Health goals"],
      animation: "wiggle"
    },
    {
      id: 4,
      title: "Choose Your Theme 🌙",
      subtitle: "Perfect for any time of day",
      description: "Cook in bright light mode during the day, switch to elegant dark mode for evening cooking sessions.",
      icon: Moon,
      bgColor: "bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900",
      features: ["☀️ Bright light mode", "🌙 Comfortable dark mode", "🎨 Beautiful colors", "👁️ Easy on the eyes"],
      animation: "float"
    },
    {
      id: 5,
      title: `Ready to Cook, ${userName || 'Guest User'}! 👨‍🍳`,
      subtitle: "Your culinary journey starts now",
      description: "You're all set to scan ingredients, discover amazing recipes, and create delicious meals. Let's get cooking!",
      icon: Sparkles,
      bgColor: "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600",
      isFinal: true,
      animation: "celebrate",
      features: ["📸 Scan ingredients with AI", "🍽️ Get 5 personalized recipes", "⚙️ Customize your preferences", "🔄 Replay this tutorial anytime in Settings"]
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
      onComplete(userName)
    }
  }

  const handleBack = () => {
    if (currentScreen > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentScreen(currentScreen - 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  const handleSkip = () => {
    onSkip()
  }

  // Touch handlers for swipe navigation
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX
    handleSwipe()
  }

  const handleSwipe = () => {
    const swipeThreshold = 50
    const diff = touchStartX.current - touchEndX.current
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && currentScreen < screens.length - 1) {
        // Swipe left - next screen
        handleNext()
      } else if (diff < 0 && currentScreen > 0) {
        // Swipe right - previous screen
        handleBack()
      }
    }
  }

  // Tap handler for card navigation
  const handleCardTap = (e) => {
    // Only handle taps on the card area, not on buttons or inputs
    if (e.target.closest('button') || e.target.closest('input')) {
      return
    }
    
    // Tap on right side = next, left side = back
    const cardRect = e.currentTarget.getBoundingClientRect()
    const tapX = e.clientX - cardRect.left
    const cardWidth = cardRect.width
    
    if (tapX > cardWidth * 0.7 && currentScreen < screens.length - 1) {
      handleNext()
    } else if (tapX < cardWidth * 0.3 && currentScreen > 0) {
      handleBack()
    }
  }

  const currentScreenData = screens[currentScreen]
  const Icon = currentScreenData.icon

  // Animation classes
  const getAnimationClass = (animation) => {
    switch (animation) {
      case 'bounce': return 'animate-bounce'
      case 'pulse': return 'animate-pulse'
      case 'spin': return 'animate-spin'
      case 'wiggle': return 'animate-wiggle'
      case 'float': return 'animate-float'
      case 'celebrate': return 'animate-celebrate'
      default: return ''
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-white rounded-full animate-pulse delay-75"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full animate-pulse delay-150"></div>
      </div>

      {/* Confetti for final screen */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div className={`w-3 h-3 rounded-full ${
                ['bg-yellow-400', 'bg-orange-400', 'bg-red-400', 'bg-pink-400', 'bg-purple-400'][Math.floor(Math.random() * 5)]
              }`}></div>
            </div>
          ))}
        </div>
      )}

      <div className="w-full max-w-sm relative z-10">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-sm">Getting started</span>
            <span className="text-white/60 text-sm">{currentScreen + 1}/{screens.length}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentScreen + 1) / screens.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Skip Button - Moved down and centered */}
        <button
          onClick={handleSkip}
          className="absolute top-10 left-1/2 transform -translate-x-1/2 text-white/60 hover:text-white transition-all duration-300 hover:scale-110 text-sm font-medium"
        >
          Skip Onboarding
        </button>

        {/* Main Content Card */}
        <div 
          className={`${currentScreenData.bgColor} rounded-3xl p-8 text-white shadow-2xl transform transition-all duration-300 cursor-pointer ${
            isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
          }`}
          onClick={handleCardTap}
        >
          {/* Icon with Animation */}
          <div className="flex justify-center mb-6">
            <div className={`w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30 ${getAnimationClass(currentScreenData.animation)}`}>
              <Icon size={48} className="text-white" />
            </div>
          </div>

          {/* Text Content */}
          <h1 className="text-3xl font-bold text-center mb-3 leading-tight">
            {currentScreenData.title}
          </h1>
          <p className="text-lg text-center text-white/90 mb-4 font-medium">
            {currentScreenData.subtitle}
          </p>
          <p className="text-center text-white/80 mb-6 leading-relaxed text-sm">
            {currentScreenData.description}
          </p>

          {/* Feature List */}
          {currentScreenData.features && (
            <div className="mb-6 space-y-2">
              {currentScreenData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-white/90 text-sm">
                  <Check size={16} className="text-white/70" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* Input Field for First Screen */}
          {currentScreenData.hasInput && (
            <div className="mb-6">
              <input
                type="text"
                placeholder={currentScreenData.inputPlaceholder}
                value={currentScreenData.inputValue}
                onChange={(e) => currentScreenData.onInputChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:outline-none focus:border-white/60 focus:bg-white/30 transition-all duration-300"
                autoFocus
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {currentScreen > 0 && (
              <button
                onClick={handleBack}
                className="px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white font-medium hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className={`flex-1 px-6 py-3 rounded-xl bg-white text-gray-900 font-semibold hover:bg-white/90 transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 ${
                currentScreen === 0 ? '' : 'ml-auto'
              } ${currentScreenData.isFinal ? 'animate-pulse' : ''}`}
            >
              {currentScreenData.isFinal ? 'Start Cooking!' : 'Next'}
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Screen-specific Tips */}
          <div className="text-center mt-4 text-white/60 text-xs">
            {currentScreen === 0 && "💡 Your name makes the experience personal"}
            {currentScreen === 1 && "💡 Works with any ingredients"}
            {currentScreen === 2 && "💡 No food waste, just delicious meals"}
            {currentScreen === 3 && "💡 We remember your preferences"}
            {currentScreen === 4 && "💡 Easy on the eyes, day or night"}
            {currentScreen === 5 && "🎉 You can replay this tutorial anytime in Profile → Settings!"}
          </div>
        </div>

        {/* Swipe Hint */}
        <div className="text-center mt-6 text-white/40 text-sm animate-pulse">
          {currentScreen < screens.length - 1 ? "Swipe left/right or tap sides to navigate" : "Tap anywhere to start cooking! 🚀"}
        </div>
      </div>

      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes celebrate {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(5deg); }
          75% { transform: scale(1.1) rotate(-5deg); }
        }
        @keyframes fall {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-wiggle { animation: wiggle 0.5s ease-in-out infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-celebrate { animation: celebrate 1s ease-in-out infinite; }
        .animate-fall { animation: fall linear forwards; }
      `}</style>
    </div>
  )
}

export default Onboarding
