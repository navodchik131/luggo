import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, Eye, Plus, X } from 'lucide-react'
import { createNews, updateNews, getNewsById } from '../services/newsService'
import toast from 'react-hot-toast'

const AdminNewsFormPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingData, setLoadingData] = useState(isEdit)

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    imageUrl: '',
    status: 'draft',
    tags: []
  })

  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEdit) {
      loadNewsData()
    }
  }, [id, isEdit])

  const loadNewsData = async () => {
    try {
      setLoadingData(true)
      const response = await getNewsById(id)
      
      if (response.success) {
        const news = response.data
        setFormData({
          title: news.title || '',
          slug: news.slug || '',
          excerpt: news.excerpt || '',
          content: news.content || '',
          imageUrl: news.imageUrl || '',
          status: news.status || 'draft',
          tags: news.tags || []
        })
      } else {
        toast.error('Новость не найдена')
        navigate('/admin/news')
      }
    } catch (err) {
      console.error('Ошибка загрузки новости:', err)
      toast.error('Ошибка загрузки новости')
      navigate('/admin/news')
    } finally {
      setLoadingData(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Автогенерация slug из заголовка
    if (field === 'title' && !isEdit) {
      const slug = value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')
      
      setFormData(prev => ({
        ...prev,
        slug: slug
      }))
    }

    // Очищаем ошибки при изменении
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const addTag = () => {
    if (!newTag.trim()) return
    
    const tag = newTag.trim()
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
    setNewTag('')
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Заголовок обязателен'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Заголовок должен содержать минимум 3 символа'
    } else if (formData.title.length > 200) {
      newErrors.title = 'Заголовок не должен превышать 200 символов'
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'URL-адрес обязателен'
    } else if (!/^[a-z0-9-]+$/i.test(formData.slug)) {
      newErrors.slug = 'URL-адрес может содержать только буквы, цифры и дефисы'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Содержимое обязательно'
    }

    if (formData.excerpt && formData.excerpt.length > 500) {
      newErrors.excerpt = 'Краткое описание не должно превышать 500 символов'
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Введите корректный URL изображения'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Пожалуйста, исправьте ошибки в форме')
      return
    }

    try {
      setSaving(true)

      let response
      if (isEdit) {
        response = await updateNews(id, formData)
      } else {
        response = await createNews(formData)
      }

      if (response.success) {
        toast.success(isEdit ? 'Новость обновлена' : 'Новость создана')
        navigate('/admin/news')
      } else {
        toast.error(response.message || 'Ошибка сохранения новости')
      }
    } catch (err) {
      console.error('Ошибка сохранения:', err)
      
      if (err.response?.status === 400 && err.response?.data?.message?.includes('slug')) {
        setErrors(prev => ({
          ...prev,
          slug: 'Новость с таким URL-адресом уже существует'
        }))
        toast.error('Новость с таким URL-адресом уже существует')
      } else {
        toast.error('Ошибка сохранения новости')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка новости...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/news"
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Редактировать новость' : 'Создать новость'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? 'Внесите изменения в новость' : 'Заполните информацию о новости'}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Предварительный просмотр для опубликованных */}
          {isEdit && formData.status === 'published' && formData.slug && (
            <Link
              to={`/news/${formData.slug}`}
              target="_blank"
              className="btn btn-secondary flex items-center gap-2"
            >
              <Eye size={16} />
              Просмотр
            </Link>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная форма */}
          <div className="lg:col-span-2 space-y-6">
            {/* Заголовок */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заголовок *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Введите заголовок новости"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* URL-адрес */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL-адрес *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.slug ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="url-adres-novosti"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Будет использоваться в адресе: /news/{formData.slug || 'url-adres'}
              </p>
            </div>

            {/* Краткое описание */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Краткое описание
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => handleInputChange('excerpt', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.excerpt ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Краткое описание новости (до 500 символов)"
                maxLength={500}
              />
              {errors.excerpt && (
                <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.excerpt.length}/500 символов
              </p>
            </div>

            {/* Содержимое */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Содержимое *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={15}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.content ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Основное содержимое новости..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Публикация */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">Публикация</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Черновик</option>
                    <option value="published">Опубликована</option>
                    <option value="archived">Архив</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save size={16} />
                    )}
                    {saving ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </div>
              </div>
            </div>

            {/* Изображение */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">Изображение</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL изображения
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.imageUrl ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="https://example.com/image.jpg"
                  />
                  {errors.imageUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.imageUrl}</p>
                  )}
                </div>

                {/* Предварительный просмотр изображения */}
                {formData.imageUrl && isValidUrl(formData.imageUrl) && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Предварительный просмотр:</p>
                    <img 
                      src={formData.imageUrl} 
                      alt="Предварительный просмотр"
                      className="w-full h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Теги */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-4">Теги</h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Новый тег"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Список тегов */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-blue-400 hover:text-blue-600"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AdminNewsFormPage 