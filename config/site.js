/**
 * Конфигурация сайта
 * komandirskie.su
 */

module.exports = {
    // Основные настройки
    site: {
        name: 'Командирские',
        tagline: 'Легендарные российские часы',
        url: 'https://komandirskie.su',
        domain: 'komandirskie.su'
    },

    // Контактная информация
    contacts: {
        phone: '+7 (800) 123-45-67',
        phoneDisplay: '8 (800) 123-45-67',
        email: 'info@komandirskie.su',
        address: 'Россия, Республика Татарстан, г. Чистополь',
        workHours: 'Пн-Пт: 9:00 - 18:00'
    },

    // Настройки сервера
    server: {
        port: process.env.PORT || 3000,
        host: process.env.HOST || 'localhost',
        sessionSecret: process.env.SESSION_SECRET || 'komandirskie-secret-key-2026'
    },

    // Настройки базы данных
    database: {
        path: './database/shop.db'
    },

    // Валюта
    currency: {
        code: 'RUB',
        symbol: '₽',
        format: '{price} ₽'
    },

    // Настройки товаров
    products: {
        defaultStock: 5,
        perPage: 12,
        featuredCount: 8
    },

    // Статусы заказов
    orderStatuses: {
        'new': 'Новый',
        'processing': 'В обработке',
        'shipped': 'Отправлен',
        'completed': 'Выполнен',
        'cancelled': 'Отменен'
    },

    // Статусы оплаты
    paymentStatuses: {
        'pending': 'Ожидает оплаты',
        'paid': 'Оплачен',
        'refunded': 'Возврат'
    },

    // SEO
    seo: {
        defaultTitle: 'Командирские - Интернет-магазин российских часов',
        defaultDescription: 'Официальный интернет-магазин часов Командирские и Амфибия. Широкий выбор механических часов российского производства.',
        defaultKeywords: 'командирские, амфибия, восток, часы, российские часы, механические часы'
    },

    // Социальные сети
    social: {
        vk: 'https://vk.com/komandirskie',
        telegram: 'https://t.me/komandirskie',
        youtube: ''
    }
};
