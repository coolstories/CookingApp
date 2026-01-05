import { useState, useEffect, useRef } from 'react'
import { Clock, Users, Flame, Play, Pause, RotateCcw, CheckCircle2, Circle, ChefHat, Timer, Volume2, VolumeX, X, AlertCircle, Thermometer, Eye, Hand, Utensils } from 'lucide-react'

function InteractiveRecipe({ recipe, onClose }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [timers, setTimers] = useState({})
  const [isMuted, setIsMuted] = useState(false)
  const [activeTimer, setActiveTimer] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [stepNotes, setStepNotes] = useState({})
  const [stepImages, setStepImages] = useState({})
  const audioRef = useRef(null)

  // Simple timer sound initialization
  useEffect(() => {
    try {
      if (typeof Audio !== 'undefined') {
        audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
      }
    } catch (error) {
      console.warn('Audio initialization failed:', error)
    }
  }, [])

  // Play timer sound
  const playTimerSound = () => {
    try {
      if (audioRef.current && !isMuted) {
        audioRef.current.play().catch(() => {})
      }
    } catch (error) {
      console.warn('Sound play failed:', error)
    }
  }

  // Extract time from step text
  const extractTimeFromStep = (step) => {
    if (!step) return null
    
    try {
      const timeMatches = step.match(/(\d+)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/gi)
      if (!timeMatches) return null
      
      const timeMap = {
        'second': 1, 'seconds': 1, 'sec': 1, 'secs': 1,
        'minute': 60, 'minutes': 60, 'min': 60, 'mins': 60,
        'hour': 3600, 'hours': 3600, 'hr': 3600, 'hrs': 3600
      }
      
      let totalSeconds = 0
      timeMatches.forEach(match => {
        const parts = match.match(/(\d+)\s*(\w+)/)
        if (parts) {
          const [, num, unit] = parts
          const unitLower = unit.toLowerCase()
          for (const [key, value] of Object.entries(timeMap)) {
            if (unitLower.includes(key)) {
              totalSeconds += parseInt(num) * value
              break
            }
          }
        }
      })
      
      return totalSeconds > 0 ? totalSeconds : null
    } catch (error) {
      console.warn('Time extraction failed:', error)
      return null
    }
  }

  // Parse step details for enhanced interactivity
  const parseStepDetails = (step) => {
    if (!step) return {
      text: step,
      hasTimer: false,
      hasTemperature: false,
      hasVisual: false,
      hasAction: false,
      temperature: null,
      action: null,
      visual: null
    }

    const details = {
      text: step,
      hasTimer: false,
      hasTemperature: false,
      hasVisual: false,
      hasAction: false,
      temperature: null,
      action: null,
      visual: null
    }

    // Check for timer
    details.hasTimer = extractTimeFromStep(step) !== null

    // Check for temperature
    const tempMatch = step.match(/(\d+)\s*(degrees?|°|F|C)/gi)
    if (tempMatch) {
      details.hasTemperature = true
      details.temperature = tempMatch[0]
    }

    // Check for visual cues
    const visualCues = ['golden brown', 'bubbly', 'simmering', 'boiling', 'melted', 'caramelized', 'crispy', 'tender']
    details.hasVisual = visualCues.some(cue => step.toLowerCase().includes(cue))
    if (details.hasVisual) {
      const foundCue = visualCues.find(cue => step.toLowerCase().includes(cue))
      details.visual = foundCue
    }

    // Check for specific actions
    const actions = ['stir', 'mix', 'whisk', 'fold', 'beat', 'chop', 'dice', 'mince', 'grate', 'slice', 'cut', 'sear', 'sauté', 'fry', 'bake', 'roast', 'grill', 'steam', 'boil', 'simmer']
    details.hasAction = actions.some(action => step.toLowerCase().includes(action))
    if (details.hasAction) {
      const foundAction = actions.find(action => step.toLowerCase().includes(action))
      details.action = foundAction
    }

    return details
  }

  // Add step note
  const addStepNote = (stepIndex, note) => {
    setStepNotes(prev => ({
      ...prev,
      [stepIndex]: note
    }))
  }

  // Navigate to next step and mark current as complete
  const handleNextStep = () => {
    // Mark current step as completed if not already completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep])
    }
    
    // Move to next step
    setCurrentStep(Math.min((recipe.steps?.length || 1) - 1, currentStep + 1))
  }

  // Navigate to previous step
  const handlePrevStep = () => {
    setCurrentStep(Math.max(0, currentStep - 1))
  }

  // Toggle step completion for manual checking
  const toggleStepComplete = (idx) => {
    if (completedSteps.includes(idx)) {
      setCompletedSteps(prev => prev.filter(i => i !== idx))
    } else {
      setCompletedSteps(prev => [...prev, idx])
    }
  }

  // Initialize timers for each step
  useEffect(() => {
    if (!recipe || !recipe.steps) return
    
    try {
      const newTimers = {}
      recipe.steps.forEach((step, idx) => {
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
    } catch (error) {
      console.warn('Timer initialization failed:', error)
    }
  }, [recipe.steps])

  // Timer countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        try {
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
        } catch (error) {
          console.warn('Timer update failed:', error)
          return prev
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const toggleTimer = (stepIdx) => {
    try {
      setTimers(prev => ({
        ...prev,
        [stepIdx]: {
          ...prev[stepIdx],
          isRunning: !prev[stepIdx]?.isRunning
        }
      }))
      setActiveTimer(activeTimer === stepIdx ? null : stepIdx)
    } catch (error) {
      console.warn('Timer toggle failed:', error)
    }
  }

  const resetTimer = (stepIdx) => {
    try {
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
    } catch (error) {
      console.warn('Timer reset failed:', error)
    }
  }

  const formatTime = (seconds) => {
    if (!seconds) return '0s'
    
    try {
      if (seconds >= 3600) {
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
      } else if (seconds >= 60) {
        return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
      } else {
        return `${seconds}s`
      }
    } catch (error) {
      return '0s'
    }
  }

  const progressPercentage = recipe && recipe.steps ? (completedSteps.length / recipe.steps.length) * 100 : 0

  // Trigger confetti when all steps are completed
  useEffect(() => {
    if (recipe && recipe.steps && completedSteps.length === recipe.steps.length && completedSteps.length > 0) {
      setShowConfetti(true)
      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }, [completedSteps, recipe.steps])

  if (!recipe) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 text-center">
          <p className="text-gray-600">No recipe data available</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg">
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Confetti Celebration */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              >
                <div className={`w-3 h-3 rounded-full ${
                  ['bg-yellow-400', 'bg-orange-400', 'bg-red-400', 'bg-pink-400', 'bg-purple-400', 'bg-blue-400', 'bg-green-400'][Math.floor(Math.random() * 7)]
                }`}></div>
              </div>
            ))}
          </div>
          
          {/* Celebration Message */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center animate-bounce">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">You Made It!</h2>
              <p className="text-xl text-gray-600 mb-4">Delicious {recipe.name} completed!</p>
              <div className="text-4xl">🍳✨</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-3xl w-full max-w-md h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{recipe.name || 'Recipe'}</h1>
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
            <div className="flex items-center gap-1"><Clock size={16} className="text-orange-500" />{recipe.time || 'N/A'}</div>
            <div className="flex items-center gap-1"><Users size={16} className="text-blue-500" />{recipe.servings || 'N/A'} servings</div>
            <div className="flex items-center gap-1"><Flame size={16} className="text-red-500" />{recipe.difficulty || 'N/A'}</div>
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
                const stepDetails = parseStepDetails(step)
                
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
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">Step {idx + 1}</span>
                            
                            {/* Step indicators */}
                            <div className="flex items-center gap-1">
                              {stepDetails.hasTimer && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded-full">
                                  <Timer size={12} className="text-orange-600" />
                                  <span className="text-xs font-medium text-orange-600">Timer</span>
                                </div>
                              )}
                              
                              {stepDetails.hasTemperature && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-full">
                                  <Thermometer size={12} className="text-red-600" />
                                  <span className="text-xs font-medium text-red-600">{stepDetails.temperature}</span>
                                </div>
                              )}
                              
                              {stepDetails.hasVisual && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full">
                                  <Eye size={12} className="text-purple-600" />
                                  <span className="text-xs font-medium text-purple-600">{stepDetails.visual}</span>
                                </div>
                              )}
                              
                              {stepDetails.hasAction && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 rounded-full">
                                  <Hand size={12} className="text-blue-600" />
                                  <span className="text-xs font-medium text-blue-600">{stepDetails.action}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
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

                        {/* Step notes section */}
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle size={14} className="text-gray-400" />
                            <span className="text-xs text-gray-500">Add notes about this step:</span>
                          </div>
                          <textarea
                            value={stepNotes[idx] || ''}
                            onChange={(e) => addStepNote(idx, e.target.value)}
                            placeholder="e.g., Adjust heat if needed, watch for bubbles..."
                            className="w-full p-2 text-xs border border-gray-200 rounded-lg resize-none h-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={2}
                          />
                        </div>
                        
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
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous Step
            </button>
            <button
              onClick={handleNextStep}
              disabled={currentStep >= (recipe.steps?.length || 1) - 1}
              className="flex-1 px-4 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveRecipe
