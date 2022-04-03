require('dotenv').config();

const { ipcRenderer } = require("electron")
ipcRenderer.send('viewParcelsPage')


console.log("hi, I am");

document.getElementById("windowtitle").innerHTML = process.env.COLLEGE;
document.getElementById("title").innerHTML = process.env.COLLEGE;


