import { Mail, Phone, MessageCircle, Clock, HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const SupportPage = () => {
  const faqItems = [
    {
      question: "Как создать заявку на переезд?",
      answer: "Перейдите на страницу 'Создать заявку', заполните все необходимые поля: откуда и куда переезжаете, дату, описание. После публикации заявки исполнители начнут присылать свои предложения."
    },
    {
      question: "Как выбрать надежного исполнителя?",
      answer: "Обращайте внимание на рейтинг исполнителя, отзывы других клиентов, срок работы на платформе. Обязательно пообщайтесь в чате перед принятием решения."
    },
    {
      question: "Сколько стоят услуги платформы?",
      answer: "Для заказчиков платформа полностью бесплатна. Вы платите только исполнителю за выполненную работу. Никаких скрытых комиссий."
    },
    {
      question: "Что делать, если исполнитель не выходит на связь?",
      answer: "Обратитесь в службу поддержки через чат или по телефону. Мы поможем решить проблему и найти замену исполнителю."
    },
    {
      question: "Как стать исполнителем на платформе?",
      answer: "Зарегистрируйтесь, выберите роль 'Исполнитель', заполните профиль, загрузите документы. После проверки вы сможете откликаться на заявки."
    }
  ]

  const contactMethods = [
    {
      icon: Phone,
      title: "Телефон",
      subtitle: "Круглосуточная поддержка",
      value: "8 (964) 185-42-46",
      link: "tel:+79641854246",
      description: "Звоните в любое время - наши операторы всегда готовы помочь"
    },
    {
      icon: Mail,
      title: "Email",
      subtitle: "Ответ в течение 2 часов",
      value: "support@luggo.ru",
      link: "mailto:support@luggo.ru",
      description: "Подробно опишите вашу проблему, приложите скриншоты если нужно"
    },
    {
      icon: MessageCircle,
      title: "Онлайн-чат",
      subtitle: "Мгновенные ответы",
      value: "Чат на сайте",
      link: "/chats",
      isInternal: true,
      description: "Самый быстрый способ получить помощь от наших специалистов"
    }
  ]

  return (
    <div className="py-8">
      {/* Заголовок */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Центр поддержки
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Мы всегда готовы помочь! Найдите ответы на частые вопросы или свяжитесь с нашей службой поддержки.
        </p>
      </div>

      {/* Способы связи */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Как с нами связаться</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactMethods.map((method, index) => {
            const Icon = method.icon
            const content = (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow group">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Icon size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{method.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{method.subtitle}</p>
                <p className="font-medium text-blue-600 mb-3">{method.value}</p>
                <p className="text-xs text-gray-500">{method.description}</p>
              </div>
            )

            return method.isInternal ? (
              <Link key={index} to={method.link}>
                {content}
              </Link>
            ) : (
              <a key={index} href={method.link}>
                {content}
              </a>
            )
          })}
        </div>
      </div>

      {/* Время работы поддержки */}
      <div className="bg-blue-50 rounded-lg p-8 mb-16">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Clock className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Время работы поддержки</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Телефон и чат</h3>
            <p className="text-gray-700">Круглосуточно, 7 дней в неделю</p>
            <p className="text-sm text-gray-600">Мгновенные ответы</p>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-700">Ответ в течение 2 часов</p>
            <p className="text-sm text-gray-600">Подробные консультации</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="text-yellow-600" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Частые вопросы</h2>
          <p className="text-gray-600 mt-2">Возможно, ваш вопрос уже есть в нашем списке</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <details key={index} className="bg-white rounded-lg border border-gray-200 p-6 group">
              <summary className="cursor-pointer flex items-center justify-between font-medium text-gray-900 hover:text-blue-600 transition-colors">
                {item.question}
                <span className="text-gray-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="mt-4 text-gray-700 text-sm leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-center text-white mb-16">
        <h2 className="text-2xl font-bold mb-4">Не нашли ответ на свой вопрос?</h2>
        <p className="mb-6 opacity-90">
          Наша команда поддержки всегда готова помочь вам решить любую проблему
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="tel:+79641854246"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            📞 Позвонить сейчас
          </a>
          <Link 
            to="/chats"
            className="bg-blue-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-900 transition-colors"
          >
            💬 Написать в чат
          </Link>
        </div>
      </div>

      {/* Реквизиты и процесс получения услуг */}
      <div className="space-y-8">
        {/* Процесс получения услуг */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            🚚 Как происходит оказание услуг переезда
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Подача заявки</h3>
              <p className="text-sm text-gray-600">Клиент создает заявку на переезд с указанием адресов и требований</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Выбор исполнителя</h3>
              <p className="text-sm text-gray-600">Исполнители присылают отклики, клиент выбирает подходящего</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-600 font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Выполнение</h3>
              <p className="text-sm text-gray-600">Исполнитель приезжает по адресу и выполняет переезд</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-xl">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Оплата и отзыв</h3>
              <p className="text-sm text-gray-600">Клиент оплачивает услугу исполнителю и оставляет отзыв</p>
            </div>
          </div>
        </div>

        {/* Примерные цены на услуги */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            💰 Примерная стоимость услуг переезда
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">🏠 Квартирный переезд</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• 1-комнатная: от 3 000 ₽</li>
                <li>• 2-комнатная: от 5 000 ₽</li>
                <li>• 3-комнатная: от 7 000 ₽</li>
                <li>• Упаковка: +1 000 ₽</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">🏢 Офисный переезд</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Малый офис: от 8 000 ₽</li>
                <li>• Средний офис: от 15 000 ₽</li>
                <li>• Большой офис: от 30 000 ₽</li>
                <li>• Демонтаж: +20% к стоимости</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">🚛 Дополнительно</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Грузчик: от 500 ₽/час</li>
                <li>• Газель: от 1 000 ₽/час</li>
                <li>• Фура: от 2 000 ₽/час</li>
                <li>• Вывоз мусора: от 2 000 ₽</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center mt-4">
            * Цены указаны ориентировочно и зависят от сложности, расстояния и других факторов
          </p>
        </div>

        {/* Реквизиты */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            📋 Реквизиты и правовая информация
          </h2>
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Самозанятый</h3>
                <p className="text-gray-700">Уточкин Ренат Михайлович</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">ИНН</h3>
                <p className="text-gray-700">590313258640</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Статус</h3>
                <p className="text-gray-700">Плательщик налога на профессиональный доход</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Дата регистрации</h3>
                <p className="text-gray-700">15.03.2024</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Контакты</h3>
              <p className="text-gray-700">
                Телефон: +7 (964) 185-42-46<br/>
                Email: support@luggo.ru<br/>
                Сайт: luggo.ru
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupportPage 