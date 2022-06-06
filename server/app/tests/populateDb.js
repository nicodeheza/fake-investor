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
exports.populateDb = exports.addStocks = void 0;
const db_1 = __importDefault(require("../db/db"));
const password_1 = require("../functions/password");
function addStocks() {
    return __awaiter(this, void 0, void 0, function* () {
        const stocks = [
            {
                name: "International Business Machines Corporation",
                symbol: "IBM"
            },
            {
                name: "Apple Inc.",
                symbol: "AAPL"
            },
            {
                name: "Alphabet Inc.",
                symbol: "GOOG"
            }
        ];
        const stocksCreated = yield Promise.all(stocks.map((stock) => {
            return db_1.default.promise().query(`
            INSERT INTO Stocks (stock_name, symbol)
            VALUES(?,?);
        `, [stock.name, stock.symbol]);
        }));
        stocks.forEach((ele, i) => {
            ele.id = stocksCreated[i][0].insertId;
        });
        return stocks;
    });
}
exports.addStocks = addStocks;
function populateDb(stocks, userEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        const { hash, salt } = (yield (0, password_1.createHash)("test"));
        const startDay = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
        const [userCreated] = yield db_1.default.promise().query(`
        INSERT INTO Users (user_name, email, hash, salt, start_day)
        VALUES(?, ?, ?, ?, ?);
    `, ["testUser", userEmail, hash, salt, startDay]);
        const userId = userCreated.insertId;
        const histories = [
            {
                date: startDay,
                userId,
                portfolioValue: 1000000,
                liquid: 999000,
                transactions: {
                    stockId: stocks.filter((ele) => ele.symbol === "IBM")[0].id,
                    buy: true,
                    price: 100,
                    quantity: 10
                }
            },
            {
                date: new Date(startDay.getTime() + 1000 * 60 * 60 * 24 * 2),
                userId,
                portfolioValue: 1000000,
                liquid: 996000,
                transactions: {
                    stockId: stocks.filter((ele) => ele.symbol === "AAPL")[0].id,
                    buy: true,
                    price: 200,
                    quantity: 15
                }
            },
            {
                date: new Date(startDay.getTime() + 1000 * 60 * 60 * 24 * 4),
                userId,
                portfolioValue: 1000000,
                liquid: 997000,
                transactions: {
                    stockId: stocks.filter((ele) => ele.symbol === "AAPL")[0].id,
                    buy: false,
                    price: 200,
                    quantity: 5
                }
            },
            {
                date: new Date(startDay.getTime() + 1000 * 60 * 60 * 24 * 5),
                userId,
                portfolioValue: 1000000,
                liquid: 994000,
                transactions: {
                    stockId: stocks.filter((ele) => ele.symbol === "GOOG")[0].id,
                    buy: true,
                    price: 150,
                    quantity: 20
                }
            }
        ];
        Promise.all(histories.map((ele) => __awaiter(this, void 0, void 0, function* () {
            const [hc] = yield db_1.default.promise().query(`
		INSERT INTO History (history_date, user_id, portfolio_value, liquid)
		VALUES (?, ?, ?, ?)
		`, [ele.date, ele.userId, ele.portfolioValue, ele.liquid]);
            const historyId = hc.insertId;
            yield db_1.default.promise().query(`
			INSERT INTO Transactions (history_id, stock_id, buy, price, quantity)
			VALUES (?, ?, ?, ?, ?)
		`, [
                historyId,
                ele.transactions.stockId,
                ele.transactions.buy,
                ele.transactions.price,
                ele.transactions.quantity
            ]);
        })));
        Promise.all([
            db_1.default.promise().query(`
			INSERT INTO Ownerships (user_id, stock_id, quantity)
			VALUES (? ,? ,?)
		`, [userId, stocks.filter((ele) => ele.symbol === "IBM")[0].id, 10]),
            db_1.default.promise().query(`
			INSERT INTO Ownerships (user_id, stock_id, quantity)
			VALUES (? ,? ,?)
		`, [userId, stocks.filter((ele) => ele.symbol === "AAPL")[0].id, 10]),
            db_1.default.promise().query(`
			INSERT INTO Ownerships (user_id, stock_id, quantity)
			VALUES (? ,? ,?)
		`, [userId, stocks.filter((ele) => ele.symbol === "GOOG")[0].id, 20]),
            db_1.default.promise().query(`
			INSERT INTO Ownerships (user_id, stock_id, quantity)
			VALUES (? ,? ,?)
		`, [userId, 1, 994000])
        ]);
        return { histories, userId };
    });
}
exports.populateDb = populateDb;
