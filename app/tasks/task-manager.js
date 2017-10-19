/* eslint-disable import/prefer-default-export */
import ShopifyTask from './shopify';
import type { TaskSettings } from '../actions/tasks';

let tasks = [];

export async function startTask(taskData: TaskSettings, updateStatusCallback: Function) {
  switch (taskData.type) {
    case 'SHOPIFY': {
      const task = new ShopifyTask(
        taskData.id,
        {
          base_url: taskData.url,
          keywords: taskData.data.keywords,
          proxies: taskData.proxies,
          checkout_profile: taskData.checkout_profile,
          userAgent: taskData.data.userAgent
        },
        updateStatusCallback
      );

      task.start();
      tasks.push(task);
      return true;
    }
    default: {
      console.log('NO TASK TYPE FOUND');
      break;
    }
  }
}
