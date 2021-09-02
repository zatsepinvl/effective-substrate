import client from 'prom-client';

const Registry = client.Registry;
const register = new Registry();
const gateway = new client.Pushgateway('http://127.0.0.1:9091', [], register);
const prefix = 'substrate_perf_testsuite';

export function createCounter(name) {
    return new client.Counter({
        name: `${prefix}_${name}`,
        help: `${prefix}_${name}`,
        registers: [register],
    });
}

export function createHistogram(name, labels) {
    return new client.Histogram({
        name: `${prefix}_${name}`,
        help: `${prefix}_${name}`,
        labelNames: labels,
        registers: [register],
        buckets: [0.1, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    });
}

export async function pushMetrics() {
    await new Promise((res, rej) => {
        gateway.pushAdd({jobName: prefix}, (err, resp, body) => {
            console.log(`Error: ${err}`);
            console.log(`Body: ${body}`);
            console.log(`Response status: ${resp.statusCode}`);
            if (err) {
                rej(err);
            } else {
                res();
            }
        });
    })
}

new client.Histogram({
    name: 'metric_name',
    help: 'metric_help',
    buckets: client.linearBuckets(0, 10, 20), //Create 20 buckets, starting on 0 and a width of 10
});



