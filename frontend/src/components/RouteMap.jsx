import { useEffect, useRef, useState } from 'react'
import { YANDEX_CONFIG, hasValidApiKey } from '../config/yandex'

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

const RouteMap = ({ fromAddress, toAddress }) => {
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
    if (!hasValidApiKey() || !fromAddress || !toAddress) {
      setLoading(false)
      return
    }

    // Защита от повторной инициализации 
    if (isInitialized.current || isDestroying.current) {
      return
    }
    isInitialized.current = true

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
        console.log('Error destroying map:', err)
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
          console.log('Error removing element:', err)
        }
      })
    }, 100)
    
    isInitialized.current = false
    isDestroying.current = false
  }

  const loadYandexMaps = async () => {
    try {
      // Проверяем, не загружен ли уже API
      if (!window.ymaps) {
        // Проверяем не идет ли уже загрузка
        if (window.ymapsLoading) {
          // Ждем завершения загрузки
          const checkLoaded = () => {
            if (window.ymaps) {
              window.ymaps.ready(initMap)
            } else if (window.ymapsLoading) {
              setTimeout(checkLoaded, 100)
            } else {
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
        existingScripts.forEach(script => script.remove())
        
        // Удаляем старые элементы карт если есть
        const existingMaps = document.querySelectorAll('[class*="ymaps"]')
        existingMaps.forEach(mapEl => {
          if (mapEl !== mapRef.current) {
            mapEl.remove()
          }
        })
        
        const script = document.createElement('script')
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_CONFIG.MAPS_API_KEY}&lang=ru_RU`
        script.onload = () => {
          window.ymapsLoading = false
          window.ymaps.ready(initMap)
        }
        script.onerror = () => {
          window.ymapsLoading = false
          setError('Ошибка загрузки Яндекс.Карт')
          setLoading(false)
        }
        document.head.appendChild(script)
      } else {
        // API уже загружен, просто инициализируем карту
        if (window.ymaps.ready) {
          window.ymaps.ready(initMap)
        } else {
          initMap()
        }
      }
    } catch (err) {
      window.ymapsLoading = false
      console.error('Ошибка загрузки карт:', err)
      setError('Ошибка загрузки карт')
      setLoading(false)
    }
  }

  const initMap = async () => {
    try {
      // Проверяем готовность к инициализации
      if (isDestroying.current || !mapContainerRef.current) {
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

      // Геокодируем адреса
      const [fromCoords, toCoords] = await Promise.all([
        geocodeAddress(fromAddress),
        geocodeAddress(toAddress)
      ])

      if (!fromCoords || !toCoords) {
        setError('Не удалось найти адреса на карте')
        setLoading(false)
        return
      }

      // Создаем карту с отключением ненужных элементов
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
      console.error('Ошибка инициализации карты:', err)
      setError('Ошибка инициализации карты')
      setLoading(false)
    }
  }

  const geocodeAddress = async (address) => {
    try {
      const result = await window.ymaps.geocode(address, {
        results: 1
      })
      
      const firstGeoObject = result.geoObjects.get(0)
      
      if (firstGeoObject) {
        return firstGeoObject.geometry.getCoordinates()
      }
      return null
    } catch (err) {
      console.error('Ошибка геокодирования:', err)
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
            console.error('Ошибка обработки маршрута:', err)
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
      console.error('Ошибка построения маршрута:', err)
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Информационная плашка */}
      {routeInfo && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-2">
                <span className="text-2xl">🚚</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Маршрут переезда</h3>
                <p className="text-blue-100 text-sm">
                  {isFallbackMode 
                    ? 'Приблизительное расстояние по прямой' 
                    : 'Ориентировочное время и расстояние'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{routeInfo.distance} км</div>
                  <div className="text-xs text-blue-100">расстояние</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{routeInfo.durationText}</div>
                  <div className="text-xs text-blue-100">в пути</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Карта */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Загрузка маршрута...</p>
            </div>
          </div>
        )}
        
        {error ? (
          <div className="h-64 bg-gray-50 flex items-center justify-center">
            <div className="text-center text-gray-600">
              <div className="text-4xl mb-2">⚠️</div>
              <p>{error}</p>
            </div>
          </div>
        ) : (
          <div 
            ref={mapContainerRef}
            className="h-64 w-full relative route-map-container"
            style={{ minHeight: '300px' }}
          />
        )}
      </div>

      {/* Информация под картой */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="text-gray-600">Откуда</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-gray-600">Куда</span>
            </div>
          </div>
          <div className="text-gray-500 text-xs">
            {isFallbackMode 
              ? '* Приблизительные данные по прямой линии'
              : '* Время указано без учета пробок'
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default RouteMap 