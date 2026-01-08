import { Clock, ChevronRight, Sparkles, Trash2, AlertCircle, RefreshCw } from 'lucide-react'

function HistoryTab({ history, setHistory }) {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        return 'Today'
      } else if (diffDays === 1) {
        return 'Yesterday'
      } else if (diffDays < 7) {
        return `${diffDays} days ago`
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
    } catch (error) {
      console.warn('Date formatting error:', error)
      return 'Unknown date'
    }
  }

  const handleHistoryClick = (scan) => {
    // Could implement functionality to view scan details or restore ingredients
    console.log('History item clicked:', scan)
    alert(`Scan from ${formatDate(scan.date)} with ${scan.ingredients?.length || 0} ingredients`)
  }

  const formatIngredientList = (ingredients) => {
    if (!ingredients || ingredients.length === 0) return 'No ingredients found'
    
    const maxDisplay = 3
    const displayIngredients = ingredients.slice(0, maxDisplay)
    const remainingCount = ingredients.length - maxDisplay
    
    let result = displayIngredients.map(i => i.name || i).join(', ')
    
    if (remainingCount > 0) {
      result += ` +${remainingCount} more`
    }
    
    return result
  }

  const deleteHistory = () => {
    if (window.confirm('Are you sure you want to delete all scan history? This action cannot be undone.')) {
      setHistory([])
      // Clear from localStorage for persistence
      localStorage.removeItem('scanHistory')
    }
  }

  const addTestHistory = () => {
    // This is just for testing - in production this wouldn't be needed
    console.log('Current history:', history)
    console.log('History length:', history.length)
    
    // Log localStorage contents
    try {
      const stored = localStorage.getItem('scanHistory')
      console.log('localStorage scanHistory:', stored ? JSON.parse(stored) : 'None')
    } catch (error) {
      console.warn('localStorage read error:', error)
    }
  }

  return (
    <div className="p-4">
      <div className="safe-area-top pt-4 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 animate-slideDown">History</h1>
            <p className="text-gray-500 mt-1 animate-slideDown animation-delay-100">Your previous ingredient scans</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={deleteHistory}
              className="bg-red-100 text-red-700 p-3 rounded-xl hover:bg-red-200 transition-colors animate-slideDown animation-delay-200"
              title="Delete all history"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 mb-4 animate-float">
            <Clock size={48} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700">No Scans Yet</h3>
          <p className="text-gray-500 text-center mt-2 max-w-xs">
            Your scanned ingredients will appear here. Start by scanning your first photo!
          </p>
          <div className="mt-6 flex items-center gap-2 text-blue-500">
            <Sparkles size={16} className="animate-pulse-slow" />
            <span className="text-sm font-medium">Try scanning something!</span>
          </div>
          
          {/* Debug button - remove in production */}
          <button
            onClick={addTestHistory}
            className="mt-4 px-4 py-2 bg-gray-100 rounded-lg text-xs text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <RefreshCw size={12} className="inline mr-1" />
            Debug History
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((scan, index) => {
            const ingredientCount = scan.ingredients?.length || 0
            const ingredientText = ingredientCount === 1 ? 'Ingredient' : 'Ingredients'
            
            return (
              <div
                key={scan.id}
                onClick={() => handleHistoryClick(scan)}
                className="bg-white rounded-2xl p-4 flex items-center gap-4 active:scale-98 transition-all duration-200 hover:shadow-lg cursor-pointer animate-slideUp card-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  {scan.image ? (
                    <>
                      <img
                        src={scan.image}
                        alt="Scan"
                        className="w-16 h-16 rounded-xl object-cover shadow-md"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center hidden">
                        <Clock size={24} className="text-gray-400" />
                      </div>
                    </>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Clock size={24} className="text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {ingredientCount} {ingredientText} Found
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {formatIngredientList(scan.ingredients)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(scan.date)}
                  </p>
                </div>
                <ChevronRight size={20} className="text-gray-300 flex-shrink-0" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default HistoryTab
