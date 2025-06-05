import { Shield, Lock, Eye, Database } from 'lucide-react'

const PrivacyPage = () => {
  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-blue-600" size={24} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Политика конфиденциальности
          </h1>
          <p className="text-gray-600">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>

        {/* Введение */}
        <div className="bg-blue-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Ваша конфиденциальность важна для нас</h2>
          <p className="text-gray-700">
            Компания Luggo серьезно относится к защите персональных данных пользователей. 
            Эта политика объясняет, какую информацию мы собираем, как используем и защищаем ваши данные.
          </p>
        </div>

        {/* Разделы */}
        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <Database className="text-blue-600" size={20} />
              <h2 className="text-2xl font-bold text-gray-900">Какую информацию мы собираем</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-semibold mb-2">Личная информация:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
                <li>Имя, фамилия, отчество</li>
                <li>Адрес электронной почты</li>
                <li>Номер телефона</li>
                <li>Адреса для переезда</li>
                <li>Фотографии (для исполнителей)</li>
              </ul>
              
              <h3 className="text-lg font-semibold mb-2">Техническая информация:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>IP-адрес и геолокация</li>
                <li>Данные об устройстве и браузере</li>
                <li>Файлы cookie</li>
                <li>Журналы активности на сайте</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Eye className="text-blue-600" size={20} />
              <h2 className="text-2xl font-bold text-gray-900">Как мы используем информацию</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">Мы используем собранную информацию для:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Предоставления услуг платформы</li>
                <li>Связи заказчиков и исполнителей</li>
                <li>Обработки платежей и расчетов</li>
                <li>Улучшения качества сервиса</li>
                <li>Обеспечения безопасности платформы</li>
                <li>Отправки уведомлений и важной информации</li>
                <li>Анализа и статистики использования</li>
              </ul>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-blue-600" size={20} />
              <h2 className="text-2xl font-bold text-gray-900">Защита данных</h2>
            </div>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">Мы применяем современные меры защиты:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">🔐 Шифрование</h4>
                  <p className="text-sm text-gray-600">SSL/TLS шифрование всех данных при передаче</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">🛡️ Защищенные серверы</h4>
                  <p className="text-sm text-gray-600">Данные хранятся на защищенных серверах</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">🔑 Контроль доступа</h4>
                  <p className="text-sm text-gray-600">Ограниченный доступ сотрудников к данным</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">📱 Двухфакторная аутентификация</h4>
                  <p className="text-sm text-gray-600">Дополнительная защита аккаунтов</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Передача данных третьим лицам</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">Мы не продаем и не передаем ваши данные третьим лицам, за исключением:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Требований правоохранительных органов</li>
                <li>Необходимости предоставления услуг (платежные системы)</li>
                <li>Вашего явного согласия</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ваши права</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">В соответствии с законодательством РФ, вы имеете право:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">📋 Доступ к данным</h4>
                  <p className="text-sm text-gray-600">Получить копию всех ваших данных</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">✏️ Исправление</h4>
                  <p className="text-sm text-gray-600">Исправить неточные данные</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">🗑️ Удаление</h4>
                  <p className="text-sm text-gray-600">Удалить ваши данные при закрытии аккаунта</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">🚫 Ограничение</h4>
                  <p className="text-sm text-gray-600">Ограничить обработку данных</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Файлы Cookie</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 mb-4">
                Мы используем файлы cookie для улучшения работы сайта. Вы можете отключить cookie в настройках браузера, 
                но это может ограничить функциональность сайта.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Контактная информация</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                По вопросам конфиденциальности обращайтесь:
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> privacy@luggo.ru</p>
                <p><strong>Телефон:</strong> 8 (800) 123-45-67</p>
                <p><strong>Адрес:</strong> г. Москва, ул. Примерная, д. 123</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPage 