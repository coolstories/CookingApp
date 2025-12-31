import { Clock, ChevronRight, Sparkles } from 'lucide-react'

function HistoryTab({ history }) {
  const formatDate = (dateString) => {
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
  }

  return (
    <div className="p-4">
      <div className="safe-area-top pt-4 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 animate-slideDown">History</h1>
        <p className="text-gray-500 mt-1 animate-slideDown animation-delay-100">Your previous ingredient scans</p>
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
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((scan, index) => (
            <div
              key={scan.id}
              className="bg-white rounded-2xl p-4 flex items-center gap-4 active:scale-98 transition-all duration-200 hover:shadow-lg cursor-pointer animate-slideUp card-hover"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative">
                <img
                  src={scan.image}
                  alt="Scan"
                  className="w-16 h-16 rounded-xl object-cover shadow-md"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {scan.ingredients.length} Ingredient{scan.ingredients.length !== 1 ? 's' : ''} Found
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {scan.ingredients.map(i => i.name).join(', ')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(scan.date)}
                </p>
              </div>
              <ChevronRight size={20} className="text-gray-300" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default HistoryTab
