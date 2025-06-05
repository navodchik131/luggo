import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getNewsBySlug } from '../services/newsService'
import { formatDate, formatDateTime } from '../utils/dateHelpers'

const NewsDetailPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadArticle()
  }, [slug])

  const loadArticle = async () => {
    try {
      setLoading(true)
      const response = await getNewsBySlug(slug)
      
      if (response.success) {
        setArticle(response.data)
      } else {
        setError('Новость не найдена')
      }
    } catch (err) {
      console.error('Ошибка загрузки новости:', err)
      if (err.response?.status === 404) {
        setError('Новость не найдена')
      } else {
        setError('Ошибка загрузки новости')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка новости...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📰</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
          <p className="text-gray-600 mb-6">
            {error === 'Новость не найдена' 
              ? 'Возможно, новость была удалена или перемещена.'
              : 'Попробуйте обновить страницу или вернуться позже.'
            }
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              ← Назад
            </button>
            <Link to="/news" className="btn btn-primary">
              Все новости
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!article) return null

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Хлебные крошки */}
      <nav className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-blue-600">Главная</Link>
          <span>→</span>
          <Link to="/news" className="hover:text-blue-600">Новости</Link>
          <span>→</span>
          <span className="text-gray-900">{article.title}</span>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto">
        {/* Заголовок статьи */}
        <header className="mb-8">
          {/* Теги */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.map(tag => (
                <Link
                  key={tag}
                  to={`/news?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full hover:bg-blue-200 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Заголовок */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>

          {/* Краткое описание */}
          {article.excerpt && (
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {/* Мета информация */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 border-b border-gray-200 pb-6">
            <div className="flex items-center gap-2">
              {article.author && article.author.avatar ? (
                <img 
                  src={article.author.avatar} 
                  alt={article.author.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-xs font-medium">
                    {article.author?.name?.charAt(0) || 'A'}
                  </span>
                </div>
              )}
              <span className="font-medium">
                {article.author?.name || 'Luggo Team'}
              </span>
            </div>
            <span>•</span>
            <time dateTime={article.publishedAt}>
              {formatDateTime(article.publishedAt)}
            </time>
            {article.views > 0 && (
              <>
                <span>•</span>
                <span>{article.views} просмотров</span>
              </>
            )}
          </div>
        </header>

        {/* Изображение статьи */}
        {article.imageUrl && (
          <div className="mb-8">
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full rounded-lg shadow-lg object-cover max-h-96"
            />
          </div>
        )}

        {/* Содержимое статьи */}
        <div className="prose prose-lg max-w-none mb-12">
          <div 
            className="whitespace-pre-line text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: article.content.replace(/\n/g, '<br/>') 
            }}
          />
        </div>

        {/* Подвал статьи */}
        <footer className="border-t border-gray-200 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Кнопки действий */}
            <div className="flex gap-3">
              <button
                onClick={() => navigator.share ? 
                  navigator.share({
                    title: article.title,
                    text: article.excerpt,
                    url: window.location.href
                  }) : 
                  navigator.clipboard.writeText(window.location.href)
                }
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span>📤</span>
                Поделиться
              </button>
              
              <Link
                to="/news"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>📰</span>
                Все новости
              </Link>
            </div>

            {/* Дата обновления */}
            {article.updatedAt !== article.createdAt && (
              <div className="text-sm text-gray-500">
                Обновлено: {formatDateTime(article.updatedAt)}
              </div>
            )}
          </div>
        </footer>
      </article>

      {/* Рекомендации */}
      <RelatedNews currentSlug={slug} tags={article.tags} />
    </div>
  )
}

// Компонент рекомендуемых новостей
const RelatedNews = ({ currentSlug, tags }) => {
  const [relatedNews, setRelatedNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRelatedNews()
  }, [currentSlug, tags])

  const loadRelatedNews = async () => {
    try {
      setLoading(true)
      
      // Загружаем новости с теми же тегами или просто последние
      const tag = tags && tags.length > 0 ? tags[0] : null
      const { getPublishedNews } = await import('../services/newsService')
      const response = await getPublishedNews(1, 3, tag)
      
      if (response.success) {
        // Исключаем текущую новость
        const filtered = response.data.news.filter(article => article.slug !== currentSlug)
        setRelatedNews(filtered.slice(0, 3))
      }
    } catch (err) {
      console.error('Ошибка загрузки рекомендуемых новостей:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading || relatedNews.length === 0) {
    return null
  }

  return (
    <section className="mt-16 border-t border-gray-200 pt-12">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Другие новости</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedNews.map(article => (
            <Link
              key={article.id}
              to={`/news/${article.slug}`}
              className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              {/* Изображение */}
              {article.imageUrl ? (
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <div className="text-blue-300 text-2xl">📰</div>
                </div>
              )}

              <div className="p-4">
                {/* Заголовок */}
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {article.title}
                </h3>

                {/* Дата */}
                <div className="text-xs text-gray-500">
                  {formatDate(article.publishedAt)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default NewsDetailPage 