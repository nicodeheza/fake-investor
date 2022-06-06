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
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const db_1 = __importDefault(require("../../../db/db"));
chai_1.default.use(chai_http_1.default);
chai_1.default.use(sinon_chai_1.default);
describe("/user/reset route", function () {
    let initialHistoryState, initialOwnershipState, transactionsInitialState;
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            const [historyDbData] = yield db_1.default.promise().execute(`
        SELECT * FROM History WHERE user_id=1
        `);
            initialHistoryState = historyDbData;
            const [ownershipDbDate] = yield db_1.default.promise().execute(`
        SELECT * FROM Ownerships WHERE user_id=1
        `);
            initialOwnershipState = ownershipDbDate;
            const [transactionsDbDate] = yield db_1.default.promise().execute(`
        SELECT * FROM Transactions
        `);
            transactionsInitialState = transactionsDbDate;
        });
    });
    after(function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.default.promise().execute(`
		DELETE FROM History WHERE user_id=1
		`);
            yield db_1.default.promise().execute(`
        DELETE FROM Ownerships WHERE user_id=1
        `);
            yield db_1.default.promise().execute(`
        DELETE FROM Transactions
        `);
            yield Promise.all(initialOwnershipState.map((ele) => {
                return db_1.default.promise().query(`
            INSERT INTO Ownerships (user_id, stock_id, quantity) VALUES (?,?,?)
            `, [ele.user_id, ele.stock_id, ele.quantity]);
            }));
            yield Promise.all(initialHistoryState.map((ele) => {
                return db_1.default.promise().query(`
		    INSERT INTO History (history_id, history_date, user_id, portfolio_value, liquid) VALUES (?,?,?,?,?)
		    `, [ele.history_id, ele.history_date, ele.user_id, ele.portfolio_value, ele.liquid]);
            }));
            yield Promise.all(transactionsInitialState.map((ele) => {
                return db_1.default.promise().query(`
		    INSERT INTO Transactions (transaction_id, history_id, stock_id, buy, price, quantity) VALUES (?,?,?,?,?,?)
		    `, [
                    ele.transaction_id,
                    ele.history_id,
                    ele.stock_id,
                    ele.buy,
                    ele.price,
                    ele.quantity
                ]);
            }));
        });
    });
    describe("request unauth", function () {
        let res;
        before(function (done) {
            chai_1.default
                .request(index_1.default)
                .delete("/api/user/reset")
                .end(function (e, r) {
                res = r;
                done();
            });
        });
        it("status must be 401", function () {
            (0, chai_1.expect)(res).to.have.status(401);
        });
        it("must return empty user name", function () {
            (0, chai_1.expect)(res.body.userName).to.be.equal("");
        });
    });
    describe("request auth", function () {
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
                agent.delete("/api/user/reset").end(function (e, r) {
                    res = r;
                    agent.close();
                    done();
                });
            });
        });
        it("user history has been deleted", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [dbData] = yield db_1.default.promise().execute(`
            SELECT * FROM History WHERE user_id=1
            `);
                (0, chai_1.expect)(dbData).to.be.eql([]);
            });
        });
        it("user must have 1000000 ufd", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [dbData] = yield db_1.default.promise().execute(`
            SELECT quantity FROM Ownerships WHERE user_id=1 AND stock_id=1
            `);
                (0, chai_1.expect)(parseInt(dbData[0].quantity)).to.be.equal(1000000);
            });
        });
        it("status must be 200", function () {
            (0, chai_1.expect)(res).to.have.status(200);
        });
        it("SUCCESS must be returned", function () {
            (0, chai_1.expect)(res.body.message).to.be.equal("SUCCESS");
        });
    });
});
