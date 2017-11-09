/* eslint-disable import/prefer-default-export */
import _ from 'underscore';
import { Shopify } from './shopify/index';
import type { TaskSettings } from '../actions/tasks';
import type { AppSettings } from '../globals';

const tasks = [];


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

export async function startTask(
  taskData: TaskSettings,
  appSettings: AppSettings,
  updateStatusCallback: Function
): boolean {
  console.log(appSettings);
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

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}
