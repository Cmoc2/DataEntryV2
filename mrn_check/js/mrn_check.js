'use strict';
var data = {deveroData: null, sharepointData: null};
var mrn_file = {fileData:null}, sp_file = {fileData:null};
var resetTable = document.getElementById("output_element").innerHTML;
var resetSpTable = document.getElementById("output_sp_element").innerHTML;
var resetDiscrepanciesTable = document.getElementById("output_discrepancies_element").innerHTML;

document.getElementById("mrn_file").addEventListener('change', function(e){
  ParseFileList(e.target.files[0], mrn_file);
});
document.getElementById("sp_file").addEventListener('change', function(e){
  ParseFileList(e.target.files[0], sp_file);
});
document.getElementById("csv_button").addEventListener('click', function(e){
  document.getElementById("output_element").innerHTML = resetTable;
  var count = 0, columns = 4;
  if(document.getElementById("kaiser-commercial").checked){
    var header = document.createElement("TH");
    header.appendChild(document.createTextNode("Insurance"));
    document.querySelector("tr").appendChild(header);
    columns=5;
  }
  try{
    mrn_file.fileData.forEach(function(leTarget){
      var TestObj = {filter:false};
      //tests that must be passed
      if(document.getElementById("eight_mrn").checked) IsEightDigits(leTarget, TestObj);
      if(document.getElementById("cm-mcmg-medicare").checked) FilterCM(leTarget, TestObj);
      if(document.getElementById("referral_date").checked) FilterDate(leTarget, TestObj, "Devero");
      if(document.getElementById("kaiser-commercial").checked){
        FilterKaiser(leTarget, TestObj, "Devero");
      }
      if(document.getElementById("caremore-commercial").checked) FilterCmErrors(leTarget, TestObj, "Devero");
      if(document.getElementById("dob-PCP").checked) Show_DoB_PcP(leTarget, TestObj, "Devero");
      //once all the tests have been done, did it get through the filters?
      if (TestObj.filter === false){
        var tr = document.createElement("TR");
        tr.setAttribute("class", 'row');
        tr.data = leTarget;
        for(var i=1;i<=columns;i++){
          var td = document.createElement("TD");
          var text;
          if(i==1)  text = document.createTextNode(leTarget.Patient);
            else if(i==2) text = document.createTextNode(leTarget["Ins MRN"]);
            else if(i==3) text = document.createTextNode(leTarget.Insurance);
            else if(i==4) text = document.createTextNode(leTarget["Referral Date"]);
            else if(i==5) text = document.createTextNode(leTarget["Primary Insurance Comments"]);
          td.appendChild(text);
          tr.appendChild(td);
        }
        document.getElementById("output_element").appendChild(tr);
        ++count;
      }
    });
  } catch(e){
    console.error(e);
    alert("var mrn_file error.");
  }
  document.getElementById("count1").innerHTML = count + " Patients Listed."
});
document.getElementById("sp_button").addEventListener('click', function(e){
  document.getElementById("output_sp_element").innerHTML = resetSpTable;
  var count = 0;
  sp_file.fileData.forEach(function(leTarget){
    var TestObj = {filter:false};
    var tr = document.createElement("TR");
    tr.setAttribute("class", 'row');
    tr.data = leTarget;
    if(document.getElementById("referral_date").checked) FilterDate(leTarget, TestObj, "Sharepoint");
    if(TestObj.filter === false){
      for(var i=0;i<4;i++){
        var td = document.createElement("TD");
        var text;
        if(i==0)  text = document.createTextNode(leTarget["Patient Name."]);
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
document.getElementById("reset_discrepancies_table_button").addEventListener('click', function(e){
  document.getElementById("output_discrepancies_element").innerHTML = resetDiscrepanciesTable;
});
document.getElementById("compare_button").addEventListener('click', function(e){
  document.getElementById("output_discrepancies_element").innerHTML = resetDiscrepanciesTable;
  if(mrn_file.fileData == null || sp_file.fileData == null) alert("missing file to compare");
    else if(document.getElementById("referral_date").checked){
      var devero_count = 0, sp_count = 0, discrepancy = 0;
      mrn_file.fileData.forEach(function(leTarget){
        if( new Date(leTarget["Referral Date"]).setHours(0,0,0,0) != new Date(document.getElementById("date_input").value).setHours(0,0,0,0) ); //do nothing, else
          else{
            var foundMatch = false;
            ++devero_count;
            for(var i=0; i<sp_file.fileData.length; i++){
              if( //if MRNs and Referral dates match
                (  Number(leTarget["Ins MRN"]) == Number(sp_file.fileData[i].MRN)
                  || leTarget["Ins MRN"] == sp_file.fileData[i].MRN
                ) && new Date(leTarget["Referral Date"]).setHours(0,0,0,0) == new Date(sp_file.fileData[i]["Referral Date"]).setHours(0,0,0,0)
              ){
                foundMatch =true;
                break;
              }
            }
            if(foundMatch == false){
              console.log("No matching MRN (" +leTarget["Ins MRN"]+") for: " + leTarget.Patient);
              var tr = document.createElement("TR");
              tr.data = leTarget;
              tr.setAttribute("class", 'row');
              for(var i=0;i<4;i++){
                var td = document.createElement("TD");
                var text;
                if(i==0)  text = document.createTextNode(leTarget.Patient);
                  else if(i==1) text = document.createTextNode('');
                  else if(i==2) text = document.createTextNode(leTarget["Ins MRN"]);
                  else if(i==3) text = document.createTextNode(leTarget["Referral Date"]);
                td.appendChild(text);
                tr.appendChild(td);
              }
              discrepancy++;
              document.getElementById("output_discrepancies_element").appendChild(tr);
            }
          }
      });
      document.getElementById("count3").innerHTML = "Devero: "+devero_count+". Sharepoint: "+sp_count+". Discrepancies: "+discrepancy+".";
    } else alert("referral date filter not checked.")
});

document.addEventListener('click', function(e){
  //check if a table cell is clicked. if so, display additional data.
  if(event.target.tagName == 'TD'){
    document.getElementById('info_name').innerHTML = e.target.parentNode.data.Patient;
    document.getElementById('info_age').innerHTML = e.target.parentNode.data.Age;
    document.getElementById('info_DoB').innerHTML = e.target.parentNode.data["DOB "];
    document.getElementById('info_DeveroMRN').innerHTML = Number(e.target.parentNode.data["MR#"]);
    document.getElementById('info_insurance').innerHTML = e.target.parentNode.data.Insurance;
    document.getElementById('info_MRN').innerHTML = e.target.parentNode.data["Ins MRN"];
    document.getElementById('info_insurance_comment').innerHTML = e.target.parentNode.data["Primary Insurance Comments"];
    if(e.shiftKey) console.log(e.target.parentNode.data);
  }
});

document.addEventListener('change', function(e){
  if(e.target.id=="mrn_file" || e.target.id=="sp_file"){
    e.target.labels[0].innerHTML = e.target.labels[0].children[0].outerHTML + e.target.files[0].name;
  }

  if(e.target.labels[0].className == "filter_options_label"){
    alert("Currently NOT working!\nUpdate coming eventually.");
  }

  console.log(e);
})

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
    case "Devero": //add a keyword in inruance comments, if there, filter pt bc insurance already checked.
      if(leTarget.Insurance != "Kaiser Foundation Health Plan Commercial")TestObj.filter = true;
      break;
    case "Sharepoint":
      break;
    default:
  }
}

function FilterCmErrors(leTarget, TestObj, sourceData){
  switch (sourceData) {
    case "Devero":
      TestObj.filter = true; //filter by default. If Caremore...
      if(leTarget.Insurance == "Caremore Medicare" && leTarget.Age < 65) TestObj.filter = false; //if medicare && under 65, show.
       else if(leTarget.Insurance == "Caremore Commercial" && leTarget.Age > 64) TestObj.filter = false; //else if commercial && over 64, show.
      break;
    case "Sharepoint":
      break;
    default:

  }
}

function Show_DoB_PcP(leTarget, TestObj, sourceData){
  switch (sourceData) {
    case "Devero":
      TestObj.filter = true;
      if (leTarget.Age == "" || leTarget["Referring Physician (Primary)"] == "") TestObj.filter = false;
    break;
    case "Sharepoint":
      break;
    default:
      alert("Something went wrong");
      console.error("Something went wrong in function Show_DoB_PcP().")
  }
}
