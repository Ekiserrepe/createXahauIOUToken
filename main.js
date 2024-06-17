//Modify these fields before running your code

//Select your network "Testnet" or "Mainnet"
const net = "Testnet";
//Secret of your wallet (Don't share it!) Testnet address generator: https://xahau-test.net/ Fake example: "sn5XTrWNGNysp4o1JYEFp7wSbN6Gz"
const seed = "shfV6DgHW4EjYK5BEAEricH8Z1Jqu";
// Short name of your token
const IOU_Token = "EKI";
//Address2: rGqsDKCW1fahqfR49unuCNVAYCFM9vf3Yh
const seed2 = "sstko6QFupdPgi5H8VYvdhf5UjrBr";
//End modify variables

//Don't touch anything after this line

const xrpl = require("xrpl");
const { derive, utils, signAndSubmit } = require("xrpl-accountlib");
//const { XrplAccountLib } = require('xrpl');

async function main() {
  function esperar(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  let network = "wss://xahau-test.net";
  let NetworkID = 21338;
  if (net === "Mainnet") {
    network = "wss://xahau.network";
    NetworkID = 21337;
  }
  const account = derive.familySeed(seed, { algorithm: "secp256k1" });
  console.log(
    `Your public address from xrpl.accountlib is: ${account.address}`
  );
  const client = new xrpl.Client(network);
  await client.connect();
  const my_wallet = xrpl.Wallet.fromSeed(seed);
  const networkInfo = await utils.txNetworkAndAccountValues(network, account);
  console.log(`Your public address from XRPL.js is: ${my_wallet.address}`);
  const response = await client.request({
    command: "account_info",
    account: my_wallet.address,
    ledger_index: "validated",
  });
  const total_balance = response.result.account_data.Balance / 1000000;
  const reserves = response.result.account_data.OwnerCount * 0.2 + 1;
  console.log(
    `Your total balance (available+reserves) is: ${total_balance} XAH`
  );
  console.log(`Your reserves is: ${reserves} XAH`);
  const balance = total_balance - reserves;
  console.log(`Your available balance is: ${balance} XAH`);

  const account_info = await client.request({
    command: "account_info",
    account: my_wallet.address,
  });

  let current_sequence = account_info.result.account_data.Sequence;
  console.log("Actual Sequence", current_sequence);
  //Activate rippling:
  const prepared = {
    TransactionType: "AccountSet",
    Account: my_wallet.address,
    SetFlag: 8,
    Sequence: current_sequence,
    ...networkInfo.txValues,
  };

  // Submit AccountSet -------------------------------------------------------
  const tx = signAndSubmit(prepared, network, account);
  console.log("Info tx ", tx);
  const jsonDataString = JSON.stringify(tx);
  console.log(jsonDataString);
  //finished

  const account2 = derive.familySeed(seed2, { algorithm: "secp256k1" });
  console.log(
    `Your public address2 from xrpl.accountlib is: ${account2.address}`
  );

  const my_wallet2 = xrpl.Wallet.fromSeed(seed2);
  const networkInfo2 = await utils.txNetworkAndAccountValues(network, account2);
  console.log(`Your public address is: ${my_wallet2.address}`);
  const networkInf2 = await utils.txNetworkAndAccountValues(network, account2);
  const response2 = await client.request({
    command: "account_info",
    account: my_wallet2.address,
    ledger_index: "validated",
  });
  const total_balance2 = response2.result.account_data.Balance / 1000000;
  const reserves2 = response2.result.account_data.OwnerCount * 0.2 + 1;
  console.log(
    `Your total balance3 (available+reserves) is: ${total_balance2} XAH`
  );
  console.log(`Your reserves3 is: ${reserves2} XAH`);
  const balance2 = total_balance2 - reserves2;
  console.log(`Your available balance is: ${balance2} XAH`);

  let current_sequence2 = response2.result.account_data.Sequence;
  console.log("Actual Sequence 2", current_sequence2);
  //Activate rippling:
  const prepared2 = {
    TransactionType: "TrustSet",
    Account: my_wallet2.address,
    LimitAmount: {
      currency: IOU_Token,
      issuer: my_wallet.address,
      value: "1000000",
    },
    ...networkInfo2.txValues,
  };

  // Submit Trustline -------------------------------------------------------
  const tx2 = await signAndSubmit(prepared2, network, account2);
  console.log("Info tx2 ", tx2);
  const jsonDataString2 = JSON.stringify(tx2);
  console.log(jsonDataString2);
  //finished

  //Mint tokens
  const networkInfo3 = await utils.txNetworkAndAccountValues(network, account);

  const prepared3 = {
    TransactionType: "Payment",
    Account: my_wallet.address,
    Destination: my_wallet2.address,
    Amount: {
      currency: IOU_Token,
      issuer: my_wallet.address,
      value: "1000000",
    },
    ...networkInfo3.txValues,
  };

  const tx3 = await signAndSubmit(prepared3, network, account);
  console.log("Info tx3 ", tx2);
  const jsonDataString3 = JSON.stringify(tx3);
  console.log(jsonDataString3);
}
main();
