const pcsclite = require('@aaroncheung430/pcsclite');
const pcsc = pcsclite();


// document.getElementById("nfcReaderText").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill text-danger" viewBox="0 0 16 16">
// // <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
// // </svg> NFC reader not connected`

function callNFCReader(win, currentPage) {

    console.log("checking nfc...");

    win.webContents.send('nfc-connected-main', 'whoooooooh!')

    console.log("current page is ---", currentPage);

    // nfc
    pcsc.on('reader', (reader) => {

        console.log('New reader detected', reader.name);

        win.webContents.send('nfc-connected-main', 'CONNNECT')

    //     document.getElementById("nfcReaderText").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-circle-fill text-success" viewBox="0 0 16 16">
    // <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
    // </svg> NFC reader connected`


        reader.on('error', err => {
            console.log('Error(', reader.name, '):', err.message);
        });

        reader.on('status', (status) => {

            console.log('Status(', reader.name, '):', status);

            // check what has changed
            const changes = reader.state ^ status.state;

            if (!changes) {
                return;
            }

            if ((changes & reader.SCARD_STATE_EMPTY) && (status.state & reader.SCARD_STATE_EMPTY)) {

                console.log("card removed");

                reader.disconnect(reader.SCARD_LEAVE_CARD, err => {

                    if (err) {
                        console.log(err);
                        return;
                    }

                    console.log('Disconnected');

                });

            }
            else if ((changes & reader.SCARD_STATE_PRESENT) && (status.state & reader.SCARD_STATE_PRESENT)) {

                console.log("card inserted");

                win.loadFile('src/renderer/collectParcel/collectParcel.html')

                reader.connect({ share_mode: reader.SCARD_SHARE_SHARED }, (err, protocol) => {

                    if (err) {
                        console.log(err);
                        return;
                    }

                    console.log('Protocol(', reader.name, '):', protocol);

                    // reader.transmit(Buffer.from([0x00, 0xB0, 0x00, 0x00, 0x20]), 40, protocol, (err, data) => {

                    //     if (err) {
                    //         console.log(err);
                    //         return;
                    //     }

                    //     console.log('Data received', data);
                    //     reader.close();
                    //     pcsc.close();

                    // });

                    const packet = new Buffer.from([
                        0xff, // Class
                        0xca, // INS
                        0x00, // P1: Get current card UID
                        0x00, // P2
                        0x00  // Le: Full Length of UID
                    ]);

                    reader.transmit(packet, 40, 2, (err, response) => {

                        if (err) {
                            console.log(err);
                            return;
                        }

                        if (response.length < 2) {
                            console.log(`Invalid response length ${response.length}. Expected minimal length was 2 bytes.`);
                            return;
                        }

                        // last 2 bytes are the status code
                        const statusCode = response.slice(-2).readUInt16BE(0);

                        // an error occurred
                        if (statusCode !== 0x9000) {
                            console.log('Could not get card UID.');
                            return;
                        }

                        // strip out the status code (the rest is UID)
                        const uid = response.slice(0, -2).toString('hex');
                        // const uidReverse = reverseBuffer(response.slice(0, -2)).toString('hex'); // reverseBuffer needs to be implemented

                        const splitUID = uid.replace(/(?<=^(?:.{2})+)(?!$)/g, ':').toUpperCase()

                        console.log('card uid is', splitUID);

                        // document.getElementById("uidOfCampusCard").innerHTML = `Your campus card id is ${splitUID}, it would be great to verify it with the nfc on the phone.`

                    });

                });

            }

        });

        reader.on('end', () => {
            console.log('Reader', reader.name, 'removed');
        //     document.getElementById("nfcReaderText").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill text-danger" viewBox="0 0 16 16">
        // <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
        // </svg> NFC reader not connected`
        });

    });

    pcsc.on('error', err => {
        console.log('PCSC error', err.message);
    });

}

module.exports = callNFCReader;
