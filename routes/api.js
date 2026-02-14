/**
 * API роуты
 * komandirskie.su
 */

import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';

const router = express.Router();

// ==================== КОРЗИНА ====================

// Добавить товар в корзину
router.post('/cart/add', (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        
        const product = Product.getById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Товар не найден' });
        }

        // Проверка наличия
        if (product.stock < quantity) {
            return res.status(400).json({ 
                success: false, 
                message: 'Недостаточно товара на складе',
                available: product.stock
            });
        }

        // Инициализация корзины
        if (!req.session.cart) {
            req.session.cart = [];
        }

        // Проверяем, есть ли товар уже в корзине
        const existingIndex = req.session.cart.findIndex(item => item.productId === productId);
        
        if (existingIndex > -1) {
            // Увеличиваем количество
            const newQty = req.session.cart[existingIndex].quantity + quantity;
            if (newQty > product.stock) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Недостаточно товара на складе',
                    available: product.stock
                });
            }
            req.session.cart[existingIndex].quantity = newQty;
        } else {
            // Добавляем новый товар
            req.session.cart.push({
                productId,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity
            });
        }

        const cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartTotal = req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.json({
            success: true,
            message: 'Товар добавлен в корзину',
            cartCount,
            cartTotal,
            cart: req.session.cart
        });
    } catch (error) {
        console.error('Ошибка добавления в корзину:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Обновить количество товара в корзине
router.post('/cart/update', (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!req.session.cart) {
            return res.status(400).json({ success: false, message: 'Корзина пуста' });
        }

        const product = Product.getById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Товар не найден' });
        }

        if (quantity > product.stock) {
            return res.status(400).json({ 
                success: false, 
                message: 'Недостаточно товара на складе',
                available: product.stock
            });
        }

        const itemIndex = req.session.cart.findIndex(item => item.productId === productId);
        
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: 'Товар не найден в корзине' });
        }

        if (quantity <= 0) {
            // Удаляем товар
            req.session.cart.splice(itemIndex, 1);
        } else {
            // Обновляем количество
            req.session.cart[itemIndex].quantity = quantity;
        }

        const cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartTotal = req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Добавляем subtotal к каждому элементу
        const cartWithSubtotals = req.session.cart.map(item => ({
            ...item,
            subtotal: item.price * item.quantity
        }));

        res.json({
            success: true,
            message: 'Корзина обновлена',
            cartCount,
            cartTotal,
            cart: cartWithSubtotals
        });
    } catch (error) {
        console.error('Ошибка обновления корзины:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Удалить товар из корзины
router.post('/cart/remove', (req, res) => {
    try {
        const { productId } = req.body;

        if (!req.session.cart) {
            return res.status(400).json({ success: false, message: 'Корзина пуста' });
        }

        const itemIndex = req.session.cart.findIndex(item => item.productId === productId);
        
        if (itemIndex > -1) {
            req.session.cart.splice(itemIndex, 1);
        }

        const cartCount = req.session.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartTotal = req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.json({
            success: true,
            message: 'Товар удален из корзины',
            cartCount,
            cartTotal,
            cart: req.session.cart
        });
    } catch (error) {
        console.error('Ошибка удаления из корзины:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Получить корзину
router.get('/cart', (req, res) => {
    const cart = req.session.cart || [];
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
        success: true,
        cart,
        cartCount,
        cartTotal
    });
});

// Очистить корзину
router.post('/cart/clear', (req, res) => {
    req.session.cart = [];
    res.json({ success: true, message: 'Корзина очищена', cartCount: 0, cartTotal: 0 });
});

// ==================== ТОВАРЫ ====================

// Получить товары
router.get('/products', (req, res) => {
    try {
        const { category, limit = 50, offset = 0 } = req.query;
        let products;
        
        if (category) {
            products = Product.getByCategory(category, parseInt(limit), parseInt(offset));
        } else {
            products = Product.getAll(parseInt(limit), parseInt(offset));
        }

        res.json({ success: true, products });
    } catch (error) {
        console.error('Ошибка получения товаров:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Получить товар
router.get('/products/:id', (req, res) => {
    try {
        const product = Product.getById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Товар не найден' });
        }
        res.json({ success: true, product });
    } catch (error) {
        console.error('Ошибка получения товара:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Проверка наличия товара
router.get('/products/:id/stock', (req, res) => {
    try {
        const product = Product.getById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Товар не найден' });
        }
        res.json({ 
            success: true, 
            stock: product.stock,
            inStock: product.stock > 0
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// ==================== ВЫГРУЗКА/ЗАГРУЗКА ====================

// Экспорт всех товаров (для выгрузки)
router.get('/export/products', (req, res) => {
    try {
        const products = Product.getAll(1000, 0);
        const categories = Category.getAll();

        res.json({
            success: true,
            exportDate: new Date().toISOString(),
            categories,
            products,
            count: products.length
        });
    } catch (error) {
        console.error('Ошибка экспорта товаров:', error);
        res.status(500).json({ success: false, message: 'Ошибка экспорта' });
    }
});

// Импорт товаров (массовая загрузка)
router.post('/import/products', async (req, res) => {
    try {
        const { products } = req.body;

        if (!Array.isArray(products)) {
            return res.status(400).json({ success: false, message: 'Неверный формат данных' });
        }

        let imported = 0;
        let errors = [];

        for (const productData of products) {
            try {
                await Product.create(productData);
                imported++;
            } catch (err) {
                errors.push({ product: productData.name, error: err.message });
            }
        }

        res.json({
            success: true,
            message: `Импортировано ${imported} из ${products.length} товаров`,
            imported,
            errors
        });
    } catch (error) {
        console.error('Ошибка импорта товаров:', error);
        res.status(500).json({ success: false, message: 'Ошибка импорта' });
    }
});

// Экспорт заказов (для загрузки в 1С и т.п.)
router.get('/export/orders', (req, res) => {
    try {
        const { status } = req.query;
        const orders = Order.exportOrders(status);

        res.json({
            success: true,
            exportDate: new Date().toISOString(),
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error('Ошибка экспорта заказов:', error);
        res.status(500).json({ success: false, message: 'Ошибка экспорта' });
    }
});

// Получить новые заказы (для интеграции)
router.get('/orders/new', (req, res) => {
    try {
        const orders = Order.getNewOrders();
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Обновить статус заказа (для интеграции с внешними системами)
router.post('/orders/:id/status', (req, res) => {
    try {
        const { status, paymentStatus } = req.body;
        const orderId = req.params.id;

        if (status) {
            Order.updateStatus(orderId, status);
        }
        if (paymentStatus) {
            Order.updatePaymentStatus(orderId, paymentStatus);
        }

        const order = Order.getById(orderId);
        res.json({ success: true, order });
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// Статистика
router.get('/stats', (req, res) => {
    try {
        const orderStats = Order.getStats();
        const productCount = Product.count();
        const categoryCount = Category.getAll().length;

        res.json({
            success: true,
            stats: {
                products: productCount,
                categories: categoryCount,
                orders: orderStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

// ==================== ПОИСК ====================

// Поиск товаров (для автокомплита)
router.get('/search', (req, res) => {
    try {
        const { q, limit = 8 } = req.query;
        
        if (!q || q.length < 2) {
            return res.json({ success: true, products: [], query: q || '' });
        }
        
        const products = Product.search(q, parseInt(limit));
        
        // Форматируем для автокомплита
        const suggestions = products.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            oldPrice: p.old_price,
            image: p.image,
            category: p.category_name,
            inStock: p.stock > 0
        }));
        
        res.json({ 
            success: true, 
            products: suggestions,
            count: suggestions.length,
            query: q
        });
    } catch (error) {
        console.error('Ошибка поиска:', error);
        res.status(500).json({ success: false, message: 'Ошибка поиска' });
    }
});

// Быстрый поиск (только названия для suggestions)
router.get('/search/quick', (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.length < 2) {
            return res.json({ success: true, suggestions: [] });
        }
        
        const products = Product.search(q, 5);
        const suggestions = products.map(p => p.name);
        
        res.json({ success: true, suggestions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка поиска' });
    }
});

export default router;
