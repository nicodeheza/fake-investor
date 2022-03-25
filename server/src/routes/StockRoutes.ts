import {Router} from "express";
import chart from "../controllers/stoks/chart";
const router: Router = Router();
import SearchStock from "../controllers/stoks/search";
import stockProfile from "../controllers/stoks/stockProfile";

router.get("/search/:query", SearchStock);
router.get("/:symbol", stockProfile);
router.get("/chart/:symbol", chart);

const StockRoutes = router;
export default StockRoutes;
