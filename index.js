const express = require("express");
const app = express();

app.get("/", (req,res)=>{
	res.send("express laks kaima!");
});

app.listen(5215);
