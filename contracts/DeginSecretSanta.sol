// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/** 
 * @title Secret Santa
 * @dev Implements a very simple secret santa 
 */
contract DegenSecretSanta {

    struct Gift {
        address tokenAddress;
        uint256 tokenId;
        address from;
    }

    Gift[] giftsAvail;

    // map gifter to number of gifts
    mapping(address => uint256) private giftsClaimable;

    function gift(address _tokenAddress, uint256 _tokenId) public returns (uint256) {
        IERC721 tokenContract = IERC721(_tokenAddress);
        tokenContract.safeTransferFrom(msg.sender, address(this), _tokenId);
        giftsClaimable[msg.sender] = giftsClaimable[msg.sender] + 1;
        giftsAvail.push(Gift(_tokenAddress, _tokenId, msg.sender));

        return giftsClaimable[msg.sender];
    }

    function surprise() public returns (Gift memory) {
        require(giftsClaimable[msg.sender] > 0, "need to gift to receive ya degen");
        uint randomIndex = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.number))) % giftsAvail.length;
        Gift memory toSurprise = giftsAvail[randomIndex];
        IERC721 tokenContract = IERC721(toSurprise.tokenAddress);
        tokenContract.safeTransferFrom(address(this), msg.sender, toSurprise.tokenId);
        giftsClaimable[msg.sender] = giftsClaimable[msg.sender] - 1;
        _burnGift(randomIndex);

        return toSurprise;
    }

    function _burnGift(uint index) internal {
        require(index < giftsAvail.length);
        giftsAvail[index] = giftsAvail[giftsAvail.length-1];
        giftsAvail.pop();
    }

    function pleaseRugMe() public {
        giftsClaimable[msg.sender] = 0;
    }

    function getGifts() public view returns (Gift[] memory) {
        return giftsAvail;
    }

    function getNumGiftsAvailable() public view returns (uint) {
        return giftsAvail.length;
    }

    function getNumClaimable(address _userAddress) public view returns (uint256) {
        return giftsClaimable[_userAddress];
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
