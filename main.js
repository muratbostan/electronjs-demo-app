const { app, BrowserWindow, BrowserView, ipcMain } = require('electron');

let mainWindow;
let views = [];
let activeViewIndex = null;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html'); // Ana pencereyi yükle
    mainWindow.webContents.openDevTools();// consolu açıyor

    ipcMain.handle('create-tab', (event, { title, filePath }) => {
        console.log('create-tab:', { title, filePath }); // Gelen title ve filePath'i loglayın
        const existingTabIndex = views.findIndex(view => view.title === title);
        if (existingTabIndex !== -1) {
            setActiveView(existingTabIndex);
            return;
        }
    
        const view = new BrowserView();
        views.push({ title, view });
        mainWindow.addBrowserView(view);
    
        setBrowserViewBounds(view);
    
        if (typeof filePath === 'string') {
            view.webContents.loadFile(filePath); // Dosyayı yükle
        } else {
            console.error('filePath is not a string:', filePath); // Hatalı durum
        }
    
        setActiveView(views.length - 1);
    });
    

    ipcMain.handle('switch-tab', (event, index) => {
        setActiveView(index);
    });

    ipcMain.handle('close-tab', (event, index) => {
        if (views[index]) {
            mainWindow.removeBrowserView(views[index].view);
            views.splice(index, 1);

            if (activeViewIndex === index) {
                const nextIndex = views.length > 0 ? Math.max(0, index - 1) : null;
                setActiveView(nextIndex);
            }
        }
    });

    function setActiveView(index) {
        if (activeViewIndex !== null && views[activeViewIndex]) {
            mainWindow.removeBrowserView(views[activeViewIndex].view);
        }
        activeViewIndex = index;
        if (index !== null && views[index]) {
            mainWindow.addBrowserView(views[index].view);
            setBrowserViewBounds(views[index].view);
        }
    }

    function setBrowserViewBounds(view) {
        const sidebarWidth = 70;
        const tabBarHeight = 50;

        view.setBounds({
            x: sidebarWidth,
            y: tabBarHeight,
            width: mainWindow.getBounds().width - sidebarWidth,
            height: mainWindow.getBounds().height - tabBarHeight
        });
    }

    mainWindow.on('resize', () => {
        if (activeViewIndex !== null && views[activeViewIndex]) {
            setBrowserViewBounds(views[activeViewIndex].view);
        }
    });
});
