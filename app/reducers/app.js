// @flow
/* eslint-disable quote-props */
import { TOGGLE_THEME, UPDATE_SETTINGS, SET_APP_SETTINGS } from '../actions/app';
import type { AppSettings } from '../globals';

export type actionType = {
  type: string,
  payload: Object
};

const defaultState = {
  theme: {
    palette: {
      type: 'dark' // Switching the dark mode on is a single property value change.
      // primary: amber
    },
  },
  captcha_keys: {
    '2captcha': 'SKRT',
    'anticaptcha': null,
    'captchasolutions': null,
    'deathbycaptcha': null
  },
};

export default function app(state: AppSettings = defaultState, action: actionType) {
  let newTheme = 'dark';

  switch (action.type) {
    case TOGGLE_THEME:
      if (state.theme.palette.type === 'dark') {
        newTheme = 'light';
      }

      return Object.assign({}, state, {
        theme: {
          palette: {
            type: newTheme
          }
        }
      });
    case UPDATE_SETTINGS:
      return Object.assign({}, state, action.payload);
    case SET_APP_SETTINGS:
      if (action.payload == null) {
        console.log('Must provide data.');
        return state;
      }

      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
}
