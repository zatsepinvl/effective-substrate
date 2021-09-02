import {ApiPromise, Keyring} from '@polkadot/api';

const api = await ApiPromise.create({
    types: {
        "PeerId": "(Vec<u8>)"
    }
});

const keyring = new Keyring({type: 'sr25519'});

const n = 10;
const iterations = 3;

const accounts = [];

for (let i = 0; i < n; i++) {
    const seed = '//Account' + i;
    const account = keyring.addFromUri(seed);
    accounts.push(account);
    const accountData = (await api.query.system.account(account.address));
    const balance = accountData.data.free;
    const balanceHuman = balance.toHuman();
    console.log(`${seed} | ${account.address} | ${balanceHuman}`);
}

console.log("Accounts are ready");

let counter = 0;

async function tx(account) {
    for (let i = 0; i < iterations; i++) {
        await new Promise((res, rej) => {
            try {
                api.tx.templateModule.doSomething(1)
                    .signAndSend(account, {}, ({status}) => {
                        if (status.isFinalized) {
                            counter++;
                            console.log("Tx finished " + counter);
                            res();
                        }
                    });
            } catch (e) {
                rej(e);
            }
        }).catch(e => console.error(`Tx error for account ${account}`, e));
    }
}

console.log("Txting...");

const start = Date.now() / 1000 | 0;
const promises = accounts.map(tx);
await Promise.all(promises);
const end = Date.now() / 1000 | 0;

const duration = end - start;
console.log("Transactions = " + counter);
console.log("Duration = " + duration + " seconds");
console.log("TPS = " + counter / duration);

console.log("Finished");

process.exit(0);
