import { useState, useRef, useEffect } from 'react'
import { Camera, Upload, Loader2, Sparkles, X, Check, Plus, MessageCircle, Send, Bot, User } from 'lucide-react'

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD
const DAILY_SCAN_LIMIT = 5
const DAILY_CHAT_LIMIT = 5

function getChatMessagesToday() {
  const stored = localStorage.getItem('chatUsage')
  if (!stored) return 0
  const { date, count } = JSON.parse(stored)
  const today = new Date().toDateString()
  return date === today ? count : 0
}

function incrementChatMessagesToday() {
  const stored = localStorage.getItem('chatUsage')
  const today = new Date().toDateString()
  
  if (!stored) {
    localStorage.setItem('chatUsage', JSON.stringify({ date: today, count: 1 }))
    return 1
  }
  
  const { date, count } = JSON.parse(stored)
  const newCount = date === today ? count + 1 : 1
  localStorage.setItem('chatUsage', JSON.stringify({ date: today, count: newCount }))
  return newCount
}

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

function ScannerTab({ addToHistory, pantry, setPantry, ingredients, setIngredients, imagePreview, setImagePreview, isAdmin = false }) {
  console.log('ScannerTab isAdmin:', isAdmin)
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [messagesRemaining, setMessagesRemaining] = useState(isAdmin ? 999 : DAILY_CHAT_LIMIT - getChatMessagesToday())
  const chatInputRef = useRef(null)
  const [error, setError] = useState(null)
  const [showScanning, setShowScanning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [manualInput, setManualInput] = useState('')
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState([])
  const [scansRemaining, setScansRemaining] = useState(DAILY_SCAN_LIMIT - getScansToday())
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmedIngredients, setConfirmedIngredients] = useState([])
  const [uncertainIngredients, setUncertainIngredients] = useState([])
  const [settings, setSettings] = useState({ unsureIngredients: false })
  const [adminMode, setAdminMode] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const tapTimeoutRef = useRef(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // Load settings from localStorage
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('appSettings')
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings))
      }
    } catch (error) {
      console.warn('Error loading settings from localStorage:', error)
    }
  }, [])

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
    'Analyzing brands & quantities...',
    'Identifying specific items...',
    'Finalizing detailed results...'
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
                  text: `Identify EVERY food item in this image with maximum detail. CRITICAL RULES:
1. If it's a PREPARED/COOKED DISH (cake, pizza, burger, sandwich, soup, pancakes, pasta, etc), list it AS-IS with details about size/portion.
2. If it's RAW INGREDIENTS (vegetables, fruits, raw meat, spices), list each one with specific details.
3. For PACKAGED ITEMS: Include brand name if visible, specific product name, and estimated quantity remaining.
4. For FRESH PRODUCE: Include variety/type if identifiable (e.g., "Roma tomato" not just "tomato").
5. For LIQUIDS: Estimate volume in appropriate units (ml, oz, cups) or fraction of container remaining.
6. For SPICES/SEASONINGS: Include brand if visible and estimate amount (pinch, teaspoon, fraction of jar).
7. Capitalize first letter of each item.
8. DO NOT include any positions, locations, coordinates, or spatial information. ONLY return ingredient names and quantities.
9. Be as specific as possible with quantities - use fractions, percentages, or measurements.

Examples:
- "Heinz Ketchup 0.3 bottle remaining"
- "Organic Roma tomatoes 3 medium"
- "Tabasco hot sauce 0.45 bottle left" 
- "Whole milk 1.2 liters"
- "Kraft shredded cheddar cheese 0.7 bag"
${settings.unsureIngredients ? '10. Add "confident": true if you\'re sure about the item, "confident": false if you\'re unsure or guessing.' : ''}

Return ONLY this JSON (no markdown, no extra text):
${settings.unsureIngredients 
  ? '{"ingredients": [{"Name": "Item1", "Quantity": "1", "confident": true}, {"Name": "Item2", "Quantity": "1", "confident": false}]}' 
  : '{"ingredients": [{"Name": "Item1", "Quantity": "1"}, {"Name": "Item2", "Quantity": "1"}]}'}`
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
        
        if (filtered.length === 0) {
          // No valid ingredients found after filtering
          throw new Error('No recognizable ingredients found in this photo. Please try taking a clearer photo of food items.')
        }
        
        if (filtered.length > 0) {
          if (settings.unsureIngredients) {
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
            // Process all ingredients without uncertainty checking
            parsedIngredients = { ingredients: filtered.map(({ name, quantity }) => ({ name, quantity })) }
          }
        } else {
          // Check if AI returned a message about no food
          if (fullText.toLowerCase().includes('no food') || 
              fullText.toLowerCase().includes('no ingredients') ||
              fullText.toLowerCase().includes('cannot identify') ||
              fullText.toLowerCase().includes('unable to detect') ||
              fullText.toLowerCase().includes('no recognizable food')) {
            throw new Error('No food detected in this photo. Please try taking a clearer photo of food items.')
          } else {
            throw new Error('No valid ingredients found')
          }
        }
      } catch (parseErr) {
        console.error('Parse error:', parseErr, 'Full text:', fullText)
        
        // Check if AI indicated no food was found
        if (fullText.toLowerCase().includes('no food') || 
            fullText.toLowerCase().includes('no ingredients') ||
            fullText.toLowerCase().includes('cannot identify') ||
            fullText.toLowerCase().includes('unable to detect') ||
            fullText.toLowerCase().includes('no recognizable food') ||
            fullText.toLowerCase().includes('no food items') ||
            fullText.toLowerCase().includes('cannot see any food')) {
          throw new Error('No food detected in this photo. Please try taking a clearer photo of food items.')
        }
        
        // Check if AI indicated uncertainty but no ingredients were found
        if (fullText.toLowerCase().includes('uncertain') || 
            fullText.toLowerCase().includes('not sure') ||
            fullText.toLowerCase().includes('difficult to identify')) {
          throw new Error('I\'m not confident about identifying ingredients in this photo. Please try a clearer photo with better lighting.')
        }
        
        // Generic parsing failure
        throw new Error('Unable to identify ingredients in this photo. Please try again with a clearer image.')
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
    const simplifiedName = simplifyIngredientName(ingredient.name)
    const simplifiedIngredient = { ...ingredient, name: simplifiedName }
    
    if (!pantry.some(p => p.name.toLowerCase() === simplifiedName.toLowerCase())) {
      setPantry([...pantry, simplifiedIngredient])
    }
  }

  const storeAllIngredients = () => {
    const uniqueIngredients = ingredients?.ingredients?.filter(ing => 
      !pantry.some(p => p.name.toLowerCase() === simplifyIngredientName(ing.name).toLowerCase())
    ) || []
    
    // Convert to simplified names for consistency
    const simplifiedIngredients = uniqueIngredients.map(ing => ({
      ...ing,
      name: simplifyIngredientName(ing.name)
    }))
    
    setPantry([...pantry, ...simplifiedIngredients])
  }

  const addChatMessage = (message) => {
    console.log('Adding chat message:', message)
    setChatMessages(prev => {
      const newMessages = [...prev, message]
      console.log('Chat messages now:', newMessages)
      return newMessages
    })
    setTimeout(() => {
      chatInputRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const sendChatMessage = async () => {
    console.log('sendChatMessage called, isAdmin:', isAdmin, 'messagesRemaining:', messagesRemaining)
    
    if (!chatInput.trim() && !imagePreview) return
    if (!isAdmin && messagesRemaining <= 0) {
      console.log('Blocking message - limit reached for non-admin')
      addChatMessage({
        type: 'bot',
        content: 'You\'ve reached your daily chat limit of 5 messages. Upgrade to premium for unlimited conversations!',
        timestamp: new Date().toISOString()
      })
      return
    }

    const userMessage = chatInput.trim() || 'Tell me about this image'
    setChatLoading(true)

    // Add user message
    addChatMessage({
      type: 'user',
      content: userMessage,
      image: imagePreview || null,
      timestamp: new Date().toISOString()
    })

    setChatInput('')

    try {
      let prompt = `You are a helpful cooking and food assistant. The user is chatting with you about food, ingredients, or cooking.`
      
      if (imagePreview) {
        prompt += ` The user has shared an image from a recent scan. Please analyze it and provide helpful cooking-related advice.`
      }

      prompt += `\n\nUser message: "${userMessage}"`

      console.log('Sending chat message:', { userMessage, hasImage: !!imagePreview })

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Recipee Chat Assistant'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: imagePreview ? [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imagePreview
                }
              }
            ] : [{
              role: 'user',
              content: prompt
            }]
          }]
        })
      })

      console.log('Chat response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Chat API error:', errorText)
        throw new Error(`API Error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Chat API response data:', data)

      const botMessage = data.choices?.[0]?.message?.content || 'Sorry, I couldn\'t process that request.'

      if (!botMessage || botMessage.trim() === '') {
        throw new Error('Empty response from AI')
      }

      addChatMessage({
        type: 'bot',
        content: botMessage,
        timestamp: new Date().toISOString()
      })

      if (!isAdmin) {
        console.log('Decrementing message count for non-admin')
        const newCount = incrementChatMessagesToday()
        setMessagesRemaining(DAILY_CHAT_LIMIT - newCount)
      } else {
        console.log('Admin user - not decrementing message count')
      }

    } catch (error) {
      console.error('Chat error:', error)
      
      // Add a test message to verify UI is working
      addChatMessage({
        type: 'bot',
        content: `Test response: I received your message "${userMessage}". There was an error: ${error.message}. The chat UI is working!`,
        timestamp: new Date().toISOString()
      })
    } finally {
      setChatLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const isIngredientStored = (name) => pantry.some(p => p.name.toLowerCase() === simplifyIngredientName(name).toLowerCase())

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

  // Simplify ingredient names for pantry storage
  const simplifyIngredientName = (fullName) => {
    // Remove brands, quantities, and detailed descriptions
    let simplified = fullName
    
    // Remove brand names (common patterns)
    simplified = simplified.replace(/\b(Heinz|Kraft|Tabasco|McCormick|French's|Hidden Valley|Ragú|Prego|Classico|Daisy|Organic|Nature's Own|Wonder Bread|Oscar Mayer|Tyson|Perdue|Foster Farms)\b/gi, '').trim()
    
    // Remove quantities and measurements
    simplified = simplified.replace(/\b\d+\.?\d*\s*(?:bottle|bag|jar|box|pack|can|carton|liter|ml|oz|lb|kg|g|cup|tbsp|tsp|pinch|dash|medium|large|small|pieces|slices|clove|head|bunch|stalk|container|package|remaining|left)\b/gi, '').trim()
    
    // Remove fractions and percentages
    simplified = simplified.replace(/\b\d+\/\d+\b/g, '').trim()
    simplified = simplified.replace(/\b\d+\.?\d*%\b/g, '').trim()
    
    // Remove descriptive words that aren't essential
    simplified = simplified.replace(/\b(fresh|frozen|canned|dried|cooked|raw|grilled|baked|fried|roasted|steamed|boiled|chopped|sliced|diced|shredded|ground|minced|crushed|whole|halved|quartered|organic|natural|homemade|store-bought|premium|select|original|classic|traditional|spicy|mild|hot|sweet|sour|tangy|creamy|crunchy|soft|hard|ripe|unripe|green|red|yellow|orange|purple|white|black|brown)\b/gi, '').trim()
    
    // Remove "with" and everything after it
    simplified = simplified.replace(/\bwith\b.*/i, '').trim()
    
    // Remove extra spaces and clean up
    simplified = simplified.replace(/\s+/g, ' ').trim()
    
    // If result is empty or too short, return original
    if (simplified.length < 3) {
      return fullName.split(' ')[0] // Return first word
    }
    
    return simplified
  }

  // Check if ingredients are sufficient for good recipes
  const areIngredientsSufficientForRecipes = (ingredients) => {
    if (!ingredients || ingredients.length === 0) return false
    
    // Basic cooking categories
    const categories = {
      protein: ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'tofu', 'eggs', 'beans', 'lentils', 'chickpeas'],
      vegetables: ['tomato', 'onion', 'garlic', 'potato', 'carrot', 'broccoli', 'spinach', 'lettuce', 'pepper', 'mushroom', 'zucchini'],
      grains: ['rice', 'pasta', 'bread', 'flour', 'oats', 'quinoa', 'couscous'],
      dairy: ['milk', 'cheese', 'butter', 'cream', 'yogurt'],
      sauces: ['sauce', 'ketchup', 'mustard', 'mayo', 'soy sauce', 'oil', 'vinegar'],
      spices: ['salt', 'pepper', 'basil', 'oregano', 'thyme', 'rosemary', 'cumin', 'paprika']
    }
    
    const simplifiedIngredients = ingredients.map(ing => simplifyIngredientName(ing.name).toLowerCase())
    
    // Count how many categories we have
    let categoryCount = 0
    for (const [category, items] of Object.entries(categories)) {
      if (simplifiedIngredients.some(ing => items.some(item => ing.includes(item)))) {
        categoryCount++
      }
    }
    
    // Need at least 3 different categories for decent recipes
    // Or at least 5 ingredients total
    return categoryCount >= 3 || simplifiedIngredients.length >= 5
  }

  return (
    <div className="p-4">
      <div className="safe-area-top pt-4 pb-6">
        <div className="flex items-center justify-between">
          <div onClick={handleTitleTap} className="cursor-pointer select-none">
            <h1 className="text-3xl font-bold text-gray-900">Scanner</h1>
            <p className="text-gray-500 mt-1">Identify ingredients, brands, and quantities from photos</p>
          </div>
          <div className="px-4 py-2 rounded-full font-semibold text-sm bg-blue-100 text-blue-700">
            {adminMode ? '∞' : `${scansRemaining}/5 scans`}
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
                    <button
                      onClick={() => setPantry(pantry.filter((_, i) => i !== idx))}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                    >
                      <X size={16} />
                      Remove
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
              
              {!areIngredientsSufficientForRecipes(ingredients.ingredients) && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-orange-600 text-sm">🍳</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-orange-900 mb-1">Limited Recipe Options</h4>
                      <p className="text-orange-700 text-sm mb-3">
                        These ingredients alone may not be enough for complete recipes. Try adding more ingredients or use our "Almost Recipes" feature for creative ideas!
                      </p>
                      <button 
                        onClick={() => setShowAlmostRecipes(true)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                      >
                        Try Almost Recipes
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                {ingredients.ingredients.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.quantity}</p>
                    </div>
                    <button
                      onClick={() => addToPantry(item)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        isIngredientStored(item.name) ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      {isIngredientStored(item.name) ? <><Check size={16} /> Stored</> : <><Plus size={16} /> Store</>}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat Section - Show after scan */}
          {imagePreview && !showChat && (
            <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <MessageCircle size={20} className="text-blue-500" />
                  Ask About This Photo
                </h3>
                <span className="text-xs text-gray-500">
                  {isAdmin ? 'Unlimited' : `${messagesRemaining}/5 messages today`}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Chat with AI about ingredients, recipes, or cooking advice for this photo
              </p>
              <button
                onClick={() => setShowChat(true)}
                className="w-full bg-blue-500 text-white rounded-xl p-3 font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Start Chat
              </button>
            </div>
          )}

          {/* Chat Interface */}
          {showChat && (
            <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <MessageCircle size={20} className="text-blue-500" />
                  AI Cooking Chat
                </h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Messages */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-blue-100 rounded-full p-3 mb-3 inline-block">
                      <MessageCircle size={24} className="text-blue-600" />
                    </div>
                    <p className="text-gray-600 text-sm">Ask about ingredients, recipes, or cooking!</p>
                  </div>
                ) : (
                  chatMessages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`rounded-full p-1 flex-shrink-0 ${
                          message.type === 'user' ? 'bg-blue-500' : 'bg-gray-200'
                        }`}>
                          {message.type === 'user' ? (
                            <User size={12} className="text-white" />
                          ) : (
                            <Bot size={12} className="text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className={`rounded-xl p-2 ${
                            message.type === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 border border-gray-200 text-gray-900'
                          }`}>
                            {message.image && (
                              <img
                                src={message.image}
                                alt="Shared image"
                                className="rounded-lg mb-2 max-w-full h-auto"
                                style={{ maxHeight: '120px' }}
                              />
                            )}
                            <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 px-1">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatInputRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about ingredients, recipes, or cooking..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && !chatLoading && sendChatMessage()}
                />

                <button
                  onClick={sendChatMessage}
                  disabled={chatLoading || (!chatInput.trim() && !imagePreview)}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {chatLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>

              {!isAdmin && messagesRemaining <= 1 && (
                <p className="text-xs text-orange-600 mt-2 text-center">
                  {messagesRemaining === 0 ? 'Daily limit reached' : `${messagesRemaining} message remaining today`}
                </p>
              )}
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
