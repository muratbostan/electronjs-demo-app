
const { app, BrowserWindow } = require('electron');

const path = require('path');

//Hot reload - arayüzde yapılan değişikliklerde programı aç kapata gerek kalmaması için eklendi
require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'), 
    ignored: /node_modules|[\/\\]\./, 
});

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    mainWindow.loadFile('index.html');
    mainWindow.webContents.openDevTools();// consolu açıyor
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
