const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const config = require('config');

const currentCollege = config.get('currentCollege');
const displayCollegeName = config.get('displayCollegeName');

function createWindow() {

    console.log("load every time");
    const win = new BrowserWindow({
        // width: 800,
        // height: 600,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    })


    //   ipcMain.on('collectParcelPage', (event) => {
    //     console.log("You are on collect parcel");
    //   })

    win.loadFile('src/renderer/viewParcels/viewParcels.html')

    win.webContents.openDevTools();

    win.maximize();

    win.setTitle(displayCollegeName)

    win.on('did-start-loading', (event) => {
        // contents.savePage(fullPath, saveType)​

        // console.log("did start loading");
      });

    win.on('page-title-updated', (event) => {
        event.preventDefault();
      });

    win.once('ready-to-show', () => {
    const callNFCReader = require('../readNFC.js');
    callNFCReader(win, app)
    })

    win.webContents.on('did-finish-load', function () {
        win.show()
    });


    //   win.on('close', e => {
    //     e.preventDefault()
    //     dialog.showMessageBox({
    //       type: 'info',
    //       buttons: ['Ok', 'Exit'],
    //       cancelId: 1,
    //       defaultId: 0,
    //       title: 'Warning',
    //       detail: 'Hey, wait! There\'s something you should know...'
    //     }).then(({ response, checkboxChecked }) => {
    //       console.log(`response: ${response}`)
    //       if (response) {
    //         win.destroy()
    //         app.quit()
    //       }
    //     })
    //   })

}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

// app.on('window-all-closed', () => {
//     // if (process.platform !== 'darwin') {
//         app.quit()
//     // }
// })

// app.on('before-quit', () => {
//     setTimeout(myGreeting, 5000)
//     console.log("before quit");
// })





