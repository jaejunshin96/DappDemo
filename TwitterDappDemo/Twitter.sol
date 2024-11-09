// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Twitter {
    uint16 public MAX_TWEET_LENGTH = 280;

    struct Tweet {
        uint256 id;
        address author;
        string content;
        uint timestamp;
        uint256 likes;
    }

    mapping(address => Tweet[]) public tweets;
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    event TweetCreated(uint256 indexed id, address author, string content, uint timestamp);
    event TweetLiked(address indexed liker, address tweetAuthor, uint256 tweetId, uint256 newLikeCount);
    event TweetUnliked(address indexed unliker, address tweetAuthor, uint256 tweetId, uint256 newLikeCount);

    modifier onlyOwner() {
        require(owner == msg.sender, "You are not the ower.");
        _;
    }

    function changeTweetLength(uint16 _newTweetLength) public onlyOwner {
        MAX_TWEET_LENGTH = _newTweetLength;
    }

    function createTweet(string memory _tweetText) public {
        require(bytes(_tweetText).length <= MAX_TWEET_LENGTH, "It can not be over 280 charactors.");

        Tweet memory _tweet = Tweet({
            id: tweets[msg.sender].length,
            author: msg.sender,
            content: _tweetText,
            timestamp: block.timestamp,
            likes: 0
        });

        tweets[msg.sender].push(_tweet);
        emit TweetCreated(_tweet.id, _tweet.author, _tweet.content, _tweet.timestamp);
    }

    function likeTweet(address _author, uint256 _id) external  {
        require(tweets[_author][_id].id == _id, "Tweet does not exist");

        tweets[_author][_id].likes += 1;
        emit TweetLiked(msg.sender, _author, _id, tweets[_author][_id].likes);
    }

    function unlikeTweet( address _author, uint256 _id) external {
        require(tweets[_author][_id].id == _id, "Tweet does not exist");
        require(tweets[_author][_id].likes > 0, "No likes exist");

        tweets[_author][_id].likes -= 1;
        emit TweetUnliked(msg.sender, _author, _id, tweets[_author][_id].likes);
    }

    function getTweet(uint256 _i) public view returns (Tweet memory) {
        return tweets[msg.sender][_i];
    }

    function getAllTweets(address _owner) public view returns (Tweet[] memory) {
        return tweets[_owner];
    }
}
