// @flow
import puppeteer from 'puppeteer';
import moment from 'moment';
import async from 'async';

// const proxy = 'http://trrrrr:mMgDnVge@ys.rapid-connect.co:33128';

type TaskStatus = {
  running: boolean,
  step: string,
  statusString: string
};

type ActionType = {
  type: string,
  taskId: ?string,
  taskData: ?AdidasConfig,
  options: ?Array<string>
};

type AdidasConfig = {
  url: string,
  refreshInterval: number,
  pid: string,
  sizes: Array<string>,
  count: number,
  proxies: Array<string>
};

type BrowserInstance = {
  running: boolean,
  id: number,
  instance: Object,
  startTime: Date,
  proxy: string,
  step: string
};

process.on('action', async (data: ActionType) => {
  switch (data.type.toLowerCase()) {
    case 'config':
      if (!data.taskData) {
        throw new Error('No valid task data supplied to arguments');
      }

      config = data.taskData;
      break;
    case 'start':
      await start();
      break;
    case 'stop':
      await stop();
      break;
    default:
      break;
  }
});


function sendStatusUpdate(status) {
}

function sendStatus() {
  const x = [];
  browsers.forEach(inst => x.push({id: inst.id, running: inst.running, status: inst.step}));
  process.send({
    instances: x
  });
}

let status: TaskStatus = {
  running: false,
  step: 'Unitialized',
  statusString: 'NULL'
};

let config: AdidasConfig;
let browsers: Array<BrowserInstance>;


async function start() {
  let proxyIndex = 0;
  for (let x = 0; x < config.count; x += 1) {
    proxyIndex += 1;
    if (proxyIndex > config.proxies.length) {
      proxyIndex = 0;
    }

    initBrowser(x, config.proxies[proxyIndex]);
  }
}

function initBrowser(id: number, proxy: string) {
  setTimeout(async () => {
    const args = [];
    if (proxy) {
      // this is just IP:port
      args.push(`--proxy-server=${proxy}`);
    }

    const browser = await puppeteer.launch({ ignoreHTTPSErrors: true, args });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');

    // TODO: fix
    await page.authenticate({ username: 'postman', password: 'password' });

    const instance: BrowserInstance = {
      id,
      running: true,
      instance: browser,
      page,
      startTime: new Date(),
      proxy,
      step: 'Initializing'
    };

    browsers.push(instance);
  }, 500 * id);
}

async function stop() {
  browsers.forEach(instance => {
    await instance.instance.close();
  })
}

async function go(page) {
  try {
    await page.goto('http://www.adidas.com/us/apps/yeezy', { timeout: 60000 });
  } catch (e) {
    console.log('Error loading page: ', e);
    return go(page);
  }
}

async function startBrowsers() {
  const tasks = [];

  browsers.forEach((browser: BrowserInstance) => {
    tasks.push(async function() {
      await go(page);

      const tid = setInterval(() => {
        // do something
        const passed = await page.$('div#g-recaptcha.g-recaptcha') != null;

        if (passed) {
          clearInterval(tid);
          console.log('Passed splash');
        }
      });
    })
  });

  async.parallel(tasks);
}
