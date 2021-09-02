import {ApiPromise, Keyring} from '@polkadot/api';


const api = await ApiPromise.create({
    types: {
        "PeerId": "(Vec<u8>)"
    },

});

const keyring = new Keyring({type: 'sr25519'});

const n = 1;

const faucets = [
    keyring.addFromUri('//Alice'),
    keyring.addFromUri('//Bob'),
    //keyring.addFromUri('//Charlie'),
    // keyring.addFromUri('//Dave'),
    // keyring.addFromUri('//Eve'),
    //keyring.addFromUri('//Ferdie'),
]

console.log("Preparing accounts");

const accounts = [];

for (let i = 0; i < n; i++) {
    const seed = '//Account' + i;
    const account = keyring.addFromUri(seed);
    accounts.push(account);
    console.log(`${seed}: ${account.address}`);
}


async function feedAccounts(ids, faucet) {
    for (let i = 0; i < ids.length; i++) {
        const account = accounts[ids[i]];
        await new Promise(async (res, rej) => {
            await api.tx.balances.transfer(account.address, 100_000_000_000_000)
                .signAndSend(faucet, ({status}) => {
                    if (status.isFinalized) {
                        res();
                        counter.inc();
                    }
                });
        })
        console.log("Fed " + account.address);
    }
}

const addAccountsFuncs = {};

for (let i = 0; i < n; i++) {
    const faucet = faucets[i % faucets.length];
    if (!addAccountsFuncs[faucet.address]) {
        addAccountsFuncs[faucet.address] = {faucet, ids: [i]};
    } else {
        addAccountsFuncs[faucet.address].ids.push(i);
    }
}

await Promise.all(Object.entries(addAccountsFuncs).map(([_, obj]) => feedAccounts(obj.ids, obj.faucet)));

console.log("Accounts are ready");

await new Promise((res, rej) => {
    gateway.push({jobName: prefix}, (err, resp, body) => {
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

process.exit(0);
