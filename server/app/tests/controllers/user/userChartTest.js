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
const userChart_1 = __importDefault(require("../../../controllers/user/userChart"));
const FUHP = __importStar(require("../../../functions/fillUserHistoryPoints"));
const UCTH = __importStar(require("../../../functions/updateOrCreateToDayHistory"));
const User_1 = __importDefault(require("../../../models/User"));
chai_1.default.use(sinon_chai_1.default);
const resMock = {
    status: function (n) {
        return this;
    },
    json: function (o) {
        return this;
    }
};
const reqMock = {
    user: [
        {
            user_id: 1
        }
    ]
};
const initHistoryPoint = {
    "1111111": {
        portfolioValue: 1000,
        liquid: 500,
        transactions: [
            {
                price: 5,
                quantity: 5,
                buy: true,
                symbol: "S1"
            }
        ]
    },
    "333333": {
        portfolioValue: 1000,
        liquid: 500,
        transactions: [
            {
                price: 5,
                quantity: 5,
                buy: true,
                symbol: "S1"
            }
        ]
    }
};
const finalHistoryPoint = Object.assign(Object.assign({}, initHistoryPoint), { "222222": {
        portfolioValue: 1000,
        liquid: 500,
        transactions: [
            {
                price: 5,
                quantity: 5,
                buy: true,
                symbol: "S1"
            }
        ]
    } });
describe("UserChart controller", function () {
    let statusSpy, jsonSpy, updateOrCreateToDayHistoryStub, getChartHistoryPointsStub, fillUserHistoryPointsStub;
    describe("response successfully", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                updateOrCreateToDayHistoryStub = sinon_1.default.stub(UCTH, "default");
                getChartHistoryPointsStub = sinon_1.default.stub(User_1.default, "getChartHistoryPoints");
                fillUserHistoryPointsStub = sinon_1.default.stub(FUHP, "default");
                getChartHistoryPointsStub.callsFake(() => Promise.resolve(initHistoryPoint));
                fillUserHistoryPointsStub.callsFake(() => Promise.resolve(finalHistoryPoint));
                yield (0, userChart_1.default)(reqMock, resMock);
            });
        });
        after(function () {
            statusSpy.restore();
            jsonSpy.restore();
            updateOrCreateToDayHistoryStub.restore();
            getChartHistoryPointsStub.restore();
            fillUserHistoryPointsStub.restore();
        });
        it("updateOrCreateToDayHistory must be called with correct argumentes", function () {
            (0, chai_1.expect)(updateOrCreateToDayHistoryStub).to.have.been.calledWith(1);
        });
        it("getChartHistoryPoints must be called with correct argumentes", function () {
            (0, chai_1.expect)(getChartHistoryPointsStub).to.have.been.calledWith(1);
        });
        it("fillUserHistoryPoints must be called with correct argumentes", function () {
            (0, chai_1.expect)(fillUserHistoryPointsStub).to.have.been.calledWith(1, initHistoryPoint);
        });
        it("status must be 200", function () {
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(200);
        });
        it("json must be called with correct arguments", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith(finalHistoryPoint);
        });
    });
    describe("error test", function () {
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                updateOrCreateToDayHistoryStub = sinon_1.default.stub(UCTH, "default");
                getChartHistoryPointsStub = sinon_1.default.stub(User_1.default, "getChartHistoryPoints");
                fillUserHistoryPointsStub = sinon_1.default.stub(FUHP, "default");
                getChartHistoryPointsStub.callsFake(() => Promise.reject("test error"));
                yield (0, userChart_1.default)(reqMock, resMock);
            });
        });
        after(function () {
            statusSpy.restore();
            jsonSpy.restore();
            updateOrCreateToDayHistoryStub.restore();
            getChartHistoryPointsStub.restore();
            fillUserHistoryPointsStub.restore();
        });
        it("status must be 500", function () {
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(500);
        });
        it("json must be caller with correct arguments", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({ message: "test error" });
        });
    });
});
