import Shopify from './index';

const cp = {
  email: 'john@google.com',
  firstName: 'John',
  lastName: 'Jones',
  address1: '300 Cupertino Lane',
  address2: '',
  zip: '04103',
  city: 'Portland',
  state: 'Maine',
  phoneNumber: '(661) 691-1114',
  payment: {
    cardNumber: '4859102216685048',
    cardName: 'John Jones',
    cvv: '609',
    expMonth: 10,
    expYear: 2021
  }
}


const s = new Shopify(1, {
  base_url: 'https://offthehook.ca',
  keywords: ['sd', 'sa'],
  checkout_profile: cp,
  userAgent: 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
  proxies: []
});

s.start();
