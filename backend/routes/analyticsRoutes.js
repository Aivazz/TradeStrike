const analyticsService = require('../bl/analyticsService');
const { sendJson, sendRouteError } = require('./utils');

async function handleAnalyticsRoute(req, res, pathname, searchParams) {
    if (req.method === 'GET' && pathname === '/api/analytics') {
        try {
            const range = searchParams.get('range') || '7d';
            return sendJson(res, 200, { data: await analyticsService.getDashboard(range) });
        } catch (error) {
            return sendRouteError(res, error, 'Unexpected analytics error');
        }
    }

    if (req.method === 'POST' && pathname === '/api/analytics/export') {
        try {
            const range = searchParams.get('range') || '7d';
            return sendJson(res, 200, { data: await analyticsService.exportReport(range) });
        } catch (error) {
            return sendRouteError(res, error, 'Unexpected analytics export error');
        }
    }

    return false;
}

module.exports = {
    handleAnalyticsRoute
};