const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const inquirer = require('inquirer');
const chalk = require('chalk'); // Import chalk

// Load environment variables from .env file
dotenv.config();

// Sepolia Etherscan base URL for transaction links
const ETHERSCAN_BASE_URL = 'https://sepolia.etherscan.io/tx/';

// Console Banner
function printBanner() {
    console.log(chalk.magenta(`
████████╗██╗░░░██╗██████╗░███╗░░██╗██╗░░██╗███████╗██╗░░░██╗
╚══██╔══╝██║░░░██║██╔══██╗████╗░██║██║░██╔╝██╔════╝╚██╗░██╔╝
░░░██║░░░██║░░░██║██████╔╝██╔██╗██║█████═╝░█████╗░░░╚████╔╝░
░░░██║░░░██║░░░██║██╔══██╗██║╚████║██╔═██╗░██╔══╝░░░░╚██╔╝░░
░░░██║░░░╚██████╔╝██║░░██║██║░╚███║██║░╚██╗███████╗░░░██║░░░
░░░╚═╝░░░░╚═════╝░╚═╝░░╚═╝╚═╝░░╚══╝╚═╝░░╚═╝╚══════╝░░░╚═╝░░░
                Scricpt By Kazmight
            Join Channel Dasar pemulung
    `));
   
// Function to read wallets from wallet.txt
function readWallets(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data.split('\n').map(addr => addr.trim()).filter(addr => addr.length > 0);
    } catch (error) {
        console.error(chalk.red(`Error reading wallet.txt: ${error.message}`));
        process.exit(1);
    }
}

async function main() {
    printBanner();

    const privateKeys = [];
    // Read private keys from .env
    for (let i = 1; ; i++) {
        const pkVar = `PRIVATE_KEY_${i}`;
        const privateKey = process.env[pkVar];
        if (!privateKey) {
            if (i === 1) {
                console.error(chalk.red('Error: No PRIVATE_KEY_1 found in .env. Please set at least one private key.'));
                process.exit(1);
            }
            break; // No more private keys
        }
        privateKeys.push(privateKey);
    }

    if (privateKeys.length === 0) {
        console.error(chalk.red('No private keys found in .env. Please ensure PRIVATE_KEY_1, PRIVATE_KEY_2, etc., are set.'));
        process.exit(1);
    }

    console.log(chalk.blue(`Found ${privateKeys.length} sender account(s) from .env.`));

    // Sepolia RPC URL (you can replace with your preferred provider, e.g., Infura, Alchemy)
    const sepoliaRpcUrl = 'https://rpc.sepolia.org'; // Or use your own RPC endpoint
    const web3 = new Web3(sepoliaRpcUrl);

    // Read recipient wallets
    const recipientWalletsPath = path.join(__dirname, 'wallet.txt');
    const recipientWallets = readWallets(recipientWalletsPath);

    if (recipientWallets.length === 0) {
        console.error(chalk.red('No recipient wallets found in wallet.txt. Please add recipient addresses.'));
        process.exit(1);
    }
    console.log(chalk.blue(`Found ${recipientWallets.length} recipient wallet(s) in wallet.txt.`));

    // Get user input for number of transactions
    const { numTransactions } = await inquirer.prompt([
        {
            type: 'input',
            name: 'numTransactions',
            message: chalk.blue('How many transactions do you want to run (e.g., 1-100)?'),
            validate: input => {
                const num = parseInt(input);
                if (isNaN(num) || num < 1) {
                    return chalk.red('Please enter a valid number greater than or equal to 1.');
                }
                return true;
            }
        }
    ]);

    // Get user input for delay
    const { delaySeconds } = await inquirer.prompt([
        {
            type: 'input',
            name: 'delaySeconds',
            message: chalk.blue('Enter delay between transactions in seconds (e.g., 5 for 5 seconds):'),
            validate: input => {
                const num = parseInt(input);
                if (isNaN(num) || num < 0) {
                    return chalk.red('Please enter a valid number greater than or equal to 0.');
                }
                return true;
            }
        }
    ]);

    // Get user input for amount to send
    const { amountToSendEther } = await inquirer.prompt([
        {
            type: 'input',
            name: 'amountToSendEther',
            message: chalk.blue('Enter the amount of Sepolia ETH to send per transaction (e.g., 0.001):'),
            validate: input => {
                const num = parseFloat(input);
                if (isNaN(num) || num <= 0) {
                    return chalk.red('Please enter a valid amount greater than 0.');
                }
                return true;
            }
        }
    ]);

    const amountToSendWei = web3.utils.toWei(amountToSendEther, 'ether');

    console.log(chalk.blue(`\nStarting ${numTransactions} transaction(s) with ${delaySeconds} seconds delay...`));
    console.log(chalk.blue(`Amount to send per transaction: ${amountToSendEther} Sepolia ETH`));

    let transactionCount = 0;
    while (transactionCount < parseInt(numTransactions)) {
        for (let i = 0; i < privateKeys.length; i++) {
            if (transactionCount >= parseInt(numTransactions)) break;

            const privateKey = privateKeys[i];
            const senderAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
            web3.eth.accounts.wallet.add(senderAccount);
            const senderAddress = senderAccount.address;

            const recipientAddress = recipientWallets[transactionCount % recipientWallets.length];

            console.log(chalk.blue(`\n--- Transaction ${transactionCount + 1} ---`));
            console.log(chalk.blue(`Sender: ${senderAddress}`));

            try {
                // Get sender's balance
                const senderBalanceWei = await web3.eth.getBalance(senderAddress);
                const senderBalanceEther = web3.utils.fromWei(senderBalanceWei, 'ether');
                console.log(chalk.yellow(`Sender Balance: ${senderBalanceEther} Sepolia ETH`));

                console.log(chalk.blue(`Recipient: ${recipientAddress}`));
                console.log(chalk.blue(`Amount: ${amountToSendEther} Sepolia ETH`));

                // Get gas price
                const gasPrice = await web3.eth.getGasPrice();
                console.log(chalk.blue(`Current Gas Price: ${web3.utils.fromWei(gasPrice, 'gwei')} Gwei`));

                // Estimate gas limit
                const gasLimit = 21000;
                console.log(chalk.blue(`Estimated Gas Limit: ${gasLimit}`));

                // Check if sender has enough funds
                const totalCostWei = BigInt(amountToSendWei) + (BigInt(gasPrice) * BigInt(gasLimit));
                if (BigInt(senderBalanceWei) < totalCostWei) {
                    throw new Error(`Insufficient funds. Required: ${web3.utils.fromWei(totalCostWei.toString(), 'ether')} Sepolia ETH, Have: ${senderBalanceEther} Sepolia ETH`);
                }

                const tx = {
                    from: senderAddress,
                    to: recipientAddress,
                    value: amountToSendWei,
                    gas: gasLimit,
                    gasPrice: gasPrice
                };

                const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
                const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

                const txLink = `${ETHERSCAN_BASE_URL}${receipt.transactionHash}`;
                console.log(chalk.green(`Transaction successful! Hash: ${receipt.transactionHash}`));
                console.log(chalk.green(`Tx Link: ${txLink}`));
                console.log(chalk.green(`Block Number: ${receipt.blockNumber}`));

                transactionCount++;

            } catch (error) {
                console.error(chalk.red(`Error in transaction ${transactionCount + 1}: ${error.message}`));
                if (error.message.includes('insufficient funds')) {
                    console.error(chalk.red(`Sender ${senderAddress} has insufficient funds for this transaction.`));
                }
                // Decide whether to continue or stop on error.
                // For now, we'll continue to the next sender/transaction.
            }

            if (transactionCount < parseInt(numTransactions)) {
                console.log(chalk.blue(`Waiting for ${delaySeconds} seconds before next transaction...`));
                await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
            }
        }
    }

    console.log(chalk.green('\nAll requested transactions completed!'));
}

main();
