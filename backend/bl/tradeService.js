// backend/bl/tradeService.js
const tradeDal = require('../dal/tradeDal');
const itemDal = require('../dal/itemDal');
const userDal = require('../dal/userDal');
const friendshipDal = require('../dal/friendshipDal');

const allowedTabs = new Set(['incoming', 'sent', 'history']);

// ─── Public API ──────────────────────────────────────────────────────────────

async function getTrades(tab = 'incoming', userId) {
    if (!allowedTabs.has(tab)) {
        const error = new Error('Unknown trade tab');
        error.statusCode = 400; throw error;
    }
    const [counts, offers] = await Promise.all([
        tradeDal.getTradeCounts(userId),
        tradeDal.getTradesByTab(tab, userId)
    ]);
    return {
        tab,
        counts,
        offers: offers.map(enrichTrade)
    };
}

async function getTrade(id, userId) {
    const trade = await tradeDal.getFormattedTradeById(id, userId);
    if (!trade) {
        const error = new Error('Trade offer not found');
        error.statusCode = 404; throw error;
    }
    return enrichTrade(trade);
}

async function createTrade(senderId, recipientId, isGift = false, giveItemIds = [], receiveItemIds = []) {
    // Guard: only friends can trade
    const friendship = await friendshipDal.getFriendship(senderId, recipientId);
    if (!friendship || friendship.status !== 'accepted') {
        const error = new Error('Вы можете отправлять трейды только своим друзьям');
        error.statusCode = 403; throw error;
    }

    const giveItems = [];
    const receiveItems = [];

    // Collect give items (sender's inventory)
    for (const itemId of (giveItemIds || [])) {
        const item = await itemDal.findInventoryItemById(itemId, senderId);
        if (item) giveItems.push({ name: item.name, condition: item.condition, value: item.estPrice, rarity: item.rarity });
    }

    // Collect receive items (recipient's inventory) — skip in gift mode
    if (!isGift) {
        for (const itemId of (receiveItemIds || [])) {
            const item = await itemDal.findInventoryItemById(itemId, recipientId);
            if (item) receiveItems.push({ name: item.name, condition: item.condition, value: item.estPrice, rarity: item.rarity });
        }
    }

    const sender    = await userDal.findUserById(senderId);
    const recipient = await userDal.findUserById(recipientId);

    return tradeDal.createTrade({
        senderId:       sender.id,
        recipientId:    recipient.id,
        senderName:     sender.display_name    || sender.username,
        recipientName:  recipient.display_name || recipient.username,
        status:         'Pending',
        give:           giveItems,
        receive:        receiveItems,
        giveItemIds:    giveItemIds    || [],
        receiveItemIds: receiveItemIds || [],
        isGift
    });
}

async function acceptTrade(id, userId) {
    const trade = await tradeDal.findTradeById(id);
    if (!trade || trade.recipientId !== userId) {
        const error = new Error('Trade not found or not authorized');
        error.statusCode = 403; throw error;
    }

    // Transfer items in DB
    try {
        if (trade.giveItemIds && trade.giveItemIds.length > 0) {
            await itemDal.transferInventoryItems(trade.giveItemIds, trade.senderId, trade.recipientId);
        }
        if (!trade.isGift && trade.receiveItemIds && trade.receiveItemIds.length > 0) {
            await itemDal.transferInventoryItems(trade.receiveItemIds, trade.recipientId, trade.senderId);
        }
    } catch (err) {
        console.error('[Trade] Item transfer failed:', err.message);
    }

    return moveToHistory(id, 'Accepted', userId);
}

async function declineTrade(id, userId) {
    const trade = await getTrade(id, userId);
    if (trade.tab !== 'incoming') {
        const error = new Error('Trade is not incoming'); error.statusCode = 409; throw error;
    }
    return moveToHistory(id, 'Declined', userId);
}

async function cancelTrade(id, userId) {
    const trade = await getTrade(id, userId);
    if (trade.tab !== 'sent') {
        const error = new Error('Trade is not sent'); error.statusCode = 409; throw error;
    }
    return moveToHistory(id, 'Cancelled', userId);
}

async function counterTrade(id, userId, itemIds = []) {
    const trade = await tradeDal.findTradeById(id);
    if (!trade) {
        const error = new Error('Trade offer not found'); error.statusCode = 404; throw error;
    }
    if (trade.recipientId !== userId) {
        const error = new Error('Only the recipient can counter this trade'); error.statusCode = 403; throw error;
    }

    const counterItems = [];
    for (const itemId of (itemIds || [])) {
        const item = await itemDal.findInventoryItemById(itemId, userId);
        if (item) counterItems.push({ name: item.name, condition: item.condition, value: item.estPrice, rarity: item.rarity });
    }

    // Swap sender/recipient and update items
    await tradeDal.updateTrade(id, {
        senderId:      trade.recipientId,
        senderName:    trade.recipientName,
        recipientId:   trade.senderId,
        recipientName: trade.senderName,
        give:          counterItems,
        receive:       trade.give,
        giveItemIds:   itemIds || [],
        receiveItemIds: trade.giveItemIds || [],
        status:        'Pending'
    });

    return getTrade(id, userId);
}

// ─── Internals ───────────────────────────────────────────────────────────────

async function moveToHistory(id, status, userId) {
    await tradeDal.updateTrade(id, { status });
    return getTrade(id, userId);
}

function enrichTrade(trade) {
    const giveValue    = sumValue(trade.give    || []);
    const receiveValue = sumValue(trade.receive || []);
    return {
        ...trade,
        giveValue,
        receiveValue,
        valueDiff: Number((receiveValue - giveValue).toFixed(2))
    };
}

function sumValue(items) {
    return Number(items.reduce((sum, item) => sum + (item.value || 0), 0).toFixed(2));
}

module.exports = { getTrades, getTrade, createTrade, acceptTrade, declineTrade, cancelTrade, counterTrade };