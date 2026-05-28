const db = require('../config/db');

async function getFriends(userId) {
    const [rows] = await db.execute('CALL sp_GetFriends(?)', [userId]);
    return rows[0];
}

async function getIncomingRequests(userId) {
    const [rows] = await db.execute('CALL sp_GetIncomingRequests(?)', [userId]);
    return rows[0];
}

async function searchOnlineUsers(query, currentUserId) {
    const like = `%${query}%`;

    const [rows] = await db.execute('CALL sp_SearchUsers(?, ?)', [like, currentUserId]);
    return rows[0];
}

async function getFriendship(userId1, userId2) {
    const [rows] = await db.execute('CALL sp_GetFriendship(?, ?)', [userId1, userId2]);
    return rows[0].length > 0 ? rows[0][0] : null;
}

async function createFriendship(userId, friendId) {
    const [resultRows] = await db.execute('CALL sp_CreateFriendship(?, ?)', [userId, friendId]);
    return resultRows[0][0].insertId;
}

async function updateFriendshipStatus(id, status) {
    await db.execute('CALL sp_UpdateFriendshipStatus(?, ?)', [id, status]);
    return true;
}

async function deleteFriendshipByUsers(userId1, userId2) {
    await db.execute('CALL sp_DeleteFriendship(?, ?)', [userId1, userId2]);
    return true;
}

module.exports = {
    getFriends, getIncomingRequests, searchOnlineUsers,
    getFriendship, createFriendship, updateFriendshipStatus, deleteFriendshipByUsers
};