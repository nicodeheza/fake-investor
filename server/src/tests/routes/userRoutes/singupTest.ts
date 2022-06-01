import chai, {expect} from "chai";
import chaiHttp from "chai-http";
import db from "../../../db/db";
import app from "../../../index";

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
	after(async function () {
		await db.promise().execute(`
		DELETE FROM Users WHERE user_name= 'newUser'
		`);
	});
	describe("user must have been saved correctly in the db and logged in", function () {
		let res: ChaiHttp.Response, err: any, newUser: user;
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
		it("status must be 200", function () {
			expect(res).to.have.status(200);
			expect(err).to.be.null;
		});
		it("user name must be returned", function () {
			expect(res).to.be.json;
			expect(res.body.userName).to.be.equal("newUser");
		});
	});
	describe("singup with invalid email", function () {
		let res: ChaiHttp.Response, err: any;
		before(function (done) {
			chai
				.request(app)
				.post("/api/user/singup")
				.set("Content-Type", "application/json")
				.send({
					email: "newUser",
					userName: "newUser2",
					password: "newUserPassword2",
					repeat: "newUserPassword2"
				})
				.end(function (e, r) {
					res = r;
					err = e;
					done();
				});
		});
		it("status must be 400", function () {
			expect(res).to.have.status(400);
		});
		it("must return correct message", function () {
			expect(res.body.message).to.be.equal("Please enter a valid email.");
		});
		it("new user has not been created", async function () {
			const [dbData] = await db.promise().execute(`
			SELECT * FROM Users WHERE user_name= 'newUser2'
			`);
			expect(dbData).to.be.eql([]);
		});
	});
	describe("signup with existing email", function () {
		let res: ChaiHttp.Response, err: any, newUser: user;
		before(function (done) {
			chai
				.request(app)
				.post("/api/user/singup")
				.set("Content-Type", "application/json")
				.send({
					email: "newUser@test.com",
					userName: "newUser3",
					password: "newUserPassword",
					repeat: "newUserPassword"
				})
				.end(function (e, r) {
					res = r;
					err = e;
					done();
				});
		});
		it("status must be 400", function () {
			expect(res).to.have.status(400);
		});
		it("must return correct message", function () {
			expect(res.body.message).to.be.equal(
				"There is already an account associated with that email"
			);
		});
		it("new user has not been created", async function () {
			const [dbData] = await db.promise().execute(`
			SELECT * FROM Users WHERE user_name= 'newUser3'
			`);
			expect(dbData).to.be.eql([]);
		});
	});
});
