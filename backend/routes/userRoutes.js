const userService = require('../bl/userService');
const { sendJson, sendRouteError, getBearerToken, readJsonBody } = require('./utils');

async function handleUserRoute(req, res, pathname) {
    if (req.method === 'POST' && pathname === '/api/auth/login') {
        try {
            const body = await readJsonBody(req);
            const result = await userService.login(body.username, body.password);
            return sendJson(res, 200, { data: result });
        } catch (error) {
            return sendRouteError(res, error, 'Giriş başarısız');
        }
    }

    if (req.method === 'POST' && pathname === '/api/auth/register') {
        try {
            const body = await readJsonBody(req);
            const result = await userService.register(body.username, body.password);
            return sendJson(res, 201, { data: result });
        } catch (error) {
            return sendRouteError(res, error, 'Kayıt başarısız');
        }
    }

    if (req.method === 'GET' && pathname === '/api/auth/me') {
        try {
            const token = getBearerToken(req);
            const user = await userService.getCurrentUser(token);
            return sendJson(res, 200, { data: user });
        } catch (error) {
            return sendRouteError(res, error, 'Yetkisiz erişim');
        }
    }

    if (req.method === 'POST' && pathname === '/api/auth/logout') {
        const token = getBearerToken(req);
        userService.logout(token);
        return sendJson(res, 204);
    }

    if (req.method === 'GET' && pathname === '/api/users') {
        try {
            const token = getBearerToken(req);
            const users = await userService.getUsersForTrade(token);
            return sendJson(res, 200, { data: users });
        } catch (error) {
            return sendRouteError(res, error, 'Kullanıcılar getirilemedi');
        }
    }

    if (req.method === 'PUT' && pathname === '/api/users/settings') {
        try {
            const token = getBearerToken(req);
            const body = await readJsonBody(req);
            const updatedUser = await userService.updateSettings(token, body);
            return sendJson(res, 200, { data: updatedUser });
        } catch (error) {
            return sendRouteError(res, error, 'Ayarlar güncellenemedi');
        }
    }

    if (req.method === 'POST' && pathname === '/api/users/deposit') {
        try {
            const token = getBearerToken(req);
            const body = await readJsonBody(req);
            const amount = Number(body.amount);
            if (isNaN(amount) || amount <= 0) {
                const err = new Error('Geçersiz para yatırma tutarı');
                err.statusCode = 400;
                throw err;
            }
            const updatedUser = await userService.depositBalance(token, amount);
            return sendJson(res, 200, { data: updatedUser });
        } catch (error) {
            return sendRouteError(res, error, 'Para yatırma başarısız');
        }
    }

    if (req.method === 'DELETE' && pathname === '/api/users/account') {
        try {
            const token = getBearerToken(req);
            await userService.deleteAccount(token);
            return sendJson(res, 200, { data: { success: true } });
        } catch (error) {
            return sendRouteError(res, error, 'Hesap silinemedi');
        }
    }

    return false;
}

module.exports = {
    handleUserRoute
};