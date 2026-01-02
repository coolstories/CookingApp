import { useState, useEffect } from 'react'
import { User, Settings, Bell, HelpCircle, Shield, ChevronRight, Camera, X } from 'lucide-react'

function getScansToday() {
  const stored = localStorage.getItem('scanUsage')
  if (!stored) return 0
  const { date, count } = JSON.parse(stored)
  const today = new Date().toDateString()
  return date === today ? count : 0
}

function ProfileTab({ preferences, setPreferences, onRedoOnboarding }) {
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [userName, setUserName] = useState('Guest User')
  const [avatarImage, setAvatarImage] = useState(null)
  const [notifications, setNotifications] = useState({
    recipes: true,
    tips: true
  })
  const [settings, setSettings] = useState({
    theme: 'Light',
    units: 'Metric (g, ml)'
  })
  const [scansToday, setScansToday] = useState(getScansToday())

  // Load user name, avatar, and settings from localStorage on mount
  useEffect(() => {
    try {
      const storedUserName = localStorage.getItem('userName')
      if (storedUserName) {
        setUserName(storedUserName)
      }

      const storedAvatar = localStorage.getItem('userAvatar')
      if (storedAvatar) {
        setAvatarImage(storedAvatar)
      }

      const storedSettings = localStorage.getItem('appSettings')
      if (storedSettings) setSettings(JSON.parse(storedSettings))

      const storedNotifications = localStorage.getItem('appNotifications')
      if (storedNotifications) setNotifications(JSON.parse(storedNotifications))
    } catch (error) {
      console.warn('Error loading settings from localStorage:', error)
    }
    setScansToday(getScansToday())
  }, [])

  // Save avatar to localStorage whenever it changes
  useEffect(() => {
    try {
      if (avatarImage) {
        localStorage.setItem('userAvatar', avatarImage)
      }
    } catch (error) {
      console.warn('Error saving avatar to localStorage:', error)
    }
  }, [avatarImage])

  const handleAvatarChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings))
      // Apply theme to document
      if (settings.theme === 'Dark') {
        document.documentElement.classList.add('dark')
      } else if (settings.theme === 'Light') {
        document.documentElement.classList.remove('dark')
      } else {
        // Auto mode - check system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    } catch (error) {
      console.warn('Error saving settings to localStorage:', error)
    }
  }, [settings])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('appNotifications', JSON.stringify(notifications))
    } catch (error) {
      console.warn('Error saving notifications to localStorage:', error)
    }
  }, [notifications])

  const menuItems = [
    { 
      id: 'notifications', 
      title: 'Notifications', 
      icon: Bell, 
      color: 'bg-red-100', 
      iconColor: 'text-red-500',
      content: 'Enable notifications for new recipes and cooking tips'
    },
    { 
      id: 'settings', 
      title: 'Settings', 
      icon: Settings, 
      color: 'bg-gray-100', 
      iconColor: 'text-gray-500',
      content: 'Customize your app experience and preferences'
    },
    { 
      id: 'onboarding', 
      title: 'Redo Onboarding', 
      icon: User, 
      color: 'bg-blue-100', 
      iconColor: 'text-blue-500',
      content: 'Go through the welcome tutorial again to learn about Recipee features'
    },
    { 
      id: 'help', 
      title: 'Help & Support', 
      icon: HelpCircle, 
      color: 'bg-blue-100', 
      iconColor: 'text-blue-500',
      content: 'Get help with using Recipee and troubleshooting'
    },
    { 
      id: 'privacy', 
      title: 'Privacy Policy', 
      icon: Shield, 
      color: 'bg-green-100', 
      iconColor: 'text-green-500',
      content: 'Learn how we protect your data and privacy'
    }
  ]

  useEffect(() => {
    setScansToday(getScansToday())
  }, [])

  const stats = [
    { label: 'Scans Today', value: scansToday.toString() },
    { label: 'Recipes Found', value: '0' },
    { label: 'Favorites', value: '0' }
  ]

  const togglePreference = (id) => {
    setPreferences(preferences.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ))
  }

  return (
    <div className="p-4">
      <div className="safe-area-top pt-4 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
      </div>

      <div className="bg-white rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
              {avatarImage ? (
                <img 
                  src={avatarImage} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={36} className="text-white" />
              )}
            </div>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button 
              onClick={() => document.getElementById('avatar-upload').click()}
              className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-lg border border-gray-200 active:scale-90 transition-transform"
            >
              <Camera size={14} className="text-gray-600" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{userName}</h2>
            <p className="text-gray-500 text-sm">Welcome to Recipee!</p>
          </div>
        </div>

        <div className="flex justify-around mt-6 pt-6 border-t border-gray-100">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dietary Preferences */}
      <div className="bg-white rounded-2xl p-5 mb-4">
        <h3 className="font-bold text-gray-900 mb-4">Dietary Preferences</h3>
        <p className="text-gray-500 text-sm mb-4">These will be used when finding recipes</p>
        <div className="space-y-3">
          {preferences.map((pref) => (
            <div key={pref.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{pref.emoji}</span>
                <div>
                  <p className="font-medium text-gray-900">{pref.name}</p>
                  <p className="text-xs text-gray-500">{pref.description}</p>
                </div>
              </div>
              <button
                onClick={() => togglePreference(pref.id)}
                className={`w-12 h-7 rounded-full transition-colors ${
                  pref.enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform mx-1 ${
                  pref.enabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-2xl overflow-hidden mb-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setSelectedMenu(item)}
              className={`w-full p-4 flex items-center gap-3 active:bg-gray-50 transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className={`${item.color} rounded-xl p-2.5`}>
                <Icon className={item.iconColor} size={20} />
              </div>
              <span className="flex-1 text-left font-medium text-gray-900">{item.title}</span>
              <ChevronRight size={20} className="text-gray-300" />
            </button>
          )
        })}
      </div>

      <p className="text-center text-gray-400 text-xs mt-6">Recipee v1.0.0</p>

      {/* Menu Detail Modal */}
      {selectedMenu && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedMenu.title}</h2>
              <button onClick={() => setSelectedMenu(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className={`${selectedMenu.color} rounded-xl p-4 mb-4`}>
              {(() => {
                const Icon = selectedMenu.icon
                return <Icon className={selectedMenu.iconColor} size={32} />
              })()}
            </div>

            <p className="text-gray-700 mb-6">{selectedMenu.content}</p>

            {selectedMenu.id === 'notifications' && (
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.recipes}
                    onChange={(e) => setNotifications({...notifications, recipes: e.target.checked})}
                    className="w-4 h-4" 
                  />
                  <span className="text-sm text-gray-700">Recipe recommendations</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.tips}
                    onChange={(e) => setNotifications({...notifications, tips: e.target.checked})}
                    className="w-4 h-4" 
                  />
                  <span className="text-sm text-gray-700">Cooking tips</span>
                </label>
              </div>
            )}

            {selectedMenu.id === 'settings' && (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">Theme</p>
                  <select 
                    value={settings.theme}
                    onChange={(e) => setSettings({...settings, theme: e.target.value})}
                    className="w-full mt-2 p-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option>Light</option>
                    <option>Dark</option>
                    <option>Auto</option>
                  </select>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">Measurement Units</p>
                  <select 
                    value={settings.units}
                    onChange={(e) => setSettings({...settings, units: e.target.value})}
                    className="w-full mt-2 p-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option>Metric (g, ml)</option>
                    <option>Imperial (oz, cups)</option>
                  </select>
                </div>
              </div>
            )}

            {selectedMenu.id === 'onboarding' && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-900 mb-2">Welcome Tutorial</p>
                  <p className="text-sm text-gray-700 mb-4">
                    Go through the interactive onboarding experience to learn about all of Recipee's features:
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• How to scan ingredients with AI</p>
                    <p>• Discover 5 personalized recipes</p>
                    <p>• Set your dietary preferences</p>
                    <p>• Choose your favorite theme</p>
                    <p>• Get the most out of Recipee</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    localStorage.removeItem('hasCompletedOnboarding')
                    localStorage.removeItem('userName')
                    setSelectedMenu(null) // Close the popup first
                    setTimeout(() => onRedoOnboarding(), 100) // Then start onboarding
                  }}
                  className="w-full p-3 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Start Onboarding Tutorial
                </button>
              </div>
            )}

            {selectedMenu.id === 'help' && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold text-gray-900 mb-2">Frequently Asked Questions</p>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Q: How do I scan ingredients?</strong><br/>A: Go to Scanner tab, take a photo, and the AI will detect ingredients.</p>
                    <p><strong>Q: Can I manually add ingredients?</strong><br/>A: Yes, use the manual entry field in the Scanner tab.</p>
                    <p><strong>Q: How many scans per day?</strong><br/>A: 5 scans daily. Tap Scanner title 7 times for admin mode (unlimited).</p>
                  </div>
                </div>
                <button 
                  onClick={() => window.open('mailto:nirvaangoel2@gmail.com')}
                  className="w-full p-3 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Contact Support
                </button>
                <button 
                  onClick={() => window.open('mailto:nirvaangoel2@gmail.com?subject=Bug Report')}
                  className="w-full p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  Report a Bug
                </button>
              </div>
            )}

            {selectedMenu.id === 'privacy' && (
              <div className="space-y-3 text-sm text-gray-700">
                <p>• Your data is encrypted and stored securely</p>
                <p>• We never sell your personal information</p>
                <p>• You can delete your account anytime</p>
                <p>• Read our full privacy policy on our website</p>
              </div>
            )}

            <button
              onClick={() => setSelectedMenu(null)}
              className="w-full mt-6 bg-gray-100 text-gray-900 p-3 rounded-lg font-medium active:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileTab
