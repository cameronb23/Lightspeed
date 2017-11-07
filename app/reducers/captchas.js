/* eslint max-len: 0 */
// @flow
// import _ from 'underscore';
import type { Captcha } from '../globals';

export type actionType = {
  type: string,
  token: string
};

export type captchaStateType = Array<Captcha>;

export default function captchas(state: captchaStateType = [], action: actionType) { // eslint-disable-line max-len
  switch (action.type) {
    default:
      return state;
  }
}
