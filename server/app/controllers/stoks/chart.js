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
const redisConn_1 = require("../../redis/redisConn");
function chart(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const ticker = req.params.symbol.toUpperCase();
        const redisKey = `stockChart=${ticker}`;
        let resData;
        try {
            const redisData = yield redisConn_1.redisClientCache.get(redisKey);
            if (!redisData) {
                const response = yield (0, node_fetch_1.default)(`https://yfapi.net/v8/finance/chart/${ticker}?range=5y&region=US&interval=1d&lang=en`, {
                    method: "GET",
                    headers: {
                        "x-api-key": process.env.YF_API_KEY || "",
                        "Content-Type": "application/json"
                    }
                });
                resData = yield response.json();
                if (resData.message === "Limit Exceeded")
                    throw resData.message;
                yield redisConn_1.redisClientCache.setEx(redisKey, 3600, JSON.stringify(resData));
                console.log("stock chart api");
            }
            else {
                resData = JSON.parse(redisData);
                console.log("stock chart redis");
            }
            const d = resData.chart.result[0].timestamp;
            const jsTimestamp = d.map((n) => n * 1000);
            const resObj = {
                timestamp: jsTimestamp,
                close: resData.chart.result[0].indicators.quote[0].close,
                low: resData.chart.result[0].indicators.quote[0].low,
                open: resData.chart.result[0].indicators.quote[0].open,
                high: resData.chart.result[0].indicators.quote[0].high
            };
            res.status(200).json(resObj);
        }
        catch (err) {
            console.log(err);
            if (err === "Limit Exceeded") {
                res.status(502).json({ message: err });
            }
            else {
                res.status(500).json({ message: err });
            }
        }
    });
}
exports.default = chart;
