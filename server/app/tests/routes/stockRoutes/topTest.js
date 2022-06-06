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
const chai_http_1 = __importDefault(require("chai-http"));
const index_1 = __importDefault(require("../../../index"));
const sinon_1 = __importDefault(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const redisConn_1 = require("../../../redis/redisConn");
const node_fetch = __importStar(require("node-fetch"));
const quoteRes_1 = require("../../mocks/quoteRes");
const db_1 = __importDefault(require("../../../db/db"));
chai_1.default.use(chai_http_1.default);
chai_1.default.use(sinon_chai_1.default);
const expectRes = {
    "1": {
        name: "Alphabet Inc.(GOOG)",
        symbol: "GOOG",
        price: 300,
        variation: 1
    },
    "2": {
        name: "Apple Inc.(AAPL)",
        symbol: "AAPL",
        price: 200,
        variation: 1
    },
    "3": {
        name: "International Business Machines Corporation(IBM)",
        symbol: "IBM",
        price: 100,
        variation: 1
    },
    "4": { name: "test stock 8(S8)", symbol: "S8", price: 100, variation: 1 },
    "5": { name: "test stock 7(S7)", symbol: "S7", price: 100, variation: 1 },
    "6": { name: "test stock 6(S6)", symbol: "S6", price: 100, variation: 1 },
    "7": { name: "test stock 5(S5)", symbol: "S5", price: 100, variation: 1 },
    "8": { name: "test stock 4(S4)", symbol: "S4", price: 100, variation: 1 },
    "9": { name: "test stock 3(S3)", symbol: "S3", price: 100, variation: 1 },
    "10": { name: "test stock 2(S2)", symbol: "S2", price: 100, variation: 1 }
};
describe("/stock/top route", function () {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            const newStocksIds = [];
            yield Promise.all(new Array(10).fill(true).map((e, i) => __awaiter(this, void 0, void 0, function* () {
                const newStock = yield db_1.default.promise().query(`
            INSERT INTO Stocks (stock_name, symbol) VALUES (?,?)
            `, [`test stock ${i}`, `S${i}`]);
                newStocksIds.push(newStock[0].insertId);
            })));
            yield Promise.all(newStocksIds.map((id, i) => {
                db_1.default.promise().query(`
            INSERT INTO Transactions (history_id, stock_id, buy, price, quantity) VALUES (1,?,1,100,?)
            `, [id, (i % 9) + 1]);
            }));
        });
    });
    after(function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(new Array(10).fill(true).map((e, i) => {
                db_1.default.promise().execute(`
		    DELETE FROM Stocks WHERE stock_id > 4
		    `);
            }));
            yield redisConn_1.redisClientCache.flushDb();
        });
    });
    describe("request with no cached data", function () {
        let res, fetchStub;
        before(function (done) {
            fetchStub = sinon_1.default.stub(node_fetch, "default");
            const fetchRes = {
                quoteResponse: {
                    error: null,
                    result: [...quoteRes_1.QUOTE_RES_STATIC.quoteResponse.result]
                }
            };
            for (let i = 0; i <= 10; i++) {
                fetchRes.quoteResponse.result.push({
                    symbol: `S${i}`,
                    regularMarketPrice: 100,
                    regularMarketChangePercent: 1
                });
            }
            fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve(fetchRes) }));
            chai_1.default
                .request(index_1.default)
                .get("/api/stock/top")
                .end((e, r) => {
                res = r;
                done();
            });
        });
        after(function () {
            fetchStub.restore();
        });
        it("Data has to be fetched from yfApi", function () {
            (0, chai_1.expect)(fetchStub).to.have.been.called;
        });
        it("status must be 200", function () {
            (0, chai_1.expect)(res).to.have.status(200);
        });
        it("correct data must be returned", function () {
            (0, chai_1.expect)(res.body).to.be.eql(expectRes);
        });
    });
    describe("request with cached data", function () {
        let res, fetchStub;
        before(function (done) {
            fetchStub = sinon_1.default.stub(node_fetch, "default");
            chai_1.default
                .request(index_1.default)
                .get("/api/stock/top")
                .end((e, r) => {
                res = r;
                done();
            });
        });
        after(function () {
            fetchStub.restore();
        });
        it("Data has to be fetched from redis cache", function () {
            (0, chai_1.expect)(fetchStub).to.have.not.been.called;
        });
        it("status must be 200", function () {
            (0, chai_1.expect)(res).to.have.status(200);
        });
        it("correct data must be returned", function () {
            (0, chai_1.expect)(res.body).to.be.eql(expectRes);
        });
    });
});
