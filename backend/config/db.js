// backend/config/db.js
const mysql = require('mysql2');

// Создаем пул соединений (это работает быстрее, чем одиночное подключение)
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',             // Твой логин в MySQL (обычно root)
    password: 'Vufk15Gi9',  // ВПИШИ СЮДА СВОЙ ПАРОЛЬ ОТ MYSQL!
    database: 'lis_trade',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Используем версию с поддержкой async/await (промисы)
const promisePool = pool.promise();

module.exports = promisePool;