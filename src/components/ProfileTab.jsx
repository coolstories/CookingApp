import { useState } from 'react'
import { User, Settings, Bell, HelpCircle, Shield, LogOut, ChevronRight, Camera, X } from 'lucide-react'

function ProfileTab({ preferences, setPreferences }) {
  const [selectedMenu, setSelectedMenu] = useState(null)

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

  const stats = [
    { label: 'Scans', value: '0' },
    { label: 'Saved', value: '0' },
    { label: 'Recipes', value: '0' }
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
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <User size={36} className="text-white" />
            </div>
            <button className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-lg border border-gray-200 active:scale-90 transition-transform">
              <Camera size={14} className="text-gray-600" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">Guest User</h2>
            <p className="text-gray-500 text-sm">Sign in to save your data</p>
            <button className="mt-2 text-blue-500 text-sm font-semibold active:opacity-70">Create Account</button>
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

      <button className="w-full bg-white rounded-2xl p-4 flex items-center justify-center gap-2 text-red-500 font-medium active:bg-gray-50 transition-colors">
        <LogOut size={20} />
        <span>Sign Out</span>
      </button>

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
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm text-gray-700">Recipe recommendations</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm text-gray-700">Cooking tips</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-sm text-gray-700">Weekly digest</span>
                </label>
              </div>
            )}

            {selectedMenu.id === 'settings' && (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">Theme</p>
                  <select className="w-full mt-2 p-2 border border-gray-200 rounded-lg text-sm">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>Auto</option>
                  </select>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">Measurement Units</p>
                  <select className="w-full mt-2 p-2 border border-gray-200 rounded-lg text-sm">
                    <option>Metric (g, ml)</option>
                    <option>Imperial (oz, cups)</option>
                  </select>
                </div>
              </div>
            )}

            {selectedMenu.id === 'help' && (
              <div className="space-y-3">
                <button className="w-full p-3 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100">
                  View FAQ
                </button>
                <button className="w-full p-3 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100">
                  Contact Support
                </button>
                <button className="w-full p-3 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100">
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
