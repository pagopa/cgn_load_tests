import http from 'k6/http';
import { check, sleep } from 'k6';
import { generateFakeFiscalCode } from './modules/helpers.js';

/*
export let options = {
  // virtual users
  vus: 10,
  duration: '30s',
};
*/

export let options = {
  stages: [
    { duration: '1m', target: 1 }, // simulate ramp-up of traffic from 1 to 100 users over 5 minutes.
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    'logged in successfully': ['p(99)<1500'], // 99% of requests must complete below 1.5s
  },
};

export default function () {

  var funcKey = `${__ENV.FUNC_KEY}`

  var fiscalCode = generateFakeFiscalCode();

  // First enable cgn card: => eyca can be enabled once cgn is already enabled.

  var url = `https://io-p-func-cgn.azurewebsites.net/api/v1/cgn/${fiscalCode}/activation`;

  var payload = JSON.stringify({});

  var params = {
    headers: {
      'Content-Type': 'application/json',
      'x-functions-key': funcKey
    },
  };
  var r = http.post(url, payload ,params);

  console.log("CGN Card activation: Fiscal code " + fiscalCode + " Status " + r.status);

  if( r.status == 201) {
    // Acticate now Eyca
    url = `https://io-p-func-cgn.azurewebsites.net/api/v1/cgn/${fiscalCode}/eyca/activation`;

    sleep(10)

    r = http.post(url, payload ,params);
    console.log("eyca Fiscal code " + fiscalCode + " Status " + r.status);
  }

  check(r, {
    'status is 201': (r) => r.status === 201,
  });

}
