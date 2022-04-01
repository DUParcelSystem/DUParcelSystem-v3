const { database } = require('../readJSON.js');
const { getOneStuAllUncollectedPackages } = require('../firebase.js');
const { ipcRenderer } = require("electron");
const fullName = require('fullname');
const { serverTimestamp } = require('firebase/firestore');


var pcUserName;
(async () => {
    pcUserName  = await fullName();
})();

ipcRenderer.on('nfc-connected-main', function (event, message) {
    document.getElementById("nfcReaderText").innerHTML = message
})

ipcRenderer.on('nfc-uid-main', function (event, uid) {
    console.log("renderer got uid: ", uid);

    // find cis name from uid
    // either firebase or search dict


    // showUncollectedPackages(searchCIS)
})


// search cis and show uncollected packages of that student
document.getElementById('searchCISForm').addEventListener("submit", async function (event) {
    event.preventDefault();

    searchCIS = document.getElementById('searchCISSearchBox').value

    if (searchCIS == '') {
        showStudInfo("N/A", "Waiting", "for", "student", "card")
        return

    } else if (database[searchCIS] == null) {
        // show things about no such user
        showStudInfo("N/A", "No such", "student", "Try", "again")
        document.getElementById("searchCISForm").reset()
        return
    }

    showUncollectedPackages(searchCIS)




});


function cannotFindPackageToUncollected() {
    console.log('click cannot find');
}

async function showUncollectedPackages(searchCIS) {

    const uncollectedPackages = await getOneStuAllUncollectedPackages(searchCIS)
    const uncollectedPackagesNum = uncollectedPackages.length
    document.getElementById("accordion").innerHTML = ''

    console.log(uncollectedPackages);

    var letterNum = 0;
    var parcelNum = 0;

    for (var i = 0; i < uncollectedPackagesNum; i++) {
        const packageInfo = uncollectedPackages[i]
        var packageType = packageInfo.type

        if (packageType == "Letter") {
            letterNum += 1;
            packageType = "Letter ✉️";
        } else if (packageType == "Parcel") {
            parcelNum += 1;
            packageType = "Parcel 📦";
        }

        var date = new Date()
        const unixNow = Math.floor(date.getTime()/1000)

        const times = {
            arrivedTime: packageInfo.arrivedTime.seconds,
            arrivedEmailSent: packageInfo.arrivedEmailSent.seconds,
            collectedTime: unixNow
        }

        for (const [time, unix] of Object.entries(times)) {

            const firebaseTime = unix * 1000

            const firebaseTimeMili = new Date(firebaseTime)
            const option = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: "numeric", minute: "numeric", hour12: true }
            const localTimeString = firebaseTimeMili.toLocaleString("en-GB", option)

            times[time] = localTimeString
        }

        var parcelNo = packageInfo.parcelNo
        var parcelNoShow = packageInfo.parcelNo

        if (parcelNo == null) {
            parcelNo = ''
            parcelNoShow = 'N/A'
        }

        var reminderEmails = packageInfo.reminderEmails

        if (reminderEmails == null){
            reminderEmails = "N/A"
        }

        document.getElementById("accordion").innerHTML += `
        <div class="card text-white bg-success mt-2">
            <div class="card-header btn btn-lin text-white" id="heading-${i}" data-bs-toggle="collapse" data-bs-target="#collapse-${i}"
            aria-expanded="true" aria-controls="collapse-${i}">
                <div class="container">
                    <div class="row">
                    <div class="col-sm-2 text-start">
                        <h4 class="card-title">${packageType}</h4>
                    </div>
                    <div class="col-sm-2 text-start">
                        <h4 class="card-title">${parcelNo}</h4>
                    </div>
                    <div class="col-sm-4 text-start">
                        <p class="card-text">Arrived on: <b>${times.arrivedTime}</b></p>
                    </div>
                    <div class="col-sm-4 text-end">
                        <button type="button" class="btn btn-danger" id="uncollect-${i}">Uncollect<p hidden>*${i}*</p></button>
                    </div>
                    </div>
                </div>
            </div>

            <div id="collapse-${i}" class="collapse" aria-labelledby="heading-${i}" data-parent="#accordion">
                <div class="card-body">
                    <div class="container">
                        <div class="row border-bottom border-dark">
                            <div class="col">
                                Type: ${packageType}
                                <br>
                                Parcel no: ${parcelNoShow}
                                <br>
                                Reminder emails: ${reminderEmails}
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">
                                Arrived date: ${times.arrivedTime}
                                <br>
                                Arrived by: ${packageInfo.arrivedBy}
                                <br>
                                Notified email sent: ${times.arrivedEmailSent}
                            </div>
                            <div class="col">
                                Collected date: ${times.collectedTime}
                                <br>
                                Given out by: ${pcUserName}
                                <br>
                                Collected: Yes
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`

    }

    const totalUncollectedPackageNum = parcelNum + letterNum
    document.getElementById("allUncollectedPackageTitle").innerText = `${totalUncollectedPackageNum} uncollected package(s)`

    showStudInfo(searchCIS, database[searchCIS].lName, database[searchCIS].fName, parcelNum, letterNum)

    addUncollectedListener(uncollectedPackages, uncollectedPackagesNum)



    // get student cis and parcel details


    // add event listener to button


    // update firebase with collected time, given out by, turn it to true


}

function addUncollectedListener(uncollectedPackages, uncollectedPackagesNum) {

    for (let i = 0; i < uncollectedPackagesNum; i++) {
        document.getElementById(`uncollect-${i}`).addEventListener("click", function (event) {
            let id = document.getElementById(`uncollect-${i}`).innerHTML.split('*')
            let arrayIndex = id[1]

            const packageInfo = uncollectedPackages[arrayIndex]

            console.log(packageInfo);

            // document.getElementById("modalText").innerHTML = `You have selected
            // <br>Name: <b>${studentInfo.email}</b>
            // <br>Type: <b>${studentInfo.type}</b>
            // <br>CIS: <b>${studentInfo.cis}</b>
            // `
            // showModal()

            // document.getElementById("modalStudInfo").innerHTML = `*${JSON.stringify(studentInfo)}*`

        });
    };

};


function showStudInfo(cis, fName, lName, numParcel, numLetter) {
    document.getElementById('cisText').innerText = cis
    document.getElementById('firstNameText').innerText = fName
    document.getElementById('lastNameText').innerText = lName
    document.getElementById('numberOfParcelText').innerText = numParcel
    document.getElementById('numberOfLetterText').innerText = numLetter
}


