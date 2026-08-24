import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiMapPin, FiCopy, FiCheck, FiSmartphone, 
  FiRefreshCw, FiGlobe, FiWifi, FiEye, FiEyeOff,
  FiServer, FiActivity, FiAnchor, FiInfo, FiGrid,
  FiChevronRight, FiChevronLeft
} from 'react-icons/fi'
import QRCode from 'qrcode.react'
import { IMAGES } from '../assets/images'

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
// MAIN COMPONENT
// ============================================================
const AdminNodeLocations = () => {
  const [nodes, setNodes] = useState(() => {
    const saved = localStorage.getItem('node_locations')
    return saved ? JSON.parse(saved) : DEFAULT_NODES
  })
  const [copiedId, setCopiedId] = useState(null)
  const [totalUpdated, setTotalUpdated] = useState(0)
  const [showAllQRCodes, setShowAllQRCodes] = useState(false)
  const [revealedNodes, setRevealedNodes] = useState({})
  const [activeView, setActiveView] = useState('nodes')

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
      
      const toast = document.createElement('div')
      toast.className = 'fixed top-6 right-6 z-50 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-500/40 flex items-center gap-3 backdrop-blur-sm border border-white/20 animate-slide-in-right'
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

  const getQRUrl = (nodeId) => {
    return `http://13.49.200.248/update-location?node=${nodeId}`
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleAllQRCodes = () => {
    const newState = !showAllQRCodes
    setShowAllQRCodes(newState)
    if (!newState) {
      setRevealedNodes({})
    }
  }

  const toggleIndividualQR = (nodeId) => {
    setRevealedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }))
  }

  const isQRVisible = (nodeId) => {
    return showAllQRCodes || revealedNodes[nodeId]
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
    if (type === 'sensor') return <FiServer className="text-emerald-500" />
    if (type === 'transport') return <FiActivity className="text-blue-500" />
    return <FiAnchor className="text-red-500" />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6 transition-colors duration-300">
      
      {/* ===== HERO BANNER ===== */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative rounded-3xl overflow-hidden mb-8 shadow-2xl shadow-emerald-500/10"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200" 
            alt="Node Locations" 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-800/85 to-emerald-700/40 backdrop-blur-[2px]" />
        </div>
        <div className="relative z-10 p-8 md:p-12 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 text-sm font-medium text-emerald-300 mb-2">
                <FiMapPin className="text-emerald-400" />
                <span>📍 Node Location Manager</span>
                <span className="px-3 py-0.5 rounded-full text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 backdrop-blur-sm">
                  {Object.keys(nodes).length} Nodes
                </span>
                {totalUpdated > 0 && (
                  <span className="px-3 py-0.5 rounded-full text-[10px] bg-amber-500/30 text-amber-200 border border-amber-400/30 backdrop-blur-sm">
                    {totalUpdated} Updated
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                QR Code Location Setup
              </h1>
              <p className="mt-2 text-white/80 max-w-2xl text-sm leading-relaxed">
                Scan QR codes with your phone to update node locations via GPS.
                All changes are saved locally – no backend required.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-3 border border-white/10 shadow-lg shadow-black/10">
              <FiSmartphone className="text-emerald-300 text-xl" />
              <span className="text-sm font-medium">Phone Ready</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== STATS ROW ===== */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {statCards.map((stat, idx) => {
          const Icon = stat.icon
          const color = stat.color
          return (
            <motion.div
              key={idx}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.08 + idx * 0.06 }}
              whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
              className="group bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-gray-700/50 p-5 shadow-lg shadow-slate-200/20 dark:shadow-none transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 dark:hover:border-emerald-800/50"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="text-xl" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* ===== VIEW TOGGLE ===== */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 p-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-gray-700/50 shadow-sm">
          <button
            onClick={() => setActiveView('nodes')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              activeView === 'nodes' 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700'
            }`}
          >
            <FiMapPin size={16} />
            Node Locations
          </button>
          <button
            onClick={() => setActiveView('instructions')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              activeView === 'instructions' 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-700'
            }`}
          >
            <FiInfo size={16} />
            Instructions
          </button>
        </div>

        {/* Master QR Toggle */}
        {activeView === 'nodes' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={toggleAllQRCodes}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg ${
              showAllQRCodes 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/30' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-emerald-500/30'
            }`}
          >
            {showAllQRCodes ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            {showAllQRCodes ? 'Hide All QR Codes' : 'Show All QR Codes'}
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
              {Object.keys(nodes).length}
            </span>
          </motion.button>
        )}
      </div>

      {/* ===== VIEW: NODES ===== */}
      <AnimatePresence mode="wait">
        {activeView === 'nodes' && (
          <motion.div
            key="nodes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {['sensor', 'transport', 'base'].map((type, groupIndex) => {
              const items = groupedNodes[type]
              if (items.length === 0) return null
              const typeColor = getTypeColor(type)
              const typeBg = getTypeBg(type)

              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.1 }}
                  className={`mb-8 rounded-2xl border ${typeBg} p-6 backdrop-blur-sm transition-all duration-300`}
                >
                  {/* Group Header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`p-2.5 rounded-xl bg-${typeColor}-100 dark:bg-${typeColor}-900/30 text-${typeColor}-600 dark:text-${typeColor}-400`}>
                      {getTypeIcon(type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">{getTypeTitle(type)}</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{getTypeDescription(type)}</p>
                    </div>
                    <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full bg-${typeColor}-100 dark:bg-${typeColor}-900/30 text-${typeColor}-700 dark:text-${typeColor}-300`}>
                      {items.length} Nodes
                    </span>
                  </div>

                  {/* Node Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map(([id, node], index) => {
                      const qrUrl = getQRUrl(id)
                      const currentCoords = `${node.lat.toFixed(6)}, ${node.lng.toFixed(6)}`
                      const isDefault = DEFAULT_NODES[id] && 
                        node.lat === DEFAULT_NODES[id].lat && 
                        node.lng === DEFAULT_NODES[id].lng
                      const nodeBadge = getNodeBadge(node.type)
                      const isVisible = isQRVisible(id)

                      return (
                        <motion.div
                          key={id}
                          initial={{ scale: 0.96, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
                          whileHover={{ y: -6, transition: { duration: 0.2 } }}
                          className="group bg-white dark:bg-gray-800/80 rounded-2xl border border-slate-200/60 dark:border-gray-700/60 shadow-md hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden"
                        >
                          {/* Card Header */}
                          <div className="px-5 py-3.5 border-b border-slate-100 dark:border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-slate-50/80 to-transparent dark:from-gray-700/20">
                            <div className="flex items-center gap-2.5">
                              <span className="text-lg">{getNodeIcon(node.type)}</span>
                              <span className="font-semibold text-slate-800 dark:text-white text-sm">{node.label}</span>
                              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                                {id}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${isDefault ? 'bg-slate-300 dark:bg-slate-600' : 'bg-emerald-400 animate-pulse'}`} />
                              <span className={`text-[9px] font-medium ${isDefault ? 'text-slate-400 dark:text-slate-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {isDefault ? 'Default' : 'Custom'}
                              </span>
                              <button
                                onClick={() => toggleIndividualQR(id)}
                                className={`p-1 rounded-lg transition-all duration-200 hover:bg-slate-100 dark:hover:bg-gray-700 ${
                                  isVisible ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                                }`}
                                title={isVisible ? 'Hide QR Code' : 'Show QR Code'}
                              >
                                {isVisible ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                              </button>
                            </div>
                          </div>

                          {/* QR Code Area */}
                          <div className="px-5 py-4 flex justify-center">
                            <div className="relative bg-white dark:bg-gray-900/50 p-4 rounded-2xl border border-slate-200 dark:border-gray-600 transition-all duration-300 group-hover:border-emerald-300 dark:group-hover:border-emerald-500">
                              {isVisible ? (
                                <div className="relative">
                                  <QRCode
                                    value={qrUrl}
                                    size={130}
                                    level="H"
                                    includeMargin={true}
                                    fgColor="#1e293b"
                                    bgColor="#ffffff"
                                  />
                                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center backdrop-blur-sm">
                                    <FiMapPin className="text-emerald-500 text-[10px]" />
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center w-[130px] h-[130px] bg-slate-100/80 dark:bg-gray-700/50 rounded-xl border-2 border-dashed border-slate-300 dark:border-gray-600 transition-all duration-300 group-hover:border-emerald-300 dark:group-hover:border-emerald-500">
                                  <FiEyeOff className="text-slate-400 dark:text-slate-500 text-3xl mb-1.5" />
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Hidden</span>
                                  <span className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5 opacity-60">Click 👁️ to show</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Location */}
                          <div className="px-5 pb-2">
                            <div className="bg-slate-50 dark:bg-gray-700/30 rounded-lg px-3 py-2">
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                <FiMapPin size={10} />
                                {currentCoords}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="px-5 pb-5 flex gap-2">
                            <button
                              onClick={() => copyToClipboard(qrUrl, id)}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-gray-700/50 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition-all duration-200"
                            >
                              {copiedId === id ? (
                                <>
                                  <FiCheck className="text-emerald-500" size={14} />
                                  <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <FiCopy size={14} />
                                  Copy
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => window.open(qrUrl, '_blank')}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-medium transition-all duration-200 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40"
                            >
                              <FiEye size={14} />
                              Open
                            </button>
                          </div>
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 dark:border-gray-700/60 shadow-xl shadow-slate-200/20 dark:shadow-none overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/10 dark:to-teal-900/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <FiSmartphone className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    How to Update Node Locations
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Follow these 4 simple steps</p>
                </div>
                <span className="ml-auto text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-gray-700/70 px-3 py-1 rounded-full border border-slate-200 dark:border-gray-600">
                  Step-by-Step Guide
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { step: '01', title: 'Open on Phone', desc: 'Open this page on your phone browser. Ensure you are on the same network.', icon: '📱', color: 'emerald' },
                  { step: '02', title: 'Scan QR Code', desc: 'Scan the QR code for the node you want to update. Each node has its own unique code.', icon: '📷', color: 'blue' },
                  { step: '03', title: 'Allow GPS Access', desc: 'When prompted, grant location permission to the browser for accurate GPS.', icon: '📍', color: 'amber' },
                  { step: '04', title: 'Auto-Update', desc: 'The location will be captured and instantly reflected on the map view.', icon: '🔄', color: 'purple' }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1 }}
                    whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                    className="relative bg-slate-50/80 dark:bg-gray-700/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 dark:border-gray-700/60 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className={`absolute -top-3 -right-3 w-11 h-11 rounded-full bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center text-${item.color}-500 font-bold text-sm backdrop-blur-sm`}>
                      {item.step}
                    </div>
                    
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-16 h-16 rounded-2xl bg-${item.color}-100 dark:bg-${item.color}-900/30 flex items-center justify-center text-3xl mb-4 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                        {item.icon}
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-base mb-1.5">{item.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Tips Grid */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-amber-50/80 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700/30 flex items-start gap-3 hover:shadow-md transition-shadow">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Local Development</p>
                    <p className="text-xs text-amber-700/70 dark:text-amber-300/70">Ensure your PC and phone are connected to the same Wi-Fi network.</p>
                  </div>
                </div>
                <div className="p-4 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700/30 flex items-start gap-3 hover:shadow-md transition-shadow">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Production URL</p>
                    <p className="text-xs text-blue-700/70 dark:text-blue-300/70">QR codes use the deployed Lightsail URL for global access.</p>
                  </div>
                </div>
              </div>

              {/* Pro Tip */}
              <div className="mt-6 p-5 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-700/30 text-center">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">📍 Pro Tip:</span> After updating a node location, refresh the Map View page to see the new position instantly.
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
        <p className="flex items-center justify-center gap-3 flex-wrap">
          <span className="font-medium text-slate-600 dark:text-slate-300">© 2026 CanalIQ</span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
          <span>Node Location Manager</span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <FiMapPin size={12} />
            {Object.keys(nodes).length} Nodes Configured
          </span>
          <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
          <span className="text-slate-400 dark:text-slate-500">
            {totalUpdated > 0 ? `${totalUpdated} nodes updated` : 'All nodes at default locations'}
          </span>
        </p>
      </motion.div>
    </div>
  )
}

export default AdminNodeLocations