/* eslint global-require: 1, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, protocol } from 'electron';

import moment from 'moment';
import path from 'path';
import express from 'express';
import http from 'http';
import socket from 'socket.io';
import bodyParser from 'body-parser';

import MenuBuilder from './menu';

// Start the HTTP server to load Socket.io on
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Lightspeed Update Socket</h1>');
});

server.listen(8890);


const io = socket.listen(server);

const expressApp = express();
let expressServer;

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log);
};


/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  expressServer.close();

  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

protocol.registerStandardSchemes(['test']);

app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }

  expressApp.use(bodyParser.json());
  expressApp.set('views', path.join(__dirname + '/static'));
  expressApp.set('view engine', 'ejs');

  expressApp.get('/captcha', (req, res) => {
    res.render('captchaHarvester', {
      sitekey: req.query.sitekey,
      url: req.query.url
    });
  });

  expressApp.post('/solved', (req, res) => {
    const exp = moment().add(1, 'minute');
    try {
      io.emit('captcha', {
        token: req.body.token,
        expiry: exp,
        source: req.body.source
      });

      res.status(200).send('Done');
    } catch (e) {
      res.status(500).send('Failed');
      console.log(e);
    }
  });

  expressServer = expressApp.listen(9965, () => {
    console.log('Captcha server listening on port 9965');
  });

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    frame: false
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});

export default io;
