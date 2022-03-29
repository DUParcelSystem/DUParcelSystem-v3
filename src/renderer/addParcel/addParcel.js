document.getElementById("windowtitle").innerHTML = process.env.COLLEGE;
document.getElementById("title").innerHTML = process.env.COLLEGE;

const findStudent = require('../readJSON');



// avoid refresh page when enter if press
document.getElementById("searchTextBox").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        getSearchLastName()
    }

});


function getSearchLastName() {

    const searchLastName = document.getElementById("searchTextBox").value;
    const checkBox = document.getElementById("staffCheckBox").checked;


    const searchStudent = findStudent(searchLastName, checkBox)
    console.log("changed", searchLastName);

    console.log(searchStudent);

    // showStudentsName(searchStudent)
}


function showStudentsName(searchStudent) {

    // Find a <table> element with id="myTable":
    const table = document.getElementById("studentTable");

    const searchStudentNum = searchStudent.length

    for (var i = 0; i < searchStudentNum; ++i) {

        var row = table.insertRow(-1);
        const currentStudent = searchStudentNum[i]

        console.log(currentStudent);

        var num = row.insertCell(0);
        var first = row.insertCell(1);
        var last = row.insertCell(2);
        var type = row.insertCell(3);
        var email = row.insertCell(4);
        var select = row.insertCell(5);

        num.innerHTML = i
        first.innerHTML = currentStudent.fName;
        last.innerHTML = currentStudent.lName;
        type.innerHTML = currentStudent.type;
        email.innerHTML = currentStudent.email;
        select.innerHTML = `<button type="button" id="${}" class="btn btn-primary">Select</button>`;

    }



}

// searchLastName = 'che'

// const searchStudent = findStudent(searchLastName)

// console.log(searchStudent);
// const

