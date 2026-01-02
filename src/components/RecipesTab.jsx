import { useState } from 'react'
import { ChefHat, Loader2, Clock, Users, Flame, Search, X, Filter, CheckCircle2, Circle } from 'lucide-react'

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const DAILY_RECIPE_LIMIT = 5

function getRecipeSearchesToday() {
  const stored = localStorage.getItem('recipeUsage')
  if (!stored) return 0
  const { date, count } = JSON.parse(stored)
  const today = new Date().toDateString()
  return date === today ? count : 0
}

function incrementRecipeSearchesToday() {
  const today = new Date().toDateString()
  const current = getRecipeSearchesToday()
  localStorage.setItem('recipeUsage', JSON.stringify({ date: today, count: current + 1 }))
}

function RecipeChecklist({ isOpen, steps, currentStep }) {
  if (!isOpen) return null

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        {/* Animated Chef Icon */}
        <div className="flex items-center justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 flex items-center justify-center shadow-lg">
              <ChefHat className="text-white w-12 h-12 animate-bounce" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-orange-300 animate-pulse"></div>
          </div>
        </div>

        {/* Header */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Finding Recipes</h2>
        <p className="text-gray-500 text-center text-sm mb-8">Discovering delicious dishes for you...</p>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-gray-500 mt-2 font-medium">{Math.round(progress)}%</p>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep
            const isActive = index === currentStep
            
            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isCompleted ? 'bg-green-50 border border-green-200' : 
                  isActive ? 'bg-orange-50 border border-orange-200 shadow-md' : 
                  'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                  isCompleted ? 'bg-green-500 text-white' : 
                  isActive ? 'bg-orange-500 text-white animate-pulse' : 
                  'bg-gray-300 text-gray-600'
                }`}>
                  {isCompleted ? <CheckCircle2 size={20} /> : isActive ? <Loader2 size={18} className="animate-spin" /> : index + 1}
                </div>
                <p className={`font-medium text-sm ${
                  isCompleted ? 'text-green-700' : 
                  isActive ? 'text-orange-700' : 
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
  )
}

function RecipesTab({ pantry, preferences, recipes, setRecipes }) {
  const [loading, setLoading] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [detailedRecipe, setDetailedRecipe] = useState(null)
  const [error, setError] = useState(null)
  const [showChecklist, setShowChecklist] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [filterMealType, setFilterMealType] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [showAlmostRecipes, setShowAlmostRecipes] = useState(false)
  const [almostRecipeInput, setAlmostRecipeInput] = useState('')
  const [almostRecipeResult, setAlmostRecipeResult] = useState(null)
  const [almostLoading, setAlmostLoading] = useState(false)
  const [searchesRemaining, setSearchesRemaining] = useState(DAILY_RECIPE_LIMIT - getRecipeSearchesToday())

  const recipeSteps = [
    'Analyzing pantry...',
    'Matching ingredients...',
    'Finding recipes...',
    'Ranking results...'
  ]

  const findRecipes = async () => {
    if (pantry.length === 0) {
      setError('Add ingredients to your pantry first')
      return
    }

    if (searchesRemaining <= 0) {
      setError('Daily recipe search limit reached (5/day). Try again tomorrow!')
      return
    }

    setLoading(true)
    setError(null)
    setShowChecklist(true)
    setCurrentStep(0)

    // Animation runs independently - 2.5 seconds per step (10 sec total)
    const stepDuration = 5500
    
    // Create a promise that resolves when animation completes
    const animationPromise = new Promise((resolve) => {
      setTimeout(() => setCurrentStep(1), stepDuration * 1)
      setTimeout(() => setCurrentStep(2), stepDuration * 2)
      setTimeout(() => setCurrentStep(3), stepDuration * 3)
      setTimeout(() => resolve(), stepDuration * 4)
    })

    try {
      const ingredientList = pantry.map(p => p.name).join(', ')
      const enabledPrefs = preferences.filter(p => p.enabled)
      
      let prefPrompt = ''
      if (enabledPrefs.length > 0) {
        const prefNames = enabledPrefs.map(p => p.name).join(', ')
        prefPrompt = `\n\nIMPORTANT: The user has these preferences: ${prefNames}. Make sure ALL recipes respect these preferences. For example, if they're vegetarian, no meat. If they have a sweet tooth, include desserts. Tailor recipes specifically to match their preferences.`
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 90000)

      // Build preference constraints
      let prefConstraints = ''
      let excludeIngredients = ''
      if (enabledPrefs.length > 0) {
        const prefNames = enabledPrefs.map(p => p.name).join(', ')
        prefConstraints = `\n\nDIETARY PREFERENCES: ${prefNames}`
        
        // Build exclusion list based on preferences
        const exclusions = []
        if (enabledPrefs.some(p => p.id === 'vegetarian')) exclusions.push('meat', 'poultry', 'fish', 'seafood')
        if (enabledPrefs.some(p => p.id === 'vegan')) exclusions.push('meat', 'poultry', 'fish', 'seafood', 'milk', 'cheese', 'butter', 'cream', 'eggs', 'honey')
        if (enabledPrefs.some(p => p.id === 'glutenfree')) exclusions.push('wheat', 'barley', 'rye', 'gluten')
        if (enabledPrefs.some(p => p.id === 'dairyfree')) exclusions.push('milk', 'cheese', 'butter', 'cream', 'yogurt')
        
        if (exclusions.length > 0) {
          excludeIngredients = `\n\nDO NOT use these ingredients in any recipe: ${[...new Set(exclusions)].join(', ')}`
        }
      }

      // Run API call and animation in parallel
      const [response] = await Promise.all([
        fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Recipee Recipe Finder'
          },
          body: JSON.stringify({
            model: 'google/gemini-2.0-flash-001',
            max_tokens: 4000,
            messages: [{
              role: 'user',
              content: `AVAILABLE INGREDIENTS (ONLY use these): ${ingredientList}${prefConstraints}${excludeIngredients}

CRITICAL RULES:
1. ONLY suggest recipes using the ingredients listed above
2. You MAY use common pantry staples: salt, pepper, oil, butter (be careful of how much), water,
3. DO NOT suggest recipes that require ingredients NOT in the list above
4. DO NOT suggest recipes that need items the user doesn't have
5. You SHOULD create exactly 5 recipes with different meal types: breakfast, lunch, dinner, snack, and dessert. If you can't find 5 recipes for different meal types, return as many as you can. 
6. Every ingredient in each recipe MUST be from the available list or common staples

Suggest exactly 5 delicious recipes using ONLY available ingredients. Each recipe must have a different meal type: one breakfast, one lunch, one dinner, one snack, and one dessert.

Return ONLY a JSON array:
[{"name": "Recipe Name", "description": "Brief description", "time": "30 mins", "servings": "4", "difficulty": "Easy", "mealType": "Breakfast", "ingredients": ["2 cups item1", "1 cup item2"], "tips": ["Tip 1"], "steps": ["Step 1", "Step 2"]}]`
            }]
          })
        }),
        animationPromise
      ])

      clearTimeout(timeoutId)

      if (!response.ok) throw new Error('Failed to find recipes')

      const data = await response.json()
      const content = data.choices[0]?.message?.content

      let parsedRecipes = []
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/)
        if (jsonMatch) parsedRecipes = JSON.parse(jsonMatch[0])
      } catch {}

      await new Promise(resolve => setTimeout(resolve, 500))
      setShowChecklist(false)
      setRecipes(parsedRecipes)

      // Increment daily recipe search counter
      incrementRecipeSearchesToday()
      setSearchesRemaining(DAILY_RECIPE_LIMIT - getRecipeSearchesToday())
    } catch (err) {
      setShowChecklist(false)
      setError(err.name === 'AbortError' ? 'Request timed out.' : 'Failed to find recipes.')
    } finally {
      setLoading(false)
    }
  }

  const filteredRecipes = recipes.filter(r => {
    const diffMatch = filterDifficulty === 'all' || r.difficulty?.toLowerCase() === filterDifficulty.toLowerCase()
    const mealMatch = filterMealType === 'all' || r.mealType?.toLowerCase() === filterMealType.toLowerCase()
    return diffMatch && mealMatch
  })

  const checkAlmostRecipe = async () => {
    if (!almostRecipeInput.trim()) return
    
    setAlmostLoading(true)
    setAlmostRecipeResult(null)
    
    const pantryList = pantry.map(p => p.name).join(', ')
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Recipee Almost Recipes'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `I want to make: "${almostRecipeInput}". My pantry has: ${pantryList || 'nothing'}.

Check if I can make this recipe with what I have. Return ONLY a JSON object:
{
  "canMake": true/false,
  "recipe": "Recipe name",
  "description": "What it is",
  "have": ["ingredient1", "ingredient2"],
  "need": [{"item": "ingredient name", "amount": "quantity needed"}],
  "steps": ["Step 1", "Step 2", "Step 3"]
}

If canMake is true, "need" should be empty. If false, list what's missing with quantities.`
          }]
        })
      })

      if (!response.ok) throw new Error('Failed to check recipe')

      const data = await response.json()
      const content = data.choices[0]?.message?.content
      
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0])
          setAlmostRecipeResult(result)
        }
      } catch {}
    } catch (err) {
      console.error('Error:', err)
      setAlmostRecipeResult({ error: 'Failed to check recipe' })
    } finally {
      setAlmostLoading(false)
    }
  }

  return (
    <div className="p-4">
      <RecipeChecklist isOpen={showChecklist} steps={recipeSteps} currentStep={currentStep} />

      <div className="safe-area-top pt-4 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
            <p className="text-gray-500 mt-1">Discover recipes with your ingredients</p>
          </div>
          <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold text-sm">
            {searchesRemaining}/5 searches
          </div>
        </div>
      </div>

      {pantry.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-orange-100 rounded-full p-6 mb-4">
            <ChefHat size={48} className="text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">No Ingredients Yet</h3>
          <p className="text-gray-500 text-center mt-2 max-w-xs">Go to Scanner and store ingredients!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Your Pantry ({pantry.length})</h3>
            <div className="flex flex-wrap gap-2">
              {pantry.map((item, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {item.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={findRecipes}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-5 flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg font-semibold"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
              <span>{loading ? 'Finding...' : 'Find Recipes'}</span>
            </button>
            <button
              onClick={() => setShowAlmostRecipes(!showAlmostRecipes)}
              className={`px-5 rounded-2xl font-semibold transition-colors ${
                showAlmostRecipes 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : 'bg-white text-purple-600 border-2 border-purple-500'
              }`}
            >
              ✨
            </button>
          </div>

          {/* Almost Recipes Modal */}
          {showAlmostRecipes && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Almost Recipes</h2>
                  <button onClick={() => setShowAlmostRecipes(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                  </button>
                </div>
                <p className="text-gray-600 text-sm mb-4">Search for a recipe and we'll tell you what you need!</p>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={almostRecipeInput}
                    onChange={(e) => setAlmostRecipeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && checkAlmostRecipe()}
                    placeholder="e.g., Pasta Carbonara..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={checkAlmostRecipe}
                    disabled={almostLoading}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50"
                  >
                    {almostLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  </button>
                </div>

                {almostRecipeResult && (
                  <div className="space-y-4">
                    {almostRecipeResult.error ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-600 text-sm">{almostRecipeResult.error}</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                          <h3 className="font-bold text-gray-900 text-lg">{almostRecipeResult.recipe}</h3>
                          <p className="text-gray-600 text-sm mt-1">{almostRecipeResult.description}</p>
                        </div>

                        {almostRecipeResult.canMake ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-700 font-semibold text-center">✅ You can make this!</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-yellow-700 font-semibold text-sm">⚠️ You're missing ingredients:</p>
                            </div>
                            <div className="space-y-2">
                              {almostRecipeResult.need?.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  <span className="font-medium text-gray-900">{item.item}</span>
                                  <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded">{item.amount}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {almostRecipeResult.have && almostRecipeResult.have.length > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-blue-700 font-semibold text-sm mb-2">✓ You have:</p>
                            <div className="flex flex-wrap gap-1">
                              {almostRecipeResult.have.map((ing, idx) => (
                                <span key={idx} className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                  {ing}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {almostRecipeResult.steps && almostRecipeResult.steps.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900">Steps:</h4>
                            <ol className="space-y-1">
                              {almostRecipeResult.steps.map((step, idx) => (
                                <li key={idx} className="flex gap-2 text-sm text-gray-700">
                                  <span className="font-semibold text-purple-600">{idx + 1}.</span>
                                  <span>{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          {recipes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mt-6">
                <h2 className="text-xl font-bold text-gray-900">Recipes Found ({filteredRecipes.length})</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg ${showFilters ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <Filter size={20} />
                </button>
              </div>

              {showFilters && (
                <div className="bg-white rounded-2xl p-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Meal Type</p>
                    <div className="flex gap-2">
                      {['all', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert'].map(meal => (
                        <button
                          key={meal}
                          onClick={() => setFilterMealType(meal)}
                          className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                            filterMealType === meal
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {meal}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Difficulty</p>
                    <div className="flex gap-2">
                      {['all', 'easy', 'medium', 'hard'].map(diff => (
                        <button
                          key={diff}
                          onClick={() => setFilterDifficulty(diff)}
                          className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                            filterDifficulty === diff
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {filteredRecipes.map((recipe, idx) => (
                <div
                  key={idx}
                  onClick={() => setDetailedRecipe(recipe)}
                  className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{recipe.name}</h3>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        recipe.mealType?.toLowerCase() === 'breakfast' ? 'bg-yellow-100 text-yellow-700' :
                        recipe.mealType?.toLowerCase() === 'lunch' ? 'bg-blue-100 text-blue-700' :
                        recipe.mealType?.toLowerCase() === 'dinner' ? 'bg-purple-100 text-purple-700' :
                        recipe.mealType?.toLowerCase() === 'snack' ? 'bg-green-100 text-green-700' :
                        recipe.mealType?.toLowerCase() === 'dessert' ? 'bg-pink-100 text-pink-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {recipe.mealType || 'Other'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{recipe.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1"><Clock size={16} />{recipe.time}</div>
                    <div className="flex items-center gap-1"><Users size={16} />{recipe.servings}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedRecipe && !detailedRecipe && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">{selectedRecipe.name}</h3>
              <button onClick={() => setSelectedRecipe(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">{selectedRecipe.description}</p>

            <div className="flex gap-4 mb-4 text-sm text-gray-600">
              <div className="flex items-center gap-1"><Clock size={16} />{selectedRecipe.time}</div>
              <div className="flex items-center gap-1"><Users size={16} />{selectedRecipe.servings}</div>
              <div className="flex items-center gap-1"><Flame size={16} />{selectedRecipe.difficulty}</div>
            </div>

            {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
              <div className="space-y-3 bg-blue-50 rounded-xl p-4 border border-blue-200 mb-4">
                <h4 className="font-semibold text-gray-900">Ingredients</h4>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setDetailedRecipe(selectedRecipe)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-4 font-semibold mt-6 hover:shadow-lg transition-shadow"
            >
              Open Fully →
            </button>
          </div>
        </div>
      )}

      {detailedRecipe && (
        <div className="fixed inset-0 bg-gray-100 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 pb-20">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{detailedRecipe.name}</h1>
                <button onClick={() => { setDetailedRecipe(null); setSelectedRecipe(null); }} className="text-gray-400 hover:text-gray-600">
                  <X size={28} />
                </button>
              </div>

              <p className="text-gray-600 text-base mb-6 leading-relaxed">{detailedRecipe.description}</p>

              <div className="flex gap-6 mb-8 text-sm text-gray-600 bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center gap-2"><Clock size={18} className="text-orange-500" /><span className="font-medium">{detailedRecipe.time}</span></div>
                <div className="flex items-center gap-2"><Users size={18} className="text-blue-500" /><span className="font-medium">{detailedRecipe.servings} servings</span></div>
                <div className="flex items-center gap-2"><Flame size={18} className="text-red-500" /><span className="font-medium">{detailedRecipe.difficulty}</span></div>
              </div>

              {detailedRecipe.ingredients && detailedRecipe.ingredients.length > 0 && (
                <div className="space-y-4 bg-blue-50 rounded-2xl p-6 border-2 border-blue-200 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Ingredients</h2>
                  <ul className="space-y-3">
                    {detailedRecipe.ingredients.map((ing, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-base text-gray-700">
                        <span className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-4 mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Instructions</h2>
                <ol className="space-y-4">
                  {detailedRecipe.steps?.map((step, idx) => (
                    <li key={idx} className="flex gap-4">
                      <span className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-gray-700 text-base leading-relaxed pt-1">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {detailedRecipe.tips && detailedRecipe.tips.length > 0 && (
                <div className="space-y-4 bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">💡 Chef's Tips</h2>
                  <ul className="space-y-3">
                    {detailedRecipe.tips.map((tip, idx) => (
                      <li key={idx} className="text-base text-gray-700 leading-relaxed">
                        ✓ {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecipesTab
