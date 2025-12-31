import { useState } from 'react'
import { BookOpen, Utensils, Leaf, Flame, Apple, ChevronRight } from 'lucide-react'

function LearnTab() {
  const [selectedTopic, setSelectedTopic] = useState(null)

  const topics = [
    {
      id: 1,
      title: 'Cooking Basics',
      description: 'Essential techniques every cook should know',
      icon: Utensils,
      color: 'bg-orange-100',
      iconColor: 'text-orange-500',
      articles: [
        { title: 'How to Properly Chop Vegetables', time: '5 min' },
        { title: 'Understanding Heat Levels', time: '4 min' },
        { title: 'Seasoning Your Dishes', time: '6 min' },
        { title: 'Knife Skills 101', time: '8 min' }
      ]
    },
    {
      id: 2,
      title: 'Fresh Ingredients',
      description: 'How to select and store produce',
      icon: Leaf,
      color: 'bg-green-100',
      iconColor: 'text-green-500',
      articles: [
        { title: 'Picking Ripe Fruits', time: '4 min' },
        { title: 'Storing Vegetables Properly', time: '5 min' },
        { title: 'Identifying Fresh Herbs', time: '3 min' },
        { title: 'Shelf Life Guide', time: '6 min' }
      ]
    },
    {
      id: 3,
      title: 'Cooking Methods',
      description: 'Grilling, roasting, sautéing, and more',
      icon: Flame,
      color: 'bg-red-100',
      iconColor: 'text-red-500',
      articles: [
        { title: 'Mastering the Grill', time: '7 min' },
        { title: 'Roasting Techniques', time: '6 min' },
        { title: 'Sautéing Like a Pro', time: '5 min' },
        { title: 'Steaming and Boiling', time: '4 min' }
      ]
    },
    {
      id: 4,
      title: 'Nutrition Guide',
      description: 'Understanding food nutrition',
      icon: Apple,
      color: 'bg-pink-100',
      iconColor: 'text-pink-500',
      articles: [
        { title: 'Macronutrients Explained', time: '6 min' },
        { title: 'Balanced Meal Planning', time: '7 min' },
        { title: 'Vitamins and Minerals', time: '8 min' },
        { title: 'Reading Nutrition Labels', time: '5 min' }
      ]
    }
  ]

  return (
    <div className="p-4">
      <div className="safe-area-top pt-4 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Learn</h1>
        <p className="text-gray-500 mt-1">Expand your culinary knowledge</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {topics.map((topic) => {
          const Icon = topic.icon
          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className="bg-white rounded-2xl p-4 active:bg-gray-50 transition-colors text-left hover:shadow-lg"
            >
              <div className={`${topic.color} rounded-xl p-3 w-fit mb-3`}>
                <Icon className={topic.iconColor} size={24} />
              </div>
              <h3 className="font-semibold text-gray-900">{topic.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{topic.articles.length} articles</p>
            </button>
          )
        })}
      </div>

      {!selectedTopic && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-5 text-white">
          <h3 className="font-bold text-lg">More Content Coming Soon!</h3>
          <p className="text-white/80 text-sm mt-1">
            We're working on adding recipes, video tutorials, and more.
          </p>
        </div>
      )}

      {selectedTopic && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTopic(null)}
              className="mb-4 text-blue-500 font-semibold text-sm"
            >
              ← Back
            </button>
            
            <div className="flex items-start gap-3 mb-6">
              <div className={`${selectedTopic.color} rounded-xl p-3`}>
                {(() => {
                  const Icon = selectedTopic.icon
                  return Icon ? <Icon className={selectedTopic.iconColor} size={28} /> : null
                })()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedTopic.title}</h2>
                <p className="text-gray-600 text-sm mt-1">{selectedTopic.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              {selectedTopic.articles.map((article, idx) => (
                <button
                  key={idx}
                  className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors active:bg-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{article.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">📖 {article.time} read</p>
                    </div>
                    <ChevronRight size={20} className="text-gray-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LearnTab
