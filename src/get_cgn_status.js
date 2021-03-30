import http from 'k6/http';
import { check } from 'k6';


export let options = {
  // virtual users
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(99)<500'], // 99% of requests must complete below 0.5s
    'logged in successfully': ['p(99)<500'], // 99% of requests must complete below 0.5s
  },
};


export default function () {

  const fiscalCode = 'ZFUKNL98A72Y081X'

  var url = `https://io-p-func-cgn.azurewebsites.net/api/v1/cgn/status/${fiscalCode}`;

  var funcKey = `${__ENV.FUNC_KEY}`

  var params = {
    headers: {
      'Content-Type': 'application/json',
      'x-functions-key': funcKey,
    },
  };

  var r = http.get(url, params);

  check(r, {
    'status is 200': (r) => r.status === 200,
  });
}
