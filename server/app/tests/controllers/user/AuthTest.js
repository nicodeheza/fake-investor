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
const Auth_1 = __importDefault(require("../../../controllers/user/Auth"));
chai_1.default.use(sinon_chai_1.default);
const resMock = {
    status: function (n) {
        return this;
    },
    json: function (o) {
        return this;
    }
};
describe("Auth controller", function () {
    let statusSpy, jsonSpy;
    describe("user is auth", function () {
        before(function () {
            const reqMock = {
                isAuthenticated: () => true,
                user: [
                    {
                        user_name: "test user"
                    }
                ]
            };
            statusSpy = sinon_1.default.spy(resMock, "status");
            jsonSpy = sinon_1.default.spy(resMock, "json");
            (0, Auth_1.default)(reqMock, resMock);
        });
        after(function () {
            statusSpy.restore();
            jsonSpy.restore();
        });
        it("status is 200", function () {
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(200);
        });
        it("json returns the user name", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({ userName: "test user" });
        });
    });
    describe("user is unauth", function () {
        before(function () {
            const reqMock = {
                isAuthenticated: () => false,
                user: [
                    {
                        user_name: "test user"
                    }
                ]
            };
            statusSpy = sinon_1.default.spy(resMock, "status");
            jsonSpy = sinon_1.default.spy(resMock, "json");
            (0, Auth_1.default)(reqMock, resMock);
        });
        after(function () {
            statusSpy.restore();
            jsonSpy.restore();
        });
        it("status is 200", function () {
            (0, chai_1.expect)(statusSpy).to.have.been.calledWith(200);
        });
        it("json returns empty name", function () {
            (0, chai_1.expect)(jsonSpy).to.have.been.calledWith({ userName: "" });
        });
    });
});
