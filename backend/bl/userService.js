const userDal = require('../dal/userDal');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Read or generate a secret key that persists across server restarts
const SECRET_FILE = path.join(__dirname, '..', '.session_secret');
let SECRET_KEY;
try {
    if (fs.existsSync(SECRET_FILE)) {
        SECRET_KEY = fs.readFileSync(SECRET_FILE, 'utf8');
    } else {
        SECRET_KEY = crypto.randomBytes(32).toString('hex');
        fs.writeFileSync(SECRET_FILE, SECRET_KEY, 'utf8');
    }
} catch (e) {
    SECRET_KEY = 'fallback_tradestrike_secret_9988';
}

function generateToken(userId) {
    const payload = `${userId}_${Date.now()}`;
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(payload);
    const signature = hmac.digest('hex');
    return `token_${payload}_${signature}`;
}

function verifyToken(token) {
    if (!token || !token.startsWith('token_')) return null;
    const parts = token.slice(6).split('_');
    if (parts.length < 3) return null;
    
    const signature = parts[parts.length - 1];
    const payloadParts = parts.slice(0, parts.length - 1);
    const payload = payloadParts.join('_');
    
    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');
    
    if (signature === expectedSignature) {
        return Number(payloadParts[0]);
    }
    return null;
}

// Простая память для токенов
const sessions = new Map();
const originalGet = sessions.get;
sessions.get = function(token) {
    if (!token) return undefined;
    let userId = originalGet.call(sessions, token);
    if (!userId) {
        userId = verifyToken(token);
        if (userId) {
            sessions.set(token, userId);
            // Восстановим статус онлайн
            userDal.setOnlineStatus(userId, true).catch(() => {});
        }
    }
    return userId;
};

async function login(username, password) {
    const user = await userDal.findUserByUsername(username);
    
    if (!user || user.password !== password) {
        const error = new Error('Geçersiz kimlik bilgileri');
        error.statusCode = 401;
        throw error;
    }
    
    const token = generateToken(user.id);
    sessions.set(token, user.id);

    // Mark user as online
    try { await userDal.setOnlineStatus(user.id, true); } catch(e) {}

    return { token, user: formatUser(user) };
}

async function register(username, password, displayName, email) {
    const existingUser = await userDal.findUserByUsername(username);
    if (existingUser) {
        const error = new Error('Kullanıcı adı zaten mevcut');
        error.statusCode = 409;
        throw error;
    }

    const newUser = await userDal.createUser({ username, password, displayName, email });
    const token = generateToken(newUser.id);
    sessions.set(token, newUser.id);
    return { token, user: formatUser(newUser) };
}

async function getCurrentUser(token) {
    const userId = sessions.get(token);
    if (!userId) {
        const error = new Error('Yetkisiz erişim');
        error.statusCode = 401;
        throw error;
    }

    const user = await userDal.findUserById(userId);
    if (!user) {
        const error = new Error('Kullanıcı bulunamadı');
        error.statusCode = 404;
        throw error;
    }
    return formatUser(user);
}

async function logout(token) {
    const userId = sessions.get(token);
    sessions.delete(token);
    // Mark user as offline
    if (userId) {
        try { await userDal.setOnlineStatus(userId, false); } catch(e) {}
    }
    return true;
}

async function getUsersForTrade(token) {
    const currentUserId = sessions.get(token);
    const allUsers = await userDal.getAllUsers();
    
    return allUsers
        .filter(user => user.id !== currentUserId)
        .map(user => ({
            id: user.id,
            username: user.username,
            displayName: user.displayName || user.username,
            rating: `Trust Factor: ${user.rating || 'High'}`,
            initials: (user.displayName || user.username).substring(0, 2).toUpperCase()
        }));
}

function formatUser(user) {
    return {
        id: user.id,
        username: user.username,
        displayName: user.display_name,
        email: user.email,
        balance: Number(user.balance),
        trustFactor: user.trust_factor,
        isInventoryPrivate: !!user.is_inventory_private
    };
}

async function updateSettings(token, settings) {
    const userId = sessions.get(token);
    if (!userId) {
        const error = new Error('Yetkisiz erişim');
        error.statusCode = 401;
        throw error;
    }

    const user = await userDal.findUserById(userId);
    if (!user) {
        const error = new Error('Kullanıcı bulunamadı');
        error.statusCode = 404;
        throw error;
    }

    if (settings.displayName !== undefined) {
        await userDal.updateUserDisplayName(userId, settings.displayName);
    }

    if (settings.email !== undefined) {
        await userDal.updateUserEmail(userId, settings.email);
    }

    if (settings.isInventoryPrivate !== undefined) {
        await userDal.updateInventoryPrivacy(userId, settings.isInventoryPrivate);
    }

    if (settings.password !== undefined && settings.password !== '') {
        if (settings.currentPassword !== undefined) {
            if (user.password !== settings.currentPassword) {
                const error = new Error('Mevcut şifre yanlış');
                error.statusCode = 400;
                throw error;
            }
        }
        await userDal.updateUserPassword(userId, settings.password);
    }

    const updatedUser = await userDal.findUserById(userId);
    return formatUser(updatedUser);
}

async function depositBalance(token, amount) {
    const userId = sessions.get(token);
    if (!userId) {
        const error = new Error('Yetkisiz erişim');
        error.statusCode = 401;
        throw error;
    }

    const user = await userDal.findUserById(userId);
    if (!user) {
        const error = new Error('Kullanıcı bulunamadı');
        error.statusCode = 404;
        throw error;
    }

    await userDal.updateUserBalance(userId, amount);
    const updatedUser = await userDal.findUserById(userId);
    return formatUser(updatedUser);
}

async function deleteAccount(token) {
    const userId = sessions.get(token);
    if (!userId) {
        const error = new Error('Yetkisiz erişim');
        error.statusCode = 401;
        throw error;
    }

    const user = await userDal.findUserById(userId);
    if (!user) {
        const error = new Error('Kullanıcı bulunamadı');
        error.statusCode = 404;
        throw error;
    }

    // Delete all user data via stored procedure
    await userDal.deleteUser(userId);

    // Clear all sessions for this user
    for (const [t, uid] of sessions.entries()) {
        if (uid === userId) sessions.delete(t);
    }

    return true;
}

module.exports = {
    login,
    register,
    getCurrentUser,
    logout,
    getUsersForTrade,
    updateSettings,
    depositBalance,
    deleteAccount,
    _sessions: sessions
};