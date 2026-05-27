const db = require('../config/db');

function parseRow(row) {
    if (!row) return null;
    return {
        id: row.id,
        senderId: row.sender_id,
        recipientId: row.recipient_id,
        senderName: row.sender_name,
        recipientName: row.recipient_name,
        status: row.status,
        isGift: !!row.is_gift,
        give: safeJson(row.give_items),
        receive: safeJson(row.receive_items),
        giveItemIds: safeJson(row.give_item_ids),
        receiveItemIds: safeJson(row.receive_item_ids),
        time: formatTime(row.created_at),
        updatedAt: row.updated_at
    };
}

function safeJson(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
}

function formatTime(ts) {
    if (!ts) return 'Just now';
    const diff = (Date.now() - new Date(ts).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

async function getTradesByTab(tab, userId) {
    let rows = [];
    if (tab === 'sent') {
        [rows] = await db.execute('CALL sp_GetTradesSent(?)', [userId]);
    } else if (tab === 'incoming') {
        [rows] = await db.execute('CALL sp_GetTradesIncoming(?)', [userId]);
    } else if (tab === 'history') {
        [rows] = await db.execute('CALL sp_GetTradesHistory(?)', [userId]);
    }
    return rows[0].map(r => formatTradeView(parseRow(r), userId));
}

async function getTradeCounts(userId) {
    const [rows] = await db.execute('CALL sp_GetTradeCounts(?)', [userId]);
    const data = rows[0][0];
    return { incoming: Number(data.incoming), sent: Number(data.sent), history: Number(data.history) };
}

async function findTradeById(id) {
    const [rows] = await db.execute('CALL sp_FindTradeById(?)', [id]);
    return parseRow(rows[0][0] || null);
}

async function getFormattedTradeById(id, userId) {
    const trade = await findTradeById(id);
    return trade ? formatTradeView(trade, userId) : null;
}

async function createTrade(data) {
    const [resultRows] = await db.execute(
        'CALL sp_CreateTrade(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
            data.senderId, data.recipientId, data.senderName, data.recipientName,
            data.status || 'Pending', data.isGift ? 1 : 0,
            JSON.stringify(data.give || []), JSON.stringify(data.receive || []),
            JSON.stringify(data.giveItemIds || []), JSON.stringify(data.receiveItemIds || [])
        ]
    );
    return findTradeById(resultRows[0][0].insertId);
}

async function updateTrade(id, updates) {
    if (updates.senderId !== undefined) {
        await db.execute('CALL sp_CounterTrade(?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            id, updates.senderId, updates.senderName, updates.recipientId, updates.recipientName,
            JSON.stringify(updates.give), JSON.stringify(updates.receive),
            JSON.stringify(updates.giveItemIds), JSON.stringify(updates.receiveItemIds)
        ]);
    } else if (updates.status !== undefined) {
        await db.execute('CALL sp_UpdateTradeStatus(?, ?)', [id, updates.status]);
    }
    return findTradeById(id);
}

function formatTradeView(trade, userId) {
    if (!trade) return null;
    const isIncoming = trade.recipientId === userId;
    const isPending = trade.status === 'Pending';
    return {
        ...trade,
        tab: isIncoming && isPending ? 'incoming' : (!isPending ? 'history' : 'sent'),
        trader: isIncoming ? trade.senderName : trade.recipientName,
        give: isIncoming ? trade.receive : trade.give,
        receive: isIncoming ? trade.give : trade.receive
    };
}

module.exports = {
    getTradesByTab, getTradeCounts, findTradeById,
    getFormattedTradeById, createTrade, updateTrade
};