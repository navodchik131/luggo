import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white">
      {/* Основная часть footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* О компании */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-2xl font-bold text-blue-400">
                Luggo
              </Link>
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                BETA
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Современная платформа для поиска исполнителей переездов. 
              Связываем заказчиков с проверенными специалистами быстро и безопасно.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Навигация */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Разделы</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/tasks" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Заявки на переезд
                </Link>
              </li>
              <li>
                <Link to="/executors" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Исполнители
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Новости
                </Link>
              </li>
              <li>
                <Link to="/create-task" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Создать заявку
                </Link>
              </li>
            </ul>
          </div>

          {/* Услуги */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Услуги</h3>
            <ul className="space-y-2">
              <li className="text-gray-300 text-sm flex items-center gap-2">
                <span>🏠</span>
                Квартирный переезд
              </li>
              <li className="text-gray-300 text-sm flex items-center gap-2">
                <span>🏢</span>
                Офисный переезд
              </li>
              <li className="text-gray-300 text-sm flex items-center gap-2">
                <span>🚛</span>
                Межгородские переезды
              </li>
              <li className="text-gray-300 text-sm flex items-center gap-2">
                <span>🗑️</span>
                Вывоз мусора
              </li>
              <li className="text-gray-300 text-sm flex items-center gap-2">
                <span>📦</span>
                Упаковка вещей
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Контакты</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-blue-400 flex-shrink-0" />
                <div>
                  <div className="text-gray-300">Поддержка 24/7</div>
                  <a href="tel:+78001234567" className="text-white hover:text-blue-400 transition-colors">
                    8 (800) 123-45-67
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-blue-400 flex-shrink-0" />
                <div>
                  <div className="text-gray-300">Email</div>
                  <a href="mailto:support@luggo.ru" className="text-white hover:text-blue-400 transition-colors">
                    support@luggo.ru
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-gray-300">Адрес</div>
                  <div className="text-white">
                    г. Москва,<br />
                    ул. Примерная, д. 123
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">10,000+</div>
              <div className="text-sm text-gray-300">Пользователей</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">5,000+</div>
              <div className="text-sm text-gray-300">Исполнителей</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">50,000+</div>
              <div className="text-sm text-gray-300">Выполненных заказов</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">4.8/5</div>
              <div className="text-sm text-gray-300">Средний рейтинг</div>
            </div>
          </div>
        </div>
      </div>

      {/* Нижняя часть footer */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-400">
              © {currentYear} Luggo. Все права защищены.
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Политика конфиденциальности
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Условия использования
              </Link>
              <Link to="/support" className="text-gray-400 hover:text-white transition-colors">
                Поддержка
              </Link>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Сделано с</span>
              <span className="text-red-400">❤️</span>
              <span>в России</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 