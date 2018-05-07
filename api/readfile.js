var fs = require("fs"); //Used for file read and write
var async = require('async') // to handle all the address one by one 
var jsonfile = require('jsonfile')
var webrpc = require('../webrpc.js');
var webipc = require('../webipc.js');
var Contract_ABI = require('../build/contracts/adbank.json'); //contract ABI for token
var ContractObj = web3.eth.contract(Contract_ABI).at("0x3447dfd3f5443ca1100eaf524617351e1b74cb70"); // making a object for contract (Use the owner address)
var keystorePath = '/home/indrajit/.ethereum/rinkeby' // Your UTC file keystore path

module.exports = {

    startSend: function(req, res, next) {

        console.log('start') // Transactions Started

        var obj;

        fs.readFile('./content.json', 'utf8', function(err, data) { //read the file with all the address and account 
            if (err) throw err;
            obj = JSON.parse(data) // Pasing the data from the file

            async.forEachOf(obj, function(value, key, callback) { // Using each data in the obj for further transaction

                if (web3.isAddress(value.address) && value.address && value.amount) {
                    web3.personal.unlockAccount("0x173fea9fc202b9c0083e4f41d1e82acde9305348", "123456", (err, unlocked) => { //Unlock account using passPhrase

                        if (err) return res.send({
                            status: false,
                            message: "Unlocking the owner address failed",
                            data: err
                        });
                        if (!unlocked || unlocked == '') return res.send({
                            status: false,
                            message: "Error Occured",
                            data: 'err'
                        });
                        if (unlocked) {
                            ContractObj.transfer(value.address, value.amount * 1000000000, {
                                    from: "0x173fea9fc202b9c0083e4f41d1e82acde9305348",
                                    gas: 210000,
                                    gasPrice: 40000000000
                                }, //all the details regaurding the transaction
                                (error, txid) => {
                                    //console.log('sendTransaction',txid,error)
                                    if (error) return res.send({
                                        status: false,
                                        message: "Error in Transaction"
                                    }); //If any transaction error comes this will be the response and all the further transactions will be stopped
                                    if (txid) {
                                        var datas = {
                                            key: key,
                                            address: value.address,
                                            value: value.amount,
                                            txid: txid

                                        };


                                        fs.appendFile("/home/indrajit/new/jsAdbank/test.txt", JSON.stringify(datas, null, 2) + '\n', function(err) { //writing file to test.txt
                                            if (err) throw err;
                                            console.log('IS WRITTEN')
                                        });

                                    }
                                });
                        }
                    });
                }



            })
            console.log('Ended')
        });

    }
    

}