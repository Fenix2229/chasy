/**
 * Роуты каталога
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
    email: 'info@komandirskie.su'
};

// Весь каталог
router.get('/', (req, res) => {
    try {
        const categories = Category.getAll();
        const products = Product.getAll(50, 0);
        const totalProducts = Product.count();

        res.render('catalog', {
            title: 'Каталог часов',
            ...siteConfig,
            categories,
            products,
            totalProducts,
            currentCategory: null
        });
    } catch (error) {
        console.error('Ошибка каталога:', error);
        res.status(500).render('error', { 
            title: 'Ошибка',
            ...siteConfig,
            error 
        });
    }
});

// Категория/коллекция (ОТДЕЛЬНАЯ СТРАНИЦА)
router.get('/category/:slug', (req, res) => {
    try {
        const { slug } = req.params;
        const category = Category.getBySlug(slug);

        if (!category) {
            return res.status(404).render('404', {
                title: 'Категория не найдена',
                ...siteConfig,
                categories: Category.getAll()
            });
        }

        const categories = Category.getAll();
        const products = Product.getByCategory(slug, 50, 0);
        const totalProducts = Product.count(slug);

        res.render('catalog', {
            title: category.name,
            ...siteConfig,
            categories,
            products,
            totalProducts,
            currentCategory: category
        });
    } catch (error) {
        console.error('Ошибка категории:', error);
        res.status(500).render('error', { 
            title: 'Ошибка',
            ...siteConfig,
            error 
        });
    }
});

// Страница товара (ПОЛНОРАЗМЕРНАЯ)
router.get('/product/:slug', (req, res) => {
    try {
        const { slug } = req.params;
        const product = Product.getBySlug(slug);

        if (!product) {
            return res.status(404).render('404', {
                title: 'Товар не найден',
                ...siteConfig,
                categories: Category.getAll()
            });
        }

        // Парсим JSON поля только если они строки
        if (product.images && typeof product.images === 'string') {
            product.images = JSON.parse(product.images);
        }
        if (product.specifications && typeof product.specifications === 'string') {
            product.specifications = JSON.parse(product.specifications);
        }
        
        // Убедимся что images - массив
        if (!Array.isArray(product.images)) {
            product.images = product.image ? [product.image] : [];
        }

        const categories = Category.getAll();
        
        // Похожие товары из той же категории
        const relatedProducts = Product.getByCategory(product.category_slug, 4, 0)
            .filter(p => p.id !== product.id);

        res.render('product', {
            title: product.name,
            ...siteConfig,
            categories,
            product,
            relatedProducts
        });
    } catch (error) {
        console.error('Ошибка страницы товара:', error);
        res.status(500).render('error', { 
            title: 'Ошибка',
            ...siteConfig,
            error 
        });
    }
});

export default router;
