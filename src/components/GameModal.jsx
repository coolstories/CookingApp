import { useState } from 'react'
import { X, Volume2 } from 'lucide-react'

function GameModal({ isOpen, onClose }) {
  const [score, setScore] = useState(0)
  const [currentGame, setCurrentGame] = useState(null)
  const [gameState, setGameState] = useState({})

  const games = [
    { id: 'guess', name: '🎯 Guess the Ingredient', desc: 'Guess the ingredient from the emoji' },
    { id: 'trivia', name: '🍳 Cooking Trivia', desc: 'Answer quick cooking questions' },
    { id: 'match', name: '🥘 Recipe Challenge', desc: 'Match recipes to ingredients' }
  ]

  const ingredientEmojis = [
    { emoji: '🍅', answer: 'Tomato', options: ['Tomato', 'Apple', 'Strawberry'] },
    { emoji: '🥬', answer: 'Lettuce', options: ['Lettuce', 'Cabbage', 'Spinach'] },
    { emoji: '🧅', answer: 'Onion', options: ['Onion', 'Garlic', 'Potato'] },
    { emoji: '��', answer: 'Carrot', options: ['Carrot', 'Sweet Potato', 'Parsnip'] },
    { emoji: '🍗', answer: 'Chicken', options: ['Chicken', 'Turkey', 'Duck'] },
  ]

  const triviaQuestions = [
    { q: 'What temperature should water boil at?', a: '100°C', opts: ['100°C', '90°C', '110°C'] },
    { q: 'How long should pasta cook?', a: '8-12 mins', opts: ['8-12 mins', '2-3 mins', '20-25 mins'] },
    { q: 'What is the main ingredient in pesto?', a: 'Basil', opts: ['Basil', 'Parsley', 'Mint'] },
    { q: 'How many eggs in a dozen?', a: '12', opts: ['12', '10', '15'] },
    { q: 'What is sushi wrapped in?', a: 'Seaweed', opts: ['Seaweed', 'Rice paper', 'Lettuce'] },
  ]

  const matchRecipes = [
    { recipe: 'Pasta Carbonara', ing: 'Eggs, Bacon, Pasta', answer: 'Eggs, Bacon, Pasta' },
    { recipe: 'Caesar Salad', ing: 'Lettuce, Parmesan, Croutons', answer: 'Lettuce, Parmesan, Croutons' },
    { recipe: 'Tomato Soup', ing: 'Tomato, Cream, Basil', answer: 'Tomato, Cream, Basil' },
  ]

  const startGame = (gameId) => {
    setCurrentGame(gameId)
    if (gameId === 'guess') {
      const q = ingredientEmojis[Math.floor(Math.random() * ingredientEmojis.length)]
      setGameState({ question: q, answered: false })
    } else if (gameId === 'trivia') {
      const q = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)]
      setGameState({ question: q, answered: false })
    } else if (gameId === 'match') {
      const q = matchRecipes[Math.floor(Math.random() * matchRecipes.length)]
      setGameState({ question: q, answered: false })
    }
  }

  const handleAnswer = (selected) => {
    if (gameState.answered) return
    
    const isCorrect = selected === gameState.question.answer || selected === gameState.question.a
    if (isCorrect) {
      setScore(score + 10)
    }
    setGameState({ ...gameState, answered: true, correct: isCorrect })
  }

  const nextQuestion = () => {
    startGame(currentGame)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900">Quick Games</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {!currentGame ? (
          <>
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 mb-4">
              <p className="text-sm text-gray-600">Your Score</p>
              <p className="text-3xl font-bold text-purple-600">{score}</p>
            </div>

            <div className="space-y-2">
              {games.map((game) => (
                <button
                  key={game.id}
                  onClick={() => startGame(game.id)}
                  className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors active:bg-gray-200"
                >
                  <p className="font-semibold text-gray-900">{game.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{game.desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-4 bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 active:scale-95 transition-all"
            >
              Back to Scanning
            </button>
          </>
        ) : currentGame === 'guess' ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">What ingredient is this?</p>
              <p className="text-6xl mb-4">{gameState.question?.emoji}</p>
            </div>

            <div className="space-y-2">
              {gameState.question?.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  disabled={gameState.answered}
                  className={`w-full p-3 rounded-xl font-medium transition-all ${
                    gameState.answered
                      ? opt === gameState.question.answer
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 active:scale-95'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {gameState.answered && (
              <div className={`p-3 rounded-xl text-center ${gameState.correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <p className="font-semibold">{gameState.correct ? '✓ Correct! +10 points' : '✗ Wrong answer'}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={nextQuestion}
                className="flex-1 bg-blue-500 text-white py-2 rounded-xl font-semibold hover:bg-blue-600"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentGame(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl font-semibold hover:bg-gray-300"
              >
                Menu
              </button>
            </div>
          </div>
        ) : currentGame === 'trivia' ? (
          <div className="space-y-4">
            <div>
              <p className="text-gray-900 font-semibold mb-4">{gameState.question?.q}</p>
            </div>

            <div className="space-y-2">
              {gameState.question?.opts.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  disabled={gameState.answered}
                  className={`w-full p-3 rounded-xl font-medium transition-all text-left ${
                    gameState.answered
                      ? opt === gameState.question.a
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 active:scale-95'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {gameState.answered && (
              <div className={`p-3 rounded-xl text-center ${gameState.correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <p className="font-semibold">{gameState.correct ? '✓ Correct! +10 points' : '✗ Wrong answer'}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={nextQuestion}
                className="flex-1 bg-blue-500 text-white py-2 rounded-xl font-semibold hover:bg-blue-600"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentGame(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl font-semibold hover:bg-gray-300"
              >
                Menu
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm mb-2">Match the recipe to its ingredients:</p>
              <p className="text-lg font-bold text-gray-900 mb-4">{gameState.question?.recipe}</p>
            </div>

            <div className="space-y-2">
              {matchRecipes.map((r, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(r.answer)}
                  disabled={gameState.answered}
                  className={`w-full p-3 rounded-xl font-medium transition-all text-left text-sm ${
                    gameState.answered
                      ? r.answer === gameState.question.answer
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 active:scale-95'
                  }`}
                >
                  {r.ing}
                </button>
              ))}
            </div>

            {gameState.answered && (
              <div className={`p-3 rounded-xl text-center ${gameState.correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <p className="font-semibold">{gameState.correct ? '✓ Correct! +10 points' : '✗ Wrong answer'}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={nextQuestion}
                className="flex-1 bg-blue-500 text-white py-2 rounded-xl font-semibold hover:bg-blue-600"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentGame(null)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl font-semibold hover:bg-gray-300"
              >
                Menu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GameModal
