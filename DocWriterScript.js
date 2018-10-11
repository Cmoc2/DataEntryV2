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
/* Section 1: Pre-Admit / Admit */

//Constants
const Sunday    = 0;
const Monday    = 1;
const Tuesday   = 2;
const Wednesday = 3;
const Thursday  = 4;
const Friday    = 5;
const Saturday  = 6;

//d3 code for dynamic button selections
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

var coordinator_data, soc_data, auth_data;

function ReadFiles(x){
	console.log(x);
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
DocName("Notes")[0].addEventListener("keypress", EnterKey);
DocName("Patient")[0].addEventListener("keypress", PatientEnterKey);
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
			alert('No File Chosen');
			console.log(TypeError);
		}
	}
	//Path B: Patient Name
	else{
		DocID("patientInputCode").innerHTML = "";
		DocID("patientName").innerHTML = DocName("Patient")[0].value;
	}
}
function SubmitDiscipline(){
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
		DocID("CCCode").innerHTML = "<green>CC Found.</green>";
		if(patient["Care Coordinator"] == "") DocID("patientInputCode").innerHTML += "<red> Verify CC.</red>"
		if(patient["Chart Status"] == "Admitted" || patient["Chart Status"] =="Transfer") DocID("admitButton").click();
			else if (patient["Chart Status"] =="Pre-Admit") DocID("preAdmitButton").click();
		console.log("CC: " + patient["Care Coordinator"]);
		DocID("cc-name").innerHTML = patient["Care Coordinator"] + ".";
	} else{
		console.error("CC Not Found.")
		DocID("CCCode").innerHTML = "<red> CC Not Found.</red>";
	}
}
//1956
function OutputAuthorization(deveroID){
	var patient = ParseDeveroID(auth_data, deveroID);
	if(patient != null){
		console.log('Auth Start:' + patient["Auth Start Date"])
		console.log('Auth End:' + patient["Auth End Date"])
	} else{
		console.error("Auth Dates Not Found");
	}
}

function OutputSOCDate(deveroID){
	var patient = ParseDeveroID(soc_data, deveroID);
	if(patient != null){
		DocID("SOCCode").innerHTML = "<green>SOC Found.</green>";
		DocName("SOCDate")[0].value = String(patient["Start of Care Date"]);
		DocID("SOCDate").innerHTML = patient["Start of Care Date"];
		console.log("Patient #" + deveroID + ": " + patient.Patient);
		console.log("SOC " + patient["Start of Care Date"]);
	} else {
		console.error("SOC Date not found");
		DocID("SOCCode").innerHTML = "<red> SOC Not Found.</red>";
	}
}

function PatientEnterKey(){
	if(event.keyCode == 13) SubmitPatientName();
}

function UpdateSignature(){
	DocID('user-name').innerHTML= DocID('user')[DocID('user').selectedIndex].innerHTML
	DocID('e-mail').innerHTML = DocID("user").value;
}

new ClipboardJS('.copyTrigger');
