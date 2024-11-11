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
//paroolide krupteerimine
const bcrypt = require("bcrypt");
//sessioonihaldur
const session = require("express-session"); 
//asunkroohsus
const asyn = require("async");


const app = express();


//Maaran view mootori
app.set("view engine", "ejs");
//Maaran jagate avalikke failde kausta
app.use(express.static("public"));
//kasutame bodyparserit paringute parsemiseks(kui aunlt tekst,siis false, kui ka pildid jms siis true)
app.use(bodyparser.urlencoded({extended:true}));
//seadistame fotode uleslaadimiseks vahevara middleware mis maarab kataloogi multeri kuhu laetakse. Middleware rakendamine ja seadistamine
const upload = multer({dest:"./public/gallery/orig"});

//sessiooni osa haldur
app.use(session({secret:"mySecretKey", saveUninitiliazed: true, resave: true}));
let mySession;

//loon db uhenduse
const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
});

//sisselogimine
app.get("/", (req,res)=>{
	//res.send("express laks kaima!");
	//console.log(dbInfo.configData.host);
	res.render("index");
});

//logout
app.get("/logout", (req,res)=>{
	req.session.destroy();
	mySession = null; //tuhi
	res.redirect("/");
});


app.post("/", (req,res)=>{
	let notice = null; //tuhjus
	if(!req.body.emailInput || !req.body.passwordInput){
		console.log("ok");
		notice = "Sisselogimise andmed puudu";
		res.render("index", {notice:notice});
	} else {
		let sqlReq = "SELECT id, password FROM vp24users WHERE email = ?";
		conn.ecexute(sqlReq,[req.body.emailInput] ,(err,result)=> {
			if(err) {
				console.log("oi..52line::))))");
		        notice="Tehnilise vea tottu ei saa sisselogida..";
				console.log(err);
		        res.render("index",{notice: notice});
			} else {
				//console.log();
				if(result[0] !=null){
					//raside kontrollimine
					bcrypt.compare(req.body.passwordInput, result[0].password, (err,compareresult)=> {
						if(err) {
							notice = "Parool on vale."
							res.render("index",{notice: notice});
						} else {
							//kui vorlustulemus on positiivne
							if(compareresult == true){
								notice = "Oled sisselogitud.";
								//SESSIOON KASUTUSEL
								mysession = req.session;
								mySession.userId = result[0].id;
								res.redirect("/home");
							} else {
								notice = "Ei ole sisselogitud. Paool ja kasutajatunnus on vigane";
								res.render("index",{notice: notice});
							}
						}
					});
				} else {
					notice = "Parool voi kasutajatunnus on vigane";
					res.render("index",{notice: notice});
					
				}
			}
		});
	}
});



//home
app.get("/home", checkLogin, (req,res)=>{
	res.render("home");
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
app.get("/eestifilm/lisaseos",(req,res)=>{
	//async moodul, paneme mitmu andmebaasiparingut paralleelselt toimima
	//loome sql paringute (funktsioonide) loenduri
	const myQueries = [
		function(callBack){
			conn.execute("SELECT id,first_name,last_name,birth_date FROM person",(err,result)=>{
				if(err) {
					return callBack(err);
				} else {
					return callBack(null,result);
				}
			});
		},
		function(callBack){
			conn.execute("SELECT id,title,production_year from movie",(err,result)=>{
				if(err) {
					return callBack(err);
				} else {
					return callBack(null,result);
				}
			});
		},
		function(callBack){
			conn.execute("SELECT id,position_name from position",(err,result)=>{
				if(err) {
					return callBack(err);
				} else {
					return callBack(null,result);
				}
			});
	];
	//paneme tegevused paralleelselt toole, tulemuse saab siis kui on tehtud
	//valjundiks uks koondlist
	asyn.parallel(myQueries, (err,results) => {
		if(err){
			throw err;
		} else {
			console.log(results);
			res.render("addrelations",{personList:results[0]},{movieList:results[1]}),{positionList:result[2]});
		}
	}
	/* let sqlReq = "SELECT id,first_name,last_name,birth_date FROM person";
	conn.execute(sqlReq,(err,result)=>{
		if(err){
			throw err;
		}
	} else {
		//console.log(result);
		res.render("addrelations,{personList:result});
	}); */
});

app.post("addrelations",(req,res)=>{
	let sqlReq = "SELECT first_name,last_name,birth_date FROM person";
}


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
app.get("/eestifilm/personrelations/:id", (err,result) =>{
	console.log(req.params.id);
	res.render("personrelations");
});

//tuua tegelase seoseid
app.post("personrelations", (err,results) =>{
	let sqlReq = "SELECT person.id, movie.id,postion.id FROM person_in_movie ";
	conn.execute(sqlReq, (err,result){
		if(err){
			throw err;
		} else {
			console.log(results);
			res.render("personrelations",{personrelations:results});
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
app.get("/gallery", (req, res) => {
    let sqlReq = "SELECT id, file_name, alt_text, privacy FROM vp_2024 WHERE privacy = ? AND deleted IS NULL ORDER BY id DESC";
    const privacy = 3;
    conn.execute(sqlReq, [privacy], (err, result) => {
        if (err) {
            throw err;
        } else {
            let photolist = [];
			for(let i = 0, i < result.length, i++) {
				photolist.push({id: result[i].id ,href: "/gallery/thumb/",filename:result[i].file_name, alt: result[i].alt_text });
			}
            });
            res.render("gallery", { listData: photoList });
        }
    });
});

app.get("/signup", (req, res) => {
	res.render("signup");
});



app.post("/signup", (req, res) => {
	let notice="Ootan andmeid..";
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.birtDateInput || !req.body.genderInput || req.body.passwordInput.len <= 8 || req.body.passwordInput !== req.body.confirmPaswwordInput ){
		console.log("oi..");
		notice="Andmed on puudud..";
		res.render("signup",{notice: notice});
		} else {
			notice="Andmed on korras";
			bcrypt.genSalt(10,(err,salt)=>{
				if(err){
					notice = "Tehniline viga. Kasutaja pole loodud";
					res.render("signup",{notice: notice});
				} else {
					bcrypt.hash(req.body.passwordInput, salt, (err,pwdHash)=>{
					if(err){
						notice = "Tehniline viga. Kasutaja pole loodud";
					    res.render("signup",{notice: notice});
					} else {
						let sqlReq = "INSERT into vp24users (first_name, last_name, birth_date, gender, email, password) VALUES (?,?,?,?,?,?)";
						conn.execute(sqlReq[req.body.firstNameInput,req.body.lastNameInput,req.body.birtDateInput,req.body.genderInput, req.body.emailInput, pwdHash], (err,result)=>{
							if(err){
								notice = "Tehniline viga andmebaasi kirjutamisel ja parooli krupteerimisel.Line 283.";
					            res.render("signup",{notice: notice});
							} else {
								notice = "Kasutaja nimega " + req.body.emailInput + " on loodud.";
					            res.render("signup",{notice: notice});
							}
						});
					}
					});			
				}
			});
		    //res.render("signup"{notice: notice});
		}
	//res.render("signup");
});

function checkLogin(req,res,next) {
	if(mySession != null){
		if(mySession.userId:true){
			next();
		} else {
			notice = "Sellist kasutajat pole";
			res.redirect("/");
		}
	}
	else {
		res.redirect("/");
	}
} 

//sessioon



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
