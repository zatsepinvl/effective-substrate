use std::convert::TryFrom;

use sp_core::sr25519;
use substrate_api_client::{Api, Metadata};
use substrate_api_client::rpc::WsRpcClient;

fn main() {
    let url = "ws://127.0.0.1:9944";

    let client = WsRpcClient::new(&url);
    let api = Api::<sr25519::Pair, _>::new(client).unwrap();

    let meta = Metadata::try_from(api.get_metadata().unwrap()).unwrap();

    meta.print_overview();
    meta.print_modules_with_calls();
    meta.print_modules_with_events();
    meta.print_modules_with_errors();
    meta.print_modules_with_constants();

    // print full substrate metadata json formatted
    println!(
        "{}",
        Metadata::pretty_format(&api.get_metadata().unwrap())
            .unwrap_or_else(|| "pretty format failed".to_string())
    )
}