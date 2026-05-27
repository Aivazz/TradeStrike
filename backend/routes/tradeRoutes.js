const tradeService = require('../bl/tradeService');
const userService = require('../bl/userService');
const { sendJson, sendRouteError, getBearerToken, readJsonBody } = require('./utils');

async function handleTradeRoute(req, res, pathname, searchParams) {
    const token = getBearerToken(req);
    let currentUser;
    
    try {
        if (pathname.startsWith('/api/trades')) {
            // ИСПРАВЛЕНО: добавлено await
            currentUser = await userService.getCurrentUser(token);
        }
    } catch (error) {
        return sendRouteError(res, error, 'Unauthorized');
    }

    if (req.method === 'GET' && pathname === '/api/trades') {
        try {
            const tab = searchParams.get('tab') || 'incoming';
            const result = await tradeService.getTrades(tab, currentUser.id);
            return sendJson(res, 200, { data: result });
        } catch (error) {
            return sendRouteError(res, error, 'Unexpected trade error');
        }
    }

    if (req.method === 'POST' && pathname === '/api/trades/create') {
        try {
            const body = await readJsonBody(req);
            const trade = await tradeService.createTrade(
                currentUser.id, 
                body.recipientId, 
                body.isGift, 
                body.giveItemIds, 
                body.receiveItemIds
            );
            return sendJson(res, 201, { data: trade });
        } catch (error) {
            return sendRouteError(res, error, 'Failed to create trade');
        }
    }

    const actionMatch = pathname.match(/\/api\/trades\/(\d+)\/(accept|decline|cancel|counter)$/);
    if (req.method === 'POST' && actionMatch) {
        try {
            const tradeId = Number(actionMatch[1]);
            const action = actionMatch[2];
            let body = {};
            if (action === 'counter') {
                body = await readJsonBody(req);
            }
            const trade = await runTradeAction(tradeId, action, currentUser.id, body.itemIds);
            return sendJson(res, 200, {
                message: `Trade ${action} completed`,
                data: trade
            });
        } catch (error) {
            return sendRouteError(res, error, 'Unexpected trade action error');
        }
    }

    return false;
}

async function runTradeAction(id, action, userId, itemIds) {
    if (action === 'accept') return tradeService.acceptTrade(id, userId);
    if (action === 'decline') return tradeService.declineTrade(id, userId);
    if (action === 'cancel') return tradeService.cancelTrade(id, userId);
    return await tradeService.counterTrade(id, userId, itemIds);
}

module.exports = { handleTradeRoute };