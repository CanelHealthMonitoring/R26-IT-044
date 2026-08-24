import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FiServer, FiCpu, FiHardDrive, FiActivity, FiCheckCircle,
  FiAlertTriangle, FiTrendingUp, FiAlertOctagon, FiZap, FiRefreshCw,
  FiDatabase, FiClock, FiGlobe, FiBarChart2, FiShield
} from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

const CLASS_MAP = {
  'Healthy': {
    color: '#10B981',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-500 dark:border-emerald-400',
    icon: FiCheckCircle,
    label: 'Healthy',
    meaning: 'System normal / No issues',
    gradient: 'from-emerald-400 to-teal-400'
  },
  'Slightly Degraded': {
    color: '#F59E0B',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-500 dark:border-amber-400',
    icon: FiAlertTriangle,
    label: 'Slightly Degraded',
    meaning: 'Small performance drop',
    gradient: 'from-amber-400 to-yellow-400'
  },
  'Slightly_Degraded': {
    color: '#F59E0B',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-500 dark:border-amber-400',
    icon: FiAlertTriangle,
    label: 'Slightly Degraded',
    meaning: 'Small performance drop',
    gradient: 'from-amber-400 to-yellow-400'
  },
  'Moderate Load': {
    color: '#F97316',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-500 dark:border-orange-400',
    icon: FiTrendingUp,
    label: 'Moderate Load',
    meaning: 'System under load',
    gradient: 'from-orange-400 to-red-400'
  },
  'Moderate_Load': {
    color: '#F97316',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-500 dark:border-orange-400',
    icon: FiTrendingUp,
    label: 'Moderate Load',
    meaning: 'System under load',
    gradient: 'from-orange-400 to-red-400'
  },
  'High Stress': {
    color: '#EF4444',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-500 dark:border-red-400',
    icon: FiAlertOctagon,
    label: 'High Stress',
    meaning: 'High risk condition',
    gradient: 'from-red-400 to-rose-400'
  },
  'High_Stress': {
    color: '#EF4444',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-500 dark:border-red-400',
    icon: FiAlertOctagon,
    label: 'High Stress',
    meaning: 'High risk condition',
    gradient: 'from-red-400 to-rose-400'
  },
  'Critical Failure': {
    color: '#B91C1C',
    bg: 'bg-red-100 dark:bg-red-900/40',
    border: 'border-red-700 dark:border-red-600',
    icon: FiZap,
    label: 'Critical Failure',
    meaning: 'System near crash',
    gradient: 'from-red-600 to-red-800'
  },
  'Critical_Failure': {
    color: '#B91C1C',
    bg: 'bg-red-100 dark:bg-red-900/40',
    border: 'border-red-700 dark:border-red-600',
    icon: FiZap,
    label: 'Critical Failure',
    meaning: 'System near crash',
    gradient: 'from-red-600 to-red-800'
  },
}

const ALL_METRICS = [
  { key: 'cpu_usage', icon: FiCpu, label: 'CPU Usage', color: '#06B6D4', unit: '%', max: 100 },
  { key: 'memory_usage', icon: FiCpu, label: 'Memory Usage', color: '#06B6D4', unit: '%', max: 100 },
  { key: 'disk_usage', icon: FiHardDrive, label: 'Disk Usage', color: '#06B6D4', unit: '%', max: 100 },
  { key: 'load_average', icon: FiActivity, label: 'Load Average', color: '#06B6D4', unit: '%', max: 100 },
  { key: 'query_response_time', icon: FiDatabase, label: 'Query Response', color: '#06B6D4', unit: 'ms', max: 500 },
  { key: 'active_connections', icon: FiGlobe, label: 'Active Connections', color: '#06B6D4', unit: '', max: 200 },
  { key: 'error_count', icon: FiAlertOctagon, label: 'Error Count', color: '#06B6D4', unit: '', max: 50 },
  { key: 'latency', icon: FiClock, label: 'Latency', color: '#06B6D4', unit: 'ms', max: 500 },
]

const timeSince = (date) => {
  if (!date) return 'Never'
  const seconds = Math.floor((new Date() - date) / 1000)
  if (seconds < 5) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  return `${Math.floor(seconds / 3600)}h ago`
}

const AdminDashboard = () => {
  const { t } = useTranslation()
  const [metrics, setMetrics] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [timeSinceUpdate, setTimeSinceUpdate] = useState('Just now')

  const fetchDiagnosis = async () => {
    setIsRefreshing(true)
    try {
      setError(null)
      const response = await fetch('http://13.63.240.147:5000/diagnose')
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      if (data.metrics && data.prediction) {
        setMetrics(data.metrics)
        setPrediction(data.prediction)
      } else {
        throw new Error('Invalid response format')
      }
      setLastUpdated(new Date(data.timestamp || Date.now()))
      setLoading(false)
    } catch (err) {
      console.error('Diagnosis error:', err)
      setError(err.message || 'Could not connect to ML API. Make sure Flask server is running on port 5000.')
      setLoading(false)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDiagnosis()
    const interval = setInterval(fetchDiagnosis, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSinceUpdate(timeSince(lastUpdated))
    }, 1000)
    return () => clearInterval(timer)
  }, [lastUpdated])

  const statusKey = prediction?.status || 'Unknown'
  const statusInfo = CLASS_MAP[statusKey] || CLASS_MAP['Healthy']

  const isCurrentStatus = (status) => status === prediction?.status

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-300">
      
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative rounded-3xl overflow-hidden mb-8"
      >
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200" 
            alt="ML Dashboard" 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/85 via-emerald-800/70 to-transparent" />
        </div>
        <div className="relative z-10 p-6 md:p-10 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-300 mb-2">
                <FiShield className="text-emerald-400" />
                <span>{t('admin.title')}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {t('admin.title')}
              </h1>
              <p className="mt-2 text-white/80 max-w-lg text-sm leading-relaxed">
                Real-time ML-powered system health monitoring · 
                {error ? ' 🔴 ' + t('dashboard.offline') : ' 🟢 Live Predictions'}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/10">
              <FiClock className="text-emerald-300" />
              <span className="text-sm font-medium text-white/90">
                {isRefreshing ? 'Analyzing...' : 'Auto 5s'}
              </span>
              {lastUpdated && (
                <span className="text-xs text-white/60 border-l border-white/20 pl-3">
                  {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-xl flex items-center gap-3 mb-6"
          >
            <FiAlertOctagon className="text-xl flex-shrink-0" />
            <span className="flex-1 text-sm">{error}</span>
            <button
              onClick={fetchDiagnosis}
              className="px-4 py-1.5 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className={`h-1.5 w-full bg-gradient-to-r ${statusInfo.gradient}`} />
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className={`p-4 rounded-2xl ${statusInfo.bg} border ${statusInfo.border} shrink-0`}>
                <statusInfo.icon className="text-4xl md:text-5xl" style={{ color: statusInfo.color }} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">PREDICTED STATUS</p>
                <div className="flex flex-wrap items-center justify-between gap-3 mt-1 w-full">
                  <h2 className="text-3xl md:text-4xl font-bold" style={{ color: statusInfo.color }}>
                    {loading && !prediction ? 'Analyzing...' : (prediction?.status || 'Unknown')}
                  </h2>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${statusInfo.border} ${statusInfo.bg} inline-flex items-center gap-1.5 shrink-0`}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusInfo.color }} />
                    {statusInfo.meaning}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${isRefreshing ? 'bg-blue-500 animate-pulse' : 'bg-emerald-400'}`} />
                  {isRefreshing ? '⏳ Analyzing...' : `Last diagnosis: ${lastUpdated?.toLocaleTimeString() || 'N/A'}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* HEALTH STATUS REFERENCE – HIGHLIGHT CURRENT */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg">📊</span>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">HEALTH STATUS REFERENCE</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(CLASS_MAP).map(([status, info]) => {
              if (status.includes('_')) return null
              const Icon = info.icon
              const isActive = isCurrentStatus(status) || isCurrentStatus(status.replace(' ', '_'))
              return (
                <motion.div
                  key={status}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-xl border transition-all duration-200 ${info.bg} ${info.border} ${
                    isActive ? 'ring-2 ring-offset-2 shadow-lg' : ''
                  }`}
                  style={isActive ? { ringColor: info.color, boxShadow: `0 0 0 2px ${info.color}40` } : {}}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`text-sm transition-transform ${isActive ? 'scale-125' : ''}`} style={{ color: info.color }} />
                    <span className="font-semibold text-xs" style={{ color: info.color }}>
                      {info.label}
                    </span>
                    {isActive && (
                      <span className="ml-auto text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-white/50 dark:bg-black/20 text-slate-600 dark:text-slate-300">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {info.meaning}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* SYSTEM METRICS */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-slate-400">
              <FiBarChart2 className="text-lg" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">Current System Metrics</h3>
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">8 Metrics</span>
            {lastUpdated && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto">Updated: {lastUpdated.toLocaleTimeString()}</span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading && !metrics ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-slate-100 dark:bg-gray-700 rounded-xl h-24 border border-slate-200 dark:border-gray-700" />
              ))
            ) : (
              ALL_METRICS.map((config, index) => {
                const value = metrics?.[config.key] ?? 0
                const displayValue = typeof value === 'number' ? value.toFixed(1) : value
                const Icon = config.icon
                const percentage = config.max ? Math.min(100, (value / config.max) * 100) : 0
                let statusColor = config.color
                if (percentage > 80) statusColor = '#EF4444'
                else if (percentage > 60) statusColor = '#F59E0B'

                return (
                  <motion.div
                    key={config.key}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-slate-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-gray-600 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className={`p-1.5 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 group-hover:scale-110 transition-transform`}>
                        <Icon className="text-sm" style={{ color: config.color }} />
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{config.label}</span>
                    </div>
                    <div className="flex items-end justify-center gap-1 mb-3">
                      <span className="text-2xl font-bold text-slate-800 dark:text-white leading-none">{displayValue}</span>
                      {config.unit && <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 pb-0.5">{config.unit}</span>}
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: statusColor }}
                      />
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {isRefreshing ? '🔄 Refreshing...' : '✅ All metrics are live'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {Object.keys(metrics || {}).length}/8 active
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-gray-700 pt-6"
      >
        <p className="flex items-center justify-center gap-2 flex-wrap">
          <span>© 2026 CanalIQ</span>
          <span className="hidden sm:inline">•</span>
          <span>ML Infrastructure Monitoring</span>
          <span className="hidden sm:inline">•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% Real AWS Data + ML</span>
          <span className="hidden sm:inline">•</span>
          <span className="text-slate-400 dark:text-slate-500">
            {lastUpdated ? `Last scan: ${lastUpdated.toLocaleString()}` : 'Waiting for data...'}
          </span>
        </p>
      </motion.div>
    </div>
  )
}

export default AdminDashboard