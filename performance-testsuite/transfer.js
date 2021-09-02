import {api, keyring} from './substrate.js';
import {createCounter, createHistogram, pushMetrics} from './metrics.js';

const CONCURRENCY_LEVEL = 100;
const ITERATIONS = 1000;
const SEND_AMOUNT = 1;

const requiredBalance = ITERATIONS * SEND_AMOUNT;

const transferTo = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";

const accounts = [];

const testCounter = createCounter('tests_run');
testCounter.inc();

const txDuration = createHistogram('tx_latency', ['tx_name']);

for (let i = 0; i < CONCURRENCY_LEVEL; i++) {
    const seed = '//Account' + i;
    const account = keyring.addFromUri(seed);
    accounts.push(account);
    const accountData = (await api.query.system.account(account.address));
    const balance = accountData.data.free;
    const balanceHuman = balance.toHuman();
    const balanceNumber = balance.toBigInt();
    if (balanceNumber < requiredBalance) {
        console.error(`-X-> ${seed} | ${account.address} | ${balanceHuman} | ${balanceNumber}`);
        throw new Error(`Balance of account ${seed} (${account.address}) is ${balance}, but required min is ${requiredBalance}. Feed the account first.`)
    }
    console.log(`${seed} | ${account.address} | ${balanceHuman} | ${balanceNumber}`);
}

console.log("Accounts are ready");

let localCounter = 0;

async function transfer(account) {
    for (let i = 0; i < ITERATIONS; i++) {
        await new Promise((res, rej) => {
            try {
                const end = txDuration.startTimer();
                api.tx.balances.transfer(transferTo, 1)
                    .signAndSend(account, {}, ({status}) => {
                        if (status.isFinalized) {
                            localCounter++;
                            end({tx_name: 'balances.transfer'})
                            console.log("Transfer finished " + localCounter);
                            res();
                        }
                    });
            } catch (e) {
                rej(e);
            }
        }).catch(e => console.error(`Transfer error for account ${account}`, e));
    }
}

console.log("Transferring...");

setInterval(() => pushMetrics(), 5000);

const start = Date.now() / 1000 | 0;
const promises = accounts.map(transfer);
await Promise.all(promises);
const end = Date.now() / 1000 | 0;

const duration = end - start;
console.log("Transactions = " + localCounter);
console.log("Duration = " + duration + " seconds");
console.log("TPS = " + localCounter / duration);

console.log("Finished");

console.log("Pushing metrics...");

await pushMetrics();

process.exit(0);
