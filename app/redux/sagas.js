import { call, put, takeEvery, select } from 'redux-saga/effects';
import { UPDATE_SETTINGS } from '../actions/app';
import { ADD_PROFILE, UPDATE_PROFILE, REMOVE_PROFILE } from '../actions/profiles';
import { saveProfiles, removeProfile, saveSettings } from '../utils/cache';

export const getProfiles = (state) => state.profiles;
export const getAppSettings = (state) => state.app;

function* updateProfileStore(action: Object) {
  try {
    let profiles = null;
    // blah do something here
    switch (action.type) {
      case ADD_PROFILE:
        profiles = yield select(getProfiles);
        yield call(saveProfiles, profiles);
        break;
      case UPDATE_PROFILE:
        profiles = yield select(getProfiles);
        yield call(saveProfiles, profiles);
        break;
      case REMOVE_PROFILE:
        yield call(removeProfile, action.id);
        break;
      default:
        break;
    }
  } catch (e) {
    yield put({ type: 'UPDATE_CACHE_FAILED', message: e.message });
  }
}

export function* updateProfileStoreSaga() {
  yield takeEvery([
    ADD_PROFILE,
    UPDATE_PROFILE,
    REMOVE_PROFILE
  ], updateProfileStore);
}


function* updateSettingsStore() {
  try {
    const settings = yield select(getAppSettings);
    yield call(saveSettings, settings);
  } catch (e) {
    yield put({ type: 'UPDATE_CACHE_FAILED', message: e.message });
  }
}

export function* updateSettingsStoreSaga() {
  yield takeEvery([
    UPDATE_SETTINGS
  ], updateSettingsStore);
}
