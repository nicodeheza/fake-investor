import {Router} from "express";
import buyCard from "../controllers/stoks/buyCard";
import chart from "../controllers/stoks/chart";
const router: Router = Router();
import SearchStock from "../controllers/stoks/search";
import stockProfile from "../controllers/stoks/stockProfile";
import buy from "../controllers/stoks/buy";
import checkAuthenticated from "../middelwares/auth";
import sell from "../controllers/stoks/sell";

router.get("/buy-card", checkAuthenticated, buyCard);
router.get("/search/:query", SearchStock);
router.get("/chart/:symbol", chart);
router.get("/:symbol", stockProfile);
router.post("/buy", checkAuthenticated, buy);
router.post("/sell", checkAuthenticated, sell);

const StockRoutes = router;
export default StockRoutes;
