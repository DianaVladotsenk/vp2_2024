const express = require("express");
const dateTime = require("/.dateTime");
const fs = require("fs");
const bodyparser = require("body-parser");



const app = express();

//Maaran view mootori
app.set("view engine", "ejs");
//Maaran jagate avalikke failde kausta
app.use(express.static("public"));
//kasutame bodyparserit paringute parsemiseks(kui aunlt tekst,siis false, kui ka pildid jms siis true)
app.use(bodyparser.urlencoded({extended:false}));


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
			res.render("justlist", {h2: "Vanasõnad", listData: folkWisdmom
			});
		}
	});
});

app.get("/regvisit", (req,res)=>{
	res.render("regvisit");
});

app.post("/regvisit", (req,res)=>{
	//console.log(req.body);
	//avan text faili selliselt et kui seda pole olemas luuakse
	fs.open("public/textfiles/log.txt", "a", (err,file)=>{
		if(err){
			throw err;
		}
		else {
			fs.appendFile("public/textfiles/log.txt", req.body.firstNameInput + " " + req.body.lastNameInput + ";", (err)=>{
				if(err){
					throw err;
				}
				else {
					console.log("Faili kirjuitatu");
					res.render("regvisit");

				}
			});
		}
	});
	//res.render("regvisit");
});




app.listen(5215);
//module.exports = {dateEtNow: dateFormattedEt,weekDayEtNow: weekDayEt, timeFormattedNow:timeFormattedEt,monthNamesEt};
//data.split(";") - jagab ; semikoolonitele
//forEach - kib igauht labi
//regvisit - kes kulastas veebilehte
//get meetod - kolme inputi 
//method = "POST" - paring teise lehekuljele voi midagi muut

//tanu bodyparserile meil on olemas body,kus antakse teadet voi infot katte saame
//meetod "a"  - tekkita
//append - paneme juurde, write - algatakse nullist kirjutama
//HOMEWORK motle kuidas lisada kellaajaaja leheljele + ; + ja kuidas seda tuua veebilehekuljele