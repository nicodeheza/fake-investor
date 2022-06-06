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
const quoteRes_1 = require("../../mocks/quoteRes");
const redisConn_1 = require("../../../redis/redisConn");
const node_fetch = __importStar(require("node-fetch"));
chai_1.default.use(chai_http_1.default);
chai_1.default.use(sinon_chai_1.default);
const apiRes = quoteRes_1.QUOTE_RES_STATIC;
const expectedRes = [
    {
        fullName: "Fake Us Dolar",
        symbol: "FUD",
        price: 1,
        change: "",
        quaNum: 994000,
        quaMon: 994000
    },
    {
        fullName: "International Business Machines Corporation",
        symbol: "IBM",
        price: 100,
        change: 1,
        quaNum: 10,
        quaMon: 1000
    },
    {
        fullName: "Apple Inc.",
        symbol: "AAPL",
        price: 200,
        change: 2,
        quaNum: 10,
        quaMon: 2000
    },
    {
        fullName: "Alphabet Inc.",
        symbol: "GOOG",
        price: 300,
        change: 3,
        quaNum: 20,
        quaMon: 6000
    }
];
describe("/user/userStock route", function () {
    let fetchStub;
    after(function () {
        (function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield redisConn_1.redisClientCache.DEL([
                    "stockValue=IBM",
                    "stockValue=AAPL",
                    "stockValue=GOOG"
                ]);
            });
        })();
    });
    describe("request unauth", function () {
        let res;
        before(function (done) {
            fetchStub = sinon_1.default.stub(node_fetch, "default");
            fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve(apiRes) }));
            chai_1.default
                .request(index_1.default)
                .get("/api/user/stocks")
                .end(function (e, r) {
                res = r;
                done();
            });
        });
        after(function () {
            fetchStub.restore();
        });
        it("status must be 401", function () {
            (0, chai_1.expect)(res).to.have.status(401);
        });
        it("must return empty user name", function () {
            (0, chai_1.expect)(res.body.userName).to.be.equal("");
        });
    });
    describe("request authenticated", function () {
        describe("get stock data must first fetch from yfApi", function () {
            let res;
            before(function (done) {
                fetchStub = sinon_1.default.stub(node_fetch, "default");
                fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve(apiRes) }));
                const agent = chai_1.default.request.agent(index_1.default);
                agent
                    .post("/api/user/login")
                    .set("Content-Type", "application/json")
                    .send({
                    email: "testUser@test.com",
                    password: "test"
                })
                    .end(function () {
                    agent.get("/api/user/stocks").end(function (e, r) {
                        res = r;
                        agent.close();
                        done();
                    });
                });
            });
            after(function () {
                fetchStub.restore();
            });
            it("api must be called", function () {
                (0, chai_1.expect)(fetchStub).to.have.been.called;
            });
            it("status must be 200", function () {
                (0, chai_1.expect)(res).to.have.status(200);
            });
            it("must return correct data", function () {
                (0, chai_1.expect)(res.body).to.be.eql(expectedRes);
            });
        });
    });
    describe("get stock data must fetch from redis", function () {
        let res;
        before(function (done) {
            fetchStub = sinon_1.default.stub(node_fetch, "default");
            fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve(apiRes) }));
            const agent = chai_1.default.request.agent(index_1.default);
            agent
                .post("/api/user/login")
                .set("Content-Type", "application/json")
                .send({
                email: "testUser@test.com",
                password: "test"
            })
                .end(function () {
                agent.get("/api/user/stocks").end(function (e, r) {
                    res = r;
                    agent.close();
                    done();
                });
            });
        });
        after(function () {
            fetchStub.restore();
        });
        it("fetch must not been called", function () {
            (0, chai_1.expect)(fetchStub).to.have.not.been.called;
        });
        it("status must be 200", function () {
            (0, chai_1.expect)(res).have.status(200);
        });
        it("must return correct data", function () {
            (0, chai_1.expect)(res.body).to.be.eql(expectedRes);
        });
    });
});
