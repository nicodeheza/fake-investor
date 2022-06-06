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
const getStocksData_1 = __importDefault(require("./getStocksData"));
function default_1(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userStocks = yield User_1.default.getAllStock(userId);
            const stocksPrice = yield (0, getStocksData_1.default)(userStocks.map((obj) => obj.symbol));
            const porfolio = {};
            userStocks.forEach((obj, i) => {
                porfolio[obj.symbol] = parseInt(obj.quantity);
            });
            let portfolioVal = 0;
            stocksPrice.forEach((obj) => {
                portfolioVal += obj.price * porfolio[obj.symbol];
            });
            return portfolioVal;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    });
}
exports.default = default_1;
