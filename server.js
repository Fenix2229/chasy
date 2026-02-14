/**
 * Интернет-магазин часов Командирские
 * Домен: komandirskie.su
 * Сервер Express.js
 */

import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, initDatabase } from './config/database.js';
import { initDb } from './scripts/init-db.js';
import indexRoutes from './routes/index.js';
import catalogRoutes from './routes/catalog.js';
import cartRoutes from './routes/cart.js';
import apiRoutes from './routes/api.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Инициализация приложения
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

// Настройка шаблонизатора EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Сессии для корзины
app.use(session({
    secret: 'komandirskie-secret-key-2026',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false, // true для HTTPS в продакшене
        maxAge: 24 * 60 * 60 * 1000 // 24 часа
    }
}));

// Middleware для передачи корзины во все шаблоны
app.use((req, res, next) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }
    res.locals.cart = req.session.cart;
    res.locals.cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
    res.locals.cartTotal = req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    next();
});

// Подключение роутов
app.use('/', indexRoutes);
app.use('/catalog', catalogRoutes);
app.use('/cart', cartRoutes);
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes(db));

// Обработка 404
app.use((req, res) => {
    res.status(404).render('404', { 
        title: 'Страница не найдена',
        siteName: 'Командирские',
        categories: []
    });
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err);
    res.status(500).render('error', { 
        title: 'Ошибка сервера',
        siteName: 'Командирские',
        categories: [],
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Запуск сервера с инициализацией БД
function startServer() {
    try {
        // Проверяем, есть ли товары в БД
        db.read();
        const productCount = (db.data?.products || []).length;
        
        if (productCount === 0) {
            console.log('⚠️  БД пуста, инициализируем товары...');
            initDb(db);
        } else {
            console.log(`✅ БД инициализирована (${productCount} товаров)`);
        }
        
        initDatabase();
        
        app.listen(PORT, () => {
            console.log('═══════════════════════════════════════════════════');
            console.log('  🕐 Интернет-магазин часов КОМАНДИРСКИЕ');
            console.log('  📍 Домен: komandirskie.su');
            console.log(`  🚀 Сервер запущен: http://${HOST}:${PORT}`);
            console.log('═══════════════════════════════════════════════════');
        });
    } catch (error) {
        console.error('❌ Ошибка при инициализации:', error);
        process.exit(1);
    }
}

startServer();

export default app;
