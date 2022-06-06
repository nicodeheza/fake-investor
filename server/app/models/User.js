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
const User = {
    findUserByEmail: (user) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const [rows] = yield db_1.default
                .promise()
                .query("SELECT * FROM `Users` WHERE email= ?", [user]);
            return rows;
        }
        catch (err) {
            console.log(err);
        }
    }),
    saveNewUser: (userName, email, hash, salt) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const [rows] = yield db_1.default
                .promise()
                .query("INSERT INTO  Users ( user_name, email, hash, salt ) VALUES(?, ?, ?, ?)", [
                userName,
                email,
                hash,
                salt
            ]);
            return ["success", rows.insertId];
        }
        catch (err) {
            return err.sqlMessage;
        }
    }),
    findById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const [rows] = yield db_1.default
                .promise()
                .query("SELECT * FROM Users WHERE user_id=?", [id]);
            return rows;
        }
        catch (err) {
            console.log(err);
        }
    }),
    addStockOwnership: (userId, stockId, amount) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield db_1.default
                .promise()
                .query(`INSERT INTO Ownerships(user_id, stock_id, quantity) VALUES (?, ?, ?)`, [
                userId,
                stockId,
                amount
            ]);
        }
        catch (err) {
            console.log(err);
        }
    }),
    getStockHolding: (userId, stockId) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const [rows] = yield db_1.default.promise().query(`
			SELECT quantity FROM Ownerships WHERE user_id=? AND stock_id=?
			`, [userId, stockId]);
            return parseInt((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.quantity);
        }
        catch (err) {
            console.log(err);
        }
    }),
    getAllStock: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const [rows] = yield db_1.default.promise().query(`
			SELECT Stocks.symbol, Stocks.stock_name, Ownerships.quantity FROM Stocks 
			JOIN Ownerships ON Stocks.stock_id=Ownerships.stock_id
			WHERE Ownerships.user_id= ?
			`, [userId]);
            return rows;
        }
        catch (err) {
            console.log(err);
        }
    }),
    updateStockQuantity: (stockId, userId, newVal) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (newVal > 0) {
                yield db_1.default.promise().query(`
				UPDATE Ownerships SET quantity=?
				WHERE user_id=? AND stock_id=?
				`, [newVal, userId, stockId]);
            }
            else {
                yield db_1.default.promise().query(`
				DELETE FROM Ownerships
				WHERE user_id=? AND stock_id=?
				`, [userId, stockId]);
            }
        }
        catch (err) {
            console.log(err);
        }
    }),
    subtractFud: (userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const [row] = yield db_1.default.promise().execute(`
			SELECT stock_id FROM Stocks WHERE symbol="FUD"
			`);
            const fudId = row[0].stock_id;
            yield db_1.default.promise().query(`
			UPDATE Ownerships  SET quantity= quantity - ?
			WHERE user_id=? AND stock_id=?
			`, [amount, userId, fudId]);
        }
        catch (err) {
            console.log(err);
        }
    }),
    addFud: (userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const [row] = yield db_1.default.promise().execute(`
			SELECT stock_id FROM Stocks WHERE symbol="FUD"
			`);
            const fudId = row[0].stock_id;
            yield db_1.default.promise().query(`
			UPDATE Ownerships  SET quantity= quantity + ?
			WHERE user_id=? AND stock_id=?
			`, [amount, userId, fudId]);
        }
        catch (err) {
            console.log(err);
        }
    }),
    createUfdOwnership: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const [row] = yield db_1.default.promise().execute(`
			SELECT stock_id FROM Stocks WHERE symbol="FUD"
			`);
            const fudId = row[0].stock_id;
            yield db_1.default.promise().query(`
			INSERT INTO Ownerships ( user_id, stock_id, quantity) VALUES (?, ?, 1000000);
			`, [userId, fudId]);
        }
        catch (err) {
            console.log(err);
        }
    }),
    getToDayHistory: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const [rows] = yield db_1.default.promise().query(`
			SELECT * FROM History WHERE user_id= ? AND history_date=CURRENT_DATE
				`, [userId]);
            return rows[0];
        }
        catch (err) {
            console.log(err);
        }
    }),
    addHistory: (userId, portfolioVal, liquid, date) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!date) {
                const [rows] = yield db_1.default.promise().query(`
				INSERT INTO History (user_id, portfolio_value, liquid) 
				VALUES (?,?,?)
				`, [userId, portfolioVal, liquid]);
                return rows;
            }
            else {
                const [rows] = yield db_1.default.promise().query(`
				INSERT INTO History (user_id, portfolio_value, liquid, history_date)
				VALUES (?,?,?,?)
				`, [userId, portfolioVal, liquid, date]);
                return rows;
            }
        }
        catch (err) {
            console.log(err);
        }
    }),
    getFudQuantity: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const [row] = yield db_1.default.promise().execute(`
			SELECT stock_id FROM Stocks WHERE symbol="FUD"
			`);
            const fudId = row[0].stock_id;
            const [rows] = yield db_1.default.promise().query(`
			SELECT quantity FROM Ownerships 
			WHERE user_id=? AND stock_id=?
			`, [userId, fudId]);
            return parseFloat(rows[0].quantity);
        }
        catch (err) {
            console.log(err);
        }
    }),
    updateHistory: (historyId, portfolioVal, liquid) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield db_1.default.promise().query(`
			UPDATE History SET portfolio_value=?, liquid=? 
			WHERE history_id=?
			`, [portfolioVal, liquid, historyId]);
        }
        catch (err) {
            console.log(err);
        }
    }),
    addTransaction: (historyId, stockId, buy, price, quantity) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield db_1.default.promise().query(`
			INSERT INTO Transactions (history_id, stock_id, buy, price, quantity)
			VALUES (?,?,?,?,?)
			`, [historyId, stockId, buy, price, quantity]);
        }
        catch (err) {
            console.log(err);
        }
    }),
    getChartHistoryPoints: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        const [data] = yield db_1.default.promise().query(`
		SELECT History.history_date, 
		History.portfolio_value, 
		History.liquid,
		Transactions.price,
		Transactions.quantity,
		Transactions.buy,
		Stocks.symbol
		FROM History LEFT JOIN 
		(Transactions JOIN Stocks ON Transactions.stock_id= Stocks.stock_id)
		ON History.history_id= Transactions.history_id
		WHERE History.user_id=?;
		`, [userId]);
        const res = {};
        data.forEach((d) => {
            if (res[d.history_date.getTime()]) {
                if (d.symbol !== null) {
                    res[d.history_date.getTime()].transactions.push({
                        price: parseFloat(d.price),
                        quantity: d.quantity,
                        buy: d.buy === 1,
                        symbol: d.symbol
                    });
                }
            }
            else {
                res[d.history_date.getTime()] = {
                    portfolioValue: parseFloat(d.portfolio_value),
                    liquid: parseFloat(d.liquid),
                    transactions: d.symbol !== null
                        ? [
                            {
                                price: parseFloat(d.price),
                                quantity: d.quantity,
                                buy: d.buy === 1,
                                symbol: d.symbol
                            }
                        ]
                        : []
                };
            }
        });
        return res;
    }),
    getTransactionFromDateToNow: (userId, date) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const [data] = yield db_1.default.promise().query(`
			SELECT History.history_date,
			Stocks.symbol,
			Transactions.buy,
			Transactions.quantity FROM History 
			JOIN (Transactions JOIN Stocks ON Transactions.stock_id= Stocks.stock_id) 
			ON History.history_id= Transactions.history_id
			WHERE History.user_id=? AND History.history_date > ?;
			`, [userId, date]);
            return data.map((obj) => {
                return Object.assign(Object.assign({}, obj), { buy: obj.buy === 1 });
            });
        }
        catch (err) {
            console.log(err);
        }
    }),
    deleteUserHistory: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield db_1.default.promise().query(`
			DELETE FROM History WHERE user_id=?
			`, [userId]);
        }
        catch (err) {
            console.log(err);
        }
    }),
    deleteUserOwnerships: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield db_1.default.promise().query(`
			DELETE FROM Ownerships WHERE user_id=?
			`, [userId]);
        }
        catch (err) {
            console.log(err);
        }
    })
};
exports.default = User;
