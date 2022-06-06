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
const fillUserHistoryPoints_1 = __importDefault(require("../../functions/fillUserHistoryPoints"));
const updateOrCreateToDayHistory_1 = __importDefault(require("../../functions/updateOrCreateToDayHistory"));
function userChart(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.user[0].user_id;
            yield (0, updateOrCreateToDayHistory_1.default)(userId);
            const historyPoints = yield User_1.default.getChartHistoryPoints(userId);
            const fillPoints = yield (0, fillUserHistoryPoints_1.default)(userId, historyPoints);
            res.status(200).json(fillPoints);
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
exports.default = userChart;
