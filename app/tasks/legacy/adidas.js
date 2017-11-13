var Nightmare = require('nightmare');
var fs = require('fs');
const path = require('path');

const SELECTORS = [
  "#recaptcha-token",
  ".g-recaptcha-response"
];

function init() {
  Nightmare.action('show',
    function(name, options, parent, win, renderer, done) {
      console.log('showing');
      parent.respondTo('show', function(done) {
        win.show();
        done();
      })
    },
    function(done) {
      this.child.call('show', done);
    }
  );
}

init();


let config = null;

let nm = null;
let success = false;


process.on('message', (data) => {
  switch(data.type.toLowerCase()) {
    case 'config':
      data.type = null;
      config = data;
      break;
    case 'start':
      start();
      break;
    default:
      break;
  }
});

function sendStatus(status, running=true) {
  process.send({
      status: status,
      running: running,
      success: success
    });
}

function start() {
  if(config == null) {
    return setTimeout(() => {
      start();
    }, 1000);
  }

  sendStatus("Initializing...");

  // set up nightmare
  var switches = {
    "ignore-certificate-errors": true
  };

  const proxy = config.proxy;

  if (proxy != null) {
    switches["proxy-server"] = (proxy.split(":")[0] + ":" + proxy.split(":")[1]);
  }

  nm = Nightmare({
    electronPath: require("./node_modules/electron"),
    show: false,
    webPreferences: {
      partition: config.id
    },
  }).useragent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36");

  if(proxy.split(":").length == 4) {
    nm.authentication(proxy.split(":")[2], proxy.split(":")[3]).then(()=> {
      launch();
    });
  } else {
    launch();
  }
}

function launch() {
  nm.cookies.clearAll();

  sendStatus("Launching...");
  startNightmare();
}

function startNightmare(relaunch: boolean = false) {
  setTimeout(() => {
    console.log("[ADI] " + (relaunch ? "Relaunching process" : "Starting process") + " #%d", config.id);
    nm
    .goto(config.url)
    .then(() => {
      observe(5000);
    }).catch((err) => {
      nm.end();
      return startNightmare(true);
    });
  }, 1000 * config.id);
}

function observe(interval) {
  nm
  .exists("[data-sitekey]")
  .then((passed) => {
    if(passed) {
      success = true;
      sendStatus("Passed splash", false);
      return nm.show();
    } else {
      nm
      .wait(interval)
      .then(() => {
        return observe(interval);
      }).catch((err) => { console.log("[ADI] error(WAIT): " + err.toString()) });
    }
  }).catch((err) => {
    console.error("[ADI] error(EXISTS): " + err.toString());
  });
}
