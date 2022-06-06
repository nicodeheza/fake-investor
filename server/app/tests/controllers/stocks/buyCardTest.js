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
const User_1 = __importDefault(require("../../../models/User"));
const GPV = __importStar(require("../../../functions/getPortfolioVal"));
const buyCard_1 = __importDefault(require("../../../controllers/stoks/buyCard"));
chai_1.default.use(sinon_chai_1.default);
const reqMock = {
    user: [
        {
            user_id: 1
        }
    ]
};
const resMock = {
    status: function (num) {
        return this;
    },
    json: function (obj) {
        return this;
    }
};
describe("BuyCard controller", function () {
    return __awaiter(this, void 0, void 0, function* () {
        let getFudQuantityStub, getPortfolioValStub, statusSpy, jsonSpy;
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                getFudQuantityStub = sinon_1.default.stub(User_1.default, "getFudQuantity");
                getPortfolioValStub = sinon_1.default.stub(GPV, "default");
                statusSpy = sinon_1.default.spy(resMock, "status");
                jsonSpy = sinon_1.default.spy(resMock, "json");
                getFudQuantityStub.callsFake(() => Promise.resolve(1000));
                getPortfolioValStub.callsFake(() => Promise.resolve(9000));
                yield (0, buyCard_1.default)(reqMock, resMock);
            });
        });
        after(function () {
            getFudQuantityStub.restore();
            getPortfolioValStub.restore();
            statusSpy.restore();
            jsonSpy.restore();
        });
        it("getFudQuantity have been called with correct arguments", function () {
            (0, chai_1.expect)(getFudQuantityStub).to.have.been.calledWith(reqMock.user[0].user_id);
        });
        it("getPortfolioVal have been called with correct arguments", function () {
            (0, chai_1.expect)(getPortfolioValStub).to.have.been.calledWith(reqMock.user[0].user_id);
        });
        it("status must be called with 200", function () {
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(200);
        });
        it("json must be called with correct data", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({
                fud: 1000,
                portfolioV: 9000
            });
        });
    });
});
