// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract HealthDataToken is ERC20 {
    address public rewardContract;

    constructor() ERC20("HealthDataToken", "HDT") {
        rewardContract = msg.sender;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == rewardContract, "Only Reward Contract can mint tokens");
        _mint(to, amount);
    }
}