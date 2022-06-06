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
const F = __importStar(require("node-fetch"));
const search_1 = __importDefault(require("../../../controllers/stoks/search"));
chai_1.default.use(sinon_chai_1.default);
const reqMock = {
    params: {
        query: "test"
    }
};
const resMock = {
    status: function (num) {
        return this;
    },
    json: function (onj) {
        return this;
    }
};
describe("SearchStock controller", function () {
    let jsonSpy, statusSpy, fetchStub;
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            jsonSpy = sinon_1.default.spy(resMock, "json");
            statusSpy = sinon_1.default.spy(resMock, "status");
            fetchStub = sinon_1.default.stub(F, "default");
            fetchStub.callsFake(() => Promise.resolve({ json: () => Promise.resolve("fetch res") }));
            yield (0, search_1.default)(reqMock, resMock);
        });
    });
    after(function () {
        jsonSpy.restore();
        statusSpy.restore();
        fetchStub.restore();
    });
    it("fetch must be called with correct arguments", function () {
        (0, chai_1.expect)(fetchStub).to.have.been.calledWith(`https://yfapi.net/v6/finance/autocomplete?region=US&lang=en&query=${reqMock.params.query}`, {
            method: "GET",
            headers: {
                "x-api-key": process.env.YF_API_KEY || "",
                "Content-Type": "application/json"
            }
        });
    });
    it("res with status 200", function () {
        (0, chai_1.expect)(statusSpy).to.have.been.calledWith(200);
    });
    it("call res json with correct data", function () {
        (0, chai_1.expect)(jsonSpy).to.have.been.calledWith("fetch res");
    });
});
