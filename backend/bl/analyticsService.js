const analyticsDal = require('../dal/analyticsDal');

const allowedRanges = new Set(['today', '7d', '30d', 'year']);

async function getDashboard(range = '7d') {
    if (!allowedRanges.has(range)) {
        const error = new Error('Unknown analytics range');
        error.statusCode = 400;
        throw error;
    }

    const chartValues = analyticsDal.getRevenueByRange(range);
    const kpis = await analyticsDal.getKpis();
    const skins = await analyticsDal.getTopSkins();

    return {
        range,
        rangeLabel: getRangeLabel(range),
        kpis: kpis.map(formatKpi),
        revenue: chartValues.map((value, index) => ({
            label: getChartLabel(range, index),
            value
        })),
        skins: skins
    };
}

async function exportReport(range = '7d') {
    const dashboard = await getDashboard(range);

    return {
        fileName: `market-analytics-${range}.csv`,
        contentType: 'text/csv',
        rowCount: dashboard.skins.length,
        message: 'Report export successful. Downloading CSV...'
    };
}

function formatKpi(kpi) {
    return {
        ...kpi,
        value: formatValue(kpi.value, kpi.format)
    };
}

function formatValue(value, format) {
    if (format === 'currency') return `${value.toLocaleString('en-US')} ₺`;
    if (format === 'percent') return `${value}%`;
    return value.toLocaleString('en-US');
}

function getRangeLabel(range) {
    const labels = {
        today: 'Hourly trading activity',
        '7d': 'Daily trading activity',
        '30d': 'Grouped daily trading activity',
        year: 'Monthly trading activity'
    };

    return labels[range];
}

function getChartLabel(range, index) {
    if (range === 'today') return `${index + 9}:00`;
    if (range === 'year') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][index];
    return `D${index + 1}`;
}

module.exports = {
    getDashboard,
    exportReport
};
