import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { User, LogOut, Plus, MessageCircle, FileText } from 'lucide-react'
import NotificationIcon from './NotificationIcon'
import UserAvatar from './UserAvatar'

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth()

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
              {isAuthenticated && (
                <>
                  {user?.role === 'customer' && (
                    <Link to="/create-task" className="text-gray-700 hover:text-blue-600">
                      Создать заявку
                    </Link>
                  )}
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout 