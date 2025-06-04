import { useState } from 'react'

const ImageUpload = ({ 
  type = 'single', // 'single' для аватара, 'multiple' для фото автомобилей
  onUpload, 
  maxFiles = 5,
  accept = 'image/*',
  title = 'Загрузить изображение',
  description = 'Выберите файл для загрузки'
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files)
    
    if (type === 'single' && fileArray.length > 1) {
      alert('Можно выбрать только один файл')
      return
    }
    
    if (type === 'multiple' && fileArray.length > maxFiles) {
      alert(`Можно выбрать максимум ${maxFiles} файлов`)
      return
    }

    // Проверяем размер файлов (5MB максимум)
    const oversizedFiles = fileArray.filter(file => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      alert('Некоторые файлы превышают 5MB')
      return
    }

    // Проверяем тип файлов
    const invalidFiles = fileArray.filter(file => !file.type.startsWith('image/'))
    if (invalidFiles.length > 0) {
      alert('Можно загружать только изображения')
      return
    }

    setSelectedFiles(fileArray)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    try {
      await onUpload(selectedFiles)
      setSelectedFiles([])
    } catch (error) {
      console.error('Ошибка загрузки:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const handleFileInputChange = (e) => {
    const files = e.target.files
    handleFileSelect(files)
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {/* Зона загрузки */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-2">
          <div className="text-4xl">📷</div>
          <div>
            <label className="cursor-pointer">
              <span className="text-blue-600 hover:text-blue-500 font-medium">
                Выберите файлы
              </span>
              <input
                type="file"
                multiple={type === 'multiple'}
                accept={accept}
                onChange={handleFileInputChange}
                className="hidden"
              />
            </label>
            <span className="text-gray-500"> или перетащите их сюда</span>
          </div>
          <div className="text-xs text-gray-400">
            {type === 'single' 
              ? 'Максимум 5MB' 
              : `Максимум ${maxFiles} файлов по 5MB каждый`
            }
          </div>
        </div>
      </div>

      {/* Предварительный просмотр выбранных файлов */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Выбранные файлы:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                >
                  ×
                </button>
                <div className="text-xs text-gray-500 mt-1 truncate">
                  {file.name}
                </div>
              </div>
            ))}
          </div>
          
          {/* Кнопка загрузки */}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn btn-primary w-full disabled:opacity-50"
          >
            {uploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Загружаем...
              </div>
            ) : (
              `Загрузить ${selectedFiles.length} ${selectedFiles.length === 1 ? 'файл' : 'файлов'}`
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default ImageUpload 