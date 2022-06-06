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
const getStocksData_1 = __importDefault(require("../../functions/getStocksData"));
const User_1 = __importDefault(require("../../models/User"));
function userStocks(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.user[0].user_id;
            const stocks = yield User_1.default.getAllStock(userId);
            const vals = yield (0, getStocksData_1.default)(stocks.map((obj) => obj.symbol));
            const valsObj = vals.reduce((acc, curr) => (Object.assign(Object.assign({}, acc), { [curr.symbol]: { price: curr.price, change: curr.change } })), {});
            const result = stocks.map((obj) => {
                const fullName = obj.stock_name;
                const symbol = obj.symbol;
                const price = valsObj[obj.symbol].price;
                const change = valsObj[obj.symbol].change;
                const quaNum = parseInt(obj.quantity);
                const quaMon = quaNum * price;
                const r = {
                    fullName,
                    symbol,
                    price,
                    change,
                    quaNum,
                    quaMon
                };
                return r;
            });
            res.status(200).json(result);
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
exports.default = userStocks;
