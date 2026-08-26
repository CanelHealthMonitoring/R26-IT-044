import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiMapPin, FiCopy, FiCheck, FiSmartphone, 
  FiRefreshCw, FiGlobe, FiWifi, FiEye,
  FiServer, FiActivity, FiAnchor, FiInfo,
  FiGrid, FiList, FiExternalLink, FiRotateCcw
} from 'react-icons/fi'
import QRCode from 'qrcode.react'
import { IMAGES } from '../assets/images'
import * as Ably from 'ably' // 🔥 Ably import

// ============================================================
// DEFAULT NODE COORDINATES
// ============================================================
const DEFAULT_NODES = {
  'Sensor01': { lat: 7.1395, lng: 80.0408, label: 'Sensor Node 01', type: 'sensor' },
  'Sensor02': { lat: 7.1368, lng: 80.0415, label: 'Sensor Node 02', type: 'sensor' },
  'TransportA': { lat: 7.1396, lng: 80.0412, label: 'Transport Node A', type: 'transport' },
  'TransportB': { lat: 7.1383, lng: 80.0413, label: 'Transport Node B', type: 'transport' },
  'TransportC': { lat: 7.1370, lng: 80.0419, label: 'Transport Node C', type: 'transport' },
  'BaseStation': { lat: 7.1364, lng: 80.0428, label: 'Base Station', type: 'base' }
}

// ============================================================
// WebSocket URL
// ============================================================
const WS_URL = 'wss://zerg0hkzgi.execute-api.eu-north-1.amazonaws.com/production/'

// ============================================================
// MAIN COMPONENT
// ============================================================
const AdminNodeLocations = () => {
  const [nodes, setNodes] = useState(() => {
    const saved = localStorage.getItem('node_locations')
    return saved ? JSON.parse(saved) : DEFAULT_NODES
  })
  const [copiedId, setCopiedId] = useState(null)
  const [totalUpdated, setTotalUpdated] = useState(0)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [activeView, setActiveView] = useState('nodes')
  const [isResetting, setIsResetting] = useState(false)
  const wsSocketRef = useRef(null)

  // ============================================================
  // 🔥 ABLY LISTENER - Admin page එක real-time update වෙන්න
  // ============================================================
  useEffect(() => {
    // ඔබගේ Ably API Key එක මෙතන දාන්න
    const ably = new Ably.Realtime('YOUR_ABLY_API_KEY_HERE')
    const channel = ably.channels.get('canal-updates')

    channel.subscribe('location-changed', (message) => {
      const data = message.data
      console.log('📍 ABLY Location Update Received in Admin:', data)

      setNodes(prev => {
        const updated = { ...prev }
        if (updated[data.nodeId]) {
          updated[data.nodeId] = { ...updated[data.nodeId], lat: data.lat, lng: data.lng }
          localStorage.setItem('node_locations', JSON.stringify(updated))
        }
        return updated
      })
    })

    return () => {
      ably.close()
    }
  }, [])

  // Update count
  useEffect(() => {
    let count = 0
    Object.keys(DEFAULT_NODES).forEach(id => {
      if (nodes[id] && DEFAULT_NODES[id]) {
        if (nodes[id].lat !== DEFAULT_NODES[id].lat || nodes[id].lng !== DEFAULT_NODES[id].lng) {
          count++
        }
      }
    })
    setTotalUpdated(count)
  }, [nodes])

  // URL params handler (Phone redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const nodeId = params.get('update')
    const lat = params.get('lat')
    const lng = params.get('lng')
    
    if (nodeId && lat && lng) {
      const updated = {
        ...nodes,
        [nodeId]: { ...nodes[nodeId], lat: parseFloat(lat), lng: parseFloat(lng) }
      }
      setNodes(updated)
      localStorage.setItem('node_locations', JSON.stringify(updated))
      window.history.replaceState({}, document.title, window.location.pathname)
      
      // Toast
      const toast = document.createElement('div')
      toast.className = 'fixed top-6 right-6 z-50 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-500/40 flex items-center gap-3 border border-white/20 animate-slide-in-right'
      toast.innerHTML = `
        <span class="text-2xl">📍</span>
        <div>
          <p class="font-bold text-sm">${nodes[nodeId]?.label || nodeId}</p>
          <p class="text-xs opacity-90">Location updated successfully!</p>
        </div>
      `
      document.body.appendChild(toast)
      setTimeout(() => {
        toast.style.opacity = '0'
        toast.style.transform = 'translateX(100px)'
        toast.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        setTimeout(() => toast.remove(), 600)
      }, 3000)
      
      setTimeout(() => window.location.reload(), 500)
    }
  }, [])

  // ============================================================
  // RESET FUNCTION
  // ============================================================
  const resetLocations = () => {
    if (isResetting) return
    
    // Confirm before reset
    if (!window.confirm('⚠️ Are you sure you want to reset all node locations to default values?')) {
      return
    }

    setIsResetting(true)

    try {
      // 1. Reset to default values
      setNodes(DEFAULT_NODES)
      
      // 2. Update localStorage
      localStorage.setItem('node_locations', JSON.stringify(DEFAULT_NODES))
      
      // 3. Broadcast reset via WebSocket
      if (wsSocketRef.current?.readyState === WebSocket.OPEN) {
        wsSocketRef.current.send(JSON.stringify({
          type: 'location-reset',
          timestamp: Date.now()
        }))
      }

      // 4. Show success toast
      const toast = document.createElement('div')
      toast.className = 'fixed top-6 right-6 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-amber-500/40 flex items-center gap-3 border border-white/20 animate-slide-in-right'
      toast.innerHTML = `
        <span class="text-2xl">🔄</span>
        <div>
          <p class="font-bold text-sm">All locations reset!</p>
          <p class="text-xs opacity-90">All nodes restored to default positions</p>
        </div>
      `
      document.body.appendChild(toast)
      setTimeout(() => {
        toast.style.opacity = '0'
        toast.style.transform = 'translateX(100px)'
        toast.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        setTimeout(() => toast.remove(), 600)
      }, 3000)

      // 5. Force refresh of MapView via storage event
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'node_locations',
        newValue: JSON.stringify(DEFAULT_NODES)
      }))

    } catch (err) {
      console.error('Reset error:', err)
    } finally {
      setIsResetting(false)
    }
  }

  // WebSocket Listener
  useEffect(() => {
    if (activeView !== 'nodes') return

    try {
      const socket = new WebSocket(WS_URL)
      wsSocketRef.current = socket

      socket.onopen = () => console.log('✅ WebSocket Connected (Admin)')
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'location-update') {
            console.log('📍 Location update received:', data.nodeId)
            setNodes(prev => {
              const updated = { ...prev }
              if (updated[data.nodeId]) {
                updated[data.nodeId] = { ...updated[data.nodeId], lat: data.lat, lng: data.lng }
                localStorage.setItem('node_locations', JSON.stringify(updated))
              }
              return updated
            })
          }
          
          // Handle reset broadcast from other tabs
          if (data.type === 'location-reset') {
            console.log('🔄 Reset broadcast received')
            setNodes(DEFAULT_NODES)
            localStorage.setItem('node_locations', JSON.stringify(DEFAULT_NODES))
          }
        } catch (e) { console.error('Parse error:', e) }
      }
      socket.onerror = (err) => console.error('WebSocket Error:', err)
      socket.onclose = () => console.log('WebSocket Closed')

      return () => { if (wsSocketRef.current) wsSocketRef.current.close() }
    } catch (e) { console.error('WebSocket connection failed:', e) }
  }, [activeView])

  const getQRUrl = (nodeId) => `http://13.49.200.248/update-location?node=${nodeId}`

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getNodeIcon = (type) => {
    if (type === 'sensor') return '🟢'
    if (type === 'transport') return '🔵'
    return '🔴'
  }

  const getNodeBadge = (type) => {
    if (type === 'sensor') return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
    if (type === 'transport') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  }

  const getTypeIcon = (type) => {
    if (type === 'sensor') return <FiServer className="text-emerald-500" size={16} />
    if (type === 'transport') return <FiActivity className="text-blue-500" size={16} />
    return <FiAnchor className="text-red-500" size={16} />
  }

  const getTypeColor = (type) => {
    if (type === 'sensor') return 'emerald'
    if (type === 'transport') return 'blue'
    return 'red'
  }

  const getTypeBg = (type) => {
    if (type === 'sensor') return 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-700/30'
    if (type === 'transport') return 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200/50 dark:border-blue-700/30'
    return 'bg-red-50/50 dark:bg-red-900/10 border-red-200/50 dark:border-red-700/30'
  }

  const groupedNodes = {
    sensor: Object.entries(nodes).filter(([id, node]) => node.type === 'sensor'),
    transport: Object.entries(nodes).filter(([id, node]) => node.type === 'transport'),
    base: Object.entries(nodes).filter(([id, node]) => node.type === 'base')
  }

  const getTypeTitle = (type) => {
    if (type === 'sensor') return 'Sensor Nodes'
    if (type === 'transport') return 'Transport Nodes'
    return 'Base Station'
  }

  const getTypeDescription = (type) => {
    if (type === 'sensor') return 'Environmental data collection points'
    if (type === 'transport') return 'Data relay nodes in the mesh network'
    return 'Central data aggregation hub'
  }

  const statCards = [
    { icon: FiMapPin, label: 'Total Nodes', value: Object.keys(nodes).length, color: 'emerald' },
    { icon: FiGlobe, label: 'Updated', value: totalUpdated, color: 'blue' },
    { icon: FiRefreshCw, label: 'Default', value: Object.keys(nodes).length - totalUpdated, color: 'purple' },
    { icon: FiWifi, label: 'Status', value: 'Live', color: 'emerald' }
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 p-4 md:p-6 transition-colors duration-300">
      
      {/* ===== HERO BANNER ===== */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative rounded-3xl overflow-hidden mb-8"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src={IMAGES.mapBg || 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200'} 
            alt="Node Locations" 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/85 via-emerald-800/70 to-transparent" />
        </div>
        <div className="relative z-10 p-6 md:p-10 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-300 mb-2">
                <FiMapPin className="text-emerald-400" />
                <span>📍 Node Location Manager</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  {Object.keys(nodes).length} Nodes
                </span>
                {totalUpdated > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/30 text-amber-200 border border-amber-400/30">
                    {totalUpdated} Updated
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Node Location Setup
              </h1>
              <p className="mt-2 text-white/80 max-w-lg text-sm leading-relaxed">
                Scan QR codes with your phone to update node locations via GPS
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* ===== RESET BUTTON ===== */}
              <button
                onClick={resetLocations}
                disabled={isResetting}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg ${
                  isResetting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/30 hover:shadow-amber-500/50'
                }`}
              >
                <FiRotateCcw className={isResetting ? 'animate-spin' : ''} size={16} />
                {isResetting ? 'Resetting...' : 'Reset All'}
              </button>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10">
                <FiSmartphone className="text-emerald-300" />
                <span className="text-sm font-medium text-white/90">Phone Setup</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== STATS CARDS ===== */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={idx}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.06 + idx * 0.05 }}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  <Icon className="text-lg" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* ===== VIEW TOGGLE ===== */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('nodes')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeView === 'nodes' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'bg-white dark:bg-gray-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-gray-700'
            }`}
          >
            <FiMapPin className="inline mr-2" size={14} />
            Nodes
          </button>
          <button
            onClick={() => setActiveView('instructions')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeView === 'instructions' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white dark:bg-gray-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-gray-700'
            }`}
          >
            <FiInfo className="inline mr-2" size={14} />
            Instructions
          </button>
        </div>

        {/* View Mode Toggle - Grid/List */}
        {activeView === 'nodes' && (
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="Grid view"
            >
              <FiGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              title="List view"
            >
              <FiList size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ===== VIEW: NODES ===== */}
      <AnimatePresence mode="wait">
        {activeView === 'nodes' && (
          <motion.div
            key="nodes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {['sensor', 'transport', 'base'].map((type, groupIndex) => {
              const items = groupedNodes[type]
              if (items.length === 0) return null
              const typeColor = getTypeColor(type)
              const typeBg = getTypeBg(type)

              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.08 }}
                  className={`mb-6 rounded-2xl border ${typeBg} p-4 md:p-5`}
                >
                  {/* Group Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-xl bg-${typeColor}-100 dark:bg-${typeColor}-900/30 text-${typeColor}-600 dark:text-${typeColor}-400`}>
                      {getTypeIcon(type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 dark:text-white">{getTypeTitle(type)}</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{getTypeDescription(type)}</p>
                    </div>
                    <span className={`ml-auto text-xs font-medium px-2.5 py-0.5 rounded-full bg-${typeColor}-100 dark:bg-${typeColor}-900/30 text-${typeColor}-700 dark:text-${typeColor}-300`}>
                      {items.length} Nodes
                    </span>
                  </div>

                  {/* Nodes Grid */}
                  <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
                    {items.map(([id, node], index) => {
                      const qrUrl = getQRUrl(id)
                      const currentCoords = `${node.lat.toFixed(6)}, ${node.lng.toFixed(6)}`
                      const isDefault = DEFAULT_NODES[id] && 
                        node.lat === DEFAULT_NODES[id].lat && 
                        node.lng === DEFAULT_NODES[id].lng
                      const nodeBadge = getNodeBadge(node.type)

                      return (
                        <motion.div
                          key={id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          whileHover={{ y: -4 }}
                          className={`bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-all duration-300 ${viewMode === 'list' ? 'flex items-center gap-4' : ''}`}
                        >
                          {viewMode === 'list' ? (
                            // === LIST VIEW ===
                            <>
                              <div className="flex-shrink-0 flex items-center gap-3 min-w-[140px]">
                                <span className="text-lg">{getNodeIcon(node.type)}</span>
                                <div>
                                  <p className="font-medium text-slate-800 dark:text-white text-sm">{node.label}</p>
                                  <span className={`text-[10px] font-medium ${nodeBadge}`}>{node.type.toUpperCase()}</span>
                                </div>
                              </div>

                              <div className="flex-1 flex items-center gap-4 flex-wrap">
                                {/* QR Code */}
                                <div className="bg-white dark:bg-gray-900 p-2 rounded-lg border border-slate-200 dark:border-gray-600">
                                  <QRCode value={qrUrl} size={80} level="H" includeMargin={true} fgColor="#1e293b" bgColor="#ffffff" />
                                </div>

                                {/* Location */}
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                  📍 {currentCoords}
                                  <span className="ml-2 text-[10px] text-slate-400 dark:text-slate-500">
                                    {isDefault ? '(Default)' : '(Custom)'}
                                  </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 ml-auto">
                                  <button
                                    onClick={() => copyToClipboard(qrUrl, id)}
                                    className="p-1.5 bg-slate-100 dark:bg-gray-700/50 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-lg text-slate-600 dark:text-slate-300 transition-colors"
                                  >
                                    {copiedId === id ? <FiCheck className="text-emerald-500" size={14} /> : <FiCopy size={14} />}
                                  </button>
                                  <button
                                    onClick={() => window.open(qrUrl, '_blank')}
                                    className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                                  >
                                    <FiExternalLink size={14} />
                                  </button>
                                </div>
                              </div>
                            </>
                          ) : (
                            // === GRID VIEW ===
                            <>
                              {/* Header */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{getNodeIcon(node.type)}</span>
                                  <span className="font-medium text-slate-800 dark:text-white text-sm">{node.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isDefault ? 'bg-slate-300 dark:bg-slate-600' : 'bg-emerald-400 animate-pulse'}`} />
                                  <span className={`text-[9px] ${isDefault ? 'text-slate-400 dark:text-slate-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {isDefault ? 'Default' : 'Custom'}
                                  </span>
                                </div>
                              </div>

                              {/* QR Code - Always visible */}
                              <div className="flex justify-center py-2">
                                <div className="bg-white dark:bg-gray-900 p-3 rounded-xl border border-slate-200 dark:border-gray-600">
                                  <QRCode value={qrUrl} size={110} level="H" includeMargin={true} fgColor="#1e293b" bgColor="#ffffff" />
                                </div>
                              </div>

                              {/* Location */}
                              <div className="bg-slate-50 dark:bg-gray-700/30 rounded-lg p-2 mb-2">
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
                                  📍 {currentCoords}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2">
                                <button
                                  onClick={() => copyToClipboard(qrUrl, id)}
                                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-gray-700/50 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
                                >
                                  {copiedId === id ? (
                                    <><FiCheck className="text-emerald-500" size={12} /> <span className="text-emerald-600 dark:text-emerald-400">Copied!</span></>
                                  ) : (
                                    <><FiCopy size={12} /> Copy</>
                                  )}
                                </button>
                                <button
                                  onClick={() => window.open(qrUrl, '_blank')}
                                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                                >
                                  <FiEye size={12} />
                                  Open
                                </button>
                              </div>
                            </>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== VIEW: INSTRUCTIONS ===== */}
      <AnimatePresence mode="wait">
        {activeView === 'instructions' && (
          <motion.div
            key="instructions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/10 dark:to-teal-900/10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <FiSmartphone className="text-lg" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                  How to Update Node Locations
                </h3>
                <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  4 Steps
                </span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { step: '1', title: 'Open on Phone', desc: 'Open this page on your phone browser', icon: '📱' },
                  { step: '2', title: 'Scan QR Code', desc: 'Scan the QR for the node you want', icon: '📷' },
                  { step: '3', title: 'Allow GPS', desc: 'Grant location permission when prompted', icon: '📍' },
                  { step: '4', title: 'Auto-Update', desc: 'Location updates instantly on map', icon: '🔄' }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-gray-700/30 rounded-xl p-4 border border-slate-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-700 dark:text-slate-200">{item.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700/30 flex items-start gap-2">
                <span className="text-lg">💡</span>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  For local development, ensure PC and phone are on the same Wi-Fi network.
                </p>
              </div>

              {/* Reset Info */}
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700/30 flex items-start gap-2">
                <span className="text-lg">🔄</span>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Click the <strong>"Reset All"</strong> button in the header to restore all nodes to default locations.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== FOOTER ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-gray-700 pt-6"
      >
        <p className="flex items-center justify-center gap-2 flex-wrap">
          <span>© 2026 CanalIQ</span>
          <span className="hidden sm:inline">•</span>
          <span>Node Location Manager</span>
          <span className="hidden sm:inline">•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {Object.keys(nodes).length} Nodes
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="text-slate-400 dark:text-slate-500">
            {totalUpdated > 0 ? `${totalUpdated} updated` : 'Default locations'}
          </span>
        </p>
      </motion.div>
    </div>
  )
}

export default AdminNodeLocations