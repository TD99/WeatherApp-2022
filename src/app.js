/* Require Libs */
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
var cp = require('child_process');

/* Installer => squirrel auto-gen */
var handleSquirrelEvent = function() {
    if (process.platform != 'win32') {
       return false;
    }
 
    function executeSquirrelCommand(args, done) {
       var updateDotExe = path.resolve(path.dirname(process.execPath), 
          '..', 'update.exe');
       var child = cp.spawn(updateDotExe, args, { detached: true });
 
       child.on('close', function(code) {
          done();
       });
    };
 
    function install(done) {
       var target = path.basename(process.execPath);
       executeSquirrelCommand(["--createShortcut", target], done);
    };
 
    function uninstall(done) {
       var target = path.basename(process.execPath);
       executeSquirrelCommand(["--removeShortcut", target], done);
    };
 
    var squirrelEvent = process.argv[1];
 
    switch (squirrelEvent) {
 
       case '--squirrel-install':
          install(app.quit);
          return true;
 
       case '--squirrel-updated':
          install(app.quit);
          return true;
 
       case '--squirrel-obsolete':
          app.quit();
          return true;
 
       case '--squirrel-uninstall':
          uninstall(app.quit);
          return true;
    }
 
    return false;
 };
 
 if (handleSquirrelEvent()) {
    return;
 }

/* Global reference of window object to prevent garbage collection */
let splash;
let win;

/* Start animation */
async function createSplash(){
    /* Create Browser Window */
    splash = new BrowserWindow({
        width: 1000,
        height: 600,
        autoHideMenuBar: true,
        frame: false,
        backgroundColor: "#3b3b3b",
        icon: path.join(__dirname + '/web/assets/favicons/favicon-96x96.ico'),
    })
    splash.loadFile(path.join(__dirname, "web/splash.html"));
}

/* Main Window */
async function createWindow(){
    /* Create Browser Window */
    win = new BrowserWindow({
        width: 1000,
        height: 600,
        autoHideMenuBar: true,
        backgroundColor: "#3b3b3b",
        icon: path.join(__dirname + '/web/assets/favicons/favicon-96x96.ico'),
    });

    /* Load app */
    win.loadFile(path.join(__dirname, "web/index.html"));

    /* Open external Sites in default browser */
    var wc = win.webContents;
    wc.on('will-navigate', function(e, url) {
        if (url != wc.getURL()){
            e.preventDefault();
            require('electron').shell.openExternal(url);
        }
    });
}

/* Show window when ready */
app.on("ready", () => {
    createWindow();
    win.hide();
    createSplash();
    setTimeout(() => {
        win.show();
        splash.close();
    }, 3000);
});

/* Auto quit process */
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") { /* MacOS */
      app.quit();
    }
  });

/* Auto show */
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});