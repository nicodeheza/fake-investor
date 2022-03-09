import {Router} from "express";
const router: Router = Router();
import UserRoutes from "./UserRoutes";

router.use("/user", UserRoutes);

const MainRoute: Router = router;
export default MainRoute;
