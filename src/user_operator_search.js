import http from 'k6/http';
import { sleep } from 'k6';
import { check } from 'k6';

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
        'http_req_duration{pagoPaMethod:GetOnlineMerchants}': ['p(95)<1000'], // threshold on API requests only
        'http_req_duration{pagoPaMethod:GetOfflineMerchants}': ['p(95)<1000'], // threshold on API requests only
        'http_req_duration{pagoPaMethod:GetMerchant}': ['p(95)<1000'], // threshold on API requests only
    },
};

export default function () {
    // Values from env var.
    var urlBasePath = `${__ENV.OS_BASE_URL}`
    var funcKey = `${__ENV.OS_FUNC_KEY}`

    var headersParams = {
        headers: {
            'Content-Type': 'application/json',
            'x-functions-key': funcKey,
        },
    };
    // Search for Online merchants.
    var tag = {
        pagoPaMethod: "GetOnlineMerchants",
    };
    var url = `${urlBasePath}/api/v1/cgn/operator-search/online-merchants`;
    var payload = JSON.stringify({

    });

    var resultIds = [];
    var r = http.post(url, payload, headersParams, {
        tags: tag,
    });
    console.log("Search for online merchants Status " + r.status);
    check(r, { 'GetOnlineMerchants status is 200': (r) => r.status === 200 }, tag);

    var resultJsonBody = JSON.parse(r.body);
    resultJsonBody.items.forEach(el => resultIds.push(el.id));

    tag = {
        pagoPaMethod: "GetOfflineMerchants",
    };
    url = `${urlBasePath}/api/v1/cgn/operator-search/offline-merchants`;
    r = http.post(url, payload, headersParams, {
        tags: tag,
    });
    console.log('Search for offline merchants status: ' + r.status);
    check(r, {
        'GetOfflineMerchants status 200': (r) => (r.status === 200)
    },
        tag
    );

    resultJsonBody = JSON.parse(r.body);
    resultJsonBody.items.forEach(el => resultIds.push(el.id));

    //Simulating GetMerchant Detail.
    sleep(1);
    var randomMerchantId = resultIds[Math.floor(Math.random() * resultIds.length)];

    // Get Merchant Detail
    tag = {
        pagoPaMethod: "GetMerchant",
    };
    url = `${urlBasePath}/api/v1/cgn/operator-search/merchants/${randomMerchantId}`;
    r = http.get(url, headersParams, {
        tags: tag,
    });
    console.log('Get merchant detail: ' + r.status + ' with merchantId: ' + randomMerchantId);
    check(r, { 'Get Merchant is 200': (r) => (r.status === 200) },
        tag
    );
}
