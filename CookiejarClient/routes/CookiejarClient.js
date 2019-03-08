const { createHash } = require("crypto");
const { CryptoFactory, createContext } = require("sawtooth-sdk/signing");
const fs = require("fs");
const fetch = require("node-fetch");
const { TextEncoder, TextDecoder } = require("text-encoding/lib/encoding");
const { Secp256k1PrivateKey } = require("sawtooth-sdk/signing/secp256k1");
const protobuf = require("sawtooth-sdk/protobuf");

const CJ_FAMILY = "CookieJar";
const CJ_Version = "1.0";

//privateKeyHex = "83a6196603b547d02ba39f4b0dc6f6321d25bcc77e79f8877ccea30f19782e24";

function hash(v) {
  //return hash
  return createHash("sha512")
    .update(v)
    .digest("hex");
}
function checkCookie(type) {
  if (type == "chocolate") {
    return 0;
  } else return 1;
}
class CookiejarClient {
  constructor(privateKeyHex, type) {
    //create signer, public key and get address
    const context = createContext("secp256k1");
    const secp256k1pk = Secp256k1PrivateKey.fromHex(privateKeyHex.trim());
    this.signer = new CryptoFactory(context).newSigner(secp256k1pk);
    this.publicKey = this.signer.getPublicKey().asHex();
     this.cValue = checkCookie(type);
    this.address =
      hash(CJ_FAMILY).substr(0, 6) +
      hash(this.cValue.toString()).substr(0, 4) +
      hash(this.publicKey).substr(0, 60);
  }
  async send_data(action, values) {
    //address and payload
    var data = [action, values, this.cValue];
    var payload = JSON.stringify(data);
    var enc = new TextEncoder("utf8");
    const payloadBytes = enc.encode(payload);
    const payloadBytesHash = hash(payloadBytes);
    const transactionHeaderBytes = protobuf.TransactionHeader.encode({
      //transaction header components
      familyName: CJ_FAMILY,
      familyVersion: CJ_Version,
      inputs: [this.address],
      outputs: [this.address],
      signerPublicKey: this.publicKey,
      batcherPublicKey: this.publicKey,
      dependencies: [],
      payloadSha512: payloadBytesHash
    }).finish();
    const signature = this.signer.sign(transactionHeaderBytes);

    const transaction = protobuf.Transaction.create({
      //assign header, header signature and payload here
      header: transactionHeaderBytes,
      headerSignature: signature,
      payload: payloadBytes
    });

    const transactions = [transaction];
    const batchHeaderBytes = protobuf.BatchHeader.encode({
      //Batch header components here
      signerPublicKey: this.signer.getPublicKey().asHex(),
      transactionIds: transactions.map(txn => txn.headerSignature)
    }).finish();

    const batchSignature = this.signer.sign(batchHeaderBytes);
    const batch = protobuf.Batch.create({
      //batch components here
      header: batchHeaderBytes,
      headerSignature: batchSignature,
      transactions: transactions
    });

    const batchListBytes = protobuf.BatchList.encode({
      //batchlist
      batches: [batch]
    }).finish();
    this._send_to_rest_api(batchListBytes);
  }

  async _send_to_rest_api(batchListBytes) {
    if (batchListBytes == null) {
      try {
        //code here
        var geturl = "http://rest-api:8008/state/" + this.address;
        console.log("Getting from: " + geturl);
        let response = await fetch(geturl, {
          method: "GET"
        });
        let responseJson = await response.json();
        var data = responseJson.data;
        var amount = new Buffer(data, "base64").toString();
        return amount;
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("new code");
      try {
        //code here
        var resp = await fetch("http://rest-api:8008/batches", {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream"
          },
          body: batchListBytes
        });
        console.log("response", resp);
      } catch (error) {
        console.log("error in fetch", error);
      }
    }
  }
}
module.exports.CookiejarClient = CookiejarClient;
