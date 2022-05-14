# Durham University Parcel System

## About this project

In my university accommodation, the reception receives hundreds and hundreds of parcels and letters every day for students. Currently, the receptionist will mark down the students' names of each parcel or letter, enter their names into the computer and send individual emails to students, which is time-consuming and inefficient.

So I decided to create this project as a proof of concept and present it to my university, which aims to reduce to workload for receptionists and increase the efficiency of notifying students and when a student is collecting parcels. Here are the main functionalities of my desktop app:
- search students' name
- send notification emails to students when the parcel arrives at the reception
- send reminder emails to students after the parcel arrives for a period of time
- store parcels' information into a database (including arrival time, notification email sent time, etc.)
- integral with campus card for the student to collect their parcel by tapping

This is a desktop app developed with Electron and Firebase.

You may check out this [demo video](https://durhamuniversity-my.sharepoint.com/:v:/g/personal/qwwk95_durham_ac_uk/EcVtkxEUnKVPkAFh3481g5kBK3vL_6hfEWOhWFfGzMGqRw?e=a6bTpK) to have a sneak peek of how this project works.

## Get started

Clone this project to your environment and run these commands within the directory.

```
npm install     // install node modules
npm run start   // start electron app
```

## Known issue

Currently, there is a known issue on Windows. When starting the app on Windows, it might not responds or take forever to load. This issue is due to an NFC library issue. While on macOS works fine. A new update of the app version is currently under development. Thank you for your patience.
