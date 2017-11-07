// @flow
export const TOGGLE_THEME = 'THEME_TOGGLE';
export const UPDATE_SETTINGS = 'SETTINGS_UPDATE';
export const SET_APP_SETTINGS = 'SETTINGS_SET';

export function toggleTheme() {
  return {
    type: TOGGLE_THEME,
  };
}

export function updateSettings(data: Object) {
  return {
    type: UPDATE_SETTINGS,
    payload: data
  };
}

export function setAppSettings(data: Object) {
  return {
    type: SET_APP_SETTINGS,
    payload: data
  };
}
