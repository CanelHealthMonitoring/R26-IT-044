import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FiHome, FiMap, FiBarChart2, FiFileText, FiShield, FiMapPin, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { IMAGES } from '../../assets/images'

const Sidebar = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const location = useLocation()

  // Collapse state – saved to localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed')
    return saved ? JSON.parse(saved) : false
  })

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebar_collapsed', JSON.stringify(newState))
  }

  const navItems = [
    { to: '/', icon: FiHome, label: t('navigation.dashboard') },
    { to: '/map', icon: FiMap, label: t('navigation.canalMap') },
    { to: '/season-analysis', icon: FiBarChart2, label: t('navigation.seasonAnalysis') },
    { to: '/report', icon: FiFileText, label: t('navigation.reports') },
  ]

  // Check if current path is /admin or /admin/locations
  const isMlActive = location.pathname === '/admin'
  const isQrActive = location.pathname === '/admin/locations'

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 flex flex-col h-full sticky top-0 z-20 overflow-hidden"
    >
      {/* ===== Brand + Collapse Toggle ===== */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-gray-200 dark:border-gray-700`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <img src={IMAGES.logo} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-bold text-2xl text-healthy">{t('appName')}</span>
          </div>
        )}
        {isCollapsed && (
          <img src={IMAGES.logo} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
        )}
        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
        </button>
      </div>

      {/* ===== Navigation ===== */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-healthy/20 text-healthy shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/80'
              } ${isCollapsed ? 'justify-center' : ''}`
            }
            title={isCollapsed ? label : ''}
          >
            <Icon className="text-lg" />
            {!isCollapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {/* ===== Admin Section ===== */}
        {user?.role === 'admin' && (
          <>
            {/* Divider to separate admin section */}
            {!isCollapsed && (
              <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
            )}
            {isCollapsed && (
              <div className="my-2 w-full h-px bg-gray-200 dark:bg-gray-700" />
            )}

            {/* ===== ML PREDICTIONS ===== */}
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive && location.pathname === '/admin'
                    ? 'bg-info/20 text-info shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/80'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
              title={isCollapsed ? t('navigation.mlPredictions') : ''}
            >
              <FiShield className="text-lg" />
              {!isCollapsed && <span>{t('navigation.mlPredictions')}</span>}
            </NavLink>

            {/* ===== QR LOCATIONS (Updated with Translation) ===== */}
            <NavLink
              to="/admin/locations"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive && location.pathname === '/admin/locations'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-700/80'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
              title={isCollapsed ? t('navigation.qrLocations') : ''}
            >
              <FiMapPin className="text-lg" />
              {!isCollapsed && <span>{t('navigation.qrLocations')}</span>}
            </NavLink>
          </>
        )}
      </nav>

      {/* ===== Footer ===== */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400 text-center">
          © 2026 CanalIQ
        </div>
      )}
      {isCollapsed && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 text-[8px] text-gray-400 text-center">
          ©
        </div>
      )}
    </motion.aside>
  )
}

export default Sidebar