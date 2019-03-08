"use strict";

//require the handler module.
const { TransactionHandler } = require("sawtooth-sdk/processor/handler");
//declaring a constant variable.

const {
  InvalidTransaction,
  InternalError
} = require("sawtooth-sdk/processor/exceptions");
const { createHash } = require("crypto");
//require encoder and decoder
const { TextEncoder, TextDecoder } = require("text-encoding/lib/encoding");

const CJ_FAMILY = "CookieJar";
const CJ_Version = "1.0";
const CJ_NAMESPACE = hash(CJ_FAMILY).substr(0, 6);

var encoder = new TextEncoder("utf8");
var decoder = new TextDecoder("utf8");
var MIN_VALUE = 1;
function hash(v) {
  return createHash("sha512")
    .update(v)
    .digest("hex");
}

//function to display the errors
var _toInternalError = function(err) {
  //internal error message
  return new InternalError(err);
};

//function to set the entries in the block using the "SetState" function
function _setEntry(context, address, stateValue) {
  //code here
  //console.log(typeof stateValue);
  console.log("statevalue", stateValue);
  let msgBytes = encoder.encode(stateValue);
  console.log(msgBytes);
  console.log(address);
  let entries = {
    [address]: msgBytes
  };
  return context.setState(entries);
}

class CookieJarHandler extends TransactionHandler {
  constructor() {
    super(CJ_FAMILY, [CJ_Version], [CJ_NAMESPACE]);
  }
  apply(transactionProcessRequest, context) {
    try {
      //let raw_payload = transactionProcessRequest.payload

      let header = transactionProcessRequest.header;
      this.publicKey = header.signerPublicKey;
      //tp request variables
      var msg = decoder.decode(transactionProcessRequest.payload);
      var InputArray = JSON.parse(msg);
      var msg_type = InputArray[0];
      var msg_data = InputArray[1];
      var ck_name = InputArray[2].toString();

      this.address =
        hash(CJ_FAMILY).substr(0, 6) +
        hash(ck_name).substr(0, 4) +
        hash(this.publicKey).substr(0, 60);
      console.log(this.address);
      console.log(msg_data);
      var quantity = parseInt(msg_data);
      console.log(quantity);
      if (typeof quantity !== "number" || quantity <= MIN_VALUE) {
        _toInternalError("Invalid Quantity");
      }
      let State = context.getState([this.address]);
      return State.then(dataadd => {
        // Select the action to be performed
        var NewQty = 0;
        var data = dataadd[this.address];
        // console.log("data",data)
        // if(data == '[]' || data == null || data == undefined){
        //    data = 0;
        //  }

        data = parseInt(data);
        console.log(data);
        if (isNaN(data)) {
          data = 0;
        }
        console.log(data);
        if (msg_type === "bake") {
          NewQty = data + quantity;
          console.log("New value", NewQty);
          return _setEntry(context, this.address, NewQty.toString());
        } else if (msg_type === "eat") {
          if (data < quantity) {
            _toInternalError("Quantity must be less than Cookies");
          } else {
            NewQty = data - quantity;
            return _setEntry(context, this.address, NewQty.toString());
          }
          //code here
        } else {
          _toInternalError("Invalid Type");
        }
      });
    } catch (err) {
      _toInternalError(err);
    }
  }
}

module.exports = CookieJarHandler;
