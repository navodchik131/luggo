// Типы услуг для исполнителей
const SERVICE_TYPES = {
  FLAT: 'flat',
  OFFICE: 'office', 
  INTERCITY: 'intercity',
  GARBAGE: 'garbage'
};

// Названия услуг на русском
const SERVICE_NAMES = {
  flat: 'Квартирный переезд',
  office: 'Офисный переезд',
  intercity: 'Межгородские переезды',
  garbage: 'Вывоз мусора'
};

// Категории заявок (расширенные)
const TASK_CATEGORIES = {
  FLAT: 'flat',
  OFFICE: 'office',
  INTERCITY: 'intercity', 
  GARBAGE: 'garbage'
};

// Названия категорий заявок
const TASK_CATEGORY_NAMES = {
  flat: 'Квартирный переезд',
  office: 'Офисный переезд', 
  intercity: 'Межгородский переезд',
  garbage: 'Вывоз мусора'
};

module.exports = {
  SERVICE_TYPES,
  SERVICE_NAMES,
  TASK_CATEGORIES,
  TASK_CATEGORY_NAMES
}; 