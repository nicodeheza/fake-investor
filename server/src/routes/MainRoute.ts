import {Router} from "express";
const router: Router = Router();
import UserRoutes from "./UserRoutes";
import StockRoutes from "./StockRoutes";

router.use("/user", UserRoutes);
router.use("/stock", StockRoutes);

const MainRoute: Router = router;
export default MainRoute;
