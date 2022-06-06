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
const User_1 = __importDefault(require("../../models/User"));
const getStockData = __importStar(require("../../functions/getStocksData"));
const getPortfolioVal_1 = __importDefault(require("../../functions/getPortfolioVal"));
chai_1.default.use(sinon_chai_1.default);
function createUserStocksAndData(quantity) {
    return {
        stocks: new Array(quantity).fill(undefined).map((e, i) => {
            const stock = {
                symbol: "S" + i,
                stock_name: `stock number ${i}`,
                quantity: "1"
            };
            return stock;
        }),
        data: new Array(quantity).fill(undefined).map((e, i) => {
            const data = {
                symbol: "S" + i,
                price: 10,
                change: Math.random() * 50
            };
            return data;
        })
    };
}
describe("GetPortfolioVal", function () {
    let getAllStockStub, getStockDataStub;
    before(function () {
        getAllStockStub = sinon_1.default.stub(User_1.default, "getAllStock");
        getStockDataStub = sinon_1.default.stub(getStockData, "default");
    });
    after(function () {
        getAllStockStub.restore();
        getStockDataStub.restore();
    });
    it("must return correct value", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const num = 5;
            const { stocks, data } = createUserStocksAndData(num);
            getAllStockStub.callsFake(() => Promise.resolve(stocks));
            getStockDataStub.callsFake(() => Promise.resolve(data));
            const res = yield (0, getPortfolioVal_1.default)(1);
            console.log(res);
            (0, chai_1.expect)(res).to.equal(num * 10);
        });
    });
});
