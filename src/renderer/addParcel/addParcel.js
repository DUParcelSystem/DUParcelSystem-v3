const { database, findStudent } = require('../readJSON.js');
const { addPackageFirebase } = require('../firebase.js');
const { serverTimestamp } = require('firebase/firestore');
const fullName = require('fullname');

var addPackages = []
var searchStudent = []
var inModal = false

var pcUserName;
(async () => {
    pcUserName  = await fullName();
})();

// avoid refresh page when enter if press
document.getElementById("searchTextBox").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        getSearchLastName()
    }

    if (event.key === "`") {
        const checkBoxDom = document.getElementById("staffCheckBox")
        if (checkBoxDom.checked == false) {
            checkBoxDom.checked = true;
        } else if (checkBoxDom.checked == true) {
            checkBoxDom.checked = false;
        }
        getSearchLastName()
    }
});

document.addEventListener("keydown", function (event) {

    if (event.key >= "1" && event.key <= "9") {
        const index = event.key - 1
        const studentInfo = searchStudent[index]

        if (studentInfo && !inModal) {

            document.getElementById("modalText").innerHTML = `You have selected
            <br>Name: <b>${studentInfo.email}</b>
            <br>Type: <b>${studentInfo.type}</b>
            <br>CIS: <b>${studentInfo.cis}</b>
            `
            showModal()

            document.getElementById("modalStudInfo").innerHTML = `*${JSON.stringify(studentInfo)}*`

        }

    }
});

document.getElementById("selectPackageTypeModal").addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeModal()
    }

    if (event.key == "p" || event.key == "P") {
        document.getElementById("btnParcel").checked = true;
    }
    if (event.key == "l" || event.key == "L") {
        document.getElementById("btnLetter").checked = true;
    }
    if (event.key === "Enter") {
        event.preventDefault();
        selectPackage()
    }
})

document.getElementById("removePackageModal").addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeRemoveModal()
    }
    if (event.key === "Enter") {
        event.preventDefault();
        removePackage()
    }

})


function isNumberKey(event) {
    if ((event.key >= "1" && event.key <= "9") || (event.key == "`")) {
        return false;
    }
    return true;
}


function getSearchLastName() {

    const searchLastName = document.getElementById("searchTextBox").value;
    const checkBox = document.getElementById("staffCheckBox").checked;

    searchStudent = findStudent(searchLastName, checkBox)

    const searchStudentNum = searchStudent.length

    showStudentsName(searchStudent, searchStudentNum);

    selectStudent(searchStudent, searchStudentNum);


}

function showStudentsName(searchStudent, searchStudentNum) {

    const table = document.getElementById("studentTable");
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    if (searchStudentNum == 0) {
        var row = table.insertRow(-1);

        var num = row.insertCell(0);
        var first = row.insertCell(1);
        var last = row.insertCell(2);

        num.innerHTML = ""
        first.colSpan = "2"
        first.innerHTML = "<h4>🥳 More happiness to come 📦</h4>"
        last.colSpan = "2"
        last.innerHTML = "<h4>👆🏻 Enter the surname above to find the next happiness 😄</h4>"
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
        arrivedBy: pcUserName,
        arrivedEmailSent: null,
        type: packageType,
        collectedTime: null,
        givenOutBy: null,
        reminderEmails: null,
        collected: false,
        parcelNo: null,
        cis: cis
    }

    addPackages.push(packageData)

    clearSearch()

    showAllAddPackages()

    closeModal()
}

function showAllAddPackages() {

    const addPackagesNum = addPackages.length
    const showListDom = document.getElementById("showAllAddPackages")

    createWaitingToUploadTable(showListDom, addPackagesNum)

    const table = document.getElementById('waitingPackagesTable')

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

        var row = table.insertRow(-1);

        var type = row.insertCell(0);
        var email = row.insertCell(1);
        var remove = row.insertCell(2);

        type.innerHTML = package.type
        email.innerHTML = database[userCIS]["email"]
        remove.innerHTML = `<button type="button" id="removeStudent-${i}" class="btn btn-primary">Remove<p hidden>*${i}*</p></button></td>
        </tr>`

    }

    showListDom.innerHTML += `</tbody></table> <br> ${letterNum} letters, and ${parcelNum} parcels`

    showListDom.innerHTML += `<br><button type="button" class="btn btn-warning" id="uploadToFirebase" onclick="uploadPackagesFirebase()">Upload packages data to database</button>`

    removeStudent(addPackagesNum)

}

function createWaitingToUploadTable(showListDom, addPackagesNum) {

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
}


function uploadPackagesFirebase() {

    const uploadedPackagesNum = addPackages.length

    // call firebase to upload
    if (uploadedPackagesNum != 0) {
        addPackageFirebase(addPackages)
    }

    // clear array
    addPackages = []
    addPackagesNum = addPackages.length
    const showListDom = document.getElementById("showAllAddPackages")

    createWaitingToUploadTable(showListDom, addPackagesNum)

    const table = document.getElementById('waitingPackagesTable')

    var row = table.insertRow(-1);

    var num = row.insertCell(0);
    var first = row.insertCell(1);

    num.innerHTML = ""
    first.colSpan = "2"
    first.innerHTML = `<h4>${uploadedPackagesNum} packages data successfully uploaded to database 🙌</h4>`

}


function removeStudent(addPackagesNum) {

    for (let i = 0; i < addPackagesNum; i++) {
        document.getElementById(`removeStudent-${i}`).addEventListener("click", function (event) {
            let id = document.getElementById(`removeStudent-${i}`).innerHTML.split('*')
            let arrayIndex = id[1]

            var package = addPackages[arrayIndex]

            document.getElementById("removeModalText").innerHTML = `You are going to remove
            <br>Name: <b>${database[package.cis]["email"]}</b>
            <br>CIS: <b>${package.cis}</b>
            <br>Package Type: <b>${package.type}</b>
            `
            showRemoveModal()

            document.getElementById("removeModalArrayIndex").innerHTML = `*${arrayIndex}*`

        });
    };

};

function removePackage() {

    let arrayIndexText = document.getElementById("removeModalArrayIndex").innerHTML.split('*')
    let arrayIndex = JSON.parse(arrayIndexText[1])

    addPackages.splice(arrayIndex, 1)

    showAllAddPackages()

    closeRemoveModal()
}



function clearSearch() {

    document.getElementById("searchTextBoxFrom").reset()

    const table = document.getElementById("studentTable");

    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    var row = table.insertRow(-1);

    var num = row.insertCell(0);
    var first = row.insertCell(1);
    var last = row.insertCell(2);

    num.innerHTML = ""
    first.colSpan = "2"
    first.innerHTML = "<h4>🥳 More happiness to come 📦</h4>"
    last.colSpan = "2"
    last.innerHTML = "<h4>👆🏻 Enter the surname above to find the next happiness 😄</h4>"


}



function showRemoveModal() {
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("removePackageModal").style.display = "block"
    document.getElementById("removePackageModal").classList.add("show")
    document.getElementById("removePackageModal").focus();
}

function closeRemoveModal() {
    document.getElementById("backdrop").style.display = "none"
    document.getElementById("removePackageModal").style.display = "none"
    document.getElementById("removePackageModal").classList.remove("show")
}

function showModal() {
    document.getElementById("alertToChoosePackageType").style.display = "none";
    document.getElementById("backdrop").style.display = "block"
    document.getElementById("selectPackageTypeModal").style.display = "block"
    document.getElementById("selectPackageTypeModal").classList.add("show")
    document.getElementById("selectPackageTypeModal").focus();
    inModal = true
}

function closeModal() {
    document.getElementById("backdrop").style.display = "none"
    document.getElementById("selectPackageTypeModal").style.display = "none"
    document.getElementById("selectPackageTypeModal").classList.remove("show")
    document.getElementById("searchTextBox").focus();
    inModal = false
    clearBtnPackage()
}

function clearBtnPackage() {
    var button = document.getElementsByName("btnPackage");
    for(var i=0;i<button.length;i++) {
        button[i].checked = false;
    }
}

// Get the modal
var selectModal = document.getElementById('selectPackageTypeModal');
var removeModal = document.getElementById('removePackageModal');


// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == selectModal) {
    closeModal()
  }
  if (event.target == removeModal) {
    closeRemoveModal()
  }
}


