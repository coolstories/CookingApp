import { useState, useEffect } from 'react'
import { MessageCircle, Send, Loader2, Camera, ChefHat, Sparkles, X } from 'lucide-react'

function ChatTab({ imagePreview, ingredients, userName }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messagesRemaining, setMessagesRemaining] = useState(5)
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if user is admin and get message count
  useEffect(() => {
    // Check if user is admin (you can modify this logic)
    const checkAdmin = () => {
      // Simple admin check - you can make this more sophisticated
      return userName === 'admin' || userName === 'Admin'
    }

    const getMessagesToday = () => {
      const stored = localStorage.getItem('chatUsage')
      if (!stored) return 0
      const { date, count } = JSON.parse(stored)
      const today = new Date().toDateString()
      return date === today ? count : 0
    }

    setIsAdmin(checkAdmin())
    const todayCount = getMessagesToday()
    setMessagesRemaining(isAdmin ? 999 : 5 - todayCount)
  }, [userName])

  const incrementMessagesToday = () => {
    if (isAdmin) return

    const stored = localStorage.getItem('chatUsage')
    const today = new Date().toDateString()
    
    if (stored) {
      const { date, count } = JSON.parse(stored)
      if (date === today) {
        localStorage.setItem('chatUsage', JSON.stringify({ date, count: count + 1 }))
      } else {
        localStorage.setItem('chatUsage', JSON.stringify({ date: today, count: 1 }))
      }
    } else {
      localStorage.setItem('chatUsage', JSON.stringify({ date: today, count: 1 }))
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    if (!isAdmin && messagesRemaining <= 0) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "You've reached your daily limit of 5 messages. Upgrade to premium for unlimited chat!",
        timestamp: new Date().toISOString()
      }])
      return
    }

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Create context about the scanned image
      let context = ""
      if (imagePreview && ingredients) {
        const ingredientList = ingredients.ingredients?.map(ing => ing.name).join(', ') || 'No ingredients detected'
        context = `The user scanned a photo and these ingredients were detected: ${ingredientList}. The image shows what they have to work with.`
      } else if (imagePreview) {
        context = "The user scanned a photo but no ingredients were detected. They might need help identifying what's in the image."
      } else {
        context = "The user hasn't scanned any photos yet."
      }

      const prompt = `You are a friendly and helpful cooking assistant. The user is chatting about ingredients they scanned.

${context}

User's message: "${inputMessage}"

Respond helpfully about:
- Recipe ideas using their ingredients
- Cooking techniques and tips
- Ingredient substitutions
- Storage and preservation advice
- Meal planning suggestions

Be conversational, encouraging, and specific. If they haven't scanned ingredients, suggest they scan something first.

Keep responses concise but helpful (2-3 sentences max).`

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Recipee AI Chat'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-001',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      const aiMessage = {
        role: 'assistant',
        content: data.choices[0]?.message?.content || "I'm having trouble responding right now. Try again!",
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])
      
      if (!isAdmin) {
        incrementMessagesToday()
        setMessagesRemaining(prev => prev - 1)
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Try again in a moment!",
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <MessageCircle size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">AI Cooking Chat</h2>
              <p className="text-sm text-gray-500">
                {isAdmin ? 'Unlimited messages' : `${messagesRemaining}/5 messages today`}
              </p>
            </div>
          </div>
          {imagePreview && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Camera size={16} />
              <span>Photo scanned</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-blue-100 rounded-full p-6 mb-4">
              <ChefHat size={48} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Chat about your ingredients!</h3>
            <p className="text-gray-500 max-w-sm">
              {imagePreview 
                ? "Ask me about recipes, cooking tips, or ingredient substitutions for what you scanned!"
                : "Scan some ingredients first, then ask me anything about cooking with them!"
              }
            </p>
            {!imagePreview && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  💡 Tip: Go to Scanner, take a photo of ingredients, then come back to chat about them!
                </p>
              </div>
            )}
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-blue-500" />
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        {!isAdmin && messagesRemaining <= 0 && (
          <div className="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-orange-800">
              🚀 You've used all 5 free messages today! Upgrade to premium for unlimited chat.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              imagePreview 
                ? "Ask about recipes, cooking tips, substitutions..." 
                : "Scan ingredients first, then ask me anything!"
            }
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            disabled={!isAdmin && messagesRemaining <= 0}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading || (!isAdmin && messagesRemaining <= 0)}
            className="bg-blue-500 text-white rounded-xl px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatTab
