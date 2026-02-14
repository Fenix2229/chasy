/**
 * Модель заказа (lowdb версия)
 * komandirskie.su
 */

import { db } from '../config/database.js';

class Order {
    // Генерация номера заказа
    static generateOrderNumber() {
        const date = new Date();
        const prefix = `KOM-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}-${random}`;
    }

    // Создать заказ
    static async create(data) {
        const orderNumber = this.generateOrderNumber();
        const newId = db.data.orders.length > 0 
            ? Math.max(...db.data.orders.map(o => o.id)) + 1 
            : 1;
        
        const order = {
            id: newId,
            order_number: orderNumber,
            customer_name: data.customer_name,
            customer_email: data.customer_email,
            customer_phone: data.customer_phone,
            customer_address: data.customer_address || null,
            items: data.items,
            total: data.total,
            status: data.status || 'new',
            payment_status: 'pending',
            notes: data.notes || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        db.data.orders.push(order);
        await db.write();

        return {
            id: newId,
            order_number: orderNumber
        };
    }

    // Получить все заказы
    static getAll(limit = 100, offset = 0) {
        return db.data.orders
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(offset, offset + limit);
    }

    // Получить заказ по ID
    static getById(id) {
        return db.data.orders.find(o => o.id === id) || null;
    }

    // Получить заказ по номеру
    static getByNumber(orderNumber) {
        return db.data.orders.find(o => o.order_number === orderNumber) || null;
    }

    // Обновить статус заказа
    static async updateStatus(id, status) {
        const index = db.data.orders.findIndex(o => o.id === id);
        if (index === -1) return false;
        
        db.data.orders[index].status = status;
        db.data.orders[index].updated_at = new Date().toISOString();
        await db.write();
        return true;
    }

    // Обновить статус оплаты
    static async updatePaymentStatus(id, paymentStatus) {
        const index = db.data.orders.findIndex(o => o.id === id);
        if (index === -1) return false;
        
        db.data.orders[index].payment_status = paymentStatus;
        db.data.orders[index].updated_at = new Date().toISOString();
        await db.write();
        return true;
    }

    // Получить заказы по статусу
    static getByStatus(status) {
        return db.data.orders
            .filter(o => o.status === status)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Получить новые заказы (для выгрузки)
    static getNewOrders() {
        return db.data.orders
            .filter(o => o.status === 'new')
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }

    // Экспорт заказов в JSON
    static exportOrders(status = null) {
        if (status) {
            return db.data.orders.filter(o => o.status === status);
        }
        return db.data.orders;
    }

    // Статистика заказов
    static getStats() {
        const orders = db.data.orders;
        return {
            total_orders: orders.length,
            total_revenue: orders.reduce((sum, o) => sum + o.total, 0),
            new_orders: orders.filter(o => o.status === 'new').length,
            processing_orders: orders.filter(o => o.status === 'processing').length,
            completed_orders: orders.filter(o => o.status === 'completed').length,
            cancelled_orders: orders.filter(o => o.status === 'cancelled').length
        };
    }
}

export default Order;
