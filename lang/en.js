exports.welcome="Welcome to the unofficial IOTA rescue tool!";
exports.unofficial="This tool is not made nor audited by the IOTA Foundation - It is a community tool!";
exports.warning="This tool is meant to be used to move stuck funds from an used address, leading to the key reuse detected warning in most wallets. It will calculate several bundle hashes and choose the one revealing the minimum amount of new key parts to keep the address as secure as possible. It will guide you through the entire procedure and will not issue any transaction without your final OK.\r\n\r\nThis tool comes without any kind of warranty! You - and only YOU - are responsible for your tokens and since your are using this tool, something already went wrong.\r\nKey reuses should be avoided at any price and should only be your last resort! There are other ways to move stuck funds!\r\nUsing this tool can lead to lost funds, even though this tool is meant to minimalize the probability.\r\nIt is important that you read everything and follow our instructions carefully!\r\nIf in doubt, join the official IOTA Discord and ask for help!\r\nThis tool is not a toy!\r\n";
exports.acceptsRisk="Do you accept these risks? (yes/no)";
exports.invalidInput="Sorry?";
exports.warningNotAccepted="OK.. there is not much I can do for you!";
exports.maxBundleHash="OK! Before we can start: We will need the current maximum bundle hash of the address you want to send from. This will provide required information how much of the key already has been revealed. If you had one sending so far, just provide the bundle hash of the previous transaction. If you had multiple sendings, you will likely need a perma node for this! Please join the official IOTA Discord and go directly to #help. There will be people assisting you.\r\n";
exports.maxBundleHashQuestion="Do you have the maximum bundle hash? (yes/no)";
exports.noMaxBundleHash="As we need it, there is nothing this script can do for you. Please join the #help chan in the official IOTA Discord for further assistance.";
exports.hasMaxBundleHash="Great..\r\nHere is what we are going to do:\r\n\r\n"+
        "Steps:\r\n"+
        " 1) Node selection (We will need a node to work with)\r\n"+
        " 2) Address selection (Please provide the address you want to rescue funds from)\r\n"+
        " 3) Address inspection (We will do some tests and checks on your address)\r\n"+
        " 4) Current maximum bundle hash (We will need it for our calculations)\r\n"+
        " 5) Rescue address (We will need an address where we can transfer the funds to)\r\n"+
        " 6) Seed input (We will unfortunately need your seed to sign the transaction - it will never leave this tool though)\r\n"+
        " 7) Selftests (We will benchmark your device, in order to calculate a duration for finding a bundle)\r\n"+
        " 8) Summary (We will display a summary for you to double check everything)\r\n"+
        " 9) Preparing the transfer..\r\n"+
        "10) One more summary (We will display a summary for you to triple check everything)\r\n"+
        "11) Sending the transfer..\r\n";
exports.readyToStart="Are you ready to start? (yes/no)";
exports.bye="Bye, have a great time and thanks for all the fish.";
exports.provideNode="Step 1) Please provide a node, leave blank to use default one (make sure remote PoW is enabled!)"; //the default node will be added
exports.checking="Checking"; //used when checking something
exports.nodeSynced="Node working and in sync...";
exports.nodeNotSynced="Node is not synced!!!";
exports.error="Oh no...";
exports.provideTargetAddress="Step 2) Please provide the target address (where the funds should be rescued FROM):";
exports.provideRescueAddress="Step 5) Please provide the rescue address (where the funds will be transferred TO):";
exports.addressNoChecksum="We only accept addresses with checksum!";
exports.addressChecksumMissmatch="The checksum does not match! Please check!";
exports.currentBalance="Current balance for this address:";
exports.noBalance="OH NO!!! There is no balance on this address.. There is nothing we can rescue!";
exports.provideMaxBundleHash="Step 4) Please provide the current maximum bundle hash:";
exports.processedMaxBundleHash="Is this bundle hash proccessed? If not instructed to answer this question with yes, type no (for example if you directly used the bundle hash from a previous transaction): (yes/no)";
exports.provideSeed="Step 6) Please provide your seed:";
exports.provideSecurityLevel="Step 6a) What is the security index of the address we are going to send from? (Default is 2 - leave blank to use 2):";
exports.rescueSameAddress="You really want to save your funds TO the same address you are saving FROM? Nope!";
exports.rescueAddressUsed="This address already has been used.. You want to do this process over and over again?\r\nPlease provide a CLEAN address!";
exports.looksClean="Looks like a clean address...";
exports.findAddressIndex="Trying to find index for target address.. this might take a while!";
exports.foundAddressIndex="Found target address on index: ";
exports.notFoundAddressIndex="Could not find address after 500 rounds - Wrong seed or security level?";
exports.creatingBundle="Creating bundle...";
exports.performingBenchmark="Step 7) Performing benchmark... this might take a while...";
exports.benchmarkDone="Benchmark done - result:";
exports.benchmarkFailed="Somehow benchmark failed - unable to continue!";
exports.provideRunTime="Searching for a bundle takes time. For how long should the script search in minutes? Provide a number between 3 and 30:";
exports.loadConfig1="OK.. we will spawn ";
exports.loadConfig2=" workers with a load of ";
exports.loadConfig3=" rounds each.";
exports.loadConfig4="This will result in ";
exports.loadConfig5=" checked tags.";
exports.summary="Step 8) Summary:";
exports.summary1="We want to rescue from address: ";
exports.summary2="The amount we are going to transfer will be: ";
exports.summary3="We are sending to address: ";
exports.summary4="We will test the following amount of tags: ";
exports.letsGo="Please double check if everything is correct: Should we start? (yes/no)";
exports.taggingDone="Congratulations: Tagging done.";
exports.bestTag="Best tag found: ";
exports.revealingNew="New keyparts that will be revealed: ";
exports.updatingBundle="Step 9) Updating bundle";
exports.gettingKey="Getting key...";
exports.signingInput="Signing inputs...";
exports.signingDone="Signing done.. validating..";
exports.signingFailed="Signing failed!";
exports.signingSuccess="Signing complete!";
exports.summaryFinal="Step 10) Everything is ready for the transfer:";
exports.summaryFinal1="New key parts revealed: ";
exports.finalBalanceCheck="Performing final balance check...";
exports.finalBalanceCheckMissmatch="Fatal Error - Balance missmatch!";
exports.finalBalanceCheckMatch="Step 11) Balance OK - Starting Transfer...";
exports.transferFailed="OH NO! Transfer failed!";
exports.transferSuccess="We made it! The bundle hash of your save transfer is: ";
exports.transferWarning="Your funds are not safe until your bundle confirmed! Promote and reattach if necessary using your wallet!";
exports.greetings="I hope, this tool helped saving your funds!\r\nCome and see me in the official IOTA Discord: @Steppo#2084\r\nAlways happy to hear success stories.";