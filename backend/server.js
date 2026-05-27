const http = require('http');
const fs = require('fs');
const path = require('path');
const { handleItemRoute } = require('./routes/itemRoutes');
const { handleTradeRoute } = require('./routes/tradeRoutes');
const { handleAnalyticsRoute } = require('./routes/analyticsRoutes');
const { handleUserRoute } = require('./routes/userRoutes');
const { handleFriendshipRoute } = require('./routes/friendshipRoutes');
const { sendJson } = require('./routes/utils');

const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.resolve(__dirname, '..', 'frontend');

const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // CORS: Разрешаем запросы
    if (req.method === 'OPTIONS') {
        return sendJson(res, 204, {});
    }

    if (url.pathname === '/api/health') {
        return sendJson(res, 200, { status: 'ok' });
    }

    if (url.pathname.startsWith('/api/')) {
        // Запускаем цепочку роутеров
        handleUserRoute(req, res, url.pathname)
            .then(handled => handled ? true : handleFriendshipRoute(req, res, url.pathname, url.searchParams))
            .then(handled => handled ? true : handleItemRoute(req, res, url.pathname, url.searchParams))
            .then(handled => handled ? true : handleTradeRoute(req, res, url.pathname, url.searchParams))
            .then(handled => handled ? true : handleAnalyticsRoute(req, res, url.pathname, url.searchParams))
            .then(handled => {
                if (!handled) sendJson(res, 404, { error: 'API route not found' });
            })
            .catch(error => {
                console.error(error);
                sendJson(res, error.statusCode || 500, { error: error.message || 'API error' });
            });
        return;
    }

    return serveStaticFile(url.pathname, res);
});

function serveStaticFile(pathname, res) {
    const requestedPath = pathname === '/' ? '/index.html' : pathname;
    const safePath = path.normalize(decodeURIComponent(requestedPath)).replace(/^[/\\]+/, '');
    const filePath = path.join(FRONTEND_DIR, safePath);

    fs.readFile(filePath, (error, data) => {
        if (error) {
            // Если файл не найден, отдаем index.html (для SPA)
            fs.readFile(path.join(FRONTEND_DIR, 'index.html'), (err, indexData) => {
                if (err) return sendJson(res, 500, { error: 'Could not load frontend' });
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(indexData);
            });
            return;
        }
        res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
        res.end(data);
    });
}

server.listen(PORT, () => {
    console.log(`TradeStrike server is running on http://localhost:${PORT}`);
});