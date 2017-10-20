// @flow
import uuid from 'uuid/v4';
import type { CheckoutProfile } from '../globals';

export const ADD_PROFILE = 'PROFILE_ADD';
export const REMOVE_PROFILE = 'PROFILE_REMOVE';
export const UPDATE_PROFILE = 'PROFILE_UPDATE';


// TODO: add saga for saving profiles to file.

export function addProfile(profile: CheckoutProfile) {
  const id = uuid();
  const newProfile = Object.assign({}, profile, {
    id
  });
  return {
    type: ADD_PROFILE,
    id,
    data: newProfile
  };
}

export function removeProfile(profileId: string) {
  return {
    type: REMOVE_PROFILE,
    id: profileId
  };
}

export function updateProfile(profileId: string, newData: CheckoutProfile) {
  return {
    type: UPDATE_PROFILE,
    id: profileId,
    data: newData
  };
}
