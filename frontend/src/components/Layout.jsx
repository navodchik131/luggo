import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { User, LogOut, Plus, MessageCircle, FileText, ChevronDown } from 'lucide-react'
import NotificationIcon from './NotificationIcon'
import UserAvatar from './UserAvatar'
import Footer from './Footer'
import { useState, useEffect } from 'react'
import { useUnread } from '../contexts/UnreadContext'

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth()
  const { unreadCount, resetUnreadCount } = useUnread()
  const location = useLocation()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [guidesDropdownOpen, setGuidesDropdownOpen] = useState(false)

  // Проверяем, является ли текущая страница главной
  const isHomePage = location.pathname === '/'

  // Закрываем выпадающие меню при клике вне их области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.guides-dropdown')) {
        setGuidesDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChatsClick = () => {
    // Сбрасываем счетчик при переходе к чатам
    resetUnreadCount()
    navigate('/chats')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              Luggo
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <Link to="/tasks" className="text-gray-700 hover:text-blue-600">
                Заявки
              </Link>
              <Link to="/executors" className="text-gray-700 hover:text-blue-600">
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
              
              <Link to="/news" className="text-gray-700 hover:text-blue-600">
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

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {user?.role === 'customer' && (
                    <>
                      <Link
                        to="/my-tasks"
                        className="btn btn-secondary flex items-center space-x-2"
                      >
                        <FileText size={16} />
                        <span className="hidden sm:inline">Мои заявки</span>
                      </Link>
                      
                      <Link
                        to="/create-task"
                        className="btn btn-primary flex items-center space-x-2"
                      >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Создать</span>
                      </Link>
                    </>
                  )}
                  
                  {user?.role === 'executor' && (
                    <Link
                      to="/my-jobs"
                      className="btn btn-primary flex items-center space-x-2"
                    >
                      <FileText size={16} />
                      <span className="hidden sm:inline">Мои работы</span>
                    </Link>
                  )}

                  <div className="flex items-center space-x-2">
                    {/* Уведомления */}
                    <NotificationIcon />
                    
                    {/* Чаты */}
                    <button
                      onClick={handleChatsClick}
                      className="p-2 text-gray-700 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors relative"
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
                      className="text-gray-700 hover:text-red-600"
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
                  <Link to="/register" className="btn btn-primary">
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={isHomePage ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {children}
      </main>

      <Footer />
    </div>
  )
}

export default Layout 