/**
 * Модель товара (lowdb версия)
 * komandirskie.su
 */

import { db } from '../config/database.js';

class Product {
    // Получить все товары
    static getAll(limit = 100, offset = 0) {
        const products = db.data.products
            .filter(p => p.is_active)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(offset, offset + limit);
        
        return products.map(p => {
            const category = db.data.categories.find(c => c.id === p.category_id);
            return {
                ...p,
                category_name: category ? category.name : null,
                category_slug: category ? category.slug : null
            };
        });
    }

    // Получить товар по ID
    static getById(id) {
        const product = db.data.products.find(p => p.id === id);
        if (!product) return null;
        
        const category = db.data.categories.find(c => c.id === product.category_id);
        return {
            ...product,
            category_name: category ? category.name : null,
            category_slug: category ? category.slug : null
        };
    }

    // Получить товар по slug
    static getBySlug(slug) {
        const product = db.data.products.find(p => p.slug === slug);
        if (!product) return null;
        
        const category = db.data.categories.find(c => c.id === product.category_id);
        return {
            ...product,
            category_name: category ? category.name : null,
            category_slug: category ? category.slug : null
        };
    }

    // Получить товары по категории
    static getByCategory(categorySlug, limit = 100, offset = 0) {
        const category = db.data.categories.find(c => c.slug === categorySlug);
        if (!category) return [];
        
        return db.data.products
            .filter(p => p.category_id === category.id && p.is_active)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .slice(offset, offset + limit)
            .map(p => ({
                ...p,
                category_name: category.name,
                category_slug: category.slug
            }));
    }

    // Получить избранные товары
    static getFeatured(limit = 8) {
        return db.data.products
            .filter(p => p.is_featured && p.is_active)
            .slice(0, limit)
            .map(p => {
                const category = db.data.categories.find(c => c.id === p.category_id);
                return {
                    ...p,
                    category_name: category ? category.name : null,
                    category_slug: category ? category.slug : null
                };
            });
    }

    // Создать товар
    static async create(data) {
        const newId = db.data.products.length > 0 
            ? Math.max(...db.data.products.map(p => p.id)) + 1 
            : 1;
        
        const product = {
            id: newId,
            category_id: data.category_id,
            name: data.name,
            slug: data.slug,
            article: data.article || null,
            description: data.description || null,
            price: data.price,
            old_price: data.old_price || null,
            stock: data.stock !== undefined ? data.stock : 5,
            image: data.image || null,
            images: data.images || [],
            specifications: data.specifications || {},
            is_active: data.is_active !== undefined ? data.is_active : true,
            is_featured: data.is_featured || false,
            sort_order: data.sort_order || 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        db.data.products.push(product);
        await db.write();
        return newId;
    }

    // Обновить товар
    static async update(id, data) {
        const index = db.data.products.findIndex(p => p.id === id);
        if (index === -1) return null;
        
        db.data.products[index] = {
            ...db.data.products[index],
            ...data,
            updated_at: new Date().toISOString()
        };
        
        await db.write();
        return db.data.products[index];
    }

    // Обновить количество на складе
    static async updateStock(id, quantity) {
        const index = db.data.products.findIndex(p => p.id === id);
        if (index === -1) return false;
        
        if (db.data.products[index].stock >= quantity) {
            db.data.products[index].stock -= quantity;
            db.data.products[index].updated_at = new Date().toISOString();
            await db.write();
            return true;
        }
        return false;
    }

    // Проверить наличие
    static checkStock(id, quantity = 1) {
        const product = db.data.products.find(p => p.id === id);
        return product && product.stock >= quantity;
    }

    // Удалить товар (мягкое удаление)
    static async delete(id) {
        const index = db.data.products.findIndex(p => p.id === id);
        if (index === -1) return false;
        
        db.data.products[index].is_active = false;
        db.data.products[index].updated_at = new Date().toISOString();
        await db.write();
        return true;
    }

    // Поиск товаров
    static search(query, limit = 20) {
        const searchLower = query.toLowerCase();
        return db.data.products
            .filter(p => p.is_active && (
                p.name.toLowerCase().includes(searchLower) ||
                (p.article && p.article.toLowerCase().includes(searchLower)) ||
                (p.description && p.description.toLowerCase().includes(searchLower))
            ))
            .slice(0, limit)
            .map(p => {
                const category = db.data.categories.find(c => c.id === p.category_id);
                return {
                    ...p,
                    category_name: category ? category.name : null,
                    category_slug: category ? category.slug : null
                };
            });
    }

    // Получить количество товаров
    static count(categorySlug = null) {
        if (categorySlug) {
            const category = db.data.categories.find(c => c.slug === categorySlug);
            if (!category) return 0;
            return db.data.products.filter(p => p.category_id === category.id && p.is_active).length;
        }
        return db.data.products.filter(p => p.is_active).length;
    }
}

export default Product;
