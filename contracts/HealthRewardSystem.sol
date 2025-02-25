// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IHealthDataToken { // Interface to interact with an external ERC-20 contract
    function mint(address to, uint256 amount) external;
}

contract HealthRewardSystem {
    mapping(address => uint256) public userPoints; // Points earned by each user
    mapping(address => uint256) public lastSubmissionTime; // Keep track of last submission time to prevent spam
    uint256 public pointsPerToken = 100;  // Adjustable based on supply
    uint256 public totalTokensIssued = 0; // Keeps track of how many tokens have been minted in total
    uint256 public targetSupply = 50_000; // Ideal number of total tokens in circulation
    address public admin; // Stores the contract owner
    address public backendAddress;  // The wallet that pays gas on behalf of users
    IHealthDataToken public tokenContract; // Contract for minting

    event PointsEarned(address indexed user, uint256 points); // Logging
    event TokensMinted(address indexed user, uint256 tokens); // Events are also useful for off-chain services to listen for events and make updates accordingly (to UI for ex)
    
    constructor(address tokenAddress) {
        admin = msg.sender;
        tokenContract = IHealthDataToken(tokenAddress);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    // New modifier to allow only the backend to call certain functions
    modifier onlyBackend() {
        require(msg.sender == backendAddress, "Only backend can call this");
        _;
    }

    // Admin can set or change the backend address
    function setBackendAddress(address _backendAddress) external onlyAdmin {
        require(_backendAddress != address(0), "Invalid address");
        backendAddress = _backendAddress;
    }

    // --------------- Gasless (Backend-Pays for gas) Functions ---------------

    // The backend calls this on behalf of a user (with data stored under user)
    function submitDailyDataOnBehalf(address user, uint256 dataTypes, bool hasCondition)
        external
        onlyBackend
    {
        require(dataTypes > 0, "Must submit at least one data type");
        require(block.timestamp >= lastSubmissionTime[user] + 1 days, "User already submitted today");

        uint256 pointsEarned = (10 * dataTypes) + (hasCondition ? 20 : 0);
        userPoints[user] += pointsEarned;
        lastSubmissionTime[user] = block.timestamp;

        emit PointsEarned(user, pointsEarned);
    }

    // The backend calls this to convert points to tokens for a user
    function convertPointsToTokensOnBehalf(address user) external onlyBackend {
        uint256 tokensToMint = userPoints[user] / pointsPerToken;
        require(tokensToMint > 0, "Not enough points to convert");

        // Deduct the points used
        userPoints[user] %= pointsPerToken;

        // Mint tokens for the user
        tokenContract.mint(user, tokensToMint);
        totalTokensIssued += tokensToMint;

        adjustPointsPerToken();
        emit TokensMinted(user, tokensToMint);
    }

    // --------------- Original (User-Pays for gas) Functions ---------------

    function submitDailyData(uint256 dataTypes, bool hasCondition) public {
        require(dataTypes > 0, "Must submit at least one data type");
        require(block.timestamp >= lastSubmissionTime[msg.sender] + 1 days, "Can only submit once per day");

        uint256 pointsEarned = (10 * dataTypes) + (hasCondition ? 20 : 0);
        userPoints[msg.sender] += pointsEarned;
        lastSubmissionTime[msg.sender] = block.timestamp;

        emit PointsEarned(msg.sender, pointsEarned);
    }

    function convertPointsToTokens() public {
        uint256 tokensToMint = userPoints[msg.sender] / pointsPerToken;
        require(tokensToMint > 0, "Not enough points to convert");

        userPoints[msg.sender] %= pointsPerToken;
        tokenContract.mint(msg.sender, tokensToMint);
        totalTokensIssued += tokensToMint;

        adjustPointsPerToken();
        emit TokensMinted(msg.sender, tokensToMint);
    }

    function adjustPointsPerToken() internal onlyAdmin {
        if (totalTokensIssued > targetSupply) {
            pointsPerToken = (pointsPerToken * totalTokensIssued) / targetSupply;
        }
    }
}