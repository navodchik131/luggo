import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const HomePage = () => {
  const { user } = useAuth()

  return (
    <div>
      {/* Hero секция */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Переезды стали проще с <span className="text-blue-600">Luggo</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {user?.role === 'executor' 
              ? 'Найдите выгодные заказы по переезду. Работайте с проверенными заказчиками и развивайте свой бизнес.'
              : 'Найдите надежных исполнителей для квартирного, офисного или межгородского переезда. Быстро, безопасно и с гарантией качества.'
            }
          </p>
          
          {user ? (
            <div className="flex gap-4 justify-center">
              {user.role === 'executor' ? (
                // Кнопки для исполнителей
                <>
                  <Link to="/tasks" className="btn btn-primary btn-lg">
                    🔍 Найти заказы
                  </Link>
                  <Link to="/profile" className="btn btn-secondary btn-lg">
                    👤 Мой профиль
                  </Link>
                  <Link to="/executors" className="btn btn-secondary btn-lg">
                    👷 Исполнители
                  </Link>
                </>
              ) : (
                // Кнопки для заказчиков
                <>
                  <Link to="/create-task" className="btn btn-primary btn-lg">
                    🚚 Создать заявку
                  </Link>
                  <Link to="/tasks" className="btn btn-secondary btn-lg">
                    📋 Просмотреть заявки
                  </Link>
                  <Link to="/executors" className="btn btn-secondary btn-lg">
                    👷 Исполнители
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link to="/register" className="btn btn-primary btn-lg">
                Начать работу
              </Link>
              <Link to="/tasks" className="btn btn-secondary btn-lg">
                Просмотреть заявки
              </Link>
              <Link to="/executors" className="btn btn-secondary btn-lg">
                👷 Исполнители
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Быстрое создание заявки - только для заказчиков */}
      {user && user.role !== 'executor' && (
        <div className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">Создайте заявку за минуту</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                    className={`${item.color} border-2 rounded-lg p-6 text-center hover:shadow-md transition-shadow`}
                  >
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
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
        <div className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">Найдите подходящие заказы</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                    className={`${item.color} border-2 rounded-lg p-6 text-center hover:shadow-md transition-shadow`}
                  >
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </Link>
                ))}
              </div>
              
              <div className="text-center">
                <Link to="/tasks" className="btn btn-primary btn-lg">
                  Найти заказы сейчас
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Преимущества платформы */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Почему выбирают Luggo?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '⭐',
                title: user?.role === 'executor' ? 'Проверенные заказчики' : 'Проверенные исполнители',
                description: user?.role === 'executor' 
                  ? 'Все заказчики проходят верификацию и оставляют честные отзывы'
                  : 'Все исполнители проходят верификацию и имеют рейтинг'
              },
              {
                icon: '💬', 
                title: 'Удобный чат',
                description: user?.role === 'executor'
                  ? 'Общайтесь с заказчиками прямо на платформе'
                  : 'Общайтесь с исполнителями прямо на платформе'
              },
              {
                icon: '🛡️',
                title: 'Безопасные сделки',
                description: 'Система отзывов и гарантии защищают ваши интересы'
              },
              {
                icon: '⚡',
                title: user?.role === 'executor' ? 'Быстрые заказы' : 'Быстрые отклики',
                description: user?.role === 'executor'
                  ? 'Находите новые заказы в течение нескольких минут'
                  : 'Получайте предложения в течение нескольких минут'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Как это работает */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
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
          <div className="container mx-auto px-4">
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