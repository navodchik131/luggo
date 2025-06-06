const { findFiles, processFile } = require('./replace-logging.js');
const path = require('path');

// Обрабатываем backend файлы
console.log('🔧 Обрабатываем backend файлы...');
const backendFiles = findFiles(
  path.join(__dirname, '..', 'backend', 'src'), 
  ['.js'], 
  ['node_modules']
);

let processed = 0;
backendFiles.forEach(file => {
  if (processFile(file)) {
    processed++;
  }
});

console.log(`✅ Backend обработан: ${processed} файлов`); 