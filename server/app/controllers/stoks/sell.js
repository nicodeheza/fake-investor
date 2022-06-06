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
const updateOrCreateToDayHistory_1 = __importDefault(require("../../functions/updateOrCreateToDayHistory"));
const Stock_1 = __importDefault(require("../../models/Stock"));
const User_1 = __importDefault(require("../../models/User"));
function sell(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { symbol, name, amount, price } = req.body;
        const userId = req.user[0].user_id;
        try {
            yield User_1.default.addFud(userId, amount * price);
            const stockId = yield Stock_1.default.getIdFromSymbol(symbol);
            const currentHolding = yield User_1.default.getStockHolding(userId, stockId);
            yield User_1.default.updateStockQuantity(stockId, userId, currentHolding - amount);
            const historyId = yield (0, updateOrCreateToDayHistory_1.default)(userId);
            yield User_1.default.addTransaction(historyId, stockId, false, price, amount);
            res.status(200).json({ message: "ok" });
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
exports.default = sell;
