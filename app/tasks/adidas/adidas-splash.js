import { ChildProcess, fork } from 'child_process';
import moment from 'moment';
import chalk from 'chalk';
import Task from '../task';
import type { CheckoutProfile, AppSettings, Captcha } from '../../globals';

export type AdidasConfig = {
  url: string,
  pid: string,
  size: string,
  count: number,
  checkout_profile: CheckoutProfile,
  proxies: Array<string>,
  userAgent: string,
  refreshInterval: number
};

type ChildTask = {
  id: number,
  process: ChildProcess
};

export default class AdidasSplashTask extends Task {
  id: number;
  app: AppSettings;
  config: AdidasConfig;

  taskStartTime: number;
  stopped: boolean = false;

  captchas: Array<Captcha>;
  subTasks: Array<ChildTask> = [];

  timerId: number;
  timerStart: moment;

  statusUpdate: Function;

  constructor(id: number, config: AdidasConfig, app: AppSettings, statusUpdateCallback: Function) {
    super(id);

    this.config = config;
    this.app = app;
    this.statusUpdate = statusUpdateCallback;
  }

  log(message: string) {
    let str = chalk.red('[Adidas Splash]');
    str += chalk.bold(`[${this.id}] `);
    str += message;
    console.log(str);
  }

  async start() {
    this.log('Started task.');
    try {
      this.statusUpdate('0-Starting');

      this.taskStartTime = moment().milliseconds();

      // get amount of full count threads we can run
      const per = Math.floor(this.config.count / 20);
      // remaining count left after full threads (use new thread)
      const remains = this.config.count % 20;

      const x = per + (remains > 0 ? remains : 0);

      for (let i = 0; i < x; i += 1) {
        // TODO: fix
        const proc = fork(
          `${__dirname}/tasks/adidas/lineman.js`,
          {
            execArgv: ['-r babel-register']
          }
        );
        // const proc = exec(`node -r babel-register ${__dirname}/tasks/adidas/lineman.js`);

        proc.send({
          type: 'config',
          taskData: Object.assign({}, this.config, {
            count: (i === (x - 1) ? remains : 20),
            refreshInterval: 20
          })
        });

        proc.send({ type: 'start' });

        this.subTasks.push({
          id: i,
          process: proc
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  async stop() {
    this.stopped = true;
    clearInterval(this.timerId);
    this.statusUpdate('-1-Stopped');
  }
}
