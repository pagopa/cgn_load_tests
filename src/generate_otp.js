import http from 'k6/http';
import { check } from 'k6';
import { generateFakeFiscalCode } from './modules/helpers.js';

export let options = {
  scenarios: {
    contacts: {
        executor: 'constant-arrival-rate',
        rate: __ENV.rate, // e.g. 20000 for 20K iterations
        duration: __ENV.duration, // e.g. '1m'
        preAllocatedVUs: __ENV.preAllocatedVUs, // e.g. 500
        maxVUs: __ENV.maxVUs // e.g. 1000
    }
  },
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    'logged in successfully': ['p(99)<1500'], // 99% of requests must complete below 1.5s
  },
};

export default function () {

  var fiscalCode = "VAFLAS61A52Y324X";

  var url = `https://io-p-func-cgn.azurewebsites.net/api/v1/cgn/otp/${fiscalCode}`;

  var funcKey = `${__ENV.FUNC_KEY}`

  var payload = JSON.stringify({});

  var params = {
    headers: {
      'Content-Type': 'application/json',
      'x-functions-key': funcKey
    },
  };
  var r = http.post(url, payload ,params);

  console.log("Fiscal code " + fiscalCode + " Status " + r.status);

  check(r, {
    'status is 201': (r) => r.status === 201,
  });



}
