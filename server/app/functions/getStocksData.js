"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const redisConn_1 = require("../redis/redisConn");
const sliceIntoChunks_1 = __importDefault(require("./sliceIntoChunks"));
function getStocksData(symbols) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const stocksValues = yield Promise.all(symbols.map((symbol) => __awaiter(this, void 0, void 0, function* () {
                if (symbol === "FUD")
                    return { symbol, price: 1, change: "" };
                const redisKey = `stockValue=${symbol}`;
                const res = yield redisConn_1.redisClientCache.get(redisKey);
                if (res === null)
                    return { symbol, price: null, change: null };
                const vals = JSON.parse(res);
                return { symbol, price: vals === null || vals === void 0 ? void 0 : vals.price, change: vals === null || vals === void 0 ? void 0 : vals.change };
            })));
            const apiSymbols = stocksValues.filter((obj) => obj.price === null);
            if (apiSymbols.length > 0) {
                const callArr = (0, sliceIntoChunks_1.default)(apiSymbols, 10);
                let resArr = yield Promise.all(callArr.map((arr) => __awaiter(this, void 0, void 0, function* () {
                    const symbols = arr.reduce((acc, obj) => acc + obj.symbol + ",", "");
                    const response = yield (0, node_fetch_1.default)(`https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=${symbols}`, {
                        method: "GET",
                        headers: {
                            "x-api-key": process.env.YF_API_KEY || "",
                            "Content-Type": "application/json"
                        }
                    });
                    const resData = yield response.json();
                    if (resData.message === "Limit Exceeded")
                        throw resData.message;
                    return resData.quoteResponse.result;
                })));
                resArr = resArr.flat();
                resArr = resArr.map((obj) => {
                    return {
                        symbol: obj.symbol,
                        price: obj.regularMarketPrice,
                        change: obj.regularMarketChangePercent
                    };
                });
                yield Promise.all(resArr.map((obj) => redisConn_1.redisClientCache.setEx(`stockValue=${obj.symbol}`, 3600, JSON.stringify({ price: obj.price, change: obj.change }))));
                return [...stocksValues.filter((obj) => obj.price), ...resArr];
            }
            else {
                return stocksValues;
            }
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
exports.default = getStocksData;
