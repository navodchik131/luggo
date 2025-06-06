const express = require('express');
const { Task, News, User } = require('../models');

const router = express.Router();

// Генерация sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://luggo.ru';
    
    // Статические страницы
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/tasks', priority: '0.9', changefreq: 'hourly' },
      { url: '/executors', priority: '0.8', changefreq: 'daily' },
      { url: '/news', priority: '0.7', changefreq: 'daily' },
      { url: '/for-customers', priority: '0.6', changefreq: 'weekly' },
      { url: '/for-executors', priority: '0.6', changefreq: 'weekly' },
      { url: '/about', priority: '0.5', changefreq: 'monthly' },
      { url: '/support', priority: '0.4', changefreq: 'monthly' },
      { url: '/privacy', priority: '0.3', changefreq: 'monthly' },
      { url: '/terms', priority: '0.3', changefreq: 'monthly' }
    ];

    // Динамические страницы - активные заявки
    const activeTasks = await Task.findAll({
      where: { status: 'active' },
      attributes: ['id', 'updatedAt'],
      limit: 1000
    });

    // Новости
    const publishedNews = await News.findAll({
      where: { status: 'published' },
      attributes: ['slug', 'updatedAt'],
      limit: 500
    });

    // Профили исполнителей
    const executors = await User.findAll({
      where: { role: 'executor' },
      attributes: ['id', 'updatedAt'],
      limit: 1000
    });

    // Генерация XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Статические страницы
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Заявки
    activeTasks.forEach(task => {
      sitemap += `
  <url>
    <loc>${baseUrl}/tasks/${task.id}</loc>
    <lastmod>${task.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Новости
    publishedNews.forEach(news => {
      sitemap += `
  <url>
    <loc>${baseUrl}/news/${news.slug}</loc>
    <lastmod>${news.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    // Исполнители
    executors.forEach(executor => {
      sitemap += `
  <url>
    <loc>${baseUrl}/executor/${executor.id}</loc>
    <lastmod>${executor.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);

  } catch (error) {
    console.error('Ошибка генерации sitemap:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Robots.txt
router.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://luggo.ru';
  
  const robots = `# Robots.txt для Luggo - платформа переездов

User-agent: *
Allow: /

# Основные страницы для индексации
Allow: /tasks
Allow: /news
Allow: /for-customers
Allow: /for-executors
Allow: /about

# Страницы которые не нужно индексировать
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/
Disallow: /profile/
Disallow: /create-task
Disallow: /edit-task/
Disallow: /chat/
Disallow: /login
Disallow: /register

# Файлы и директории
Disallow: /src/
Disallow: /*.json$
Disallow: /*?*
Disallow: /assets/

# Специальные боты
User-agent: Yandex
Allow: /
Crawl-delay: 1

User-agent: Googlebot
Allow: /
Crawl-delay: 1

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml`;

  res.set('Content-Type', 'text/plain');
  res.send(robots);
});

module.exports = router; 