import { useState, useEffect, useRef } from 'react'
import { Clock, Users, Flame, Play, Pause, RotateCcw, CheckCircle2, Circle, ChefHat, Timer, Volume2, VolumeX } from 'lucide-react'

function InteractiveRecipe({ recipe, onClose }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [timers, setTimers] = useState({})
  const [isMuted, setIsMuted] = useState(false)
  const [activeTimer, setActiveTimer] = useState(null)
  const audioRef = useRef(null)

  // Initialize audio for timer sounds
  useEffect(() => {
    if (typeof Audio !== 'undefined') {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
    }
  }, [])

  // Play timer sound
  const playTimerSound = () => {
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch(() => {})
    }
  }

  // Extract time from step text
  const extractTimeFromStep = (step) => {
    const timeMatches = step.match(/(\d+)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/gi)
    if (!timeMatches) return null
    
    const timeMap = {
      'second': 1, 'seconds': 1, 'sec': 1, 'secs': 1,
      'minute': 60, 'minutes': 60, 'min': 60, 'mins': 60,
      'hour': 3600, 'hours': 3600, 'hr': 3600, 'hrs': 3600
    }
    
    let totalSeconds = 0
    timeMatches.forEach(match => {
      const parts = match.match(/(\d+)\s*(second|seconds|sec|secs|minute|minutes|min|mins|hour|hours|hr|hrs)/i)
      if (parts) {
        const [, amount, unit] = parts
        totalSeconds += parseInt(amount) * (timeMap[unit.toLowerCase()] || 60)
      }
    })
    
    return totalSeconds > 0 ? totalSeconds : null
  }

  // Initialize timers for each step
  useEffect(() => {
    const newTimers = {}
    recipe.steps?.forEach((step, idx) => {
      const timeInSeconds = extractTimeFromStep(step)
      if (timeInSeconds) {
        newTimers[idx] = {
          duration: timeInSeconds,
          remaining: timeInSeconds,
          isRunning: false,
          isCompleted: false
        }
      }
    })
    setTimers(newTimers)
  }, [recipe.steps])

  // Timer countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(idx => {
          const timer = updated[idx]
          if (timer.isRunning && timer.remaining > 0) {
            timer.remaining -= 1
            if (timer.remaining === 0) {
              timer.isRunning = false
              timer.isCompleted = true
              playTimerSound()
            }
          }
        })
        return updated
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const toggleTimer = (stepIdx) => {
    setTimers(prev => ({
      ...prev,
      [stepIdx]: {
        ...prev[stepIdx],
        isRunning: !prev[stepIdx]?.isRunning
      }
    }))
    setActiveTimer(activeTimer === stepIdx ? null : stepIdx)
  }

  const resetTimer = (stepIdx) => {
    const timer = timers[stepIdx]
    if (timer) {
      setTimers(prev => ({
        ...prev,
        [stepIdx]: {
          ...timer,
          remaining: timer.duration,
          isRunning: false,
          isCompleted: false
        }
      }))
    }
  }

  const toggleStepComplete = (stepIdx) => {
    setCompletedSteps(prev => {
      if (prev.includes(stepIdx)) {
        return prev.filter(i => i !== stepIdx)
      } else {
        return [...prev, stepIdx]
      }
    })
  }

  const formatTime = (seconds) => {
    if (seconds >= 3600) {
      return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
    } else if (seconds >= 60) {
      return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const progressPercentage = recipe.steps ? (completedSteps.length / recipe.steps.length) * 100 : 0

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{recipe.name}</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {isMuted ? <VolumeX size={20} className="text-gray-600" /> : <Volume2 size={20} className="text-gray-600" />}
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Cooking Progress</span>
              <span className="text-sm font-medium text-gray-900">{completedSteps.length}/{recipe.steps?.length || 0} steps</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Recipe Info */}
          <div className="flex gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1"><Clock size={16} className="text-orange-500" />{recipe.time}</div>
            <div className="flex items-center gap-1"><Users size={16} className="text-blue-500" />{recipe.servings} servings</div>
            <div className="flex items-center gap-1"><Flame size={16} className="text-red-500" />{recipe.difficulty}</div>
          </div>
        </div>

        <div className="p-4 pb-20">
          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="space-y-3 bg-blue-50 rounded-2xl p-4 border-2 border-blue-200 mb-6">
              <h2 className="text-lg font-bold text-gray-900">Ingredients</h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interactive Steps */}
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-bold text-gray-900">Instructions</h2>
            <div className="space-y-4">
              {recipe.steps?.map((step, idx) => {
                const timer = timers[idx]
                const isCompleted = completedSteps.includes(idx)
                const isCurrent = idx === currentStep
                
                return (
                  <div
                    key={idx}
                    className={`border-2 rounded-2xl p-4 transition-all ${
                      isCompleted ? 'border-green-300 bg-green-50' : 
                      isCurrent ? 'border-orange-300 bg-orange-50' : 
                      'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleStepComplete(idx)}
                        className="mt-1 flex-shrink-0"
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={24} className="text-green-600" />
                        ) : (
                          <Circle size={24} className="text-gray-400" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">Step {idx + 1}</span>
                          {timer && (
                            <div className="flex items-center gap-2">
                              <Timer size={16} className="text-orange-500" />
                              <span className="text-sm font-medium text-orange-600">
                                {formatTime(timer.remaining)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <p className={`text-sm leading-relaxed mb-3 ${
                          isCompleted ? 'text-gray-500 line-through' : 'text-gray-700'
                        }`}>
                          {step}
                        </p>
                        
                        {timer && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleTimer(idx)}
                              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                timer.isRunning 
                                  ? 'bg-red-500 text-white hover:bg-red-600' 
                                  : 'bg-green-500 text-white hover:bg-green-600'
                              }`}
                            >
                              {timer.isRunning ? (
                                <><Pause size={14} className="inline mr-1" /> Pause</>
                              ) : (
                                <><Play size={14} className="inline mr-1" /> Start</>
                              )}
                            </button>
                            
                            <button
                              onClick={() => resetTimer(idx)}
                              className="px-3 py-1.5 rounded-full bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors"
                            >
                              <RotateCcw size={14} className="inline mr-1" /> Reset
                            </button>
                            
                            {timer.isCompleted && (
                              <span className="text-green-600 text-sm font-medium">✓ Done!</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tips */}
          {recipe.tips && recipe.tips.length > 0 && (
            <div className="space-y-3 bg-yellow-50 rounded-2xl p-4 border-2 border-yellow-200">
              <h2 className="text-lg font-bold text-gray-900">💡 Chef's Tips</h2>
              <ul className="space-y-2">
                {recipe.tips.map((tip, idx) => (
                  <li key={idx} className="text-sm text-gray-700 leading-relaxed">
                    ✓ {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous Step
            </button>
            <button
              onClick={() => setCurrentStep(Math.min((recipe.steps?.length || 1) - 1, currentStep + 1))}
              disabled={currentStep >= (recipe.steps?.length || 1) - 1}
              className="flex-1 px-4 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveRecipe
