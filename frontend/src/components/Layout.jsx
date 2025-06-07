import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { User, LogOut, Plus, MessageCircle, FileText, ChevronDown, Menu, X } from 'lucide-react'
import NotificationIcon from './NotificationIcon'
import UserAvatar from './UserAvatar'
import Footer from './Footer'
import MobileBottomNav from './MobileBottomNav'
import ResponsiveDebugger from './ResponsiveDebugger'
import { useState, useEffect } from 'react'
import { useUnread } from '../contexts/UnreadContext'

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth()
  const { unreadCount, resetUnreadCount } = useUnread()
  const location = useLocation()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [guidesDropdownOpen, setGuidesDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Проверяем, является ли текущая страница главной
  const isHomePage = location.pathname === '/'

  // Закрываем выпадающие меню при клике вне их области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.guides-dropdown')) {
        setGuidesDropdownOpen(false)
      }
      if (!event.target.closest('.mobile-menu')) {
        setMobileMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Закрываем мобильное меню при изменении маршрута
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const handleChatsClick = () => {
    // Сбрасываем счетчик при переходе к чатам
    resetUnreadCount()
    navigate('/chats')
    setMobileMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 no-overflow ios-safe-area">
      <header className="bg-white shadow-sm border-b relative ios-header">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link to="/" className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Luggo
            </Link>
            
            {/* Десктопная навигация */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/tasks" className="text-gray-700 hover:text-blue-600 transition-colors">
                Заявки
              </Link>
              <Link to="/executors" className="text-gray-700 hover:text-blue-600 transition-colors">
                Исполнители
              </Link>
              
              {/* Выпадающее меню "Руководства" */}
              <div className="relative guides-dropdown">
                <button
                  onClick={() => setGuidesDropdownOpen(!guidesDropdownOpen)}
                  className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Руководства
                  <ChevronDown size={16} className={`transition-transform ${guidesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {guidesDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to="/for-customers"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                      onClick={() => setGuidesDropdownOpen(false)}
                    >
                      🏠 Для заказчиков
                    </Link>
                    <Link
                      to="/for-executors"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                      onClick={() => setGuidesDropdownOpen(false)}
                    >
                      🔧 Для исполнителей
                    </Link>
                  </div>
                )}
              </div>
              
              <Link to="/news" className="text-gray-700 hover:text-blue-600 transition-colors">
                Новости
              </Link>
              {isAuthenticated && (
                <>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="text-red-600 hover:text-red-700 font-medium">
                      Админ панель
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* Десктопные кнопки */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {user?.role === 'customer' && (
                    <>
                      <Link
                        to="/my-tasks"
                        className="btn btn-secondary btn-sm flex items-center space-x-2"
                      >
                        <FileText size={16} />
                        <span className="hidden lg:inline">Мои заявки</span>
                      </Link>
                      
                      <Link
                        to="/create-task"
                        className="btn btn-primary btn-sm flex items-center space-x-2"
                      >
                        <Plus size={16} />
                        <span className="hidden lg:inline">Создать</span>
                      </Link>
                    </>
                  )}
                  
                  {user?.role === 'executor' && (
                    <Link
                      to="/my-jobs"
                      className="btn btn-primary btn-sm flex items-center space-x-2"
                    >
                      <FileText size={16} />
                      <span className="hidden lg:inline">Мои работы</span>
                    </Link>
                  )}

                  <div className="flex items-center space-x-2">
                    {/* Уведомления */}
                    <NotificationIcon />
                    
                    {/* Чаты */}
                    <button
                      onClick={handleChatsClick}
                      className="touch-target p-2 text-gray-700 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors relative"
                      title="Мои чаты"
                    >
                      <MessageCircle size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>
                    
                    <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600">
                      <UserAvatar user={user} size="md" />
                      <span className="hidden lg:inline">{user?.name}</span>
                    </Link>
                    
                    <button
                      onClick={logout}
                      className="touch-target text-gray-700 hover:text-red-600"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-gray-700 hover:text-blue-600">
                    Войти
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    Регистрация
                  </Link>
                </div>
              )}
            </div>

            {/* Мобильные кнопки */}
            <div className="flex md:hidden items-center space-x-2">
              {isAuthenticated && (
                <>
                  {/* Чаты */}
                  <button
                    onClick={handleChatsClick}
                    className="touch-target p-2 text-gray-700 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors relative interactive-element"
                    title="Мои чаты"
                  >
                    <MessageCircle size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Уведомления */}
                  <NotificationIcon />
                </>
              )}
              
              {/* Гамбургер меню */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="touch-target p-2 text-gray-700 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors interactive-element"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Мобильное меню */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 slide-up">
            <div className="max-w-7xl mx-auto px-3 py-3 space-y-1">
              {/* Навигационные ссылки */}
              <Link 
                to="/tasks" 
                className="block py-3 px-4 text-base text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors interactive-element"
                onClick={() => setMobileMenuOpen(false)}
              >
                📋 Заявки
              </Link>
              <Link 
                to="/executors" 
                className="block py-3 px-4 text-base text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors interactive-element"
                onClick={() => setMobileMenuOpen(false)}
              >
                👷 Исполнители
              </Link>
              <Link 
                to="/for-customers" 
                className="block py-3 px-4 text-base text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors interactive-element"
                onClick={() => setMobileMenuOpen(false)}
              >
                🏠 Для заказчиков
              </Link>
              <Link 
                to="/for-executors" 
                className="block py-3 px-4 text-base text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors interactive-element"
                onClick={() => setMobileMenuOpen(false)}
              >
                🔧 Для исполнителей
              </Link>
              <Link 
                to="/news" 
                className="block py-3 px-4 text-base text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors interactive-element"
                onClick={() => setMobileMenuOpen(false)}
              >
                📰 Новости
              </Link>

              {isAuthenticated ? (
                <>
                  <hr className="my-3 border-gray-200" />
                  
                  {/* Пользовательские ссылки */}
                  <Link 
                    to="/profile" 
                    className="flex items-center py-3 px-4 text-base text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors interactive-element"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserAvatar user={user} size="sm" className="mr-3" />
                    <span>{user?.name}</span>
                  </Link>
                  
                  {user?.role === 'customer' && (
                    <>
                      <Link 
                        to="/my-tasks" 
                        className="block py-3 px-4 text-base text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors interactive-element"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        📂 Мои заявки
                      </Link>
                      <Link 
                        to="/create-task" 
                        className="block py-3 px-4 text-base text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors interactive-element"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        ➕ Создать заявку
                      </Link>
                    </>
                  )}
                  
                  {user?.role === 'executor' && (
                    <Link 
                      to="/my-jobs" 
                      className="block py-3 px-4 text-base text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors interactive-element"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      💼 Мои работы
                    </Link>
                  )}

                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="block py-3 px-4 text-base text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors interactive-element"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      🛡️ Админ панель
                    </Link>
                  )}
                  
                  <hr className="my-3 border-gray-200" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left py-3 px-4 text-base text-red-600 hover:bg-red-50 rounded-lg transition-colors interactive-element"
                  >
                    🚪 Выйти
                  </button>
                </>
              ) : (
                <>
                  <hr className="my-3 border-gray-200" />
                  <Link 
                    to="/login" 
                    className="block py-3 px-4 text-base text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors interactive-element"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🔑 Войти
                  </Link>
                  <Link 
                    to="/register" 
                    className="block py-3 px-4 text-base text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors interactive-element"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    👤 Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 mobile-scroll">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 md:pb-8">
          {children}
        </div>
      </main>

      <MobileBottomNav />
      <Footer />
      <ResponsiveDebugger />
    </div>
  )
}

export default Layout 