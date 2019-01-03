function SetCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function GetCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function CheckCookie() {
    var user = GetCookie("username");
    if (user != "") {
        //alert("Welcome again " + user);
        DocID('user-name').innerHTML = GetCookie("username");
        DocID('e-mail').innerHTML = GetCookie("email");

        document.body.style.background = GetCookie("background");
        document.body.style.backgroundSize = "cover";
      	document.body.style.backgroundPosition = "center";
      	document.body.style.backgroundAttachment="fixed";
    } else {
      /* user = prompt("Please enter your name:", "");
        if (user != "" && user != null) {
            setCookie("username", user, 365);
        }
      */
    }
}
