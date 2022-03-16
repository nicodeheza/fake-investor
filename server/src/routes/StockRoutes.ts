import {Router} from "express";
const router: Router = Router();
import SearchStock from "../controllers/stoks/search";

router.get("/search/:query", SearchStock);

const StockRoutes = router;
export default StockRoutes;
