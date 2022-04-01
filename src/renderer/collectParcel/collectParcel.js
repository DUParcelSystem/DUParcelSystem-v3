// const addPackageFirebase = require('../readNFC.js');
const { database } = require('../readJSON.js');
// const { getOneStuAllUncollectedPackages } = require('../firebase.js');
const { ipcRenderer } = require("electron")
const config = require('config');
const currentCollege = config.get('currentCollege');
const displayCollegeName = config.get('displayCollegeName');

document.getElementById("title").innerHTML = displayCollegeName;



ipcRenderer.on('nfc-connected-main', function (event, message) {
    document.getElementById("nfcReaderText").innerHTML = message
})

ipcRenderer.on('nfc-uid-main', function (event, uid) {
    console.log("renderer got uid: ", uid);
})





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

