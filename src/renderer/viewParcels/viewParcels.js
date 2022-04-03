const { getAllUncollectedPackages } = require('../firebase.js');

const searchByUncollectedBtn = document.getElementById("searchByUncollectedBtn")
const searchByArrivedDateBtn = document.getElementById("searchByArrivedDateBtn")
const searchByCollectedDateBtn = document.getElementById("searchByCollectedDateBtn")
const searchByStudentBtn = document.getElementById("searchByStudentBtn")

const tabAllUncollected = document.getElementById("tabAllUncollected")
const tabByArrivedDate = document.getElementById("tabByArrivedDate")
const tabByCollectedDate = document.getElementById("tabByCollectedDate")
const tabByCIS = document.getElementById("tabByCIS")

searchByUncollectedBtn.addEventListener('click', () => {
    console.log("all uncollected");

    if (searchByUncollectedBtn.classList.contains("active")) {
        console.log("clicked again");
        return
    }

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
    console.log("by arrived date");

    if (searchByArrivedDateBtn.classList.contains("active")) {
        console.log("clicked again");
        return
    }

    searchByUncollectedBtn.classList.remove("active");
    searchByArrivedDateBtn.classList.add("active")
    searchByCollectedDateBtn.classList.remove("active")
    searchByStudentBtn.classList.remove("active")

    tabAllUncollected.style.display = "none"
    tabByArrivedDate.style.display = "block"
    tabByCollectedDate.style.display = "none"
    tabByCIS.style.display = "none"

})

searchByCollectedDateBtn.addEventListener('click', () => {
    console.log("by date");

    if (searchByCollectedDateBtn.classList.contains("active")) {
        console.log("clicked again");
        return
    }

    searchByUncollectedBtn.classList.remove("active");
    searchByArrivedDateBtn.classList.remove("active")
    searchByCollectedDateBtn.classList.add("active")
    searchByStudentBtn.classList.remove("active")

    tabAllUncollected.style.display = "none"
    tabByArrivedDate.style.display = "none"
    tabByCollectedDate.style.display = "block"
    tabByCIS.style.display = "none"

})

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

