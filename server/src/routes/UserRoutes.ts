import {Router} from "express";
import passport from "passport";
import Login from "../controllers/user/Login";
const router: Router = Router();
import Singup from "../controllers/user/Singup";

router.post("/singup", Singup);
router.post("/login", passport.authenticate("local"), Login);

const UserRoutes: Router = router;
export default UserRoutes;
