const { getAllUncollectedPackages, getAllTimePackages } = require('../firebase.js');
const { database, sortAllUncollected, sortByLastName } = require('../readJSON.js');

const searchByUncollectedBtn = document.getElementById("searchByUncollectedBtn")
const searchByArrivedDateBtn = document.getElementById("searchByArrivedDateBtn")
const searchByCollectedDateBtn = document.getElementById("searchByCollectedDateBtn")
const searchByStudentBtn = document.getElementById("searchByStudentBtn")

const tabAllUncollected = document.getElementById("tabAllUncollected")
const tabByArrivedDate = document.getElementById("tabByArrivedDate")
const tabByCollectedDate = document.getElementById("tabByCollectedDate")
const tabByCIS = document.getElementById("tabByCIS")

getAllUncollected()

searchByUncollectedBtn.addEventListener('click', async () => {

    if (searchByUncollectedBtn.classList.contains("active")) {
        return
    }

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

    if (searchByArrivedDateBtn.classList.contains("active")) {
        return
    }

    document.getElementById("packageTotalText").innerText = ''

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

    const dateStr = document.getElementById('viewPackagesArrivedDate').value
    const startDate = new Date(dateStr);
    var endDate = new Date(dateStr);
    endDate.setDate(endDate.getDate() + 1);

    var allArrivedTimePackages = await getAllTimePackages(startDate, endDate, "arrivedTime")

    allArrivedTimePackages = sortByLastName(allArrivedTimePackages)

    showAllTimePackages(allArrivedTimePackages, "arrivedDateTable")

});



searchByCollectedDateBtn.addEventListener('click', () => {
    console.log("by date");

    if (searchByCollectedDateBtn.classList.contains("active")) {
        console.log("clicked again");
        return
    }

    document.getElementById("packageTotalText").innerText = ''

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

    const dateStr = document.getElementById('viewPackagesCollectedDate').value
    const startDate = new Date(dateStr);
    var endDate = new Date(dateStr);
    endDate.setDate(endDate.getDate() + 1);

    var allCollectedTimePackages = await getAllTimePackages(startDate, endDate, "collectedTime")

    allCollectedTimePackages = sortByLastName(allCollectedTimePackages)

    showAllTimePackages(allCollectedTimePackages, "collectedDateTable")


});


searchByStudentBtn.addEventListener('click', () => {
    console.log("by student");

    if (searchByStudentBtn.classList.contains("active")) {
        console.log("clicked again");
        return
    }

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

    // const dateStr = document.getElementById('viewPackagesCollectedDate').value
    // const startDate = new Date(dateStr);
    // var endDate = new Date(dateStr);
    // endDate.setDate(endDate.getDate() + 1);

    // var allCollectedTimePackages = await getAllTimePackages(startDate, endDate, "collectedTime")

    // showAllTimePackages(allCollectedTimePackages, "collectedDateTable")


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
    document.getElementById("packageTotalText").innerText = totalText

}



function showAllTimePackages(allTimePackages, tableId) {

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
    const totalText = `${totalPackagesNum} uncollected packages: ${parcelNum} parcels and ${letterNum} letters`
    document.getElementById("packageTotalText").innerText = totalText
}

