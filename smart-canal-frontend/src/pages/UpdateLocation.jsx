import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import * as Ably from 'ably' // 🔥 Ably import

// ============================================================
// WebSocket URL (Same as other pages)
// ============================================================
const WS_URL = 'wss://zerg0hkzgi.execute-api.eu-north-1.amazonaws.com/production/'

const UpdateLocation = () => {
  const [searchParams] = useSearchParams()
  const nodeId = searchParams.get('node')
  const [status, setStatus] = useState('Getting GPS location...')
  const [coords, setCoords] = useState(null)
  const socketRef = useRef(null)
  const [wsConnected, setWsConnected] = useState(false)
  
  // 🔥 Ably ref
  const ablyRef = useRef(null)

  // ===== Ably Client Initialization (Phone) =====
  useEffect(() => {
    // ඔබගේ Ably API Key එක මෙතන දාන්න
    ablyRef.current = new Ably.Realtime('YOUR_ABLY_API_KEY_HERE')
    console.log('✅ Ably Client Ready (Phone)')

    return () => {
      if (ablyRef.current) ablyRef.current.close()
    }
  }, [])

  // ===== WebSocket Connection (for broadcasting) =====
  useEffect(() => {
    if (!nodeId) return

    try {
      const socket = new WebSocket(WS_URL)
      socketRef.current = socket

      socket.onopen = () => {
        console.log('✅ WebSocket Connected (Phone - Update)')
        setWsConnected(true)
      }

      socket.onerror = (err) => {
        console.error('WebSocket Error:', err)
        setWsConnected(false)
      }

      socket.onclose = () => {
        console.log('WebSocket Closed (Phone)')
        setWsConnected(false)
      }

      return () => {
        if (socketRef.current) {
          socketRef.current.close()
        }
      }
    } catch (e) {
      console.error('WebSocket connection failed:', e)
    }
  }, [nodeId])

  // ===== Broadcast Location via WebSocket + Ably =====
  const broadcastLocation = (nodeId, lat, lng) => {
    // 1. WebSocket (පරණ එක)
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type: 'location-update',
        nodeId: nodeId,
        lat: lat,
        lng: lng
      })
      socketRef.current.send(message)
      console.log('📡 WebSocket broadcast sent:', message)
    } else {
      console.warn('⚠️ WebSocket not connected, cannot broadcast')
    }

    // 2. 🔥🔥 ABLY - මෙයයි MAIN එක
    if (ablyRef.current) {
      const channel = ablyRef.current.channels.get('canal-updates')
      channel.publish('location-changed', {
        nodeId: nodeId,
        lat: lat,
        lng: lng,
        timestamp: Date.now()
      })
      console.log('✅ Ably broadcast sent!', nodeId, lat, lng)
    }
  }

  // ===== Save to localStorage =====
  const saveToLocalStorage = (nodeId, lat, lng) => {
    const saved = localStorage.getItem('node_locations')
    const nodes = saved ? JSON.parse(saved) : {}
    
    // Load default nodes if empty
    const DEFAULT_NODES = {
      'Sensor01': { lat: 7.1395, lng: 80.0408, label: 'Sensor Node 01', type: 'sensor' },
      'Sensor02': { lat: 7.1368, lng: 80.0415, label: 'Sensor Node 02', type: 'sensor' },
      'TransportA': { lat: 7.1396, lng: 80.0412, label: 'Transport Node A', type: 'transport' },
      'TransportB': { lat: 7.1383, lng: 80.0413, label: 'Transport Node B', type: 'transport' },
      'TransportC': { lat: 7.1370, lng: 80.0419, label: 'Transport Node C', type: 'transport' },
      'BaseStation': { lat: 7.1364, lng: 80.0428, label: 'Base Station', type: 'base' }
    }

    const allNodes = { ...DEFAULT_NODES, ...nodes }
    if (allNodes[nodeId]) {
      allNodes[nodeId] = {
        ...allNodes[nodeId],
        lat: lat,
        lng: lng
      }
    } else {
      allNodes[nodeId] = {
        label: nodeId,
        type: 'unknown',
        lat: lat,
        lng: lng
      }
    }

    localStorage.setItem('node_locations', JSON.stringify(allNodes))
    console.log('💾 Saved to localStorage:', nodeId, lat, lng)
  }

  // ===== Main GPS Logic =====
  useEffect(() => {
    if (!nodeId) {
      setStatus('❌ Invalid node ID')
      return
    }

    if (!navigator.geolocation) {
      setStatus('❌ Geolocation is not supported by this browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ lat: latitude, lng: longitude })
        
        // 1. Save to localStorage
        saveToLocalStorage(nodeId, latitude, longitude)
        
        // 2. Broadcast via WebSocket + Ably
        broadcastLocation(nodeId, latitude, longitude)
        
        setStatus('✅ Location captured! Redirecting...')
        
        // 3. Redirect back to admin page with coordinates
        setTimeout(() => {
          const redirectUrl = `/admin/locations?update=${nodeId}&lat=${latitude}&lng=${longitude}`
          window.location.href = redirectUrl
        }, 1500)
      },
      (error) => {
        console.error('GPS Error:', error)
        setStatus(`❌ GPS Error: ${error.message}. Please enable location services.`)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }, [nodeId])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-slate-200 dark:border-gray-700"
      >
        <div className="text-6xl mb-4">
          {status.includes('✅') ? '📍' : status.includes('❌') ? '⚠️' : '📡'}
        </div>

        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          {nodeId ? `Updating: ${nodeId}` : 'Invalid Request'}
        </h1>

        <div className={`p-4 rounded-xl mb-4 text-sm font-medium ${
          status.includes('✅') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
          status.includes('❌') ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
          'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
        }`}>
          {status}
        </div>

        {!status.includes('✅') && !status.includes('❌') && (
          <div className="flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {coords && (
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-gray-700 p-2 rounded-lg">
            Lat: {coords.lat.toFixed(6)} | Lng: {coords.lng.toFixed(6)}
          </div>
        )}

        {status.includes('❌') && (
          <div className="mt-4 text-left">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Manual Entry (Fallback):</p>
            <div className="flex gap-2">
              <input
                id="manualLat"
                type="text"
                placeholder="Latitude"
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm"
              />
              <input
                id="manualLng"
                type="text"
                placeholder="Longitude"
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg text-sm"
              />
            </div>
            <button
              onClick={() => {
                const lat = document.getElementById('manualLat').value
                const lng = document.getElementById('manualLng').value
                if (lat && lng) {
                  // Save manually
                  saveToLocalStorage(nodeId, parseFloat(lat), parseFloat(lng))
                  broadcastLocation(nodeId, parseFloat(lat), parseFloat(lng))
                  window.location.href = `/admin/locations?update=${nodeId}&lat=${lat}&lng=${lng}`
                }
              }}
              className="mt-2 w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Update Manually
            </button>
          </div>
        )}

        {/* WebSocket Status */}
        <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${wsConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
          {wsConnected ? '📡 Live broadcast enabled' : '📡 Broadcasting offline'}
        </div>

        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          {nodeId ? `Updating location for ${nodeId}` : 'Please scan a valid QR code'}
        </p>
      </motion.div>
    </div>
  )
}

export default UpdateLocation