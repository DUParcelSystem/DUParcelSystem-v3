const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')
const { getCollegeName } = require('./config.js')

function createWindow() {

    console.log("load every time");

    const collegeName = getCollegeName()

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


    ipcMain.on('print-to-pdf', (event, onTab, onDate) => {
        console.log("going to print");
        console.log("tab", onTab, "date", onDate);

        const pdfPath = path.join(os.homedir(), 'Desktop', 'temp.pdf')
        win.webContents.printToPDF({}).then(data => {
          fs.writeFile(pdfPath, data, (error) => {
            if (error) throw error
            console.log(`Wrote PDF successfully to ${pdfPath}`)
          })
        }).catch(error => {
          console.log(`Failed to write PDF to ${pdfPath}: `, error)
        })

    })



    win.loadFile('src/renderer/collectParcel/collectParcel.html')

    win.webContents.openDevTools();

    win.maximize();

    win.setTitle(collegeName[1])

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

app.on('window-all-closed', () => {
    // if (process.platform !== 'darwin') {
        app.quit()
    // }
})







