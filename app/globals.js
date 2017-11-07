// @flow

export type CheckoutProfile = {
  id: string,
  title: string,
  email: string,
  firstName: string,
  lastName: string,
  address1: string,
  address2: string,
  zip: string,
  city: string,
  state: string,
  country: string,
  phoneNumber: string,
  payment: {
    cardNumber: string,
    cardName: string,
    cvv: string,
    expMonth: number,
    expYear: number
  }
};

export type AppSettings = {
  theme: Object,
  captcha_keys: {
    '2captcha': string,
    'anticaptcha': string,
    'captchasolutions': string,
    'deathbycaptcha': string
  }
};

export type Captcha = {
  token: string,
  expiry: Date,
  source: string
};


// Captchatronix, Image typerz, captcha destroyer
