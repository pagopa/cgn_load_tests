//docker run -i --rm -v $(pwd)/src:/src  -e FUNC_KEY=${FUNC_KEY} -e FUNC_MERCHANT_KEY=${FUNC_MERCHANT_KEY} -e BASE_URL=${BASE_URL} -e BASE_MERCHANT_URL=${BASE_MERCHANT_URL} loadimpact/k6 run /src/otp_workflow.js

import http from 'k6/http';
import { sleep } from 'k6';
import { check } from 'k6';

export let options = {
    vus: 1,
    iterations: 20,
    thresholds: {
        http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
        'http_req_duration{pagoPaMethod:OtpGeneration}': ['p(95)<1000'], // threshold on API requests only
        'http_req_duration{pagoPaMethod:OtpCheckNoInvalidate}': ['p(95)<1000'], // threshold on API requests only
        'http_req_duration{pagoPaMethod:OtpCheckInvalidate}': ['p(95)<1000'],
        'http_req_duration{pagoPaMethod:CacheMiss}': ['p(95)<1000'],
        'http_req_duration{pagoPaMethod:InvalidOtp}': ['p(95)<1000'],
    },
};

function otpGeneration(fiscalCode, url, funcKey) {

    var payload = JSON.stringify({});
    var tag = {
        pagoPaMethod: "OtpGeneration",
    };
    var headersParams = {
        headers: {
            'Content-Type': 'application/json',
            'x-functions-key': funcKey
        },
    };
    var r = http.post(url, payload, headersParams, {
        tags: tag,
    });
    console.log("OTP generation for " + fiscalCode + ". Status " + r.status);
    check(r, { 'status is 200': (r) => r.status === 200 }, tag);
    return JSON.parse(r.body).code;
}

function merchantOtpCheck(otp, invalidate, urlBaseMerchantPath, funcMerchantKey, tag) {

    var url = `${urlBaseMerchantPath}/api/v1/merchant/cgn/otp/validate`
    var payload = JSON.stringify(
        {
            'otp_code': otp,
            'invalidate_otp': Boolean(invalidate)
        }
    );
    var headersParams = {
        headers: {
            'Content-Type': 'application/json',
            'x-functions-key': funcMerchantKey
        },
    };

    var r = http.post(url, payload, headersParams, {
        tags: tag,
    });
    console.log(`Otp check invalidate ${invalidate}: ${otp} | Status ${r.status}`);
    return r;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function () {
    var funcKey = `${__ENV.FUNC_KEY}`
    var urlBasePath = `${__ENV.BASE_URL}`
    var urlBaseMerchantPath = `${__ENV.BASE_MERCHANT_URL}`
    var funcMerchantKey = `${__ENV.FUNC_MERCHANT_KEY}`
    var otp = ""

    // Known code for testing puroposes.
    const fiscalCode = "HXHIKW90A29Y010X"
    console.log('Fiscal code: ' + fiscalCode)
    console.log(__ITER)

    var flipCoin = getRandomInt(1, 2);
    if ((__ITER % 10 == 0) && flipCoin == 1) {
        // Simulating a cache miss on Redis for an expired token. (UGN0ILLIQH4) Every 100 tests (more or less...).
        console.log(`Cache miss simulation.`)
        var tag = {
            pagoPaMethod: "CacheMiss",
        };
        otp = "9NA3RWTCVSS"
        var r = merchantOtpCheck(otp, 0, urlBaseMerchantPath, funcMerchantKey);
        check(r, { 'status is 404': (r) => r.status === 404 }, tag);
    }
    // Simulating an invalid OTP. Every 200 tests (more or less...).
    else if (__ITER % 10 == 0 && flipCoin == 2) {
        // Simulating an invalid OTP.
        console.log(`Invalid OTP simulation.`)
        var tag = {
            pagoPaMethod: "InvalidOtp",
        };
        otp = "invalid"
        var r = merchantOtpCheck(otp, 0, urlBaseMerchantPath, funcMerchantKey);
        check(r, { 'status is 400': (r) => r.status === 400 }, tag);
        console.log('Test completed for: ' + fiscalCode + ' OTP: ' + otp);
    }

    // OTP generation.
    var url = `${urlBasePath}/api/v1/cgn/otp/${fiscalCode}`;
    var funcKey = `${__ENV.FUNC_KEY}`
    var otp = otpGeneration(fiscalCode, url, funcKey)


    // Simulate waiting for OTP usage by the user when inserting the promo code while doing a checkout.
    sleep(getRandomInt(1, 3))

    // Marchant calls API to check if OTP exists without invalidating the code itself.
    var tag = {
        pagoPaMethod: "OtpCheckNoInvalidate",
    };
    var r = merchantOtpCheck(otp, 0, urlBaseMerchantPath, funcMerchantKey);
    check(r, { 'status is 200': (r) => r.status === 200 }, tag);

    // Simulate waiting for OTP usage by the merchant when processing checkout.
    sleep(getRandomInt(1, 3))

    // Marchant calls API to consume the OTP.
    r = merchantOtpCheck(otp, 1, urlBaseMerchantPath, funcMerchantKey);
    check(r, { 'status is 200': (r) => r.status === 200 }, tag);

    console.log('Test completed for: ' + fiscalCode + ' OTP: ' + otp);
}
