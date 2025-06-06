import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, Search, Filter } from 'lucide-react'
import { getAllNewsForAdmin, deleteNews } from '../services/newsService'
import { formatDateTime } from '../utils/dateHelpers'
import toast from 'react-hot-toast'
import logger from '../utils/logger'

const AdminNewsPage = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })
  
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1
  })

  useEffect(() => {
    loadNews()
  }, [filters])

  const loadNews = async () => {
    try {
      setLoading(true)
      const response = await getAllNewsForAdmin(
        filters.page,
        20,
        filters.status || null,
        filters.search || null
      )
      
      if (response.success) {
        setNews(response.data.news)
        setPagination(response.data.pagination)
      } else {
        setError('Ошибка загрузки новостей')
      }
    } catch (err) {
      logger.error('Ошибка загрузки новостей:', err)
      setError('Ошибка загрузки новостей')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNews = async (id, title) => {
    if (!window.confirm(`Вы уверены, что хотите удалить новость "${title}"?`)) {
      return
    }

    try {
      const response = await deleteNews(id)
      if (response.success) {
        toast.success('Новость удалена')
        loadNews() // Перезагружаем список
      } else {
        toast.error(response.message || 'Ошибка удаления новости')
      }
    } catch (err) {
      logger.error('Ошибка удаления новости:', err)
      toast.error('Ошибка удаления новости')
    }
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Сбрасываем на первую страницу при изменении фильтров
    }))
  }

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Опубликована</span>
      case 'draft':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Черновик</span>
      case 'archived':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Архив</span>
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>
    }
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-4xl mb-2">⚠️</div>
        <h3 className="font-semibold text-red-800 mb-2">Ошибка загрузки</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadNews}
          className="mt-4 btn btn-primary"
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление новостями</h1>
          <p className="text-gray-600">Создание, редактирование и публикация новостей</p>
        </div>
        <Link
          to="/admin/news/create"
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Создать новость
        </Link>
      </div>

      {/* Фильтры */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Поиск */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Поиск по заголовку..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Фильтр по статусу */}
          <div className="sm:w-48">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Все статусы</option>
              <option value="published">Опубликованные</option>
              <option value="draft">Черновики</option>
              <option value="archived">Архивные</option>
            </select>
          </div>
        </div>

        {/* Статистика */}
        <div className="mt-4 text-sm text-gray-600">
          Найдено новостей: {pagination.totalItems}
        </div>
      </div>

      {/* Список новостей */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Загрузка...</p>
            </div>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📰</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Новостей не найдено</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.status 
                ? 'Попробуйте изменить фильтры поиска'
                : 'Создайте первую новость для вашего сайта'
              }
            </p>
            <Link
              to="/admin/news/create"
              className="btn btn-primary"
            >
              Создать новость
            </Link>
          </div>
        ) : (
          <>
            {/* Таблица новостей */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Новость
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Автор
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Просмотры
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {news.map(article => (
                    <tr key={article.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {/* Миниатюра */}
                          {article.imageUrl ? (
                            <img 
                              src={article.imageUrl} 
                              alt={article.title}
                              className="w-12 h-12 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-gray-400 text-xs">📰</span>
                            </div>
                          )}
                          
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 line-clamp-1">
                              {article.title}
                            </div>
                            {article.excerpt && (
                              <div className="text-sm text-gray-600 line-clamp-2 mt-1">
                                {article.excerpt}
                              </div>
                            )}
                            {article.tags && article.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {article.tags.slice(0, 3).map(tag => (
                                  <span 
                                    key={tag}
                                    className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {article.tags.length > 3 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                    +{article.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(article.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {article.author?.name || 'Неизвестен'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>
                          {article.status === 'published' && article.publishedAt
                            ? formatDateTime(article.publishedAt)
                            : formatDateTime(article.createdAt)
                          }
                        </div>
                        {article.status === 'published' && article.publishedAt && (
                          <div className="text-xs text-gray-500">Опубликовано</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {article.views}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {article.status === 'published' && (
                            <Link
                              to={`/news/${article.slug}`}
                              target="_blank"
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                              title="Посмотреть"
                            >
                              <Eye size={16} />
                            </Link>
                          )}
                          <Link
                            to={`/admin/news/edit/${article.id}`}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                            title="Редактировать"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDeleteNews(article.id, article.title)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Удалить"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Пагинация */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t">
                <Pagination 
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Компонент пагинации
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = []
  
  const startPage = Math.max(1, currentPage - 2)
  const endPage = Math.min(totalPages, startPage + 4)

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Страница {currentPage} из {totalPages}
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ←
        </button>

        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 text-sm border rounded ${
              page === currentPage
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>
    </div>
  )
}

export default AdminNewsPage 