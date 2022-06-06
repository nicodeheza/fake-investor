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
const fetch = __importStar(require("node-fetch"));
const sinon_1 = __importDefault(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const stockProfile_1 = __importDefault(require("../../../controllers/stoks/stockProfile"));
const Stock_1 = __importDefault(require("../../../models/Stock"));
const User_1 = __importDefault(require("../../../models/User"));
const redisConn_1 = require("../../../redis/redisConn");
chai_1.default.use(sinon_chai_1.default);
const resMock = {
    status: function (n) {
        return this;
    },
    json: function (data) {
        return this;
    }
};
const fakeResponse = {
    quoteResponse: {
        result: [
            {
                longName: "Test Stock",
                regularMarketPrice: 100,
                regularMarketChange: 4.5,
                regularMarketPreviousClose: 99,
                regularMarketOpen: 101,
                regularMarketDayRange: "115.26 - 119.14",
                fiftyTwoWeekRange: "53.1525 - 137.98",
                regularMarketVolume: 5000000,
                averageDailyVolume3Month: 3000000,
                regularMarketChangePercent: 3.9
            }
        ]
    }
};
describe("StockProfile controller", function () {
    let statusSpy, jsonSpy, redisGetStub, fetchStub, redisSetExStub, getIdFromSymbolStub, getStockHoldingStub;
    describe("call with no data in the cache and user loged", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const reqMock = {
                    params: {
                        symbol: "S1"
                    },
                    user: [
                        {
                            user_id: 1
                        }
                    ]
                };
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                redisGetStub = sinon_1.default.stub(redisConn_1.redisClientCache, "get");
                fetchStub = sinon_1.default.stub(fetch, "default");
                redisSetExStub = sinon_1.default.stub(redisConn_1.redisClientCache, "setEx");
                getIdFromSymbolStub = sinon_1.default.stub(Stock_1.default, "getIdFromSymbol");
                getStockHoldingStub = sinon_1.default.stub(User_1.default, "getStockHolding");
                redisGetStub.callsFake(() => Promise.resolve(null));
                fetchStub.callsFake(() => Promise.resolve({ json: () => fakeResponse }));
                getIdFromSymbolStub.callsFake(() => Promise.resolve(2));
                getStockHoldingStub.callsFake(() => Promise.resolve(200));
                yield (0, stockProfile_1.default)(reqMock, resMock);
            });
        });
        after(function () {
            statusSpy.restore();
            jsonSpy.restore();
            redisGetStub.restore();
            fetchStub.restore();
            redisSetExStub.restore();
            getIdFromSymbolStub.restore();
            getStockHoldingStub.restore();
        });
        it("redis get has been called with the correct arguments", function () {
            (0, chai_1.expect)(redisGetStub).to.have.been.calledWith("stockProfile=S1");
        });
        it("fetch has been called with the correct arguments", function () {
            (0, chai_1.expect)(fetchStub).to.have.been.calledWith(`https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=S1`, {
                method: "GET",
                headers: {
                    "x-api-key": process.env.YF_API_KEY || "",
                    "Content-Type": "application/json"
                }
            });
        });
        it("redis setEx has been called with the correct arguments", function () {
            (0, chai_1.expect)(redisSetExStub).to.have.been.calledWith("stockProfile=S1", 3600, JSON.stringify(fakeResponse.quoteResponse.result[0]));
        });
        it("getIdFromSymbol has been called with the correct arguments", function () {
            (0, chai_1.expect)(getIdFromSymbolStub).to.have.been.calledWith("S1");
        });
        it("getStockHolding has been called with the correct arguments", function () {
            (0, chai_1.expect)(getStockHoldingStub).to.have.been.calledWith(1, 2);
        });
        it("res status was 200", function () {
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(200);
        });
        it("res json has been called with the correct data", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({
                longName: fakeResponse.quoteResponse.result[0].longName,
                regularMarketPrice: fakeResponse.quoteResponse.result[0].regularMarketPrice,
                regularMarketChange: fakeResponse.quoteResponse.result[0].regularMarketChange,
                regularMarketChangePercent: fakeResponse.quoteResponse.result[0].regularMarketChangePercent,
                regularMarketPreviousClose: fakeResponse.quoteResponse.result[0].regularMarketPreviousClose,
                regularMarketOpen: fakeResponse.quoteResponse.result[0].regularMarketOpen,
                regularMarketDayRange: fakeResponse.quoteResponse.result[0].regularMarketDayRange,
                fiftyTwoWeekRange: fakeResponse.quoteResponse.result[0].fiftyTwoWeekRange,
                regularMarketVolume: fakeResponse.quoteResponse.result[0].regularMarketVolume,
                averageDailyVolume3Month: fakeResponse.quoteResponse.result[0].averageDailyVolume3Month,
                userProp: 200
            });
        });
    });
    describe("call with data in the cache and user unloged", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const reqMock = {
                    params: {
                        symbol: "S1"
                    }
                };
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                redisGetStub = sinon_1.default.stub(redisConn_1.redisClientCache, "get");
                fetchStub = sinon_1.default.stub(fetch, "default");
                redisSetExStub = sinon_1.default.stub(redisConn_1.redisClientCache, "setEx");
                getIdFromSymbolStub = sinon_1.default.stub(Stock_1.default, "getIdFromSymbol");
                getStockHoldingStub = sinon_1.default.stub(User_1.default, "getStockHolding");
                redisGetStub.callsFake(() => Promise.resolve(JSON.stringify(fakeResponse.quoteResponse.result[0])));
                yield (0, stockProfile_1.default)(reqMock, resMock);
            });
        });
        after(function () {
            statusSpy.restore();
            jsonSpy.restore();
            redisGetStub.restore();
            fetchStub.restore();
            redisSetExStub.restore();
            getIdFromSymbolStub.restore();
            getStockHoldingStub.restore();
        });
        it("redis get has been called with the correct arguments", function () {
            (0, chai_1.expect)(redisGetStub).to.have.been.calledWith("stockProfile=S1");
        });
        it("fetch hasn't been", function () {
            (0, chai_1.expect)(fetchStub).to.have.been.callCount(0);
        });
        it("redis setEx hasn't been called", function () {
            (0, chai_1.expect)(redisSetExStub).to.have.been.callCount(0);
        });
        it("getIdFromSymbol hasn't been called", function () {
            (0, chai_1.expect)(getIdFromSymbolStub).to.have.been.callCount(0);
        });
        it("getStockHolding hasn't been called", function () {
            (0, chai_1.expect)(getStockHoldingStub).to.have.been.callCount(0);
        });
        it("res status was 200", function () {
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(200);
        });
        it("res json has been called with the correct data", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({
                longName: fakeResponse.quoteResponse.result[0].longName,
                regularMarketPrice: fakeResponse.quoteResponse.result[0].regularMarketPrice,
                regularMarketChange: fakeResponse.quoteResponse.result[0].regularMarketChange,
                regularMarketChangePercent: fakeResponse.quoteResponse.result[0].regularMarketChangePercent,
                regularMarketPreviousClose: fakeResponse.quoteResponse.result[0].regularMarketPreviousClose,
                regularMarketOpen: fakeResponse.quoteResponse.result[0].regularMarketOpen,
                regularMarketDayRange: fakeResponse.quoteResponse.result[0].regularMarketDayRange,
                fiftyTwoWeekRange: fakeResponse.quoteResponse.result[0].fiftyTwoWeekRange,
                regularMarketVolume: fakeResponse.quoteResponse.result[0].regularMarketVolume,
                averageDailyVolume3Month: fakeResponse.quoteResponse.result[0].averageDailyVolume3Month,
                userProp: false
            });
        });
    });
    describe("erro test", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const reqMock = {
                    params: {
                        symbol: "S1"
                    }
                };
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                redisGetStub = sinon_1.default.stub(redisConn_1.redisClientCache, "get");
                fetchStub = sinon_1.default.stub(fetch, "default");
                redisSetExStub = sinon_1.default.stub(redisConn_1.redisClientCache, "setEx");
                getIdFromSymbolStub = sinon_1.default.stub(Stock_1.default, "getIdFromSymbol");
                getStockHoldingStub = sinon_1.default.stub(User_1.default, "getStockHolding");
                redisGetStub.callsFake(() => Promise.reject("test error"));
                yield (0, stockProfile_1.default)(reqMock, resMock);
            });
        });
        after(function () {
            statusSpy.restore();
            jsonSpy.restore();
            redisGetStub.restore();
            fetchStub.restore();
            redisSetExStub.restore();
            getIdFromSymbolStub.restore();
            getStockHoldingStub.restore();
        });
        it("res status was 200", function () {
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(500);
        });
        it("res json has been called with the correct data", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({ message: "Nonexistent symbol" });
        });
    });
});
