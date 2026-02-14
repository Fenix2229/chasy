/**
 * Модель категории (lowdb версия)
 * komandirskie.su
 */

import { db } from '../config/database.js';

class Category {
    // Получить все категории
    static getAll() {
        return db.data.categories
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map(c => ({
                ...c,
                product_count: db.data.products.filter(p => p.category_id === c.id && p.is_active).length
            }));
    }

    // Получить категорию по ID
    static getById(id) {
        return db.data.categories.find(c => c.id === id) || null;
    }

    // Получить категорию по slug
    static getBySlug(slug) {
        return db.data.categories.find(c => c.slug === slug) || null;
    }

    // Создать категорию
    static async create(data) {
        const newId = db.data.categories.length > 0 
            ? Math.max(...db.data.categories.map(c => c.id)) + 1 
            : 1;
        
        const category = {
            id: newId,
            name: data.name,
            slug: data.slug,
            description: data.description || null,
            image: data.image || null,
            sort_order: data.sort_order || 0,
            created_at: new Date().toISOString()
        };
        
        db.data.categories.push(category);
        await db.write();
        return newId;
    }

    // Обновить категорию
    static async update(id, data) {
        const index = db.data.categories.findIndex(c => c.id === id);
        if (index === -1) return null;
        
        db.data.categories[index] = {
            ...db.data.categories[index],
            ...data
        };
        
        await db.write();
        return db.data.categories[index];
    }

    // Удалить категорию
    static async delete(id) {
        const index = db.data.categories.findIndex(c => c.id === id);
        if (index === -1) return false;
        
        db.data.categories.splice(index, 1);
        await db.write();
        return true;
    }
}

export default Category;
