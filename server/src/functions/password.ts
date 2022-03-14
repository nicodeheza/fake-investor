import {randomBytes, pbkdf2} from "crypto";

export async function createHash(password: string) {
	return new Promise((resolve, reject) => {
		const salt = randomBytes(128).toString("base64");
		pbkdf2(password, salt, 10000, 64, "sha512", (err, res) => {
			if (err) reject(err);
			resolve({hash: res.toString("base64"), salt});
		});
	});
}

export async function checkPassword(password: string, userHash: string, salt: string) {
	return new Promise((resolve, rejects) => {
		pbkdf2(password, salt, 10000, 64, "sha512", (err, hash) => {
			if (err) rejects(err);
			resolve(userHash === hash.toString("base64"));
		});
	});
}
