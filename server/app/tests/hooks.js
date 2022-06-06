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
exports.mochaHooks = void 0;
const db_1 = __importDefault(require("../db/db"));
const tables_1 = __importDefault(require("../db/tables"));
const populateDb_1 = require("./populateDb");
const testConst_1 = __importDefault(require("./testConst"));
exports.mochaHooks = {
    beforeAll: function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield db_1.default.promise().execute(`
		DROP TABLE IF EXISTS  Users, Stocks, Ownerships, History, Transactions
		`);
            yield (0, tables_1.default)();
            const stocks = yield (0, populateDb_1.addStocks)();
            const { histories, userId } = yield (0, populateDb_1.populateDb)(stocks, "testUser@test.com");
            testConst_1.default.historyPoints = histories;
            testConst_1.default.stocks = stocks;
            testConst_1.default.userId = userId;
        });
    },
    afterAll: function () {
        return __awaiter(this, void 0, void 0, function* () {
            // await db.promise().execute(`
            // DROP TABLE IF EXISTS  Users, Stocks, Ownerships, History, Transactions
            // `);
        });
    }
};
