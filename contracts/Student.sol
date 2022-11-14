// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract Student {
    uint public mySum;
    address public studentAddress;

    function addTwoNumbers(
        address calculator,
        uint a,
        uint b
    ) public returns (uint) {
        (bool success, bytes memory result) = calculator.delegatecall(
            abi.encodeWithSignature("add(uint256,uint256)", a, b)
        );
        require(success, "The call to calculator contract failed");
        return abi.decode(result, (uint));
    }
}
