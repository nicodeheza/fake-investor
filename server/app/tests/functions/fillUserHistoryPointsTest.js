"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const chai_1 = __importStar(require("chai"));
const sinon_1 = __importDefault(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const getHistoricalOwn = __importStar(require("../../functions/getHistoricalOwnerships"));
const getStockHisPrice = __importStar(require("../../functions/getStockHistoricalPrice"));
const fillUserHistoryPoints_1 = __importDefault(require("../../functions/fillUserHistoryPoints"));
const User_1 = __importDefault(require("../../models/User"));
chai_1.default.use(sinon_chai_1.default);
const TODAY = Date.now();
const ONE_DAY = 1000 * 60 * 60 * 24;
function getPassDay(n) {
    return TODAY - ONE_DAY * n;
}
const points = {
    [getPassDay(10)]: {
        portfolioValue: 17000,
        liquid: 8000,
        transactions: [
            {
                price: 100,
                quantity: 10,
                buy: true,
                symbol: "S1"
            }
        ]
    },
    [getPassDay(9)]: {
        portfolioValue: 16000,
        liquid: 7000,
        transactions: [
            {
                price: 200,
                quantity: 5,
                buy: true,
                symbol: "S2"
            }
        ]
    },
    [getPassDay(5)]: {
        portfolioValue: 16500,
        liquid: 7500,
        transactions: [
            {
                price: 200,
                quantity: 5,
                buy: true,
                symbol: "S3"
            },
            {
                price: 300,
                quantity: 5,
                buy: false,
                symbol: "S2"
            }
        ]
    },
    [getPassDay(4)]: {
        portfolioValue: 17000,
        liquid: 8000,
        transactions: [
            {
                price: 100,
                quantity: 5,
                buy: false,
                symbol: "S3"
            }
        ]
    },
    [TODAY]: {
        portfolioValue: 17000,
        liquid: 8000,
        transactions: []
    }
};
describe("FillUserHistoryPoints", function () {
    let getHistoricalOwnershipsStub, getStockHistoricalPriceStub, addHistoryStub;
    beforeEach(function () {
        getHistoricalOwnershipsStub = sinon_1.default.stub(getHistoricalOwn, "default");
        getStockHistoricalPriceStub = sinon_1.default.stub(getStockHisPrice, "default");
        addHistoryStub = sinon_1.default.stub(User_1.default, "addHistory");
        getHistoricalOwnershipsStub.callsFake(() => Promise.resolve({
            S1: 10,
            S2: 10,
            S3: 10
        }));
        getStockHistoricalPriceStub.callsFake((arr) => {
            return Promise.resolve(arr.map((obj) => {
                return {
                    symbol: obj.symbol,
                    date: obj.date,
                    price: 100
                };
            }));
        });
    });
    afterEach(function () {
        getHistoricalOwnershipsStub.restore();
        getStockHistoricalPriceStub.restore();
        addHistoryStub.restore();
    });
    it("should return all consecutive dates from the start date to the current date", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield (0, fillUserHistoryPoints_1.default)(1, points);
            const dates = Object.keys(res);
            dates.sort((a, b) => parseInt(a) - parseInt(b));
            for (let i = 0; i < dates.length - 1; i++) {
                const actualDate = new Date(parseInt(dates[i]));
                actualDate.setHours(0, 0, 0, 0);
                const tomorrow = new Date(actualDate);
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                const nextDate = new Date(parseInt(dates[i + 1]));
                nextDate.setHours(0, 0, 0, 0);
                (0, chai_1.expect)(nextDate).to.deep.equal(tomorrow);
            }
        });
    });
    it("must return correct data", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield (0, fillUserHistoryPoints_1.default)(1, points);
            const createdPoints = Object.keys(res).filter((e) => !points[e]);
            createdPoints.forEach((e) => {
                const eNum = parseInt(e);
                let lastLiquid;
                if (eNum > getPassDay(9) && eNum < getPassDay(5)) {
                    lastLiquid = points[getPassDay(9)].liquid;
                }
                else {
                    lastLiquid = points[getPassDay(4)].liquid;
                }
                (0, chai_1.expect)(res[e].liquid).to.equal(lastLiquid);
                (0, chai_1.expect)(res[e].transactions).to.have.lengthOf(0);
                (0, chai_1.expect)(res[e].portfolioValue).to.equal(lastLiquid + 3000);
            });
        });
    });
    it("getHistoricalOwnerships must be called the correct times with the correct arguments", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, fillUserHistoryPoints_1.default)(1, points);
            (0, chai_1.expect)(getHistoricalOwnershipsStub).to.have.been.calledTwice;
            [getPassDay(9), getPassDay(4)].forEach((e) => {
                (0, chai_1.expect)(getHistoricalOwnershipsStub).to.have.been.calledWith(new Date(e), 1);
            });
        });
    });
    it("getStockHistoricalPrice must be called the correct times with the correct arguments", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield (0, fillUserHistoryPoints_1.default)(1, points);
            const createdPoints = Object.keys(res).filter((e) => !points[e]);
            createdPoints.sort((a, b) => parseInt(a) - parseInt(b));
            const symbols = ["S1", "S2", "S3"];
            (0, chai_1.expect)(getStockHistoricalPriceStub).to.have.been.callCount(createdPoints.length);
            createdPoints.forEach((ele) => {
                (0, chai_1.expect)(getStockHistoricalPriceStub).to.have.been.calledWith(symbols.map((symbol) => {
                    return {
                        symbol,
                        date: parseInt(ele)
                    };
                }));
            });
        });
    });
    it("add history must be called the correct times with the correct arguments", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield (0, fillUserHistoryPoints_1.default)(1, points);
            const createdPoints = Object.keys(res).filter((e) => !points[e]);
            createdPoints.sort((a, b) => parseInt(a) - parseInt(b));
            const symbols = ["S1", "S2", "S3"];
            (0, chai_1.expect)(addHistoryStub).to.have.been.callCount(createdPoints.length);
            createdPoints.forEach((ele) => {
                (0, chai_1.expect)(addHistoryStub).to.have.been.calledWith(1, res[ele].portfolioValue, res[ele].liquid, new Date(parseInt(ele)));
            });
        });
    });
});
