import {ApiPromise, Keyring} from "@polkadot/api";

const api = await ApiPromise.create({
    types: {
        "PeerId": "(Vec<u8>)"
    }
});

const keyring = new Keyring({type: 'sr25519'});

export {
    api, keyring
}