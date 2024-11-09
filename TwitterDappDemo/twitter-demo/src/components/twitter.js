import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import TwitterABI from './abi.json';

const CONTRACT_ADDRESS = "0x8B5CEfb9504471af53f11011EC8Fa91f8527108d";

function TwitterDapp() {
	const [provider, setProvider] = useState(null);
	const [signer, setSigner] = useState(null);
	const [contract, setContract] = useState(null);
    const [account, setAccount] = useState(null);
    const [tweets, setTweets] = useState([]);
    const [tweetContent, setTweetContent] = useState("");
    const [maxTweetLength, setMaxTweetLength] = useState(280);

	// Connect to MetaMask and initialize the contract
	const connectWallet = async () => {
		if (window.ethereum) {
			try {
				const provider = new ethers.BrowserProvider(window.ethereum);
				await provider.send("eth_requestAccounts", []);
				const signer = await provider.getSigner();
				const account = await signer.getAddress();
				console.log(`${account}`);

				setProvider(provider);
				setSigner(signer);
				setAccount(account);

				const twitterContract = new ethers.Contract(
					CONTRACT_ADDRESS,
					TwitterABI,
					signer
				);
				setContract(twitterContract);

				// Fetch initial tweets
				loadTweets(twitterContract, account);
				fetchMaxTweetLength(twitterContract);
			} catch (error) {
				console.error("Error connecting wallet:", error);
			}
		} else {
			alert("Please install MetaMask!");
		}
	};

	const fetchMaxTweetLength = async (twitterContract) => {
		const maxLength = await twitterContract.MAX_TWEET_LENGTH();
		setMaxTweetLength(Number(maxLength));
	};

	const loadTweets = async (contract, account) => {
		try {
			const tweets = await contract.getAllTweets(account);
			setTweets(tweets);
		} catch (error) {
			console.error("Error loading tweets:", error);
			setTweets([]);
		}
	};

	const postTweet = async () => {
		if (!tweetContent) return;
		if (tweetContent.length > maxTweetLength) {
			alert(`Tweet can't exceed ${maxTweetLength} characters.`);
			return;
		}

		try {
			const tx = await contract.createTweet(tweetContent);
			await tx.wait();
			setTweetContent("");
			loadTweets(contract, account);
		} catch (error) {
			console.error("Error creating Tweet:", error);
		}
	};

	const likeTweet = async (author, tweetId) => {
		try {
			const tx = await contract.likeTweet(author, tweetId);
			await tx.wait();
			loadTweets(contract, account)
		} catch (error) {
			console.error("Error liking tweet:", error);
		}
	};

	const unlikeTweet = async (author, tweetId) => {
		try {
			const tx = await contract.unlikeTweet(author, tweetId);
			await tx.wait();
			loadTweets(contract, account)
		} catch (error) {
			console.error("Error unliking tweet:", error);
		}
	};

	return (
		<div className="twitter-app">
			<h1 className="app-title">Decentralized Twitter</h1>
			{!account ? (
				<button className="connect-button" onClick={connectWallet}>Connect Wallet</button>
			) : (
				<div className="twitter-container">
					<div className="tweet-input-section">
						<p className="account-info">Connected as: {account}</p>
						<textarea
							value={tweetContent}
							onChange={(e) => setTweetContent(e.target.value)}
							placeholder="What's happening?"
							maxLength={maxTweetLength}
							className="tweet-input"
						/>
						<button className="tweet-button" onClick={postTweet}>Tweet</button>
						<p className="max-length-info">Max Tweet Length: {maxTweetLength} characters</p>
					</div>

					<h2 className="tweets-title">Your Tweets</h2>
					<div className="tweets-feed">
						{tweets.length > 0 ? (
							tweets.map((tweet, index) => (
								<div key={index} className="tweet">
									<div className="tweet-header">
										<strong className="tweet-author">{tweet.author}</strong>
										<span className="tweet-timestamp">
											{new Date(Number(tweet.timestamp) * 1000).toLocaleString()}
										</span>
									</div>
									<p className="tweet-content">{tweet.content}</p>
									<div className="tweet-actions">
										<span className="tweet-likes">Likes: {tweet.likes.toString()}</span>
										<button className="like-button" onClick={() => likeTweet(tweet.author, tweet.id)}>Like</button>
										<button className="unlike-button" onClick={() => unlikeTweet(tweet.author, tweet.id)}>Unlike</button>
									</div>
								</div>
							))
						) : (
							<p className="no-tweets">No tweets found.</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export default TwitterDapp;



