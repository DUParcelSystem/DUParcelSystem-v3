const { database } = require('../readJSON.js');
const { getOneStuAllUncollectedPackages, updateFirebaseToCollected, updateFirebaseToUncollected, getRecentCollectedPackages } = require('../firebase.js');
const { ipcRenderer } = require("electron");
const fullName = require('fullname');

var searchCIS = ''
var uncollectedPackages = []
var totalUncollectedPackageNum = 0
var num = 0
var showPackagesId = []

var pcUserName;
(async () => {
    pcUserName = await fullName();
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


document.getElementById("cannotFindPackageModal").addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeModal()
    }
    if (event.key === "Enter") {
        event.preventDefault();
        cannotFindPackageToUncollected()
    }
})



function cannotFindPackageToUncollected() {

    let packageInfoText = document.getElementById("uncollectModalInfo").innerHTML.split('*')
    let packageInfo = JSON.parse(packageInfoText[1])
    let packageIndexText = document.getElementById("uncollectModalArrayIndex").innerHTML.split('*')
    let packageIndex = JSON.parse(packageIndexText[1])

    console.log(packageInfo);

    document.getElementById(`card-${packageIndex}`).style.display = "none";

    showCannotFindPackages(packageInfo)

    updateFirebaseToUncollected(packageInfo)

    closeModal()

}

function showCannotFindPackages(packageInfo) {

    const i = packageInfo.id
    var packageType = packageInfo.type

    if (packageType == "Letter") {
        packageType = "Letter ✉️";
    } else if (packageType == "Parcel") {
        packageType = "Parcel 📦";
    }

    times = {
        arrivedTime: packageInfo.arrivedTime.seconds,
        arrivedEmailSent: packageInfo.arrivedEmailSent.seconds,
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
    if (reminderEmails == null) {
        reminderEmails = "N/A"
    }

    document.getElementById("cannotFindContainer").style.display = "block"

    const untitle = document.getElementById("allUncollectedPackageTitle").innerText
    const untitleArray = untitle.split(" ")
    const unNum = parseInt(untitleArray[0]) - 1
    document.getElementById("allUncollectedPackageTitle").innerText = `${unNum} packages were just collected`

    const title = document.getElementById("cannotFindPackageTitle").innerText
    const titleArray = title.split(" ")
    num = parseInt(titleArray[0]) + 1
    document.getElementById("cannotFindPackageTitle").innerText = `${num} packages were just uncollected`

    document.getElementById("uncollectedPackages").innerHTML += `
        <div class="card text-dark bg-warning mt-2" id="card-${i}">
            <div class="card-header btn btn-lin text-dark" id="headingFind-${i}" data-bs-toggle="collapse" data-bs-target="#collapseFind-${i}"
            aria-expanded="true" aria-controls="collapseFind-${i}">
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
                        <button type="button" class="btn btn-success" id="cannotFind-${i}">Collected<p hidden>*${i}*</p></button>
                    </div>
                    </div>
                </div>
            </div>

            <div id="collapseFind-${i}" class="collapse" aria-labelledby="headingFind-${i}" data-parent="#accordion">
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
                                Collected date: N/A
                                <br>
                                Given out by: N/A
                                <br>
                                Collected: No
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`

}




async function showUncollectedPackages(searchCIS) {

    // get uncollected packages details for specific student
    showPackagesId = []
    num = 0
    const uncollectedPackages = await getOneStuAllUncollectedPackages(searchCIS)
    const uncollectedPackagesNum = uncollectedPackages.length
    document.getElementById("accordion").innerHTML = ''
    document.getElementById("uncollectedPackages").innerHTML = ''
    document.getElementById("cannotFindContainer").style.display = "none"
    document.getElementById("showCollectedPackages").style.display = "none"
    document.getElementById("allUncollectedPackageTitle").innerText = `0 packages were just collected`
    document.getElementById("cannotFindPackageTitle").innerText = `0 packages were just uncollected`

    console.log(uncollectedPackages);

    if (uncollectedPackages.length == 0) {
        document.getElementById("accordion").innerHTML = `<h1 class="mt-4 mb-3 text-center">All packages were collected</h1>`
    }

    var letterNum = 0;
    var parcelNum = 0;
    var times = {};

    for (var i = 0; i < uncollectedPackagesNum; i++) {
        const packageInfo = uncollectedPackages[i]
        var packageType = packageInfo.type
        showPackagesId.push(packageInfo.id)

        if (packageType == "Letter") {
            letterNum += 1;
            packageType = "Letter ✉️";
        } else if (packageType == "Parcel") {
            parcelNum += 1;
            packageType = "Parcel 📦";
        }

        var date = new Date()
        const unixNow = Math.floor(date.getTime() / 1000)

        times = {
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

        if (reminderEmails == null) {
            reminderEmails = "N/A"
        }

        document.getElementById("accordion").innerHTML += `
        <div class="card text-white bg-success mt-2" id="card-${i}">
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

    totalUncollectedPackageNum = parcelNum + letterNum
    document.getElementById("allUncollectedPackageTitle").innerText = `${totalUncollectedPackageNum} packages were just collected`

    showStudInfo(searchCIS, database[searchCIS].lName, database[searchCIS].fName, parcelNum, letterNum)

    // add event listener to button
    addUncollectedListener(uncollectedPackages, uncollectedPackagesNum, times)

    // update firebase with collected time, given out by, turn it to true
    updateFirebaseToCollected(uncollectedPackages, uncollectedPackagesNum)


}

function addUncollectedListener(uncollectedPackages, uncollectedPackagesNum, times) {

    for (let i = 0; i < uncollectedPackagesNum; i++) {
        document.getElementById(`uncollect-${i}`).addEventListener("click", function (event) {
            let id = document.getElementById(`uncollect-${i}`).innerHTML.split('*')
            let arrayIndex = id[1]

            const packageInfo = uncollectedPackages[arrayIndex]

            document.getElementById("uncollectModalText").innerHTML = `You have selected
            <br>Name: <b>${database[packageInfo.cis].email}</b>
            <br>Type: <b>${packageInfo.type}</b>
            <br>Arrived on: <b>${times.arrivedTime}</b>
            `

            showModal()

            document.getElementById("uncollectModalInfo").innerHTML = `*${JSON.stringify(packageInfo)}*`
            document.getElementById("uncollectModalArrayIndex").innerHTML = `*${i}*`

        });
    };

};



async function load10RecentCollectedPackages() {
    document.getElementById("accordionConnected").innerHTML = ''

    console.log(searchCIS);

    // uncollectedPackages

    if (searchCIS == '') {
        showStudInfo("N/A", "Waiting", "for", "student", "card")
        return

    } else if (database[searchCIS] == null) {
        // show things about no such user
        showStudInfo("N/A", "No such", "student", "Try", "again")
        document.getElementById("searchCISForm").reset()
        return
    }

    document.getElementById("showCollectedPackages").style.display = "block"

    const limitNum = 10 + totalUncollectedPackageNum - num

    const recentCollectedPackages = await getRecentCollectedPackages(searchCIS, limitNum)

    if (recentCollectedPackages.length == 0) {
        document.getElementById("noResultTitle").style.display = "block"
        return
    }

    console.log(recentCollectedPackages);


    show10RecentCollectedPackages(recentCollectedPackages)



}

function show10RecentCollectedPackages(recentCollectedPackages) {

    const recentCollectedPackagesNum = recentCollectedPackages.length
    var showedPackage = false
    var checkExistPackageCardNum = 0
    console.log(showPackagesId);

    for (var i = 0; i < recentCollectedPackagesNum; i++) {
        const packageInfo = recentCollectedPackages[i]
        showedPackage = false

        if (showPackagesId.includes(packageInfo.id)){
            console.log("showed already");
            checkExistPackageCardNum += 1
            showedPackage = true
        }
        if (!showedPackage) {

            var packageType = packageInfo.type

            if (packageType == "Letter") {
                packageType = "Letter ✉️";
            } else if (packageType == "Parcel") {
                packageType = "Parcel 📦";
            }

            var date = new Date()
            const unixNow = Math.floor(date.getTime() / 1000)
            const tenMinsUnix = unixNow - 600

            times = {
                arrivedTime: packageInfo.arrivedTime.seconds,
                arrivedEmailSent: packageInfo.arrivedEmailSent.seconds,
                collectedTime: packageInfo.collectedTime.seconds
            }

            var buttonHtml = ''
            if (times.collectedTime >= tenMinsUnix) {
                console.log("within 10 mins");
                buttonHtml = `<button type="button" class="btn btn-danger" id="uncollectConnected-${i}">Uncollect<p hidden>*${i}*</p></button>`
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
            if (reminderEmails == null) {
                reminderEmails = "N/A"
            }

            document.getElementById("accordionConnected").innerHTML += `
                <div class="card text-white bg-secondary mt-2" id="card-${i}">
                    <div class="card-header btn btn-lin text-white" id="headingCollected-${i}" data-bs-toggle="collapse" data-bs-target="#collapseConnected-${i}"
                    aria-expanded="true" aria-controls="collapseConnected-${i}">
                        <div class="container">
                            <div class="row">
                            <div class="col-sm-2 text-start">
                                <h4 class="card-title">${packageType}</h4>
                            </div>
                            <div class="col-sm-2 text-start">
                                <h4 class="card-title">${parcelNo}</h4>
                            </div>
                            <div class="col-sm-4 text-start">
                                <p class="card-text">Collected on: <b>${times.collectedTime}</b></p>
                            </div>
                            <div class="col-sm-4 text-end">
                                ${buttonHtml}
                            </div>
                            </div>
                        </div>
                    </div>

                    <div id="collapseConnected-${i}" class="collapse" aria-labelledby="headingCollected-${i}" data-parent="#accordion">
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
    }

    if (checkExistPackageCardNum == recentCollectedPackagesNum) {
        document.getElementById("accordionConnected").innerHTML = `<h1 class="mt-4 mb-3 text-center">All packages were shown</h1>`
    }
}



function showStudInfo(cis, fName, lName, numParcel, numLetter) {
    document.getElementById('cisText').innerText = cis
    document.getElementById('firstNameText').innerText = fName
    document.getElementById('lastNameText').innerText = lName
    document.getElementById('numberOfParcelText').innerText = numParcel
    document.getElementById('numberOfLetterText').innerText = numLetter
}

function showModal() {
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("cannotFindPackageModal").style.display = "block"
    document.getElementById("cannotFindPackageModal").classList.add("show")
    document.getElementById("cannotFindPackageModal").focus();
}

function closeModal() {
    document.getElementById("backdrop").style.display = "none"
    document.getElementById("cannotFindPackageModal").style.display = "none"
    document.getElementById("cannotFindPackageModal").classList.remove("show")
}

// Get the modal
var cannotFindPackageModal = document.getElementById('cannotFindPackageModal');
var campusCardModal = document.getElementById('addCampusCardModal');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == cannotFindPackageModal) {
        closeModal()
    }
    if (event.target == campusCardModal) {
        closeModal()
    }
}


