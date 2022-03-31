const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

function createWindow() {
    const win = new BrowserWindow({
        // width: 800,
        // height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    //   ipcMain.on('collectParcelPage', (event) => {
    //     console.log("You are on collect parcel");
    //   })
    //   ipcMain.on('addParcelPage', (event) => {
    //     console.log("You are on add parcel");
    //   })
    //   ipcMain.on('viewParcelsPage', (event) => {
    //     console.log("You are on view parcels");
    //   })
    //   ipcMain.on('settingsPage', (event) => {
    //     console.log("You are on setting");
    //   })

    var currentPage = ""

    win.webContents.on('did-navigate', (event, url, httpResponseCode, httpStatusText) => {
        const urlArray = url.split("/")
        const htmlText = urlArray[urlArray.length - 1]
        currentPage = htmlText.replace(".html", "")

        console.log(currentPage);

    })


    win.loadFile('src/renderer/collectParcel/collectParcel.html')

    win.webContents.openDevTools();

    win.maximize();

    win.webContents.on('did-finish-load', function () {
        const callNFCReader = require('../readNFC.js');
        callNFCReader(win, currentPage)
        win.show()
    });

}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})



