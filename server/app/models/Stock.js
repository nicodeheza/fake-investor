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
const db_1 = __importDefault(require("../db/db"));
const Stock = {
    getIdFromSymbol: (symbol) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const [rows] = yield db_1.default.promise().query(`
			SELECT stock_id FROM Stocks WHERE symbol=?
			`, [symbol]);
            return (_a = rows[0]) === null || _a === void 0 ? void 0 : _a.stock_id;
        }
        catch (err) {
            console.log(err);
        }
    }),
    addStock: (symbol, name) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const [rows] = yield db_1.default.promise().query(`
			INSERT INTO Stocks (stock_name, symbol) VALUES (?,?)
			`, [name, symbol]);
            return rows.insertId;
        }
        catch (err) {
            console.log(err);
        }
    }),
    getTopSymbols: () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const [rows] = yield db_1.default.promise().execute(`
				SELECT Stocks.symbol,
				Stocks.stock_name, 
				SUM(Transactions.quantity) AS "buys-num"
				FROM Stocks JOIN Transactions ON Stocks.stock_id= Transactions.stock_id
				WHERE Transactions.buy=1 GROUP BY Stocks.symbol ORDER BY \`buys-num\` DESC LIMIT 10;
				`);
            return rows;
        }
        catch (err) {
            console.log(err);
        }
    })
};
exports.default = Stock;
