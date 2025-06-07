import { Link, useLocation } from 'react-router-dom'
import { Home, Search, MessageCircle, User, Plus, Briefcase } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useUnread } from '../contexts/UnreadContext'

const MobileBottomNav = () => {
  const { user, isAuthenticated } = useAuth()
  const { unreadCount } = useUnread()
  const location = useLocation()

  // Показывать только на мобильных устройствах и для авторизованных пользователей
  if (!isAuthenticated) return null

  const getNavItems = () => {
    const commonItems = [
      {
        to: '/',
        icon: Home,
        label: 'Главная',
        isActive: location.pathname === '/'
      },
      {
        to: '/tasks',
        icon: Search,
        label: 'Заявки',
        isActive: location.pathname === '/tasks'
      },
      {
        to: '/chats',
        icon: MessageCircle,
        label: 'Чаты',
        isActive: location.pathname === '/chats',
        badge: unreadCount > 0 ? unreadCount : null
      }
    ]

    if (user?.role === 'customer') {
      return [
        ...commonItems.slice(0, 2),
        {
          to: '/create-task',
          icon: Plus,
          label: 'Создать',
          isActive: location.pathname === '/create-task',
          isPrimary: true
        },
        commonItems[2], // Чаты
        {
          to: '/profile',
          icon: User,
          label: 'Профиль',
          isActive: location.pathname === '/profile'
        }
      ]
    }

    if (user?.role === 'executor') {
      return [
        ...commonItems.slice(0, 2),
        {
          to: '/my-jobs',
          icon: Briefcase,
          label: 'Мои работы',
          isActive: location.pathname === '/my-jobs',
          isPrimary: true
        },
        commonItems[2], // Чаты
        {
          to: '/profile',
          icon: User,
          label: 'Профиль',
          isActive: location.pathname === '/profile'
        }
      ]
    }

    return [
      ...commonItems,
      {
        to: '/profile',
        icon: User,
        label: 'Профиль',
        isActive: location.pathname === '/profile'
      }
    ]
  }

  const navItems = getNavItems()

  return (
    <nav className="mobile-nav block md:hidden">
      <div className="mobile-nav-items">
        {navItems.map((item) => {
          const IconComponent = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`mobile-nav-item ${
                item.isActive 
                  ? 'text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              } ${
                item.isPrimary 
                  ? 'bg-blue-600 text-white rounded-full p-2 -mt-2' 
                  : ''
              } transition-colors relative`}
            >
              <div className="mobile-nav-icon relative">
                <IconComponent 
                  size={item.isPrimary ? 24 : 20} 
                  className={item.isPrimary ? 'text-white' : ''} 
                />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              {!item.isPrimary && (
                <span className="text-xs font-medium">{item.label}</span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileBottomNav 