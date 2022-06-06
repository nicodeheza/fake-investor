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
const Stock_1 = __importDefault(require("../../models/Stock"));
describe("Stock methods", function () {
    describe("GetIdFromSymbol", function () {
        it("FUD must return 1", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const fudId = yield Stock_1.default.getIdFromSymbol("FUD");
                (0, chai_1.expect)(fudId).to.equal(1);
            });
        });
    });
    describe("AddStock", function () {
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield db_1.default.promise().execute(`
                DELETE FROM Stocks WHERE symbol= "TEST"
            `);
            });
        });
        it("stock must be add successfully", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const stockId = yield Stock_1.default.addStock("TEST", "test stock");
                const [row] = yield db_1.default.promise().query(`
                SELECT * FROM Stocks WHERE stock_id= ?
            `, [stockId]);
                const stock = row[0];
                (0, chai_1.expect)(stock.stock_name).to.equal("test stock");
                (0, chai_1.expect)(stock.symbol).to.equal("TEST");
            });
        });
    });
    describe("GetTopSymbols", function () {
        it("return top symbols successfully and in order", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const top = yield Stock_1.default.getTopSymbols();
                (0, chai_1.expect)(top).to.have.lengthOf(3);
                const sortTop = [...top].sort((a, b) => b["buys-num"] - a["buys-num"]);
                (0, chai_1.expect)(top).to.deep.equal(sortTop);
                (0, chai_1.expect)(top[0]).to.have.property("symbol");
                (0, chai_1.expect)(top[0]).to.have.property("stock_name");
                (0, chai_1.expect)(top[0]).to.have.property("buys-num");
            });
        });
    });
});
