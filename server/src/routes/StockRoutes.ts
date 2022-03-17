import {Router} from "express";
const router: Router = Router();
import SearchStock from "../controllers/stoks/search";
import stockProfile from "../controllers/stoks/stockProfile";

router.get("/search/:query", SearchStock);
router.get("/:symbol", stockProfile);

const StockRoutes = router;
export default StockRoutes;
