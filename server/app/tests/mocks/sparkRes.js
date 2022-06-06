"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createDates(numOfDates) {
    const dates = [];
    const startDate = Date.now();
    const oneDay = 1000 * 60 * 60 * 24;
    for (let i = numOfDates; i >= 0; i--) {
        const insertDate = startDate - oneDay * i;
        const day = new Date(insertDate).getDay();
        if (day === 0 || day === 6)
            continue;
        dates.push(Math.floor(insertDate / 1000));
    }
    return dates;
}
function sparkRes(symbols, random = true) {
    const res = {};
    symbols.forEach((symbol) => {
        const timestamp = createDates(365);
        const close = timestamp.map((e, i) => (random ? Math.random() * 200 : 190));
        res[symbol] = {
            previousClose: null,
            symbol: symbol,
            chartPreviousClose: 200,
            timestamp,
            close,
            end: null,
            start: null,
            dataGranularity: 300
        };
    });
    return res;
}
exports.default = sparkRes;
