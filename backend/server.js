const express = require("express");
const cors = require("cors");
const Web3 = require("web3");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Web3 with Sepolia RPC
const web3 = new Web3(process.env.SEPOLIA_RPC_URL || "https://sepolia.drpc.org");

// Add private key for transaction signing
const privateKey = process.env.PRIVATE_KEY; // Ensure this is set in your .env file
if (!privateKey) {
    throw new Error("PRIVATE_KEY not set in environment variables");
}
const account = web3.eth.accounts.privateKeyToAccount(privateKey).address;
web3.eth.accounts.wallet.add(privateKey);

// Load contract ABI and address
const contractABI = require("../build/contracts/Registry.json").abi;
const contractAddress = process.env.CONTRACT_ADDRESS;

const registryContract = new web3.eth.Contract(contractABI, contractAddress);

// GET records
app.get("/records", async (req, res) => {
    console.log("GET /records");
    try {
        const recordCount = await registryContract.methods.getRecordCount().call();
        const records = [];

        for (let i = 1; i <= recordCount; i++) {
            const record = await registryContract.methods.getRecord(i).call();
            records.push({
                id: record[0],
                name: record[1],
                description: record[2],
            });
        }

        res.json(records);
    } catch (error) {
        console.error("Error fetching records:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// POST new record
app.post("/add-record", async (req, res) => {
    console.log("POST /add-record", req.body);
    try {
        const { name, description } = req.body;

        // Input validation
        if (!name || typeof name !== "string" || name.length > 100) {
            return res.status(400).json({ error: "Invalid or missing name (max length 100)" });
        }
        if (!description || typeof description !== "string" || description.length > 500) {
            return res.status(400).json({ error: "Invalid or missing description (max length 500)" });
        }

        console.log("Adding record from account:", account);

        // Estimate gas
        const gas = await registryContract.methods
            .addRecord(name, description)
            .estimateGas({ from: account });

        const gasPrice = await web3.eth.getGasPrice();
        console.log("Estimated Gas:", gas, "Gas Price:", gasPrice);

        const tx = await registryContract.methods
            .addRecord(name, description)
            .send({
                from: account,
                gas: Math.round(gas * 1.2), // Add 20% buffer
                gasPrice: gasPrice,
            });

        res.json({
            success: true,
            transactionHash: tx.transactionHash,
        });
    } catch (error) {
        console.error("Error adding record:", error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});