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
const Stock_1 = __importDefault(require("../../models/Stock"));
const User_1 = __importDefault(require("../../models/User"));
function stockProfile(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const redisKey = `stockProfile=${req.params.symbol}`;
        let data;
        try {
            const cashData = yield redisConn_1.redisClientCache.get(redisKey);
            if (!cashData) {
                const response = yield (0, node_fetch_1.default)(`https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=${req.params.symbol}`, {
                    method: "GET",
                    headers: {
                        "x-api-key": process.env.YF_API_KEY || "",
                        "Content-Type": "application/json"
                    }
                });
                const resData = yield response.json();
                if (resData.message === "Limit Exceeded")
                    throw resData.message;
                data = resData.quoteResponse.result[0];
                redisConn_1.redisClientCache.setEx(redisKey, 3600, JSON.stringify(data));
                console.log("stockProfile api");
            }
            else {
                data = JSON.parse(cashData);
                console.log("stockProfile redis");
            }
            let userHave;
            if (req.user) {
                const stockId = yield Stock_1.default.getIdFromSymbol(req.params.symbol);
                if (stockId) {
                    const user = req.user;
                    const userId = user[0].user_id;
                    userHave = (yield User_1.default.getStockHolding(userId, stockId)) || 0;
                }
                else {
                    userHave = 0;
                }
            }
            else {
                userHave = false;
            }
            const sendData = {
                longName: data.longName,
                regularMarketPrice: data.regularMarketPrice,
                regularMarketChange: data.regularMarketChange,
                regularMarketChangePercent: data.regularMarketChangePercent,
                regularMarketPreviousClose: data.regularMarketPreviousClose,
                regularMarketOpen: data.regularMarketOpen,
                regularMarketDayRange: data.regularMarketDayRange,
                fiftyTwoWeekRange: data.fiftyTwoWeekRange,
                regularMarketVolume: data.regularMarketVolume,
                averageDailyVolume3Month: data.averageDailyVolume3Month,
                userProp: userHave
            };
            res.status(200).json(sendData);
        }
        catch (err) {
            console.log(err);
            if (err === "Limit Exceeded") {
                res.status(502).json({ message: err });
            }
            else {
                res.status(500).json({ message: "Nonexistent symbol" });
            }
        }
    });
}
exports.default = stockProfile;
