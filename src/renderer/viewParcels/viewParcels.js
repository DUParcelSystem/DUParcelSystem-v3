const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDoc, doc, setDoc, getDocs,
    updateDoc, addDoc, serverTimestamp, collectionGroup } = require('firebase/firestore');
const { getAnalytics } = require("firebase/analytics");
require('dotenv').config();

const { ipcRenderer } = require("electron")
ipcRenderer.send('viewParcelsPage')


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
const analytics = getAnalytics(app);


console.log("hi, I am");

document.getElementById("windowtitle").innerHTML = process.env.COLLEGE;
document.getElementById("title").innerHTML = process.env.COLLEGE;




// get all not-collected parcels from all users
// (async () => {
//     // console.log("hiiiii");
//     const museums = query(collectionGroup(db, 'packages'), where('collected', '==', false));

//     const querySnapshot = await getDocs(museums);
//     querySnapshot.forEach((doc) => {
//         console.log(doc.id, ' => ', doc.data());
//     });
//     // console.log("hi");
// })()




// update package data to firebase, when collected package
// (async () => {

//     const packageData = {
//         collectedTime: serverTimestamp(),
//         givenOutBy: "Peter",
//         collected: true
//     }

//     // Add a new document with a generated id.
//     const docRef = await updateDoc(doc(db, "Test College", "qwwk95", "packages", "Mx38pCeqlSKlTAMkCEAG"), packageData);

// })();


// write package data to firebase
// (async () => {

//     const packageData = {
//         arrivedTime: serverTimestamp(),
//         arrivedBy: 'Ben',
//         arrivedEmailSent: null,
//         type: 'Letter',
//         collectedTime: null,
//         givenOutBy: null,
//         reminderEmails: null,
//         collected: false,
//         parcelNo: null,
//         cis: "qwwk95"
//     }

//     // Add a new document with a generated id.
//     const docRef = await addDoc(collection(db, "Test College", "qwwk95", "packages"), packageData);
//     console.log("Document written with ID: ", docRef.id);

// })()




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


// update UID for card
// const myUID = "04:11:5D:12:28:6B:80";

// (async () => {
//     const updateRef = doc(db, "Test College", "qwwk95")

//     await updateDoc(updateRef, {
//         "campusCardUID": myUID
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