import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Paper,
    Alert,
} from "@mui/material";
import Web3 from "web3";
import axios from "axios";

function App() {
    const [records, setRecords] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [account, setAccount] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadWeb3();
        loadRecords();
    }, []);

    const loadWeb3 = async() => {
        if (window.ethereum) {
            try {
                // Request account access
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });

                // Use the first account
                const firstAccount = accounts[0];
                setAccount(firstAccount);
                setError("");

                // Listen for account changes
                window.ethereum.on("accountsChanged", (accounts) => {
                    setAccount(accounts[0]);
                });

                // Add the account to Ganache if it's not already there
                try {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [{
                            chainId: "0x539", // Ganache's default chain ID
                            chainName: "Ganache",
                            nativeCurrency: {
                                name: "ETH",
                                symbol: "ETH",
                                decimals: 18,
                            },
                            rpcUrls: ["http://127.0.0.1:7545"],
                            blockExplorerUrls: [],
                        }, ],
                    });
                } catch (addError) {
                    console.log("Error adding chain:", addError);
                }
            } catch (error) {
                console.error("User denied account access:", error);
                setError("Please connect your MetaMask wallet to continue");
            }
        } else {
            setError("Please install MetaMask to use this application");
        }
    };

    const loadRecords = async() => {
        try {
            const response = await axios.get("http://localhost:3001/records");
            setRecords(response.data);
        } catch (error) {
            console.error("Error loading records:", error);
            setError("Error loading records. Please try again later.");
        }
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        if (!account) {
            setError("Please connect your MetaMask wallet first");
            return;
        }

        try {
            await axios.post("http://localhost:3001/add-record", {
                name,
                description,
                account,
            });
            setName("");
            setDescription("");
            loadRecords();
            setError("");
        } catch (error) {
            console.error("Error adding record:", error);
            setError("Error adding record. Please try again.");
        }
    };

    return ( <
        Container maxWidth = "md" >
        <
        Box sx = {
            { my: 4 } } >
        <
        Typography variant = "h4"
        component = "h1"
        gutterBottom >
        Decentralized Data Registry { " " } <
        /Typography>{" "} {
            error && ( <
                Alert severity = "error"
                sx = {
                    { mb: 2 } } > { " " } { error } { " " } <
                /Alert>
            )
        } { " " } {
            account && ( <
                Alert severity = "success"
                sx = {
                    { mb: 2 } } >
                Connected Account: { account } { " " } <
                /Alert>
            )
        } { " " } <
        Paper elevation = { 3 }
        sx = {
            { p: 3, mb: 3 } } >
        <
        form onSubmit = { handleSubmit } >
        <
        TextField fullWidth label = "Name"
        value = { name }
        onChange = {
            (e) => setName(e.target.value) }
        margin = "normal"
        required /
        >
        <
        TextField fullWidth label = "Description"
        value = { description }
        onChange = {
            (e) => setDescription(e.target.value) }
        margin = "normal"
        multiline rows = { 4 }
        required /
        > { " " } {
            !account ? ( <
                Button variant = "contained"
                color = "primary"
                onClick = { loadWeb3 }
                sx = {
                    { mt: 2 } }
                fullWidth >
                Connect MetaMask { " " } <
                /Button>
            ) : ( <
                Button type = "submit"
                variant = "contained"
                color = "primary"
                sx = {
                    { mt: 2 } }
                fullWidth >
                Add Record { " " } <
                /Button>
            )
        } { " " } <
        /form>{" "} <
        /Paper>{" "} <
        Typography variant = "h5"
        gutterBottom >
        Records { " " } <
        /Typography>{" "} <
        List > { " " } {
            records.map((record) => ( <
                ListItem key = { record.id }
                divider >
                <
                ListItemText primary = { record.name }
                secondary = { record.description }
                />{" "} <
                /ListItem>
            ))
        } { " " } <
        /List>{" "} <
        /Box>{" "} <
        /Container>
    );
}

export default App;