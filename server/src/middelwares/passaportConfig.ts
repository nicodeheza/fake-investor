import {PassportStatic} from "passport";
import passportLocal from "passport-local";
import {checkPassword} from "../functions/password";
import User from "../models/User";
import user from "../models/UserType";

const localStrategy = passportLocal.Strategy;

const passportConfig = (passport: PassportStatic) => {
	passport.use(
		new localStrategy(
			{usernameField: "email"},
			async (email: string, password: string, done) => {
				try {
					const user: any = await User.findUserByEmail(email);
					if (!user[0]) return done(null, false);
					const verify = await checkPassword(password, user[0].hash, user[0].salt);
					if (verify) {
						return done(null, user[0]);
					} else {
						return done(null, false);
					}
				} catch (err) {
					console.log(err);
				}
			}
		)
	);
	passport.serializeUser((user: user, cb) => {
		cb(null, user.user_id);
	});

	passport.deserializeUser(async (id: number, cb) => {
		try {
			const user = await User.findById(id);
			cb(null, user);
		} catch (err) {
			cb(err, null);
		}
	});
};
export default passportConfig;
