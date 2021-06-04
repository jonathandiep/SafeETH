//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SafeETH is ERC20 {
    constructor() ERC20("SafeETH", "SFETH") {}

    function mint() external payable {
        _mint(msg.sender, msg.value * 1e5);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
        payable(msg.sender).transfer(amount / 1e5);
    }
}
