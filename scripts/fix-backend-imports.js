const fs = require('fs');
const path = require('path');
const { findFiles } = require('./replace-logging.js');

// Функция для исправления ES6 импортов в backend файлах
function fixBackendImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Заменяем ES6 импорт logger на CommonJS require (если есть)
    if (content.includes("import logger from '../utils/logger.js'")) {
      content = content.replace("import logger from '../utils/logger.js'", "// Логирование вынесено в отдельные console.log для упрощения");
    }
    
    // Убираем все вызовы logger.* на console.*
    content = content.replace(/logger\.debug\(/g, 'console.log(');
    content = content.replace(/logger\.info\(/g, 'console.log(');
    content = content.replace(/logger\.warn\(/g, 'console.warn(');
    content = content.replace(/logger\.error\(/g, 'console.error(');
    content = content.replace(/logger\.log\(/g, 'console.log(');
    
    // Записываем изменения если есть
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Исправлен: ${filePath}`);
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
  console.log('🔧 Исправляем backend импорты...\n');
  
  const backendSrcPath = path.join(__dirname, '..', 'backend', 'src');
  
  // Находим все JS файлы в backend/src
  const backendFiles = findFiles(backendSrcPath, ['.js'], ['node_modules', 'dist']);
  
  let processed = 0;
  for (const file of backendFiles) {
    if (fixBackendImports(file)) {
      processed++;
    }
  }
  
  console.log(`\n🎉 Исправлено: ${processed} файлов в backend`);
}

// Запускаем скрипт
if (require.main === module) {
  main();
}

module.exports = { fixBackendImports }; 