// Конфигурация для Яндекс API

// Для добавления API ключей отредактируйте эти значения:
const GEOCODER_API_KEY = 'ваш_ключ_API' // Замените на реальный ключ из Яндекс API
const MAPS_API_KEY = 'ваш_ключ_API' // Замените на реальный ключ из Яндекс API

export const YANDEX_CONFIG = {
  // Geocoder API ключ (для автоподстановки адресов)
  GEOCODER_API_KEY: GEOCODER_API_KEY,
  
  // Maps JavaScript API ключ (для карт)
  MAPS_API_KEY: MAPS_API_KEY,
  
  // Настройки по умолчанию
  DEFAULT_CITY: 'Пермь',
  DEFAULT_COORDINATES: [58.0105, 56.2502], // [lat, lng] для Перми
  
  // Ограничения поиска
  SEARCH_OPTIONS: {
    results: 5,
    lang: 'ru_RU',
    geocode_format: 'json'
  }
}

// Проверка доступности API ключей
export const hasValidApiKey = () => {
  return YANDEX_CONFIG.GEOCODER_API_KEY && 
         YANDEX_CONFIG.GEOCODER_API_KEY !== 'ваш_ключ_API' &&
         YANDEX_CONFIG.GEOCODER_API_KEY.length > 10
}

// Получение URL для геокодирования
export const getGeocoderUrl = (query) => {
  const searchQuery = query.includes(YANDEX_CONFIG.DEFAULT_CITY) 
    ? query 
    : `${query}, ${YANDEX_CONFIG.DEFAULT_CITY}`
    
  const params = new URLSearchParams({
    apikey: YANDEX_CONFIG.GEOCODER_API_KEY,
    geocode: searchQuery,
    format: YANDEX_CONFIG.SEARCH_OPTIONS.geocode_format,
    results: YANDEX_CONFIG.SEARCH_OPTIONS.results,
    lang: YANDEX_CONFIG.SEARCH_OPTIONS.lang
  })
  
  return `https://geocode-maps.yandex.ru/1.x/?${params.toString()}`
} 