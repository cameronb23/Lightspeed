// @flow

import request from 'request-promise';
import cheerio from 'cheerio';
import chalk from 'chalk';
import moment from 'moment';
import _ from 'underscore';
import { format } from 'libphonenumber-js';

import { fetchCaptcha } from '../task-manager';
import { scanAtom } from './shopify_monitor';
import { solve } from '../../utils/captcha_utils';
import Task from '../task';
import { States } from '../../utils/states';
import type { CheckoutProfile, AppSettings, Captcha } from '../../globals';

type ShopifyConfig = {
  base_url: string,
  keywords: Array<string>,
  checkout_profile: CheckoutProfile,
  userAgent: string,
  proxies: Array<string>,
  size: string
};

type SessionConfig = {
  checkout_url: string,
  current_url: string,
  auth_token: string,
  storeId: string,
  // HACK - disabling line due to no CookieJar object available from Request-Promise
  cookieJar: Object, // eslint-disable-line flowtype/no-weak-types
  checkoutId: string,
  currentStep: string,
  sitekey: string,
  shipping_methods: ?Array<ShippingMethod>,
  payment_vals: ?PaymentValues,
  oos: boolean,
  proxy: ?string
};

type ShippingMethod = {
  id: string,
  price: number
};

type PaymentValues = {
  gateway: string,
  sessionToken: ?string
};

type ItemVariant = {
  handle: string,
  id: string
};

function CheckoutException(errorMessage: string) {
  this.value = errorMessage;
  (this.prototype: any).toString = () => `Checkout Exception(${this.message})`; // eslint-disable-line flowtype/no-weak-types
}

function getProxy(proxies: Array<string>) {
  if (proxies.length === 0) return null;
  return proxies[Math.floor(Math.random() * proxies.length)];
}

function passesDot(size, str) {
  if (!str || str === '') return false;
  return str.toLowerCase() === size || str.toLowerCase() === size.replace('.', ',');
}

async function findVariant(config: ShopifyConfig, handle: string) {
  const proxy = getProxy(config.proxies);
  const opts = {
    url: `${config.base_url}/products/${handle}.json`,
    method: 'GET',
    headers: {
      Origin: config.base_url,
      'User-Agent': config.userAgent,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.8'
    },
    json: true
  };

  if (proxy != null) {
    opts.proxy = proxy;
  }

  const json = await request(opts);

  const variants = json.product.variants;

  if (config.size.endsWith('_S')) {
    // shoe size
    const desiredSize = config.size.replace('_S', '');

    const matchDot = _.findWhere(variants, { title: desiredSize });
    const matchComma = _.findWhere(variants, { title: desiredSize.replace('.', ',') });
    let matchOpts = null;

    matchOpts = variants.filter(v => passesDot(desiredSize, v.option1) ||
              passesDot(desiredSize, v.option2) ||
              passesDot(desiredSize, v.option3));

    console.log(matchOpts);


    let match = null;

    if (matchComma !== undefined) {
      match = matchComma;
    } else if (matchDot !== undefined) {
      match = matchDot;
    }

    if (matchOpts != null) {
      match = matchOpts[0];
    }

    if (match !== null) {
      return {
        handle,
        id: match.id
      };
    }
  } else if (config.size.endsWith('_A')) {
    // apparel / clothing size
    const desiredSize = config.size.replace('_A', '').toLowerCase();

    const match = _.findWhere(variants, { title: desiredSize });
    let matchOpts = null;

    matchOpts = variants.filter(v => passesDot(desiredSize, v.option1) ||
              passesDot(desiredSize, v.option2) ||
              passesDot(desiredSize, v.option3));

    if (matchOpts != null) {
      return {
        handle,
        id: matchOpts[0].id
      };
    } else if (match != null) {
      return {
        handle,
        id: match.id
      };
    }
  } else if (config.size.endsWith('_MISC')) {
    // miscellaneous size
    const desiredSize = config.size.replace('_MISC', '').toLowerCase();

    const match = _.findWhere(variants, { title: desiredSize });
    let matchOpts = null;

    matchOpts = variants.filter(v => passesDot(desiredSize, v.option1) ||
              passesDot(desiredSize, v.option2) ||
              passesDot(desiredSize, v.option3));

    if (matchOpts != null) {
      return {
        handle,
        id: matchOpts[0].id
      };
    } else if (match != null) {
      return {
        handle,
        id: match.id
      };
    }
  }
}

function addToCart(
  config: ShopifyConfig,
  item: ItemVariant
): Promise<Object> { // eslint-disable-line flowtype/no-weak-types
  return new Promise(async (resolve, reject) => {
    const cookies = request.jar();
    const proxy = getProxy(config.proxies);
    const opts = {
      url: `${config.base_url}/cart/${item.id}:1`,
      method: 'GET',
      headers: {
        Origin: config.base_url,
        'User-Agent': config.userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        Referer: `${config.base_url}/products/${item.handle}`,
        'Accept-Language': 'en-US,en;q=0.8'
      },
      resolveWithFullResponse: true,
      followAllRedirects: true,
      jar: cookies
    };

    if (proxy != null) {
      opts.proxy = proxy;
    }

    try {
      const response = await request(opts);
      const $ = await cheerio.load(response.body);
      const checkout = response.request.uri.href;
      let oos = false;

      if (checkout.includes('/stock_problems')) {
        oos = true;
      }

      const urlData = checkout.replace(`${config.base_url}/`, '');

      const urlSplit = urlData.split('/checkouts/');
      const store = urlSplit[0];
      const id = urlSplit[1];

      const ANCHOR = 'https://www.google.com/recaptcha/api2/anchor?k=';
      const ANCHOR_BACKUP = 'https://www.google.com/recaptcha/api/fallback?k=';

      const token = $('input[name="authenticity_token"]').val();
      let sitekey = null;
      if (response.body.includes(ANCHOR)) {
        sitekey = response.body.split(ANCHOR)[1];
        sitekey = sitekey.split('&')[0];
      } else if (response.body.includes(ANCHOR_BACKUP)) {
        sitekey = response.body.split(ANCHOR_BACKUP)[1];
        sitekey = sitekey.split('"')[0];
      }

      return resolve({
        checkout_url: checkout,
        current_url: checkout,
        storeId: store,
        auth_token: token,
        cookieJar: cookies,
        checkoutId: id,
        sitekey,
        currentStep: 'contact_information',
        shipping_methods: null,
        payment_vals: null,
        oos,
        proxy: proxy != null ? proxy : null
      });
    } catch (e) {
      return reject(e);
    }
  });
}

function sendContactInfo(
  config: ShopifyConfig,
  session: SessionConfig,
  recaptchaResponse: ?string
): Promise<*> {
  return new Promise(async (resolve, reject) => {
    // check for /products.json availability
    const profile = config.checkout_profile;

    // const parsedPhone = parse(profile.phoneNumber).phone;

    // if (!isValidNumber(parsedPhone)) {
    //   return reject('Error in phone formatting.');
    // }

    const phone = format(profile.phoneNumber, 'National');

    let state = profile.state;

    const possibleState = _.findWhere(States, { abbreviation: profile.state });

    if (possibleState != null) {
      state = possibleState.name;
    }

    const form = {
      utf8: '✓',
      _method: 'patch',
      authenticity_token: session.auth_token,
      previous_step: 'contact_information',
      step: 'shipping_method',
      button: '',
      'checkout[email]': profile.email,
      'checkout[buyer_accepts_marketing]': 0,
      'checkout[shipping_address][first_name]': profile.firstName,
      'checkout[shipping_address][last_name]': profile.lastName,
      'checkout[shipping_address][company]': '',
      'checkout[shipping_address][address1]': profile.address1,
      'checkout[shipping_address][address2]': profile.address2,
      'checkout[shipping_address][city]': profile.city,
      'checkout[shipping_address][country]': profile.country,
      'checkout[shipping_address][province]': state,
      'checkout[shipping_address][zip]': profile.zip,
      'checkout[shipping_address][phone]': phone,
      'checkout[client_details][browser_width]': 1366,
      'checkout[client_details][browser_height]': 581,
      'checkout[client_details][javascript_enabled]': 1
    };

    if (recaptchaResponse != null) {
      /* $FlowIssue - Optional param */
      form['g-recaptcha-response'] = recaptchaResponse;
    }

    const opts = {
      url: `${session.checkout_url}`,
      method: 'POST',
      headers: {
        Origin: config.base_url,
        'User-Agent': config.userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        // Referer: `${session.checkout_url}`,
        'Accept-Language': 'en-US,en;q=0.8'
      },
      resolveWithFullResponse: true,
      followAllRedirects: true,
      jar: session.cookieJar,
      form
    };

    if (session.proxy != null) {
      opts.proxy = session.proxy;
    }

    try {
      const response = await request(opts);

      let oos = false;
      const newUrl = response.request.uri.href;

      if (newUrl.includes('/stock_problems')) {
        oos = true;
      }

      const $ = await cheerio.load(response.body);
      const token = $('input[name="authenticity_token"]').val();

      const newSession = Object.assign({}, session, {
        auth_token: token,
        oos
      });

      return resolve(newSession);
    } catch (e) {
      return reject(e);
    }
  });
}

/* $FlowFixMe - Line 221 is circular, fix */
async function retrieveShippingRates(session: SessionConfig, config: ShopifyConfig): SessionConfig {
  const baseUrl = session.checkout_url.split('?')[0];
  const url = `${baseUrl}/shipping_rates?step=shipping_method`;
  const opts = {
    url,
    method: 'GET',
    headers: {
      Origin: config.base_url,
      'User-Agent': config.userAgent,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      Referer: `${session.checkout_url}?step=contact_information`,
      'Accept-Language': 'en-US,en;q=0.8',
      'X-Requested-With': 'XMLHttpRequest'
    },
    jar: session.cookieJar,
    resolveWithFullResponse: true,
  };

  if (session.proxy != null) {
    opts.proxy = session.proxy;
  }

  try {
    const response = await request(opts);
    if (response.statusCode !== 200) {
      // TODO: fix
      return retrieveShippingRates(session, config);
    }

    const newUrl = response.request.uri.href;
    let oos = false;

    if (newUrl.includes('/stock_problems')) {
      oos = true;
    }

    const $ = await cheerio.load(response.body);
    const elements = $('[data-checkout-total-shipping-cents]');

    const items = elements.map((index, el) => {
      const obj = $(el);
      return {
        id: obj.val(),
        price: obj.data('checkout-total-shipping-cents')
      };
    }).get();

    const token = $('input[name="authenticity_token"]').val();

    const newSession = Object.assign({}, session, {
      auth_token: token,
      shipping_methods: items,
      oos
    });

    return newSession;
  } catch (e) {
    throw e;
  }
}

function sendShippingMethod(
  method: ShippingMethod,
  session: SessionConfig,
  config: ShopifyConfig
): Promise<*> {
  return new Promise(async (resolve, reject) => {
    const opts = {
      url: `${session.checkout_url}?previous_step=shipping_method&step=payment_method`,
      method: 'POST',
      headers: {
        Origin: config.base_url,
        'User-Agent': config.userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        // Referer: `${session.checkout_url}?step=payment_method&previous_step=shipping_method`,
        'Accept-Language': 'en-US,en;q=0.8'
      },
      resolveWithFullResponse: true,
      followAllRedirects: true,
      jar: session.cookieJar,
      form: {
        utf8: '✓',
        _method: 'patch',
        authenticity_token: session.auth_token,
        previous_step: 'shipping_method',
        step: 'payment_method',
        button: '',
        'checkout[shipping_rate][id]': method.id,
        'checkout[client_details][browser_width]': 1366,
        'checkout[client_details][browser_height]': 581,
        'checkout[client_details][javascript_enabled]': 1
      }
    };

    if (session.proxy != null) {
      opts.proxy = session.proxy;
    }

    try {
      const response = await request(opts);

      if (response.statusCode !== 200) {
        return reject(response.statusCode);
      }

      const newUrl = response.request.uri.href;
      let oos = false;

      if (newUrl.includes('/stock_problems')) {
        oos = true;
      }

      const $ = await cheerio.load(response.body);

      const token = $('input[name="authenticity_token"]').val();
      const gateway = $('.card-fields-container').data('subfields-for-gateway');

      const newSession = Object.assign({}, session, {
        auth_token: token,
        payment_vals: {
          gateway,
          sessionToken: null
        },
        oos
      });

      return resolve(newSession);
    } catch (e) {
      return reject(e);
    }
  });
}

function sendPayment(session: SessionConfig, config: ShopifyConfig): Promise<*> {
  return new Promise(async (resolve, reject) => {
    const payment = config.checkout_profile.payment;
    let cardNum = payment.cardNumber.match(/.{1,4}/g);

    if (cardNum == null) {
      return reject('Unable to parse payment information: card');
    }
    cardNum = cardNum.join(' ');

    const cardData = {
      complete: '1',
      credit_card: {
        number: cardNum,
        verification_value: payment.cvv,
        name: payment.cardName,
        month: parseInt(payment.expMonth, 10),
        year: payment.expYear
      }
    };

    const opts = {
      url: 'https://elb.deposit.shopifycs.com/sessions',
      method: 'POST',
      headers: {
        'User-Agent': config.userAgent
      },
      followAllRedirects: true,
      jar: session.cookieJar,
      body: cardData,
      json: true
    };

    if (session.proxy != null) {
      opts.proxy = session.proxy;
    }

    try {
      const json = await request(opts);

      const paymentVals = session.payment_vals;

      if (paymentVals == null) {
        return reject('No payment details!');
      }

      const newSession = Object.assign({}, session, {
        payment_vals: {
          gateway: paymentVals.gateway,
          sessionToken: json.id
        }
      });

      return resolve(newSession);
    } catch (e) {
      return reject(e);
    }
  });
}

async function validatePayment(session: SessionConfig, config: ShopifyConfig): Promise<*> {
  const profile = config.checkout_profile;

  const paymentVals = session.payment_vals;

  if (paymentVals == null) {
    throw new CheckoutException('No payment details!');
  }

  const opts = {
    url: `${session.checkout_url.split('?')[0]}`,
    method: 'POST',
    headers: {
      Origin: config.base_url,
      'User-Agent': config.userAgent,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      Referer: `${session.checkout_url}?step=payment_method&previous_step=shipping_method`,
      'Accept-Language': 'en-US,en;q=0.8'
    },
    resolveWithFullResponse: true,
    followAllRedirects: true,
    jar: session.cookieJar,
    form: {
      utf8: '✓',
      _method: 'patch',
      authenticity_token: session.auth_token,
      previous_step: 'payment_method',
      step: '',
      button: '',
      complete: '1',
      s: paymentVals.sessionToken,
      'checkout[email]': profile.email,
      'checkout[buyer_accepts_marketing]': 0,
      'checkout[billing_address][first_name]': profile.firstName,
      'checkout[billing_address][last_name]': profile.lastName,
      'checkout[billing_address][company]': '',
      'checkout[billing_address][address1]': profile.address1,
      'checkout[billing_address][address2]': profile.address2,
      'checkout[billing_address][city]': profile.city,
      'checkout[billing_address][country]': 'United States',
      'checkout[billing_address][province]': profile.state,
      'checkout[billing_address][zip]': profile.zip,
      'checkout[billing_address][phone]': profile.phoneNumber,
      'checkout[credit_card][vault]': 'false',
      'checkout[payment_gateway]': paymentVals.gateway,
      'checkout[client_details][browser_width]': 1366,
      'checkout[client_details][browser_height]': 581,
      'checkout[client_details][javascript_enabled]': 1
    },
  };

  if (session.proxy != null) {
    opts.proxy = session.proxy;
  }

  try {
    const response = await request(opts);
    const url = response.request.uri.href;

    if (url.includes('/processing')) {
      return true;
    } else if (url.includes('?validate=true')) {
      throw new CheckoutException('Payment declined');
    } else if (url.includes('/stock_problems')) {
      throw new CheckoutException('Out of Stock');
    }

    throw new CheckoutException('Error submitting payment.');
  } catch (e) {
    throw new CheckoutException('Request error');
  }
}

class ShopifyTask extends Task {
  id: number;
  app: AppSettings;
  config: ShopifyConfig;
  session: ?SessionConfig = null;
  product: ?ItemVariant = null;
  taskStartTime: number;
  stopped: boolean = false;

  captchas: Array<Captcha>;

  timerId: number;
  timerStart: moment;

  statusUpdate: Function;

  constructor(
    id: number,
    config: ShopifyConfig,
    appSettings: AppSettings,
    statusUpdateCallback: Function
  ) {
    super(id);
    this.config = config;
    this.app = appSettings;
    this.statusUpdate = statusUpdateCallback;

    console.log('initialized');
  }

  async start() {
    this.log('Started task.');
    try {
      this.statusUpdate('0-Starting');
    } catch (e) {
      console.log(e);
    }

    // TODO: initialize websocket


    this.taskStartTime = moment().milliseconds();
    this.scan();
  }

  async stop() {
    this.stopped = true;
    clearInterval(this.timerId);
    this.statusUpdate('-1-Stopped');
  }

  startTime(time: moment) {
    this.timerStart = time;
  }

  endTime(time: moment, message: string, final: boolean = false) {
    const startTime = final ? this.taskStartTime : this.timerStart;
    const dur = moment.duration(time.diff(startTime));
    const durText = chalk.blue(dur.milliseconds());

    this.log(`${message} [${durText}ms]`);
    return dur;
  }

  log(message: string) {
    let str = chalk.blue('[Shopify]');
    str += chalk.bold(`[${this.id}] `);
    str += message;
    console.log(str);
  }

  scan() {
    // scan for a product using sitemap or products.json
    this.startTime(moment());
    this.log('Scanning for product.');
    this.statusUpdate('0-Scanning for product.');
    this.timerId = setInterval(async () => {
      const matches = await scanAtom(this.config);
      console.log(`TYPE: ${typeof matches}`);
      console.log(matches);

      if (matches.length > 0) {
        // TODO: PROMPT FOR INPUT
        const prod = matches[0];

        const variant = await findVariant(this.config, prod.handle);

        if (variant == null) {
          console.log('Size not found.');
          clearInterval(this.timerId);
          this.statusUpdate('-1-Size not loaded');
        } else {
          this.product = variant;
          console.log(`Found product with handle "${prod.handle}" and ID ${variant.id}`);

          this.endTime(moment(), 'Product found.');
          clearInterval(this.timerId);
          this.atc();
        }
      }
    }, 1500);
  }

  async atc() {
    if (this.stopped) {
      return;
    }

    this.startTime(moment());
    this.log('Adding to cart.');
    this.statusUpdate('0-Adding to cart.');

    if (this.product == null) {
      console.log('Unable to add to cart! Product not found!');
      return;
    }

    try {
      this.session = await addToCart(this.config, this.product);

      this.endTime(moment(), 'Added to cart.');

      if (this.session.current_url.includes('throttle')) {
        // TODO: BEING THROTTLED
      }

      this.sendContactInformation();
    } catch (e) {
      this.log(`Failed to add to cart: ${e}`);
      return this.atc();
    }
  }

  async getCaptcha(url: string, sitekey: string) { // eslint-disable-line no-unused-vars
    // TODO: get captcha from websocket
    const captcha = await fetchCaptcha();
    return captcha;
  }

  async sendContactInformation() {
    if (this.stopped) {
      return;
    }

    const session = this.session;
    if (session == null) {
      this.log('Unable to send info! No session!');
      return;
    }

    if (session.oos) {
      this.stop();
      this.statusUpdate('-1-Out of Stock');
      return;
    }

    let captchaResponse;

    if (session.sitekey != null) {
      this.startTime(moment());
      this.log('Fetching captcha response...');
      this.statusUpdate('0-Fetching captcha response');


      captchaResponse = await this.getCaptcha(this.config.base_url, session.sitekey);

      // captchaResponse = await solve(session.sitekey, this.config.base_url);
      this.endTime(moment(), 'Retrieved captcha response');
    }

    try {
      this.startTime(moment());
      this.log('Sending contact information.');
      this.statusUpdate('0-Sending contact information');
      this.session = await sendContactInfo(this.config, session, captchaResponse);

      this.endTime(moment(), 'Sent contact information successfully');

      this.chooseShippingMethod();
    } catch (e) {
      console.log(e);
      this.log(`Unable to send contact information: ${e}`);
      return setTimeout(() => {
        this.sendContactInformation();
      }, 1500);
    }
  }

  async chooseShippingMethod() {
    if (this.stopped) {
      return;
    }

    const session = this.session;
    if (session == null) {
      this.log('Unable to get shipping rates! No session!');
      return;
    }

    if (session.oos) {
      this.stop();
      this.statusUpdate('-1-Out of Stock');
      return;
    }

    try {
      this.startTime(moment());
      this.log('Retrieving and selecting a shipping option.');
      this.statusUpdate('0-Selecting shipping option');
      const shippingSession = await retrieveShippingRates(session, this.config);

      let method = null;
      const methods = shippingSession.shipping_methods;

      if (methods == null) {
        this.log('Unable to fetch shipping rates.');
        return;
      }

      methods.forEach(m => {
        if (method == null || m.price < method.price) {
          method = m;
        }
      });

      if (method != null) {
        this.session = await sendShippingMethod(method, session, this.config);

        this.endTime(moment(), 'Selected and sent shipping method successfully.');

        this.sendPaymentDetails();
      }
    } catch (e) {
      this.log(`Unable to send shipping method: ${e}`);
    }
  }

  async sendPaymentDetails() {
    if (this.stopped) {
      return;
    }

    let session = this.session;
    if (session == null) {
      this.log('Unable to find valid session.');
      return;
    }

    if (session.oos) {
      this.stop();
      this.statusUpdate('-1-Out of Stock');
      return;
    }

    try {
      this.startTime(moment());
      this.log('Sending payment details.');
      this.statusUpdate('0-Sending payment');

      session = await sendPayment(session, this.config);

      this.endTime(moment(), 'Sent payment details successfully.');

      try {
        this.startTime(moment());
        this.log('Validating payment...');
        this.statusUpdate('0-Validating payment');

        const response = await validatePayment(session, this.config);


        if (response) {
          const duration = this.endTime(moment(), 'Checkout successful.', true);
          this.statusUpdate(`1-Checkout successful! (${duration.milliseconds()})`);
        }
      } catch (e) {
        this.stop();
        this.endTime(moment(), 'Checkout failed.', true);
        this.statusUpdate(`-1-${e.errorMessage}`);
      }
    } catch (e) {
      this.log(`Error sending payment: ${e}`);
    }
  }
}

export default ShopifyTask;
