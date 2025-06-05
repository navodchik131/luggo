import { useState, useEffect, useRef } from 'react'
import { YANDEX_CONFIG, hasValidApiKey, getGeocoderUrl } from '../config/yandex'

const AddressAutocomplete = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "Введите адрес...",
  required = false,
  className = "",
  error = null
}) => {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')
  const timeoutRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setInputValue(value || '')
  }, [value])

  const searchAddresses = async (query) => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const url = getGeocoderUrl(query)
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Ошибка получения данных')
      }

      const data = await response.json()
      const addresses = []

      if (data?.response?.GeoObjectCollection?.featureMember) {
        data.response.GeoObjectCollection.featureMember.forEach(item => {
          const geoObject = item.GeoObject
          const address = geoObject.metaDataProperty.GeocoderMetaData.text
          
          // Фильтруем только адреса в Перми
          if (address.includes(YANDEX_CONFIG.DEFAULT_CITY)) {
            addresses.push({
              address: address,
              coordinates: geoObject.Point.pos.split(' ').reverse() // [lat, lng]
            })
          }
        })
      }

      setSuggestions(addresses)
    } catch (error) {
      console.error('Ошибка поиска адресов:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fallback для случая отсутствия API ключа - используем статичные примеры
  const searchAddressesFallback = (query) => {
    const mockAddresses = [
      { address: `ул. ${query}, ${YANDEX_CONFIG.DEFAULT_CITY}`, coordinates: YANDEX_CONFIG.DEFAULT_COORDINATES },
      { address: `${query}, ${YANDEX_CONFIG.DEFAULT_CITY}`, coordinates: [58.0095, 56.2512] },
      { address: `проспект ${query}, ${YANDEX_CONFIG.DEFAULT_CITY}`, coordinates: [58.0085, 56.2522] },
      { address: `микрорайон ${query}, ${YANDEX_CONFIG.DEFAULT_CITY}`, coordinates: [58.0075, 56.2532] }
    ].filter(item => 
      item.address.toLowerCase().includes(query.toLowerCase())
    )
    
    setSuggestions(mockAddresses.slice(0, 5))
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setShowSuggestions(true)

    // Очищаем предыдущий таймаут
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Устанавливаем новый таймаут для поиска
    timeoutRef.current = setTimeout(() => {
      if (hasValidApiKey()) {
        searchAddresses(newValue)
      } else {
        // Используем fallback если нет API ключа
        if (newValue.length >= 3) {
          searchAddressesFallback(newValue)
        } else {
          setSuggestions([])
        }
      }
    }, 300)
  }

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.address)
    setShowSuggestions(false)
    setSuggestions([])
    
    // Передаем выбранный адрес в родительский компонент
    if (onChange) {
      onChange({
        target: {
          value: suggestion.address,
          coordinates: suggestion.coordinates
        }
      })
    }
  }

  const handleBlur = () => {
    // Задержка чтобы клик по suggestion успел сработать
    setTimeout(() => {
      setShowSuggestions(false)
    }, 200)
  }

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  // Обновляем родительский компонент при изменении значения
  useEffect(() => {
    if (onChange && inputValue !== value) {
      onChange({
        target: {
          value: inputValue
        }
      })
    }
  }, [inputValue])

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className}`}
        />
        
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Список предложений */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400">📍</span>
                <span className="text-sm">{suggestion.address}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Сообщение об ошибке */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Подсказка */}
      <p className="mt-1 text-xs text-gray-500">
        {!hasValidApiKey() 
          ? `💡 Для работы автоподстановки добавьте API ключ Яндекс.Карт в .env`
          : `💡 Начните вводить адрес в г. ${YANDEX_CONFIG.DEFAULT_CITY}`
        }
      </p>
    </div>
  )
}

export default AddressAutocomplete 