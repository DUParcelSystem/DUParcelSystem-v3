const Store = require('electron-store');
const storage = new Store()

function getCollegeName() {
    const defaultCollege = ["Test College", "❄️ John Snow Parcel System 📦"]

    const college = storage.get("college");

    if (college) return college;
    else {
        storage.set("college", defaultCollege)
        return defaultCollege
    }

}


module.exports = { getCollegeName }
