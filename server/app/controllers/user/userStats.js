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
const User_1 = __importDefault(require("../../models/User"));
const Stock_1 = __importDefault(require("../../models/Stock"));
const getPortfolioVal_1 = __importDefault(require("../../functions/getPortfolioVal"));
function default_1(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.user[0].user_id;
            const fudId = yield Stock_1.default.getIdFromSymbol("FUD");
            const portfolioVal = yield (0, getPortfolioVal_1.default)(userId);
            const liquidMon = yield User_1.default.getStockHolding(userId, fudId);
            const liquidPer = (liquidMon * 100) / portfolioVal;
            const stocksMon = portfolioVal - liquidMon;
            const stocksPer = (stocksMon * 100) / portfolioVal;
            const gainMony = portfolioVal - 1000000;
            const gainPer = (gainMony * 100) / 1000000;
            res.status(200).json({
                gainMony,
                gainPer,
                liquidMon,
                liquidPer,
                stocksMon,
                stocksPer,
                total: portfolioVal
            });
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
exports.default = default_1;
