import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getPublishedNews, getPopularTags } from '../services/newsService'
import { formatDate } from '../utils/dateHelpers'
import logger from '../utils/logger'

const NewsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [news, setNews] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })

  const currentPage = parseInt(searchParams.get('page')) || 1
  const selectedTag = searchParams.get('tag') || null

  useEffect(() => {
    loadNews()
    loadTags()
  }, [currentPage, selectedTag])

  const loadNews = async () => {
    try {
      setLoading(true)
      const response = await getPublishedNews(currentPage, 12, selectedTag)
      
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

  const loadTags = async () => {
    try {
      const response = await getPopularTags()
      if (response.success) {
        setTags(response.data.slice(0, 10)) // Показываем только топ-10 тегов
      }
    } catch (err) {
      logger.error('Ошибка загрузки тегов:', err)
    }
  }

  const handleTagFilter = (tag) => {
    const params = new URLSearchParams()
    if (tag) {
      params.set('tag', tag)
    }
    params.set('page', '1')
    setSearchParams(params)
  }

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', page.toString())
    setSearchParams(params)
  }

  const clearFilters = () => {
    setSearchParams({})
  }

  if (loading && currentPage === 1) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка новостей...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8">
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
      </div>
    )
  }

  return (
    <div className="py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Новости Luggo</h1>
        <p className="text-gray-600">
          Последние новости о развитии нашей платформы и услугах переезда
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Основной контент */}
        <div className="flex-1">
          {/* Фильтры */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 mr-2">Теги:</span>
              <button
                onClick={clearFilters}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  !selectedTag 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Все
              </button>
              {tags.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => handleTagFilter(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTag === tag 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag} ({count})
                </button>
              ))}
            </div>
            
            {selectedTag && (
              <div className="mt-2 text-sm text-gray-600">
                Показано новостей с тегом "{selectedTag}": {pagination.totalItems}
              </div>
            )}
          </div>

          {/* Список новостей */}
          {news.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📰</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {selectedTag ? 'Новостей с данным тегом не найдено' : 'Новостей пока нет'}
              </h3>
              <p className="text-gray-600 mb-4">
                {selectedTag 
                  ? 'Попробуйте выбрать другой тег или сбросьте фильтры'
                  : 'Следите за обновлениями — скоро здесь появятся интересные новости!'
                }
              </p>
              {selectedTag && (
                <button
                  onClick={clearFilters}
                  className="btn btn-primary"
                >
                  Показать все новости
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {news.map(article => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>

              {/* Пагинация */}
              {pagination.totalPages > 1 && (
                <div className="mt-8">
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

        {/* Сайдбар */}
        <div className="w-full lg:w-80">
          <NewsSidebar tags={tags} selectedTag={selectedTag} onTagSelect={handleTagFilter} />
        </div>
      </div>
    </div>
  )
}

// Компонент карточки новости
const NewsCard = ({ article }) => {
  return (
    <Link 
      to={`/news/${article.slug}`}
      className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
    >
      {/* Изображение */}
      {article.imageUrl ? (
        <div className="aspect-w-16 aspect-h-9">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <div className="text-blue-300 text-4xl">📰</div>
        </div>
      )}

      <div className="p-4">
        {/* Теги */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {article.tags.slice(0, 2).map(tag => (
              <span 
                key={tag}
                className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {article.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{article.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Заголовок */}
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {article.title}
        </h3>

        {/* Описание */}
        {article.excerpt && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {article.excerpt}
          </p>
        )}

        {/* Мета информация */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>{formatDate(article.publishedAt)}</span>
            {article.views > 0 && (
              <>
                <span>•</span>
                <span>{article.views} просмотров</span>
              </>
            )}
          </div>
          {article.author && (
            <span>
              {article.author.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// Компонент сайдбара
const NewsSidebar = ({ tags, selectedTag, onTagSelect }) => {
  return (
    <div className="space-y-6">
      {/* О разделе */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">О новостях Luggo</h3>
        <p className="text-gray-600 text-sm">
          Здесь мы делимся последними обновлениями платформы, рассказываем о новых функциях 
          и делимся полезными советами по переезду.
        </p>
      </div>

      {/* Популярные теги */}
      {tags.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Популярные теги</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => onTagSelect(tag)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTag === tag 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag} ({count})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Компонент пагинации
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = []
  
  // Показываем не более 7 страниц
  const startPage = Math.max(1, currentPage - 3)
  const endPage = Math.min(totalPages, startPage + 6)

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Предыдущая страница */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Назад
      </button>

      {/* Страницы */}
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 text-sm border rounded-md ${
            page === currentPage
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Следующая страница */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Вперед →
      </button>
    </div>
  )
}

export default NewsPage 