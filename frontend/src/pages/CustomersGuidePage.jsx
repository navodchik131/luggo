import { Link } from 'react-router-dom'
import { 
  UserPlus, 
  FileText, 
  Search, 
  MessageCircle, 
  Star, 
  Shield, 
  Clock,
  CheckCircle,
  ArrowRight,
  Users,
  Award,
  CreditCard,
  Truck
} from 'lucide-react'

const CustomersGuidePage = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "1. Регистрация",
      description: "Создайте аккаунт заказчика на платформе",
      details: [
        "Выберите роль 'Заказчик' при регистрации",
        "Подтвердите email и номер телефона",
        "Быстрая регистрация за 2 минуты"
      ],
      action: "Зарегистрироваться",
      link: "/register"
    },
    {
      icon: FileText,
      title: "2. Создание заявки",
      description: "Опишите свой переезд подробно и честно",
      details: [
        "Укажите точные адреса 'откуда' и 'куда'",
        "Выберите тип переезда и дату",
        "Опишите объем работ и особенности",
        "Приложите фото помещения (по желанию)"
      ],
      action: "Создать заявку",
      link: "/tasks/create"
    },
    {
      icon: Search,
      title: "3. Выбор исполнителя",
      description: "Изучите отклики и выберите лучшего",
      details: [
        "Смотрите рейтинги и отзывы исполнителей",
        "Сравнивайте цены и предложения",
        "Обращайте внимание на опыт работы",
        "Читайте комментарии в откликах"
      ],
      action: "Посмотреть заявки",
      link: "/tasks"
    },
    {
      icon: MessageCircle,
      title: "4. Общение и согласование",
      description: "Обсудите детали с выбранным исполнителем",
      details: [
        "Уточните время и стоимость",
        "Обсудите дополнительные услуги",
        "Договоритесь о способе оплаты",
        "Сохраняйте переписку в чате платформы"
      ],
      action: "Мои чаты",
      link: "/chats"
    },
    {
      icon: Star,
      title: "5. Оценка и отзыв",
      description: "Оцените качество работы исполнителя",
      details: [
        "Поставьте честную оценку от 1 до 5 звезд",
        "Напишите подробный отзыв о работе",
        "Отметьте плюсы и минусы",
        "Помогите другим заказчикам с выбором"
      ],
      action: "Мои отзывы",
      link: "/reviews"
    }
  ]

  const benefits = [
    {
      icon: Shield,
      title: "Безопасная сделка",
      description: "Все исполнители проверены. Гарантия возврата средств при некачественной работе."
    },
    {
      icon: Clock,
      title: "Экономия времени",
      description: "Не нужно искать исполнителей самостоятельно. Они сами откликнутся на вашу заявку."
    },
    {
      icon: Users,
      title: "Большой выбор",
      description: "5,000+ проверенных исполнителей готовы помочь с переездом любой сложности."
    },
    {
      icon: CreditCard,
      title: "Честные цены",
      description: "Конкуренция исполнителей обеспечивает справедливые цены на услуги."
    }
  ]

  const tips = [
    {
      title: "📝 Подробно описывайте заявку",
      description: "Чем больше деталей, тем точнее будет оценка стоимости."
    },
    {
      title: "⏰ Планируйте заранее",
      description: "Размещайте заявку за 3-7 дней до переезда для лучшего выбора."
    },
    {
      title: "📞 Общайтесь через платформу",
      description: "Вся переписка сохраняется и защищает ваши интересы."
    },
    {
      title: "💰 Сравнивайте предложения",
      description: "Не выбирайте только по цене — смотрите на рейтинг и отзывы."
    }
  ]

  const safetyTips = [
    {
      title: "✅ Проверенные исполнители",
      description: "Все исполнители проходят проверку документов и получают рейтинг от реальных заказчиков."
    },
    {
      title: "💬 Безопасное общение",
      description: "Вся переписка сохраняется на платформе и может быть использована при спорах."
    },
    {
      title: "🛡️ Защита платежей",
      description: "Деньги переводятся исполнителю только после подтверждения выполнения работ."
    },
    {
      title: "📞 Поддержка 24/7",
      description: "Наша служба поддержки поможет решить любые вопросы в процессе переезда."
    }
  ]

  return (
    <div className="py-8">
      {/* Hero секция */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg p-8 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏠 Руководство для заказчиков
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            Переезжайте легко и безопасно! Узнайте, как быстро найти надежных исполнителей на Luggo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-primary btn-lg">
              Создать заявку
            </Link>
            <Link to="/tasks" className="btn btn-secondary btn-lg">
              Посмотреть исполнителей
            </Link>
          </div>
        </div>
      </div>

      {/* Пошаговая инструкция */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Как организовать переезд через Luggo
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Следуйте этим простым шагам, чтобы найти лучших исполнителей для вашего переезда
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Icon className="text-green-600" size={24} />
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
            Почему заказчики выбирают Luggo?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Мы обеспечиваем безопасность, качество и удобство для каждого переезда
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="text-green-600" size={20} />
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

      {/* Советы для успешного переезда */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Советы для успешного переезда
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Эти рекомендации помогут вам получить лучший сервис и сэкономить время
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.map((tip, index) => (
            <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
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

      {/* Безопасность */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ваша безопасность — наш приоритет
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Мы создали систему защиты, которая обеспечивает безопасность каждой сделки
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safetyTips.map((tip, index) => (
            <div key={index} className="bg-blue-50 rounded-lg p-6 border border-blue-100">
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
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-8 mb-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="text-orange-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ваши отзывы помогают всем!
          </h2>
          <p className="text-gray-700 mb-6 max-w-3xl mx-auto">
            Каждый отзыв, который вы оставляете, помогает другим заказчикам сделать правильный выбор. 
            <strong> Честные отзывы — основа доверия на платформе!</strong>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">50,000+</div>
              <div className="text-sm text-gray-600">честных отзывов помогают в выборе</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">95%</div>
              <div className="text-sm text-gray-600">заказчиков читают отзывы перед выбором</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">4.8⭐</div>
              <div className="text-sm text-gray-600">средняя оценка качества работ</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 border mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Что писать в отзыве:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <div className="font-medium text-green-600 mb-2">✅ Что включить:</div>
                <ul className="space-y-1">
                  <li>• Пунктуальность исполнителя</li>
                  <li>• Качество упаковки вещей</li>
                  <li>• Профессионализм бригады</li>
                  <li>• Соответствие цены и качества</li>
                </ul>
              </div>
              <div>
                <div className="font-medium text-blue-600 mb-2">💡 Будьте объективны:</div>
                <ul className="space-y-1">
                  <li>• Укажите плюсы и минусы</li>
                  <li>• Опишите конкретные факты</li>
                  <li>• Будьте честны и справедливы</li>
                  <li>• Помогите другим заказчикам</li>
                </ul>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            💡 <strong>Помните:</strong> Ваш отзыв поможет исполнителю стать лучше, а другим заказчикам — сделать правильный выбор. 
            Вместе мы создаем сообщество честных и профессиональных переездов!
          </p>
        </div>
      </div>

      {/* Статистика и призыв к действию */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">
          Присоединяйтесь к 10,000+ довольных заказчиков!
        </h2>
        <p className="mb-6 opacity-90">
          Каждый день мы помогаем семьям и компаниям организовать безопасный переезд
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <Truck className="mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold">50,000+</div>
            <div className="text-sm opacity-80">Переездов выполнено</div>
          </div>
          <div>
            <Clock className="mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold">5 мин</div>
            <div className="text-sm opacity-80">Среднее время отклика</div>
          </div>
          <div>
            <Star className="mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold">4.8⭐</div>
            <div className="text-sm opacity-80">Средняя оценка</div>
          </div>
          <div>
            <Shield className="mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold">100%</div>
            <div className="text-sm opacity-80">Гарантия безопасности</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/tasks/create"
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Создать заявку на переезд
          </Link>
          <Link 
            to="/tasks"
            className="bg-green-800 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-900 transition-colors"
          >
            Посмотреть примеры работ
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CustomersGuidePage 