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
const getStocksData_1 = __importDefault(require("../../functions/getStocksData"));
const quoteRes_1 = __importDefault(require("../mocks/quoteRes"));
chai_1.default.use(sinon_chai_1.default);
describe("GetStocksData", function () {
    describe("get stocks with no data in the cache", function () {
        let fetchStub, redisGetStub, redisSetExStub, chunckStub;
        beforeEach(function () {
            fetchStub = sinon_1.default.stub(node_fetch, "default");
            redisGetStub = sinon_1.default.stub(redisConn_1.redisClientCache, "get");
            redisSetExStub = sinon_1.default.stub(redisConn_1.redisClientCache, "setEx");
            chunckStub = sinon_1.default.stub(chunks, "default");
        });
        afterEach(function () {
            fetchStub.restore();
            redisGetStub.restore();
            redisSetExStub.restore();
            chunckStub.restore();
        });
        it("fetch must be called once every 10 symbols", function () {
            return __awaiter(this, void 0, void 0, function* () {
                redisGetStub.callsFake(() => Promise.resolve(null));
                chunckStub.callsFake(() => [
                    ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"],
                    ["S11", "S12"]
                ]);
                const symbols = [
                    "S1",
                    "S2",
                    "S3",
                    "S4",
                    "S5",
                    "S6",
                    "S7",
                    "S8",
                    "S9",
                    "S10",
                    "S11",
                    "S12"
                ];
                const apiRes = (0, quoteRes_1.default)(symbols);
                fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve(apiRes) }));
                yield (0, getStocksData_1.default)(symbols);
                (0, chai_1.expect)(fetchStub).to.have.been.calledTwice;
            });
        });
        it("fetch must be called with correct url and one time", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const symbols = ["S1", "S2", "S3"];
                redisGetStub.callsFake(() => Promise.resolve(null));
                chunckStub.callsFake(() => [
                    symbols.map((e) => {
                        return {
                            symbol: e
                        };
                    })
                ]);
                const apiRes = (0, quoteRes_1.default)(symbols);
                fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve(apiRes) }));
                yield (0, getStocksData_1.default)(symbols);
                (0, chai_1.expect)(fetchStub).to.have.been.calledOnceWith(`https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=S1,S2,S3,`, {
                    method: "GET",
                    headers: {
                        "x-api-key": process.env.YF_API_KEY || "",
                        "Content-Type": "application/json"
                    }
                });
            });
        });
        it("all data must be saved in redis", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const symbols = ["S1", "S2", "S3"];
                redisGetStub.callsFake(() => Promise.resolve(null));
                chunckStub.callsFake(() => [
                    symbols.map((e) => {
                        return {
                            symbol: e
                        };
                    })
                ]);
                const apiRes = (0, quoteRes_1.default)(symbols);
                fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve(apiRes) }));
                yield (0, getStocksData_1.default)(symbols);
                (0, chai_1.expect)(redisSetExStub).to.have.been.calledThrice;
            });
        });
        it("redis.setEx must be called with correct arguments", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const symbols = ["S1"];
                redisGetStub.callsFake(() => Promise.resolve(null));
                chunckStub.callsFake(() => [
                    symbols.map((e) => {
                        return {
                            symbol: e
                        };
                    })
                ]);
                const apiRes = (0, quoteRes_1.default)(symbols);
                fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve(apiRes) }));
                yield (0, getStocksData_1.default)(symbols);
                const obj = apiRes.quoteResponse.result[0];
                (0, chai_1.expect)(redisSetExStub).to.have.been.calledWith(`stockValue=${obj.symbol}`, 3600, JSON.stringify({
                    price: obj.regularMarketPrice,
                    change: obj.regularMarketChangePercent
                }));
            });
        });
        it("return correct data", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const symbols = ["S1", "S2", "S3"];
                redisGetStub.callsFake(() => Promise.resolve(null));
                chunckStub.callsFake(() => [
                    symbols.map((e) => {
                        return {
                            symbol: e
                        };
                    })
                ]);
                const apiRes = (0, quoteRes_1.default)(symbols);
                fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve(apiRes) }));
                const res = yield (0, getStocksData_1.default)(symbols);
                const mData = apiRes.quoteResponse.result;
                res.forEach((ele, i) => {
                    (0, chai_1.expect)(ele.symbol).to.equal(mData[i].symbol);
                    (0, chai_1.expect)(ele.price).to.equal(mData[i].regularMarketPrice);
                    (0, chai_1.expect)(ele.change).to.equal(mData[i].regularMarketChangePercent);
                });
            });
        });
    });
    describe("get stock width all data in cache", function () {
        let fetchStub, redisGetStub, redisSetExStub, chunckStub;
        const redisGetReturnData = (fdRes) => (key) => {
            const symbol = key.split("=")[1];
            const obj = fdRes.filter((e) => e.symbol === symbol)[0];
            return Promise.resolve(JSON.stringify({
                price: obj.regularMarketPrice,
                change: obj.regularMarketChangePercent
            }));
        };
        beforeEach(function () {
            fetchStub = sinon_1.default.stub(node_fetch, "default");
            redisGetStub = sinon_1.default.stub(redisConn_1.redisClientCache, "get");
            redisSetExStub = sinon_1.default.stub(redisConn_1.redisClientCache, "setEx");
            chunckStub = sinon_1.default.stub(chunks, "default");
        });
        afterEach(function () {
            fetchStub.restore();
            redisGetStub.restore();
            redisSetExStub.restore();
            chunckStub.restore();
        });
        it("redis get must be called the correct times", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const symbols = ["S1", "S2", "S3"];
                const fakeData = (0, quoteRes_1.default)(symbols);
                const fdRes = fakeData.quoteResponse.result;
                redisGetStub.callsFake(redisGetReturnData(fdRes));
                yield (0, getStocksData_1.default)(symbols);
                (0, chai_1.expect)(redisGetStub).to.have.been.calledThrice;
            });
        });
        it("redis get must be called with correct argument", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const symbols = ["S1"];
                const fakeData = (0, quoteRes_1.default)(symbols);
                const fdRes = fakeData.quoteResponse.result;
                redisGetStub.callsFake(redisGetReturnData(fdRes));
                yield (0, getStocksData_1.default)(symbols);
                (0, chai_1.expect)(redisGetStub).to.have.been.calledWith("stockValue=S1");
            });
        });
        it("fetch, sliceIntoChunks, redis.setEx should not be called", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const symbols = ["S1", "S2", "S3"];
                const fakeData = (0, quoteRes_1.default)(symbols);
                const fdRes = fakeData.quoteResponse.result;
                redisGetStub.callsFake(redisGetReturnData(fdRes));
                yield (0, getStocksData_1.default)(symbols);
                (0, chai_1.expect)(fetchStub).to.have.been.callCount(0);
                (0, chai_1.expect)(chunckStub).to.have.been.callCount(0);
                (0, chai_1.expect)(redisSetExStub).to.have.been.callCount(0);
            });
        });
        it("expect to return correct values", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const symbols = ["S1", "S2", "S3"];
                const fakeData = (0, quoteRes_1.default)(symbols);
                const fdRes = fakeData.quoteResponse.result;
                redisGetStub.callsFake(redisGetReturnData(fdRes));
                const res = yield (0, getStocksData_1.default)(symbols);
                res.forEach((ele, i) => {
                    (0, chai_1.expect)(ele.symbol).to.equal(fdRes[i].symbol);
                    (0, chai_1.expect)(ele.price).to.equal(fdRes[i].regularMarketPrice);
                    (0, chai_1.expect)(ele.change).to.equal(fdRes[i].regularMarketChangePercent);
                });
            });
        });
    });
    describe("get stock with partial data cached", function () {
        let fetchStub, redisGetStub, redisSetExStub, chunckStub;
        const redisGetReturnData = (fdRes) => (key) => {
            const symbol = key.split("=")[1];
            const obj = fdRes.filter((e) => e.symbol === symbol)[0];
            if (obj) {
                return Promise.resolve(JSON.stringify({
                    price: obj.regularMarketPrice,
                    change: obj.regularMarketChangePercent
                }));
            }
            else {
                return null;
            }
        };
        const fetchData = (fdRes) => () => Promise.resolve({
            json: () => Promise.resolve({
                quoteResponse: {
                    error: null,
                    result: fdRes
                }
            })
        });
        beforeEach(function () {
            fetchStub = sinon_1.default.stub(node_fetch, "default");
            redisGetStub = sinon_1.default.stub(redisConn_1.redisClientCache, "get");
            redisSetExStub = sinon_1.default.stub(redisConn_1.redisClientCache, "setEx");
            chunckStub = sinon_1.default.stub(chunks, "default");
        });
        afterEach(function () {
            fetchStub.restore();
            redisGetStub.restore();
            redisSetExStub.restore();
            chunckStub.restore();
        });
        it("fetch and redis.setEx must be called the correct amount of times", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const symbols = [
                    "S1",
                    "S2",
                    "S3",
                    "S4",
                    "S5",
                    "S6",
                    "S7",
                    "S8",
                    "S9",
                    "S10",
                    "S11",
                    "S12"
                ];
                const fakeData = (0, quoteRes_1.default)(symbols);
                const fdRes = fakeData.quoteResponse.result;
                redisGetStub.callsFake(redisGetReturnData(fdRes.slice(0, 6)));
                chunckStub.callsFake(() => [fdRes.slice(-6)]);
                fetchStub.callsFake(fetchData(fdRes.slice(-6)));
                yield (0, getStocksData_1.default)(symbols);
                (0, chai_1.expect)(redisSetExStub).to.have.been.callCount(6);
                (0, chai_1.expect)(fetchStub).to.have.been.calledOnce;
            });
        });
        it("fetch and redis.setEx must be called with correct arguments", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const symbols = [
                    "S1",
                    "S2",
                    "S3",
                    "S4",
                    "S5",
                    "S6",
                    "S7",
                    "S8",
                    "S9",
                    "S10",
                    "S11",
                    "S12"
                ];
                const fakeData = (0, quoteRes_1.default)(symbols);
                const fdRes = fakeData.quoteResponse.result;
                redisGetStub.callsFake(redisGetReturnData(fdRes.slice(0, 11)));
                const fetchD = fdRes.slice(-1);
                chunckStub.callsFake(() => [fetchD]);
                fetchStub.callsFake(fetchData(fetchD));
                yield (0, getStocksData_1.default)(symbols);
                (0, chai_1.expect)(redisSetExStub).to.have.been.calledWith(`stockValue=S12`, 3600, JSON.stringify({
                    price: fetchD[0].regularMarketPrice,
                    change: fetchD[0].regularMarketChangePercent
                }));
                (0, chai_1.expect)(fetchStub).to.have.been.calledWith(`https://yfapi.net/v6/finance/quote?region=US&lang=en&symbols=S12,`, {
                    method: "GET",
                    headers: {
                        "x-api-key": process.env.YF_API_KEY || "",
                        "Content-Type": "application/json"
                    }
                });
            });
        });
        it("must return correct data", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const symbols = [
                    "S1",
                    "S2",
                    "S3",
                    "S4",
                    "S5",
                    "S6",
                    "S7",
                    "S8",
                    "S9",
                    "S10",
                    "S11",
                    "S12"
                ];
                const fakeData = (0, quoteRes_1.default)(symbols);
                const fdRes = fakeData.quoteResponse.result;
                redisGetStub.callsFake(redisGetReturnData(fdRes.slice(0, 6)));
                chunckStub.callsFake(() => [fdRes.slice(-6)]);
                fetchStub.callsFake(fetchData(fdRes.slice(-6)));
                const res = yield (0, getStocksData_1.default)(symbols);
                res.forEach((ele, i) => {
                    (0, chai_1.expect)(ele.symbol).to.equal(fdRes[i].symbol);
                    (0, chai_1.expect)(ele.price).to.equal(fdRes[i].regularMarketPrice);
                    (0, chai_1.expect)(ele.change).to.equal(fdRes[i].regularMarketChangePercent);
                });
            });
        });
    });
});
