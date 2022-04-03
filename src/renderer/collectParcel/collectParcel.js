const { database } = require('../readJSON.js');
const { getOneStuAllUncollectedPackages, updateFirebaseToCollected, updateFirebaseToUncollected,
    getRecentCollectedPackages, getCISusingUID, updateCampusCardUID } = require('../firebase.js');
const { ipcRenderer } = require("electron");
const fullName = require('fullname');

var searchCIS = ''
// var uncollectedPackages = []
var totalUncollectedPackageNum = 0
var num = 0
var showPackagesId = []
// var cannotFindPackagesArray = []
var recentCollectToUncollectNum = 0

var pcUserName;
(async () => {
    pcUserName = await fullName();
})();

ipcRenderer.on('nfc-connected-main', function (event, message) {
    document.getElementById("nfcReaderText").innerHTML = message
})

ipcRenderer.on('nfc-uid-main', async function (event, uid) {
    console.log("renderer got uid: ", uid);

    // find cis name from uid
    // either firebase or search dict
    searchCIS = await getCISusingUID(uid)

    console.log("got cis", searchCIS);

    if (searchCIS == null) {
        showStudInfoError("N/A", "Student", "card", "not", "registered")
        document.getElementById("searchCISForm").reset()

        document.getElementById("campusCardUIDText").innerHTML = `Student card detected
        <br>UID: <b>${uid}</b>
        `

        document.getElementById("campusCardUIDHidden").innerHTML = `*${uid}*`

        // show modal to get student cis
        showCampusCardModal()

        return
    }

    showUncollectedPackages(searchCIS)
})

ipcRenderer.on('nfc-uid-error', async function (event, err) {
    console.log("error: ", err);

    document.getElementById("nfcReaderText").innerHTML = message

})


async function addCampusCardInfo() {

    const cis = document.getElementById('campusCardCISTextBox').value

    if (cis == '') {
        document.getElementById("alertToTypeCIS").innerHTML = "You must type CIS username to add campus card!"
        document.getElementById("alertToTypeCIS").style.display = "block"
        return
    } else if (database[cis] == null) {
        // show things about no such user
        document.getElementById("alertToTypeCIS").innerHTML = "CIS username not found!"
        document.getElementById("alertToTypeCIS").style.display = "block"
        return
    }

    let campusCardUIDText = document.getElementById("campusCardUIDHidden").innerHTML.split('*')
    let campusCardUID = campusCardUIDText[1]

    // update campus card uid to firebase
    updateCampusCardUID(cis, campusCardUID)

    searchCIS = cis

    showUncollectedPackages(cis)

    console.log("user exist");

    closeCampusCardModal()

}

document.getElementById("addCampusCardModal").addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeCampusCardModal()
    }

    if (event.key === "Enter") {
        event.preventDefault();
        addCampusCardInfo()
    }
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

    document.getElementById(`card-${packageInfo.id}`).style.display = "none";

    showPackagesId.push(packageInfo.id)
    recentCollectToUncollectNum += 1

    showCannotFindPackages(packageInfo)

    updateFirebaseToUncollected(packageInfo)

    closeModal()

}

function showCannotFindPackages(packageInfo) {

    const packageId = packageInfo.id
    var packageType = packageInfo.type

    if (packageType == "Letter") {
        packageType = "Letter ✉️";
    } else if (packageType == "Parcel") {
        packageType = "Parcel 📦";
    }

    times = {
        arrivedTime: packageInfo.arrivedTime.seconds,
    }

    if (packageInfo.arrivedEmailSent == null) {
        times["arrivedEmailSent"] = "email not sent yet"
    } else {
        times["arrivedEmailSent"] = packageInfo.arrivedEmailSent.seconds
    }

    for (const [time, unix] of Object.entries(times)) {

        if (Number.isInteger(unix)) {
            const firebaseTime = unix * 1000

            const firebaseTimeMili = new Date(firebaseTime)
            const option = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: "numeric", minute: "numeric", hour12: true }
            const localTimeString = firebaseTimeMili.toLocaleString("en-GB", option)

            times[time] = localTimeString
        }
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

    if (packageInfo.collectedTime == null) {
        console.log("collected on local");
        const untitle = document.getElementById("allUncollectedPackageTitle").innerText
        const untitleArray = untitle.split(" ")
        const unNum = parseInt(untitleArray[0]) - 1
        document.getElementById("allUncollectedPackageTitle").innerText = `${unNum} packages were just collected`
    }

    const title = document.getElementById("cannotFindPackageTitle").innerText
    const titleArray = title.split(" ")
    num = num + 1
    document.getElementById("cannotFindPackageTitle").innerText = `${num} packages were just uncollected`

    document.getElementById("uncollectedPackages").innerHTML += `
        <div class="card text-dark bg-warning mt-2" id="card-${packageId}">
            <div class="card-header btn btn-lin text-dark" id="headingFind-${packageId}" data-bs-toggle="collapse" data-bs-target="#collapseFind-${packageId}"
            aria-expanded="true" aria-controls="collapseFind-${packageId}">
                <div class="container">
                    <div class="row">
                    <div class="col-sm-2 text-start">
                        <h4 class="card-title">${packageType}</h4>
                    </div>
                    <div class="col-sm-4 text-start">
                        <h4 class="card-title">${parcelNo}</h4>
                    </div>
                    <div class="col-sm-6 text-start">
                        <p class="card-text">Arrived on: <b>${times.arrivedTime}</b></p>
                    </div>
                    </div>
                </div>
            </div>

            <div id="collapseFind-${packageId}" class="collapse" aria-labelledby="headingFind-${packageId}" data-parent="#accordion">
                <div class="card-body">
                    <div class="container">
                        <div class="row border-bottom border-dark">
                            <div class="col">
                                Type: ${packageType}
                                <br>
                                Package no: ${parcelNoShow}
                                <br>
                                Package id: ${packageId}
                                <br>
                                Reminder emails: ${reminderEmails}
                            </div>
                        </div>
                        <div class="row mt-1">
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

        // <div class="col-sm-4 text-end">
        //     <button type="button" class="btn btn-success" id="cannotFind-${packageId}">Collected<p hidden>*${packageId}*</p></button>
        // </div>

    // cannotFindPackagesArray.push(packageInfo)

    // addUncollectedToCollectedListener()

}

// function addUncollectedToCollectedListener() {

//     for (let i = 0; i < cannotFindPackagesArray.length; i++) {
//         const packageInfo = cannotFindPackagesArray[i]
//         var packageType = packageInfo.type
//         const packageId = packageInfo.id
//         console.log("added one", packageId);

//         document.getElementById(`cannotFind-${packageId}`).addEventListener("click", function (event) {

//             console.log("collected");
//             document.getElementById(`card-${packageId}`).style.display = "none";

//             const untitle = document.getElementById("allUncollectedPackageTitle").innerText
//             const untitleArray = untitle.split(" ")
//             const unNum = parseInt(untitleArray[0]) + 1
//             document.getElementById("allUncollectedPackageTitle").innerText = `${unNum} packages were just collected`

//             num = num - 1
//             document.getElementById("cannotFindPackageTitle").innerText = `${num} packages were just uncollected`

//             // showPackagesId.push(packageId)

//             if (packageType == "Letter") {
//                 packageType = "Letter ✉️";
//             } else if (packageType == "Parcel") {
//                 packageType = "Parcel 📦";
//             }

//             var date = new Date()
//             const unixNow = Math.floor(date.getTime() / 1000)

//             times = {
//                 arrivedTime: packageInfo.arrivedTime.seconds,
//                 collectedTime: unixNow
//             }

//             if (packageInfo.arrivedEmailSent == null) {
//                 times["arrivedEmailSent"] = "email not sent yet"
//             } else {
//                 times["arrivedEmailSent"] = packageInfo.arrivedEmailSent.seconds
//             }

//             for (const [time, unix] of Object.entries(times)) {

//                 if (Number.isInteger(unix)) {
//                     const firebaseTime = unix * 1000

//                     const firebaseTimeMili = new Date(firebaseTime)
//                     const option = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: "numeric", minute: "numeric", hour12: true }
//                     const localTimeString = firebaseTimeMili.toLocaleString("en-GB", option)

//                     times[time] = localTimeString
//                 }
//             }

//             var parcelNo = packageInfo.parcelNo
//             var parcelNoShow = packageInfo.parcelNo

//             if (parcelNo == null) {
//                 parcelNo = ''
//                 parcelNoShow = 'N/A'
//             }

//             var reminderEmails = packageInfo.reminderEmails

//             if (reminderEmails == null) {
//                 reminderEmails = "N/A"
//             }

//             document.getElementById("accordion").innerHTML += `
//                 <div class="card text-white bg-success mt-2" id="card-${packageId}">
//                     <div class="card-header btn btn-lin text-white" id="heading-${packageId}" data-bs-toggle="collapse" data-bs-target="#collapse-${packageId}"
//                     aria-expanded="true" aria-controls="collapse-${packageId}">
//                         <div class="container">
//                             <div class="row">
//                             <div class="col-sm-2 text-start">
//                                 <h4 class="card-title">${packageType}</h4>
//                             </div>
//                             <div class="col-sm-2 text-start">
//                                 <h4 class="card-title">${parcelNo}</h4>
//                             </div>
//                             <div class="col-sm-4 text-start">
//                                 <p class="card-text">Arrived on: <b>${times.arrivedTime}</b></p>
//                             </div>
//                             <div class="col-sm-4 text-end">
//                                 <button type="button" class="btn btn-danger" id="uncollect-${i}">Uncollect<p hidden>*${packageId}*</p></button>
//                             </div>
//                             </div>
//                         </div>
//                     </div>

//                     <div id="collapse-${packageId}" class="collapse" aria-labelledby="heading-${packageId}" data-parent="#accordion">
//                         <div class="card-body">
//                             <div class="container">
//                                 <div class="row border-bottom border-dark">
//                                     <div class="col">
//                                         Type: ${packageType}
//                                         <br>
//                                         Package no: ${parcelNoShow}
//                                         <br>
//                                         Package id: ${packageId}
//                                         <br>
//                                         Reminder emails: ${reminderEmails}
//                                     </div>
//                                 </div>
//                                 <div class="row mt-1">
//                                     <div class="col">
//                                         Arrived date: ${times.arrivedTime}
//                                         <br>
//                                         Arrived by: ${packageInfo.arrivedBy}
//                                         <br>
//                                         Notified email sent: ${times.arrivedEmailSent}
//                                     </div>
//                                     <div class="col">
//                                         Collected date: ${times.collectedTime}
//                                         <br>
//                                         Given out by: ${pcUserName}
//                                         <br>
//                                         Collected: Yes
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>`

//             document.getElementById(`uncollect-${i}`).addEventListener("click", function (event) {
//                 // let packageInfoText = document.getElementById(`uncollect-${i}`).innerHTML.split('*')
//                 // let arrayIndex = packageInfoText[1].id

//                 console.log("uncollected!!!!!!!!!!!");

//                 const packageInfo = uncollectedPackages[i]

//                 console.log("collected time?", packageInfo);

//                 var parcelNoShow = packageInfo.parcelNo
//                 if (parcelNoShow == null) {
//                     parcelNoShow = 'N/A'
//                 }

//                 document.getElementById("uncollectModalText").innerHTML = `You have selected
//                 <br>Name: <b>${database[packageInfo.cis].email}</b>
//                 <br>Type: <b>${packageInfo.type}</b>
//                 <br>Package no: <b>${parcelNoShow}</b>
//                 <br>Package id: <b>${packageInfo.id}</b>
//                 <br>Arrived on: <b>${times.arrivedTime}</b>
//                 <br>Collected on: <b>${times.collectedTime}</b>
//                 `

//                 showModal()

//                 document.getElementById("uncollectModalInfo").innerHTML = `*${JSON.stringify(packageInfo)}*`

//             });


//         });
//     }

// };


async function showUncollectedPackages(searchCIS) {

    // get uncollected packages details for specific student
    showPackagesId = []
    cannotFindPackagesArray = []
    num = 0
    recentCollectToUncollectNum = 0
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
        document.getElementById("accordion").innerHTML = `<h1 class="mt-4 mb-3 text-center">All packages were collected 📭</h1>`
    }

    var letterNum = 0;
    var parcelNum = 0;
    var times = {};

    for (var i = 0; i < uncollectedPackagesNum; i++) {
        const packageInfo = uncollectedPackages[i]
        var packageType = packageInfo.type
        const packageId = packageInfo.id
        showPackagesId.push(packageId)

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
            collectedTime: unixNow
        }

        if (packageInfo.arrivedEmailSent == null) {
            times["arrivedEmailSent"] = "email not sent yet"
        } else {
            times["arrivedEmailSent"] = packageInfo.arrivedEmailSent.seconds
        }

        for (const [time, unix] of Object.entries(times)) {

            if (Number.isInteger(unix)) {
                const firebaseTime = unix * 1000

                const firebaseTimeMili = new Date(firebaseTime)
                const option = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: "numeric", minute: "numeric", hour12: true }
                const localTimeString = firebaseTimeMili.toLocaleString("en-GB", option)

                times[time] = localTimeString
            }
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
        <div class="card text-white bg-success mt-2" id="card-${packageId}">
            <div class="card-header btn btn-lin text-white" id="heading-${packageId}" data-bs-toggle="collapse" data-bs-target="#collapse-${packageId}"
            aria-expanded="true" aria-controls="collapse-${packageId}">
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
                        <button type="button" class="btn btn-danger" id="uncollect-${i}">Uncollect<p hidden>*${packageId}*</p></button>
                    </div>
                    </div>
                </div>
            </div>

            <div id="collapse-${packageId}" class="collapse" aria-labelledby="heading-${packageId}" data-parent="#accordion">
                <div class="card-body">
                    <div class="container">
                        <div class="row border-bottom border-dark">
                            <div class="col">
                                Type: ${packageType}
                                <br>
                                Package no: ${parcelNoShow}
                                <br>
                                Package id: ${packageId}
                                <br>
                                Reminder emails: ${reminderEmails}
                            </div>
                        </div>
                        <div class="row mt-1">
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
            // let packageInfoText = document.getElementById(`uncollect-${i}`).innerHTML.split('*')
            // let arrayIndex = packageInfoText[1].id

            const packageInfo = uncollectedPackages[i]

            console.log("collected time?", packageInfo);

            var parcelNoShow = packageInfo.parcelNo
            if (parcelNoShow == null) {
                parcelNoShow = 'N/A'
            }

            document.getElementById("uncollectModalText").innerHTML = `You have selected
            <br>Name: <b>${database[packageInfo.cis].email}</b>
            <br>Type: <b>${packageInfo.type}</b>
            <br>Package no: <b>${parcelNoShow}</b>
            <br>Package id: <b>${packageInfo.id}</b>
            <br>Arrived on: <b>${times.arrivedTime}</b>
            <br>Collected on: <b>${times.collectedTime}</b>
            `

            showModal()

            document.getElementById("uncollectModalInfo").innerHTML = `*${JSON.stringify(packageInfo)}*`

        });
    };

};



async function load10RecentCollectedPackages() {
    document.getElementById("accordionCollected").innerHTML = ''

    console.log("limit total", totalUncollectedPackageNum);

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

    const limitNum = 10 + totalUncollectedPackageNum - num + recentCollectToUncollectNum

    console.log("real limit", limitNum);

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
    var btnShown = []
    console.log("showed package id", showPackagesId);

    for (var i = 0; i < recentCollectedPackagesNum; i++) {
        const packageInfo = recentCollectedPackages[i]
        const packageId = packageInfo.id
        showedPackage = false

        if (showPackagesId.includes(packageId)){
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

            // console.log(packageInfo);
            times = {
                arrivedTime: packageInfo.arrivedTime.seconds,
                collectedTime: packageInfo.collectedTime.seconds
            }

            if (packageInfo.arrivedEmailSent == null) {
                times["arrivedEmailSent"] = "email not sent yet"
            } else {
                times["arrivedEmailSent"] = packageInfo.arrivedEmailSent.seconds
            }

            var buttonHtml = ''
            if (times.collectedTime >= tenMinsUnix) {
                console.log("within 10 mins");
                buttonHtml = `<button type="button" class="btn btn-danger" id="uncollectCollected-${packageId}">Uncollect<p hidden>*${packageId}*</p></button>`
                btnShown.push(packageInfo)
            }

            for (const [time, unix] of Object.entries(times)) {

                if (Number.isInteger(unix)) {
                    const firebaseTime = unix * 1000

                    const firebaseTimeMili = new Date(firebaseTime)
                    const option = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: "numeric", minute: "numeric", hour12: true }
                    const localTimeString = firebaseTimeMili.toLocaleString("en-GB", option)

                    times[time] = localTimeString
                }
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

            document.getElementById("accordionCollected").innerHTML += `
                <div class="card text-white bg-secondary mt-2" id="card-${packageId}">
                    <div class="card-header btn btn-lin text-white" id="headingCollected-${packageId}" data-bs-toggle="collapse" data-bs-target="#collapseCollected-${packageId}"
                    aria-expanded="true" aria-controls="collapseCollected-${packageId}">
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

                    <div id="collapseCollected-${packageId}" class="collapse" aria-labelledby="headingCollected-${packageId}" data-parent="#accordion">
                        <div class="card-body">
                            <div class="container">
                                <div class="row border-bottom border-dark">
                                    <div class="col">
                                        Type: ${packageType}
                                        <br>
                                        Package no: ${parcelNoShow}
                                        <br>
                                        Package id: ${packageId}
                                        <br>
                                        Reminder emails: ${reminderEmails}
                                    </div>
                                </div>
                                <div class="row mt-1">
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
        document.getElementById("accordionCollected").innerHTML = `<h1 class="mt-4 mb-3 text-center">All packages were shown</h1>`
        return
    }

    // console.log("btn Shown",btnShown);

    addRecentCollectedListener(times, btnShown)

}


function addRecentCollectedListener(times, btnShown) {

    for (let i = 0; i < btnShown.length; i++) {
        const packageInfo = btnShown[i]
        const packageId = packageInfo.id
        console.log(packageId);

        document.getElementById(`uncollectCollected-${packageId}`).addEventListener("click", function (event) {

            var parcelNoShow = packageInfo.parcelNo
            if (parcelNoShow == null) {
                parcelNoShow = 'N/A'
            }

            document.getElementById("uncollectModalText").innerHTML = `You have selected
            <br>Name: <b>${database[packageInfo.cis].email}</b>
            <br>Type: <b>${packageInfo.type}</b>
            <br>Package no: <b>${parcelNoShow}</b>
            <br>Package id: <b>${packageInfo.id}</b>
            <br>Arrived on: <b>${times.arrivedTime}</b>
            <br>Collected on: <b>${times.collectedTime}</b>
            `

            showModal()

            document.getElementById("uncollectModalInfo").innerHTML = `*${JSON.stringify(packageInfo)}*`

        });
    };

};



function showStudInfo(cis, fName, lName, numParcel, numLetter) {
    document.getElementById('cisText').innerText = cis
    document.getElementById('firstNameText').innerText = fName
    document.getElementById('lastNameText').innerText = lName
    document.getElementById('numberOfParcelText').innerText = numParcel
    document.getElementById('numberOfLetterText').innerText = numLetter
    document.getElementById('firstNameTextDanger').innerText = ""
    document.getElementById('lastNameTextDanger').innerText = ""
    document.getElementById('numberOfParcelTextDanger').innerText = ""
    document.getElementById('numberOfLetterTextDanger').innerText = ""
}

function showStudInfoError(cis, fName, lName, numParcel, numLetter) {
    document.getElementById('cisText').innerText = cis
    document.getElementById('firstNameText').innerText = ""
    document.getElementById('lastNameText').innerText = ""
    document.getElementById('numberOfParcelText').innerText = ""
    document.getElementById('numberOfLetterText').innerText = ""
    document.getElementById('firstNameTextDanger').innerText = fName
    document.getElementById('lastNameTextDanger').innerText = lName
    document.getElementById('numberOfParcelTextDanger').innerText = numParcel
    document.getElementById('numberOfLetterTextDanger').innerText = numLetter
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

function showCampusCardModal() {
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("addCampusCardModal").style.display = "block"
    document.getElementById("addCampusCardModal").classList.add("show")
    document.getElementById('campusCardCISTextBox').focus();
}

function closeCampusCardModal() {
    document.getElementById("backdrop").style.display = "none"
    document.getElementById("addCampusCardModal").style.display = "none"
    document.getElementById("addCampusCardModal").classList.remove("show")
}


// Get the modal
var cannotFindPackageModal = document.getElementById('cannotFindPackageModal');
// var campusCardModal = document.getElementById('addCampusCardModal');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == cannotFindPackageModal) {
        closeModal()
    }
    // if (event.target == campusCardModal) {
    //     closeModal()
    // }
}


