import Low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database', 'test.json');

console.log('📝 Тестируем lowdb версию 1.0.0');
console.log('📁 Путь:', dbPath);

try {
    const adapter = new FileSync(dbPath);
    const db = new Low(adapter);
    
    console.log('1️⃣  Читаем БД');
    db.read();
    
    console.log('2️⃣  Устанавливаем данные');
    db.data = {
        test: 'data',
        items: [1, 2, 3],
        name: 'Тест'
    };
    
    console.log('3️⃣  Записываем БД');
    db.write();
    
    console.log('4️⃣  Повторно читаем БД');
    db.read();
    
    console.log('5️⃣  Содержимое БД после чтения:');
    console.log(JSON.stringify(db.data, null, 2));
    
    console.log('✅ Тест успешен');
} catch (error) {
    console.error('❌ Ошибка:', error.message);
}
