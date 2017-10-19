/* eslint-disable import/prefer-default-export */
import _ from 'underscore';
import ShopifyTask from './shopify';
import type { TaskSettings } from '../actions/tasks';

const tasks = [];

export async function startTask(taskData: TaskSettings, updateStatusCallback: Function): boolean {
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

export async function stopTask(taskId: number): boolean {
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
