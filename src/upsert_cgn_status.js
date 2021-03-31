import http from 'k6/http';
import { check } from 'k6';

/*
export let options = {
  // virtual users
  vus: 10,
  duration: '30s',
};
*/

export let options = {
  stages: [
    { duration: '10s', target: 10 }, // simulate ramp-up of traffic from 1 to 100 users over 5 minutes.
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    'logged in successfully': ['p(99)<1500'], // 99% of requests must complete below 1.5s
  },
};

export default function () {

  // fake fiscal code.
  const fiscalCode = 'VAFLAS61A52Y324X';

  var url = `https://io-p-func-cgn.azurewebsites.net/api/v1/cgn/${fiscalCode}/status`;

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
