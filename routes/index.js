/**
 * Главные роуты
 * komandirskie.su
 */

import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

const router = express.Router();

// Конфигурация сайта
const siteConfig = {
    siteName: 'Командирские',
    siteUrl: 'https://komandirskie.su',
    phone: '+7 (800) 123-45-67',
    email: 'info@komandirskie.su',
    address: 'Россия, г. Чистополь'
};

// Главная страница
router.get('/', (req, res) => {
    try {
        const categories = Category.getAll();
        const featuredProducts = Product.getFeatured(8);
        const newProducts = Product.getAll(4, 0);

        res.render('index', {
            title: 'Главная',
            ...siteConfig,
            categories,
            featuredProducts,
            newProducts
        });
    } catch (error) {
        console.error('Ошибка на главной странице:', error);
        res.status(500).render('error', { 
            title: 'Ошибка',
            ...siteConfig,
            error 
        });
    }
});

// О компании
router.get('/about', (req, res) => {
    const categories = Category.getAll();
    res.render('about', {
        title: 'О компании',
        ...siteConfig,
        categories
    });
});

// Контакты
router.get('/contacts', (req, res) => {
    const categories = Category.getAll();
    res.render('contacts', {
        title: 'Контакты',
        ...siteConfig,
        categories
    });
});

// Доставка и оплата
router.get('/delivery', (req, res) => {
    const categories = Category.getAll();
    res.render('delivery', {
        title: 'Доставка и оплата',
        ...siteConfig,
        categories
    });
});

// Поиск
router.get('/search', (req, res) => {
    const query = req.query.q || '';
    const categories = Category.getAll();
    
    let products = [];
    if (query.length >= 2) {
        products = Product.search(query);
    }

    res.render('search', {
        title: `Поиск: ${query}`,
        ...siteConfig,
        categories,
        products,
        query
    });
});

export default router;
