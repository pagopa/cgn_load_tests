import http from 'k6/http';
import { check, sleep} from 'k6';
import { generateFakeFiscalCode } from './modules/helpers.js';

export let options = {
  // virtual users
  vus: 10,
  duration: '30s',
};

export default function () {

  var fiscalCode = generateFakeFiscalCode();

  var url = `https://io-p-func-cgn.azurewebsites.net/api/v1/cgn/${fiscalCode}/activation`;

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
