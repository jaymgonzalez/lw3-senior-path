// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Calculator {
    uint public result;
    address public user;

    function add(uint a, uint b) public returns (uint) {
        result = a + b;
        user = msg.sender;
        return result;
    }
}
