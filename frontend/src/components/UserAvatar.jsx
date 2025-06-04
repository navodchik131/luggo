import React from 'react'

const UserAvatar = ({ user, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm', 
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base',
    '2xl': 'w-16 h-16 text-lg'
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-100 text-gray-600'
    
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600', 
      'bg-purple-100 text-purple-600',
      'bg-orange-100 text-orange-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
      'bg-red-100 text-red-600',
      'bg-yellow-100 text-yellow-600'
    ]
    
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    
    // Если это уже полный URL, возвращаем как есть
    if (imagePath.startsWith('http')) return imagePath
    
    // Извлекаем тип папки и имя файла из пути
    const pathParts = imagePath.split('/')
    if (pathParts.length < 3) return null
    
    const type = pathParts[1] // avatars или vehicles
    const filename = pathParts[2] // имя файла
    
    // Используем API эндпоинт
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/image/${type}/${filename}`
  }

  if (!user) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-100 text-gray-400 rounded-full flex items-center justify-center font-semibold ${className}`}>
        ?
      </div>
    )
  }

  const avatarUrl = getImageUrl(user.avatar)
  const initials = getInitials(user.name)
  const colorClass = getAvatarColor(user.name)

  return (
    <div className={`${sizeClasses[size]} relative ${className}`}>
      {avatarUrl ? (
        <>
          <img 
            src={avatarUrl} 
            alt={user.name || 'Пользователь'}
            className={`${sizeClasses[size]} rounded-full object-cover`}
            onError={(e) => {
              // Если изображение не загрузилось, скрываем img и показываем fallback
              e.target.style.display = 'none'
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = 'flex'
              }
            }}
          />
          <div 
            className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center font-semibold absolute inset-0`}
            style={{ display: 'none' }}
          >
            {initials}
          </div>
        </>
      ) : (
        <div className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center font-semibold`}>
          {initials}
        </div>
      )}
    </div>
  )
}

export default UserAvatar 