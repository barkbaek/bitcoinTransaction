const axios = require('axios');
const bitcore = require('bitcore-lib');

const sendBitcoin = async (recieverAddress, amountToSend) => {
    const sochain_network = "BTC";
    const privateKey = "private-key of wallet";
    const sourceAddress = "public-address of wallet";
    const satoshiToSend = parseInt(amountToSend * 100000000) + 1;
    let fee = 0;
    let inputCount = 0;
    let outputCount = 2;
    const utxos = await axios.get(
        `https://sochain.com/api/v2/get_tx_unspent/${sochain_network}/${sourceAddress}`
    );
    const transaction = new bitcore.Transaction();
    let totalAmountAvailable = 0;

    console.dir(utxos);

    let inputs = [];
    utxos.data.data.txs.forEach(async (element) => {
        console.log("element: ");
        console.dir(element);
        let utxo = {};
        utxo.satoshis = Math.floor(Number(element.value) * 100000000);
        utxo.script = element.script_hex;
        utxo.address = utxos.data.data.address;
        utxo.txId = element.txid;
        utxo.outputIndex = element.output_no;
        totalAmountAvailable += utxo.satoshis;
        inputCount += 1;
        inputs.push(utxo);
    });

    transactionSize = inputCount * 146 + outputCount * 34 + 10 - inputCount;
    // Check if we have enough funds to cover the transaction and the fees assuming we want to pay 20 satoshis per byte

    fee = transactionSize * 20
    // if (totalAmountAvailable - satoshiToSend - fee  < 0) {
    //     console.log(`totalAmountAvailable: ${totalAmountAvailable}, satoshiToSend:  ${satoshiToSend}, fee: ${fee}`);
    //     throw new Error("Balance is too low for this transaction");
    // }

    console.log('inputs: ');
    console.dir(inputs);

    //Set transaction input
    transaction.from(inputs);

    // set the recieving address and the amount to send
    console.log(satoshiToSend);
    transaction.to(recieverAddress, satoshiToSend);

    // Set change address - Address to receive the left over funds after transfer
    transaction.change(sourceAddress);

    //manually set transaction fees: 20 satoshis per byte
    transaction.fee(fee);

    // Sign transaction with your private key
    transaction.sign(privateKey);

    // serialize Transactions
    const serializedTransaction = transaction.serialize();
    console.dir(serializedTransaction);
    // Send transaction
    const result = await axios({
        method: "POST",
        url: `https://sochain.com/api/v2/send_tx/${sochain_network}`,
        data: {
            tx_hex: serializedTX,
        },
    });
    console.dir(result.data.data);
    return result.data.data;
};
sendBitcoin('', 0.000017105043268062198);