/* eslint-disable import/prefer-default-export */
import uuid from 'uuid/v4';
import _ from 'underscore';
import io from 'socket.io-client';
import { AdidasSplash } from './adidas';
import { Shopify } from './shopify';
import type { TaskSettings } from '../actions/tasks';
import type { AppSettings } from '../globals';

const tasks = [];
const captchas = [];
let socket = null;
let addCaptchaCallback = null;
let expireCaptchaCallback = null;


function formatProxiesShopify(proxyList: Array<string>): Array<string> {
  // TODO: format is ip:port[:user:pass]
  const set = [];

  for (let i = 0; i < proxyList.length; i += 1) {
    const data = proxyList[i].split(':');

    if (data.length === 2) {
      set.push(`http://${data[0]}:${data[1]}`);
    } else if (data.length === 4) {
      set.push(`http://${data[2]}:${data[3]}@${data[0]}:${data[1]}`);
    } else {
      console.log(`Unable to parse proxy(${data.join(':')})`);
    }
  }

  return set;
}

export function configure(addCaptcha: Function, expireCaptcha: Function) {
  this.addCaptchaCallback = addCaptcha;
  this.expireCaptchaCallback = expireCaptcha;
}

export function startSocket(cb: ?Function) {
  console.log('Starting socket connection');
  socket = io('http://localhost:8890');

  socket.on('connect', () => cb('Socket connected'));
  socket.on('disconnect', () => startSocket());
  socket.on('captcha', (data) => {
    // received captcha
    const id = uuid();
    const captcha = Object.assign({}, data, {
      id
    });

    cb(captcha);
    captchas.push(captcha);
    // addCaptchaCallback(captcha);
  });
}

function closeSocket() {
  console.log('Closing socket connection');
}

function useCaptcha(c: Object) {
  // expireCaptchaCallback(c.id);
  captchas.splice(captchas.indexOf(c), 1);
  return c.token;
}

export function fetchCaptcha(cb: Function) {
  if (captchas.length > 0) {
    console.log('sending captcha');
    const captcha = captchas[0];
    return cb(useCaptcha(captcha));
  }

  const i = setInterval(() => {
    console.log(`Currently ${captchas.length} captchas in bank`);
    if (captchas.length > 0) {
      const captcha = captchas[0];
      console.log(`Sending captcha: ${captcha.token}`);
      clearInterval(i);
      cb(useCaptcha(captcha));
    }
  }, 500);
}

export async function startTask(
  taskData: TaskSettings,
  appSettings: AppSettings,
  updateStatusCallback: Function
): boolean {
  switch (taskData.type) {
    case 'SHOPIFY': {
      let proxies;
      try {
        proxies = formatProxiesShopify(taskData.proxies.split('\n'));
      } catch (e) {
        console.log('Couldnt parse proxies');
      }

      const task = new Shopify(
        taskData.id,
        {
          base_url: taskData.url,
          keywords: taskData.data.keywords,
          proxies,
          checkout_profile: taskData.checkout_profile,
          userAgent: taskData.data.userAgent,
          size: taskData.data.size
        },
        appSettings,
        updateStatusCallback
      );

      try {
        await task.start();
      } catch (e) {
        console.log('Error starting task');
        return false;
      }

      tasks.push(task);
      return true;
    }
    case 'ADIDAS_SPLASH': {
      // TODO :)
      console.log('Starting adidas splash task');

      let proxies;
      try {
        proxies = formatProxiesShopify(taskData.proxies.split('\n'));
      } catch (e) {
        console.log('Couldnt parse proxies');
      }

      const task = new AdidasSplash(
        taskData.id,
        {
          url: taskData.url,
          pid: taskData.data.keywords[0],
          size: taskData.data.size,
          count: 1,
          checkout_profile: taskData.checkout_profile,
          proxies,
          userAgent: taskData.data.userAgent,
          refreshInterval: 15
        },
        appSettings,
        updateStatusCallback
      );

      try {
        await task.start();
      } catch (e) {
        console.log('Error starting task');
        return false;
      }

      tasks.push(task);
      return true;
    }
    default: {
      console.log('NO TASK TYPE FOUND');
      break;
    }
  }
}

export async function stopTask(taskId: string): boolean {
  const task = _.findWhere(tasks, { id: taskId });

  if (task == null) {
    console.log('Task not found.');
    return false;
  }

  try {
    await task.stop();
    if (tasks.length === 0) {
      closeSocket();
    }

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}
