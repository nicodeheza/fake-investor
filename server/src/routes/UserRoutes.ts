import {Router} from "express";
const router: Router = Router();
import Singup from "../controllers/user/Singup";

router.post("/singup", Singup);

const UserRoutes: Router = router;
export default UserRoutes;
