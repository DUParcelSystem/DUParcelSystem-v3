const { ipcRenderer } = require("electron")
require('dotenv').config();


ipcRenderer.send('settingsPage')


document.getElementById("windowtitle").innerHTML = process.env.COLLEGE;
document.getElementById("title").innerHTML = process.env.COLLEGE;


document.getElementById("version").innerHTML = "App Version: " + process.env.APP_VERSION;

