const fs = require('fs');
const path = require('path');

// Конфигурация замен для frontend
const frontendReplacements = [
  {
    pattern: /console\.log\(/g,
    replacement: 'logger.log('
  },
  {
    pattern: /console\.error\(/g,
    replacement: 'logger.error('
  },
  {
    pattern: /console\.warn\(/g,
    replacement: 'logger.warn('
  },
  {
    pattern: /console\.info\(/g,
    replacement: 'logger.info('
  }
];

// Конфигурация замен для backend
const backendReplacements = [
  {
    pattern: /console\.log\(/g,
    replacement: 'logger.debug('
  },
  {
    pattern: /console\.error\(/g,
    replacement: 'logger.error('
  },
  {
    pattern: /console\.warn\(/g,
    replacement: 'logger.warn('
  },
  {
    pattern: /console\.info\(/g,
    replacement: 'logger.info('
  }
];

// Функция для рекурсивного поиска файлов
function findFiles(dir, extensions, excludeDirs = []) {
  let files = [];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Пропускаем исключенные директории
      if (!excludeDirs.includes(item)) {
        files = files.concat(findFiles(fullPath, extensions, excludeDirs));
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

// Функция для добавления импорта logger'а
function addLoggerImport(content, filePath) {
  const isBackend = filePath.includes('backend');
  const isJSX = filePath.endsWith('.jsx');
  
  // Проверяем, есть ли уже импорт logger'а
  if (content.includes("import logger") || content.includes("import { logger }")) {
    return content;
  }
  
  // Проверяем, используется ли logger в файле
  if (!content.includes('logger.')) {
    return content;
  }
  
  const importStatement = isBackend 
    ? "import logger from '../utils/logger.js'"
    : "import logger from '../utils/logger'";
  
  // Находим место для вставки импорта
  const lines = content.split('\n');
  let insertIndex = 0;
  
  // Ищем последний import
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) {
      insertIndex = i + 1;
    }
  }
  
  // Вставляем импорт
  lines.splice(insertIndex, 0, importStatement);
  
  return lines.join('\n');
}

// Функция для обработки файла
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    const isBackend = filePath.includes('backend');
    const replacements = isBackend ? backendReplacements : frontendReplacements;
    
    // Применяем замены
    let hasChanges = false;
    for (const { pattern, replacement } of replacements) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        hasChanges = true;
      }
    }
    
    // Добавляем импорт logger'а если есть изменения
    if (hasChanges) {
      content = addLoggerImport(content, filePath);
      
      // Записываем изменения
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Обработан: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Ошибка обработки ${filePath}:`, error.message);
    return false;
  }
}

// Основная функция
function main() {
  console.log('🚀 Начинаем замену console.log на безопасное логирование...\n');
  
  const projectRoot = path.join(__dirname, '..');
  
  // Обрабатываем frontend файлы
  console.log('📁 Обрабатываем frontend файлы...');
  const frontendFiles = findFiles(
    path.join(projectRoot, 'frontend', 'src'), 
    ['.js', '.jsx', '.ts', '.tsx'],
    ['node_modules', 'dist', 'build']
  );
  
  let frontendProcessed = 0;
  for (const file of frontendFiles) {
    if (processFile(file)) {
      frontendProcessed++;
    }
  }
  
  // Обрабатываем backend файлы
  console.log('\n📁 Обрабатываем backend файлы...');
  const backendFiles = findFiles(
    path.join(projectRoot, 'backend', 'src'), 
    ['.js', '.ts'],
    ['node_modules', 'dist', 'build']
  );
  
  let backendProcessed = 0;
  for (const file of backendFiles) {
    if (processFile(file)) {
      backendProcessed++;
    }
  }
  
  console.log('\n🎉 Замена завершена!');
  console.log(`📊 Статистика:`);
  console.log(`   Frontend: ${frontendProcessed} файлов обработано`);
  console.log(`   Backend: ${backendProcessed} файлов обработано`);
  console.log(`   Всего: ${frontendProcessed + backendProcessed} файлов`);
}

// Запускаем скрипт
if (require.main === module) {
  main();
}

module.exports = { processFile, findFiles }; 