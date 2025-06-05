import { FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

const TermsPage = () => {
  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-blue-600" size={24} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Условия использования
          </h1>
          <p className="text-gray-600">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>

        {/* Введение */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Добро пожаловать на Luggo!</h2>
          <p className="text-gray-700">
            Используя нашу платформу, вы соглашаетесь с данными условиями использования. 
            Пожалуйста, внимательно ознакомьтесь с ними перед началом работы.
          </p>
        </div>

        {/* Разделы */}
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Описание сервиса</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                Luggo — это онлайн-платформа, которая соединяет заказчиков, нуждающихся в услугах переезда, 
                с исполнителями, предоставляющими эти услуги.
              </p>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">🎯 Наша миссия</h4>
                <p className="text-sm text-gray-600">
                  Сделать процесс поиска исполнителей для переезда простым, безопасным и эффективным
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Регистрация и аккаунты</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">Для использования платформы необходимо:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                <li>Быть не младше 18 лет</li>
                <li>Предоставить достоверную информацию</li>
                <li>Иметь действующий адрес электронной почты</li>
                <li>Подтвердить номер телефона</li>
              </ul>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="text-yellow-600" size={16} />
                  <span className="font-semibold text-yellow-800">Важно</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Вы несете ответственность за безопасность своего аккаунта и пароля
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Права и обязанности пользователей</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Разрешено */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="text-green-600" size={20} />
                  <h3 className="font-semibold text-green-800">Разрешено</h3>
                </div>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>✅ Создавать честные заявки</li>
                  <li>✅ Оставлять правдивые отзывы</li>
                  <li>✅ Общаться вежливо</li>
                  <li>✅ Соблюдать договоренности</li>
                  <li>✅ Сообщать о нарушениях</li>
                </ul>
              </div>

              {/* Запрещено */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <XCircle className="text-red-600" size={20} />
                  <h3 className="font-semibold text-red-800">Запрещено</h3>
                </div>
                <ul className="space-y-2 text-sm text-red-700">
                  <li>❌ Создавать фальшивые аккаунты</li>
                  <li>❌ Накручивать рейтинг</li>
                  <li>❌ Размещать спам</li>
                  <li>❌ Нарушать законы РФ</li>
                  <li>❌ Обходить платежи</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Платежи и комиссии</h2>
            <div className="prose prose-gray max-w-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">👤 Для заказчиков</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Создание заявок — бесплатно</li>
                    <li>• Поиск исполнителей — бесплатно</li>
                    <li>• Общение — бесплатно</li>
                    <li>• Комиссия — 0%</li>
                  </ul>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">🔧 Для исполнителей</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Просмотр заявок — бесплатно</li>
                    <li>• Отклики — бесплатно</li>
                    <li>• Общение — бесплатно</li>
                    <li>• Комиссия — 5% с заказа</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Ответственность</h2>
            <div className="prose prose-gray max-w-none">
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <h3 className="font-semibold text-gray-900 mb-3">Luggo не несет ответственности за:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Качество выполнения услуг исполнителями</li>
                  <li>Действия пользователей платформы</li>
                  <li>Ущерб имуществу во время переезда</li>
                  <li>Споры между заказчиками и исполнителями</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Мы обеспечиваем:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Работу платформы и технической поддержки</li>
                  <li>Защиту персональных данных</li>
                  <li>Модерацию контента</li>
                  <li>Разрешение споров (по возможности)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Модерация и нарушения</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">За нарушение правил платформы применяются санкции:</p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-600 text-lg">⚠️</span>
                  <div>
                    <div className="font-medium text-gray-900">Предупреждение</div>
                    <div className="text-sm text-gray-600">За незначительные нарушения</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <span className="text-orange-600 text-lg">🔒</span>
                  <div>
                    <div className="font-medium text-gray-900">Временная блокировка</div>
                    <div className="text-sm text-gray-600">От 1 дня до 1 месяца</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <span className="text-red-600 text-lg">🚫</span>
                  <div>
                    <div className="font-medium text-gray-900">Перманентная блокировка</div>
                    <div className="text-sm text-gray-600">За серьезные нарушения</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Изменение условий</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                Мы можем изменять данные условия. О существенных изменениях мы уведомляем пользователей 
                за 30 дней до их вступления в силу.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Контактная информация</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                По вопросам условий использования обращайтесь:
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> legal@luggo.ru</p>
                <p><strong>Телефон:</strong> 8 (800) 123-45-67</p>
                <p><strong>Адрес:</strong> г. Москва, ул. Примерная, д. 123</p>
              </div>
            </div>
          </section>
        </div>

        {/* Соглашение */}
        <div className="mt-12 bg-blue-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-xl font-bold mb-4">
            Используя платформу Luggo, вы соглашаетесь с данными условиями
          </h2>
          <p className="opacity-90">
            Дата вступления в силу: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default TermsPage 