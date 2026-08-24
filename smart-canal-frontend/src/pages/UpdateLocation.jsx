import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'

const UpdateLocation = () => {
  const [searchParams] = useSearchParams()
  const nodeId = searchParams.get('node')
  const [status, setStatus] = useState('Getting GPS location...')
  const [coords, setCoords] = useState(null)

  useEffect(() => {
    if (!nodeId) {
      setStatus('❌ Invalid node ID')
      return
    }

    // Check if GPS is available
    if (!navigator.geolocation) {
      setStatus('❌ Geolocation is not supported by this browser')
      return
    }

    // Get GPS Location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ lat: latitude, lng: longitude })
        setStatus('✅ Location captured! Redirecting...')
        
        // Redirect back to admin page with coordinates
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
        {/* Icon */}
        <div className="text-6xl mb-4">
          {status.includes('✅') ? '📍' : status.includes('❌') ? '⚠️' : '📡'}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          {nodeId ? `Updating: ${nodeId}` : 'Invalid Request'}
        </h1>

        {/* Status Message */}
        <div className={`p-4 rounded-xl mb-4 text-sm font-medium ${
          status.includes('✅') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
          status.includes('❌') ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
          'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
        }`}>
          {status}
        </div>

        {/* Loading Spinner */}
        {!status.includes('✅') && !status.includes('❌') && (
          <div className="flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Coordinates Display */}
        {coords && (
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-gray-700 p-2 rounded-lg">
            Lat: {coords.lat.toFixed(6)} | Lng: {coords.lng.toFixed(6)}
          </div>
        )}

        {/* Manual Input (Fallback) */}
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
                  window.location.href = `/admin/locations?update=${nodeId}&lat=${lat}&lng=${lng}`
                }
              }}
              className="mt-2 w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Update Manually
            </button>
          </div>
        )}

        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
          {nodeId ? `Updating location for ${nodeId}` : 'Please scan a valid QR code'}
        </p>
      </motion.div>
    </div>
  )
}

export default UpdateLocation