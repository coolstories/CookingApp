import { useState, useRef, useEffect } from 'react'
import { Camera, Upload, Loader2, Sparkles, X, Check, Plus } from 'lucide-react'

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD
const DAILY_SCAN_LIMIT = 5

function getScansToday() {
  try {
    const stored = localStorage.getItem('scanUsage')
    if (!stored) return 0
    const { date, count } = JSON.parse(stored)
    const today = new Date().toDateString()
    return date === today ? count : 0
  } catch (error) {
    console.warn('localStorage scanUsage error:', error)
    return 0
  }
}

function incrementScansToday() {
  try {
    const today = new Date().toDateString()
    const current = getScansToday()
    localStorage.setItem('scanUsage', JSON.stringify({ date: today, count: current + 1 }))
  } catch (error) {
    console.warn('localStorage incrementScansToday error:', error)
  }
}

const COMMON_INGREDIENTS = [
  'Tomato', 'Onion', 'Garlic', 'Chicken', 'Beef', 'Pork', 'Fish', 'Salmon',
  'Lettuce', 'Spinach', 'Broccoli', 'Carrot', 'Potato', 'Rice', 'Pasta',
  'Milk', 'Lemon Zest', 'Orange Zest','Cheese', 'Eggs', 'Bread', 'Flour', 'Sugar', 'Salt',
  'Pepper', 'Oil', 'Olive Oil', 'Vinegar', 'Soy Sauce', 'Honey', 'Lemon',
  'Lime', 'Apple', 'Banana', 'Orange', 'Strawberry', 'Blueberry', 'Cucumber',
  'Bell Pepper', 'Mushroom', 'Zucchini', 'Eggplant', 'Cabbage', 'Celery',
  'Beans', 'Lentils', 'Chickpeas', 'Tofu', 'Yogurt', 'Cream', 'Basil',
  'Oregano', 'Thyme', 'Rosemary', 'Cumin', 'Paprika', 'Cinnamon', 'Vanilla',
  'Baking Powder', 'Baking Soda', 'Yeast', 'Nuts', 'Almonds', 'Walnuts', 'Coconut', 'Avocado', 'Corn', 'Peas', 'Green Beans'
]

function ScannerTab({ addToHistory, pantry, setPantry, ingredients, setIngredients, imagePreview, setImagePreview }) {
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showScanning, setShowScanning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [manualInput, setManualInput] = useState('')
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([])
  const [scansRemaining, setScansRemaining] = useState(DAILY_SCAN_LIMIT - getScansToday())
  const [uncertainIngredients, setUncertainIngredients] = useState([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmedIngredients, setConfirmedIngredients] = useState([])
  const [adminMode, setAdminMode] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const tapTimeoutRef = useRef(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const handleTitleTap = () => {
    setTapCount(prev => {
      const newCount = prev + 1
      console.log('Tap count:', newCount)
      
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current)
      
      if (newCount >= 7) {
        console.log('Admin password triggered!')
        setShowAdminPassword(true)
        setAdminPassword('')
        setPasswordError('')
        return 0
      }
      
      tapTimeoutRef.current = setTimeout(() => {
        setTapCount(0)
      }, 2000)
      
      return newCount
    })
  }

  const handleAdminPasswordSubmit = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      const newAdminMode = !adminMode
      setAdminMode(newAdminMode)
      try {
        if (newAdminMode) {
          localStorage.setItem('adminMode', 'true')
        } else {
          localStorage.removeItem('adminMode')
        }
      } catch (error) {
        console.warn('localStorage adminMode error:', error)
      }
      setShowAdminPassword(false)
      setAdminPassword('')
      setPasswordError('')
    } else {
      setPasswordError('Incorrect password')
      setAdminPassword('')
    }
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem('adminMode')
      if (stored === 'true') setAdminMode(true)
    } catch (error) {
      console.warn('localStorage adminMode load error:', error)
    }
  }, [])

  const scanSteps = [
    'Processing image...',
    'Detecting food items...',
    'Analyzing ingredients...',
    'Finalizing results...'
  ]

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxWidth = 600
          const maxHeight = 600
          let width = img.width
          let height = img.height
          
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height
              height = maxHeight
            }
          }
          
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.6))
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setIngredients(null)
      setError(null)
      const compressed = await compressImage(file)
      setImagePreview(compressed)
    }
  }

  const clearImage = () => {
    setImage(null)
    setImagePreview(null)
    setIngredients(null)
    setError(null)
  }

  const scanIngredients = async () => {
    if (!imagePreview) return

    if (scansRemaining <= 0 && !adminMode) {
      setError('Daily scan limit reached (5/day). Try again tomorrow!')
      return
    }

    setLoading(true)
    setError(null)
    setShowScanning(true)
    setCurrentStep(0)
    setIngredients(null)

    const totalDuration = 4800
    const stepDuration = totalDuration / scanSteps.length
    
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < scanSteps.length - 1) return prev + 1
        return prev
      })
    }, stepDuration)

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Recipee Ingredient Scanner'
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          stream: true,
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Identify EVERY food item in this image. CRITICAL RULES:
1. If it's a PREPARED/COOKED DISH (cake, pizza, burger, sandwich, soup, pancakes, pasta, etc), list it AS-IS. DO NOT break it down into ingredients.
2. If it's RAW INGREDIENTS (vegetables, fruits, raw meat, spices), list each one.
3. Capitalize first letter of each item.
4. Add "confident": true if you're sure about the item, "confident": false if you're unsure or guessing.

Return ONLY this JSON (no markdown, no extra text):
{"ingredients": [{"Name": "Item1", "Quantity": "1", "confident": true}, {"Name": "Item2", "Quantity": "1", "confident": false}]}`
                },
                {
                  type: 'image_url',
                  image_url: { url: imagePreview }
                }
              ]
            }
          ]
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error Response:', errorData)
        throw new Error(errorData.error?.message || JSON.stringify(errorData))
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              if (content) {
                fullText += content
              }
            } catch {}
          }
        }
      }

      clearInterval(stepInterval)
      setCurrentStep(scanSteps.length - 1)

      // Parse the final JSON from the response
      let parsedIngredients
      try {
        let jsonStr = fullText
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '')
        
        const allIngredients = []
        
        // Try to parse JSON with confidence field
        const jsonMatch = jsonStr.match(/\{[\s\S]*"ingredients"\s*:\s*\[[\s\S]*\][\s\S]*\}/)
        if (jsonMatch) {
          try {
            const cleanJson = jsonMatch[0].replace(/,\s*]/g, ']').replace(/,\s*}/g, '}')
            const parsed = JSON.parse(cleanJson)
            if (parsed.ingredients && Array.isArray(parsed.ingredients)) {
              for (const ing of parsed.ingredients) {
                allIngredients.push({
                  name: ing.name || ing.Name || 'Unknown',
                  quantity: ing.quantity || ing.Quantity || '1',
                  confident: ing.confident !== false // Default to true if not specified
                })
              }
            }
          } catch {}
        }
        
        // Fallback regex parsing if JSON parse failed
        if (allIngredients.length === 0) {
          const patterns = [
            /\{\s*"Name"\s*:\s*"([^"]+)"\s*,\s*"Quantity"\s*:\s*"([^"]+)"/gi,
            /\{\s*"name"\s*:\s*"([^"]+)"\s*,\s*"quantity"\s*:\s*"([^"]+)"/gi,
          ]
          
          for (const pattern of patterns) {
            let match
            while ((match = pattern.exec(jsonStr)) !== null) {
              const name = match[1]
              const quantity = match[2]
              if (!allIngredients.some(ing => ing.name.toLowerCase() === name.toLowerCase())) {
                allIngredients.push({ name, quantity, confident: true })
              }
            }
          }
        }
        
        const filtered = allIngredients.filter(
          ing => ing.name && 
                 ing.name.toLowerCase() !== 'food' && 
                 ing.name !== 'Unknown' &&
                 ing.name.length > 1
        )
        
        if (filtered.length > 0) {
          // Separate confident and uncertain ingredients
          const confidentItems = filtered.filter(ing => ing.confident)
          const uncertainItems = filtered.filter(ing => !ing.confident)
          
          parsedIngredients = { ingredients: confidentItems.map(({ name, quantity }) => ({ name, quantity })) }
          
          // If there are uncertain ingredients, show confirmation popup
          if (uncertainItems.length > 0) {
            setUncertainIngredients(uncertainItems)
            setConfirmedIngredients([])
            setShowConfirmation(true)
          }
        } else {
          throw new Error('No valid ingredients found')
        }
      } catch (parseErr) {
        console.error('Parse error:', parseErr, 'Full text:', fullText)
        parsedIngredients = { ingredients: [{ name: 'Unable to parse ingredients', quantity: '1' }] }
      }

      setIngredients(parsedIngredients)

      // Increment daily scan counter
      incrementScansToday()
      setScansRemaining(DAILY_SCAN_LIMIT - getScansToday())

      addToHistory({
        id: Date.now(),
        date: new Date().toISOString(),
        image: imagePreview,
        ingredients: parsedIngredients.ingredients
      })

    } catch (err) {
      clearInterval(stepInterval)
      console.error('Scan error:', err)
      setError(err.message || 'Failed to scan. Please try again.')
      setShowScanning(false)
    } finally {
      setLoading(false)
      setTimeout(() => setShowScanning(false), 500)
    }
  }

  const addToPantry = (ingredient) => {
    if (!pantry.some(p => p.name.toLowerCase() === ingredient.name.toLowerCase())) {
      setPantry([...pantry, ingredient])
    }
  }

  const storeAllIngredients = () => {
    if (!ingredients) return
    const newItems = ingredients.ingredients.filter(
      ing => !pantry.some(p => p.name.toLowerCase() === ing.name.toLowerCase())
    )
    setPantry([...pantry, ...newItems])
  }

  const isIngredientStored = (name) => pantry.some(p => p.name.toLowerCase() === name.toLowerCase())

  const handleManualInputChange = (value) => {
    setManualInput(value)
    
    if (value.trim().length === 0) {
      setAutocompleteSuggestions([])
      return
    }
    
    const lowerValue = value.toLowerCase()
    const matches = COMMON_INGREDIENTS.filter(ing => 
      ing.toLowerCase().startsWith(lowerValue) && 
      !pantry.some(p => p.name.toLowerCase() === ing.toLowerCase())
    ).slice(0, 5)
    
    setAutocompleteSuggestions(matches)
  }

  const selectSuggestion = (suggestion) => {
    setManualInput(suggestion)
    setAutocompleteSuggestions([])
  }

  const addManualIngredient = () => {
    if (!manualInput.trim()) return
    const newIngredient = { name: manualInput.trim(), quantity: '1' }
    addToPantry(newIngredient)
    setManualInput('')
    setAutocompleteSuggestions([])
  }

  const handleConfirmIngredient = (ingredient) => {
    setConfirmedIngredients(prev => [...prev, ingredient])
    setUncertainIngredients(prev => prev.filter(ing => ing.name !== ingredient.name))
  }

  const handleRejectIngredient = (ingredient) => {
    setUncertainIngredients(prev => prev.filter(ing => ing.name !== ingredient.name))
  }

  const handleFinishConfirmation = () => {
    // Add confirmed uncertain ingredients to the main ingredients list
    if (confirmedIngredients.length > 0) {
      const newIngredients = confirmedIngredients.map(({ name, quantity }) => ({ name, quantity }))
      setIngredients(prev => ({
        ingredients: [...(prev?.ingredients || []), ...newIngredients]
      }))
    }
    setShowConfirmation(false)
    setUncertainIngredients([])
    setConfirmedIngredients([])
  }

  return (
    <div className="p-4">
      <div className="safe-area-top pt-4 pb-6">
        <div className="flex items-center justify-between">
          <div onClick={handleTitleTap} className="cursor-pointer select-none">
            <h1 className="text-3xl font-bold text-gray-900">Scanner</h1>
            <p className="text-gray-500 mt-1">Identify ingredients from photos</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-semibold text-sm ${adminMode ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {adminMode ? '∞ Admin' : `${scansRemaining}/5 scans`}
          </div>
        </div>
      </div>

      {!imagePreview ? (
        <div className="space-y-4">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full bg-blue-500 text-white rounded-2xl p-6 flex items-center justify-center gap-3 active:bg-blue-600 transition-colors shadow-lg shadow-blue-500/25"
          >
            <Camera size={28} />
            <span className="text-lg font-semibold">Take Photo</span>
          </button>
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-white text-gray-700 rounded-2xl p-6 flex items-center justify-center gap-3 active:bg-gray-50 transition-colors border border-gray-200"
          >
            <Upload size={28} />
            <span className="text-lg font-semibold">Upload Photo</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

          {/* Manual Ingredient Entry */}
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Add Ingredient Manually</h3>
            <div className="relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => handleManualInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addManualIngredient()}
                  placeholder="e.g., Tomato, Chicken..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addManualIngredient}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 active:bg-blue-700"
                >
                  <Plus size={18} />
                </button>
              </div>
              
              {/* Autocomplete Suggestions */}
              {autocompleteSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {autocompleteSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm text-gray-700 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {pantry.length > 0 && (
            <div className="bg-white rounded-2xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Pantry ({pantry.length})</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {pantry.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{item.name}</span>
                    <button onClick={() => setPantry(pantry.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 mt-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-xl p-3">
                <Sparkles className="text-blue-500" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI-Powered Detection</h3>
                <p className="text-gray-500 text-sm mt-1">Scan food photos to identify ingredients.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img src={imagePreview} alt="Preview" className="w-full rounded-2xl object-cover max-h-64" />
            <button onClick={clearImage} className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-2">
              <X size={20} />
            </button>
          </div>

          <button
            onClick={scanIngredients}
            disabled={loading}
            className="w-full bg-blue-500 text-white rounded-2xl p-5 flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-blue-500/25"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
            <span className="text-lg font-semibold">{loading ? 'Analyzing...' : 'Scan for Ingredients'}</span>
          </button>

          {/* Scanning Checklist Modal */}
          {showScanning && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
                {/* Animated Sparkles Icon */}
                <div className="flex items-center justify-center mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="text-white w-12 h-12 animate-spin" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-pulse"></div>
                  </div>
                </div>

                {/* Header */}
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Scanning Image</h2>
                <p className="text-gray-500 text-center text-sm mb-8">Analyzing your photo...</p>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 rounded-full"
                      style={{ width: `${((currentStep + 1) / scanSteps.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-2 font-medium">{Math.round(((currentStep + 1) / scanSteps.length) * 100)}%</p>
                </div>

                {/* Steps */}
                <div className="space-y-2">
                  {scanSteps.map((step, idx) => {
                    const isCompleted = idx < currentStep
                    const isActive = idx === currentStep
                    
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                          isCompleted ? 'bg-green-50 border border-green-200' : 
                          isActive ? 'bg-blue-50 border border-blue-200 shadow-md' : 
                          'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                          isCompleted ? 'bg-green-500 text-white' : 
                          isActive ? 'bg-blue-500 text-white animate-pulse' : 
                          'bg-gray-300 text-gray-600'
                        }`}>
                          {isCompleted ? <Check size={18} /> : isActive ? <Loader2 size={16} className="animate-spin" /> : idx + 1}
                        </div>
                        <p className={`font-medium text-sm ${
                          isCompleted ? 'text-green-700' : 
                          isActive ? 'text-blue-700' : 
                          'text-gray-500'
                        }`}>
                          {step}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          {ingredients && (
            <div className="bg-white rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-lg">Found {ingredients.ingredients.length} Ingredient{ingredients.ingredients.length !== 1 ? 's' : ''}</h3>
                <button onClick={storeAllIngredients} className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-600">
                  Store All
                </button>
              </div>
              <div className="space-y-3">
                {ingredients.ingredients.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.quantity}</p>
                    </div>
                    <button
                      onClick={() => addToPantry(item)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium ${
                        isIngredientStored(item.name) ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {isIngredientStored(item.name) ? <><Check size={16} /> Stored</> : <><Plus size={16} /> Store</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Uncertain Ingredients Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤔</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Not Sure About These</h3>
              <p className="text-gray-500 text-sm mt-1">Do you have these items?</p>
              
              <button
                onClick={() => {
                  setShowConfirmation(false)
                  setUncertainIngredients([])
                  setConfirmedIngredients([])
                }}
                className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                Let AI decide
              </button>
            </div>

            {uncertainIngredients.length > 0 ? (
              <div className="space-y-3 mb-6">
                {uncertainIngredients.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-xs text-yellow-600">AI is unsure</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRejectIngredient(item)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <X size={20} />
                      </button>
                      <button
                        onClick={() => handleConfirmIngredient(item)}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <Check size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 mb-6">
                <p className="text-gray-500">All items reviewed!</p>
                {confirmedIngredients.length > 0 && (
                  <p className="text-green-600 text-sm mt-1">
                    ✓ {confirmedIngredients.length} item{confirmedIngredients.length !== 1 ? 's' : ''} confirmed
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleFinishConfirmation}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl p-4 font-semibold hover:shadow-lg transition-shadow"
            >
              {uncertainIngredients.length > 0 ? 'Skip Remaining' : 'Done'}
            </button>
          </div>
        </div>
      )}

      {/* Admin Mode Password Modal */}
      {showAdminPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔐</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Admin Mode</h3>
              <p className="text-gray-500 text-sm mt-1">Enter password to unlock</p>
            </div>

            <div className="space-y-4">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminPasswordSubmit()}
                placeholder="Enter password"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              
              {passwordError && (
                <p className="text-red-500 text-sm text-center font-medium">{passwordError}</p>
              )}

              <button
                onClick={handleAdminPasswordSubmit}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-3 font-semibold hover:shadow-lg transition-shadow"
              >
                Unlock Admin Mode
              </button>

              <button
                onClick={() => {
                  setShowAdminPassword(false)
                  setAdminPassword('')
                  setPasswordError('')
                }}
                className="w-full bg-gray-100 text-gray-900 rounded-2xl p-3 font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScannerTab
