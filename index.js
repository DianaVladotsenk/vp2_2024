const express = require("express");
const dateTime = require("/.dateTime");
const fs = require("fs");


const app = express();

//Maaran view mootori
app.set("view engine", "ejs");
//Maaran jagate avalikke failde kausta
app.use(express.static("public"));


app.get("/", (req,res)=>{
	//res.send("express laks kaima!");
	res.render("index");
});
app.get("/timenow",(req,res)=>{
	const weekdayEtNow  = dateTime.weekDayEt()
	const dateEtNow = dateTime.dateFormattedEt();
	const timeNow =  dateTime.timeFormattedEt();
	res.render("timenow", {nowWD: weekdayEtNow, nowD: dateNow, nowT: timeNow});
	
});

app.get("/vanas]nad", (req,res)=>{
	let folkWisdom = [];
	fs.readFile("public/textfiles/vanas]nad.text", "utf8", (err, data)=>{
		if(err){
			//throw err;
			res.render("justlist", {h2: "Vanasõnad", listData: ["Ei leidnud midagi!"]});
		}
		else{
			folkWisdmom = data.split(";");			
			res.render("justlist", {h2: "Vanasõnad", listData: folkWisdmom});
		}
	});
});

app.listen(5215);
//module.exports = {dateEtNow: dateFormattedEt,weekDayEtNow: weekDayEt, timeFormattedNow:timeFormattedEt,monthNamesEt};
//data.split(";") - jagab ; semikoolonitele
//forEach - kib igauht labi