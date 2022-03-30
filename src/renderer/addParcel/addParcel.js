const { database, findStudent } = require('../readJSON.js');
const addPackageFirebase = require('../firebase.js');
const { serverTimestamp } = require('firebase/firestore');
require('dotenv').config();

document.getElementById("windowtitle").innerHTML = process.env.COLLEGE;
document.getElementById("title").innerHTML = process.env.COLLEGE;

// const arrayIndex = function (event) {
//     if (event.key === "Enter") {
//         event.preventDefault();
//         getSearchLastName()
//     }

//     if (event.keyCode >= 49 && event.keyCode <= 57) {
//         const index = event.key - 1
//         console.log(event.key);
//         return index
//     }
// }

var addPackages = []

// avoid refresh page when enter if press
document.getElementById("searchTextBox").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        getSearchLastName()
    }

    if (event.keyCode >= 49 && event.keyCode <= 57) {
        const index = event.key - 1
        console.log(event.key);
        return index
    }
});


function isNumberKey(event) {
    if (event.keyCode >= 49 && event.keyCode <= 57) {
        return false;
    }
    return true;
}


function getSearchLastName() {

    const searchLastName = document.getElementById("searchTextBox").value;
    const checkBox = document.getElementById("staffCheckBox").checked;

    const searchStudent = findStudent(searchLastName, checkBox)

    const searchStudentNum = searchStudent.length

    showStudentsName(searchStudent, searchStudentNum);

    selectStudent(searchStudent, searchStudentNum);

}

function showStudentsName(searchStudent, searchStudentNum) {

    const table = document.getElementById("studentTable");
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    for (var i = 0; i < searchStudentNum; ++i) {

        var row = table.insertRow(-1);
        var currentStudent = searchStudent[i]
        var showNum = i + 1
        if (showNum > 9) {
            showNum = ''
        }

        var num = row.insertCell(0);
        var first = row.insertCell(1);
        var last = row.insertCell(2);
        var type = row.insertCell(3);
        var email = row.insertCell(4);
        var select = row.insertCell(5);

        num.innerHTML = showNum
        first.innerHTML = currentStudent.fName;
        last.innerHTML = currentStudent.lName;
        type.innerHTML = currentStudent.type;
        email.innerHTML = currentStudent.email;
        select.innerHTML = `<button type="button" id="selectStudent-${i}" class="btn btn-primary">Select<p hidden>*${i}*</p></button>`;

    }
};


function selectStudent(searchStudent, searchStudentNum) {

    for (let i = 0; i < searchStudentNum; i++) {
        document.getElementById(`selectStudent-${i}`).addEventListener("click", function (event) {
            let id = document.getElementById(`selectStudent-${i}`).innerHTML.split('*')
            let arrayIndex = id[1]

            const studentInfo = searchStudent[arrayIndex]

            document.getElementById("modalText").innerHTML = `You have selected
            <br>Name: <b>${studentInfo.email}</b>
            <br>Type: <b>${studentInfo.type}</b>
            <br>CIS: <b>${studentInfo.cis}</b>
            `
            showModal()

            console.log(arrayIndex);
            console.log(studentInfo);

            document.getElementById("modalStudInfo").innerHTML = `*${JSON.stringify(studentInfo)}*`

        });
    };

};


function selectPackage() {
    let studInfoText = document.getElementById("modalStudInfo").innerHTML.split('*')
    let studInfo = JSON.parse(studInfoText[1])

    var packageType;
    try {
        packageType = document.querySelector('input[name="btnPackage"]:checked').value
        clearBtnPackage()
    } catch (error) {
        document.getElementById("alertToChoosePackageType").style.display = "block";
        return
    }

    const cis = studInfo.cis

    const packageData = {
        arrivedTime: serverTimestamp(),
        arrivedBy: null,
        arrivedEmailSent: null,
        type: packageType,
        collectedTime: null,
        givenOutBy: null,
        reminderEmails: null,
        collected: false,
        parcelNo: null,
        cis: cis
    }

    // addPackageFirebase(packageData)

    addPackages.push(packageData)

    clearSearch()

    showAllAddPackages()

    closeModal()
}

function showAllAddPackages() {

    const addPackagesNum = addPackages.length

    const showListDom = document.getElementById("showAllAddPackages")
    showListDom.innerHTML = `<h3>${addPackagesNum} packages are waiting to be add to database:</h3>
    <h6>(emails will be send out at 3pm each day)</h6>`

    var createTable = document.createElement("table");
    createTable.classList.add("table");
    createTable.classList.add("table-bordered");
    createTable.setAttribute("id", "waitingPackagesTable");
    showListDom.appendChild(createTable);

    var thead = document.createElement('thead');
    createTable.appendChild(thead);

    thead.appendChild(document.createElement("th")).appendChild(document.createTextNode("Type"))
    thead.appendChild(document.createElement("th")).appendChild(document.createTextNode("Email"))
    thead.appendChild(document.createElement("th")).appendChild(document.createTextNode("Remove"))

    console.log(addPackagesNum);

    var letterNum = 0;
    var parcelNum = 0;

    for (var i = 0; i < addPackagesNum; i++) {

        var package = addPackages[i]

        if (package.type == "Letter") {
            letterNum += 1;
        } else if (package.type == "Parcel") {
            parcelNum += 1;
        }

        var userCIS = package.cis

        var row = createTable.insertRow(-1);

        var type = row.insertCell(0);
        var email = row.insertCell(1);
        var remove = row.insertCell(2);

        type.innerHTML = package.type
        email.innerHTML = database[userCIS]["email"]
        remove.innerHTML = `<button type="button" id="removeStudent-${i}" class="btn btn-primary">Remove<p hidden>*${i}*</p></button></td>
        </tr>`

    }

    showListDom.innerHTML += `</tbody></table> <br> ${letterNum} of letters, and ${parcelNum} of parcels`
}



function clearSearch() {

    document.getElementById("searchTextBox").value = ''

    const table = document.getElementById("studentTable");
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

}

function showModal() {
    document.getElementById("alertToChoosePackageType").style.display = "none";
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("selectPackageTypeModal").style.display = "block"
    document.getElementById("selectPackageTypeModal").classList.add("show")
}

function closeModal() {
    document.getElementById("backdrop").style.display = "none"
    document.getElementById("selectPackageTypeModal").style.display = "none"
    document.getElementById("selectPackageTypeModal").classList.remove("show")
    clearBtnPackage()
}

function clearBtnPackage() {
    var button = document.getElementsByName("btnPackage");
    for(var i=0;i<button.length;i++) {
        button[i].checked = false;
    }
}

// Get the modal
var modal = document.getElementById('selectPackageTypeModal');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    closeModal()
  }
}


// searchLastName = 'che'

// const searchStudent = findStudent(searchLastName)

// console.log(searchStudent);
// const

