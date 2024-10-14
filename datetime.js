 const dateFormatted = function(){
//function dateFormatted(){
 let timeNow = new Date();
 let dateNow = timeNow.getDate();
 let monthNow = timeNow.getMonth ();
 let yearNow = timeNow.getFullYear();
 const dayNamesEt =["pühapäev", "esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev"];
 let dayNow = timeNow.getDay();
 let hourNow = timeNow.getHours();
 let secNow = timeNow.getSeconds();
 let minuteNow = timeNow.getMinutes(); 
 const monthNamesEt = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];
//console.log("Täna on: "+ dateNow + "." + (monthNow + 1) + "." + yearNow);

 //let dateEt = dateNow + "." + monthNamesEt[monthNow] + "." + yearNow + "." + dayNamesEt[dayNow] + "." + hourNow + "." + minuteNow + "." + secNow;
 //return dateEt;
 return dateEt = dateNow + "." + monthNamesEt[monthNow] + "." + yearNow + "." + dayNamesEt[dayNow] + "." + hourNow + "." + minuteNow + "." + secNow;
 }

module.exports = {dateFormatted: dateEt,dayNamesEt: dayNow, timeFormattedNow:hourNow,minuteNow,secNow,monthNamesEt};
console.log("Praegu on" + dateEt);
//exports - ekspordib