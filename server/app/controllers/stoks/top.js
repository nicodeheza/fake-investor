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
const Stock_1 = __importDefault(require("../../models/Stock"));
function top(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const topStocks = yield Stock_1.default.getTopSymbols();
            const stocksData = yield (0, getStocksData_1.default)(topStocks.map((ele) => ele.symbol));
            const stocksDataObj = stocksData.reduce((acc, curr) => (Object.assign(Object.assign({}, acc), { [curr.symbol]: {
                    price: curr.price,
                    change: curr.change
                } })), {});
            const top = {};
            topStocks.forEach((ele, i) => {
                const ranking = i + 1;
                const name = `${ele.stock_name}(${ele.symbol})`;
                const price = stocksDataObj[ele.symbol].price;
                const variation = (stocksDataObj[ele.symbol].change * 100) / price;
                top[ranking] = {
                    name,
                    symbol: ele.symbol,
                    price,
                    variation
                };
            });
            res.status(200).json(top);
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
exports.default = top;
