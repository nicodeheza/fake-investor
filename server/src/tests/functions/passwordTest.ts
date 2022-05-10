import {expect} from "chai";
import {createHash, checkPassword} from "../../functions/password";

describe("Password Functions", function () {
	describe("CreateHash", function () {
		type res = {
			hash: string;
			salt: string;
		};
		it("must return a hash and a salt", async function () {
			const res = await createHash("myTestPassword");
			expect(res).to.haveOwnProperty("hash");
			expect(res).to.haveOwnProperty("salt");
			expect((res as res).salt).to.be.a("string");
			expect((res as res).hash).to.be.a("string");
			expect((res as res).hash).to.not.equal("myTestPassword");
		});
	});
	describe("CheckPassword", function () {
		let hash: string;
		let salt: string;
		before(async function () {
			const res = await createHash("myTestPassword");
			hash = (res as {[key: string]: string}).hash;
			salt = (res as {[key: string]: string}).salt;
		});
		it("correct password", async function () {
			const res = await checkPassword("myTestPassword", hash, salt);
			expect(res).to.equal(true);
		});
		it("incorrect password", async function () {
			const res = await checkPassword("myBadPassword", hash, salt);
			expect(res).to.equal(false);
		});
	});
});
