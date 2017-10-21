// @flow
import _ from 'underscore';
import storage from 'electron-json-storage';
import promisify from 'promisify-es6';

import type { CheckoutProfile } from '../globals';

const cache = promisify(storage);

class CacheException extends Error {
  constructor(errorMessage: string) {
    super(errorMessage);

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, CacheException);
  }
}


export const loadProfiles = async () => {
  try {
    const path = await cache.getDataPath();
    console.log(path);
    const profiles = await cache.get('profiles');
    return profiles;
  } catch (e) {
    throw new CacheException(e);
  }
};

export const saveProfiles = async (profiles: Array<CheckoutProfile>) => {
  try {
    await cache.set('profiles', profiles);
  } catch (e) {
    throw new CacheException(e);
  }
};

export const removeProfile = async (id: string) => {
  try {
    const profiles = await cache.get('profiles');
    const prof = _.findWhere(profiles, { id });
    const newProfiles = _.without(profiles, prof);
    await cache.set('profiles', newProfiles);
  } catch (e) {
    throw new CacheException(e);
  }
};
