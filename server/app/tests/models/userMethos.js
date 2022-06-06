"use strict";
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
const chai_1 = require("chai");
const db_1 = __importDefault(require("../../db/db"));
const User_1 = __importDefault(require("../../models/User"));
const populateDb_1 = require("../populateDb");
const testConst_1 = __importDefault(require("../testConst"));
describe("User methods", function () {
    let fudId;
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            const [row] = yield db_1.default.promise().execute(`
		SELECT stock_id FROM Stocks WHERE symbol="FUD"
		`);
            fudId = row[0].stock_id;
        });
    });
    describe("FindUserByEmail", function () {
        it("FindUserByEmail(testUser@test.com) must return the test user", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const findUserRes = yield User_1.default.findUserByEmail("testUser@test.com");
                const findUser = findUserRes[0];
                (0, chai_1.expect)(findUser.user_id).to.equal(testConst_1.default.userId);
                (0, chai_1.expect)(findUser.email).to.equal("testUser@test.com");
                (0, chai_1.expect)(findUser.hash).to.be.a("string");
                (0, chai_1.expect)(findUser.salt).to.be.a("string");
                (0, chai_1.expect)(findUser.start_day).to.be.a("Date");
            });
        });
    });
    describe("SaveNewUser", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let newUser;
            before(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    newUser = yield User_1.default.saveNewUser("suitUser", "suitUser@test.com", "user_hash", "user_salt");
                });
            });
            after(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield db_1.default.promise().execute(`
                DELETE FROM Users WHERE email= "suitUser@test.com"
            `);
                });
            });
            it("User must be saved correctly in the db", function () {
                var _a, _b, _c;
                return __awaiter(this, void 0, void 0, function* () {
                    const [row] = yield db_1.default.promise().execute(`
                SELECT * FROM Users WHERE email= "suitUser@test.com"
            `);
                    const findUser = row[0];
                    (0, chai_1.expect)(findUser.user_id).to.be.a("number");
                    (0, chai_1.expect)(findUser.user_name).to.equal("suitUser");
                    (0, chai_1.expect)(findUser.email).to.equal("suitUser@test.com");
                    (0, chai_1.expect)(findUser.hash).to.equal("user_hash");
                    (0, chai_1.expect)(findUser.salt).to.equal("user_salt");
                    const toDate = new Date();
                    (0, chai_1.expect)((_a = findUser.start_day) === null || _a === void 0 ? void 0 : _a.getDate()).to.equal(toDate.getDate());
                    (0, chai_1.expect)((_b = findUser.start_day) === null || _b === void 0 ? void 0 : _b.getMonth()).to.equal(toDate.getMonth());
                    (0, chai_1.expect)((_c = findUser.start_day) === null || _c === void 0 ? void 0 : _c.getFullYear()).to.equal(toDate.getFullYear());
                });
            });
            it("Must return an array with 'success' and id", function () {
                (0, chai_1.expect)(newUser[0]).to.equal("success");
                (0, chai_1.expect)(newUser[1]).to.be.a("number");
                (0, chai_1.expect)(newUser[1] % 1).to.equal(0);
            });
        });
    });
    describe("FindById", function () {
        it("FindById(1) must return test user", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const findUserRes = yield User_1.default.findById(1);
                const findUser = findUserRes[0];
                (0, chai_1.expect)(findUser.user_id).to.equal(testConst_1.default.userId);
                (0, chai_1.expect)(findUser.email).to.equal("testUser@test.com");
                (0, chai_1.expect)(findUser.user_name).to.equal("testUser");
            });
        });
    });
    describe("AddStockOwnership", function () {
        let stockId;
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [row] = yield db_1.default.promise().execute(`
                INSERT INTO Stocks (stock_name, symbol)
                VALUES ("test-stock", "TS")
            `);
                stockId = row.insertId;
            });
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield db_1.default.promise().execute(`
                DELETE FROM Stocks WHERE symbol= "TS"
            `);
            });
        });
        it("Stock ownership must be saved correctly", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield User_1.default.addStockOwnership(1, stockId, 200);
                const [row] = yield db_1.default.promise().query(`
                SELECT * FROM Ownerships WHERE user_id= ? AND stock_id= ?
            `, [1, stockId]);
                const findOwnership = row[0];
                (0, chai_1.expect)(findOwnership.user_id).to.equal(testConst_1.default.userId);
                (0, chai_1.expect)(findOwnership.stock_id).to.equal(stockId);
                (0, chai_1.expect)(parseInt(findOwnership.quantity)).to.equal(200);
            });
        });
    });
    describe("GetStockHolding", function () {
        it("getStockHolding(1,2) must return 10", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield User_1.default.getStockHolding(1, 2);
                (0, chai_1.expect)(result).to.equal(10);
            });
        });
    });
    describe("GetAllStock", function () {
        const allUserStocks = [
            {
                symbol: "FUD",
                stock_name: "Fake Us Dolar",
                quantity: "994000.0000"
            },
            {
                symbol: "IBM",
                stock_name: "International Business Machines Corporation",
                quantity: "10.0000"
            },
            { symbol: "AAPL", stock_name: "Apple Inc.", quantity: "10.0000" },
            { symbol: "GOOG", stock_name: "Alphabet Inc.", quantity: "20.0000" }
        ];
        it("Get all test user stocks correctly", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield User_1.default.getAllStock(1);
                (0, chai_1.expect)(result).to.deep.equal(allUserStocks);
            });
        });
    });
    describe("UpdateStockQuantity", function () {
        let stockId;
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [row] = yield db_1.default.promise().execute(`
                INSERT INTO Stocks (stock_name, symbol)
                VALUES ("test-stock", "TS")
            `);
                stockId = row.insertId;
                yield db_1.default.promise().query(`
            INSERT INTO Ownerships (user_id, stock_id, quantity)
            VALUES (?, ?, ?)
        `, [testConst_1.default.userId, stockId, 100]);
            });
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield db_1.default.promise().query(`
		    DELETE FROM Stocks
		    WHERE stock_id=?
		    `, [stockId]);
            });
        });
        it("if quantity > 0 update value correctly", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield User_1.default.updateStockQuantity(stockId, 1, 200);
                const [row] = yield db_1.default.promise().query(`
                SELECT * FROM Ownerships WHERE user_id= ? AND stock_id= ?
            `, [testConst_1.default.userId, stockId]);
                const res = row[0];
                (0, chai_1.expect)(res.user_id).to.equal(testConst_1.default.userId);
                (0, chai_1.expect)(res.stock_id).to.equal(stockId);
                (0, chai_1.expect)(parseInt(res.quantity)).to.equal(200);
            });
        });
        it("if quantity === 0 value must be deleted", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield User_1.default.updateStockQuantity(stockId, 1, 0);
                const [row] = yield db_1.default.promise().query(`
                SELECT * FROM Ownerships WHERE user_id= ? AND stock_id= ?
            `, [testConst_1.default.userId, stockId]);
                (0, chai_1.expect)(row.length).to.equal(0);
            });
        });
    });
    describe("SubtractFud", function () {
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield db_1.default.promise().query(`
			UPDATE Ownerships  SET quantity=?
			WHERE user_id=? AND stock_id=?
			`, [994000, testConst_1.default.userId, fudId]);
            });
        });
        it("subtractFud(4000) must return 990000", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield User_1.default.subtractFud(1, 4000);
                const [res] = yield db_1.default.promise().query(`
                SELECT quantity FROM Ownerships WHERE user_id=? AND stock_id=?
            `, [testConst_1.default.userId, fudId]);
                const result = res[0].quantity;
                (0, chai_1.expect)(parseInt(result)).to.equal(990000);
            });
        });
    });
    describe("AddFud", function () {
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [row] = yield db_1.default.promise().execute(`
			SELECT stock_id FROM Stocks WHERE symbol="FUD"
			`);
                const fudId = row[0].stock_id;
                yield db_1.default.promise().query(`
			UPDATE Ownerships  SET quantity=?
			WHERE user_id=? AND stock_id=?
			`, [994000, testConst_1.default.userId, fudId]);
            });
        });
        it("addFud(4000) must be 998000", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield User_1.default.addFud(1, 4000);
                const [res] = yield db_1.default.promise().query(`
                	SELECT quantity FROM Ownerships WHERE user_id=? AND stock_id=?
            		`, [testConst_1.default.userId, fudId]);
                const result = res[0].quantity;
                (0, chai_1.expect)(parseInt(result)).to.equal(998000);
            });
        });
    });
    describe("CreateUfdOwnership", function () {
        let userId;
        let res;
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [row] = yield db_1.default.promise().execute(`
				INSERT INTO Users (user_name, email, hash, salt)
				VALUES ("testUser2", "test2@test.com", "my_hash", "my_salt")
			`);
                res = row;
                userId = row.insertId;
            });
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield db_1.default.promise().query(`
				DELETE FROM Users WHERE user_id=?
			`, [userId]);
            });
        });
        it("Ownership must be created successfully", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield User_1.default.createUfdOwnership(userId);
                const [row] = yield db_1.default.promise().query(`
				SELECT * FROM Ownerships WHERE user_id=?
			`, [userId]);
                const owner = row[0];
                (0, chai_1.expect)(owner.stock_id).to.equal(fudId);
                (0, chai_1.expect)(parseInt(owner.quantity)).to.equal(1000000);
            });
        });
    });
    describe("GetToDayHistory", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield db_1.default.promise().query(`
				INSERT INTO History (user_id, portfolio_value, liquid)
				VALUES (?, 1000, 100)
			`, [testConst_1.default.userId]);
            });
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield db_1.default.promise().execute(`
				DELETE FROM History WHERE portfolio_value=1000 AND liquid= 100
			`);
            });
        });
        it("Today history muy be return successfully", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const toDayHistory = (yield User_1.default.getToDayHistory(1));
                (0, chai_1.expect)(toDayHistory.history_date.getDate()).to.equal(new Date().getDate());
                (0, chai_1.expect)(toDayHistory.history_date.getMonth()).to.equal(new Date().getMonth());
                (0, chai_1.expect)(toDayHistory.history_date.getFullYear()).to.equal(new Date().getFullYear());
                (0, chai_1.expect)(parseInt(toDayHistory.portfolio_value)).to.equal(1000);
                (0, chai_1.expect)(parseInt(toDayHistory.liquid)).to.equal(100);
            });
        });
    });
    describe("AddHistory", function () {
        afterEach(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield db_1.default.promise().execute(`
				DELETE FROM History WHERE portfolio_value=1000 AND liquid= 100
			`);
            });
        });
        it("Add history to an specific date", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const date = new Date(1995, 11, 17);
                const { insertId } = (yield User_1.default.addHistory(1, 1000, 100, date));
                const [row] = yield db_1.default.promise().query(`
				SELECT * FROM History WHERE history_id=?
			`, [insertId]);
                const res = row[0];
                (0, chai_1.expect)(res.history_date).to.deep.equal(date);
                (0, chai_1.expect)(parseInt(res.portfolio_value)).to.equal(1000);
                (0, chai_1.expect)(parseInt(res.liquid)).to.equal(100);
            });
        });
        it("Add today history", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const { insertId } = (yield User_1.default.addHistory(1, 1000, 100));
                const [row] = yield db_1.default.promise().query(`
				SELECT * FROM History WHERE history_id=?
			`, [insertId]);
                const today = new Date();
                const res = row[0];
                (0, chai_1.expect)(res.history_date.getDate()).to.equal(today.getDate());
                (0, chai_1.expect)(res.history_date.getMonth()).to.equal(today.getMonth());
                (0, chai_1.expect)(res.history_date.getFullYear()).to.equal(today.getFullYear());
                (0, chai_1.expect)(parseInt(res.portfolio_value)).to.equal(1000);
                (0, chai_1.expect)(parseInt(res.liquid)).to.equal(100);
            });
        });
    });
    describe("GetFudQuantity", function () {
        it("getFudQuantity(1) must return 994000", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const qua = yield User_1.default.getFudQuantity(1);
                (0, chai_1.expect)(qua).to.equal(994000);
            });
        });
    });
    describe("updateHistory", function () {
        let historyId;
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [row] = yield db_1.default.promise().query(`
				INSERT INTO History (user_id, portfolio_value, liquid)
				VALUES (?, 1000, 100)
			`, [testConst_1.default.userId]);
                historyId = row.insertId;
            });
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield db_1.default.promise().query(`
				DELETE FROM History WHERE history_id=?
			`, [historyId]);
            });
        });
        it("History must be updated successfully", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield User_1.default.updateHistory(historyId, 2000, 200);
                const [row] = yield db_1.default.promise().query(`
				SELECT * FROM History WHERE history_id=?
			`, [historyId]);
                const res = row[0];
                (0, chai_1.expect)(parseInt(res.portfolio_value)).to.equal(2000);
                (0, chai_1.expect)(parseInt(res.liquid)).to.equal(200);
            });
        });
    });
    describe("AddTransaction", function () {
        let historyId;
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [row] = yield db_1.default.promise().query(`
				INSERT INTO History (user_id, portfolio_value, liquid)
				VALUES (?, 1000, 100)
			`, [testConst_1.default.userId]);
                historyId = row.insertId;
            });
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield db_1.default.promise().query(`
				DELETE FROM History WHERE history_id=?
			`, [historyId]);
            });
        });
        it("transaction mut be added successfully", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield User_1.default.addTransaction(historyId, 2, true, 10, 1);
                const [row] = yield db_1.default.promise().query(`
				SELECT * FROM Transactions WHERE history_id=? AND 
				stock_id=? AND buy=? AND price=? AND quantity=?
			`, [historyId, 2, true, 10, 1]);
                (0, chai_1.expect)(row).to.have.lengthOf(1);
            });
        });
    });
    describe("GetChartHistoryPoints", function () {
        it("get history point successfully", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const points = yield User_1.default.getChartHistoryPoints(1);
                const keys = Object.keys(points);
                (0, chai_1.expect)(keys).to.have.lengthOf(4);
                for (let i = 0; i < keys.length; i++) {
                    const s = keys[i];
                    const date = new Date(parseInt(s));
                    (0, chai_1.expect)(date.getDate()).to.equal(testConst_1.default.historyPoints[i].date.getDate());
                    (0, chai_1.expect)(date.getMonth()).to.equal(testConst_1.default.historyPoints[i].date.getMonth());
                    (0, chai_1.expect)(date.getFullYear()).to.equal(testConst_1.default.historyPoints[i].date.getFullYear());
                    (0, chai_1.expect)(points[s].portfolioValue).to.equal(testConst_1.default.historyPoints[i].portfolioValue);
                    (0, chai_1.expect)(points[s].liquid).to.equal(testConst_1.default.historyPoints[i].liquid);
                    (0, chai_1.expect)(points[s].transactions[0].price).to.equal(testConst_1.default.historyPoints[i].transactions.price);
                    (0, chai_1.expect)(points[s].transactions[0].buy).to.equal(testConst_1.default.historyPoints[i].transactions.buy);
                    (0, chai_1.expect)(points[s].transactions[0].quantity).to.equal(testConst_1.default.historyPoints[i].transactions.quantity);
                    const [row] = yield db_1.default.promise().query(`
					SELECT stock_id FROM Stocks WHERE 
					symbol=?
				`, [points[s].transactions[0].symbol]);
                    (0, chai_1.expect)(row[0].stock_id).to.equal(testConst_1.default.historyPoints[i].transactions.stockId);
                }
            });
        });
    });
    describe("GetTransactionFromDateToNow", function () {
        it("get all transactions from 10 days ago", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const date = new Date(Date.now() - 1000 * 60 * 60 * 24 * 10);
                let transactions = yield User_1.default.getTransactionFromDateToNow(1, date);
                (0, chai_1.expect)(transactions).to.have.lengthOf(4);
                if (transactions) {
                    for (let i = 0; i < transactions.length; i++) {
                        (0, chai_1.expect)(transactions[i].history_date.getDate()).to.equal(testConst_1.default.historyPoints[i].date.getDate());
                        (0, chai_1.expect)(transactions[i].history_date.getMonth()).to.equal(testConst_1.default.historyPoints[i].date.getMonth());
                        (0, chai_1.expect)(transactions[i].history_date.getFullYear()).to.equal(testConst_1.default.historyPoints[i].date.getFullYear());
                        (0, chai_1.expect)(transactions[i].buy).to.equal(testConst_1.default.historyPoints[i].transactions.buy);
                        (0, chai_1.expect)(transactions[i].quantity).to.equal(testConst_1.default.historyPoints[i].transactions.quantity);
                        const [row] = yield db_1.default.promise().query(`
						SELECT stock_id FROM Stocks WHERE
						symbol=?
					`, [transactions[i].symbol]);
                        (0, chai_1.expect)(row[0].stock_id).to.equal(testConst_1.default.historyPoints[i].transactions.stockId);
                    }
                }
                else {
                    (0, chai_1.expect)(transactions).to.be.an("array");
                }
            });
        });
    });
    describe("DeleteUserHistory", function () {
        let id;
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const { histories, userId } = yield (0, populateDb_1.populateDb)(testConst_1.default.stocks, "deleteHistory@test.com");
                id = userId;
            });
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield db_1.default.promise().query(`
				DELETE FROM Users WHERE user_id= ?
			`, [id]);
            });
        });
        it("history must be deleted successfully", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield User_1.default.deleteUserHistory(id);
                const [row] = yield db_1.default.promise().query(`
				SELECT * FROM History WHERE user_id= ?
			`, [id]);
                (0, chai_1.expect)(row).to.have.lengthOf(0);
            });
        });
    });
    describe("DeleteUserOwnerships", function () {
        let id;
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const { histories, userId } = yield (0, populateDb_1.populateDb)(testConst_1.default.stocks, "deleteOwnership@test.com");
                id = userId;
            });
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield db_1.default.promise().query(`
				DELETE FROM Users WHERE user_id= ?
			`, [id]);
            });
        });
        it("ownership must be deleted successfully", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield User_1.default.deleteUserOwnerships(id);
                const [row] = yield db_1.default.promise().query(`
				SELECT * FROM Ownerships WHERE user_id= ?
			`, [id]);
                (0, chai_1.expect)(row).to.have.lengthOf(0);
            });
        });
    });
});
