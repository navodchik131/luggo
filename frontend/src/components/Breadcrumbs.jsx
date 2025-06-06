import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const Breadcrumbs = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return null
  }

  const allItems = [
    { name: 'Главная', url: '/', icon: Home },
    ...items
  ]

  return (
    <nav aria-label="Хлебные крошки" className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
      {allItems.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
          )}
          
          {index === allItems.length - 1 ? (
            // Последний элемент (текущая страница)
            <span className="text-gray-900 font-medium flex items-center">
              {index === 0 && item.icon && <item.icon className="w-4 h-4 mr-1" />}
              {item.name}
            </span>
          ) : (
            // Ссылки на родительские страницы
            <Link 
              to={item.url} 
              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center transition-colors"
            >
              {index === 0 && item.icon && <item.icon className="w-4 h-4 mr-1" />}
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}

export default Breadcrumbs 