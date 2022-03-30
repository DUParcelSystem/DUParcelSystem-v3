require('dotenv').config();

document.getElementById("windowtitle").innerHTML = process.env.COLLEGE;
document.getElementById("title").innerHTML = process.env.COLLEGE;

document.getElementById("version").innerHTML = "App Version: " + process.env.APP_VERSION;