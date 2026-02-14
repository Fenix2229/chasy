/**
 * Маршруты админ-панели
 * komandirskie.su - Администрирование магазина
 */

import express from 'express';

const createAdminRouter = (db) => {
    const router = express.Router();
    
    // Простая авторизация (в продакшене использовать полноценную систему)
    const ADMIN_LOGIN = 'admin';
    const ADMIN_PASSWORD = 'komandirskie2024';
    
    // Middleware проверки авторизации
    const checkAuth = (req, res, next) => {
        if (req.session && req.session.isAdmin) {
            return next();
        }
        res.redirect('/admin/login');
    };
    
    // === Страница логина ===
    router.get('/login', (req, res) => {
        res.render('admin/login', {
            title: 'Вход в админ-панель',
            error: null
        });
    });
    
    router.post('/login', (req, res) => {
        const { login, password } = req.body;
        
        if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
            req.session.isAdmin = true;
            res.redirect('/admin');
        } else {
            res.render('admin/login', {
                title: 'Вход в админ-панель',
                error: 'Неверный логин или пароль'
            });
        }
    });
    
    router.get('/logout', (req, res) => {
        req.session.destroy();
        res.redirect('/admin/login');
    });
    
    // === Главная страница админки ===
    router.get('/', checkAuth, (req, res) => {
        const products = db.get('products').value();
        const orders = db.get('orders').value();
        const categories = db.get('categories').value();
        
        // Статистика
        const stats = {
            totalProducts: products.length,
            totalOrders: orders.length,
            newOrders: orders.filter(o => o.status === 'new').length,
            lowStock: products.filter(p => p.stock <= 2).length,
            totalRevenue: orders.reduce((sum, o) => sum + o.total, 0)
        };
        
        res.render('admin/dashboard', {
            title: 'Админ-панель',
            stats,
            recentOrders: orders.slice(-5).reverse(),
            lowStockProducts: products.filter(p => p.stock <= 2)
        });
    });
    
    // === Управление товарами ===
    router.get('/products', checkAuth, (req, res) => {
        const products = db.get('products').value();
        const categories = db.get('categories').value();
        
        res.render('admin/products', {
            title: 'Управление товарами',
            products,
            categories
        });
    });
    
    // API: Обновление остатков
    router.post('/api/products/:id/stock', checkAuth, (req, res) => {
        const { id } = req.params;
        const { stock } = req.body;
        
        const product = db.get('products').find({ id: parseInt(id) }).value();
        
        if (!product) {
            return res.json({ success: false, error: 'Товар не найден' });
        }
        
        db.get('products')
            .find({ id: parseInt(id) })
            .assign({ stock: parseInt(stock), updated_at: new Date().toISOString() })
            .write();
        
        res.json({ success: true, stock: parseInt(stock) });
    });
    
    // API: Обновление цены
    router.post('/api/products/:id/price', checkAuth, (req, res) => {
        const { id } = req.params;
        const { price, old_price } = req.body;
        
        const product = db.get('products').find({ id: parseInt(id) }).value();
        
        if (!product) {
            return res.json({ success: false, error: 'Товар не найден' });
        }
        
        const updates = {
            price: parseInt(price),
            updated_at: new Date().toISOString()
        };
        
        if (old_price !== undefined) {
            updates.old_price = old_price ? parseInt(old_price) : null;
        }
        
        db.get('products')
            .find({ id: parseInt(id) })
            .assign(updates)
            .write();
        
        res.json({ success: true, price: parseInt(price) });
    });
    
    // API: Включение/выключение товара
    router.post('/api/products/:id/toggle', checkAuth, (req, res) => {
        const { id } = req.params;
        
        const product = db.get('products').find({ id: parseInt(id) }).value();
        
        if (!product) {
            return res.json({ success: false, error: 'Товар не найден' });
        }
        
        const newStatus = !product.is_active;
        
        db.get('products')
            .find({ id: parseInt(id) })
            .assign({ is_active: newStatus, updated_at: new Date().toISOString() })
            .write();
        
        res.json({ success: true, is_active: newStatus });
    });
    
    // === Управление заказами ===
    router.get('/orders', checkAuth, (req, res) => {
        const orders = db.get('orders').value();
        
        res.render('admin/orders', {
            title: 'Управление заказами',
            orders: orders.reverse()
        });
    });
    
    // Просмотр заказа
    router.get('/orders/:id', checkAuth, (req, res) => {
        const { id } = req.params;
        const order = db.get('orders').find({ id: parseInt(id) }).value();
        
        if (!order) {
            return res.redirect('/admin/orders');
        }
        
        res.render('admin/order-detail', {
            title: `Заказ #${order.order_number}`,
            order
        });
    });
    
    // API: Обновление статуса заказа
    router.post('/api/orders/:id/status', checkAuth, (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        
        const validStatuses = ['new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.json({ success: false, error: 'Некорректный статус' });
        }
        
        const order = db.get('orders').find({ id: parseInt(id) }).value();
        
        if (!order) {
            return res.json({ success: false, error: 'Заказ не найден' });
        }
        
        db.get('orders')
            .find({ id: parseInt(id) })
            .assign({ status, updated_at: new Date().toISOString() })
            .write();
        
        res.json({ success: true, status });
    });
    
    // API: Обновление статуса оплаты
    router.post('/api/orders/:id/payment', checkAuth, (req, res) => {
        const { id } = req.params;
        const { payment_status } = req.body;
        
        const validStatuses = ['pending', 'paid', 'refunded'];
        
        if (!validStatuses.includes(payment_status)) {
            return res.json({ success: false, error: 'Некорректный статус оплаты' });
        }
        
        const order = db.get('orders').find({ id: parseInt(id) }).value();
        
        if (!order) {
            return res.json({ success: false, error: 'Заказ не найден' });
        }
        
        db.get('orders')
            .find({ id: parseInt(id) })
            .assign({ payment_status, updated_at: new Date().toISOString() })
            .write();
        
        res.json({ success: true, payment_status });
    });
    
    // API: Добавление комментария к заказу
    router.post('/api/orders/:id/notes', checkAuth, (req, res) => {
        const { id } = req.params;
        const { notes } = req.body;
        
        const order = db.get('orders').find({ id: parseInt(id) }).value();
        
        if (!order) {
            return res.json({ success: false, error: 'Заказ не найден' });
        }
        
        db.get('orders')
            .find({ id: parseInt(id) })
            .assign({ notes, updated_at: new Date().toISOString() })
            .write();
        
        res.json({ success: true });
    });
    
    return router;
};

export default createAdminRouter;
