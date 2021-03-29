import http from 'k6/http';
import { sleep } from 'k6';

/*
export let options = {
  // virtual users
  vus: 10,
  duration: '30s',
};
*/

export default function () {
  var url = 'https://io-p-func-cgn.azurewebsites.net/api/v1/cgn/info';

  var params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  http.get(url, params);
}
