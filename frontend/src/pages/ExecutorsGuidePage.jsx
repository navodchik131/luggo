import { Link } from 'react-router-dom'
import { 
  UserPlus, 
  Settings, 
  Search, 
  MessageCircle, 
  Star, 
  Shield, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Users,
  Award,
  DollarSign
} from 'lucide-react'

const ExecutorsGuidePage = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "1. Регистрация",
      description: "Создайте аккаунт исполнителя на платформе",
      details: [
        "Выберите роль 'Исполнитель' при регистрации",
        "Подтвердите email и номер телефона",
        "Это займет не более 3 минут"
      ],
      action: "Зарегистрироваться",
      link: "/register"
    },
    {
      icon: Settings,
      title: "2. Настройка профиля",
      description: "Заполните профиль, чтобы заказчики вас выбирали",
      details: [
        "Загрузите качественное фото",
        "Опишите свой опыт и услуги",
        "Укажите специализацию (квартирные, офисные переезды)",
        "Добавьте примеры работ"
      ],
      action: "Настроить профиль",
      link: "/profile"
    },
    {
      icon: Search,
      title: "3. Поиск заказов",
      description: "Находите подходящие заявки на переезд",
      details: [
        "Просматривайте активные заявки",
        "Используйте фильтры по типу и дате",
        "Изучайте требования заказчика",
        "Обращайте внимание на адреса и расстояние"
      ],
      action: "Найти заказы",
      link: "/tasks"
    },
    {
      icon: MessageCircle,
      title: "4. Отклик и общение",
      description: "Оставляйте отклики и общайтесь с заказчиками",
      details: [
        "Предложите честную цену",
        "Опишите, что входит в услугу",
        "Отвечайте быстро в чате",
        "Будьте вежливы и профессиональны"
      ],
      action: "Посмотреть чаты",
      link: "/chats"
    },
    {
      icon: Star,
      title: "5. Получение отзывов",
      description: "Выполняйте работу качественно и получайте 5⭐",
      details: [
        "Приезжайте вовремя",
        "Бережно обращайтесь с вещами",
        "Поддерживайте связь с заказчиком",
        "Просите оставить отзыв после работы"
      ],
      action: "Мой рейтинг",
      link: "/profile"
    }
  ]

  const benefits = [
    {
      icon: Shield,
      title: "Безопасность платежей",
      description: "Все расчеты проходят через платформу. Никаких авансов и обманов."
    },
    {
      icon: TrendingUp,
      title: "Рост доходов",
      description: "Чем выше рейтинг, тем больше заказов. Качественная работа окупается."
    },
    {
      icon: Users,
      title: "Постоянный поток клиентов",
      description: "10,000+ активных пользователей ищут исполнителей каждый день."
    },
    {
      icon: Award,
      title: "Честная репутация",
      description: "Отзывы можно получить только за реальные заказы. Никаких накруток."
    }
  ]

  const tips = [
    {
      title: "💡 Откликайтесь быстро",
      description: "Первые 3 отклика получают 80% заказов. Будьте активны!"
    },
    {
      title: "💰 Цените работу честно",
      description: "Адекватные цены привлекают больше клиентов, чем завышенные."
    },
    {
      title: "📸 Показывайте результат",
      description: "Фото до/после работы помогают получить больше откликов."
    },
    {
      title: "⭐ Просите отзывы",
      description: "Каждый отзыв повышает ваш рейтинг и привлекает новых клиентов."
    }
  ]

  return (
    <div className="py-8">
      {/* Hero секция */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔧 Руководство для исполнителей
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            Превратите свои навыки в стабильный доход! Узнайте, как эффективно работать на платформе Luggo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-primary btn-lg">
              Начать зарабатывать
            </Link>
            <Link to="/tasks" className="btn btn-secondary btn-lg">
              Посмотреть заказы
            </Link>
          </div>
        </div>
      </div>

      {/* Пошаговая инструкция */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Как начать зарабатывать на Luggo
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Следуйте этим простым шагам, чтобы стать успешным исполнителем на нашей платформе
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Icon className="text-blue-600" size={24} />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {step.description}
                    </p>
                    
                    <ul className="space-y-2 mb-4">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex-shrink-0 flex items-center">
                    <Link 
                      to={step.link}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      {step.action}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Преимущества работы через платформу */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Почему стоит работать именно через Luggo?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Мы создали платформу, которая защищает интересы исполнителей и помогает развивать бизнес
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Советы для успеха */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Секреты успешных исполнителей
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Эти советы помогут вам выделиться среди конкурентов и получать больше заказов
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tip, index) => (
            <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-2">
                {tip.title}
              </h3>
              <p className="text-gray-700 text-sm">
                {tip.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Важность отзывов */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 mb-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="text-yellow-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Отзывы — ваш главный актив!
          </h2>
          <p className="text-gray-700 mb-6 max-w-3xl mx-auto">
            Каждый честный отзыв от заказчика повышает ваш рейтинг и помогает другим пользователям принять решение. 
            <strong> Работая через Luggo и собирая отзывы, вы инвестируете в свое будущее!</strong>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">4.8⭐</div>
              <div className="text-sm text-gray-600">Средний рейтинг получают 3x больше заказов</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">10+</div>
              <div className="text-sm text-gray-600">отзывов открывают доступ к VIP заказам</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">100%</div>
              <div className="text-sm text-gray-600">честности — отзывы нельзя накрутить</div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 bg-white rounded-lg p-4 border">
            💡 <strong>Совет:</strong> После каждого выполненного заказа вежливо попросите заказчика оставить отзыв. 
            Это поможет не только вам, но и развитию всего сервиса!
          </p>
        </div>
      </div>

      {/* Статистика и мотивация */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">
          Присоединяйтесь к 5,000+ успешных исполнителей!
        </h2>
        <p className="mb-6 opacity-90">
          Наши исполнители в среднем зарабатывают 50,000₽ в месяц, работая на платформе
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <div className="text-2xl font-bold">50,000₽</div>
            <div className="text-sm opacity-80">Средний доход</div>
          </div>
          <div>
            <div className="text-2xl font-bold">15</div>
            <div className="text-sm opacity-80">Заказов в месяц</div>
          </div>
          <div>
            <div className="text-2xl font-bold">4.8⭐</div>
            <div className="text-sm opacity-80">Средний рейтинг</div>
          </div>
          <div>
            <div className="text-2xl font-bold">0₽</div>
            <div className="text-sm opacity-80">Плата за регистрацию</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Стать исполнителем
          </Link>
          <Link 
            to="/executors"
            className="bg-blue-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors"
          >
            Посмотреть профили коллег
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ExecutorsGuidePage 