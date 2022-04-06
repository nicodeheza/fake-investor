import {Router} from "express";
import buyCard from "../controllers/stoks/buyCard";
import chart from "../controllers/stoks/chart";
const router: Router = Router();
import SearchStock from "../controllers/stoks/search";
import stockProfile from "../controllers/stoks/stockProfile";
import checkAuthenticated from "../middelwares/auth";

router.get("/buy-card", checkAuthenticated, buyCard);
router.get("/search/:query", SearchStock);
router.get("/chart/:symbol", chart);
router.get("/:symbol", stockProfile);

const StockRoutes = router;
export default StockRoutes;
