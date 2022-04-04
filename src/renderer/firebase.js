const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDoc, doc, setDoc, getDocs,
    updateDoc, addDoc, serverTimestamp, collectionGroup, orderBy, limit } = require('firebase/firestore');
// const { getAnalytics } = require("firebase/analytics");
const fullName = require('fullname');
const { getCollegeName } = require('../main/config.js')
require('dotenv').config({path:__dirname+'/./../../.env'});

const collegeName = getCollegeName()

var pcUserName;
(async () => {
    pcUserName = await fullName();
})();

console.log("auth name",process.env.authDomain );
const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const analytics = getAnalytics(app);


// write package data to firebase
async function addPackageFirebase(addPackages) {

    const addPackagesNum = addPackages.length

    for (let i = 0; i < addPackagesNum; i++) {

        const package = addPackages[i]
        const studCIS = package["cis"]
        console.log("studCIS", studCIS, package);

        // console.log("package", package);
        // console.log("cis", studCIS);

        // Add a new document with a generated id.
        const docRef = await addDoc(collection(db, collegeName[0], studCIS, "packages"), package);
        // console.log("Document written with ID: ", docRef.id);

    }

    // const packageData = {
    //     arrivedTime: serverTimestamp(),
    //     arrivedBy: pcUserName,
    //     arrivedEmailSent: null,
    //     type: 'Letter',
    //     collectedTime: null,
    //     givenOutBy: null,
    //     reminderEmails: null,
    //     collected: false,
    //     parcelNo: null,
    //     cis: "qwwk95"
    // }

}


// get all uncollected parcels from specific user
async function getOneStuAllUncollectedPackages(searchCIS) {

    var uncollectedPackages = []
    const uncollectedPackagesFirebase = query(collection(db, collegeName[0], searchCIS, "packages"), where('collected', '==', false));

    const querySnapshot = await getDocs(uncollectedPackagesFirebase);
    querySnapshot.forEach((doc) => {

        packageInfo = doc.data()
        docID = doc.id
        packageInfo["id"] = docID
        uncollectedPackages.push(packageInfo)

    });

    uncollectedPackages.sort(function (a, b) {
        var aArrivedTime = a.arrivedTime;
        var bArrivedTime = b.arrivedTime;
        if (aArrivedTime > bArrivedTime) {
            return 1;
        } else if (aArrivedTime < bArrivedTime) {
            return -1;
        }
    })

    return uncollectedPackages

}

// update package data to firebase, when collected package
async function updateFirebaseToCollected(uncollectedPackages, uncollectedPackagesNum) {

    for (var i = 0; i < uncollectedPackagesNum; i++) {
        const packageInfo = uncollectedPackages[i]
        var packageId = packageInfo.id
        var packageCIS = packageInfo.cis

        const packageData = {
            collectedTime: serverTimestamp(),
            givenOutBy: pcUserName,
            collected: true
        }

        // update doc to change docs to collected
        const docRef = await updateDoc(doc(db, collegeName[0], packageCIS, "packages", packageId), packageData);

    }
}

// update package to uncollected as not found
async function updateFirebaseToUncollected(packageInfo) {

    var packageId = packageInfo.id
    var packageCIS = packageInfo.cis

    const packageData = {
        collectedTime: null,
        givenOutBy: null,
        collected: false
    }

    // update doc to change docs to collected
    const docRef = await updateDoc(doc(db, collegeName[0], packageCIS, "packages", packageId), packageData);

}


// get recent collected packages
async function getRecentCollectedPackages(searchCIS, limitNum) {

    var recentCollectedPackages = []
    const recentCollectedPackagesFirebase = query(collection(db, collegeName[0], searchCIS, "packages"), orderBy("collectedTime", "desc"), limit(limitNum));

    const querySnapshot = await getDocs(recentCollectedPackagesFirebase);
    querySnapshot.forEach((doc) => {

        packageInfo = doc.data()
        docID = doc.id
        packageInfo["id"] = docID
        recentCollectedPackages.push(packageInfo)

    });

    return recentCollectedPackages

}

// find one doc (one student) using uid
async function getCISusingUID(uid) {

    const cisFirebase = query(collection(db, collegeName[0]), where("campusCardUID", "==", uid));

    const querySnapshot = await getDocs(cisFirebase);
    if (querySnapshot.docs.length == 0) {
        return null
    }
    const cis = querySnapshot.docs[0].id

    return cis
};

// update UID for card
// const uid = "04:11:5D:12:28:6B:80";
async function updateCampusCardUID(cis, uid) {
    const updateRef = doc(db, collegeName[0], cis)

    await updateDoc(updateRef, {
        "campusCardUID": uid
    });

}


// get all uncollected parcels from all users
async function getAllUncollectedPackages() {

    var allUncollectedPackages = []
    const allUncollectedPackagesFirebase = query(collectionGroup(db, 'packages'), where('collected', '==', false));

    const querySnapshot = await getDocs(allUncollectedPackagesFirebase);
    querySnapshot.forEach((doc) => {

        packageInfo = doc.data()
        docID = doc.id
        packageInfo["id"] = docID
        allUncollectedPackages.push(packageInfo)

    });

    return allUncollectedPackages
}

async function getAllTimePackages(startDate, endDate, time) {

    var allTimePackages = []
    const allTimePackagesFirebase = query(collectionGroup(db, 'packages'), where(time, '>=', startDate), where(time, '<=', endDate), orderBy(time));

    const querySnapshot = await getDocs(allTimePackagesFirebase);
    querySnapshot.forEach((doc) => {

        packageInfo = doc.data()
        docID = doc.id
        packageInfo["id"] = docID
        allTimePackages.push(packageInfo)

    });

    return allTimePackages
}

// get all uncollected parcels from specific user
async function getOneStudentPackages(searchCIS) {

    var studentPackages = []
    const studentPackagesFirebase = collection(db, collegeName[0], searchCIS, "packages")

    const querySnapshot = await getDocs(studentPackagesFirebase);
    querySnapshot.forEach((doc) => {

        packageInfo = doc.data()
        docID = doc.id
        packageInfo["id"] = docID
        studentPackages.push(packageInfo)

    });

    studentPackages.sort(function (a, b) {
        var aArrivedTime = a.arrivedTime;
        var bArrivedTime = b.arrivedTime;
        if (aArrivedTime > bArrivedTime) {
            return 1;
        } else if (aArrivedTime < bArrivedTime) {
            return -1;
        }
    })

    return studentPackages

}





// read packages using campusCardUID
// const myUID = "04:11:5D:12:28:6B:80";

// (async () => {

//     const q = query(collection(db, "Test College"), where("campusCardUID", "==", myUID));

//     const querySnapshot = await getDocs(q);
//     const id = querySnapshot.docs[0].id
//     console.log(id);

//     const q2 = query(collection(db, "Test College", id, "Packages"), where("collected", "==", false));

//     const querySnapshot2 = await getDocs(q2);
//     querySnapshot2.forEach((doc) => {
//     // doc.data() is never undefined for query doc snapshots
//     console.log(doc.id, " => ", doc.data());
//     console.log(doc.data().arrivedTime.toDate());
//     });
// })()



// read one doc (one student)
// const speical = doc(db, 'Test College/qwwk95')

// async function hi() {
//         const docSnap = await getDoc(speical)
//         console.log(docSnap);
//         if (docSnap.exists()) {
//             console.log("Document data:", docSnap.data());
//           } else {
//             // doc.data() will be undefined in this case
//             console.log("No such document!");
//           }
//     };

// hi()


// write all students to json file
// (async () => {
//     const querySnapshot = await getDocs(collection(db, "John Snow College"));
//     const fileJSON = {}

//     querySnapshot.forEach((doc) => {
//     // doc.data() is never undefined for query doc snapshots
//     console.log(doc.id, " => ", doc.data());
//     console.log(doc.data().fName);

//     fileJSON[doc.id] = {
//         fName: doc.data().fName,
//         lName: doc.data().lName,
//         type: doc.data().type,
//         college: doc.data().college,
//         campusCardUID: doc.data().campusCardUID,
//         email: doc.data().email
//     }

//     console.log(fileJSON);

//     });

//     const fs = require('fs')

//     fs.writeFile('./test.json', JSON.stringify(fileJSON), err => {
//     if (err) {
//         console.error(err)
//         return
//     }
//     //file written successfully
//     })

// })()


// query search last name
// (async () => {

//     searchKey = "CHE"

//     const q = query(collection(db, "John Snow College"), where("lName", ">=", searchKey), where("lName", "<", searchKey + 'z'));

//     const querySnapshot = await getDocs(q);
//     querySnapshot.forEach((doc) => {
//     // doc.data() is never undefined for query doc snapshots
//     console.log(doc.id, " => ", doc.data());
//     });
// })()







// const csv = require('csv-parser')
// const fs = require('fs')
// const results = []

// fs.createReadStream('johnsnow4.csv')
//     .pipe(csv({}))
//     .on('data', (data) => results.push(data))
//     .on('end', () => {
//         console.log(results);

//         var arrayLength = results.length;

//         const docRef = db.collection('John Snow College')

//         for (var i = 0; i < arrayLength; i++) {

//             async function writeStudent(acc, fname, lname, typee, coll, emaill) {

//                 await docRef.doc(acc).set({
//                     fName: fname,
//                     lName: lname,
//                     type: typee,
//                     college: coll,
//                     email: emaill,
//                     campusCardUID: null
//                 });
//             }

//             acc = results[i].Account
//             fname = results[i].FirstName
//             lname = results[i].LastName
//             typee = results[i].OtherFax
//             coll = results[i].Department
//             emaill = results[i].mailDisplayName

//             console.log(fname);

//             writeStudent(acc, fname, lname, typee, coll, emaill)

//             // console.log(results[i].mailDisplayName);
//             //Do something
//         }

//         console.log('Done');
//     })

// async function write() {

//     const docRef = db.collection('Test College').doc('qwwk95');
//     const parRef = db.collection('Test College').doc('qwwk95').collection('Packages');

//     // await docRef.set({
//     // fName: 'AARON',
//     // lName: 'CHEUNG',
//     // type: 'Undergraduate',
//     // college: 'John Snow College',
//     // email: 'CHEUNG, AARON (Student) (aaron.cheung@durham.ac.uk)',
//     // campusCardUID: null
//     // });

//     await parRef.add({
//         arrivedTime: '10:30',
//         arrivedBy: 'Peter the Porter',
//         arrivedEmailSent: '15:00',
//         type: 'Letter',
//         collectedTime: null,
//         givenOutBy: null,
//         reminderEmails: null,
//         collected: false
//     });
// }

// write()



module.exports = { addPackageFirebase, getOneStuAllUncollectedPackages, updateFirebaseToCollected, updateFirebaseToUncollected,
    getRecentCollectedPackages, getCISusingUID, updateCampusCardUID, getAllUncollectedPackages, getAllTimePackages, getOneStudentPackages };