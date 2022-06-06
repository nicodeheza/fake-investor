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
const getHistoricalOwnerships_1 = __importDefault(require("../../functions/getHistoricalOwnerships"));
const User_1 = __importDefault(require("../../models/User"));
chai_1.default.use(sinon_chai_1.default);
const ONE_DAY = 1000 * 60 * 60 * 24;
const TO_DATE = Date.now();
const allStockRes = [
    {
        symbol: "S1",
        stock_name: "Stock 1",
        quantity: "100"
    },
    {
        symbol: "S2",
        stock_name: "Stock 2",
        quantity: "500"
    },
    {
        symbol: "S3",
        stock_name: "Stock 3",
        quantity: "110"
    }
];
const transactions = [
    {
        history_date: new Date(TO_DATE - ONE_DAY * 5),
        symbol: "S1",
        buy: false,
        quantity: 100
    },
    {
        history_date: new Date(TO_DATE - ONE_DAY * 2),
        symbol: "S1",
        buy: true,
        quantity: 50
    },
    {
        history_date: new Date(TO_DATE - ONE_DAY),
        symbol: "S1",
        buy: false,
        quantity: 50
    },
    {
        history_date: new Date(TO_DATE - ONE_DAY * 5),
        symbol: "S2",
        buy: true,
        quantity: 20
    },
    {
        history_date: new Date(TO_DATE - ONE_DAY * 3),
        symbol: "S2",
        buy: true,
        quantity: 20
    },
    {
        history_date: new Date(TO_DATE - ONE_DAY * 2),
        symbol: "S2",
        buy: true,
        quantity: 20
    },
    {
        history_date: new Date(TO_DATE - ONE_DAY * 2),
        symbol: "S2",
        buy: true,
        quantity: 20
    },
    {
        history_date: new Date(TO_DATE - ONE_DAY * 5),
        symbol: "S3",
        buy: true,
        quantity: 300
    },
    {
        history_date: new Date(TO_DATE - ONE_DAY * 3),
        symbol: "S3",
        buy: false,
        quantity: 100
    },
    {
        history_date: new Date(TO_DATE - ONE_DAY * 2),
        symbol: "S3",
        buy: false,
        quantity: 100
    },
    {
        history_date: new Date(TO_DATE - ONE_DAY * 4),
        symbol: "S4",
        buy: true,
        quantity: 50
    },
    {
        history_date: new Date(TO_DATE - ONE_DAY * 3),
        symbol: "S4",
        buy: false,
        quantity: 100
    }
];
describe("GetHistoricalOwnerships", function () {
    let getAllStockStub, transactionsFromToStub;
    beforeEach(function () {
        getAllStockStub = sinon_1.default.stub(User_1.default, "getAllStock");
        transactionsFromToStub = sinon_1.default.stub(User_1.default, "getTransactionFromDateToNow");
    });
    afterEach(function () {
        getAllStockStub.restore();
        transactionsFromToStub.restore();
    });
    it("return correct data", function () {
        return __awaiter(this, void 0, void 0, function* () {
            getAllStockStub.callsFake(() => Promise.resolve(allStockRes));
            transactionsFromToStub.callsFake(() => Promise.resolve(transactions));
            const res = yield (0, getHistoricalOwnerships_1.default)(new Date(TO_DATE - ONE_DAY * 5), 1);
            (0, chai_1.expect)(res.S1).to.equal(200);
            (0, chai_1.expect)(res.S2).to.equal(420);
            (0, chai_1.expect)(res.S3).to.equal(10);
            (0, chai_1.expect)(res.S4).to.equal(50);
        });
    });
});
