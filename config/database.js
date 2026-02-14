/**
 * Конфигурация базы данных JSON (lowdb)
 * komandirskie.su
 */

import Low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к файлу базы данных
const dbDir = path.join(__dirname, '..', 'database');
const dbPath = path.join(dbDir, 'shop.json');

// Создаем папку если её нет
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Адаптер и база данных
const adapter = new FileSync(dbPath);
const db = new Low(adapter);

// Читаем файл и устанавливаем значения по умолчанию
db.read();
if (!db.data) {
    db.data = { categories: [], products: [], orders: [], syncLog: [] };
    db.write();
}

// Инициализация базы данных
export function initDatabase() {
    console.log('✅ База данных инициализирована');
}

export { db };
