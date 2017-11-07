// @flow
import type { CheckoutProfile } from '../globals';
import type { TaskType } from '../reducers/tasks';
import { startTask, stopTask } from '../tasks/task-manager';

export const ADD_TASK = 'TASK_ADD';
export const UPDATE_TASK = 'UPDATE_TASK_STATUS';
export const REMOVE_TASK = 'REMOVE_TASK_DATA';
export const START_TASK = 'TASK_START';
export const STOP_TASK = 'TASK_STOP';

let counter = 0;

export type TaskSettings = {
  type: string,
  url: string,
  checkout_profile: CheckoutProfile,
  data: Object,
  proxies: Array<string>,
  status: string
};

export function addTask(settings: TaskSettings) {
  counter += 1;
  return {
    type: ADD_TASK,
    id: counter,
    data: {
      type: settings.type,
      url: settings.url,
      data: settings.data,
      proxies: settings.proxies,
      checkout_profile: settings.checkout_profile,
      status: '0-Idle'
    }
  };
}

export function removeTask(taskId: number) {
  return {
    type: REMOVE_TASK,
    id: taskId
  };
}

export function sendStartCommand(task: TaskType) {
  // $FlowFixMe
  return (dispatch, getState) => {
    const { app } = getState();

    dispatch({
      type: START_TASK,
      payload: startTask(task, app, (status) => { dispatch(updateTaskStatus(task.id, status)); })
    }).catch(err => {
      console.log(err);
    });
  };
}

export function sendStopCommand(task: TaskType) {
  // $FlowFixMe
  return dispatch => dispatch({
    type: STOP_TASK,
    payload: stopTask(task.id)
  }).catch(err => {
    console.log(err);
  });
}

export function updateTaskStatus(id: number, status: string) {
  return {
    type: UPDATE_TASK,
    id,
    status
  };
}
