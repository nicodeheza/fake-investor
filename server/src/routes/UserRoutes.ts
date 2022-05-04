import {Router} from "express";
import passport from "passport";
import Login from "../controllers/user/Login";
const router: Router = Router();
import Singup from "../controllers/user/Singup";
import logout from "../controllers/user/logout";
import Auth from "../controllers/user/Auth";
import checkAuthenticated from "../middelwares/auth";
import userStats from "../controllers/user/userStats";
import userStocks from "../controllers/user/userStocks";
import userChart from "../controllers/user/userChart";
import resetUser from "../controllers/user/resetUser";

router.post("/singup", Singup);
router.post("/login", passport.authenticate("local"), Login);
router.get("/logout", checkAuthenticated, logout);
router.get("/auth", Auth);
router.get("/userStats", checkAuthenticated, userStats);
router.get("/stocks", checkAuthenticated, userStocks);
router.get("/userChart", checkAuthenticated, userChart);
router.delete("/reset", checkAuthenticated, resetUser);

const UserRoutes: Router = router;
export default UserRoutes;
