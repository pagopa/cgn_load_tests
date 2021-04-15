# Load tests for CGN project

This is a set of [k6](https://k6.io) load tests related to the CGN (carta giovani nazionale) initiative.

The [new card activation](#01.-Function-Info-page) and [OTP generation](#06.-Generate-OTP) tests require a set of parameters: **rate**, **duration**, **preAllocatedVUs** and **maxVUs**. These parameters are necessary to set the test target to a given number of iteration per second (**rate**) in a given time (**duration**), using a certain number of VUs (**preAllocatedVUs** and **maxVUs**).


## 01. Function Info page

This test is not very useful since it just calls the function app info page.

```
$ docker run -i --rm -v $(pwd)/src:/src  -e FUNC_KEY=${FUNC_KEY} loadimpact/k6 run /src/get_cgn_info.js
```

## 02. Activate new cards based on random "valid" fiscal codes.

You need to set an environment variable `FUNC_KEY` with the azure cgn function app key.

```
$ docker run -i --rm -v $(pwd)/src:/src  -e FUNC_KEY=${FUNC_KEY} loadimpact/k6 run /src/start_cgn_activation.js
```

## 03. Get CGN status.

* Get the activation status of a card associated to a fiscal code.
* You need to set an environment variable `FUNC_KEY` with the azure cgn function app key.
* Get the activation status of a card associated to a fiscal code.

```
$ docker run -i --rm -v $(pwd)/src:/src  -e FUNC_KEY=${FUNC_KEY} loadimpact/k6 run /src/get_cgn_status.js
```

## 04. Get CGN Activation

* Get the activation status of a card associated to a fiscal code.
* You need to set an environment variable `FUNC_KEY` with the azure cgn function app key.
* Get the activation status of a card associated to a fiscal code.

```
$ docker run -i --rm -v $(pwd)/src:/src  -e FUNC_KEY=${FUNC_KEY} loadimpact/k6 run /src/get_cgn_activation.js
```

## 05. Update upsert status

* You need to set an environment variable `FUNC_KEY` with the azure cgn function app key.

```
$ docker run -i --rm -v $(pwd)/src:/src  -e FUNC_KEY=${FUNC_KEY} loadimpact/k6 run /src/upsert_cgn_status.js
```

## 06. Generate OTP

* It generates a new opt for a given fiscal code.
* You need to set an environment variable `FUNC_KEY` with the azure cgn function app key.

```
docker run -i --rm -v $(pwd)/src:/src  -e FUNC_KEY=${FUNC_KEY} loadimpact/k6 run /src/generate_otp.js
```

## 07. Validate OTP

* It validates a generated **OTP**: an OTP has 10 minutes validity after it has been generated.
* You need to set an environment variable `FUNC_KEY` with the azure merchant function app key.

```
docker run -i --rm -v $(pwd)/src:/src  -e FUNC_KEY=${FUNC_KEY} loadimpact/k6 run /src/validate_otp.js
```

## 08. Get Eyca status

* Get the activation status of a eyca card associated to a fiscal code.
* You need to set an environment variable `FUNC_KEY` with the azure cgn function app key.
* Get the activation status of a eyca card associated to a fiscal code.

```
$ docker run -i --rm -v $(pwd)/src:/src  -e FUNC_KEY=${FUNC_KEY} loadimpact/k6 run /src/get_eyca_status.js
```

## 09. Activate new eyca cards based on random "valid" fiscal codes.

* You need to set an environment variable `FUNC_KEY` with the azure function app key.
* Since an eyca card needs an active cgn card this test starts to activate a cgn card for a given `fiscal code` then activate the eyca card.


```
$ docker run -i --rm -v $(pwd)/src:/src  -e FUNC_KEY=${FUNC_KEY} loadimpact/k6 run /src/start_eyca_activation.js
```

# Full workloads

## 01. Card activation

This test represents the activation of a new card from the mobile app for a citizen.

```
$ docker run -i --rm -v $(pwd)/src:/src  -e FUNC_KEY=${FUNC_KEY} -e BASE_URL=${BASE_URL} loadimpact/k6 run /src/user_activate_card_workflow.js
```

## 02. OTP transaction

This test represents the usage of an OTP when doing a transacation with a supported merchant.

```
$ docker run -i --rm -v $(pwd)/src:/src  -e FUNC_KEY=${FUNC_KEY} -e FUNC_MERCHANT_KEY=${FUNC_MERCHANT_KEY} -e BASE_URL=${BASE_URL} -e BASE_MERCHANT_URL=${BASE_MERCHANT_URL} loadimpact/k6 run /src/otp_workflow.js
```