const db = require('../config/db');

async function getKpis() {
    try {
        const [rows] = await db.execute('CALL sp_GetAnalyticsKpis()');
        const data = rows[0][0];

        const volume = Number(data.totalValue || 0);
        const count = Number(data.totalListings || 0);
        const avg = Number(data.avgPrice || 0);

        return [
            { label: 'Market Volume', value: volume, format: 'currency', delta: '+4.2%', icon: 'bi-cash-stack' },
            { label: 'Active Listings', value: count, format: 'number', delta: '+8.1%', icon: 'bi-box-seam' },
            { label: 'Avg. Skin Price', value: Number(avg.toFixed(2)), format: 'currency', delta: '+1.5%', icon: 'bi-tag' },
            { label: 'Total Users', value: data.totalUsers || 0, format: 'number', delta: '+12.7%', icon: 'bi-people' }
        ];
    } catch (err) {
        console.error('Error fetching KPIs:', err);
        return [];
    }
}

function getRevenueByRange(range) {
    const lengths = { today: 8, '7d': 7, '30d': 12, year: 12 };
    const len = lengths[range] || 7;
    const values = [];
    const seed = Date.now() / 10000;
    for (let i = 0; i < len; i++) {
        const base = 50 + (i * 8);
        const wave = Math.sin(seed + i) * 20;
        const noise = (Math.random() - 0.5) * 10;
        values.push(Math.max(15, Math.round(base + wave + noise)));
    }
    return values;
}

async function getTopSkins() {
    try {
        const [rows] = await db.execute('CALL sp_GetTopSkins()');
        const dataRows = rows[0];

        return dataRows.map((row, index) => {
            const sales = Math.floor(Math.sin(Date.now() / 50000 + index) * 3) + 6;
            const price = Number(row.price || 0);
            return {
                title: row.name,
                sales: sales,
                price: price,
                revenue: price * sales
            };
        });
    } catch (err) {
        console.error('Error fetching top skins:', err);
        return [];
    }
}

module.exports = { getKpis, getRevenueByRange, getTopSkins };