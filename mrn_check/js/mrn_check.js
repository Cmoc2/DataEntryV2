'use strict';

var mrn_file, sp_file;
var resetTable = document.getElementById("output_element").innerHTML;

document.getElementById("mrn_file").addEventListener('change', function(e){
  ParseFileList(e.target.files[0]);
});

document.getElementById("csv_button").addEventListener('click', function(e){
  mrn_file.forEach(function(leTarget){
    if (leTarget["Ins MRN"].length == 8); else{
      var tr = document.createElement("TR");
      for(var i=0;i<3;i++){
        var td = document.createElement("TD");
        var text;
        if(i==0)  text = document.createTextNode(leTarget.Patient);
          else if(i==1) text = document.createTextNode(leTarget["Ins MRN"]);
          else if(i==2) text = document.createTextNode(leTarget.Insurance);
        td.appendChild(text);
        tr.appendChild(td);
      }
      document.getElementById("output_element").appendChild(tr);
    }
  });
});

document.getElementById("reset_table_button").addEventListener('click', function(e){
  document.getElementById("output_element").innerHTML = resetTable;
});
function ParseFileList(fileReference){
	var reader = new FileReader();
	reader.onload = function(){
		mrn_file = d3.csvParse(reader.result);
	 	console.log("Referrals Loaded.");
	}
	reader.readAsText(fileReference, 'utf8');
}
