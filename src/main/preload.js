const config = require('config');
const displayCollegeName = config.get('displayCollegeName');

window.addEventListener('DOMContentLoaded', () => {

    document.getElementById("title").innerHTML = displayCollegeName;

    const url = window.location.href
    const urlArray = url.split("/")
    const htmlText = urlArray[urlArray.length - 1]
    currentPage = htmlText.replace(".html", "")

    console.log(currentPage);

  })


window.addEventListener("beforeunload", () => {
    console.log("before unloaded");

})