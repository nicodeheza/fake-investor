import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

import MainRoute from "./routes/MainRoute";

app.use(express.json());
app.use(express.urlencoded());

app.use("/api", MainRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`app listen in port ${PORT}`);
});
