/**
 * Скрипт инициализации базы данных (lowdb версия)
 * komandirskie.su
 * 
 * Запуск: npm run init-db
 */

import Low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к файлу базы данных
const dbDir = path.join(__dirname, '..', 'database');
const dbPath = path.join(dbDir, 'shop.json');

// Создаем папку если её нет
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Функция для создания slug из названия
function createSlug(text) {
    const ru = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
        'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    
    return text.toLowerCase()
        .split('')
        .map(char => ru[char] || char)
        .join('')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// Категории часов (как на vostokinc.ru)
const categories = [
    {
        id: 1,
        name: 'Командирские',
        slug: 'komandirskie',
        description: 'Легендарные часы Командирские - символ российского часового мастерства',
        sort_order: 1,
        created_at: new Date().toISOString()
    },
    {
        id: 2,
        name: 'Амфибия',
        slug: 'amfibiya',
        description: 'Профессиональные водолазные часы с водозащитой до 200 метров',
        sort_order: 2,
        created_at: new Date().toISOString()
    },
    {
        id: 3,
        name: 'Восток',
        slug: 'vostok',
        description: 'Классические часы Восток на каждый день',
        sort_order: 3,
        created_at: new Date().toISOString()
    },
    {
        id: 4,
        name: 'Ретро',
        slug: 'retro',
        description: 'Часы в ретро-стиле с духом советской эпохи',
        sort_order: 4,
        created_at: new Date().toISOString()
    },
    {
        id: 5,
        name: 'Женские часы',
        slug: 'women',
        description: 'Элегантные женские часы',
        sort_order: 5,
        created_at: new Date().toISOString()
    }
];

// Товары (примерные данные как на online.vostokinc.ru)
const products = [
    // Командирские
    {
        id: 1,
        category_id: 1,
        name: 'Командирские 650539',
        slug: 'komandirskie-650539',
        article: '650539',
        description: 'Механические часы Командирские с автоподзаводом. Корпус из нержавеющей стали, минеральное стекло. Водозащита 20 АТМ. Диаметр корпуса 42 мм. Браслет из нержавеющей стали.',
        price: 7990,
        old_price: 8990,
        stock: 5,
        image: null,
        images: [],
        specifications: {
            'Механизм': 'Автоматический, 2416Б',
            'Корпус': 'Нержавеющая сталь',
            'Стекло': 'Минеральное',
            'Водозащита': '200 м (20 ATM)',
            'Диаметр': '42 мм',
            'Браслет': 'Нержавеющая сталь'
        },
        is_active: true,
        is_featured: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 2,
        category_id: 1,
        name: 'Командирские 650541',
        slug: 'komandirskie-650541',
        article: '650541',
        description: 'Механические часы Командирские классического дизайна. Циферблат с символикой ВМФ. Корпус из нержавеющей стали. Водозащита 20 АТМ.',
        price: 7490,
        old_price: null,
        stock: 5,
        image: null,
        images: [],
        specifications: {
            'Механизм': 'Автоматический, 2416Б',
            'Корпус': 'Нержавеющая сталь',
            'Стекло': 'Минеральное',
            'Водозащита': '200 м (20 ATM)',
            'Диаметр': '42 мм'
        },
        is_active: true,
        is_featured: true,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 3,
        category_id: 1,
        name: 'Командирские 350514',
        slug: 'komandirskie-350514',
        article: '350514',
        description: 'Классические командирские часы с ручным заводом. Циферблат с танком. Кожаный ремешок.',
        price: 4990,
        old_price: null,
        stock: 5,
        image: null,
        images: [],
        specifications: {
            'Механизм': 'Механический, 2414А',
            'Корпус': 'Латунь с покрытием',
            'Стекло': 'Минеральное',
            'Водозащита': '30 м (3 ATM)',
            'Диаметр': '40 мм',
            'Ремешок': 'Натуральная кожа'
        },
        is_active: true,
        is_featured: true,
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 4,
        category_id: 1,
        name: 'Командирские 350749',
        slug: 'komandirskie-350749',
        article: '350749',
        description: 'Часы Командирские с символикой ВДВ. Механизм с ручным заводом. Кожаный ремешок.',
        price: 4790,
        old_price: null,
        stock: 5,
        image: null,
        images: [],
        specifications: {
            'Механизм': 'Механический, 2414А',
            'Корпус': 'Латунь с покрытием',
            'Водозащита': '30 м',
            'Диаметр': '40 мм'
        },
        is_active: true,
        is_featured: false,
        sort_order: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },

    // Амфибия
    {
        id: 5,
        category_id: 2,
        name: 'Амфибия 420059',
        slug: 'amfibiya-420059',
        article: '420059',
        description: 'Профессиональные водолазные часы Амфибия. Автоподзавод. Водозащита 200 метров. Вращающийся безель.',
        price: 8990,
        old_price: 9990,
        stock: 5,
        image: null,
        images: [],
        specifications: {
            'Механизм': 'Автоматический, 2416Б',
            'Корпус': 'Нержавеющая сталь 316L',
            'Стекло': 'Минеральное, антиблик',
            'Водозащита': '200 м (20 ATM)',
            'Диаметр': '41 мм',
            'Безель': 'Вращающийся, односторонний'
        },
        is_active: true,
        is_featured: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 6,
        category_id: 2,
        name: 'Амфибия 420380',
        slug: 'amfibiya-420380',
        article: '420380',
        description: 'Часы Амфибия с синим циферблатом. Автоподзавод. Браслет из нержавеющей стали. Водозащита 200м.',
        price: 9490,
        old_price: null,
        stock: 5,
        image: null,
        images: [],
        specifications: {
            'Механизм': 'Автоматический, 2416Б',
            'Корпус': 'Нержавеющая сталь',
            'Водозащита': '200 м',
            'Диаметр': '41 мм'
        },
        is_active: true,
        is_featured: true,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 7,
        category_id: 2,
        name: 'Амфибия 710059',
        slug: 'amfibiya-710059',
        article: '710059',
        description: 'Амфибия с классическим "бочкообразным" корпусом. Легендарный дизайн советских времен.',
        price: 8490,
        old_price: null,
        stock: 5,
        image: null,
        images: [],
        specifications: {
            'Механизм': 'Автоматический, 2416Б',
            'Водозащита': '200 м',
            'Стекло': 'Минеральное'
        },
        is_active: true,
        is_featured: false,
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },

    // Восток
    {
        id: 8,
        category_id: 3,
        name: 'Восток 581590',
        slug: 'vostok-581590',
        article: '581590',
        description: 'Классические часы Восток на каждый день. Кварцевый механизм. Стальной корпус.',
        price: 3990,
        old_price: null,
        stock: 5,
        image: null,
        images: [],
        specifications: {
            'Механизм': 'Кварцевый',
            'Корпус': 'Нержавеющая сталь',
            'Водозащита': '30 м',
            'Диаметр': '38 мм'
        },
        is_active: true,
        is_featured: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 9,
        category_id: 3,
        name: 'Восток 581884',
        slug: 'vostok-581884',
        article: '581884',
        description: 'Мужские часы Восток с датой. Кварцевый механизм. Кожаный ремешок.',
        price: 4290,
        old_price: null,
        stock: 5,
        image: null,
        images: [],
        specifications: {
            'Механизм': 'Кварцевый',
            'Корпус': 'Нержавеющая сталь',
            'Функции': 'Дата',
            'Водозащита': '30 м'
        },
        is_active: true,
        is_featured: false,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },

    // Ретро
    {
        id: 10,
        category_id: 4,
        name: 'Ретро 540854',
        slug: 'retro-540854',
        article: '540854',
        description: 'Часы в ретро-стиле СССР. Репродукция классических советских часов. Механический механизм.',
        price: 5990,
        old_price: null,
        stock: 5,
        image: null,
        images: [],
        specifications: {
            'Механизм': 'Механический',
            'Стиль': 'Ретро СССР',
            'Корпус': 'Латунь',
            'Диаметр': '38 мм'
        },
        is_active: true,
        is_featured: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 11,
        category_id: 4,
        name: 'Ретро Гагарин',
        slug: 'retro-gagarin',
        article: '540055',
        description: 'Часы посвященные первому космонавту Юрию Гагарину. Лимитированная серия.',
        price: 6990,
        old_price: 7990,
        stock: 3,
        image: null,
        images: [],
        specifications: {
            'Механизм': 'Механический, 2409А',
            'Серия': 'Лимитированная',
            'Корпус': 'Нержавеющая сталь'
        },
        is_active: true,
        is_featured: true,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },

    // Женские
    {
        id: 12,
        category_id: 5,
        name: 'Восток 051462',
        slug: 'vostok-051462',
        article: '051462',
        description: 'Элегантные женские часы Восток. Кварцевый механизм. Браслет из нержавеющей стали.',
        price: 3490,
        old_price: null,
        stock: 5,
        image: null,
        images: [],
        specifications: {
            'Механизм': 'Кварцевый',
            'Корпус': 'Нержавеющая сталь',
            'Диаметр': '28 мм'
        },
        is_active: true,
        is_featured: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 13,
        category_id: 5,
        name: 'Восток 051341',
        slug: 'vostok-051341',
        article: '051341',
        description: 'Женские часы с золотым покрытием. Изящный дизайн.',
        price: 4290,
        old_price: null,
        stock: 5,
        image: null,
        images: [],
        specifications: {
            'Механизм': 'Кварцевый',
            'Покрытие': 'Позолота',
            'Диаметр': '26 мм'
        },
        is_active: true,
        is_featured: false,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

// Инициализация базы данных
export function initDb(dbInstance) {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('  🕐 Инициализация базы данных магазина');
    console.log('  📍 Домен: komandirskie.su');
    console.log('═══════════════════════════════════════════════════\n');

    try {
        // Используем переданный экземпляр БД или создаём новый
        let db = dbInstance;
        if (!db) {
            const adapter = new FileSync(dbPath);
            db = new Low(adapter);
            db.read();
        }
        
        // Установим данные
        db.data = {
            categories: categories,
            products: products,
            orders: [],
            syncLog: []
        };
        
        // Записываем в файл
        db.write();

        console.log('📁 Добавлено категорий: ' + categories.length);
        categories.forEach(c => console.log(`   ✅ ${c.name}`));
        
        console.log('\n📦 Добавлено товаров: ' + products.length);
        products.forEach(p => console.log(`   ✅ ${p.name} (${p.article})`));

        console.log('\n═══════════════════════════════════════════════════');
        console.log('  ✅ База данных успешно инициализирована!');
        console.log(`  📁 Файл: ${dbPath}`);
        console.log('═══════════════════════════════════════════════════\n');
        
        return true;
    } catch (error) {
        console.error('❌ Ошибка инициализации БД:', error.message);
        return false;
    }
}

// Запуск инициализации если скрипт вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
    const adapter = new FileSync(dbPath);
    const db = new Low(adapter);
    db.read();
    initDb(db);
}

