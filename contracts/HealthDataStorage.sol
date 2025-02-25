// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HealthDataStorage {
    address public owner;
    address public backendAddress; // The backend's wallet that pays gas on behalf of users
    mapping(address => bytes32[]) private userHashes; // Store hashes for each user
    mapping(address => mapping(bytes32 => bool)) private userHashExists; // Mapping to store info regarding whether hashes exist or not for a user

    event DataStored(address indexed user, bytes32 dataHash); // Event used for logging (efficiently, low gas fees)

    constructor() {
        owner = msg.sender;
    }

    // Modifier to ensure certain functions are only performed by the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyBackend() {
        require(msg.sender == backendAddress, "Only backend can call this");
        _;
    }


    // Function to set or change the backendAddress. This can only be done by the contract owner.
    function setBackendAddress(address _backendAddress) public onlyOwner {
        require(_backendAddress != address(0), "Invalid address");
        backendAddress = _backendAddress;
    }

    // Submit data for a user, while using the backend for gas fees
    function submitDataOnBehalf(address user, bytes32 dataHash) public onlyBackend {
        require(!userHashExists[user][dataHash], "Hash already exists");
        userHashes[user].push(dataHash);
        userHashExists[user][dataHash] = true;
        emit DataStored(user, dataHash);
    }

    // Batch submit data for a user, while using backend for gas fees. This is the partial submit implementation
    // so duplicates are ignored.
    function batchSubmitDataOnBehalf(address user, bytes32[] memory dataHashes) public onlyBackend {
        require(dataHashes.length <= 100, "Too many hashes in one batch");
        for (uint256 i = 0; i < dataHashes.length; i++) {
            require(!userHashExists[user][dataHashes[i]], "Hash already exists");
            userHashes[user].push(dataHashes[i]);
            userHashExists[user][dataHashes[i]] = true;
            emit DataStored(user, dataHashes[i]);
        }
    }

    function submitData(bytes32 dataHash) public {
        require(!userHashExists[msg.sender][dataHash], "Hash already exists");
        userHashes[msg.sender].push(dataHash);
        userHashExists[msg.sender][dataHash] = true;
        emit DataStored(msg.sender, dataHash);
    }


    function batchSubmitData(bytes32[] memory dataHashes) public {
        require(dataHashes.length <= 100, "Too many hashes in one batch"); // Limit max batch size to prevent DoS
        for (uint256 i = 0; i < dataHashes.length; i++) {
            submitData(dataHashes[i]);
        }
    }

    // For the case where some hashes could be duplicates, this skips over them but doesn't revert the entire transaction
    function batchSubmitDataPartial(bytes32[] memory dataHashes) public {
        for (uint256 i = 0; i < dataHashes.length; i++) {
            if (!userHashExists[msg.sender][dataHashes[i]]) {
                userHashes[msg.sender].push(dataHashes[i]);
                userHashExists[msg.sender][dataHashes[i]] = true;
                emit DataStored(msg.sender, dataHashes[i]);
            }
        }
    }

    // Only contract owner can get all hashes for a particular user
    function getHashes(address user) public view onlyOwner returns (bytes32[] memory) {
        return userHashes[user];
    }

    // Verify that the given hash exists for a particular user
    function verifyData(bytes32 hash, address user) public view returns (bool) {
        return userHashExists[user][hash];
    }
}