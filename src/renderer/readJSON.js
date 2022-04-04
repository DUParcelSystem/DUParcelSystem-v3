const fs = require('fs');
const path = require('path');

// readjson once and become dict
const database = JSON.parse(fs.readFileSync(path.join(__dirname, '../../', 'data/johnSnow.json')));

// function to find student last name
function findStudent(searchLastName, checkBox) {

    var searchStudent = [];

    if (searchLastName == '') {
        return [];
    }
    for (const [user, data] of Object.entries(database)) {

        if (database[user]["lName"].toLowerCase().startsWith(searchLastName.toLowerCase())) {
            var temp = database[user]
            temp["cis"] = user
            if (checkBox == false && database[user]["type"] == "Undergraduate") {
                searchStudent.push(temp);
            } else if (checkBox == true) {
                searchStudent.push(temp);
            }
        }
    };

    searchStudent = sortByLastName(searchStudent)

    return searchStudent
}

function sortByLastName(searchStudent) {
    // sort array of dict by their last name and then first name
    searchStudent.sort(function (a, b) {
        var aLastName = a.lName;
        var bLastName = b.lName;
        if (aLastName > bLastName) {
            return 1;
        } else if (aLastName < bLastName) {
            return -1;
        } else {
            var aFirstName = a.fName;
            var bFirstName = b.fName;
            if (aFirstName > bFirstName) {
                return 1;
            } else if (aFirstName < bFirstName) {
                return -1;
            } else {
                return 0;
            }
        }
    });
    return searchStudent
}

function sortAllUncollected(allUncollectedPackagesUnsort) {

    // sort array of dict by their last name and then first name
    allUncollectedPackagesUnsort.sort(function (a, b) {
        var aArrivedTime = a.arrivedTime;
        var bArrivedTime = b.arrivedTime;
        if (aArrivedTime > bArrivedTime) {
            return 1;
        } else if (aArrivedTime < bArrivedTime) {
            return -1;
        } else {
            var aLastName = a.lName;
            var bLastName = b.lName;
            if (aLastName > bLastName) {
                return 1;
            } else if (aLastName < bLastName) {
                return -1;
            } else {
                var aFirstName = a.fName;
                var bFirstName = b.fName;
                if (aFirstName > bFirstName) {
                    return 1;
                } else if (aFirstName < bFirstName) {
                    return -1;
                } else {
                    return 0;
                }
            }
        }
    });

    return allUncollectedPackagesUnsort
}





module.exports = { database, findStudent, sortAllUncollected, sortByLastName };