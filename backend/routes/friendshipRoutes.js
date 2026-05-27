// backend/routes/friendshipRoutes.js
const friendshipService = require('../bl/friendshipService');
const { sendJson, sendRouteError, getBearerToken, readJsonBody } = require('./utils');

// Lazy getter to avoid circular-dependency crash at require-time
function S() { return require('../bl/userService')._sessions; }

async function handleFriendshipRoute(req, res, pathname, searchParams) {
    // GET /api/friends
    if (req.method === 'GET' && pathname === '/api/friends') {
        try {
            return sendJson(res, 200, { data: await friendshipService.getFriends(getBearerToken(req), S()) });
        } catch (e) { return sendRouteError(res, e, 'Failed to get friends'); }
    }

    // GET /api/friends/requests
    if (req.method === 'GET' && pathname === '/api/friends/requests') {
        try {
            return sendJson(res, 200, { data: await friendshipService.getIncomingRequests(getBearerToken(req), S()) });
        } catch (e) { return sendRouteError(res, e, 'Failed to get requests'); }
    }

    // GET /api/friends/search?q=
    if (req.method === 'GET' && pathname === '/api/friends/search') {
        try {
            const q = searchParams.get('q') || '';
            return sendJson(res, 200, { data: await friendshipService.searchOnlineUsers(getBearerToken(req), S(), q) });
        } catch (e) { return sendRouteError(res, e, 'Failed to search users'); }
    }

    // POST /api/friends/request
    if (req.method === 'POST' && pathname === '/api/friends/request') {
        try {
            const body = await readJsonBody(req);
            const result = await friendshipService.sendRequest(getBearerToken(req), S(), Number(body.targetUserId));
            return sendJson(res, 201, { data: result });
        } catch (e) { return sendRouteError(res, e, 'Failed to send request'); }
    }

    // POST /api/friends/accept
    if (req.method === 'POST' && pathname === '/api/friends/accept') {
        try {
            const body = await readJsonBody(req);
            const result = await friendshipService.acceptRequest(getBearerToken(req), S(), Number(body.friendshipId));
            return sendJson(res, 200, { data: result });
        } catch (e) { return sendRouteError(res, e, 'Failed to accept request'); }
    }

    // POST /api/friends/decline
    if (req.method === 'POST' && pathname === '/api/friends/decline') {
        try {
            const body = await readJsonBody(req);
            const result = await friendshipService.declineRequest(getBearerToken(req), S(), Number(body.friendshipId));
            return sendJson(res, 200, { data: result });
        } catch (e) { return sendRouteError(res, e, 'Failed to decline request'); }
    }

    // DELETE /api/friends/remove
    if (req.method === 'DELETE' && pathname === '/api/friends/remove') {
        try {
            const body = await readJsonBody(req);
            const result = await friendshipService.removeFriend(getBearerToken(req), S(), Number(body.targetUserId));
            return sendJson(res, 200, { data: result });
        } catch (e) { return sendRouteError(res, e, 'Failed to remove friend'); }
    }

    return false;
}

module.exports = { handleFriendshipRoute };
