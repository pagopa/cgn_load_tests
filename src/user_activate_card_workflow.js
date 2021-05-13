import http from 'k6/http';
import { sleep } from 'k6';
import { check } from 'k6';
import { generateFakeFiscalCode } from './modules/helpers.js';

export let options = {
    scenarios: {
        contacts: {
            executor: 'constant-arrival-rate',
            rate: __ENV.rate, // e.g. 20000 for 20K iterations
            timeUnit: '1s',
            duration: __ENV.duration, // e.g. '1m'
            preAllocatedVUs: __ENV.preAllocatedVUs, // e.g. 500
            maxVUs: __ENV.maxVUs // e.g. 1000
        }
    },
    thresholds: {
        http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
        'http_req_duration{pagoPaMethod:ActivateNewCard}': ['p(95)<1000'], // threshold on API requests only
        'http_req_duration{pagoPaMethod:GetCGNActivation}': ['p(95)<1000'], // threshold on API requests only
        'http_req_duration{pagoPaMethod:GetCGNStatus}': ['p(95)<1000'], // threshold on API requests only
        'http_req_duration{pagoPaMethod:GetEycaStatus}': ['p(95)<1000'], // threshold on API requests only
    },
};

export default function () {
    // Values from env var.
    var urlBasePath = `${__ENV.BASE_URL}`
    var funcKey = `${__ENV.FUNC_KEY}`

    // Born in the ninenties.
    var fiscalCode = generateFakeFiscalCode("6");
    console.log('Fiscal code: ' + fiscalCode)
    var headersParams = {
        headers: {
            'Content-Type': 'application/json',
            'x-functions-key': funcKey,
        },
    };

    // Activate new card.
    var tag = {
        pagoPaMethod: "ActivateNewCard",
    };
    var url = `${urlBasePath}/api/v1/cgn/${fiscalCode}/activation`;
    var payload = JSON.stringify({});
    var r = http.post(url, payload, headersParams, {
        tags: tag,
    });
    console.log("Activate new card Fiscal code " + fiscalCode + " Status " + r.status);
    check(r, { 'status is 201': (r) => r.status === 201 }, tag);

    //Simulating mobile app polling to check activation status.
    var maxRetries = 20;
    var retryCount = 0;
    var cardActivated = false;
    do {
        sleep(1)
        console.log('Polling Get CGN Activation: ' + r.status + ' retry: ' + (retryCount + 1));

        // Get CGN Activation (200 with one of the following statuses: completed, pending, running)
        tag = {
            pagoPaMethod: "GetCGNActivation",
        };
        url = `${urlBasePath}/api/v1/cgn/${fiscalCode}/activation`;
        r = http.get(url, headersParams, {
            tags: tag,
        });
        check(r, { 'Get CGN Activation is 200': (r) => (r.status === 200) },
            tag
        );

        // If status is "completed" then the card is activated.
        var jsonBody = JSON.parse(r.body);
        if (r.body && jsonBody.status === 'COMPLETED') {
            cardActivated = true;
            break;
        }
        console.log('Get CGN Activation: ' + r.status);

        retryCount++;
    }
    while ((retryCount < maxRetries) && !cardActivated);

    if (cardActivated) {
        console.log('Card ' + fiscalCode + ' activated.')
    }
    else {
        console.log('Card ' + fiscalCode + ' NOT activated. Exit test.')
        return;
    }

    // Simulating mobile app to get CGN and Eyca status.

    // Get CGN status.
    tag = {
        pagoPaMethod: "GetCGNStatus",
    };
    url = `${urlBasePath}/api/v1/cgn/status/${fiscalCode}`;
    r = http.get(url, headersParams, {
        tags: tag,
    });
    console.log('Get CGN status: ' + r.status);
    check(r, {
        'Get CGN status 200': (r) => (r.status === 200)
    },
        tag
    );

    sleep(0.5);

    //Get Eyca status.
    tag = {
        pagoPaMethod: "GetEycaStatus",
    };
    url = `${urlBasePath}/api/v1/cgn/eyca/status/${fiscalCode}`
    var r = http.get(url, headersParams, {
        tags: tag,
    });
    console.log('Get Eyca status: ' + r.status);
    check(r, {
        'Get Eyca status is 200': (r) => r.status === 200
    }, tag);


    console.log('Test completed for: ' + fiscalCode);


}
