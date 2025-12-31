import { useState, useRef } from 'react'
import { Camera, Upload, Loader2, Sparkles, X, Check, Plus } from 'lucide-react'

const OPENROUTER_API_KEY = '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'

function ScannerTab({ addToHistory, pantry, setPantry, ingredients, setIngredients, imagePreview, setImagePreview }) {
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showScanning, setShowScanning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [manualInput, setManualInput] = useState('')
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

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
   - Example: "Chocolate Cake" NOT "flour, eggs, butter"
   - Example: "Chocolate Cake Pancakes" NOT "pancake batter, chocolate"
2. If it's RAW INGREDIENTS (vegetables, fruits, raw meat, spices), list each one.
3. Capitalize first letter of each item.

Return ONLY this JSON (no markdown, no extra text):
{"ingredients": [{"Name": "Item1", "Quantity": "1"}, {"Name": "Item2", "Quantity": "1"}]}`
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
        
        const ingredients = []
        
        const patterns = [
          /\{\s*"Name"\s*:\s*"([^"]+)"\s*,\s*"Quantity"\s*:\s*"([^"]+)"\s*\}/gi,
          /\{\s*"name"\s*:\s*"([^"]+)"\s*,\s*"quantity"\s*:\s*"([^"]+)"\s*\}/gi,
          /\{\s*"Quantity"\s*:\s*"([^"]+)"\s*,\s*"Name"\s*:\s*"([^"]+)"\s*\}/gi,
          /\{\s*"quantity"\s*:\s*"([^"]+)"\s*,\s*"name"\s*:\s*"([^"]+)"\s*\}/gi,
        ]
        
        for (const pattern of patterns) {
          let match
          while ((match = pattern.exec(jsonStr)) !== null) {
            const isReversed = pattern.source.includes('"Quantity"') && pattern.source.indexOf('"Quantity"') < pattern.source.indexOf('"Name"')
            const name = isReversed ? match[2] : match[1]
            const quantity = isReversed ? match[1] : match[2]
            
            if (!ingredients.some(ing => ing.name.toLowerCase() === name.toLowerCase())) {
              ingredients.push({ name, quantity })
            }
          }
        }
        
        if (ingredients.length === 0) {
          const jsonMatch = jsonStr.match(/\{[\s\S]*"ingredients"\s*:\s*\[[\s\S]*\][\s\S]*\}/)
          if (jsonMatch) {
            try {
              const cleanJson = jsonMatch[0].replace(/,\s*]/g, ']').replace(/,\s*}/g, '}')
              const parsed = JSON.parse(cleanJson)
              if (parsed.ingredients && Array.isArray(parsed.ingredients)) {
                for (const ing of parsed.ingredients) {
                  ingredients.push({
                    name: ing.name || ing.Name || 'Unknown',
                    quantity: ing.quantity || ing.Quantity || '1'
                  })
                }
              }
            } catch {}
          }
        }
        
        const filtered = ingredients.filter(
          ing => ing.name && 
                 ing.name.toLowerCase() !== 'food' && 
                 ing.name !== 'Unknown' &&
                 ing.name.length > 1
        )
        
        if (filtered.length > 0) {
          parsedIngredients = { ingredients: filtered }
        } else {
          throw new Error('No valid ingredients found')
        }
      } catch (parseErr) {
        console.error('Parse error:', parseErr, 'Full text:', fullText)
        parsedIngredients = { ingredients: [{ name: 'Unable to parse ingredients', quantity: '1' }] }
      }

      setIngredients(parsedIngredients)

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

  const addManualIngredient = () => {
    if (!manualInput.trim()) return
    const newIngredient = { name: manualInput.trim(), quantity: '1' }
    addToPantry(newIngredient)
    setManualInput('')
  }

  return (
    <div className="p-4">
      <div className="safe-area-top pt-4 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Scanner</h1>
        <p className="text-gray-500 mt-1">Identify ingredients from photos</p>
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
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
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
    </div>
  )
}

export default ScannerTab
