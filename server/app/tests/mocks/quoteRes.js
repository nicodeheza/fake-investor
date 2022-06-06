"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUOTE_RES_STATIC = void 0;
exports.QUOTE_RES_STATIC = {
    quoteResponse: {
        error: null,
        result: [
            {
                symbol: "IBM",
                regularMarketPrice: 100,
                regularMarketChangePercent: 1
            },
            {
                symbol: "AAPL",
                regularMarketPrice: 200,
                regularMarketChangePercent: 2
            },
            {
                symbol: "GOOG",
                regularMarketPrice: 300,
                regularMarketChangePercent: 3
            }
        ]
    }
};
function quoteRes(symbols) {
    const res = {
        quoteResponse: {
            error: null,
            result: []
        }
    };
    symbols.forEach((ele) => {
        res.quoteResponse.result.push({
            symbol: ele,
            regularMarketPrice: Math.random() * 200 + 100,
            regularMarketChangePercent: Math.random() * 50
        });
    });
    return res;
}
exports.default = quoteRes;
