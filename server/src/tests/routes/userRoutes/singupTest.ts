import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import sinon, {SinonSpy, SinonStub} from "sinon";
import sinonChai from "sinon-chai";
import db from "../../../db/db";
import app from "../../../index";

chai.use(sinonChai);
chai.use(chaiHttp);

interface user {
	user_id: number;
	user_name: string;
	email: string;
	hash: string;
	salt: string;
	start_day: Date;
}

describe("/user/singup route", function () {
	describe("user must have been saved correctly in the db and logged in", function () {
		let res: any, err, newUser: user;
		before(function (done) {
			chai
				.request(app)
				.post("/api/user/singup")
				.set("Content-Type", "application/json")
				.send({
					email: "newUser@test.com",
					userName: "newUser",
					password: "newUserPassword",
					repeat: "newUserPassword"
				})
				.end(function (e, r) {
					res = r;
					err = e;
					done();
				});
		});
		it("user has been saved correctly in the db", async function () {
			const [dbData] = await db.promise().execute(`
                SELECT * FROM Users WHERE user_name= 'newUser'
            `);
			newUser = (dbData as user[])[0];
			expect(newUser.user_id).to.be.a("number");
			expect(newUser.user_name).to.be.equal("newUser");
			expect(newUser.email).to.be.equal("newUser@test.com");
			expect(newUser.hash).to.be.a("string").and.to.not.be.equal("newUserPassword");
			expect(newUser.salt).to.be.a("string");
			expect(newUser.start_day.getTime()).to.be.equal(new Date().setHours(0, 0, 0, 0));
		});
		it("User must have 1000000 UFD ownership", async function () {
			const [dbData] = await db.promise().query(
				`
                SELECT quantity FROM Ownerships WHERE user_id=? AND stock_id= 1
            `,
				[newUser.user_id]
			);
			const userUfd = (dbData as {quantity: string}[])[0].quantity;
			expect(parseFloat(userUfd)).to.be.equal(1000000);
		});
		it("user must be logged in", function () {
			expect(res).to.have.cookie("connect.sid");
		});
		it("status must be 200", function () {});
		it("user name must be returned", function () {});
	});
	describe("singup with invalid password", function () {
		it("status must be 400", function () {});
		it("must return correct message", function () {});
		it("new user has not been created", function () {});
	});
	describe("signup with existing email", function () {
		it("status must be 400", function () {});
		it("must return correct message", function () {});
		it("new user has not been created", function () {});
	});
});
