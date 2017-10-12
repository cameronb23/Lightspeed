// @flow

import request from 'request-promise';
import cheerio from 'cheerio';
import { solve } from '../utils/captcha_utils';
import { CookieJar } from 'tough-cookie';

type CheckoutProfile = {
  email: string,
  firstName: string,
  lastName: string,
  address1: string,
  address2: string,
  zip: string,
  city: string,
  state: string,
  phoneNumber: string
}

type ShopifyConfig = {
  base_url: string,
  keywords: Array<string>,
  checkout_profile: CheckoutProfile,
  userAgent: string
};

type SessionConfig = {
  checkout_url: string,
  current_url: string,
  auth_token: string,
  storeId: string,
  cookieJar: Object,
  checkoutId: string,
  currentStep: string,
  sitekey: string,
  shipping_methods: ?Array<Object>
};

type ItemVariant = {
  handle: string,
  id: string
};

async function start() {
  new ShopifyTask({
    base_url: 'https://packershoes.com',
    keywords: ['gang', 'boost'],
    checkout_profile: {
      email: 'cbutler2018@icloud.com',
      firstName: 'Cameron',
      lastName: 'Butler',
      address1: '3 Lupine Court',
      address2: '',
      zip: '04096',
      city: 'Yarmouth',
      state: 'Maine',
      phoneNumber: '(207) 749-5373'
    },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'
  });
}

function determineJsonAvailability(config: ShopifyConfig) {
  return new Promise(async (resolve) => {
    // check for /products.json availability
    const opts = {
      url: `${config.base_url}/products.json`,
      method: 'GET',
      resolveWithFullResponse: true
    };

    try {
      const response = await request(opts);

      if (response.statusCode !== 200) {
        return resolve(false);
      }

      return resolve(true);
    } catch (err) {
      return resolve(false);
    }
  });
}

function addToCart(config: ShopifyConfig, item: ItemVariant) {
  const cookies = request.jar();
  return new Promise(async (resolve, reject) => {
    let opts = {
      url: `${config.base_url}/cart/${item.id}:1`,
      method: 'GET',
      // form: {
      //   id: item.id,
      //   qty: 1
      // },
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

    try {
      const response = await request(opts);
      const $ = await cheerio.load(response.body);
      const checkout = response.request.uri.href;

      console.log(`Redirected to: ${checkout}`);

      const urlData = checkout.replace(`${config.base_url}/`, '');

      const urlSplit = urlData.split('/checkouts/');
      const store = urlSplit[0];
      const id = urlSplit[1];

      const token = $('input[name="authenticity_token"]').val();
      let sitekey;
      if (response.body.includes('https://www.google.com/recaptcha/api2/anchor?k=')) {
        sitekey = response.body.split('https://www.google.com/recaptcha/api2/anchor?k=')[1];
        sitekey = sitekey.split('&')[0];
      } else {
        sitekey = response.body.split('https://www.google.com/recaptcha/api/fallback?k=')[1];
        sitekey = sitekey.split('\"')[0];
      }
      console.log(sitekey);

      //sitekey = sitekey.split('anchor?k=')[1];

      console.log('Auth token:', token);
      console.log('Sitekey: ', sitekey);

      return resolve({
        checkout_url: checkout,
        current_url: checkout,
        storeId: store,
        auth_token: token,
        cookieJar: cookies,
        checkoutId: id,
        sitekey: sitekey,
        currentStep: 'contact_information',
        shipping_methods: null,
      });

      // TODO: request the cart
      // opts = {
      //   url: `${config.base_url}/cart`,
      //   method: 'GET',
      // };
    } catch (e) {
      console.log(e);
      return reject(e);
    }
  });
}

function sendContactInfo(config: ShopifyConfig, session: SessionConfig, recaptchaResponse: ?string) {
  return new Promise(async (resolve, reject) => {
    // check for /products.json availability
    const profile = config.checkout_profile;

    const form = {
      utf8: '✓',
      _method: 'patch',
      authenticity_token: session.auth_token,
      previous_step: 'contact_information',
      step: 'shipping_method',
      'checkout[email]': profile.email,
      'checkout[buyer_accepts_marketing]': 0,
      'checkout[shipping_address][first_name]': profile.firstName,
      'checkout[shipping_address][last_name]': profile.lastName,
      'checkout[shipping_address][company]': '',
      'checkout[shipping_address][address1]': profile.address1,
      'checkout[shipping_address][address2]': profile.address2,
      'checkout[shipping_address][city]': profile.city,
      'checkout[shipping_address][country]': 'United States',
      'checkout[shipping_address][province]': profile.state,
      'checkout[shipping_address][zip]': profile.zip,
      'checkout[shipping_address][phone]': profile.phoneNumber,
      'button': '',
      'checkout[client_details][browser_width]': 1366,
      'checkout[client_details][browser_height]': 581,
      'checkout[client_details][javascript_enabled]': 1
    };

    if (recaptchaResponse != null) {
      form['g-recaptcha-response'] = recaptchaResponse;
    }

    let opts = {
      url: `${session.checkout_url}`,
      method: 'POST',
      headers: {
        Origin: config.base_url,
        'User-Agent': config.userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        Referer: `${session.checkout_url}`,
        'Accept-Language': 'en-US,en;q=0.8'
      },
      followAllRedirects: true,
      jar: session.cookieJar,
      formData: form
    };

    try {
      const response = await request(opts);

      const $ = await cheerio.load(response);
      const token = $('input[name="authenticity_token"]').val();

      const newSession = Object.assign({}, session, {
        auth_token: token
      });

      return resolve(newSession);
    } catch (e) {
      return reject(e);
    }
  });
}

function retrieveShippingRates(session: SessionConfig, config: ShopifyConfig) {
  return new Promise(async (resolve, reject) => {
    const url = `${session.checkout_url}?previous_step=contact_information&step=shipping_method`;

    const opts = {
      url,
      method: 'GET',
      headers: {
        Origin: config.base_url,
        'User-Agent': config.userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        Referer: `${session.checkout_url}`,
        'Accept-Language': 'en-US,en;q=0.8'
      },
      jar: session.cookieJar,
      transform(body) {
        return cheerio.load(body);
      }
    };

    try {
      const $ = await request(opts);
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
        shipping_methods: items
      });

      return resolve(newSession);
    } catch (e) {
      return reject(e);
    }
  });
}

function sendShippingMethod(shippingMethod: Object, session: SessionConfig, config: ShopifyConfig) {
  return new Promise(async (resolve, reject) => {
    let opts = {
      url: `${session.checkout_url}`,
      method: 'POST',
      headers: {
        Origin: config.base_url,
        'User-Agent': config.userAgent,
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        Referer: `${session.checkout_url}?step=payment_method&previous_step=shipping_method`,
        'Accept-Language': 'en-US,en;q=0.8'
      },
      resolveWithFullResponse: true,
      followAllRedirects: true,
      jar: session.cookieJar,
      formData: {
        utf8: '✓',
        _method: 'patch',
        authenticity_token: session.auth_token,
        previous_step: 'shipping_method',
        step: 'payment_method',
        'checkout[shipping_rate][id]': shippingMethod.id,
        'button': '',
        'checkout[client_details][browser_width]': 1366,
        'checkout[client_details][browser_height]': 581,
        'checkout[client_details][javascript_enabled]': 1

      }
    };

    try {
      const response = request(opts);

      const $ = await cheerio.load(response);
      const token = $('input[name="authenticity_token"]').val();

      const newSession = Object.assign({}, session, {
        auth_token: token
      });

      return resolve(newSession);
    } catch (e) {
      return reject(e);
    }
  });
}

class ShopifyTask {
  config: ShopifyConfig;
  session: ?SessionConfig = null;
  product: ?ItemVariant = null;
  json: ?boolean = null;

  constructor(config: ShopifyConfig) {
    this.config = config;

    this.product = {
      handle: 'adidas-comsortium-x-united-arrows-x-slam-jam-campus',
      id: '52740969235'
    };

    this.atc();
  }

  async scan() {
    // scan for a product using sitemap or products.json
    if (this.json == null) {
      this.json = await determineJsonAvailability(this.config);
    }
  }

  async atc() {
    if (this.product == null) {
      console.log('Unable to add to cart! Product not found!');
      return;
    }

    try {
      this.session = await addToCart(this.config, this.product);

      this.sendContactInformation();
    } catch (e) {
      console.log('Failed to add to cart: ', e);
      return this.atc();
    }
  }

  async sendContactInformation() {
    if (this.session == null) {
      console.log('Unable to send info! No session!');
      return;
    }
    // TODO: fetch recaptchResponse

    console.log('Fetching captcha response...');

    let captchaResponse;

    if (this.session.sitekey != null) {
      captchaResponse = await solve(this.session.sitekey, this.config.base_url);
    }

    console.log('Retrieved captcha: ', captchaResponse);

    try {
      this.session = await sendContactInfo(this.config, this.session, captchaResponse);

      this.chooseShippingMethod();
    } catch (e) {
      console.log(e);
      //return this.sendContactInformation();
    }
  }

  async chooseShippingMethod() {
    if (this.session == null) {
      console.log('Unable to get shipping rates! No session!');
      return;
    }

    try {
      this.session = await retrieveShippingRates(this.session, this.config);

      let method = null;

      if (this.session.shipping_methods == null) {
        console.log('Unable to fetch shipping rates.');
        return;
      }

      const methods = this.session.shipping_methods;

      console.log(JSON.stringify(methods));

      methods.forEach(m => {
        if (method == null || m.price < method.price) {
          method = m;
        }
      });

      if (method != null) {
        this.session = await sendShippingMethod(method, this.session, this.config);
      }
    } catch (e) {
      console.log(e);
      return this.chooseShippingMethod();
    }
  }
}

start();

export default ShopifyTask;
