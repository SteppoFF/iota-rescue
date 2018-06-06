# Welcome to IOTA Rescue!

**This tool is not made nor audited by the IOTA Foundation - It is a community tool!**

This tool is meant to be used to move stuck funds from an used address, leading to the "key reuse detected" warning in most wallets. It will calculate bundle hashes and choose the one revealing the minimum amount of new key parts to keep the address as secure as possible. It will guide you through the entire procedure and will not issue any transaction without your final OK.

This tool comes without any kind of warranty! You - and only **YOU** - are responsible for your tokens and since you are about to use this tool, something already went wrong.
Key reuses should be avoided at any price and should only be your last resort! There are other ways to move stuck funds!
Using this tool can lead to lost funds, even though this tool is meant to minimalize the probability.

If in doubt, join the official IOTA Discord and ask for help!

**This tool is not a toy!**
## What you need: 

### Install:
 1. Install **NodeJS** - [Website](https://nodejs.org/en/)
 2. Check **npm** (comes with NodeJS) and update (if required)  - [Website](https://www.npmjs.com/get-npm)
 3. To speed up the calculations, I recommend to install node-gyp. But it should work without as well - [Repository](https://github.com/nodejs/node-gyp)
 4. Clone this repository via git: `git clone https://github.com/SteppoFF/iota-rescue` **or** download repository as zip [here](https://github.com/SteppoFF/iota-rescue/archive/master.zip) and extract
 5. Install using `npm install`

### Start:
 1. Simply start the app using `node main.js`

### In order to rescue funds:
 1. A full node with remote PoW enabled (default is set to [https://nodes.iota.fm:443](http://iota.fm))
 2. Address where the funds are stuck (with checksum)
 3. Current maximum bundle hash for this address*
 4. Seed for this address
 5. Security level for this address (default is 2)
 6. A clean address where we can move the funds to (with checksum)

*We will need the current maximum bundle hash of the address you want to send from. This will provide required information how much of the key already has been revealed. If you had one sending so far, just provide the bundle hash of the previous transaction. If you had multiple sendings, you will likely need a perma node for this! Please join the official IOTA Discord and go directly to #help. There will be people assisting you.

## Tool Steps: 

 1. Node selection (We will need a node to work with)
 2. Address selection (Please provide the address you want to rescue funds from)
 3. Address inspection (We will do some tests and checks on your address)
 4. Current maximum bundle hash (We will need it for our calculations)
 5. Rescue address (We will need an address where we can transfer the funds to)
 6. Seed input (We will unfortunately need your seed to sign the transaction - it will never leave this tool though)
 7. Selftests (We will benchmark your device, in order to calculate a duration for finding a bundle)
 8. Summary (We will display a summary for you to double check everything)
 9. Preparing the transfer..
 10. One more summary (We will display another summary for you to triple check everything)
 11. Sending the transfer..

## Greetings...
.. to all the helpful folks in the IOTA Discord #help channel. You do a perfect job! Might our lifes become easier now.

## Donations
This tool is **completely free**..
If you wish to donate anyhow, feel free to send IOTA to:

`TXBBJTRTXMDJTPXMZPNSVARFGJ9YIWKKOADGZYSKTUGWQZRXBTRVCWPFPJJNGAOHNBEVKKPWPNNAI9KPBEDYFCAVVD`

![Donation Address](https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=TXBBJTRTXMDJTPXMZPNSVARFGJ9YIWKKOADGZYSKTUGWQZRXBTRVCWPFPJJNGAOHNBEVKKPWPNNAI9KPBEDYFCAVVD)
