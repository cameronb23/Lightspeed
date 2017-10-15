const ccInfo = {
 credit_card: {
   number: "nnnn nnnn nnnn nnnn",
   verification_value: "nnn",
   name: 'nnnn nnnn',
   month: 10,
   year: 2021,
 },
}
let cardOpts = {
 url: 'https://elb.deposit.shopifycs.com/sessions',
 method: 'post',
 jar: cj,
 followAllRedirects: true,
 headers: {
     'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
     'Content-Type': 'application/json'
 },
   body: JSON.stringify(ccInfo),
}

var stoken = JSON.parse(body).id;



/// new step

let opts = {
    url: surl,
    method: 'post',
    gzip: true,
    jar: cj,
    followAllRedirects: true,
    headers: {
      'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding':'gzip, deflate, br',
      'Accept-Language':'en-US,en;q=0.8',
      'Cache-Control':'max-age=0',
      'Connection':'keep-alive',
      'Upgrade-Insecure-Requests':'1',
      'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
    },
    formData: {
      'checkout[billing_address][phone]': '(213) 538-8573',
      'utf8': '✓',
      'checkout[billing_address][first_name]': 'Vlad',
      '_method': 'patch',
      'checkout[billing_address][province]': 'California',
      'checkout[billing_address][last_name]': 'Golb',
      'step':'',
      'checkout[billing_address][address1]': '137 E 30th St',
      'checkout[vault_phone]':'',
      'button':'',
      'checkout[total_price]': price,
      'checkout[billing_address][country]': 'United States',
      'checkout[remember_me]': 'false',
      'checkout[remember_me]': '0',
      'complete': '1',
      'checkout[different_billing_address]': 'false',
      'checkout[billing_address][zip]': '90011',
      'checkout[billing_address][city]': 'Los Angeles',
      'previous_step': 'payment_method',
      'checkout[credit_card][vault]': 'false',
      'checkout[payment_gateway]': gateway,
      'checkout[billing_address][address2]':'',
      'authenticity_token': authtoken,
      's': stoken
    }
  }
