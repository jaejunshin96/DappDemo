import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3 from "web3";
import TwitterABI from './TwitterABI.json';
import ProfileABI from './ProfileABI.json';

const CONTRACT_ADDRESS = "0x2C50a10327E8dB326A14E18cFB1b57EB8C375d4A";
const PROFILE_CONTRACT_ADDRESS = "0x58Ad6B345b15f9B16Eb85615ffBa02085A0f496a";

const Connect = ({
	account,
	shortAddress,
	setContract,
	setAccount,
	setProfileContract,
	setWeb3
}) => {
	async function switchToSepolia() {
	  try {
		// Request user to switch to Sepolia
		await window.ethereum.request({
		  method: "wallet_switchEthereumChain",
		  params: [{ chainId: "0xaa36a7" }] // Chain ID for Sepolia in hexadecimal
		});
	  } catch (switchError) {
		if (switchError.code === 4902) {
		  try {
			// If Sepolia is not added to user's MetaMask, add it
			await window.ethereum.request({
			  method: "wallet_addEthereumChain",
			  params: [
				{
				  chainId: "0xaa36a7",
				  chainName: "Sepolia",
				  nativeCurrency: {
					name: "ETH",
					symbol: "ETH",
					decimals: 18
				  },
				  rpcUrls: ["https://rpc.sepolia.org"]
				}
			  ]
			});
		  } catch (addError) {
			console.error("Failed to add Sepolia network to MetaMask", addError);
		  }
		} else {
		  console.error("Failed to switch to Sepolia network", switchError);
		}
	  }
	}

	async function connectWallet() {
	  if (window.ethereum) {
		try {
		  await window.ethereum.enable();
		  const networkId = await window.ethereum.request({
			method: "net_version"
		  });

		  if (networkId !== "100") {
			// Network ID for Sepolia
			await switchToSepolia();
		  }

		  // user enables the app to connect to MetaMask
		  const tempWeb3 = new Web3(window.ethereum);
		  setWeb3(tempWeb3);
		  const contractInstance = new tempWeb3.eth.Contract(
			TwitterABI,
			CONTRACT_ADDRESS
		  );

		  const profileContractInstance = new tempWeb3.eth.Contract(
			ProfileABI,
			PROFILE_CONTRACT_ADDRESS
		  );
		  setProfileContract(profileContractInstance);
		  console.log("HIIIIIII");
		  const accounts = await tempWeb3.eth.getAccounts();
		  console.log("aCCOUNTS", accounts);
		  if (accounts.length > 0) {
			setContract(contractInstance);
			setAccount(accounts[0]);
		  }
		  console.log("NAHHHHHH");
		} catch (error) {
		  console.error(error);
		}
	  } else {
		console.error("No web3 provider detected");
	  }
	}

	return (
	  <>
		<div className="connect">
		  {!account ? (
			<button id="connectWalletBtn" onClick={connectWallet}>
			  Connect Wallet
			</button>
		  ) : (
			<div id="userAddress">Connected: {shortAddress(account)}</div>
		  )}
		</div>
		<div id="connectMessage">
		  {!account ? "Please connect your wallet to tweet." : ""}
		</div>
	  </>
	);
  };

  export default Connect;
