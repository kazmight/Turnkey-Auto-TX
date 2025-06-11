const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const inquirer = require('inquirer');

// Use dynamic import for chalk.
let chalk;

dotenv.config();

const ETHERSCAN_BASE_URL = 'https://sepolia.etherscan.io/tx/';

function printBanner() {
    console.log(chalk.hex('#FF00FF')(`
████████╗██╗░░░██╗██████╗░███╗░░██╗██╗░░██╗███████╗██╗░░░██╗
╚══██╔══╝██║░░░██║██╔══██╗████╗░██║██║░██╔╝██╔════╝╚██╗░██╔╝
░░░██║░░░██║░░░██║██████╔╝██╔██╗██║█████═╝░█████╗░░░╚████╔╝░
░░░██║░░░██║░░░██║██╔══██╗██║╚████║██╔═██╗░██╔══╝░░░░╚██╔╝░░
░░░██║░░░╚██████╔╝██║░░██║██║░╚███║██║░╚██╗███████╗░░░██║░░░
░░░╚═╝░░░░╚═════╝░╚═╝░░╚═╝╚═╝░░╚══╝╚═╝░░╚═╝╚══════╝░░░╚═╝░░░
            Scricpt By Kazmight
        Join Channel Dasar pemulung
    `));
    console.log(chalk.hex('#00FFFF')('------------------------------------------'));
    console.log(chalk.hex('#00FFFF')('Turnkey Token Auto Transfer'));
    console.log(chalk.hex('#00FFFF')('------------------------------------------\n'));
}

function readWallets(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return data.split('\n').map(addr => addr.trim()).filter(addr => addr.length > 0);
    } catch (error) {
        console.error(chalk.hex('#FF0000')(`Error reading wallet.txt: ${error.message}`));
        process.exit(1);
    }
}

async function main() {
    chalk = (await import('chalk')).default;
    const prompt = inquirer.createPromptModule();

    printBanner();

    const CORRECT_PASSWORD_FROM_ENV = process.env.SCRIPT_PASSWORD;
    let expectedPassword = CORRECT_PASSWORD_FROM_ENV;

    if (!expectedPassword) {
        expectedPassword = 'turnkey01';
        
        console.log(chalk.hex('#0000FF')('Anda akan diminta untuk memasukkan password secara manual.'));
    } else {
        console.log(chalk.hex('#00FF00')('Meminta verifikasi password...\n'));
    }

    let isAuthenticated = false;
    while (!isAuthenticated) {
        const { inputPassword } = await prompt([
            {
                type: 'password',
                name: 'inputPassword',
                message: chalk.hex('#0000FF')('Masukkan password untuk menjalankan script:'),
            }
        ]);

        if (inputPassword === expectedPassword) {
            isAuthenticated = true;
            console.log(chalk.hex('#00FF00')('Password benar! Melanjutkan eksekusi script...\n'));
        } else {
            console.error(chalk.hex('#FF0000')('Password salah! Silakan coba lagi.'));
        }
    }

    const privateKeys = [];
    for (let i = 1; ; i++) {
        const pkVar = `PRIVATE_KEY_${i}`;
        const privateKey = process.env[pkVar];
        if (!privateKey) {
            if (i === 1) {
                console.error(chalk.hex('#FF0000')('Error: No PRIVATE_KEY_1 found in .env. Please set at least one private key.'));
                process.exit(1);
            }
            break;
        }
        privateKeys.push(privateKey);
    }

    if (privateKeys.length === 0) {
        console.error(chalk.hex('#FF0000')('No private keys found in .env. Please ensure PRIVATE_KEY_1, PRIVATE_KEY_2, etc., are set.'));
        process.exit(1);
    }

    console.log(chalk.hex('#0000FF')(`Found ${privateKeys.length} sender account(s) from .env.`));

    const sepoliaRpcUrl = 'https://eth-sepolia.public.blastapi.io';
    const web3 = new Web3(sepoliaRpcUrl);

    // Variabel untuk menyimpan nonce akun agar tidak macet
    const accountNonces = {};

    const recipientWalletsPath = path.join(__dirname, 'wallet.txt');
    const recipientWallets = readWallets(recipientWalletsPath);

    if (recipientWallets.length === 0) {
        console.error(chalk.hex('#FF0000')('No recipient wallets found in wallet.txt. Please add recipient addresses.'));
        process.exit(1);
    }
    console.log(chalk.hex('#0000FF')(`Found ${recipientWallets.length} recipient wallet(s) in wallet.txt.`));

    const { numTransactions } = await prompt([
        {
            type: 'input',
            name: 'numTransactions',
            message: chalk.hex('#0000FF')('How many transactions do you want to run (e.g., 1-100)?'),
            validate: input => {
                const num = parseInt(input);
                if (isNaN(num) || num < 1) {
                    return chalk.hex('#FF0000')('Please enter a valid number greater than or equal to 1.');
                }
                return true;
            }
        }
    ]);

    const { delaySeconds } = await prompt([
        {
            type: 'input',
            name: 'delaySeconds',
            message: chalk.hex('#0000FF')('Enter delay between transactions in seconds (e.g., 5 for 5 seconds):'),
            validate: input => {
                const num = parseInt(input);
                if (isNaN(num) || num < 0) {
                    return chalk.hex('#FF0000')('Please enter a valid number greater than or equal to 0.');
                }
                return true;
            }
        }
    ]);

    const { amountToSendEther } = await prompt([
        {
            type: 'input',
            name: 'amountToSendEther',
            message: chalk.hex('#0000FF')('Enter the amount of Sepolia ETH to send per transaction (e.g., 0.001):'),
            validate: input => {
                const num = parseFloat(input);
                if (isNaN(num) || num <= 0) {
                    return chalk.hex('#FF0000')('Please enter a valid amount greater than 0.');
                }
                return true;
            }
        }
    ]);

    const amountToSendWei = web3.utils.toWei(amountToSendEther, 'ether');

    console.log(chalk.hex('#0000FF')(`\nStarting ${numTransactions} transaction(s) with ${delaySeconds} seconds delay...`));
    console.log(chalk.hex('#0000FF')(`Amount to send per transaction: ${amountToSendEther} Sepolia ETH`));

    let transactionCount = 0;
    while (transactionCount < parseInt(numTransactions)) {
        for (let i = 0; i < privateKeys.length; i++) {
            if (transactionCount >= parseInt(numTransactions)) break;

            const privateKey = privateKeys[i];
            const senderAccount = web3.eth.accounts.privateKeyToAccount(privateKey);

            // --- PERUBAHAN DI SINI UNTUK MENYEMBUNYIKAN LOG "already exists" ---
            try {
                if (!web3.eth.accounts.wallet[senderAccount.address]) {
                    web3.eth.accounts.wallet.add(senderAccount);
                }
            } catch (e) {
                // Catch the specific "Account ... already exists" error if it's thrown
                // and simply ignore it. Other errors will still be thrown.
                if (e.message && e.message.includes('already exists')) {
                    // console.log(chalk.gray(`(Ignored log: ${e.message})`)); // Opsional: Untuk debugging
                } else {
                    throw e; // Lemparkan error lain yang tidak kita harapkan
                }
            }
            // --- AKHIR PERUBAHAN ---

            const senderAddress = senderAccount.address;

            const recipientAddress = recipientWallets[transactionCount % recipientWallets.length];

            console.log(chalk.hex('#0000FF')(`\n--- Transaction ${transactionCount + 1} ---`));
            console.log(chalk.hex('#0000FF')(`Sender: ${senderAddress}`));

            try {
                // Pastikan nonce diperbarui untuk setiap akun pengirim
                if (accountNonces[senderAddress] === undefined) {
                    accountNonces[senderAddress] = await web3.eth.getTransactionCount(senderAddress, 'pending');
                    console.log(chalk.blue(`Initial Nonce for ${senderAddress}: ${accountNonces[senderAddress]}`));
                } else {
                    accountNonces[senderAddress]++; // Increment nonce for next transaction from this account
                    console.log(chalk.blue(`Incremented Nonce for ${senderAddress}: ${accountNonces[senderAddress]}`));
                }

                const senderBalanceWei = await web3.eth.getBalance(senderAddress);
                const senderBalanceEther = web3.utils.fromWei(senderBalanceWei, 'ether');
                console.log(chalk.yellow(`Sender Balance: ${senderBalanceEther} Sepolia ETH`));

                console.log(chalk.blue(`Recipient: ${recipientAddress}`));
                console.log(chalk.blue(`Amount: ${amountToSendEther} Sepolia ETH`));

                const gasPrice = await web3.eth.getGasPrice();
                console.log(chalk.blue(`Current Gas Price: ${web3.utils.fromWei(gasPrice, 'gwei')} Gwei`));

                const gasLimit = 21000;
                console.log(chalk.blue(`Estimated Gas Limit: ${gasLimit}`));

                const totalCostWei = BigInt(amountToSendWei) + (BigInt(gasPrice) * BigInt(gasLimit));
                if (BigInt(senderBalanceWei) < totalCostWei) {
                    throw new Error(`Insufficient funds. Required: ${web3.utils.fromWei(totalCostWei.toString(), 'ether')} Sepolia ETH, Have: ${senderBalanceEther} Sepolia ETH`);
                }

                const tx = {
                    from: senderAddress,
                    to: recipientAddress,
                    value: amountToSendWei,
                    gas: gasLimit,
                    gasPrice: gasPrice,
                    nonce: accountNonces[senderAddress]
                };

                const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
                
                const receipt = await Promise.race([
                    web3.eth.sendSignedTransaction(signedTx.rawTransaction),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Transaction timed out after 60 seconds.')), 60000)
                    )
                ]);

                const txLink = `${ETHERSCAN_BASE_URL}${receipt.transactionHash}`;
                console.log(chalk.green(`Transaction successful! Hash: ${receipt.transactionHash}`));
                console.log(chalk.green(`Tx Link: ${txLink}`));
                console.log(chalk.green(`Block Number: ${receipt.blockNumber}`));

                transactionCount++;

            } catch (error) {
                console.error(chalk.red(`Error in transaction ${transactionCount + 1}: ${error.message}`));
                if (error.message.includes('insufficient funds')) {
                    console.error(chalk.red(`Sender ${senderAddress} has insufficient funds for this transaction.`));
                } else if (error.message.includes('Transaction timed out')) {
                    console.error(chalk.red('Transaction took too long to be mined or broadcasted. You might want to check the transaction hash manually on Etherscan.'));
                } else if (error.message.includes('nonce too low') || error.message.includes('replacement transaction underpriced')) {
                    console.error(chalk.red('Nonce issue detected. Attempting to re-fetch nonce for this account.'));
                    delete accountNonces[senderAddress]; // Clear nonce to force re-fetch
                }
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
