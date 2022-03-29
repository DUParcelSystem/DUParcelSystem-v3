document.getElementById("windowtitle").innerHTML = process.env.COLLEGE;
document.getElementById("title").innerHTML = process.env.COLLEGE;

const findStudent = require('../readJSON');



// avoid refresh page when enter if press
document.getElementById("searchTextBox").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        getSearchLastName()
    }


});


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

    function getTitleCase(str) {
        const titleCase = str
          .toLowerCase()
          .split(' ')
          .map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
          })
          .join(' ');

        return titleCase;
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
        first.innerHTML = getTitleCase(currentStudent.fName);
        last.innerHTML = getTitleCase(currentStudent.lName);
        type.innerHTML = currentStudent.type;
        email.innerHTML = currentStudent.email;
        select.innerHTML = `<button type="button" id="selectStudent-${i}" class="btn btn-primary">Select<p hidden>*${i}*</p></button>`;

    }

};


function selectStudent(searchStudent, searchStudentNum) {

    for (let i = 0; i < searchStudentNum; i++) {
        document.getElementById(`selectStudent-${i}`).addEventListener("click", function (event) {
            let id = document.getElementById(`selectStudent-${i}`).innerHTML.split('*')
            arrayIndex = id[1]


            console.log(arrayIndex);
        });
    };

};





// searchLastName = 'che'

// const searchStudent = findStudent(searchLastName)

// console.log(searchStudent);
// const

