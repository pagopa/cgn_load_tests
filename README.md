# Load tests for CGN project

This is a set of [k6](https://k6.io) load tests related to the CGN (carta giovani nazionale) initiative


## 01. Function Info page

This test is not very useful since it just calls the function app info page.

```
$ docker run -i --rm -v $(pwd)/src:/src  -e FUNC_KEY=${FUNC_KEY} loadimpact/k6 run /src/get_cgn_info.js
```

## 02. Activate new cards based on random "valid" fiscal codes.

You need to set an environment variable `FUNC_KEY` with the azure function app key.

```
$ docker run -i --rm -v $(pwd)/src:/src  -e FUNC_KEY=${FUNC_KEY} loadimpact/k6 run /src/start_cgn_activation.js
```

## 03. Get CGN status.

* Get the activation status of a card associated to a fiscal code.
* You need to set an environment variable `FUNC_KEY` with the azure function app key.
* Get the activation status of a card associated to a fiscal code.

```
$ docker run -i --rm -v $(pwd)/src:/src  -e FUNC_KEY=${FUNC_KEY} loadimpact/k6 run /src/get_cgn_status.js
```

## 04. Update upsert status

* You need to set an environment variable `FUNC_KEY` with the azure function app key.

```
$ docker run -i --rm -v $(pwd)/src:/src  -e FUNC_KEY=${FUNC_KEY} loadimpact/k6 run /src/upsert_cgn_status.js
```

## 05. Generate OTP

* It generates a new opt for a given fiscal code.
* You need to set an environment variable `FUNC_KEY` with the azure function app key.

```
docker run -i --rm -v $(pwd)/src:/src  -e FUNC_KEY=${FUNC_KEY} loadimpact/k6 run /src/generate_otp.js
```

## 06. Validate OTP

* It validates a generated **OTP**: an OTP has 10 minutes validity after it has been generated.
* You need to set an environment variable `FUNC_KEY` with the azure function app key.

```
docker run -i --rm -v $(pwd)/src:/src  -e FUNC_KEY=${FUNC_KEY} loadimpact/k6 run /src/validate_otp.js
```
