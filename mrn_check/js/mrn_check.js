'use strict';
var data = {devero: null, sharepoint: null};
var mrn_file = {fileData:null};
var sp_file = {fileData:null};
var resetTable = document.getElementById("output_element").innerHTML;
var resetSpTable = document.getElementById("output_sp_element").innerHTML;

document.getElementById("mrn_file").addEventListener('change', function(e){
  ParseFileList(e.target.files[0], mrn_file);
});

document.getElementById("sp_file").addEventListener('change', function(e){
  ParseFileList(e.target.files[0], sp_file);
});

document.getElementById("csv_button").addEventListener('click', function(e){
  document.getElementById("output_element").innerHTML = resetTable;
  var count = 0;
  mrn_file.fileData.forEach(function(leTarget){
    var TestObj = {filter:false};
    //tests that must be passed
    if(document.getElementById("eight_mrn").checked) IsEightDigits(leTarget, TestObj);
    if(document.getElementById("cm-mcmg-medicare").checked) FilterCM(leTarget, TestObj);
    if(document.getElementById("referral_date").checked) FilterDate(leTarget, TestObj, "Devero");
    if(document.getElementById("kaiser-commercial").checked) FilterKaiser(leTarget, TestObj, "Devero");
    if (TestObj.filter === false){
      var tr = document.createElement("TR");
//if( (new Date(document.getElementById("date_input").value)).setHours(0,0,0,0) == (new Date(leTarget["Referral Date"])).setHours(0,0,0,0))
      for(var i=0;i<4;i++){
        var td = document.createElement("TD");
        var text;
        if(i==0)  text = document.createTextNode(leTarget.Patient);
          else if(i==1) text = document.createTextNode(leTarget["Ins MRN"]);
          else if(i==2) text = document.createTextNode(leTarget.Insurance);
          else if(i==3) text = document.createTextNode(leTarget["Referral Date"]);
        td.appendChild(text);
        tr.appendChild(td);
      }
      document.getElementById("output_element").appendChild(tr);
      ++count;
    }
  });
  document.getElementById("count1").innerHTML = count + " Patients Listed."
});

document.getElementById("sp_button").addEventListener('click', function(e){
  document.getElementById("output_sp_element").innerHTML = resetSpTable;
  var count = 0;
  sp_file.fileData.forEach(function(leTarget){
    var TestObj = {filter:false};
    var tr = document.createElement("TR");

    if(document.getElementById("referral_date").checked) FilterDate(leTarget, TestObj, "Sharepoint");
    if(TestObj.filter === false){
      for(var i=0;i<4;i++){
        var td = document.createElement("TD");
        var text;
        if(i==0)  text = document.createTextNode(leTarget["Patient Name"]);
          else if(i==1) text = document.createTextNode(leTarget.MRN);
          else if(i==2) text = document.createTextNode(leTarget["Care Coordinator"]);
          else if(i==3) text = document.createTextNode(leTarget["Referral Date"]);
        td.appendChild(text);
        tr.appendChild(td);
      }
      document.getElementById("output_sp_element").appendChild(tr);
      ++count;
    }
  });
    document.getElementById("count2").innerHTML = count + " Patients Listed."
});

document.getElementById("reset_table_button").addEventListener('click', function(e){
  document.getElementById("output_element").innerHTML = resetTable;
});

document.getElementById("reset_sp_table_button").addEventListener('click', function(e){
  document.getElementById("output_sp_element").innerHTML = resetSpTable;
});

document.getElementById("compare_button").addEventListener('click', function(e){
  if(mrn_file.fileData == null || sp_file.fileData == null) alert("missing file to compare");
    else if(document.getElementById("referral_date").checked){
      var devero_count = 0, sp_count = 0, discrepancy = 0;
      mrn_file.fileData.forEach(function(leTarget){
        if( new Date(leTarget["Referral Date"]).setHours(0,0,0,0) != new Date(document.getElementById("date_input").value).setHours(0,0,0,0) ); //do nothing, else
          else{
            var foundMatch = false;
            ++devero_count;
            for(var i=0; i<sp_file.fileData.length; i++){
              if(Number(leTarget["Ins MRN"]) == Number(sp_file.fileData[i].MRN) || leTarget["Ins MRN"] == sp_file.fileData[i].MRN){
                foundMatch =true;
                break;
              }
            }
            if(foundMatch == false){
              console.log("No matching MRN (" +leTarget["Ins MRN"]+") for: " + leTarget.Patient)
            }
          }
      });
      //get the referral date and compare those only.
      //"x devero files found"
      //"y sharepoint files found"
      //start from lower file # & List difference via mrn.
      //if 0 on list " no different MRNS found."
      console.log("Devero: "+devero_count+". Sharepoint: "+sp_count+". Discrepancies: "+discrepancy+".")
    } else alert("referral date filter not checked.")
});

function ParseFileList(fileReference, file){
	var reader = new FileReader();
	reader.onload = function(){
		file.fileData = d3.csvParse(reader.result);
	 	console.log("Referrals Loaded.");
	}
	reader.readAsText(fileReference, 'utf8');
}

function IsEightDigits(leTarget, filtered){
  if (leTarget["Ins MRN"].length == 8) filtered.filter = true;
}
function FilterCM(leTarget, filtered){
  if(leTarget.Insurance == "Caremore Commercial" || leTarget.Insurance == "Caremore Medicare" || leTarget.Insurance == "Memorial Care Medical Grp" || leTarget.Insurance == "Medicare")
    filtered.filter = true;
}

function FilterDate(leTarget, TestObj){
  if( new Date(leTarget["Referral Date"]).setHours(0,0,0,0) != new Date(document.getElementById("date_input").value).setHours(0,0,0,0) ) TestObj.filter = true;
}

function FilterDate(leTarget, TestObj, sourceData){
  switch(sourceData){
    case "Sharepoint":
      if( new Date(leTarget["Referral Date"]).setHours(0,0,0,0) != new Date(document.getElementById("date_input").value).setHours(0,0,0,0) ) TestObj.filter = true;
      break;
    case "Devero":
      if( new Date(leTarget["Referral Date"]).setHours(0,0,0,0) != new Date(document.getElementById("date_input").value).setHours(0,0,0,0) ) TestObj.filter = true;
      break;
    default:
  }
}

function FilterKaiser(leTarget, TestObj, sourceData){
  switch(sourceData){
    case "Devero":
      //if( leTarget.kaiser != commertial) filter = true;
      break;
    case "Sharepoint":
      break;
    default:
  }
}
