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
const sinon_1 = __importDefault(require("sinon"));
const index_1 = __importDefault(require("../../../index"));
const node_fetch = __importStar(require("node-fetch"));
const db_1 = __importDefault(require("../../../db/db"));
chai_1.default.use(chai_http_1.default);
const reqBody = {
    amount: 5,
    symbol: "TS",
    name: "test stock",
    price: 100
};
describe("/stock/buy route", function () {
    let fetchStub;
    before(function () {
        fetchStub = sinon_1.default.stub(node_fetch, "default");
        fetchStub.callsFake(() => Promise.resolve({
            json: () => Promise.resolve({
                quoteResponse: {
                    error: null,
                    result: [
                        {
                            symbol: "IBM",
                            regularMarketPrice: 100,
                            regularMarketChangePercent: 1
                        },
                        {
                            symbol: "AAPL",
                            regularMarketPrice: 200,
                            regularMarketChangePercent: 2
                        },
                        {
                            symbol: "GOOG",
                            regularMarketPrice: 300,
                            regularMarketChangePercent: 3
                        },
                        {
                            symbol: reqBody.symbol,
                            regularMarketPrice: reqBody.price,
                            regularMarketChangePercent: 1
                        }
                    ]
                }
            })
        }));
    });
    after(function () {
        return __awaiter(this, void 0, void 0, function* () {
            fetchStub.restore();
            yield Promise.all([
                db_1.default.promise().execute(`
		    DELETE FROM Stocks WHERE symbol='TS'
		    `),
                db_1.default.promise().execute(`
		    DELETE FROM Ownerships WHERE stock_id > 4
		    `),
                db_1.default.promise().execute(`
		    UPDATE Ownerships SET quantity=994000 WHERE stock_id=1 AND user_id=1
		    `),
                db_1.default.promise().execute(`
		    DELETE FROM History WHERE history_id > 4
		    `),
                db_1.default.promise().execute(`
		    DELETE FROM Transactions WHERE stock_id > 4
		    `)
            ]);
        });
    });
    describe("request unauth", function () {
        let res;
        before(function (done) {
            chai_1.default
                .request(index_1.default)
                .post("/api/stock/buy")
                .set("Content-Type", "application/json")
                .send(reqBody)
                .end((e, r) => {
                res = r;
                done();
            });
        });
        it("status must be 401", function () {
            (0, chai_1.expect)(res).to.have.status(401);
        });
        it("empty user must be returned", function () {
            (0, chai_1.expect)(res.body.userName).to.be.equal("");
        });
    });
    describe("request auth", function () {
        let stockId, liquid, historyId;
        describe("buy a stock that is not in the database and user still don't have", function () {
            let res;
            before(function (done) {
                const agent = chai_1.default.request.agent(index_1.default);
                agent
                    .post("/api/user/login")
                    .set("Content-Type", "application/json")
                    .send({
                    email: "testUser@test.com",
                    password: "test"
                })
                    .end(function () {
                    agent
                        .post("/api/stock/buy")
                        .set("Content-Type", "application/json")
                        .send(reqBody)
                        .end((e, r) => {
                        res = r;
                        done();
                    });
                });
            });
            it("stock must be added successfully", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const [dbData] = yield db_1.default.promise().query(`
			    SELECT symbol, stock_id FROM Stocks WHERE symbol=?
			    `, [reqBody.symbol]);
                    stockId = dbData[0].stock_id;
                    (0, chai_1.expect)(dbData[0].symbol).to.be.equal("TS");
                });
            });
            it("ownership must be added successfully", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const [dbData] = yield db_1.default.promise().query(`
			    SELECT quantity FROM Ownerships WHERE stock_id=? AND user_id=1
			    `, [stockId]);
                    (0, chai_1.expect)(parseFloat(dbData[0].quantity)).to.equal(reqBody.amount);
                });
            });
            it("the correct amount of ufd must be subtracted", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const [dbData] = yield db_1.default.promise().execute(`
			    SELECT quantity FROM Ownerships WHERE stock_id=1 AND user_id=1
			    `);
                    const quantity = parseFloat(dbData[0].quantity);
                    liquid = 994000 - reqBody.amount * reqBody.price;
                    (0, chai_1.expect)(quantity).to.be.equal(liquid);
                });
            });
            it("history must be created", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const [dbData] = yield db_1.default.promise().execute(`
				SELECT * FROM History WHERE history_date=CURRENT_DATE
				`);
                    const history = dbData[0];
                    historyId = history.history_id;
                    (0, chai_1.expect)(parseFloat(history.portfolio_value)).to.be.equal(1003000);
                    (0, chai_1.expect)(parseFloat(history.liquid)).to.be.equal(liquid);
                });
            });
            it("transaction must be added", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const [dbData] = yield db_1.default.promise().query(`
				SELECT * FROM Transactions WHERE history_id=? AND stock_id=?
				`, [historyId, stockId]);
                    const transaction = dbData[0];
                    (0, chai_1.expect)(transaction.buy).to.be.equal(1);
                    (0, chai_1.expect)(parseFloat(transaction.price)).to.be.equal(reqBody.price);
                    (0, chai_1.expect)(transaction.quantity).to.be.equal(reqBody.amount);
                });
            });
            it("status must be 200", function () {
                (0, chai_1.expect)(res).to.have.status(200);
            });
            it("message must be 'ok'", function () {
                (0, chai_1.expect)(res.body.message).to.be.equal("ok");
            });
        });
        describe("buy a stock that is in the database and user already have", function () {
            let res;
            before(function (done) {
                const agent = chai_1.default.request.agent(index_1.default);
                agent
                    .post("/api/user/login")
                    .set("Content-Type", "application/json")
                    .send({
                    email: "testUser@test.com",
                    password: "test"
                })
                    .end(function () {
                    agent
                        .post("/api/stock/buy")
                        .set("Content-Type", "application/json")
                        .send(reqBody)
                        .end((e, r) => {
                        res = r;
                        done();
                    });
                });
            });
            it("stock holding must be updated", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const [dbData] = yield db_1.default.promise().query(`
			    SELECT quantity FROM Ownerships WHERE stock_id=? AND user_id=1
			    `, [stockId]);
                    (0, chai_1.expect)(parseFloat(dbData[0].quantity)).to.equal(reqBody.amount * 2);
                });
            });
            it("the correct amount of ufd must be subtracted", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const [dbData] = yield db_1.default.promise().execute(`
			    SELECT quantity FROM Ownerships WHERE stock_id=1 AND user_id=1
			    `);
                    const quantity = parseFloat(dbData[0].quantity);
                    liquid = liquid - reqBody.amount * reqBody.price;
                    (0, chai_1.expect)(quantity).to.be.equal(liquid);
                });
            });
            it("history must be updated", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const [dbData] = yield db_1.default.promise().execute(`
				SELECT * FROM History WHERE history_date=CURRENT_DATE
				`);
                    const history = dbData[0];
                    historyId = history.history_id;
                    (0, chai_1.expect)(parseFloat(history.portfolio_value)).to.be.equal(1003000);
                    (0, chai_1.expect)(parseFloat(history.liquid)).to.be.equal(liquid);
                });
            });
            it("transaction must be added", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const [dbData] = yield db_1.default.promise().query(`
				SELECT * FROM Transactions WHERE history_id=? AND stock_id=?
				`, [historyId, stockId]);
                    const transactions = dbData;
                    (0, chai_1.expect)(transactions.length).to.be.equal(2);
                    transactions.forEach((transaction) => {
                        (0, chai_1.expect)(transaction.buy).to.be.equal(1);
                        (0, chai_1.expect)(parseFloat(transaction.price)).to.be.equal(reqBody.price);
                        (0, chai_1.expect)(transaction.quantity).to.be.equal(reqBody.amount);
                    });
                });
            });
            it("status must be 200", function () {
                (0, chai_1.expect)(res).to.have.status(200);
            });
            it("message must be 'ok'", function () {
                (0, chai_1.expect)(res.body.message).to.be.equal("ok");
            });
        });
    });
});
