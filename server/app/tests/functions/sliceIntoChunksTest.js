"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sliceIntoChunks_1 = __importDefault(require("../../functions/sliceIntoChunks"));
describe("SliceIntoChunks Function", function () {
    it("must return an array with the correct lengths", function () {
        const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const resArr = (0, sliceIntoChunks_1.default)(arr, 2);
        (0, chai_1.expect)(resArr).to.have.lengthOf(5);
        resArr.forEach((a) => {
            (0, chai_1.expect)(a).have.lengthOf(2);
        });
    });
});
