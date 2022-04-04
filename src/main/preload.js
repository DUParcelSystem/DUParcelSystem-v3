const { getCollegeName } = require('./config.js')
const collegeName = getCollegeName()

window.addEventListener('DOMContentLoaded', () => {

    document.getElementById("title").innerHTML = collegeName[1];

    const url = window.location.href
    const urlArray = url.split("/")
    const htmlText = urlArray[urlArray.length - 1]
    currentPage = htmlText.replace(".html", "")

    console.log(currentPage);

  })


window.addEventListener("beforeunload", () => {
    console.log("before unloaded");

})