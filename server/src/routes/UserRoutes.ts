import {Router} from "express";
import passport from "passport";
import Login from "../controllers/user/Login";
const router: Router = Router();
import Singup from "../controllers/user/Singup";
import logout from "../controllers/user/logout";
import checkAuthenticated from "../middelwares/auth";

router.post("/singup", Singup);
router.post("/login", passport.authenticate("local"), Login);
router.get("/logout", checkAuthenticated, logout);

const UserRoutes: Router = router;
export default UserRoutes;
