/**
 * Роуты корзины
 * komandirskie.su
 */

import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Order from '../models/Order.js';

const router = express.Router();

// Конфигурация сайта
const siteConfig = {
    siteName: 'Командирские',
    siteUrl: 'https://komandirskie.su',
    phone: '+7 (800) 123-45-67',
    email: 'info@komandirskie.su'
};

// Страница корзины
router.get('/', (req, res) => {
    try {
        const categories = Category.getAll();
        const cart = req.session.cart || [];
        
        // Обновляем информацию о товарах в корзине
        const cartItems = cart.map(item => {
            const product = Product.getById(item.productId);
            return {
                ...item,
                product,
                subtotal: item.price * item.quantity
            };
        }).filter(item => item.product); // Убираем несуществующие товары

        const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

        res.render('cart', {
            title: 'Корзина',
            ...siteConfig,
            categories,
            cartItems,
            cartTotal
        });
    } catch (error) {
        console.error('Ошибка корзины:', error);
        res.status(500).render('error', { 
            title: 'Ошибка',
            ...siteConfig,
            error 
        });
    }
});

// Страница оформления заказа
router.get('/checkout', (req, res) => {
    try {
        const categories = Category.getAll();
        const cart = req.session.cart || [];

        if (cart.length === 0) {
            return res.redirect('/cart');
        }

        const cartItems = cart.map(item => {
            const product = Product.getById(item.productId);
            return {
                ...item,
                product,
                subtotal: item.price * item.quantity
            };
        }).filter(item => item.product);

        const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

        res.render('checkout', {
            title: 'Оформление заказа',
            ...siteConfig,
            categories,
            cartItems,
            cartTotal
        });
    } catch (error) {
        console.error('Ошибка оформления:', error);
        res.status(500).render('error', { 
            title: 'Ошибка',
            ...siteConfig,
            error 
        });
    }
});

// Обработка заказа
router.post('/checkout', (req, res) => {
    try {
        const { name, email, phone, address, notes } = req.body;
        const cart = req.session.cart || [];

        if (cart.length === 0) {
            return res.redirect('/cart');
        }

        // Подготовка товаров для заказа
        const orderItems = [];
        let total = 0;

        for (const item of cart) {
            const product = Product.getById(item.productId);
            if (!product) continue;

            // Проверка наличия
            if (!Product.checkStock(item.productId, item.quantity)) {
                return res.render('checkout', {
                    title: 'Оформление заказа',
                    ...siteConfig,
                    categories: Category.getAll(),
                    cartItems: cart,
                    cartTotal: total,
                    error: `Товар "${product.name}" недоступен в нужном количестве`
                });
            }

            orderItems.push({
                productId: product.id,
                name: product.name,
                article: product.article,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            });

            total += item.price * item.quantity;

            // Уменьшаем количество на складе
            Product.updateStock(item.productId, item.quantity);
        }

        // Создание заказа
        const order = Order.create({
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
            customer_address: address,
            items: orderItems,
            total,
            notes
        });

        // Очищаем корзину
        req.session.cart = [];

        res.render('order-success', {
            title: 'Заказ оформлен',
            ...siteConfig,
            categories: Category.getAll(),
            order: {
                ...order,
                total,
                items: orderItems
            }
        });
    } catch (error) {
        console.error('Ошибка создания заказа:', error);
        res.status(500).render('error', { 
            title: 'Ошибка',
            ...siteConfig,
            error 
        });
    }
});

// Страница успешного заказа
router.get('/success/:orderNumber', (req, res) => {
    try {
        const order = Order.getByNumber(req.params.orderNumber);
        
        if (!order) {
            return res.redirect('/');
        }

        res.render('order-success', {
            title: 'Заказ оформлен',
            ...siteConfig,
            categories: Category.getAll(),
            order
        });
    } catch (error) {
        console.error('Ошибка:', error);
        res.redirect('/');
    }
});

export default router;
