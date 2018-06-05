const cluster = require('cluster');
const config = require('./conf/config.js');
const lang = require('./lang/en.js');
const readline = require('readline');
const IOTA=require('iota.lib.js'); 
const Converter = require('./helpers/converter.js');

const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
var tmpConfig={
    node:{provider:"",lib:null},
    seed:null,
    secLevel:3,
    targetAddress:null,
    targetAddressIndex:-1,
    balance:-1,
    rescueAddress:null,
    bundleHash:null,
    coreCount:(require('os').cpus().length-1),
    bundle:[],
    bundleTrytes:[],
    performance:0,
    loadCount:0,
    revealFactor:2178,
    bestTag:"",
    usedBundleHash:"",
    depth:3,
    minWeightMagnitude:14,
    workerFinished:false
};

if (cluster.isMaster) {
    masterProcess();
} else {
    childProcess();
}

function masterProcess() {
    var workers = [];
    var activeWorkers=0;
    // clear console
    process.stdout.write('\033c');
    // display welcome
    echo(lang.welcome,"blue");
    echo("","");
    echo(lang.unofficial,"red");
    echo("","");
    echo(lang.warning,"blue");
    // display warning
    readlineLoop(lang.acceptsRisk+" ","yesno").
    then(function(result){
        if(!result){
            rl.close();
            echo(lang.warningNotAccepted,"red");
            console.log("");
            echo(lang.bye,"blue");
            process.exit(0);
        } else {
            echo("","");
        }
    }).
    then(function() {    
        // display bundle hash requirement
        echo(lang.maxBundleHash,"blue");
        return readlineLoop(lang.maxBundleHashQuestion+" ","yesno");
    }).
    then(function(result){
        if(!result){
            rl.close();
            echo(lang.noMaxBundleHash,"red");
            echo("","");
            echo(lang.bye,"blue");
            process.exit(0);
        } else {
            echo("","");
            echo(lang.hasMaxBundleHash,"blue");
        }    
    }).
    then(function() {
        // ask if ready
        return readlineLoop(lang.readyToStart+" ","yesno");
    }).
    then(function(result){
        if(!result){
            rl.close();
            echo(lang.bye,"blue");
            process.exit(0);
        } else {
            echo("","");
        }    
    }).
    then(function() {
        // ask for node
        return readlineLoop(lang.provideNode+" ("+config.node+"):"+" ","node");
    }).
    then(function(result){
        if(!result){
            rl.close();
            echo(lang.bye,"blue");
            process.exit(0);
        } else {
            // connect and test node
            echo(getPrintableTime()+" - "+lang.checking+" node: "+tmpConfig.node.provider,"yellow");
        }
    }).
    then(function() {
        // connect and test node
        return connectAndTestNode();
    }).
    then(function(result){
        if(!result){
            //error or node not in sync
            rl.close();
            echo(lang.bye,"blue");
            process.exit(0);
        } else {
            echo(getPrintableTime()+" - "+lang.nodeSynced,"green");
            echo("","");
        }
    }).
    then(function() {
        // ask for address
        return readlineLoop(lang.provideTargetAddress+" ","address")
    }).
    then(function(result){
        if(!result){
            rl.close();
            echo(lang.bye,"blue");
            process.exit(0);
        } else {
            // connect and test node
            echo(getPrintableTime()+" - "+lang.checking+" balance...","yellow");
        }
    }).
    then(function() {
        //check balance
        return getBalance(tmpConfig.targetAddress);
    }).
    then(function(result){
        if(!result){
            rl.close();
            echo(lang.error);
            echo(lang.bye,"blue");
            process.exit(0);
        } else if(result==0){
            rl.close();
            echo("","");
            echo(lang.noBalance,"red");
            echo(lang.bye,"blue");
            process.exit(0);
        } else {
            tmpConfig.balance=parseInt(result);
            echo(getPrintableTime()+" - "+lang.currentBalance+formatNumber(result),"green");
            echo("","");
        }
    }).
    then(function() {
        // ask for hash
        return readlineLoop(lang.provideMaxBundleHash+" ","bundleHash");
    }).
    then(function(result){
        if(!result){
            rl.close();
            echo(lang.bye,"blue");
            process.exit(0);
        } else {
            // move on
        }
    }).
    then(function() {
        // get the max bundle hash
        return readlineLoop(lang.processedMaxBundleHash+" ","yesno");
    }).
    then(function(result){
        if(!result){
            // process bundle
            tmpConfig.bundleHash=normalizedBundle(tmpConfig.bundleHash);
        } else {
            // convert bundle direct to index
            let tmp=[];
            let chars={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:10,K:11,L:12,M:13,N:-13,O:-12,P:-11,Q:-10,R:-9,S:-8,T:-7,U:-6,V:-5,W:-4,X:-3,Y:-2,Z:-1,"9":0};             
            for(let i=0;i<81;i++){
               tmp.push(chars[tmpConfig.bundleHash.charAt(i)]);
            }
            tmpConfig.bundleHash=tmp;
        }
         echo("","");
    }).
    then(function() {
        // ask for address
        return readlineLoop(lang.provideRescueAddress+" ","rescueAddress");
    }).
    then(function(result){
        if(!result){
            rl.close();
            echo(lang.bye,"blue");
            process.exit(0);
        } else {
            // do some tests
            echo(getPrintableTime()+" - "+lang.checking+" address...","yellow");
        }
    }).
    then(function() {
        //check address
        if(tmpConfig.targetAddress==tmpConfig.rescueAddress){
            //no comment
            echo(lang.rescueSameAddress,"red");
            rl.close();
            echo("","");
            echo(lang.bye,"blue");
            process.exit(0);
        } else {
            return wereSpentFrom(tmpConfig.rescueAddress);
        }     
    }).
    then(function(result){
        if(!result){
            rl.close();
            echo(lang.error,"red");
            echo("","");
            echo(lang.bye,"blue");
            process.exit(0);
        } else if(result==-1){
            rl.close();
            echo("","");
            echo(lang.rescueAddressUsed,"red");
            process.exit(0);
        } else {
            echo(getPrintableTime()+" - "+lang.looksClean,"green");
            echo("","");
        }
    }).
    then(function() {
        // ask for Seed
        return readlineLoop(lang.provideSeed+" ","seed");
    }).
    then(function(result){
        if(!result){
            rl.close();
            echo(lang.bye,"blue");
            process.exit(0);
        } else {
            // continue
            echo("","");
        }
    }).
    then(function(){
        // ask for security level
        return readlineLoop(lang.provideSecurityLevel+" ","secLevel");
    }).
    then(function(result){
        if(!result){
            rl.close();
            echo(lang.bye,"blue");
            process.exit(0);
        } else {
            // continue...
            echo("","");
            echo(lang.findAddressIndex,"yellow");
        }
    }).
    then(function(){
        // find index of address
        return findAddressIndex(tmpConfig.seed,tmpConfig.secLevel,tmpConfig.targetAddress,0);
    }).
    then(function(result){
        if(result===false){
            rl.close();
            echo(lang.error,"red");
            echo("","");
            echo(lang.bye,"blue");
            process.exit(0);
        } else if(result===-1){
            rl.close();
            echo(lang.notFoundAddressIndex,"red");
            echo("","");
            echo(lang.bye,"blue");
            process.exit(0);
        } else {
            // continue...
            tmpConfig.targetAddressIndex=result;
            echo(getPrintableTime()+" - "+lang.foundAddressIndex+result,"green");
        }
    }).
    then(function(){
        echo(getPrintableTime()+" - "+lang.creatingBundle,"yellow");
        // create the bundle
        tmpConfig.bundle=new Array();
        var timestamp=Math.floor(Date.now()/1000);
        // push output
        tmpConfig.bundle.push({
            address:tmpConfig.rescueAddress,
            tag:"IOTA9REUSE9RESCUE9999999999",
            obsoleteTag:"IOTA9REUSE9RESCUE9999999999",
            value:tmpConfig.balance,
            timestamp:timestamp,
            currentindex:0,
            lastindex:tmpConfig.secLevel
        });
        // push input
        tmpConfig.bundle.push({
            address:tmpConfig.targetAddress,
            tag:"999999999999999999999999999",
            obsoleteTag:"999999999999999999999999999",
            value:(-1*tmpConfig.balance),
            timestamp:timestamp,
            currentindex:1,
            lastindex:tmpConfig.secLevel
        });
        for(var i=2;i<=tmpConfig.secLevel;i++){
            tmpConfig.bundle.push({
                address:tmpConfig.targetAddress,
                tag:"999999999999999999999999999",
                obsoleteTag:"999999999999999999999999999",
                value:0,
                timestamp:timestamp,
                currentindex:i,
                lastindex:tmpConfig.secLevel
            }); 
        }
        // prepare the bundle hash to match sec level
        tmpConfig.bundleHash=tmpConfig.bundleHash.slice(0, tmpConfig.secLevel*27);
    }).
    then(function(){
        // do a test run!
        echo("","");
        echo(lang.performingBenchmark,"yellow");
        return doJob(getStaticBundleData(tmpConfig.bundle),tmpConfig.bundleHash,20000);
    }).
    then(function(result){
        if(!result){
            rl.close();
            echo(lang.bye,"blue");
            process.exit(0);
        } else if(result.rps<=0){
            // div 0 later on
            rl.close();
            echo(lang.benchmarkFailed,"red");
            echo("","");
            echo(lang.bye,"blue");
            process.exit(0);  
        } else {
            // continue...
            tmpConfig.performance=Math.ceil(result.rps/1.5); // will be slower using multiple cores!
            echo(getPrintableTime()+" - "+lang.benchmarkDone+" "+formatNumber(tmpConfig.performance)+" rps","green");
            echo("","");
        }
    }).
    then(function(){
        // ask for run time
        return readlineLoop(lang.provideRunTime+" ","runTime");
    }).
    then(function(result){
        if(!result){
            rl.close();
            echo(lang.bye,"blue");
            process.exit(0);
        } else {
            echo("","");
            echo(lang.loadConfig1+tmpConfig.coreCount+lang.loadConfig2+formatNumber(tmpConfig.loadCount)+lang.loadConfig3,"blue");
            echo(lang.loadConfig4+formatNumber(tmpConfig.loadCount*tmpConfig.coreCount)+lang.loadConfig5,"green");
            // continue...
            echo("","");
        }
    }).
    then(function(){
        // Display summary and ask if we should start
        echo(lang.summary,"blue");
        echo(lang.summary1+tmpConfig.targetAddress,"blue");
        echo(lang.summary2+formatNumber(tmpConfig.balance),"blue");
        echo(lang.summary3+tmpConfig.rescueAddress,"blue");
        echo(lang.summary4+formatNumber(tmpConfig.loadCount*tmpConfig.coreCount),"blue");
        echo("","");
        return readlineLoop(lang.letsGo+" ","yesno");
    }).
    then(function(result){
        return new Promise((resolve) => {
            if(!result){
                rl.close();
                echo(lang.bye,"blue");
                process.exit(0);
            } else {
                tmpConfig.workerFinished=false;
                // Fork workers
                for (let i = 0; i < tmpConfig.coreCount; i++) {
                  activeWorkers++;
                  const worker = cluster.fork();
                  workers.push(worker);
                  // Listen for messages from worker
                  worker.on('message', function(message) {
                        //worker.process.pid
                        // check if worker found better result
                        if(message.success){
                            if(tmpConfig.revealFactor>message.revealFactor){
                               tmpConfig.revealFactor=message.revealFactor;
                               tmpConfig.bestTag=message.bestTag;
                               tmpConfig.usedBundleHash=message.bundleHash;
                               if(tmpConfig.revealFactor==0){
                                for (var id in cluster.workers) {
                                    cluster.workers[id].process.kill();
                                }   
                               }
                            }
                            tmpConfig.workerFinished=true;
                        }   
                  });
                  worker.on('exit', (code, signal) => {
                    if (signal==="SIGTERM") {
                      echo(getPrintableTime()+" - Worker "+worker.process.pid+" was killed!","blue");
                    } else if (signal) {
                      echo(getPrintableTime()+" - Worker "+worker.process.pid+" was killed by signal: "+signal,"red");
                    } else if (code !== 0) {
                      echo(getPrintableTime()+" - Worker "+worker.process.pid+" exited with error code: "+code,"red");
                    }
                    activeWorkers--;
                    if(activeWorkers<=0 && tmpConfig.workerFinished){
                        resolve(true);
                    }
                  });
                }
                var workcount=0;
                workers.forEach(function(worker) {
                    // increase initial tag
                    tmpConfig.bundle[(tmpConfig.bundle.length-1)].obsoleteTag=getTagOffset((workcount*tmpConfig.loadCount*2));
                    worker.send({data:{bundleData:getStaticBundleData(tmpConfig.bundle),fragmentIndexes:tmpConfig.bundleHash,maxRounds:tmpConfig.loadCount,id:(workcount+1)}});
                    workcount++;
                }, this);
                echo(getPrintableTime()+" - "+workcount+" workers started","yellow");
            }
        })
    }).
    then(function(result){
        return new Promise((resolve) => {
            if(tmpConfig.bestTag===""||tmpConfig.usedBundleHash===""){
                // no tag? something went horrible wrong
                rl.close();
                echo(lang.error,"red");
                echo(lang.bye,"blue");
                process.exit(0);  
            } else {
                echo(lang.updatingBundle,"blue");
                // update bundle
                for(var i=0;i<tmpConfig.bundle.length;i++){
                    tmpConfig.bundle[i].bundle=tmpConfig.usedBundleHash;
                    tmpConfig.bundle[i].trunkTransaction = '9'.repeat(81);
                    tmpConfig.bundle[i].branchTransaction = '9'.repeat(81);
                    tmpConfig.bundle[i].attachmentTimestamp = '9'.repeat(9);
                    tmpConfig.bundle[i].attachmentTimestampLowerBound = '9'.repeat(9);
                    tmpConfig.bundle[i].attachmentTimestampUpperBound = '9'.repeat(9);
                    tmpConfig.bundle[i].nonce = '9'.repeat(27);
                }
                tmpConfig.bundle[(tmpConfig.bundle.length-1)].obsoleteTag=tmpConfig.bestTag;

                // add empty signature to first bundle
                tmpConfig.bundle[0].signatureMessageFragment="";
                for (var i = 0; tmpConfig.bundle[0].signatureMessageFragment.length < 2187; i++) {
                    tmpConfig.bundle[0].signatureMessageFragment += '9';
                }
                // get the key
                echo(getPrintableTime()+" - "+lang.gettingKey,"yellow");
                var Signing = require("iota.lib.js/lib/crypto/signing/signing");
                var key = Signing.key(Converter.trits(tmpConfig.seed), tmpConfig.targetAddressIndex, tmpConfig.secLevel);
                var normalizedBundleHash = normalizedBundle(tmpConfig.bundle[0].bundle);
                // sign inputs
                echo(getPrintableTime()+" - "+lang.signingInput,"yellow");            
                for (var j = 1; j <= tmpConfig.secLevel; j++) {
                    // get key fragment
                    tmpConfig.bundle[j].signatureMessageFragment="";
                    // calculate 27 fragments
                    for (var i = 0; i<27;i++){
                        tmpConfig.bundle[j].signatureMessageFragment+=singleSignatureFragment(Converter.trytes(key.slice(243*(j-1)*27+(i*243), 243*(j-1)*27+(i*243)+243)), normalizedBundleHash[(j-1)*27+i])                       
                    }
                }
                echo(getPrintableTime()+" - "+lang.signingDone,"yellow");
                let sig=new Array();
                for (var i = 1; i < tmpConfig.bundle.length; i++) {
                  sig.push(tmpConfig.bundle[i].signatureMessageFragment);  
                }            
                if(!validateSelfSigned(tmpConfig.bundle[0].bundle,sig,tmpConfig.bundle[1].address)){
                    echo(getPrintableTime()+" - "+lang.signingFailed,"red");
                    resolve(false);
                } else {
                    tmpConfig.bundleTrytes = [];
                    var Utils = require('iota.lib.js/lib/utils/utils.js');
                    tmpConfig.bundle.forEach(function(tx) {
                        tmpConfig.bundleTrytes.push(Utils.transactionTrytes(tx));
                    })
                    tmpConfig.bundleTrytes=tmpConfig.bundleTrytes.reverse();
                    echo(getPrintableTime()+" - "+lang.signingSuccess,"green");
                    resolve(true);
                }          
            }
        })
    }).
    then(function(result) {
        if(!result){
            rl.close();
            echo(lang.bye,"blue");
            process.exit(0);
        }
        echo("","");
        echo(lang.summaryFinal,"blue");
        echo(lang.summary1+tmpConfig.targetAddress,"blue");
        echo(lang.summary2+formatNumber(tmpConfig.balance),"blue");
        echo(lang.summary3+tmpConfig.rescueAddress,"blue");
        echo(lang.summaryFinal1+formatNumber(tmpConfig.revealFactor),"blue");
        echo("","");
        return readlineLoop(lang.letsGo+" ","yesno");
    }).
    then(function(result){
        rl.close();
        echo("","");
        if(!result){
            echo(lang.bye,"blue");
            process.exit(0);
        }
        //check balance
        echo(getPrintableTime()+" - "+lang.finalBalanceCheck,"yellow");
        return getBalance(tmpConfig.targetAddress); 
    }).
    then(function(result){
        if(!result){
            echo(lang.error,"red");
            echo(lang.bye,"blue");
            process.exit(0);
        } else if(result==0){
            echo("","");
            echo(lang.noBalance,"red");
            process.exit(0);
        } else if(tmpConfig.balance!=parseInt(result)){
            echo("","");
            echo(lang.finalBalanceCheckMissmatch+" : "+formatNumber(result)+" vs. "+formatNumber(tmpConfig.balance),"red");
            echo("","");
            echo(lang.bye,"blue");
            process.exit(0);
        } else {
            echo("","");
            echo(lang.finalBalanceCheckMatch,"yellow");
        }
    }).
    then(function(){
        return new Promise((resolve, reject) => {
            tmpConfig.node.lib.api.sendTrytes(tmpConfig.bundleTrytes, tmpConfig.depth, tmpConfig.minWeightMagnitude, function(e, s) {
                if(e){
                    echo(lang.transferFailed);
                    echo("","");
                    console.log(e);
                    echo(lang.bye,"blue");
                    process.exit(0);
                } else {
                    echo(lang.transferSuccess+tmpConfig.usedBundleHash,"green");
                    echo("","");
                    echo(lang.transferWarning,"red");
                    echo("","");
                    echo(lang.greetings,"blue");
                    echo("","");
                    echo(lang.bye,"blue");
                    process.exit(0);
                }
            });
        })
    });
    
}

function childProcess() {
  process.on('message', function(message) {
        // start work
        doJob(message.data.bundleData,message.data.fragmentIndexes,message.data.maxRounds,(message.data.id==1))
        .then(function(result){
            if(result.success){
                process.send({ success:result.success,bestTag:result.bestTag,bundleHash:result.bundleHash,revealFactor:result.revealFactor,rps:result.rps,id: process.pid });  
            } else {
                process.send({ success:false,id: process.pid });  
            }
            process.exit(0);    
        });
  });
}

/** **/
function doJob(bundleData,fragmentIndexes,maxRounds,print){
    return new Promise((resolve, reject) => {
        // init helpers
        const CryptoJS = require("crypto-js");
        const SHA3 = require('keccak');
        const tritAdd = require("./helpers/adder.js");
        const WConverter = require("./helpers/words.js");
        //
        const startdate = new Date(); 
        const lastbundle = bundleData.length-1;
        const fragmentLength = fragmentIndexes.length;
        const secLevel=Math.floor(fragmentLength/27);
        var sha3 = new SHA3('keccak384'), sha3clone = new SHA3('keccak384');
        var hash = [], essence = [],normalizedHash=[];
        var tagtrits = Converter.trits(bundleData[lastbundle].obsoleteTag);
        var bestTag=bundleData[lastbundle].obsoleteTag,bestHash="";
        var i=0,rounds=0,revealFactor=2178,curfactor=0,nextPrint=Math.round(maxRounds*0.15);
        // prepare the state
        for (; i < bundleData.length; i++) {
            sha3.update(Buffer.from(CryptoJS.lib.WordArray.create(WConverter.trits_to_words(Converter.trits(bundleData[i].address))).toString(),'hex'));
            if(i<lastbundle){
                // do not push final bundle
                sha3.update(Buffer.from(CryptoJS.lib.WordArray.create(WConverter.trits_to_words(Converter.trits(bundleData[i].value + bundleData[i].obsoleteTag + bundleData[i].timestamp + bundleData[i].currentindex + bundleData[i].lastindex))).toString(),'hex'));
            } else {
                // prepare final essence instead
                essence=Converter.trits(bundleData[i].value+bundleData[i].obsoleteTag+bundleData[i].timestamp + bundleData[i].currentindex + bundleData[i].lastindex);
            }
        }
        // do the looping
        while(rounds<maxRounds) {
            if(rounds==nextPrint&&print){
                nextPrint+=Math.round(maxRounds*0.15);
                echo(getPrintableTime()+" - Worker reached "+Math.round(100*rounds/maxRounds)+"%","yellow");
            }
            sha3clone=sha3._clone();
            rounds++;
            essence.splice(81,81,...tagtrits);
            sha3clone.update(Buffer.from(CryptoJS.lib.WordArray.create(WConverter.trits_to_words(essence)).toString(),'hex'));
            hash=(Array.from(WConverter.words_to_trits(CryptoJS.enc.Base64.parse(Buffer.from(sha3clone.digest(), "binary").toString('base64')).words)));
            normalizedHash = normalizedBundleFromTrits(hash,secLevel);
            if (normalizedHash.indexOf(13)===-1){
            //catch M!!!!!
                i=0;
                curfactor=0;
                for (;i<fragmentLength;i++){
                    if(normalizedHash[i]>fragmentIndexes[i]){
                        // calculate reveal factor
                        curfactor+=(normalizedHash[i]+13)-(fragmentIndexes[i]+13);
                    }
                    if(curfactor>=revealFactor){
                        //speed it up!
                        i=fragmentLength;
                    }
                }
                if(curfactor<revealFactor){
                    revealFactor=curfactor;
                    bestTag=Converter.trytes(tagtrits);
                    bestHash=Converter.trytes(hash);
                    if(revealFactor==0){
                        //we found a perfect match
                        rounds=maxRounds;
                    }
                }
            }
            tagtrits=tritAdd(tagtrits, [1]);
        }
        let currentdate = new Date();
        resolve({success:true,bestTag:bestTag,bundleHash:bestHash,revealFactor:revealFactor,rps:Math.round(rounds/((currentdate-startdate)/1000))});
    });    
}
/** node functions **/
function connectAndTestNode(){
    return new Promise((resolve) => {
        tmpConfig.node.lib = new IOTA({provider:tmpConfig.node.provider});
        tmpConfig.node.lib.api.getNodeInfo(function(error, success) {
            if (error) {
                echo(getPrintableTime()+" - "+lang.error,"red"); 
                console.error(error);
                resolve(false);
            } else {
                if(success.latestMilestoneIndex-success.latestSolidSubtangleMilestoneIndex<=2){
                    resolve(true);
                } else {
                    echo(getPrintableTime()+" - "+lang.nodeNotSynced,"green"); 
                    resolve(false);
                }
            }    
        });
    });
}
/** net functions **/
function getBalance(address){
    return new Promise((resolve, reject) => {
        let tmp=tmpConfig.node.provider.split(":");
        let con=require(tmp[0]=='https'?'https':'http');
        let options = {
          hostname: trimChar(tmp[1],"/"),
          port: tmp[2],
          path: '/',
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'X-IOTA-API-Version': '1',
          }
        };
        var req = con.request(options, function(res) {
          res.setEncoding('utf8');
          res.on('data', function (body) {
            body=JSON.parse(body);
            if(typeof(body)==="undefined"){
                resolve(false);
            } else if(typeof(body.balances)==="undefined"){
                resolve(false);
            } else {
                resolve(body.balances[0]);              
            }
          });
        });
        req.on('error', function(err) {
            echo(getPrintableTime()+" - Error resolving address balance.","red");
            console.log(err);
            resolve(false);
        });
        // write data to request body
        req.write('{"command": "getBalances", "addresses": ["'+address+'"], "threshold": 100}');
        req.end();
    });
}
function wereSpentFrom(address){
    return new Promise((resolve, reject) => {
        let tmp=tmpConfig.node.provider.split(":");
        let con=require(tmp[0]=='https'?'https':'http');
        let options = {
          hostname: trimChar(tmp[1],"/"),
          port: tmp[2],
          path: '/',
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'X-IOTA-API-Version': '1',
          }
        };
        var req = con.request(options, function(res) {
          res.setEncoding('utf8');
          res.on('data', function (body) {
            body=JSON.parse(body);
            if(typeof(body)==="undefined"){
                resolve(true);
            } else if(typeof(body.states)==="undefined"){
                resolve(false);
            } else {
                resolve((body.states[0]?-1:true));              
            }
          });
        });
        req.on('error', function(err) {
            echo(getPrintableTime()+" - Error resolving addressSpentFrom.","red");
            console.log(err);
            resolve(false);
        });
        // write data to request body
        req.write('{"command": "wereAddressesSpentFrom", "addresses": ["'+address+'"], "threshold": 100}');
        req.end();
    });
}
/** read functions **/
function readlineLoop(msg,type){
    return new Promise((resolve) => {
        readlinePromise(msg).
        then(function(answer){
                if(type=="yesno"){
                    if(answer.toLowerCase()=="yes"||answer.toLowerCase()=="y"){
                        resolve(true);
                    } else if(answer.toLowerCase()=="no"){
                        resolve(false);
                    } else {
                        resolve(readlineLoop(lang.invalidInput+" ",type));
                    }
                } else if(type=="node"){
                    answer=trimChar(answer.toLowerCase(),"/");
                    if(answer==""){
                        tmpConfig.node.provider=config.node;                      
                        resolve(true);
                    } else if(/^http(s?):\/\/((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|:[1-9]{1,5})){4}$/.test(answer) ||
                       /^http(s?):\/\/((?!-))(xn--)?[a-z0-9][a-z0-9-_]{0,61}[a-z0-9]{0,1}\.(xn--)?([a-z0-9\-]{1,61}|[a-z0-9-]{1,30}\.[a-z]{2,}):[1-9]{1,5}$/.test(answer)){
                        // test port as well
                        let tmp=answer.split(":");
                        if(/^(6553[0-5]|655[0-2][0-9]\d|65[0-4](\d){2}|6[0-4](\d){3}|[1-5](\d){4}|[1-9](\d){0,3})$/.test(tmp[2])){
                            tmpConfig.node.provider=answer;
                            resolve(true);  
                        } else {
                            resolve(readlineLoop(lang.invalidInput+" ",type));
                        }
                    }  else {
                        resolve(readlineLoop(lang.invalidInput+" ",type));
                    }                    
                } else if(type=="address"){
                    answer=trimChar(answer.toUpperCase()," ");
                    if(/^[A-Z9]{90}$/.test(answer)){
                        // check checksum
                        if(!tmpConfig.node.lib.utils.isValidChecksum(answer)){
                            echo(lang.addressChecksumMissmatch,"red");
                            resolve(readlineLoop(lang.invalidInput+" ",type)); 
                        } else {
                           tmpConfig.targetAddress=tmpConfig.node.lib.utils.noChecksum(answer);
                           resolve(true);
                        }
                    } else if(/^[A-Z9]{81}$/.test(answer)){
                        // no checksum provided
                        echo(lang.addressNoChecksum,"red");
                        resolve(readlineLoop(lang.invalidInput+" ",type));
                    } else {
                        resolve(readlineLoop(lang.invalidInput+" ",type));
                    }                    
                }  else if(type=="rescueAddress"){
                    answer=trimChar(answer.toUpperCase()," ");
                    if(/^[A-Z9]{90}$/.test(answer)){
                        // check checksum
                        if(!tmpConfig.node.lib.utils.isValidChecksum(answer)){
                            echo(lang.addressChecksumMissmatch,"red");
                            resolve(readlineLoop(lang.invalidInput+" ",type)); 
                        } else {
                           tmpConfig.rescueAddress=tmpConfig.node.lib.utils.noChecksum(answer);
                           resolve(true);
                        }
                    } else if(/^[A-Z9]{81}$/.test(answer)){
                        // no checksum provided
                        echo(lang.addressNoChecksum,"red");
                        resolve(readlineLoop(lang.invalidInput+" ",type));
                    } else {
                        resolve(readlineLoop(lang.invalidInput+" ",type));
                    }                    
                } else if(type=="bundleHash"){
                    answer=trimChar(answer.toUpperCase()," ");
                    if(/^[A-Z9]{81}$/.test(answer)){
                        tmpConfig.bundleHash=answer
                        resolve(true);
                    } else {
                        resolve(readlineLoop(lang.invalidInput+" ",type));
                    }                    
                } else if(type=="seed"){
                    answer=trimChar(answer.toUpperCase()," ");
                    if(/^[A-Z9]{70,81}$/.test(answer)){ // maybe not a 81 trytes seed
                        tmpConfig.seed=answer
                        resolve(true);
                    } else {
                        resolve(readlineLoop(lang.invalidInput+" ",type));
                    }                    
                } else if(type=="secLevel"){
                    answer=trimChar(answer," ");
                    if(answer===""){ // use default
                        tmpConfig.secLevel=2;
                        resolve(true);
                    } else if(answer==="1"||answer==="2"||answer==="3"){
                        tmpConfig.secLevel=parseInt(answer);
                        resolve(true);
                    } else {
                        resolve(readlineLoop(lang.invalidInput+" ",type));
                    }                    
                } else if(type=="runTime"){
                    answer=parseInt(trimChar(answer," "));
                    if(answer>=3&&answer<=30){
                        tmpConfig.loadCount=tmpConfig.performance*60*answer;
                        resolve(true);
                    } else {
                        resolve(readlineLoop(lang.invalidInput+" ",type));
                    }                    
                } else {
                    resolve(false);
                }
        });
    })
}
function readlinePromise(msg) {
  return new Promise((resolve) => {
    rl.question(msg, (name) => { resolve(name) })
  })
}
/** helper functions **/
function echo(msg,color){
    if(color=="blue"){
      console.log('\x1b[34m%s\x1b[30m', msg);  
    } else if(color=="red"){
      console.log('\x1b[31m%s\x1b[30m', msg);  
    } else if(color=="yellow"){
      console.log('\x1b[33m%s\x1b[30m', msg);  
    } else if(color=="green"){
      console.log('\x1b[32m%s\x1b[30m', msg);  
    } else {
       console.log(msg); 
    }
    
    
}
function trimChar(string, charToRemove) {
    while(string.charAt(0)==charToRemove) {
        string = string.substring(1);
    }

    while(string.charAt(string.length-1)==charToRemove) {
        string = string.substring(0,string.length-1);
    }

    return string;
}
function getPrintableTime(){
    // simple timestamp printer
    var currentdate = new Date(); 
    return ("0"+currentdate.getHours()).slice(-2) + ":"  
                    + ("0"+currentdate.getMinutes()).slice(-2) + ":" 
                    + ("0"+currentdate.getSeconds()).slice(-2);
}
function formatNumber(number){
    return number.toString().replace(/./g, function(c, i, a) {
        return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
    });
}
function getStaticBundleData(bundle){
    var bundleData=new Array();
    for (let i=0;i<bundle.length; i++) {
        var valueTrits = Converter.trits(bundle[i].value);
        while (valueTrits.length < 81) {
            if(Converter.trytes(valueTrits).slice(-1)==9){
                valueTrits=Converter.trits((Converter.trytes(valueTrits)+"999999999999999999999999999").slice(0,27));
            } else {
                valueTrits[valueTrits.length] = 0;
            }
        }
        var timestampTrits = Converter.trits(bundle[i].timestamp);
        while (timestampTrits.length < 27) {
            timestampTrits[timestampTrits.length] = 0;
        }
        var currentIndexTrits = Converter.trits(bundle[i].currentIndex = i);
        while (currentIndexTrits.length < 27) {
            currentIndexTrits[currentIndexTrits.length] = 0;
        }
        var lastIndexTrits = Converter.trits(bundle[i].lastIndex = bundle.length - 1);
        while (lastIndexTrits.length < 27) {
            lastIndexTrits[lastIndexTrits.length] = 0;
        }
        bundleData.push({address:bundle[i].address,obsoleteTag:bundle[i].obsoleteTag,value:Converter.trytes(valueTrits),timestamp:Converter.trytes(timestampTrits),currentindex:Converter.trytes(currentIndexTrits),lastindex:Converter.trytes(lastIndexTrits)});
    }
    return bundleData;
}
function getTagOffset(offset){
    var tag="";
    var chars=["N","O","P","Q","R","S","T","U","V","W","X","Y","Z","9","A","B","C","D","E","F","G","H","I","J","K","L","M"];
    for (var i=26;i>=0;i--){
        for (var j=27;j>=0;j--){
            if(offset>=Math.pow(27,i)*j){
              tag=chars[j]+tag;
              if(j>0){
                  offset-=Math.pow(27,i)*j;
                  break;
              }
            }
        } 
    }
    return tag;
}

function singleSignatureFragment(curFragment, targetIndex) {
    var Kerl = require("iota.lib.js/lib/crypto/kerl/kerl.js");
    var kerl = new Kerl();
    var hash = Converter.trits(curFragment);
    for (var j = 13; j > targetIndex; j--) {
        kerl.initialize();
        kerl.reset();
        kerl.absorb(hash, 0, hash.length);
        kerl.squeeze(hash, 0, 243);
    }
    return Converter.trytes(hash);
} 
function validateSelfSigned(bundlehash,signatureFragments,targetaddress){
    var Signing = require("iota.lib.js/lib/crypto/signing/signing");
    var normalizedBundleHash = normalizedBundle(bundlehash);
    var normalizedBundleFragments = [];   
    // Split hash into 3 fragments
    for (var l = 0; l < 3; l++) {
        normalizedBundleFragments[l] = normalizedBundleHash.slice(l * 27, (l + 1) * 27);
    }
    var digests = [];
    for (var i = 0; i < signatureFragments.length; i++) {
        var digestBuffer = Signing.digest(normalizedBundleFragments[i % 3], Converter.trits(signatureFragments[i]));
        for (var j = 0; j < 243; j++) {
            digests[i * 243 + j] = digestBuffer[j]
        }
    }
    var address = Converter.trytes(Signing.address(digests));
    return(targetaddress==address);
}

function findAddressIndex(seed,secLvl,address,index){
    return new Promise((resolve) => {
        if(index>500){
            resolve(-1);
        } else {
            echo(getPrintableTime()+" - "+lang.checking+" index: "+index,"yellow");
            tmpConfig.node.lib.api.getNewAddress(seed,{checksum:false,index:index,total:1,security:secLvl}, function(error,data) {
                if(error){
                  resolve(false);  
                } else if(address==data[0]){
                    resolve(index);
                } else {
                    resolve(findAddressIndex(seed,secLvl,address,(index+1)));
                }
            });
        }
    });
}

function normalizedBundleFromTrits(bundleHashTrits,seclevel) {
    var normalizedBundle = [];
    for (var i = 0; i < seclevel; i++) {
        var sum = 0;
        for (var j = 0; j < 27; j++) {
            sum += (normalizedBundle[i * 27 + j] = Converter.value(bundleHashTrits.slice(i * 81  + j * 3 , i * 81  + j * 3 + 3)));
        }    
        if (sum >= 0) {
            while (sum-- > 0) {
                for (var j = 0; j < 27; j++) {
                    if (normalizedBundle[i * 27 + j] > -13) {
                        normalizedBundle[i * 27 + j]--;
                        break;
                    }
                }
            }
        } else {
            while (sum++ < 0) {
                for (var j = 0; j < 27; j++) {
                    if (normalizedBundle[i * 27 + j] < 13) {
                        normalizedBundle[i * 27 + j]++;
                        break;
                    }
                }
            }
        }
    }
    return normalizedBundle;
}

function normalizedBundle(bundleHash) {
    var normalizedBundle = [];
    var i = 0, j = 0, sum=0;
    for (; i < 3; i++) {
        sum = 0;
        for (var j = 0; j < 27; j++) {
            sum += (normalizedBundle[i * 27 + j] = Converter.value(Converter.trits(bundleHash.charAt(i * 27 + j))));
        }
        if (sum >= 0) {
            while (sum-- > 0) {
                for (var j = 0; j < 27; j++) {
                    if (normalizedBundle[i * 27 + j] > -13) {
                        normalizedBundle[i * 27 + j]--;
                        break;
                    }
                }
            }
        } else {
            while (sum++ < 0) {
                for (var j = 0; j < 27; j++) {
                    if (normalizedBundle[i * 27 + j] < 13) {
                        normalizedBundle[i * 27 + j]++;
                        break;
                    }
                }
            }
        }
    }
    return normalizedBundle;
}