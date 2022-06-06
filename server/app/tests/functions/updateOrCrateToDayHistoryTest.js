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
const sinon_1 = __importDefault(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const User_1 = __importDefault(require("../../models/User"));
const portfolioVal = __importStar(require("../../functions/getPortfolioVal"));
const updateOrCreateToDayHistory_1 = __importDefault(require("../../functions/updateOrCreateToDayHistory"));
chai_1.default.use(sinon_chai_1.default);
describe("UpdateOrCreateToDayHistory", function () {
    let getToDayHistoryStub, getPortfolioValStub, getFudQuantityStub, addHistoryStub, updateHistoryStub;
    describe("create history", function () {
        beforeEach(function () {
            getToDayHistoryStub = sinon_1.default.stub(User_1.default, "getToDayHistory");
            getPortfolioValStub = sinon_1.default.stub(portfolioVal, "default");
            getFudQuantityStub = sinon_1.default.stub(User_1.default, "getFudQuantity");
            addHistoryStub = sinon_1.default.stub(User_1.default, "addHistory");
            updateHistoryStub = sinon_1.default.stub(User_1.default, "updateHistory");
            getToDayHistoryStub.callsFake(() => Promise.resolve(null));
            getPortfolioValStub.callsFake(() => Promise.resolve(1000));
            getFudQuantityStub.callsFake(() => Promise.resolve(100));
            addHistoryStub.callsFake(() => Promise.resolve({ insertId: 22 }));
        });
        afterEach(function () {
            getToDayHistoryStub.restore();
            getPortfolioValStub.restore();
            getFudQuantityStub.restore();
            addHistoryStub.restore();
            updateHistoryStub.restore();
        });
        it("addHistory must be call with correct arguments", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, updateOrCreateToDayHistory_1.default)(1);
                (0, chai_1.expect)(addHistoryStub).to.have.been.calledWith(1, 1000, 100);
            });
        });
        it("updateHistory must not be call", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, updateOrCreateToDayHistory_1.default)(1);
                (0, chai_1.expect)(updateHistoryStub).to.have.been.callCount(0);
            });
        });
        it("return correct id", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield (0, updateOrCreateToDayHistory_1.default)(1);
                (0, chai_1.expect)(res).to.equal(22);
            });
        });
    });
    describe("update history", function () {
        beforeEach(function () {
            getToDayHistoryStub = sinon_1.default.stub(User_1.default, "getToDayHistory");
            getPortfolioValStub = sinon_1.default.stub(portfolioVal, "default");
            getFudQuantityStub = sinon_1.default.stub(User_1.default, "getFudQuantity");
            addHistoryStub = sinon_1.default.stub(User_1.default, "addHistory");
            updateHistoryStub = sinon_1.default.stub(User_1.default, "updateHistory");
            getToDayHistoryStub.callsFake(() => Promise.resolve({
                history_id: 22,
                history_date: new Date(),
                user_id: 1,
                portfolio_value: 1000,
                liquid: 100
            }));
            getPortfolioValStub.callsFake(() => Promise.resolve(2000));
            getFudQuantityStub.callsFake(() => Promise.resolve(200));
        });
        afterEach(function () {
            getToDayHistoryStub.restore();
            getPortfolioValStub.restore();
            getFudQuantityStub.restore();
            addHistoryStub.restore();
            updateHistoryStub.restore();
        });
        it("addHistory must not be call", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, updateOrCreateToDayHistory_1.default)(1);
                (0, chai_1.expect)(addHistoryStub).to.have.been.callCount(0);
            });
        });
        it("updateHistory must be called with correct arguments", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, updateOrCreateToDayHistory_1.default)(1);
                (0, chai_1.expect)(updateHistoryStub).to.have.been.calledWith(22, 2000, 200);
            });
        });
        it("return correct id", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const res = yield (0, updateOrCreateToDayHistory_1.default)(1);
                (0, chai_1.expect)(res).to.equal(22);
            });
        });
    });
});
