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
const redisConn_1 = require("../redis/redisConn");
const node_fetch_1 = __importDefault(require("node-fetch"));
const sliceIntoChunks_1 = __importDefault(require("./sliceIntoChunks"));
function getStockHistoricalPrice(stocksDate) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const symbols = stocksDate.map((obj) => obj.symbol);
            const cacheDataRes = yield Promise.all(symbols.map((s) => {
                return redisConn_1.redisClientCache.get(`stockHistory=${s}`);
            }));
            const data = {};
            for (let i = 0; i < cacheDataRes.length; i++) {
                const ele = cacheDataRes[i] ? JSON.parse(cacheDataRes[i]) : null;
                if (ele) {
                    data[ele.symbol] = ele;
                    const symbolIndex = symbols.findIndex((e) => e === ele.symbol);
                    if (symbolIndex >= 0) {
                        symbols.splice(symbolIndex, 1);
                    }
                }
            }
            if (symbols.length > 0) {
                const chunkSymbols = (0, sliceIntoChunks_1.default)(symbols, 10);
                for (let i = 0; i < chunkSymbols.length; i++) {
                    const sym = chunkSymbols[i];
                    const response = yield (0, node_fetch_1.default)(`https://yfapi.net/v8/finance/spark?interval=1d&range=5y&symbols=${sym.join()}`, {
                        method: "GET",
                        headers: {
                            "x-api-key": process.env.YF_API_KEY || "",
                            "Content-Type": "application/json"
                        }
                    });
                    const fetchData = yield response.json();
                    if (fetchData.message === "Limit Exceeded")
                        throw fetchData.message;
                    console.log("getStockHistoricalPrice api call");
                    yield Promise.all(sym.map((s) => {
                        data[s] = fetchData[s];
                        return redisConn_1.redisClientCache.setEx(`stockHistory=${s}`, 60 * 12, JSON.stringify(fetchData[s]));
                    }));
                }
            }
            const resArr = [];
            stocksDate.forEach((obj) => {
                let priceIndex;
                let prevDay = 0;
                do {
                    priceIndex = data[obj.symbol].timestamp.findIndex((ele) => {
                        const eleDate = new Date(ele * 1000);
                        const objDate = new Date(obj.date - prevDay);
                        return (eleDate.getDate() === objDate.getDate() &&
                            eleDate.getMonth() === objDate.getMonth() &&
                            eleDate.getFullYear() === eleDate.getFullYear());
                    });
                    prevDay += 1000 * 60 * 60 * 24;
                } while (priceIndex < 0 &&
                    obj.date - prevDay >= data[obj.symbol].timestamp[0] * 1000);
                if (obj.date - prevDay < data[obj.symbol].timestamp[0] * 1000)
                    throw `ERROR: ${obj.symbol} date out of range ${obj.date}`;
                resArr.push({
                    symbol: obj.symbol,
                    date: obj.date,
                    price: data[obj.symbol].close[priceIndex]
                });
            });
            return resArr;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
exports.default = getStockHistoricalPrice;
