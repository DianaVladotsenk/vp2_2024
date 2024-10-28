const express = require("express");
//const dateTime = require("./datetime");
const fs = require("fs");
const bodyparser = require("body-parser");
//database
const dbInfo = require("../../vp2024config");
//db suhtlemine
const mysql = require("mysql2");
//fotode uleslaadimiseks 
const multer = require("multer");
//failide suuruse muutmine
const sharp=require("sharp"); 



const app = express();

//Maaran view mootori
app.set("view engine", "ejs");
//Maaran jagate avalikke failde kausta
app.use(express.static("public"));
//kasutame bodyparserit paringute parsemiseks(kui aunlt tekst,siis false, kui ka pildid jms siis true)
app.use(bodyparser.urlencoded({extended:true}));
//seadistame fotode uleslaadimiseks vahevara middleware mis maarab kataloogi multeri kuhu laetakse. Middleware rakendamine ja seadistamine
const upload = multer({dest:"./public/gallery/orig"});

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


app.get("/regvisitdb", (req,res)=>{
	let notice = "";
	let first_name="";
	let last_name="";
	res.render("reqvisitdb", {notice:notice, firstName: first_name, lastName:last_name});
});

app.post("regvisitdb", (req,res)=>{
	let notice = "";
	let firstName="";
	let lastName="";
	if(!req.body.firstNameInput || !req.body.lastNameInput){
       //console.log("Osa anmdeid puudu");
	   notice = "Osa anmdeid puudu";
	   firstName = req.body.firstNameInput;
	   lastName = req.body.lastNameInput;
	   res.render("reqvisitdb", {notice:notice, firstName: firstName, lastName:lastName});
	} else {
	       let sqlReq = "INSERT INTO vp2visitlog (first_name, last_name) VALUES (?,?)";
	         conn.query(sqlReq, [req.body.firstNameInput, req.body.lastNameInput],(err,sqlRes)=>{
		   if (err){
			   notice = "Thenilistel pohjustel andmeid ei salvestati";
			   res.render("reqvisitdb", {notice:notice,firstName: firstName, lastName:lastName});
			   throw err;
		   } 
		   else {
			    notice = "Andmeid salvestati";
			 //res.render("reqvisitdb", {notice:notice, firstName: firstName, lastName:lastName});
			 res.redirect("/");
		   }
	   });
	}
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

//addperson
app.get("/eestifilm/lisa",(req, res) => {
	res.render("addperson");
});

//filmitegelane lisamine
app.post('/addperson', (req, res) => {
    if (req.body.personSubmit) {
        const personName = req.body.personName;
        console.log(`Lisatud tegelane: ${personName}`);
        res.redirect('/');
    }
});

//filmi lisamine
app.post('/addFilm', (req, res) => {
    if (req.body.filmSubmit) {
        const filmTitle = req.body.filmTitle;
        console.log(`Lisatud film: ${filmTitle}`);
        res.redirect('/');
    }
});

//role lisamine
app.post('/addRole', (req, res) => {
    if (req.body.roleSubmit) {
        const roleName = req.body.roleName;
        console.log(`Lisatud roll: ${roleName}`);
        res.redirect('/');
    }
});

app.get("/photoupload",(req, res) => {
	res.render("photoupload");
});

app.post("/photoupload", upload.single("photoInput"),(req,res)=>{
	//console.log(req.body);
	//console.log(req.file);
	const fileName = "vp_" + Date.now() + ".jpg";
	fs.rename(req.file.path, req.file.destination + "/"  + fileName, (err)=>{
		console.log("faili muutmise viga:" + err);
	});
	sharp(req.file.destination + "/"  + fileName).resize(800,600).jpeg({quality:90}).toFile("./public/gallery/normal/" + fileName);
	sharp(req.file.destination + "/"  + fileName).resize(100,100).jpeg({quality:90}).toFile("./public/gallery/thumb/" + fileName);
	//salvestamie info andmebaasi
	let sqlReq = "INSERT INTO vp_2024 (file_name, orig_name, alt_tekst, privacy, user_id) VALUES (?,?,?,?,?))";
	const user_id = 1;
	conn.query(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, user_id], (err,result)=>{
		if(err){
			throw (err);
	} else {
		res.render("photoupload");
	}
	});
	//res.render("photoupload");
});

//galerii
app.get("/gallery", (req,res)=>{
	let sqlReq = "SELECT file_name,alt_tekst, privacy FROM vp_2024 WHERE privacy==? AND deleted is NULL ORDER BY id DESC)";
	const privacy = 3;
	conn.query(sqlReq, [privacy], (err,result)=>{
		if(err) {
			throw(err);
		} else {
			console.log(result);
		result.forEach(photo)=>{
			photolist.push({href:"/gallery/thumb/" + result.file_name ,alt:photo.alt_text});
		}
		res.render("gallery")};
})});




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