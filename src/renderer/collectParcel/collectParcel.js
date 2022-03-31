// const addPackageFirebase = require('../readNFC.js');
const { database } = require('../readJSON.js');
const { getOneStuAllUncollectedPackages } = require('../firebase.js');
const { ipcRenderer } = require("electron")
require('dotenv').config();


ipcRenderer.on('nfc-connected-main', function (event, message) {
    console.log("NFC connected from main", message);
})



document.getElementById("windowtitle").innerHTML = process.env.COLLEGE;
document.getElementById("title").innerHTML = process.env.COLLEGE;




// search cis and show uncollected packages of that student
document.getElementById('searchCISForm').addEventListener("submit", async function (event) {
    event.preventDefault();

    searchCIS = document.getElementById('searchCISSearchBox').value

    if (database[searchCIS] == null) {
        console.log("No such user");

        // show things about no such user

        return
    }


    const uncollectedPackages = await getOneStuAllUncollectedPackages(searchCIS)

    console.log(uncollectedPackages);


    // get student cis and parcel details



});


function cannotFindPackageToUncollected() {
    console.log('click');
}

