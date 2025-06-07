import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getPublishedNews } from '../services/newsService'
import { formatDate } from '../utils/dateHelpers'
import logger from '../utils/logger'
import SEO from '../components/SEO'

const HomePage = () => {
  const { user } = useAuth()
  const [latestNews, setLatestNews] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)

  useEffect(() => {
    loadLatestNews()
  }, [])

  const loadLatestNews = async () => {
    try {
      setNewsLoading(true)
      const response = await getPublishedNews(1, 3) // Загружаем 3 последние новости
      if (response.success) {
        setLatestNews(response.data.news)
      }
    } catch (error) {
      logger.error('Ошибка загрузки новостей:', error)
    } finally {
      setNewsLoading(false)
    }
  }

  return (
    <div>
      <SEO 
        title="Luggo - Платформа для переездов №1 в России"
        description="Найдите надёжных исполнителей для квартирного, офисного переезда или межгородской перевозки. 5000+ проверенных грузчиков и водителей. Быстро, безопасно, с гарантией качества."
        keywords="переезд, грузчики, грузоперевозки, квартирный переезд, офисный переезд, межгородской переезд, вывоз мусора, услуги переезда, найти грузчиков, переезд квартиры, офисный переезд, luggo"
        url="/"
      />
      
      {/* Hero section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-8 sm:py-12 lg:py-16 hero-mobile">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
          <h1 className="responsive-title text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-6">
            Переезды стали проще с <span className="text-blue-600">Luggo</span>
          </h1>
          <p className="responsive-text text-sm sm:text-lg lg:text-xl text-gray-600 mb-4 sm:mb-8 max-w-2xl mx-auto px-2">
            {user?.role === 'executor' 
              ? 'Найдите выгодные заказы по переезду. Работайте с проверенными заказчиками и развивайте свой бизнес.'
              : 'Найдите надежных исполнителей для квартирного, офисного или межгородского переезда. Быстро, безопасно и с гарантией качества.'
            }
          </p>
          
          {user ? (
            <div className="hero-buttons btn-group-mobile flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              {user.role === 'executor' ? (
                // Кнопки для исполнителей
                <>
                  <Link to="/tasks" className="btn btn-primary">
                    🔍 Найти заказы
                  </Link>
                  <Link to="/profile" className="btn btn-secondary">
                    👤 Мой профиль
                  </Link>
                  <Link to="/executors" className="btn btn-secondary hidden sm:inline-flex">
                    👷 Исполнители
                  </Link>
                </>
              ) : (
                // Кнопки для заказчиков
                <>
                  <Link to="/create-task" className="btn btn-primary">
                    🚚 Создать заявку
                  </Link>
                  <Link to="/tasks" className="btn btn-secondary">
                    📋 Просмотреть заявки
                  </Link>
                  <Link to="/executors" className="btn btn-secondary hidden sm:inline-flex">
                    👷 Исполнители
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="hero-buttons btn-group-mobile flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              <Link to="/register" className="btn btn-primary">
                Начать работу
              </Link>
              <Link to="/tasks" className="btn btn-secondary">
                Просмотреть заявки
              </Link>
              <Link to="/executors" className="btn btn-secondary hidden sm:inline-flex">
                👷 Исполнители
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Быстрое создание заявки - только для заказчиков */}
      {user && user.role !== 'executor' && (
        <div className="py-8 sm:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="responsive-title text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
                Создайте заявку за минуту
              </h2>
              
              <div className="grid-responsive grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
                {[
                  {
                    category: 'flat',
                    title: 'Квартирный переезд',
                    description: 'Переезд из квартиры в квартиру',
                    icon: '🏠',
                    color: 'bg-blue-50 border-blue-200'
                  },
                  {
                    category: 'office', 
                    title: 'Офисный переезд',
                    description: 'Переезд офиса или бизнеса',
                    icon: '🏢',
                    color: 'bg-green-50 border-green-200'
                  },
                  {
                    category: 'intercity',
                    title: 'Межгородский переезд', 
                    description: 'Переезд в другой город',
                    icon: '🚛',
                    color: 'bg-purple-50 border-purple-200'
                  },
                  {
                    category: 'garbage',
                    title: 'Вывоз мусора',
                    description: 'Уборка и вывоз строительного мусора',
                    icon: '🗑️',
                    color: 'bg-orange-50 border-orange-200'
                  }
                ].map((item) => (
                  <Link
                    key={item.category}
                    to={`/create-task?category=${item.category}`}
                    className={`${item.color} border-2 rounded-lg p-4 sm:p-6 text-center hover:shadow-md transition-shadow interactive-element`}
                  >
                    <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{item.icon}</div>
                    <h3 className="responsive-subtitle font-semibold mb-1 sm:mb-2">{item.title}</h3>
                    <p className="responsive-text text-xs sm:text-sm text-gray-600">{item.description}</p>
                  </Link>
                ))}
              </div>
              
              <div className="text-center">
                <Link to="/create-task" className="btn btn-primary btn-lg">
                  Создать подробную заявку
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Секция для исполнителей - заменяет создание заявки */}
      {user && user.role === 'executor' && (
        <div className="py-8 sm:py-12 bg-white">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="responsive-title text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
                Найдите подходящие заказы
              </h2>
              
              <div className="grid-responsive grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-8">
                {[
                  {
                    title: 'Активные заявки',
                    description: 'Просматривайте новые заказы и оставляйте отклики',
                    icon: '📋',
                    color: 'bg-blue-50 border-blue-200',
                    link: '/tasks'
                  },
                  {
                    title: 'Мой профиль',
                    description: 'Настройте профиль и загрузите фотографии',
                    icon: '👤',
                    color: 'bg-green-50 border-green-200',
                    link: '/profile'
                  },
                  {
                    title: 'Мои отклики',
                    description: 'Отслеживайте статус ваших откликов',
                    icon: '💼',
                    color: 'bg-purple-50 border-purple-200',
                    link: '/my-jobs'
                  },
                  {
                    title: 'Другие исполнители',
                    description: 'Посмотрите профили коллег и изучите рынок',
                    icon: '👷',
                    color: 'bg-orange-50 border-orange-200',
                    link: '/executors'
                  }
                ].map((item, index) => (
                  <Link
                    key={index}
                    to={item.link}
                    className={`${item.color} border-2 rounded-lg p-4 sm:p-6 text-center hover:shadow-md transition-shadow interactive-element`}
                  >
                    <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">{item.icon}</div>
                    <h3 className="responsive-subtitle font-semibold mb-1 sm:mb-2">{item.title}</h3>
                    <p className="responsive-text text-xs sm:text-sm text-gray-600">{item.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Блок преимуществ и статистики */}
      <div className="py-12 sm:py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Почему <span className="text-blue-600">Luggo</span> — лучший выбор?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Мы создали платформу, которая решает все проблемы при поиске исполнителей переезда
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                icon: '⭐',
                title: 'Честный рейтинг',
                subtitle: 'Только реальные отзывы',
                description: 'Рейтинг формируется исключительно из отзывов за выполненные заказы. Никаких накруток — только честная оценка работы.',
                highlight: '4.8/5',
                highlightText: 'средний рейтинг',
                gradient: 'from-yellow-400 to-orange-500'
              },
              {
                icon: '👥',
                title: 'Огромная база',
                subtitle: '5000+ проверенных исполнителей',
                description: 'Самая большая база исполнителей в вашем городе. Найдётся специалист для любого типа переезда в любое время.',
                highlight: '5000+',
                highlightText: 'исполнителей',
                gradient: 'from-blue-400 to-purple-500'
              },
              {
                icon: '⚡',
                title: 'Мгновенная связь',
                subtitle: 'Отклик за 5 минут',
                description: 'Умная система подбора мгновенно находит подходящих исполнителей. Первые отклики приходят уже через 5 минут.',
                highlight: '5 мин',
                highlightText: 'до первого отклика',
                gradient: 'from-green-400 to-blue-500'
              },
              {
                icon: '🎁',
                title: 'Абсолютно бесплатно',
                subtitle: '0₽ комиссии для заказчиков',
                description: 'Размещение заявок, поиск исполнителей и общение — всё бесплатно. Платите только исполнителю за работу.',
                highlight: '0₽',
                highlightText: 'комиссия',
                gradient: 'from-purple-400 to-pink-500'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 relative overflow-hidden"
              >
                {/* Градиентный фон при hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Иконка */}
                <div className="relative z-10">
                  <div className={`w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {feature.icon}
                  </div>
                  
                  {/* Заголовок */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  {/* Подзаголовок */}
                  <p className="text-sm font-semibold text-blue-600 mb-3 sm:mb-4">
                    {feature.subtitle}
                  </p>
                  
                  {/* Описание */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 sm:mb-6">
                    {feature.description}
                  </p>
                  
                  {/* Статистика */}
                  <div className="border-t border-gray-100 pt-3 sm:pt-4">
                    <div className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                      {feature.highlight}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">
                      {feature.highlightText}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Дополнительный блок с гарантиями */}
          <div className="mt-12 sm:mt-16">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
                🛡️ Ваша безопасность — наш приоритет
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
                <div className="flex flex-col items-center p-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl mb-2">
                    ✅
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Проверенные документы</span>
                </div>
                <div className="flex flex-col items-center p-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl mb-2">
                    🔒
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Страхование имущества</span>
                </div>
                <div className="flex flex-col items-center p-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl mb-2">
                    📞
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Поддержка 24/7</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA в блоке преимуществ - исправлено для мобильных */}
          <div className="mt-8 sm:mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-white rounded-2xl px-6 sm:px-8 py-4 shadow-lg max-w-sm sm:max-w-none mx-auto">
              <div className="flex items-center gap-2 text-center sm:text-left">
                <span className="text-gray-600 text-sm sm:text-base">Присоединяйтесь к</span>
                <span className="font-bold text-blue-600 text-lg sm:text-xl">10,000+</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm sm:text-base">довольных пользователей</span>
                <span className="text-xl sm:text-2xl">🚀</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Последние новости */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">📰 Последние новости</h2>
            <Link 
              to="/news" 
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              Все новости
              <span>→</span>
            </Link>
          </div>
          
          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-50 rounded-lg p-6 animate-pulse">
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : latestNews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestNews.map(article => (
                <Link
                  key={article.id}
                  to={`/news/${article.slug}`}
                  className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Изображение новости */}
                  {article.imageUrl ? (
                    <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      <span className="text-blue-400 text-4xl">📰</span>
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Теги */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
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
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}
                    
                    {/* Мета информация */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(article.publishedAt)}</span>
                      {article.views > 0 && (
                        <span>{article.views} просмотров</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📰</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Новостей пока нет</h3>
              <p className="text-gray-600">Следите за обновлениями — скоро здесь появятся интересные новости!</p>
            </div>
          )}
          
          {/* Дополнительная информация */}
          {latestNews.length > 0 && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
                <span>💡</span>
                <span>Узнавайте о новых функциях платформы и полезных советах по переезду</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Как это работает */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Как это работает</h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(user?.role === 'executor' ? [
                {
                  step: '1',
                  title: 'Найдите заказы',
                  description: 'Просматривайте активные заявки и выбирайте подходящие'
                },
                {
                  step: '2', 
                  title: 'Оставьте отклик',
                  description: 'Предложите свою цену и условия выполнения работы'
                },
                {
                  step: '3',
                  title: 'Выполняйте работу',
                  description: 'Получите одобрение заказчика и выполните переезд качественно'
                }
              ] : [
                {
                  step: '1',
                  title: 'Создайте заявку',
                  description: 'Опишите детали переезда: откуда, куда, когда и что нужно перевезти'
                },
                {
                  step: '2', 
                  title: 'Получите отклики',
                  description: 'Исполнители присылают свои предложения с ценой и условиями'
                },
                {
                  step: '3',
                  title: 'Выберите лучшего',
                  description: 'Сравните отклики, пообщайтесь с исполнителями и выберите подходящего'
                }
              ]).map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA секция */}
      {!user && (
        <div className="py-16 bg-blue-600 text-white text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">Готовы начать?</h2>
            <p className="text-xl mb-8">Присоединяйтесь к тысячам довольных пользователей</p>
            <div className="flex gap-4 justify-center">
              <Link to="/register" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Зарегистрироваться
              </Link>
              <Link to="/login" className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Войти
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage 