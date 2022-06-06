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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importStar(require("chai"));
const sinon_1 = __importDefault(require("sinon"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
const logout_1 = __importDefault(require("../../../controllers/user/logout"));
chai_1.default.use(sinon_chai_1.default);
const reqMock = {
    logOut: () => ""
};
const resMock = {
    status: function (n) {
        return this;
    },
    json: function (o) {
        return this;
    }
};
describe("Logout controller", function () {
    let statusSpy, jsonSpy, logOutSpy;
    before(function () {
        statusSpy = sinon_1.default.spy(resMock, "status");
        jsonSpy = sinon_1.default.spy(resMock, "json");
        logOutSpy = sinon_1.default.spy(reqMock, "logOut");
        (0, logout_1.default)(reqMock, resMock);
    });
    after(function () {
        statusSpy.restore();
        jsonSpy.restore();
        logOutSpy.restore();
    });
    it("logOut must be called", function () {
        (0, chai_1.expect)(logOutSpy).to.have.been.calledOnce;
    });
    it("status must be 200", function () {
        (0, chai_1.expect)(statusSpy).to.have.been.calledWith(200);
    });
    it("json must return an empty name", function () {
        (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({ userName: "" });
    });
});
