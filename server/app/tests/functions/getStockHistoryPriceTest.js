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
const node_fetch = __importStar(require("node-fetch"));
const chunks = __importStar(require("../../functions/sliceIntoChunks"));
const redisConn_1 = require("../../redis/redisConn");
const sparkRes_1 = __importDefault(require("../mocks/sparkRes"));
const getStockHistoricalPrice_1 = __importDefault(require("../../functions/getStockHistoricalPrice"));
chai_1.default.use(sinon_chai_1.default);
const subDay = 1000 * 60 * 60 * 24 * 5;
describe("getStockHistoricalPrice", function () {
    let fetchStub, chunksStub, redisGetStub, redisSetEXStub;
    describe("call with not data in cache", function () {
        beforeEach(function () {
            fetchStub = sinon_1.default.stub(node_fetch, "default");
            chunksStub = sinon_1.default.stub(chunks, "default");
            redisGetStub = sinon_1.default.stub(redisConn_1.redisClientCache, "get");
            redisSetEXStub = sinon_1.default.stub(redisConn_1.redisClientCache, "setEx");
        });
        afterEach(function () {
            fetchStub.restore();
            chunksStub.restore();
            redisGetStub.restore();
            redisSetEXStub.restore();
        });
        it("fetch and setEx must be called with the correct arguments", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const stockDate = [{ symbol: "S1", date: Date.now() - subDay }];
                redisGetStub.callsFake(() => Promise.resolve(null));
                chunksStub.callsFake(() => [["S1"]]);
                const sparckData = (0, sparkRes_1.default)(["S1"]);
                fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve(sparckData) }));
                yield (0, getStockHistoricalPrice_1.default)(stockDate);
                (0, chai_1.expect)(fetchStub).to.have.been.calledWith(`https://yfapi.net/v8/finance/spark?interval=1d&range=5y&symbols=S1`, {
                    method: "GET",
                    headers: {
                        "x-api-key": process.env.YF_API_KEY || "",
                        "Content-Type": "application/json"
                    }
                });
                (0, chai_1.expect)(redisSetEXStub).to.have.been.calledWith(`stockHistory=S1`, 60 * 12, JSON.stringify(sparckData["S1"]));
            });
        });
        it("fetch and setEx must be called the correct number of times", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const stockDate = [
                    { symbol: "S1", date: Date.now() - subDay },
                    { symbol: "S2", date: Date.now() - subDay },
                    { symbol: "S3", date: Date.now() - subDay },
                    { symbol: "S4", date: Date.now() - subDay },
                    { symbol: "S5", date: Date.now() - subDay },
                    { symbol: "S6", date: Date.now() - subDay },
                    { symbol: "S7", date: Date.now() - subDay },
                    { symbol: "S8", date: Date.now() - subDay },
                    { symbol: "S9", date: Date.now() - subDay },
                    { symbol: "S10", date: Date.now() - subDay },
                    { symbol: "S11", date: Date.now() - subDay },
                    { symbol: "S12", date: Date.now() - subDay },
                    { symbol: "S13", date: Date.now() - subDay },
                    { symbol: "S14", date: Date.now() - subDay },
                    { symbol: "S15", date: Date.now() - subDay }
                ];
                redisGetStub.callsFake(() => Promise.resolve(null));
                chunksStub.callsFake(() => [
                    ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"],
                    ["S11", "S12", "S13", "S14", "S15"]
                ]);
                const sparckData = (0, sparkRes_1.default)(stockDate.map((e) => e.symbol));
                fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve(sparckData) }));
                yield (0, getStockHistoricalPrice_1.default)(stockDate);
                (0, chai_1.expect)(fetchStub).to.have.been.calledTwice;
                (0, chai_1.expect)(redisSetEXStub).to.have.been.callCount(15);
            });
        });
        it("function must return the correct data", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const targetDate = Date.now() - subDay;
                const stockDate = [
                    { symbol: "S1", date: targetDate },
                    { symbol: "S2", date: targetDate },
                    { symbol: "S3", date: targetDate },
                    { symbol: "S4", date: targetDate },
                    { symbol: "S5", date: targetDate },
                    { symbol: "S6", date: targetDate },
                    { symbol: "S7", date: targetDate },
                    { symbol: "S8", date: targetDate },
                    { symbol: "S9", date: targetDate },
                    { symbol: "S10", date: targetDate }
                ];
                redisGetStub.callsFake(() => Promise.resolve(null));
                chunksStub.callsFake(() => [
                    ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"]
                ]);
                const sparckData = (0, sparkRes_1.default)(stockDate.map((e) => e.symbol));
                fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve(sparckData) }));
                const res = yield (0, getStockHistoricalPrice_1.default)(stockDate);
                (0, chai_1.expect)(res).to.have.lengthOf(10);
                res === null || res === void 0 ? void 0 : res.forEach((e, i) => {
                    (0, chai_1.expect)(e.symbol).to.equal(`S${i + 1}`);
                    (0, chai_1.expect)(e.date).to.equal(targetDate);
                    (0, chai_1.expect)(sparckData[e.symbol].close).to.include(e.price);
                });
            });
        });
    });
    describe("call with all data in the cache", function () {
        const fakeRedisGet = (data) => (key) => {
            const symbol = key.split("=")[1];
            return Promise.resolve(JSON.stringify(data[symbol]));
        };
        beforeEach(function () {
            fetchStub = sinon_1.default.stub(node_fetch, "default");
            chunksStub = sinon_1.default.stub(chunks, "default");
            redisGetStub = sinon_1.default.stub(redisConn_1.redisClientCache, "get");
            redisSetEXStub = sinon_1.default.stub(redisConn_1.redisClientCache, "setEx");
        });
        afterEach(function () {
            fetchStub.restore();
            chunksStub.restore();
            redisGetStub.restore();
            redisSetEXStub.restore();
        });
        it("redis get must be called with the correct arguments", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const stockDate = [{ symbol: "S1", date: Date.now() - subDay }];
                const stocksData = (0, sparkRes_1.default)(stockDate.map((e) => e.symbol));
                redisGetStub.callsFake(fakeRedisGet(stocksData));
                yield (0, getStockHistoricalPrice_1.default)(stockDate);
                (0, chai_1.expect)(redisGetStub).to.have.been.calledWith("stockHistory=S1");
            });
        });
        it("fetch and setEx must not be called", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const targetDate = Date.now() - subDay;
                const stockDate = [
                    { symbol: "S1", date: targetDate },
                    { symbol: "S2", date: targetDate },
                    { symbol: "S3", date: targetDate },
                    { symbol: "S4", date: targetDate },
                    { symbol: "S5", date: targetDate },
                    { symbol: "S6", date: targetDate },
                    { symbol: "S7", date: targetDate },
                    { symbol: "S8", date: targetDate },
                    { symbol: "S9", date: targetDate },
                    { symbol: "S10", date: targetDate }
                ];
                const stocksData = (0, sparkRes_1.default)(stockDate.map((e) => e.symbol));
                redisGetStub.callsFake(fakeRedisGet(stocksData));
                yield (0, getStockHistoricalPrice_1.default)(stockDate);
                (0, chai_1.expect)(fetchStub).to.have.been.callCount(0);
                (0, chai_1.expect)(redisSetEXStub).to.have.been.callCount(0);
            });
        });
        it("function must return the correct data", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const targetDate = Date.now() - subDay;
                const stockDate = [
                    { symbol: "S1", date: targetDate },
                    { symbol: "S2", date: targetDate },
                    { symbol: "S3", date: targetDate },
                    { symbol: "S4", date: targetDate },
                    { symbol: "S5", date: targetDate },
                    { symbol: "S6", date: targetDate },
                    { symbol: "S7", date: targetDate },
                    { symbol: "S8", date: targetDate },
                    { symbol: "S9", date: targetDate },
                    { symbol: "S10", date: targetDate }
                ];
                const stocksData = (0, sparkRes_1.default)(stockDate.map((e) => e.symbol));
                redisGetStub.callsFake(fakeRedisGet(stocksData));
                const res = yield (0, getStockHistoricalPrice_1.default)(stockDate);
                (0, chai_1.expect)(res).to.have.lengthOf(10);
                res === null || res === void 0 ? void 0 : res.forEach((e, i) => {
                    const symbol = `S${i + 1}`;
                    (0, chai_1.expect)(e.symbol).to.equal(symbol);
                    (0, chai_1.expect)(e.date).to.equal(targetDate);
                    (0, chai_1.expect)(stocksData[symbol].close).to.include(e.price);
                });
            });
        });
    });
    describe("call with some data in the cache", function () {
        const fakeRedisGet = (data) => (key) => {
            const symbol = key.split("=")[1];
            if (!data[symbol])
                return null;
            return Promise.resolve(JSON.stringify(data[symbol]));
        };
        beforeEach(function () {
            fetchStub = sinon_1.default.stub(node_fetch, "default");
            chunksStub = sinon_1.default.stub(chunks, "default");
            redisGetStub = sinon_1.default.stub(redisConn_1.redisClientCache, "get");
            redisSetEXStub = sinon_1.default.stub(redisConn_1.redisClientCache, "setEx");
        });
        afterEach(function () {
            fetchStub.restore();
            chunksStub.restore();
            redisGetStub.restore();
            redisSetEXStub.restore();
        });
        it("fetch and setEx must be called with the correct arguments", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const targetDate = Date.now() - subDay;
                const stockDate = [
                    { symbol: "S1", date: targetDate },
                    { symbol: "S2", date: targetDate },
                    { symbol: "S3", date: targetDate },
                    { symbol: "S4", date: targetDate },
                    { symbol: "S5", date: targetDate },
                    { symbol: "S6", date: targetDate },
                    { symbol: "S7", date: targetDate },
                    { symbol: "S8", date: targetDate },
                    { symbol: "S9", date: targetDate },
                    { symbol: "S10", date: targetDate }
                ];
                const apiSym = ["S1", "S2", "S3", "S4", "S5"];
                const cacheSym = ["S6", "S7", "S8", "S9", "S10"];
                const apiData = (0, sparkRes_1.default)(apiSym);
                const cacheData = (0, sparkRes_1.default)(cacheSym);
                redisGetStub.callsFake(fakeRedisGet(cacheData));
                chunksStub.callsFake(() => [apiSym]);
                fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve(apiData) }));
                yield (0, getStockHistoricalPrice_1.default)(stockDate);
                (0, chai_1.expect)(fetchStub).to.have.been.calledWith(`https://yfapi.net/v8/finance/spark?interval=1d&range=5y&symbols=S1,S2,S3,S4,S5`, {
                    method: "GET",
                    headers: {
                        "x-api-key": process.env.YF_API_KEY || "",
                        "Content-Type": "application/json"
                    }
                });
                apiSym.forEach((e) => {
                    (0, chai_1.expect)(redisSetEXStub).to.have.been.calledWith(`stockHistory=${e}`, 60 * 12, JSON.stringify(apiData[e]));
                });
            });
        });
        it("fetch and setEx must be called the correct number of times", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const targetDate = Date.now() - subDay;
                const stockDate = [
                    { symbol: "S1", date: targetDate },
                    { symbol: "S2", date: targetDate },
                    { symbol: "S3", date: targetDate },
                    { symbol: "S4", date: targetDate },
                    { symbol: "S5", date: targetDate },
                    { symbol: "S6", date: targetDate },
                    { symbol: "S7", date: targetDate },
                    { symbol: "S8", date: targetDate },
                    { symbol: "S9", date: targetDate },
                    { symbol: "S10", date: targetDate }
                ];
                const apiSym = ["S1", "S2", "S3", "S4", "S5"];
                const cacheSym = ["S6", "S7", "S8", "S9", "S10"];
                const apiData = (0, sparkRes_1.default)(apiSym);
                const cacheData = (0, sparkRes_1.default)(cacheSym);
                redisGetStub.callsFake(fakeRedisGet(cacheData));
                chunksStub.callsFake(() => [apiSym]);
                fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve(apiData) }));
                yield (0, getStockHistoricalPrice_1.default)(stockDate);
                (0, chai_1.expect)(fetchStub).to.have.been.calledOnce;
                (0, chai_1.expect)(redisSetEXStub).to.have.been.callCount(5);
            });
        });
        it("function must return the correct data", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const targetDate = Date.now() - subDay;
                const stockDate = [
                    { symbol: "S1", date: targetDate },
                    { symbol: "S2", date: targetDate },
                    { symbol: "S3", date: targetDate },
                    { symbol: "S4", date: targetDate },
                    { symbol: "S5", date: targetDate },
                    { symbol: "S6", date: targetDate },
                    { symbol: "S7", date: targetDate },
                    { symbol: "S8", date: targetDate },
                    { symbol: "S9", date: targetDate },
                    { symbol: "S10", date: targetDate }
                ];
                const apiSym = ["S1", "S2", "S3", "S4", "S5"];
                const cacheSym = ["S6", "S7", "S8", "S9", "S10"];
                const apiData = (0, sparkRes_1.default)(apiSym);
                const cacheData = (0, sparkRes_1.default)(cacheSym);
                redisGetStub.callsFake(fakeRedisGet(cacheData));
                chunksStub.callsFake(() => [apiSym]);
                fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve(apiData) }));
                const res = yield (0, getStockHistoricalPrice_1.default)(stockDate);
                (0, chai_1.expect)(res).to.have.lengthOf(10);
                res === null || res === void 0 ? void 0 : res.forEach((e, i) => {
                    const symbol = `S${i + 1}`;
                    (0, chai_1.expect)(e.symbol).to.equal(symbol);
                    (0, chai_1.expect)(e.date).to.equal(targetDate);
                    if (apiSym.includes(e.symbol)) {
                        (0, chai_1.expect)(apiData[symbol].close).to.include(e.price);
                    }
                    else {
                        (0, chai_1.expect)(cacheData[symbol].close).to.include(e.price);
                    }
                });
            });
        });
        it("if the search date is a non-working day, it returns the result of the previous working day", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const targetDate = Date.now() - subDay;
                function getNonWorkingDate(td) {
                    const date = new Date(td);
                    const day = date.getDay();
                    if (day === 6 || day === 0)
                        return td;
                    return getNonWorkingDate(td - 1000 * 60 * 60 * 24);
                }
                const nonWorkingDate = getNonWorkingDate(targetDate);
                const stockDate = [
                    { symbol: "S1", date: nonWorkingDate },
                    { symbol: "S2", date: targetDate },
                    { symbol: "S3", date: targetDate },
                    { symbol: "S4", date: targetDate },
                    { symbol: "S5", date: targetDate },
                    { symbol: "S6", date: targetDate },
                    { symbol: "S7", date: targetDate },
                    { symbol: "S8", date: targetDate },
                    { symbol: "S9", date: targetDate },
                    { symbol: "S10", date: targetDate }
                ];
                const apiSym = ["S1", "S2", "S3", "S4", "S5"];
                const cacheSym = ["S6", "S7", "S8", "S9", "S10"];
                const apiData = (0, sparkRes_1.default)(apiSym);
                const cacheData = (0, sparkRes_1.default)(cacheSym);
                redisGetStub.callsFake(fakeRedisGet(cacheData));
                chunksStub.callsFake(() => [apiSym]);
                fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve(apiData) }));
                const res = yield (0, getStockHistoricalPrice_1.default)(stockDate);
                const dates = apiData["S1"].timestamp;
                const close = apiData["S1"].close;
                const index = close.indexOf(res[0].price);
                const prevWd = dates[index];
                const nextWd = dates[index + 1];
                (0, chai_1.expect)(nonWorkingDate > prevWd * 1000).to.be.true;
                (0, chai_1.expect)(nonWorkingDate < nextWd * 1000).to.be.true;
            });
        });
    });
});
