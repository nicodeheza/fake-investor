import express from "express";
const app = express();

app.get("/", (req, res) => {
	res.send("hello from express");
});

app.listen(4000, () => {
	console.log("app listen in port 4000");
});
