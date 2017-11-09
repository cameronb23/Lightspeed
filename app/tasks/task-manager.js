/* eslint-disable import/prefer-default-export */
import uuid from 'uuid/v4';
import _ from 'underscore';
import io from 'socket.io-client';
import { Shopify } from './shopify/index';
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
  this.captchas.splice(this.captchas.indexOf(c));
  return c;
}

export async function fetchCaptcha() {
  if (captchas.length > 0) {
    const captcha = captchas[0];
    return useCaptcha(captcha);
  }

  const i = setInterval(() => {
    if (captchas.length > 0) {
      const captcha = captchas[0];
      clearInterval(i);
      return useCaptcha(captcha);
    }
  }, 250);
}

export async function startTask(
  taskData: TaskSettings,
  appSettings: AppSettings,
  updateStatusCallback: Function
): boolean {
  if (tasks.length < 1) {
    startSocket();
  }
  switch (taskData.type) {
    case 'SHOPIFY': {
      const proxies = formatProxiesShopify(taskData.proxies.split('\n'));
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
