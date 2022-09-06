// Modules to control application life and create native browser window
const {app, BrowserWindow, nativeImage, ipcMain, globalShortcut} = require('electron')
const path = require('path')
const host_file_name = 'host'

let indexWindow = null, mainWindow = null;

function createWindow (host_file) {
  // Create the browser window.
  indexWindow = new BrowserWindow({
    width: 800,
    height: 600,
    center: true,
    icon: nativeImage.createFromPath('icon.ico'),
    frame: false,
    backgroundColor: 'rgba(255, 255, 255, 0)',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  // and load the index.html of the app.
  indexWindow.loadFile('index.html')
  // mainWindow.loadURL('http://grand.thesmartkitchen.online')

  // Open the DevTools.
  // indexWindow.webContents.openDevTools()
  indexWindow.webContents.on('did-finish-load',function (){
    indexWindow.webContents.send('host-file',host_file)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  globalShortcut.register('CommandOrControl+F11', () => {
    let currentWindow = BrowserWindow.getFocusedWindow();
    if(currentWindow.isFullScreen()) currentWindow.setFullScreen(false)
    else currentWindow.setFullScreen(true)
  })

  globalShortcut.register('CommandOrControl+F12', () => {
    let AllWindows = BrowserWindow.getAllWindows();
    AllWindows.forEach(win => win.close())
    indexWindow = null; mainWindow = null;
    app.quit()
  })

  const host_file = path.join(app.getPath('userData'),host_file_name);
  createWindow(host_file)

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(host_file)
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('host',function(event, host){
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    center: true,
    kiosk: true,
    icon: nativeImage.createFromPath('icon.ico'),
    frame: false,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: false,
    }
  })
  mainWindow.loadURL(host)
  mainWindow.webContents.on('did-finish-load',function (){
    if(indexWindow) indexWindow.webContents.send('loaded')
  })

})

ipcMain.on('start',function(event, host){
  mainWindow.show(); mainWindow.focus();
  if(indexWindow) indexWindow.close(); indexWindow = null;
})
