const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Маршрут ${req.originalUrl} не найден`,
    error: 'Not Found',
    timestamp: new Date().toISOString()
  });
};

module.exports = { notFound }; 