import React, { useState, useEffect } from 'react';
import './App.css';

import Tweets from './components/Tweets';
import AddTweet from './components/AddTweet';
import Connect from './components/Connect';
import ProfileCreation from './components/ProfileCreation';

function App() {
	const [web3, setWeb3] = useState(null);
	const [account, setAccount] = useState(null);
	const [profileExists, setProfileExists] = useState(null);
	const [contract, setContract] = useState(null);
	const [profileContract, setProfileContract] = useState(null);
	const [tweets, setTweets] = useState([]);
	const [loading, setLoading] = useState(true);

	const getTweets = async () => {
		if (!contract) {
			console.error("Contract has not been initialised");
			return;
		}

		try {
			// Fetch tweets from the contract
			const tempTweets = await contract.methods.getAllTweets(account).call();

			// Sort tweets by timestamp in descending order
			const sortedTweets = [...tempTweets].sort((a, b) => b.timestamp - a.timestamp);

			// Update state with the sorted tweets
			setTweets(sortedTweets);
		} catch (error) {
			console.error("Error fetching tweets:", error);
		} finally {
			// Indicate loading is complete
			setLoading(false);
		}
	};

	const checkProfile = async () => {
		const userProfile = await getProfile(account);

		setProfileExists(userProfile);
	};

	const getProfile = async () => {
		if (!profileContract || !account) {
			console.error(
				"Contracts have not been initialised"
			);
			return;
		}


		try {
			setLoading(true);
			// Fetch tweets from the contract
			const tempProfile = await profileContract.methods.getProfile(account).call();

			return tempProfile.displayName;
		} catch (error) {
			console.error("Error fetching profile:", error);
		} finally {
			// Indicate loading is complete
			setLoading(false);
		}
	};

	useEffect(() => {
		if (contract && account) {
			if (profileExists) {
				getTweets();
			} else {
				checkProfile();
			}
		}
	}, [contract, account, profileExists]);

	function shortAddress(address, startLength = 6, endLength = 4) {
		if (address === account && profileExists) {
		  return profileExists;
		} else if (address) {
		  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
		}
	}

	return (
		<div className="container">
		  <h1>Twitter DAPP</h1>
		  <Connect
			setWeb3={setWeb3}
			account={account}
			setAccount={setAccount}
			setContract={setContract}
			shortAddress={shortAddress}
			setProfileContract={setProfileContract}
		  />
		  {!loading && account && profileExists ? (
			<>
			  <AddTweet
				contract={contract}
				account={account}
				getTweets={getTweets}
			  />
			  <Tweets tweets={tweets} shortAddress={shortAddress} />
			</>
		  ) : (
			account &&
			!loading && (
			  <ProfileCreation
				account={account}
				profileContract={profileContract}
				checkProfile={checkProfile}
			  />
			)
		  )}
		</div>
	);
}

export default App;
