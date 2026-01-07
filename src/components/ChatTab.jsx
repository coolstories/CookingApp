import { useState, useRef } from 'react'
import { Send, Camera, Image, MessageCircle, User, Bot, Loader2, X, Clock, ChefHat, Lightbulb, HelpCircle } from 'lucide-react'

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
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

function ChatTab({ scanHistory, isAdmin = false }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [chatImage, setChatImage] = useState(null)
  const [messagesRemaining, setMessagesRemaining] = useState(isAdmin ? 999 : DAILY_CHAT_LIMIT - getChatMessagesToday())
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addMessage = (message) => {
    setMessages(prev => [...prev, message])
    setTimeout(scrollToBottom, 100)
  }

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target.result
        setChatImage(imageData)
        setSelectedImage(imageData)
        addMessage({
          type: 'user',
          content: 'I uploaded this image. Can you tell me about it?',
          image: imageData,
          timestamp: new Date().toISOString()
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) handleImageUpload(file)
  }

  const useLastScan = () => {
    if (scanHistory.length > 0) {
      const lastScan = scanHistory[0]
      setChatImage(lastScan.image)
      setSelectedImage(lastScan.image)
      addMessage({
        type: 'user',
        content: 'I\'m asking about my last scanned image. Can you help me with it?',
        image: lastScan.image,
        timestamp: new Date().toISOString()
      })
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() && !chatImage) return
    if (!isAdmin && messagesRemaining <= 0) {
      addMessage({
        type: 'bot',
        content: 'You\'ve reached your daily chat limit of 5 messages. Upgrade to premium for unlimited conversations!',
        timestamp: new Date().toISOString()
      })
      return
    }

    const userMessage = inputMessage.trim() || 'Tell me about this image'
    setLoading(true)

    // Add user message
    addMessage({
      type: 'user',
      content: userMessage,
      image: chatImage || null,
      timestamp: new Date().toISOString()
    })

    setInputMessage('')

    try {
      let prompt = `You are a helpful cooking and food assistant. The user is chatting with you about food, ingredients, or cooking.`
      
      if (chatImage) {
        prompt += ` The user has shared an image. Please analyze it and provide helpful cooking-related advice.`
      }

      prompt += `\n\nUser message: "${userMessage}"`

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
            content: chatImage ? [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: chatImage
                }
              }
            ] : [{
              role: 'user',
              content: prompt
            }]
          }]
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      const botMessage = data.choices[0]?.message?.content || 'Sorry, I couldn\'t process that request.'

      addMessage({
        type: 'bot',
        content: botMessage,
        timestamp: new Date().toISOString()
      })

      if (!isAdmin) {
        const newCount = incrementChatMessagesToday()
        setMessagesRemaining(DAILY_CHAT_LIMIT - newCount)
      }

    } catch (error) {
      console.error('Chat error:', error)
      addMessage({
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setChatImage(null)
    setSelectedImage(null)
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const suggestedQuestions = [
    { icon: ChefHat, text: "What can I cook with this?" },
    { icon: Lightbulb, text: "Give me recipe ideas" },
    { icon: HelpCircle, text: "How should I store this?" },
    { icon: Clock, text: "How long will this last?" }
  ]

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <MessageCircle size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Cooking Chat</h2>
              <p className="text-sm text-gray-500">
                {isAdmin ? 'Unlimited messages' : `${messagesRemaining}/5 messages today`}
              </p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="bg-blue-100 rounded-full p-6 mb-4">
              <MessageCircle size={48} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Start a conversation!</h3>
            <p className="text-gray-500 mb-6 max-w-sm">Chat with AI about ingredients, recipes, or upload a food photo for analysis</p>
            
            {/* Quick Actions */}
            <div className="space-y-3 w-full max-w-xs">
              {scanHistory.length > 0 && (
                <button
                  onClick={useLastScan}
                  className="w-full bg-green-500 text-white rounded-xl p-3 flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                >
                  <Image size={20} />
                  Use Last Scanned Photo
                </button>
              )}
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-blue-500 text-white rounded-xl p-3 flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
              >
                <Camera size={20} />
                Upload Photo
              </button>
            </div>

            {/* Suggested Questions */}
            <div className="mt-8 w-full max-w-sm">
              <p className="text-sm text-gray-500 mb-3">Try asking:</p>
              <div className="grid grid-cols-2 gap-2">
                {suggestedQuestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputMessage(suggestion.text)}
                    className="bg-white border border-gray-200 rounded-lg p-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <suggestion.icon size={12} />
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`rounded-full p-2 flex-shrink-0 ${
                    message.type === 'user' ? 'bg-blue-500' : 'bg-gray-200'
                  }`}>
                    {message.type === 'user' ? (
                      <User size={16} className="text-white" />
                    ) : (
                      <Bot size={16} className="text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className={`rounded-2xl p-3 ${
                      message.type === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                      {message.image && (
                        <img
                          src={message.image}
                          alt="Shared image"
                          className="rounded-lg mb-2 max-w-full h-auto"
                          style={{ maxHeight: '200px' }}
                        />
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        {/* Current Image Display */}
        {selectedImage && (
          <div className="mb-3 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <img
              src={selectedImage}
              alt="Current chat image"
              className="w-12 h-12 object-cover rounded"
            />
            <span className="text-sm text-gray-600 flex-1">Image attached</span>
            <button
              onClick={() => {
                setSelectedImage(null)
                setChatImage(null)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Image size={20} />
          </button>

          {scanHistory.length > 0 && (
            <button
              onClick={useLastScan}
              className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
              title="Use last scanned photo"
            >
              <Camera size={20} />
            </button>
          )}

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about ingredients, recipes, or cooking..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
          />

          <button
            onClick={sendMessage}
            disabled={loading || (!inputMessage.trim() && !chatImage)}
            className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>

        {!isAdmin && messagesRemaining <= 1 && (
          <p className="text-xs text-orange-600 mt-2 text-center">
            {messagesRemaining === 0 ? 'Daily limit reached' : `${messagesRemaining} message remaining today`}
          </p>
        )}
      </div>
    </div>
  )
}

export default ChatTab