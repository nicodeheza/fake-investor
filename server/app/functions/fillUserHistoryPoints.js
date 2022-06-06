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
const User_1 = __importDefault(require("../models/User"));
const getHistoricalOwnerships_1 = __importDefault(require("./getHistoricalOwnerships"));
const getStockHistoricalPrice_1 = __importDefault(require("./getStockHistoricalPrice"));
function fillUserHistoryPoints(userId, historyPoints) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const hp = Object.assign({}, historyPoints);
            const dates = Object.keys(hp).sort((a, b) => parseInt(a) - parseInt(b));
            let complete = true;
            for (let i = 0; i < dates.length - 1; i++) {
                const dateDiff = parseInt(dates[i + 1]) - parseInt(dates[i]);
                const oneDay = 1000 * 60 * 60 * 24;
                if (dateDiff > oneDay) {
                    const ownership = yield (0, getHistoricalOwnerships_1.default)(new Date(parseInt(dates[i])), userId);
                    complete = false;
                    const datesToComplete = dateDiff / oneDay;
                    for (let j = 0; j < datesToComplete - 1; j++) {
                        const date = parseInt(dates[i]) + (j + 1) * oneDay;
                        const datePrices = yield (0, getStockHistoricalPrice_1.default)(Object.keys(ownership).map((symbol) => {
                            return {
                                symbol,
                                date
                            };
                        }));
                        const totalStockPrice = datePrices === null || datePrices === void 0 ? void 0 : datePrices.reduce((prev, curr) => {
                            return prev + ownership[curr.symbol] * curr.price;
                        }, 0);
                        hp[date] = {
                            portfolioValue: totalStockPrice + hp[dates[i]].liquid,
                            liquid: hp[dates[i]].liquid,
                            transactions: []
                        };
                        yield User_1.default.addHistory(userId, hp[date].portfolioValue, hp[date].liquid, new Date(date));
                    }
                }
            }
            if (complete)
                return historyPoints;
            return hp;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
exports.default = fillUserHistoryPoints;
