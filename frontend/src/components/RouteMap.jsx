import { useEffect, useRef, useState } from 'react'
import { YANDEX_CONFIG, hasValidApiKey } from '../config/yandex'
import logger from '../utils/logger'

// Добавляем стили для контроля Yandex карт
const mapStyles = `
  .route-map-container .ymaps-2-1-79-balloon,
  .route-map-container .ymaps-2-1-79-hint,
  .route-map-container .ymaps-2-1-79-popup,
  .route-map-container .ymaps-2-1-79-popup-content {
    display: none !important;
  }
  
  .route-map-container [class*="ymaps-"]:not([class*="ymaps-2-1-"]) {
    display: none !important;
  }
  
  .route-map-container > div {
    position: relative !important;
    overflow: hidden !important;
  }
`

// Добавляем стили в head если их еще нет
if (!document.querySelector('#route-map-styles')) {
  const styleElement = document.createElement('style')
  styleElement.id = 'route-map-styles'
  styleElement.textContent = mapStyles
  document.head.appendChild(styleElement)
}

// Временный режим отладки - можно включить если карты не работают
const DEBUG_MODE = false // Поменяйте на true для отладки

const RouteMap = ({ fromAddress, toAddress }) => {
  // Логирование при каждом рендере компонента
  logger.log('🔥 RouteMap рендерится с пропсами:', { 
    fromAddress: fromAddress || 'НЕТ',
    toAddress: toAddress || 'НЕТ',
    fromAddressLength: fromAddress?.length || 0,
    toAddressLength: toAddress?.length || 0
  })

  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const [mapInstance, setMapInstance] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFallbackMode, setIsFallbackMode] = useState(false)
  const mapId = useRef(`route_map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const isInitialized = useRef(false)
  const isDestroying = useRef(false)

  useEffect(() => {
    logger.log('🚀 RouteMap useEffect запущен:', { fromAddress, toAddress, hasApiKey: hasValidApiKey() })
    
    if (!hasValidApiKey() || !fromAddress || !toAddress) {
      logger.log('⚠️ Условия не выполнены:', {
        hasApiKey: hasValidApiKey(),
        hasFromAddress: !!fromAddress,
        hasToAddress: !!toAddress,
        fromAddress,
        toAddress
      })
      setLoading(false)
      return
    }

    // Защита от повторной инициализации 
    if (isInitialized.current || isDestroying.current) {
      logger.log('⚠️ Блокировка повторной инициализации:', {
        isInitialized: isInitialized.current,
        isDestroying: isDestroying.current
      })
      return
    }
    isInitialized.current = true

    logger.log('✅ Все условия выполнены, запускаю загрузку карт...')
    loadYandexMaps()

    // Cleanup function
    return () => {
      cleanup()
    }
  }, [fromAddress, toAddress])

  const cleanup = () => {
    isDestroying.current = true
    
    if (mapInstance) {
      try {
        mapInstance.destroy()
      } catch (err) {
        logger.log('Error destroying map:', err)
      }
      setMapInstance(null)
    }
    
    // Очищаем контейнер карты
    if (mapContainerRef.current) {
      mapContainerRef.current.innerHTML = ''
    }
    
    // Удаляем все ymaps элементы, которые могли остаться
    setTimeout(() => {
      const ymapsElements = document.querySelectorAll(`[id*="${mapId.current}"], [class*="ymaps"]:not([class*="ymaps-2-1-"]), .ymaps-2-1-79-balloon, .ymaps-2-1-79-hint`)
      ymapsElements.forEach(el => {
        try {
          if (el.parentNode) {
            el.parentNode.removeChild(el)
          }
        } catch (err) {
          logger.log('Error removing element:', err)
        }
      })
    }, 100)
    
    isInitialized.current = false
    isDestroying.current = false
  }

  const loadYandexMaps = async () => {
    try {
      logger.log('🗺️ Начинаю загрузку Яндекс карт...')
      logger.log('🔑 API ключ есть:', !!YANDEX_CONFIG.MAPS_API_KEY)
      logger.log('📍 Адреса:', { fromAddress, toAddress })
      
      // Проверяем, не загружен ли уже API
      if (!window.ymaps) {
        logger.log('📦 Яндекс карты не загружены, загружаю...')
        
        // Проверяем не идет ли уже загрузка
        if (window.ymapsLoading) {
          logger.log('⏳ Ожидаю завершения текущей загрузки...')
          // Ждем завершения загрузки
          const checkLoaded = () => {
            if (window.ymaps) {
              logger.log('✅ Яндекс карты загружены, инициализирую...')
              window.ymaps.ready(initMap)
            } else if (window.ymapsLoading) {
              setTimeout(checkLoaded, 100)
            } else {
              logger.error('❌ Ошибка загрузки Яндекс.Карт')
              setError('Ошибка загрузки Яндекс.Карт')
              setLoading(false)
            }
          }
          checkLoaded()
          return
        }

        // Устанавливаем флаг загрузки
        window.ymapsLoading = true
        
        // Удаляем старые скрипты если есть
        const existingScripts = document.querySelectorAll('script[src*="api-maps.yandex.ru"]')
        logger.log('🧹 Удаляю старые скрипты:', existingScripts.length)
        existingScripts.forEach(script => script.remove())
        
        // Удаляем старые элементы карт если есть
        const existingMaps = document.querySelectorAll('[class*="ymaps"]')
        logger.log('🧹 Удаляю старые карты:', existingMaps.length)
        existingMaps.forEach(mapEl => {
          if (mapEl !== mapRef.current) {
            mapEl.remove()
          }
        })
        
        const script = document.createElement('script')
        const scriptUrl = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_CONFIG.MAPS_API_KEY}&lang=ru_RU`
        script.src = scriptUrl
        logger.log('🔗 Загружаю скрипт:', scriptUrl)
        
        script.onload = () => {
          logger.log('✅ Скрипт Яндекс карт загружен успешно')
          window.ymapsLoading = false
          window.ymaps.ready(initMap)
        }
        script.onerror = (error) => {
          logger.error('❌ Ошибка загрузки скрипта Яндекс карт:', error)
          window.ymapsLoading = false
          setError('Ошибка загрузки Яндекс.Карт - проверьте интернет-соединение')
          setLoading(false)
        }
        document.head.appendChild(script)
      } else {
        logger.log('✅ Яндекс карты уже загружены, инициализирую...')
        // API уже загружен, просто инициализируем карту
        if (window.ymaps.ready) {
          window.ymaps.ready(initMap)
        } else {
          initMap()
        }
      }
    } catch (err) {
      window.ymapsLoading = false
      logger.error('💥 Критическая ошибка загрузки карт:', err)
      setError(`Ошибка загрузки карт: ${err.message}`)
      setLoading(false)
    }
  }

  const initMap = async () => {
    try {
      logger.log('🚀 Начинаю инициализацию карты...')
      
      // Проверяем готовность к инициализации
      if (isDestroying.current || !mapContainerRef.current) {
        logger.log('⚠️ Отменяю инициализацию - компонент уничтожается или нет контейнера')
        setLoading(false)
        return
      }

      // Очищаем контейнер и создаем новый элемент для карты
      mapContainerRef.current.innerHTML = ''
      const mapElement = document.createElement('div')
      mapElement.id = mapId.current
      mapElement.style.width = '100%'
      mapElement.style.height = '300px'
      mapElement.style.position = 'relative'
      mapContainerRef.current.appendChild(mapElement)
      
      mapRef.current = mapElement
      logger.log('📦 Создан контейнер карты:', mapId.current)

      // Геокодируем адреса
      logger.log('🔍 Начинаю геокодирование адресов...')
      const [fromCoords, toCoords] = await Promise.all([
        geocodeAddress(fromAddress),
        geocodeAddress(toAddress)
      ])

      if (!fromCoords || !toCoords) {
        logger.error('❌ Не удалось найти координаты:', { fromCoords, toCoords })
        setError('Не удалось найти адреса на карте')
        setLoading(false)
        return
      }

      logger.log('📍 Координаты получены:', { fromCoords, toCoords })

      // Создаем карту с отключением ненужных элементов
      logger.log('🗺️ Создаю карту...')
      const map = new window.ymaps.Map(mapElement, {
        center: fromCoords,
        zoom: 12,
        controls: ['zoomControl']
      }, {
        suppressMapOpenBlock: true,
        yandexMapDisablePoiInteractivity: true
      })

      setMapInstance(map)

      // Добавляем метки без баллунов
      const fromPlacemark = new window.ymaps.Placemark(fromCoords, {
        hintContent: `Откуда: ${fromAddress}`
      }, {
        preset: 'islands#greenDotIcon',
        hideIconOnBalloonOpen: false,
        openBalloonOnClick: false
      })

      const toPlacemark = new window.ymaps.Placemark(toCoords, {
        hintContent: `Куда: ${toAddress}`
      }, {
        preset: 'islands#redDotIcon',
        hideIconOnBalloonOpen: false,
        openBalloonOnClick: false
      })

      map.geoObjects.add(fromPlacemark)
      map.geoObjects.add(toPlacemark)

      // Строим маршрут
      buildRoute(map, fromCoords, toCoords)

    } catch (err) {
      logger.error('Ошибка инициализации карты:', err)
      setError('Ошибка инициализации карты')
      setLoading(false)
    }
  }

  const geocodeAddress = async (address) => {
    try {
      logger.log('🔍 Геокодирую адрес:', address)
      const result = await window.ymaps.geocode(address, {
        results: 1
      })
      
      logger.log('📊 Результат геокодирования:', result)
      const firstGeoObject = result.geoObjects.get(0)
      
      if (firstGeoObject) {
        const coords = firstGeoObject.geometry.getCoordinates()
        logger.log('✅ Координаты найдены:', coords)
        return coords
      }
      
      logger.warn('⚠️ Адрес не найден:', address)
      return null
    } catch (err) {
      logger.error('❌ Ошибка геокодирования:', err)
      return null
    }
  }

  const buildRoute = async (map, fromCoords, toCoords) => {
    try {
      // Проверяем доступность MultiRouter API
      if (window.ymaps.multiRouter) {
        // Создаем мультимаршрут
        const multiRoute = new window.ymaps.multiRouter.MultiRoute({
          referencePoints: [fromCoords, toCoords],
          params: {
            routingMode: 'auto'
          }
        }, {
          boundsAutoApply: true,
          routeActiveStrokeWidth: 6,
          routeActiveStrokeColor: '#3b82f6',
          wayPointVisible: false,
          routeStrokeWidth: 4,
          routeStrokeColor: '#3b82f6',
          pinVisible: false
        })

        map.geoObjects.add(multiRoute)

        // Ждем построения маршрута
        multiRoute.model.events.add('requestsuccess', () => {
          try {
            const routes = multiRoute.getRoutes()
            if (routes.getLength() > 0) {
              const activeRoute = routes.get(0)
              const distance = activeRoute.properties.get('distance')
              const duration = activeRoute.properties.get('duration')

              setRouteInfo({
                distance: Math.round(distance.value / 1000 * 10) / 10, // км с одним знаком
                duration: Math.round(duration.value / 60), // минуты
                durationText: formatDuration(Math.round(duration.value / 60))
              })
            }
            setLoading(false)
          } catch (err) {
            logger.error('Ошибка обработки маршрута:', err)
            setError('Ошибка обработки маршрута')
            setLoading(false)
          }
        })

        multiRoute.model.events.add('requestfail', () => {
          setError('Не удалось построить маршрут')
          setLoading(false)
        })
      } else {
        // Fallback: простая линия между точками
        setIsFallbackMode(true)
        const polyline = new window.ymaps.Polyline([fromCoords, toCoords], {}, {
          strokeColor: '#3b82f6',
          strokeWidth: 4,
          strokeOpacity: 0.8
        })
        
        map.geoObjects.add(polyline)
        
        // Подгоняем карту под точки
        map.setBounds([fromCoords, toCoords], {
          checkZoomRange: true,
          zoomMargin: 50
        })

        // Примерный расчет расстояния по прямой
        const distance = calculateDistance(fromCoords, toCoords)
        const estimatedDuration = Math.round(distance * 2) // 2 минуты на км примерно
        
        setRouteInfo({
          distance: Math.round(distance * 10) / 10,
          duration: estimatedDuration,
          durationText: formatDuration(estimatedDuration)
        })
        
        setLoading(false)
      }

    } catch (err) {
      logger.error('Ошибка построения маршрута:', err)
      setError('Не удалось построить маршрут')
      setLoading(false)
    }
  }

  // Функция для расчета расстояния между координатами
  const calculateDistance = (coords1, coords2) => {
    const R = 6371 // Радиус Земли в км
    const lat1 = coords1[0] * Math.PI / 180
    const lat2 = coords2[0] * Math.PI / 180
    const deltaLat = (coords2[0] - coords1[0]) * Math.PI / 180
    const deltaLng = (coords2[1] - coords1[1]) * Math.PI / 180

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} мин`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return remainingMinutes > 0 
        ? `${hours} ч ${remainingMinutes} мин`
        : `${hours} ч`
    }
  }

  // Если включен режим отладки - показываем простую информацию без карты
  if (DEBUG_MODE) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-blue-500 text-2xl">🗺️</div>
          <div>
            <h3 className="font-semibold text-blue-800 text-sm sm:text-base">Режим отладки</h3>
            <p className="text-blue-600 text-xs sm:text-sm">Карта отключена для диагностики</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-200">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">📍</span>
              <div>
                <span className="font-medium text-gray-700">Откуда:</span>
                <div className="text-gray-600">{fromAddress || 'Не указано'}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">📍</span>
              <div>
                <span className="font-medium text-gray-700">Куда:</span>
                <div className="text-gray-600">{toAddress || 'Не указано'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!hasValidApiKey()) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-gray-400 text-4xl mb-2">🗺️</div>
        <h3 className="font-semibold text-gray-700 mb-2">Карта недоступна</h3>
        <p className="text-sm text-gray-600">
          Для отображения карты с маршрутом необходим API ключ Яндекс.Карт
        </p>
      </div>
    )
  }

  if (!fromAddress || !toAddress) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="text-gray-400 text-4xl mb-2">📍</div>
        <h3 className="font-semibold text-gray-700 mb-2">Маршрут</h3>
        <p className="text-sm text-gray-600">
          Не указаны адреса для построения маршрута
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-red-500 text-2xl">⚠️</div>
          <div>
            <h3 className="font-semibold text-red-800 text-sm sm:text-base">Карта недоступна</h3>
            <p className="text-red-600 text-xs sm:text-sm">{error}</p>
          </div>
        </div>
        
        {/* Простая информация о маршруте без карты */}
        <div className="bg-white rounded-lg p-3 sm:p-4 border border-red-200">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">📍</span>
              <div>
                <span className="font-medium text-gray-700">Откуда:</span>
                <div className="text-gray-600">{fromAddress}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">📍</span>
              <div>
                <span className="font-medium text-gray-700">Куда:</span>
                <div className="text-gray-600">{toAddress}</div>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <button 
              onClick={() => {
                setError(null)
                setLoading(true)
                loadYandexMaps()
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              🔄 Попробовать снова
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Информационная плашка */}
      {routeInfo && (
        <div className="route-info-card">
          <div className="route-info-header">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="route-info-icon">
                <span className="text-xl sm:text-2xl">🚚</span>
              </div>
              <div className="route-info-details">
                <h3 className="route-info-title">Маршрут переезда</h3>
                <p className="route-info-subtitle">
                  {isFallbackMode 
                    ? 'Приблизительное расстояние по прямой' 
                    : 'Ориентировочное время и расстояние'
                  }
                </p>
              </div>
            </div>
            <div className="route-info-stats">
              <div className="route-info-stat">
                <div className="route-info-stat-value">
                  {routeInfo.distance}
                </div>
                <div className="route-info-stat-label">расстояние</div>
              </div>
              {routeInfo.duration && (
                <div className="route-info-stat">
                  <div className="route-info-stat-value">
                    {routeInfo.duration}
                  </div>
                  <div className="route-info-stat-label">время в пути</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Карта */}
      <div className="relative">
        <div ref={mapRef} className="w-full h-64 sm:h-80 lg:h-96 bg-gray-100" />
        
        {/* Loader */}
        {(loading || error) && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">
                {error ? 'Ошибка загрузки карты' : 'Построение маршрута...'}
              </span>
            </div>
          </div>
        )}
        
        {/* Ошибка загрузки карты */}
        {!loading && error && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="text-gray-400 text-3xl sm:text-4xl mb-3">🗺️</div>
              <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Карта недоступна</h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-xs mx-auto">
                Не удалось загрузить интерактивную карту, но информация о маршруте выше доступна
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Дополнительная информация */}
      {routeInfo && (
        <div className="p-3 sm:p-4 bg-gray-50 border-t">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">📍</span>
              <span className="text-gray-600">Маршрут может отличаться от фактического</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">⏱️</span>
              <span className="text-gray-600">Время указано без учета пробок</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RouteMap 