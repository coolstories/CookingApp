import { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff, ChefHat } from 'lucide-react'

function Auth({ onAuthenticated }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const correctPassword = import.meta.env.VITE_APP_PASSWORD

  useEffect(() => {
    // Check if already authenticated
    const authStatus = localStorage.getItem('isAuthenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      onAuthenticated()
    }
  }, [onAuthenticated])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (password === correctPassword) {
      localStorage.setItem('isAuthenticated', 'true')
      setIsAuthenticated(true)
      onAuthenticated()
    } else {
      setError('Incorrect password. Please try again.')
      setPassword('')
    }
  }

  if (isAuthenticated) {
    return null // Don't render anything if authenticated
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30 mx-auto mb-4">
            <ChefHat size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Recipee</h1>
          <p className="text-white/80">Enter password to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Input */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-white/60" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-10 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/60 focus:bg-white/30 transition-all duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-white/60 hover:text-white/80" />
                  ) : (
                    <Eye size={20} className="text-white/60 hover:text-white/80" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
                <p className="text-red-100 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-white/90 transition-all duration-300 transform hover:scale-105"
            >
              Unlock Recipee
            </button>
          </form>

          {/* Hint */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-xs">
              Contact support if you need access
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth
