//"use strict";
//shorthand functions//
function DocID(id){ return document.getElementById(id); }
function DocName(name){	return document.getElementsByName(name);}
//*******************//

//toggles
var isAdmit = null;
var onBlur = true;  //toggle for automatic updating of individual fields


//individual variables
var notes_value = "";
var specialRate_selection = null;
var fileIn = document.getElementById("monkeyCSVInput");
var coordinator_data, soc_data, auth_data;
/* Section 1: Pre-Admit / Admit */

//Constants
const Sunday    = 0;
const Monday    = 1;
const Tuesday   = 2;
const Wednesday = 3;
const Thursday  = 4;
const Friday    = 5;
const Saturday  = 6;

//D3 code:
//dynamic button selections
d3.select("#preAdmitButton")
	.on("click", function(){
		d3.select(this)
            .transition().duration(500)
            .style("background-color", "blue");
        d3.select("#admitButton")
            .transition().duration(500)
            .style("background-color", "grey");
        d3.select("#patientInput")
            .transition().duration(300)
			.style("background-color", "#87CEEB");
        isAdmit = false;
        AdmitCheck();
    });

d3.select("#admitButton")
    .on("click", function(){
        d3.select(this)
            .transition().duration(500)
            .style("background-color", "green");
        d3.select("#preAdmitButton")
            .transition().duration(500)
            .style("background-color", "grey");
        d3.select("#patientInput")
            .transition().duration(300)
            .style("background-color", "#3CBC8D");
        isAdmit = true;
        AdmitCheck();
    });
// Section: Run after Body is loaded.
function OnDocLoad(){
	DocName("Notes")[0].addEventListener("keypress", EnterKey);
	DocName("Patient")[0].addEventListener("keypress", PatientEnterKey);

	window.addEventListener('resize', function(){
		if(window.innerWidth < 454){
			DocID('user-container').style.float = 'left';
		} else DocID('user-container').style.float = 'right';
	})

	new ClipboardJS('.copyTrigger');

	CheckCookie();

	d3.select('#UserFilePatient-container')
		.transition().duration(1000)
		.style("opacity", 1);

	d3.select('#template_visibility')
		.style("opacity", 0);
}

/* Section : Rate Selection*/
d3.select("#socRateButton")
    .on("click", function(){
        d3.select(this)
            .transition().duration(1000)
            .style("background-color", "red");
        d3.select("#socCancelButton")
            .transition().duration(500)
            .style("background-color", "grey");
        d3.select("#specialRateButton")
            .transition().duration(300)
            .style("background-color", "gray");
        d3.select("#specialRateTextid")
            .attr("hidden", true)
        specialRate_selection = "SOC Rate";
        SubmitRate();
    })

d3.select("#socCancelButton")
    .on("click", function(){
        d3.select(this)
            .transition().duration(1000)
            .style("background-color", "red")
            .transition().duration(1000)
            .style("background-color", "grey");
        d3.select("#socRateButton")
            .transition().duration(500)
            .style("background-color", "grey");
        d3.select("#specialRateButton")
            .transition().duration(300)
            .style("background-color", "gray");
        d3.select("#specialRateTextid")
            .attr("hidden", true);
        specialRate_selection = null;
        SubmitRate();
    })

d3.select("#specialRateButton")
    .on("click", function(){
        d3.select(this)
            .transition().duration(1000)
            .style("background-color", "red");
        d3.select("#socCancelButton")
            .transition().duration(500)
            .style("background-color", "grey");
        d3.select("#socRateButton")
            .transition().duration(300)
            .style("background-color", "gray");
        d3.select("#specialRateTextid")
            .transition().duration(500)
            .attr("hidden", null);
        specialRate_selection = "Special Rate";
        SubmitRate();
    })
/* Section: Discipline Selection */
d3.selectAll(".disciplineLabel")
	.on("click", function(){
		d3.selectAll(".disciplineLabel")
			.transition().duration(1000)
			.style("background-color", "#e1e1e1")
			.style("color", "#666");
		d3.select(this)
			.transition().duration(1000)
			.style("background-color", "#2098D1")
			.style("color", "white");
	})

function ReadFiles(x){
	if(x.length == 3){
		document.querySelector('label[for="monkeyCSVInput"]').style.background = "green";
		document.querySelector('label[for="monkeyCSVInput"]').innerHTML = x.length + " files";
	}	else{
		document.querySelector('label[for="monkeyCSVInput"]').innerHTML = x.length + " files";
		document.querySelector('label[for="monkeyCSVInput"]').style.background = "red";
	}
	if(x.length == 3 && DocID('user').value != ""){
		d3.select('#input-container2')
			.transition().duration(1000)
			.style("opacity", 1);
		d3.select('#template_visibility')
			.transition().duration(1000)
			.style("opacity", 1);
	} else{
		d3.select('#input-container2')
			.transition().duration(1000)
			.style("opacity", 0);
		d3.select('#template_visibility')
			.transition().duration(1000)
			.style("opacity", 0);
	}
	console.log(x);
	coordinator_data, soc_data, auth_data = null;
	for(var i=0; i<x.length;i++){
		ParseFileList(x[i], x[i].name);
	}
}

function ParseFileList(fileReference, fileName){
	var reader = new FileReader();
	reader.onload = function(){
		switch(fileName){
				case 'Authorization Details.csv':
					auth_data = d3.csvParse(reader.result);
				 	console.log("Authorizations Loaded.");
					break;
				case 'Care Coordinator Assignments.csv':
					coordinator_data = d3.csvParse(reader.result);
					console.log("Coordinators Loaded.");
					break;
				case 'ReferralReportSOC.csv':
					soc_data = d3.csvParse(reader.result);
					console.log('SOC Dates loaded');
					break;
				default:
					console.log("Unusual File name.");
		}
	}
	reader.readAsText(fileReference, 'utf8');
}

function PTCheck(discipline){
		//Add 24hr note if PT
		if(discipline == "PT"){
			DocID("PTnote").style.margin = '1em 0em 1em';
			DocID("PTnote").innerHTML = 'PLEASE MAKE SURE TO SEE PATIENT WITHIN 24 HOURS'
		} else{
			DocID("PTnote").innerHTML = '';
			DocID("PTnote").style.margin = '0em';
		}
}

function AdmitCheck(){
	switch(isAdmit){
		//if g, SOCDate variable added. Visits always added.
		case true:
			DocID("ifG").innerHTML = 'SoC Date: <input type="text" name="SOCDate" onblur="SubmitSOC()"><br>';
			DocID("isSOC").innerHTML = 'Case opened & SOC\'d ';
			break;
		case false:
			DocID("ifG").innerHTML = '';
			DocID("isSOC").innerHTML = 'Patient not yet SOC\'d';
			DocID("SOCDate").innerHTML = '';
			break;
		default:
			alert('Admit Color invalid input.');
	}
}

function SubmitPatientName(){
	var deveroID = Number(DocName("Patient")[0].value);
	//Path A: Devero ID
	if(Number.isInteger(deveroID)){
		try{
			OutputName(deveroID)
			OutputCoordinator(deveroID);
			OutputSOCDate(deveroID);
			OutputAuthorization(deveroID);
		} catch(TypeError){
			console.error('Must Choose 3 Files to Search by ID');
			console.log(TypeError);
			d3.select('#input-container2')
				.transition().duration(1000)
				.style("opacity", 0);
			d3.select('#template_visibility')
				.transition().duration(1000)
				.style("opacity", 0);
		}
	}
	//Path B: Patient Name
	else{
		DocID("CCCode").style.border = "1px none red";
		DocID("CCCode").innerHTML = "";
		DocID("SOCCode").innerHTML = "";
		DocID("SOCCode").style.border = "1px none red";
		DocID("patientName").innerHTML = DocName("Patient")[0].value;
		d3.select('#input-container2')
			.transition().duration(500)
			.style("opacity", 1);
		d3.select('#template_visibility')
			.transition().duration(500)
			.style("opacity", 1);
	}
}
function SubmitDiscipline(){
	document.querySelector('label[for="'
	+ document.querySelector('input[name="Discipline"]:checked').id
	+ '"]').click();
	//Trigger Updating of Auth Display
	if(Number.isInteger(Number(DocName("Patient")[0].value))){
		OutputAuthorization(Number(DocName("Patient")[0].value));
	}
	PTCheck(document.querySelector('input[name="Discipline"]:checked').value);
	DocID("discipline").innerHTML = document.querySelector('input[name="Discipline"]:checked').value;
}

function SubmitOrder(){
	var x ="";
	for(i=1; i < (DocName("Order").length-1); i++){
		if(DocName("Order")[i].checked == true){
			x += DocName("Order")[i].value;
		}
	}
	x += " " + DocName("Order")[DocName("Order").length-1].value;

	DocID("order").innerHTML = x;
	return x;
}
function SubmitVisits(){
	DocID("visits").innerHTML = DocName("Visits")[0].value;
}
function SubmitSOC(){
	DocID("SOCDate").innerHTML = DocName("SOCDate")[0].value;
}
function SubmitAuthorization(){
	document.getElementById("Auth").innerHTML = (DocName("Auth")[1].value =="" || DocName("Auth")[0].value == ""? " ": '- Authorized from ' + document.getElementsByName("Auth")[0].value + ' until ' + document.getElementsByName("Auth")[1].value);
}
function SubmitNotes(){
      if(onBlur==false){} else{
					//Note Submission handled in SubmitRate()
          SubmitRate();
      }
  }
function SubmitRecipient(){
	DocID("recipient").innerHTML = DocName("Recipient")[0].value;
}
function SubmitRate(){
      switch(specialRate_selection){
          case "SOC Rate":
              DocID("notes").innerHTML = DocName("Notes")[0].value;
              DocID("notes").innerHTML += "<br><span style='color: red;' >" + specialRate_selection + "</span><br>";
              break;
          case null:
							if(DocName("Notes")[0].value =="") DocID("notes").innerHTML = DocName("Notes")[0].value;
							else
              DocID("notes").innerHTML = DocName("Notes")[0].value + "<br>";
              break;
          case "Special Rate":
              DocID("notes").innerHTML = DocName("Notes")[0].value;
              DocID("notes").innerHTML += "<br><span style='color: red;' >" + DocID("specialRateTextid").value + "</span><br>";
              break;
      }
}

function SubmitAll(){
  if(isAdmit==null)alert("Select Admittion Status.")
  onBlur = true;
	if(Number.isInteger(Number(DocName("Patient")[0].value))){
		SubmitPatientName();
		SubmitDiscipline();
		SubmitOrder();
		SubmitVisits();
		SubmitAuthorization();
		SubmitNotes();
		SubmitRate();
		SubmitRecipient();
	} else {
		SubmitDiscipline();
		SubmitOrder();
		//SubmitVisits must be done after SubmitColor(id 'visit' & 'Auth' gets placed)
		SubmitVisits();
		SubmitAuthorization();
		SubmitNotes();
		SubmitRate();
		SubmitRecipient();
}
}

/*Helper Functions*/
function EnterKey(event){ //function to add a new line into the notes section.
	console.log(event.keyCode);
	if(event.keyCode == 13) DocName("Notes")[0].value += "<br>";
}

function ParseDeveroID(data, monkeyInput){
	for(var i = 0; i < data.length; i++){
		if(Number(data[i]["MR#"]) == monkeyInput){
			return data[i];
		}
	}
	return null;
}

function FindAuths(data, deveroID){
	var patientAuths = [];
	for(var i = 0; i < data.length; i++){
		if(Number(data[i]["MR#"]) == deveroID){
			patientAuths.push(data[i]);
		}
	}
	return patientAuths;
}

function PatientEnterKey(){ //Search Devero ID or output patient name on Enter press.
	if(event.keyCode == 13) SubmitPatientName();
}

function OutputName(deveroID){
	var patient = ParseDeveroID(coordinator_data, deveroID);
	if(patient != null){
		DocID("patientName").innerHTML = patient.Patient;
		console.log(patient.Patient);
	} else{
		console.error("Patient Not Found.")
	}
}
function OutputCoordinator(deveroID){
	var patient = ParseDeveroID(coordinator_data, deveroID);
	//On Match Found:
	if(patient != null){
		if(patient["Care Coordinator"] == ""){
			DocID("CCCode").style.border = "1px solid red";
			DocID("CCCode").innerHTML = "<red> Verify CC</red>";
		} else{
			DocID("CCCode").style.border = "1px solid green";
			DocID("CCCode").innerHTML = "<green>CC</green>";
		}
		if(patient["Chart Status"] == "Admitted" || patient["Chart Status"] =="Transfer")
		DocID("admitButton").click();
		else if (patient["Chart Status"] =="Pre-Admit") DocID("preAdmitButton").click();
		console.log("CC: " + patient["Care Coordinator"]);
		DocID("cc-name").innerHTML = patient["Care Coordinator"] + ".";
		if( patient["Care Coordinator"] == "Burneo, Doris") DocID("cc-name").innerHTML = "Noche, Klarizza.";
	} else{
		console.error("CC Not Found.")
		DocID("CCCode").innerHTML = "<red>CC</red>";
		DocID("CCCode").style.border = '1px solid red';
	}
}

function OutputAuthorization(deveroID){ //In Progress
	var patient = FindAuths(auth_data, deveroID);
	DocID('fromAuth_data').innerHTML = '';
	if(patient.length != 0 && document.querySelector('input[name="Discipline"]:checked') != null){
		console.log(patient);
		for(var i=0;i<patient.length;i++){
			var li = document.createElement('li');
			li.setAttribute('onclick','AuthSelect(this);');
			switch(document.querySelector('input[name="Discipline"]:checked').value){
				case 'PT':
				if(patient[i].Discipline =='PT/PTA'){
					li.innerHTML = patient[i].Discipline
						+ ', Remaining: '
						+ patient[i]["Visits Remaining"]
						+ ' - From: '
						+ patient[i]["Auth Start Date"]
						+ ' Until: '
						+ patient[i]["Auth End Date"];
					li.setAttribute('_start',patient[i]["Auth Start Date"]);
					li.setAttribute('_end',patient[i]["Auth End Date"]);
					DocID("fromAuth_data").appendChild(li);
				}
					break;
				case 'OT':
				if(patient[i].Discipline =='OT/COTA'){
					li.innerHTML = patient[i].Discipline
						+ ', Remaining: '
						+ patient[i]["Visits Remaining"]
						+ ' - From: '
						+ patient[i]["Auth Start Date"]
						+ ' Until: '
						+ patient[i]["Auth End Date"];
						li.setAttribute('_start',patient[i]["Auth Start Date"]);
						li.setAttribute('_end',patient[i]["Auth End Date"]);
					DocID("fromAuth_data").appendChild(li);
				}
					break;
				case 'RN':
				case 'LVN':
				case 'SN':
					if(patient[i].Discipline =='RN/LVN'){
						li.innerHTML = patient[i].Discipline
							+ ', Remaining: '
							+ patient[i]["Visits Remaining"]
							+ ' - From: '
							+ patient[i]["Auth Start Date"]
							+ ' Until: '
							+ patient[i]["Auth End Date"];
						li.setAttribute('_start',patient[i]["Auth Start Date"]);
						li.setAttribute('_end',patient[i]["Auth End Date"]);
						DocID("fromAuth_data").appendChild(li);
					}
					break;
				case 'ST':
					if(patient[i].Discipline =='ST'){
						li.innerHTML = patient[i].Discipline
							+ ', Remaining: '
							+ patient[i]["Visits Remaining"]
							+ ' - From: '
							+ patient[i]["Auth Start Date"]
							+ ' Until: '
							+ patient[i]["Auth End Date"];
						li.setAttribute('_start',patient[i]["Auth Start Date"]);
						li.setAttribute('_end',patient[i]["Auth End Date"]);
						DocID("fromAuth_data").appendChild(li);
					}
					break;
				case 'HHA':
				if(patient[i].Discipline =='HHA/HHA Hospice'){
					li.innerHTML = patient[i].Discipline
						+ ', Remaining: '
						+ patient[i]["Visits Remaining"]
						+ ' - From: '
						+ patient[i]["Auth Start Date"]
						+ ' Until: '
						+ patient[i]["Auth End Date"];
					li.setAttribute('_start',patient[i]["Auth Start Date"]);
					li.setAttribute('_end',patient[i]["Auth End Date"]);
					DocID("fromAuth_data").appendChild(li);
				}
					break;
				case 'MSW':
					if(patient[i].Discipline =='MSW/LCSW'){
						li.innerHTML = patient[i].Discipline
							+ ', Remaining: '
							+ patient[i]["Visits Remaining"]
							+ ' - From: '
							+ patient[i]["Auth Start Date"]
							+ ' Until: '
							+ patient[i]["Auth End Date"];
						li.setAttribute('_start',patient[i]["Auth Start Date"]);
						li.setAttribute('_end',patient[i]["Auth End Date"]);
						DocID("fromAuth_data").appendChild(li);
					}
					break;
				default:
			}
		}
	} else{
		console.error("Auth Dates Not Found");
	}
}

function OutputSOCDate(deveroID){
	var patient = ParseDeveroID(soc_data, deveroID);
	if(patient != null){
		DocID("SOCCode").innerHTML = "<green>SOC</green>";
		DocID("SOCCode").style.border = "1px solid green";
		try{
			DocName("SOCDate")[0].value = String(patient["Start of Care Date"])
			DocID("SOCDate").innerHTML = patient["Start of Care Date"];
			console.log("SOC " + patient["Start of Care Date"]);
		} catch(TypeError){
			DocID("SOCCode").innerHTML = "<blue>Pre-Admit.</blue>";
			console.error('DocName("SOCDate")[0] undefined. Is patient Preadmit?')
			console.error("SOC: " + patient["Start of Care Date"]);
			console.error(TypeError);
		}
	} else {
		console.error("SOC Date not found");
		DocID("SOCCode").innerHTML = "<red>SOC</red>";
		DocID("SOCCode").style.border = "1px solid red";
	}
}

 function AuthSelect(element){
	 var _date = new Date(element.getAttribute('_start'));
	 DocName("Auth")[0].value = _date.toISOString().split("T")[0];
	 _date = new Date(element.getAttribute('_end'));
	 DocName("Auth")[1].value = _date.toISOString().split("T")[0];
	 SubmitAuthorization();
 }

function UpdateSignature(user){
	if(coordinator_data == null || soc_data == null || auth_data == null){
		d3.select('#input-container2')
			.transition().duration(1000)
			.style("opacity", 0);
	} else{
		d3.select('#input-container2')
			.transition().duration(1000)
			.style("opacity", 1);
		d3.select('#template_visibility')
			.transition().duration(1000)
			.style("opacity", 1);
	}
	if(user.value == "Other"){
		DocID("user_dialog").open = true;
	}else{
	DocID("user_dialog").open = false;
	DocID('user-name').innerHTML= DocID('user')[DocID('user').selectedIndex].innerHTML;
	SetCookie("username", DocID('user')[DocID('user').selectedIndex].innerHTML, 365);
	DocID('e-mail').innerHTML = DocID("user").value;
	SetCookie("email", DocID("user").value, 365);
	}
}

function UserPrompt(formstuff){
	console.log(formstuff);
	DocID('user-name').innerHTML= formstuff._custom_user_name.value;
	SetCookie("username", formstuff._custom_user_name.value, 365);
	DocID('e-mail').innerHTML = formstuff._custom_email.value;
	SetCookie("email", formstuff._custom_email.value, 365);
	DocID("user_dialog").open = false;

	return false;
}

function ToggleSettings(){
	if(DocID("settings").open == true) DocID("settings").open = false;
	else DocID("settings").open = true;

}
function ChangeBG(background){
	switch(background.innerHTML){
		case "Comcare":
			document.body.style.background = "url(./images/lightFocusBrushBackground.jpg)";
			SetCookie("background", "url(./images/lightFocusBrushBackground.jpg)", 365);
			break;
		case "Halloween 2018":
			document.body.style.background = 'url(./images/halloween2018.jpg)';
			SetCookie("background", 'url(./images/halloween2018.jpg)', 365);
			break;
		case "Thanksgiving 2018":
			document.body.style.background = 'url(./images/thanksgiving2018.jpg)';
			SetCookie("background", 'url(./images/thanksgiving2018.jpg)', 365);
			break;
		case "Christmas 2018":
			document.body.style.background = 'url(./images/christmas2018.jpg)';
			SetCookie("background", 'url(./images/christmas2018.jpg)', 365);
			break;
		case "New Year 2019":
			document.body.style.background = 'url(./images/newYear2019.jpg)';
			SetCookie("background", 'url(./images/newYear2019.jpg)', 365);
			break;
		default:
			document.body.style.background = 'url(' + background.value + ')';
			SetCookie("background", 'url(' + background.value + ')', 365);
	}
	document.body.style.backgroundSize = "cover";
	document.body.style.backgroundPosition = "center";
	document.body.style.backgroundAttachment="fixed";
}
function test(x){
	console.log(x);
}
