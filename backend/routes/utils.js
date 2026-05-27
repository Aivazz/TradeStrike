// backend/routes/utils.js

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    if (statusCode === 204) { res.end(); return true; }
    res.end(JSON.stringify(payload));
    return true;
}

function sendRouteError(res, error, fallbackMessage) {
    return sendJson(res, error.statusCode || 500, {
        error: error.message || fallbackMessage
    });
}

function getBearerToken(req) {
    const header = req.headers.authorization || '';
    return header.startsWith('Bearer ') ? header.slice(7) : '';
}

async function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let rawBody = '';
        req.on('data', chunk => rawBody += chunk);
        req.on('end', () => {
            if (!rawBody) return resolve({});
            try { resolve(JSON.parse(rawBody)); } 
            catch (error) { reject({ statusCode: 400, message: 'Invalid JSON body' }); }
        });
        req.on('error', reject);
    });
}

module.exports = { sendJson, sendRouteError, getBearerToken, readJsonBody };