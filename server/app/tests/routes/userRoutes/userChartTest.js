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
const sparkRes_1 = __importDefault(require("../../mocks/sparkRes"));
const db_1 = __importDefault(require("../../../db/db"));
const UCTH = __importStar(require("../../../functions/updateOrCreateToDayHistory"));
const User_1 = __importDefault(require("../../../models/User"));
chai_1.default.use(chai_http_1.default);
chai_1.default.use(sinon_chai_1.default);
const apiResSpark = (0, sparkRes_1.default)(["IBM", "AAPL", "GOOG"], false);
const expectResWithNoDates = {
    "1": {
        portfolioValue: 1000000,
        liquid: 999000,
        transactions: [{ price: 100, quantity: 10, buy: true, symbol: "IBM" }]
    },
    "2": { portfolioValue: 1000900, liquid: 999000, transactions: [] },
    "3": {
        portfolioValue: 1000000,
        liquid: 996000,
        transactions: [{ price: 200, quantity: 15, buy: true, symbol: "AAPL" }]
    },
    "4": { portfolioValue: 1000750, liquid: 996000, transactions: [] },
    "5": {
        portfolioValue: 1000000,
        liquid: 997000,
        transactions: [{ price: 200, quantity: 5, buy: false, symbol: "AAPL" }]
    },
    "6": {
        portfolioValue: 1000000,
        liquid: 994000,
        transactions: [{ price: 150, quantity: 20, buy: true, symbol: "GOOG" }]
    },
    "7": { portfolioValue: 1001600, liquid: 994000, transactions: [] },
    "8": { portfolioValue: 1003000, liquid: 994000, transactions: [] }
};
describe("/user/userChart route", function () {
    let fetchStub, expectRes, dates;
    after(function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield redisConn_1.redisClientCache.DEL([
                "stockHistory=IBM",
                "stockHistory=AAPL",
                "stockHistory=GOOG",
                "stockValue=IBM",
                "stockValue=AAPL",
                "stockValue=GOOG"
            ]);
            yield db_1.default.promise().execute(`
        DELETE FROM History WHERE history_id > 4
        `);
        });
    });
    describe("request unauth", function () {
        let res;
        before(function (done) {
            fetchStub = sinon_1.default.stub(node_fetch, "default");
            chai_1.default
                .request(index_1.default)
                .get("/api/user/userChart")
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
        describe("request with not to day history point and with no data in cache", function () {
            let res;
            before(function (done) {
                fetchStub = sinon_1.default.stub(node_fetch, "default");
                fetchStub
                    .onFirstCall()
                    .returns(Promise.resolve({ json: () => Promise.resolve(quoteRes_1.QUOTE_RES_STATIC) }));
                fetchStub
                    .onSecondCall()
                    .returns(Promise.resolve({ json: () => Promise.resolve(apiResSpark) }));
                const agent = chai_1.default.request.agent(index_1.default);
                agent
                    .post("/api/user/login")
                    .set("Content-Type", "application/json")
                    .send({
                    email: "testUser@test.com",
                    password: "test"
                })
                    .end(function () {
                    agent.get("/api/user/userChart").end(function (e, r) {
                        res = r;
                        agent.close();
                        done();
                    });
                });
            });
            after(function () {
                fetchStub.restore();
            });
            it("missing history points have been added to the database.", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const [dbData] = yield db_1.default.promise().execute(`
                        SELECT history_date FROM History WHERE user_id=1
                        `);
                    const sortData = dbData.sort((a, b) => a.history_date.getTime() - b.history_date.getTime());
                    dates = sortData.map((e) => e.history_date.getTime());
                    const oneDay = 1000 * 60 * 60 * 24;
                    for (let i = 1; i < dates.length - 1; i++) {
                        (0, chai_1.expect)(dates[i + 1] - dates[i]).to.be.equal(oneDay);
                    }
                });
            });
            it("historical price have been fetched from yfApi", function () {
                (0, chai_1.expect)(fetchStub).to.have.been.calledTwice;
            });
            it("status must be 200", function () {
                (0, chai_1.expect)(res).to.have.status(200);
            });
            it("correct data has been returned", function () {
                expectRes = {};
                Object.keys(expectResWithNoDates).forEach((key, i) => {
                    expectRes[dates[i]] = expectResWithNoDates[key];
                });
                (0, chai_1.expect)(res.body).to.be.eql(expectRes);
            });
        });
        describe("request with to day history point, all history point completed and data in the cache", function () {
            let res, updateOrCreateToDayHistorySpy, addHistorySpy;
            before(function (done) {
                fetchStub = sinon_1.default.stub(node_fetch, "default");
                updateOrCreateToDayHistorySpy = sinon_1.default.spy(UCTH, "default");
                addHistorySpy = sinon_1.default.spy(User_1.default, "addHistory");
                const agent = chai_1.default.request.agent(index_1.default);
                agent
                    .post("/api/user/login")
                    .set("Content-Type", "application/json")
                    .send({
                    email: "testUser@test.com",
                    password: "test"
                })
                    .end(function () {
                    agent.get("/api/user/userChart").end(function (e, r) {
                        res = r;
                        agent.close();
                        done();
                    });
                });
            });
            after(function () {
                fetchStub.restore();
                updateOrCreateToDayHistorySpy.restore();
                addHistorySpy.restore();
            });
            it("to day history must be updated", function () {
                (0, chai_1.expect)(updateOrCreateToDayHistorySpy).to.have.been.called;
            });
            it("historical price have been fetched from redis", function () {
                (0, chai_1.expect)(fetchStub).to.have.not.been.called;
            });
            it("new history points haven't been addedd", function () {
                (0, chai_1.expect)(addHistorySpy).to.have.not.been.called;
            });
            it("status must be 200", function () {
                (0, chai_1.expect)(res).to.have.status(200);
            });
            it("correct data has been returned", function () {
                (0, chai_1.expect)(res.body).to.be.eql(expectRes);
            });
        });
    });
});
