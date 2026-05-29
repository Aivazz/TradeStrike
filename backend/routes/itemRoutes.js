// backend/routes/itemRoutes.js
const itemService = require('../bl/itemService');
const userService = require('../bl/userService');
const { sendJson, sendRouteError, getBearerToken, readJsonBody } = require('./utils');

async function handleItemRoute(req, res, pathname, searchParams) {
    if (req.method === 'GET' && pathname === '/api/market/items') {
        try {
            return sendJson(res, 200, { data: await itemService.getMarketplaceItems() });
        } catch (error) {
            return sendRouteError(res, error, 'Pazaryeri eşyaları getirilemedi');
        }
    }

    if (req.method === 'GET' && pathname === '/api/market/trending') {
        try {
            return sendJson(res, 200, { data: await itemService.getTrendingItems() });
        } catch (error) {
            return sendRouteError(res, error, 'Popüler eşyalar getirilemedi');
        }
    }

    const buyMatch = pathname.match(/^\/api\/market\/items\/(\d+)\/buy$/);
    if (req.method === 'POST' && buyMatch) {
        try {
            const token = getBearerToken(req);
            const buyer = await userService.getCurrentUser(token);
            const purchase = await itemService.buyMarketplaceItem(Number(buyMatch[1]), buyer.id);
            return sendJson(res, 200, { message: 'Satın alma tamamlandı', data: purchase });
        } catch (error) {
            return sendRouteError(res, error, 'Beklenmedik pazaryeri hatası');
        }
    }

    if (req.method === 'GET' && pathname === '/api/inventory') {
        try {
            const token = getBearerToken(req);
            const currentUser = await userService.getCurrentUser(token);
            const userId = searchParams.get('userId') ? Number(searchParams.get('userId')) : currentUser.id;
            return sendJson(res, 200, { data: await itemService.getUserInventory(userId, currentUser.id) });
        } catch (error) {
            return sendRouteError(res, error, 'Envanter getirilemedi');
        }
    }

    const inventoryItemMatch = pathname.match(/^\/api\/inventory\/(\d+)$/);
    if (req.method === 'GET' && inventoryItemMatch) {
        try {
            const token = getBearerToken(req);
            const currentUser = await userService.getCurrentUser(token);
            const item = await itemService.getInventoryItem(Number(inventoryItemMatch[1]), currentUser.id);
            return sendJson(res, 200, { data: item });
        } catch (error) {
            return sendRouteError(res, error, 'Envanter eşyası getirilemedi');
        }
    }

    const listingMatch = pathname.match(/^\/api\/inventory\/(\d+)\/listings$/);
    if (req.method === 'POST' && listingMatch) {
        try {
            const token = getBearerToken(req);
            const currentUser = await userService.getCurrentUser(token);
            const body = await readJsonBody(req);
            const item = await itemService.listInventoryItemForSale(
                Number(listingMatch[1]),
                Number(body.price),
                currentUser.id
            );
            return sendJson(res, 201, { data: item });
        } catch (error) {
            return sendRouteError(res, error, 'Satış ilanı oluşturulamadı');
        }
    }

    if (req.method === 'DELETE' && listingMatch) {
        try {
            const token = getBearerToken(req);
            const currentUser = await userService.getCurrentUser(token);
            const item = await itemService.cancelInventoryListing(
                Number(listingMatch[1]),
                currentUser.id
            );
            return sendJson(res, 200, { data: item });
        } catch (error) {
            return sendRouteError(res, error, 'Satış ilanı iptal edilemedi');
        }
    }

    if (req.method === 'GET' && pathname === '/api/favorites') {
        try {
            const token = getBearerToken(req);
            const currentUser = await userService.getCurrentUser(token);
            const items = await itemService.getFavoriteItems(currentUser.id);
            return sendJson(res, 200, { data: items });
        } catch (error) {
            return sendRouteError(res, error, 'Favoriler getirilemedi');
        }
    }

    if (req.method === 'POST' && pathname === '/api/favorites') {
        try {
            const token = getBearerToken(req);
            const currentUser = await userService.getCurrentUser(token);
            const body = await readJsonBody(req);
            const result = await itemService.addFavoriteItem(currentUser.id, Number(body.marketItemId));
            return sendJson(res, 201, result);
        } catch (error) {
            return sendRouteError(res, error, 'Favorilere eklenemedi');
        }
    }

    const favMatch = pathname.match(/^\/api\/favorites\/(\d+)$/);
    if (req.method === 'DELETE' && favMatch) {
        try {
            const token = getBearerToken(req);
            const currentUser = await userService.getCurrentUser(token);
            const result = await itemService.removeFavoriteItem(currentUser.id, Number(favMatch[1]));
            return sendJson(res, 200, result);
        } catch (error) {
            return sendRouteError(res, error, 'Favorilerden kaldırılamadı');
        }
    }

    return false;
}

module.exports = { handleItemRoute };