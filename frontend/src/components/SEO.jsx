import { Helmet } from 'react-helmet-async'

const SEO = ({ 
  title = "Luggo - Платформа для переездов",
  description = "Найдите надёжных исполнителей для квартирного, офисного переезда или межгородской перевозки. 5000+ проверенных грузчиков и водителей готовы помочь.",
  keywords = "переезд, грузчики, грузоперевозки, квартирный переезд, офисный переезд, межгородской переезд, вывоз мусора",
  image = "https://luggo.ru/images/og-image.jpg",
  url = "https://luggo.ru",
  type = "website",
  article = null,
  breadcrumbs = []
}) => {
  const fullTitle = title.includes('Luggo') ? title : `${title} | Luggo`
  const fullUrl = url.startsWith('http') ? url : `https://luggo.ru${url}`

  // Структурированные данные для организации
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Luggo",
    "description": "Платформа для поиска исполнителей переездов",
    "url": "https://luggo.ru",
    "logo": "https://luggo.ru/images/logo.png",
    "sameAs": [
      "https://t.me/luggo_platform",
      "https://vk.com/luggo_ru"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+7-999-123-45-67",
      "contactType": "customer service",
      "areaServed": "RU",
      "availableLanguage": "Russian"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "RU"
    }
  }

  // Структурированные данные для хлебных крошек
  const breadcrumbSchema = breadcrumbs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `https://luggo.ru${crumb.url}`
    }))
  } : null

  // Структурированные данные для статьи
  const articleSchema = article ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": article.image || image,
    "author": {
      "@type": "Person",
      "name": article.author || "Команда Luggo"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Luggo",
      "logo": {
        "@type": "ImageObject",
        "url": "https://luggo.ru/images/logo.png"
      }
    },
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt
  } : null

  // Структурированные данные для локального бизнеса
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Luggo",
    "description": "Платформа для поиска исполнителей переездов",
    "url": "https://luggo.ru",
    "telephone": "+7-999-123-45-67",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "RU"
    },
    "openingHours": "Mo-Su 00:00-23:59",
    "priceRange": "$$",
    "serviceArea": {
      "@type": "Country",
      "name": "Russia"
    }
  }

  return (
    <Helmet>
      {/* Основные мета-теги */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />

      {/* OpenGraph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Luggo" />
      <meta property="og:locale" content="ru_RU" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Дополнительные мета-теги */}
      <meta name="robots" content="index,follow" />
      <meta name="googlebot" content="index,follow" />
      <meta name="yandex" content="index,follow" />
      <meta name="author" content="Luggo" />
      <meta name="theme-color" content="#2563eb" />

      {/* Структурированные данные */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>
      
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
    </Helmet>
  )
}

export default SEO 