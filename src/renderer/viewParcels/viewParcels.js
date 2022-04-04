const { getAllUncollectedPackages, getAllTimePackages, getOneStudentPackages } = require('../firebase.js');
const { database, sortAllUncollected, sortByLastName } = require('../readJSON.js');
const { ipcRenderer } = require('electron')

const searchByUncollectedBtn = document.getElementById("searchByUncollectedBtn")
const searchByArrivedDateBtn = document.getElementById("searchByArrivedDateBtn")
const searchByCollectedDateBtn = document.getElementById("searchByCollectedDateBtn")
const searchByStudentBtn = document.getElementById("searchByStudentBtn")

const tabAllUncollected = document.getElementById("tabAllUncollected")
const tabByArrivedDate = document.getElementById("tabByArrivedDate")
const tabByCollectedDate = document.getElementById("tabByCollectedDate")
const tabByCIS = document.getElementById("tabByCIS")

var onTab = "allUncollected"
var onDate = ''

getAllUncollected()

document.getElementById("printToPDF").addEventListener('click', () => {

    document.getElementById("printToPDF").blur()

    ipcRenderer.send('print-to-pdf', onTab, onDate)


})

searchByUncollectedBtn.addEventListener('click', async () => {
    onTab = "allUncollected"

    if (searchByUncollectedBtn.classList.contains("active")) {
        return
    }

    document.getElementById("UncollectedpackageTotalText").innerText = ''

    getAllUncollected()

    searchByUncollectedBtn.classList.add("active");
    searchByArrivedDateBtn.classList.remove("active")
    searchByCollectedDateBtn.classList.remove("active")
    searchByStudentBtn.classList.remove("active")

    tabAllUncollected.style.display = "block"
    tabByArrivedDate.style.display = "none"
    tabByCollectedDate.style.display = "none"
    tabByCIS.style.display = "none"

})

searchByArrivedDateBtn.addEventListener('click', () => {
    onTab = "arrivedDate"

    if (searchByArrivedDateBtn.classList.contains("active")) {
        return
    }

    document.getElementById("arrivedDateForm").reset()
    const table = document.getElementById("arrivedDateTable")
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    document.getElementById("arrivedTimepackageTotalText").innerText = ''

    searchByUncollectedBtn.classList.remove("active");
    searchByArrivedDateBtn.classList.add("active")
    searchByCollectedDateBtn.classList.remove("active")
    searchByStudentBtn.classList.remove("active")

    tabAllUncollected.style.display = "none"
    tabByArrivedDate.style.display = "block"
    tabByCollectedDate.style.display = "none"
    tabByCIS.style.display = "none"

})

document.getElementById('arrivedDateForm').addEventListener("submit", async function (event) {
    event.preventDefault();

    document.getElementById('viewPackagesArrivedDate').blur()
    document.getElementById('viewPackagesArrivedDateBtn').blur()
    const dateStr = document.getElementById('viewPackagesArrivedDate').value
    const startDate = new Date(dateStr);
    var endDate = new Date(dateStr);
    endDate.setDate(endDate.getDate() + 1);

    var allArrivedTimePackages = await getAllTimePackages(startDate, endDate, "arrivedTime")

    allArrivedTimePackages = sortByLastName(allArrivedTimePackages)

    showAllTimePackages(allArrivedTimePackages, "arrivedDateTable", "arrivedTimepackageTotalText", "")

});



searchByCollectedDateBtn.addEventListener('click', () => {
    onTab = "collectedDate"

    if (searchByCollectedDateBtn.classList.contains("active")) {
        return
    }

    document.getElementById("collectedDateForm").reset()
    const table = document.getElementById("collectedDateTable")
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    document.getElementById("collectedTimepackageTotalText").innerText = ''

    searchByUncollectedBtn.classList.remove("active");
    searchByArrivedDateBtn.classList.remove("active")
    searchByCollectedDateBtn.classList.add("active")
    searchByStudentBtn.classList.remove("active")

    tabAllUncollected.style.display = "none"
    tabByArrivedDate.style.display = "none"
    tabByCollectedDate.style.display = "block"
    tabByCIS.style.display = "none"

})

document.getElementById('collectedDateForm').addEventListener("submit", async function (event) {
    event.preventDefault();

    document.getElementById('viewPackagesCollectedDate').blur()
    document.getElementById('viewPackagesCollectedDateBtn').blur()
    const dateStr = document.getElementById('viewPackagesCollectedDate').value
    const startDate = new Date(dateStr);
    var endDate = new Date(dateStr);
    endDate.setDate(endDate.getDate() + 1);

    var allCollectedTimePackages = await getAllTimePackages(startDate, endDate, "collectedTime")

    allCollectedTimePackages = sortByLastName(allCollectedTimePackages)

    showAllTimePackages(allCollectedTimePackages, "collectedDateTable", "collectedTimepackageTotalText", "")


});


searchByStudentBtn.addEventListener('click', () => {
    onTab = "cisStudent"

    if (searchByStudentBtn.classList.contains("active")) {
        return
    }

    document.getElementById("searchCISForm").reset()
    const table = document.getElementById("cisTable")
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    document.getElementById("cispackageTotalText").innerText = ''

    searchByUncollectedBtn.classList.remove("active");
    searchByArrivedDateBtn.classList.remove("active")
    searchByCollectedDateBtn.classList.remove("active")
    searchByStudentBtn.classList.add("active")

    tabAllUncollected.style.display = "none"
    tabByArrivedDate.style.display = "none"
    tabByCollectedDate.style.display = "none"
    tabByCIS.style.display = "block"

})

document.getElementById('searchCISForm').addEventListener("submit", async function (event) {
    event.preventDefault();

    const searchCIS = document.getElementById('searchCISSearchBox').value
    document.getElementById('searchCISSearchBox').blur()
    const tableId = "cisTable"

    if (database[searchCIS] == null) {
        // show things about no such user
        const table = document.getElementById(tableId)

        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
        console.log("no such user");
        document.getElementById("cispackageTotalText").innerText = "No such student"
        return
    }

    var studentAllPackages = await getOneStudentPackages(searchCIS)

    showAllTimePackages(studentAllPackages, tableId, "cispackageTotalText", searchCIS)

});


async function getAllUncollected() {
    const allUncollectedPackagesUnsort = await getAllUncollectedPackages()

    const allUncollectedPackages = sortAllUncollected(allUncollectedPackagesUnsort)

    var letterNum = 0;
    var parcelNum = 0;
    const table = document.getElementById('uncollectedTable')

    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    for (var i = 0; i < allUncollectedPackages.length; i++) {

        var package = allUncollectedPackages[i]
        var packageType = package.type

        if (package.type == "Letter") {
            letterNum += 1;
            packageType = "Letter ✉️";
        } else if (package.type == "Parcel") {
            parcelNum += 1;
            packageType = "Parcel 📦";
        }

        var parcelNoShow = package.parcelNo
        if (parcelNoShow == null) {
            parcelNoShow = 'N/A'
        }


        var userCIS = package.cis

        const firebaseTime = package.arrivedTime.seconds * 1000
        const firebaseTimeMili = new Date(firebaseTime)
        const option = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: "numeric", minute: "numeric", hour12: true }
        const localTimeString = firebaseTimeMili.toLocaleString("en-GB", option)

        var row = table.insertRow(-1);

        var fName = row.insertCell(0);
        var lName = row.insertCell(1);
        var type = row.insertCell(2);
        var arrivedTime = row.insertCell(3);
        var parcelNo = row.insertCell(4);
        var collected = row.insertCell(5);

        fName.innerHTML = database[userCIS]["fName"]
        lName.innerHTML = database[userCIS]["lName"]
        type.innerHTML = packageType
        arrivedTime.innerHTML = localTimeString
        parcelNo.innerHTML = parcelNoShow
        collected.innerHTML = "No"

    }

    const totalPackagesNum = letterNum + parcelNum
    const totalText = `${totalPackagesNum} uncollected packages: ${parcelNum} parcels and ${letterNum} letters`
    document.getElementById("UncollectedpackageTotalText").innerText = totalText

}



function showAllTimePackages(allTimePackages, tableId, titleId, searchCIS) {

    var letterNum = 0;
    var parcelNum = 0;
    const table = document.getElementById(tableId)

    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    for (var i = 0; i < allTimePackages.length; i++) {

        var package = allTimePackages[i]
        var packageType = package.type

        if (package.type == "Letter") {
            letterNum += 1;
            packageType = "Letter ✉️";
        } else if (package.type == "Parcel") {
            parcelNum += 1;
            packageType = "Parcel 📦";
        }

        var parcelNoShow = package.parcelNo
        if (parcelNoShow == null) {
            parcelNoShow = 'N/A'
        }

        times = {
            arrivedTime: package.arrivedTime.seconds,
        }

        if (package.collectedTime == null) {
            times["collectedTime"] = "N/A"
        } else {
            times["collectedTime"] = package.collectedTime.seconds
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

        var collectedStatus;
        if (package.collected == true) {
            collectedStatus = "Yes"
        } else {
            collectedStatus = "No"
        }


        var userCIS = package.cis

        var row = table.insertRow(-1);

        var fName = row.insertCell(0);
        var lName = row.insertCell(1);
        var type = row.insertCell(2);
        var arrivedTime = row.insertCell(3);
        var collectedTime = row.insertCell(4);
        var parcelNo = row.insertCell(5);
        var collected = row.insertCell(6);

        fName.innerHTML = database[userCIS]["fName"]
        lName.innerHTML = database[userCIS]["lName"]
        type.innerHTML = packageType
        arrivedTime.innerHTML = times.arrivedTime
        collectedTime.innerHTML = times.collectedTime
        parcelNo.innerHTML = parcelNoShow
        collected.innerHTML = collectedStatus

    }

    const totalPackagesNum = letterNum + parcelNum
    var totalText = `${totalPackagesNum} packages: ${parcelNum} parcels and ${letterNum} letters`
    if (searchCIS != "") {
        totalText += ` - ${searchCIS}`
    }
    document.getElementById(titleId).innerText = totalText
}

