"use strict";
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
const passport_local_1 = __importDefault(require("passport-local"));
const password_1 = require("../functions/password");
const User_1 = __importDefault(require("../models/User"));
const localStrategy = passport_local_1.default.Strategy;
const passportConfig = (passport) => {
    passport.use(new localStrategy({ usernameField: "email" }, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield User_1.default.findUserByEmail(email);
            if (!user[0])
                return done(null, false);
            const verify = yield (0, password_1.checkPassword)(password, user[0].hash, user[0].salt);
            if (verify) {
                return done(null, user[0]);
            }
            else {
                return done(null, false);
            }
        }
        catch (err) {
            console.log(err);
        }
    })));
    passport.serializeUser((user, cb) => {
        cb(null, user.user_id);
    });
    passport.deserializeUser((id, cb) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield User_1.default.findById(id);
            cb(null, user);
        }
        catch (err) {
            cb(err, null);
        }
    }));
};
exports.default = passportConfig;
