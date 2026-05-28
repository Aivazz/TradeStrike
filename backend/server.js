const http = require('http');
const https = require('https');
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

    // Добавляем глобальные заголовки CORS для всех запросов
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (url.pathname === '/api/health') {
        return sendJson(res, 200, { status: 'ok' });
    }

    if (url.pathname.startsWith('/api/')) {
        // Улучшенный CORS-прокси через буферизацию памяти
        // Улучшенный CORS-прокси через буферизацию памяти
        if (url.pathname === '/api/proxy-image') {
            const targetUrl = url.searchParams.get('url');
            
            console.log(`\n--- [PROXY LOG] ---`);
            console.log(`[PROXY] İstek alındı: ${targetUrl}`);

            if (!targetUrl) {
                console.log(`[PROXY HATA] URL parametresi gönderilmedi.`);
                return sendJson(res, 400, { error: 'URL sorgu parametresi gerekli' });
            }

            // Оборачиваем в async для использования современного fetch
            (async () => {
                try {
                    // Нативный fetch автоматически обходит редиректы CDN-серверов!
                    const response = await fetch(targetUrl, {
                        headers: { 
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                            'Accept': 'image/*,*/*;q=0.8',
                            'Referer': 'https://steamcommunity.com/'  // ← добавить это
                        }
                    });

                    console.log(`[PROXY] Sunucu yanıtı — Durum: ${response.status}`);

                    if (!response.ok) {
                        console.error(`[PROXY HATA] Sunucu isteği reddetti veya resim bulunamadı!`);
                        return sendJson(res, response.status, { error: 'Harici resim alınamadı' });
                    }

                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);

                    console.log(`[PROXY BAŞARILI] Resim indirildi, boyut: ${buffer.length} bayt. Önyüze gönderiliyor!`);
                    res.writeHead(200, {
                        'Content-Type': response.headers.get('content-type') || 'image/png',
                        'Content-Length': buffer.length,
                        'Cache-Control': 'public, max-age=86400',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(buffer);
                } catch (err) {
                    console.error('[PROXY KRİTİK HATA]', err.message);
                    sendJson(res, 500, { error: 'Dahili resim proxy hatası' });
                }
            })();
            return;
        }

        // Запускаем цепочку роутеров
        handleUserRoute(req, res, url.pathname)
            .then(handled => handled ? true : handleFriendshipRoute(req, res, url.pathname, url.searchParams))
            .then(handled => handled ? true : handleItemRoute(req, res, url.pathname, url.searchParams))
            .then(handled => handled ? true : handleTradeRoute(req, res, url.pathname, url.searchParams))
            .then(handled => handled ? true : handleAnalyticsRoute(req, res, url.pathname, url.searchParams))
            .then(handled => {
                if (!handled) sendJson(res, 404, { error: 'API rotası bulunamadı' });
            })
            .catch(error => {
                console.error(error);
                sendJson(res, error.statusCode || 500, { error: error.message || 'API hatası' });
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
            fs.readFile(path.join(FRONTEND_DIR, 'index.html'), (err, indexData) => {
                if (err) return sendJson(res, 500, { error: 'Arayüz yüklenemedi' });
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(indexData);
            });
            return;
        }
        res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream' });
        res.end(data);
    });
}

const db = require('./config/db');

db.execute("ALTER TABLE users ADD COLUMN is_inventory_private TINYINT DEFAULT 0")
    .then(() => {
        console.log("[VT GÜNCELLEMESİ] is_inventory_private sütunu başarıyla eklendi.");
    })
    .catch((err) => {
        if (err.errno === 1060 || err.code === 'ER_DUP_FIELDNAME') {
            console.log("[VT GÜNCELLEMESİ] is_inventory_private sütunu zaten mevcut.");
        } else {
            console.error("[VT GÜNCELLEMESİ HATASI]", err);
        }
    });

server.listen(PORT, () => {
    console.log(`TradeStrike sunucusu http://localhost:${PORT} adresinde çalışıyor`);
});