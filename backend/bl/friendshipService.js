// backend/bl/friendshipService.js
const friendshipDal = require('../dal/friendshipDal');
const userDal = require('../dal/userDal');

// Get confirmed friends list (with online status)
async function getFriends(token, sessions) {
    const userId = sessions.get(token);
    if (!userId) throw Object.assign(new Error('Yetkisiz erişim'), { statusCode: 401 });

    const friends = await friendshipDal.getFriends(userId);
    return friends.map(f => ({
        friendshipId: f.friendshipId,
        id: f.id,
        username: f.username,
        displayName: f.displayName || f.username,
        status: f.isOnline ? 'online' : 'offline',
        initials: (f.displayName || f.username).substring(0, 2).toUpperCase()
    }));
}

// Get incoming pending friend requests
async function getIncomingRequests(token, sessions) {
    const userId = sessions.get(token);
    if (!userId) throw Object.assign(new Error('Yetkisiz erişim'), { statusCode: 401 });

    const requests = await friendshipDal.getIncomingRequests(userId);
    return requests.map(r => ({
        friendshipId: r.friendshipId,
        id: r.id,
        username: r.username,
        displayName: r.displayName || r.username,
        initials: (r.displayName || r.username).substring(0, 2).toUpperCase()
    }));
}

// Search for online users to add as friends
// Uses the live sessions Map (not DB column) as the real source of truth for who is online
async function searchOnlineUsers(token, sessions, query) {
    const userId = sessions.get(token);
    if (!userId) throw Object.assign(new Error('Yetkisiz erişim'), { statusCode: 401 });
    if (!query || query.trim().length < 1) return [];

    const users = await friendshipDal.searchOnlineUsers(query.trim(), userId);
    return users.map(u => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName || u.username,
        isOnline: !!u.isOnline,
        initials: (u.displayName || u.username).substring(0, 2).toUpperCase()
    }));
}

// Send a friend request
async function sendRequest(token, sessions, targetUserId) {
    const userId = sessions.get(token);
    if (!userId) throw Object.assign(new Error('Yetkisiz erişim'), { statusCode: 401 });
    if (userId === targetUserId) throw Object.assign(new Error('Kendinizi arkadaş olarak ekleyemezsiniz'), { statusCode: 400 });

    const existing = await friendshipDal.getFriendship(userId, targetUserId);
    if (existing) throw Object.assign(new Error('Arkadaşlık ilişkisi zaten mevcut'), { statusCode: 409 });

    const target = await userDal.findUserById(targetUserId);
    if (!target) throw Object.assign(new Error('Kullanıcı bulunamadı'), { statusCode: 404 });

    await friendshipDal.createFriendship(userId, targetUserId);
    return { message: `Arkadaşlık isteği ${target.username} kullanıcısına gönderildi` };
}

// Accept a pending request
async function acceptRequest(token, sessions, friendshipId) {
    const userId = sessions.get(token);
    if (!userId) throw Object.assign(new Error('Yetkisiz erişim'), { statusCode: 401 });

    await friendshipDal.updateFriendshipStatus(friendshipId, 'accepted');
    return { message: 'Arkadaşlık isteği kabul edildi' };
}

// Decline a pending request
async function declineRequest(token, sessions, friendshipId) {
    const userId = sessions.get(token);
    if (!userId) throw Object.assign(new Error('Yetkisiz erişim'), { statusCode: 401 });

    await friendshipDal.updateFriendshipStatus(friendshipId, 'declined');
    return { message: 'Arkadaşlık isteği reddedildi' };
}

// Remove a friend
async function removeFriend(token, sessions, targetUserId) {
    const userId = sessions.get(token);
    if (!userId) throw Object.assign(new Error('Yetkisiz erişim'), { statusCode: 401 });

    await friendshipDal.deleteFriendshipByUsers(userId, targetUserId);
    return { message: 'Arkadaş çıkarıldı' };
}

module.exports = {
    getFriends,
    getIncomingRequests,
    searchOnlineUsers,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend
};
