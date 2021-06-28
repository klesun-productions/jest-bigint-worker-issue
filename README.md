Created for https://github.com/facebook/jest/issues/11617

Steps to reproduce the issue:

```bash
git clone git@github.com:klesun-productions/jest-bigint-worker-issue.git # clone this repo
cd jest-bigint-worker-issue
npm ci # install jest dependency
npm test # run the test that reproduces the issue
```

Expected behaviour: you should have seen assertion error informing you that `expect(1n).toEqual(2n);` expectation failed

Actual behaviour: you get following output due to an internal `jest-worker` error:

```bash
 PASS  tests/some-other.test.js
  ✓ should succeed (2 ms)

 FAIL  tests/bigint.test.js
  ● Test suite failed to run

    TypeError: Do not know how to serialize a BigInt
        at stringify (<anonymous>)

      at messageParent (node_modules/jest-worker/build/workers/messageParent.js:42:19)

Test Suites: 1 failed, 1 passed, 2 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        0.777 s
```

With no details of what the actual error that `jest-worker` tried to report was.

The code in [`messageParent.js`](https://github.com/facebook/jest/blob/master/packages/jest-worker/src/workers/messageParent.ts) that was supposed to report the assertion error fails itself on invocation of:

```javascript
parentProcess.send([_types().PARENT_MESSAGE_CUSTOM, message]);
```

I assume that's because `message` includes `failureDetails.matcherResult` holding the compared bigint values that can't
be passed to [`process.send()`](https://nodejs.org/api/process.html#process_process_send_message_sendhandle_options_callback),
as unlike [`worker_threads`](https://nodejs.org/api/worker_threads.html#worker_threads_broadcastchannel_postmessage_message) it does not support non-json values out of the box.
