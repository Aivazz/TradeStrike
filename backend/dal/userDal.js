const db = require('../config/db');

async function findUserByUsername(username) {
    // Вызываем хранимую процедуру вместо прямого SELECT
    const [rows] = await db.execute('CALL sp_GetUserByUsername(?)', [username]);
    // MySQL возвращает результат процедуры в виде массива массивов
    return rows[0].length > 0 ? rows[0][0] : null;
}

async function findUserById(id) {
    const [rows] = await db.execute('CALL sp_GetUserById(?)', [id]);
    return rows[0].length > 0 ? rows[0][0] : null;
}

async function createUser(user) {
    const [rows] = await db.execute(
        'CALL sp_CreateUser(?, ?, ?, ?)',
        [user.username, user.password, user.displayName || user.username, user.email || null]
    );
    return rows[0].length > 0 ? rows[0][0] : null;
}

async function getAllUsers() {
    const [rows] = await db.execute('CALL sp_GetAllUsers()');
    return rows[0];
}

async function updateUserBalance(id, amount) {
    await db.execute('CALL sp_UpdateUserBalance(?, ?)', [id, amount]);
    return findUserById(id);
}

async function updateUserDisplayName(id, displayName) {
    await db.execute('CALL sp_UpdateUserSettings(?, ?, NULL, NULL)', [id, displayName]);
    return true;
}

async function updateUserPassword(id, password) {
    await db.execute('CALL sp_UpdateUserSettings(?, NULL, NULL, ?)', [id, password]);
    return true;
}

async function updateUserEmail(id, email) {
    await db.execute('CALL sp_UpdateUserSettings(?, NULL, ?, NULL)', [id, email]);
    return true;
}

async function setOnlineStatus(id, isOnline) {
    await db.execute('CALL sp_SetOnlineStatus(?, ?)', [id, isOnline ? 1 : 0]);
    return true;
}

async function deleteUser(id) {
    await db.execute('CALL sp_DeleteUser(?)', [id]);
    return true;
}

async function updateInventoryPrivacy(id, isPrivate) {
    await db.execute('CALL sp_UpdateInventoryPrivacy(?, ?)', [id, isPrivate ? 1 : 0]);
    return true;
}

module.exports = {
    findUserByUsername,
    findUserById,
    createUser,
    getAllUsers,
    updateUserBalance,
    updateUserDisplayName,
    updateUserPassword,
    updateUserEmail,
    setOnlineStatus,
    deleteUser,
    updateInventoryPrivacy
};