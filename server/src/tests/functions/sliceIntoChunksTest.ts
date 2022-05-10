import {expect} from "chai";
import sliceIntoChunks from "../../functions/sliceIntoChunks";

describe("SliceIntoChunks Function", function () {
	it("must return an array with the correct lengths", function () {
		const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const resArr = sliceIntoChunks(arr, 2);
		expect(resArr).to.have.lengthOf(5);
		resArr.forEach((a) => {
			expect(a).have.lengthOf(2);
		});
	});
});
