const userDal = require('../dal/userDal');

// Простая память для токенов
const sessions = new Map();

async function login(username, password) {
    const user = await userDal.findUserByUsername(username);
    
    if (!user || user.password !== password) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }
    
    const token = `token_${user.id}_${Date.now()}`;
    sessions.set(token, user.id);

    // Mark user as online
    try { await userDal.setOnlineStatus(user.id, true); } catch(e) {}

    return { token, user: formatUser(user) };
}

async function register(username, password, displayName, email) {
    const existingUser = await userDal.findUserByUsername(username);
    if (existingUser) {
        const error = new Error('Username already exists');
        error.statusCode = 409;
        throw error;
    }

    const newUser = await userDal.createUser({ username, password, displayName, email });
    const token = `token_${newUser.id}_${Date.now()}`;
    sessions.set(token, newUser.id);
    return { token, user: formatUser(newUser) };
}

async function getCurrentUser(token) {
    const userId = sessions.get(token);
    if (!userId) {
        const error = new Error('Unauthorized');
        error.statusCode = 401;
        throw error;
    }

    const user = await userDal.findUserById(userId);
    if (!user) {
        const error = new Error('User not found');
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
        trustFactor: user.trust_factor
    };
}

async function updateSettings(token, settings) {
    const userId = sessions.get(token);
    if (!userId) {
        const error = new Error('Unauthorized');
        error.statusCode = 401;
        throw error;
    }

    const user = await userDal.findUserById(userId);
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    if (settings.displayName !== undefined) {
        await userDal.updateUserDisplayName(userId, settings.displayName);
    }

    if (settings.email !== undefined) {
        await userDal.updateUserEmail(userId, settings.email);
    }

    if (settings.password !== undefined && settings.password !== '') {
        if (settings.currentPassword !== undefined) {
            if (user.password !== settings.currentPassword) {
                const error = new Error('Incorrect current password');
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
        const error = new Error('Unauthorized');
        error.statusCode = 401;
        throw error;
    }

    const user = await userDal.findUserById(userId);
    if (!user) {
        const error = new Error('User not found');
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
        const error = new Error('Unauthorized');
        error.statusCode = 401;
        throw error;
    }

    const user = await userDal.findUserById(userId);
    if (!user) {
        const error = new Error('User not found');
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