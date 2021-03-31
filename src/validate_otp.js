import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '10s', target: 1 }, // simulate ramp-up of traffic from 1 to 100 users over 5 minutes.
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    'logged in successfully': ['p(99)<1500'], // 99% of requests must complete below 1.5s
  },
};

export default function () {

  const otp = 'UM1R02UCIMX';

  const url = 'https://io-p-func-cgnmerchant.azurewebsites.net/api/v1/merchant/cgn/otp/validate'

  var funcKey = `${__ENV.FUNC_KEY}`

  var payload = JSON.stringify(
    {
        'otp_code': otp,
        'invalidate_otp': false
    }
  );

  var params = {
    headers: {
      'Content-Type': 'application/json',
      'x-functions-key': funcKey
    },
  };
  var r = http.post(url, payload ,params);

  console.log("Otp: " + otp + " Status " + r.status);

  check(r, {
    'status is 200': (r) => r.status === 200,
  });

}
