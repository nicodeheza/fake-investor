import "dotenv/config";
import express from "express";
import cors from "cors";
import createTables from "./db/tables";

const app = express();
app.use(cors());

createTables();

import MainRoute from "./routes/MainRoute";

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/api", MainRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`app listen in port ${PORT}`);
});
