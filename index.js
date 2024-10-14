const express = require("express");
//const dateTime = require("./datetime");
const fs = require("fs");
const bodyparser = require("body-parser");
//database
const dbInfo = require("../../vp2024config");
//db suhtlemine
const mysql = require("mysql2");



const app = express();

//Maaran view mootori
app.set("view engine", "ejs");
//Maaran jagate avalikke failde kausta
app.use(express.static("public"));
//kasutame bodyparserit paringute parsemiseks(kui aunlt tekst,siis false, kui ka pildid jms siis true)
app.use(bodyparser.urlencoded({extended:false}));

//loon db uhenduse
const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
});


app.get("/", (req,res)=>{
	//res.send("express laks kaima!");
	//console.log(dbInfo.configData.host);
	res.render("index");
});
//app.get("/timenow",(req,res)=>{
	//const weekDayEtNow  = dateTime.dayNamesEt()
	//const dateEtNow = dateTime.dateFormatted();
	//const timeNow =  dateTime.timeFormattedNow();
	//res.render("timenow", {nowWD: weekdayEtNow, nowD: dateNow, nowT: timeNow});
//});
//<li><a href = "/timenow">Avalehele</a></li>
//node.ejs <ul>
//<li>Nadalapaev: <%= nowWD %></li>
//<li>Kuupaev: <%= nowD %> </li>
//<li>Kellaaeg: <%= nowWT %></li>
//</ul>

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
});

app.post("/regvisit", (req, res) => {
    const now = new Date();
    const dateTimeString = now.toLocaleString(); 
    const logEntry = `${req.body.firstNameInput} ${req.body.lastNameInput} - ${dateTimeString};`;

    fs.open("public/textfiles/log.txt", "a", (err, file) => {
        if (err) {
            throw err;
        } else {
            fs.appendFile("public/textfiles/log.txt", logEntry, (err) => {
                if (err) {
                    throw err;
                } else {
                    console.log("Entry added to log");
                    res.render("regvisit");
                }
            });
        }
    });
});

app.get("/visitlog", (req, res) => {
    fs.readFile("public/textfiles/log.txt", "utf8", (err, data) => {
        if (err) {
            res.render("visitlog", { visitEntries: [] });
        } else {
            const visitEntries = data.split(";\n").filter(entry => entry); 
            res.render("visitlog", { visitEntries: visitEntries });
        }
    });
});


//filmid
app.get("/eestifilm",(req, res) => {
	res.render("eestifilm");
});

app.get("/eestifilm/tegelased",(req, res) => {
	//res.render("tegelased");
	//andmebaasilugemine. Loon anmdbevaasi paringut
	let sqlReq = "SELECT first_name,last_name,birth_date FROM person";
	conn.query(sqlReq, (err,sqlRes)=> {
		if (err) {
			res.render("tegelased", {persons: {first_name:"Pole", last_name:"leidnud", birth_date: "viga."}});
		} else {
			//console.log(sqlRes);
			res.render("tegelased", {persons: sqlRes});
	}});
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