// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract CollectionFactory {
    event CollectionCreated(uint256 collectionId, address collectionAddress);

    uint256 collectionCounter = 0;

    mapping (uint256 => Collection) public idToCollection;

    function createCollection(string memory _name, string memory _symbol) public {
        collectionCounter += 1;
        Collection newCollection = new Collection(_name, _symbol, msg.sender);
        idToCollection[collectionCounter] = newCollection;
        emit CollectionCreated(collectionCounter, address(newCollection));
    }

}

contract Collection is ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _complaintIdCounter;

    address public collectionCreator;

    enum Status{registered, underReview, underRepairment, repaired, underReplacement, replaced}

    struct Product {
        uint256 warrantyStart;
        uint256 warrantyEnd;
    }

    struct Complaint {
        uint256 tokenId;
        string description; //can be removed if not used
        Status complaintStatus;
    }

    mapping(uint256 => Product) public tokenIdtoProduct;
    mapping(uint256 => Complaint) public complaintIdtoComplaint;

    event ComplaintRegistered(uint256 complaintId, uint256 tokenId);
    event ComplaintUpdated(uint256 complaintId, Status prevStatus, Status updatedStatus);

    modifier onlyCreator() {
        require(msg.sender == collectionCreator, 'Only contract owner can perform this action');
        _;
    }
    
    modifier onlyOwner(uint256 tokenId) {
        require(msg.sender == ownerOf(tokenId), 'Only NFT owner can perform this action');
        _;
    }

    constructor(string memory _name, string memory _symbol, address _creator) ERC721(_name, _symbol){
        collectionCreator = _creator;
    }

    function safeMint(address to, string memory uri, uint256 warrantyPeriod) external onlyCreator returns(uint256){
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        Product memory product = Product(
            block.timestamp,
            block.timestamp + warrantyPeriod
        );
        tokenIdtoProduct[tokenId] = product;
        return tokenId;
    }

    function burn(uint256 tokenId) external onlyCreator{
        Product memory product = tokenIdtoProduct[tokenId];
        require(block.timestamp >= product.warrantyEnd, 'NFT can be burnt after warranty expiration only');

        _burn(tokenId);
    }
    
    function regComplaint(uint256 tokenId, string memory description) public onlyOwner(tokenId){
        Product memory product = tokenIdtoProduct[tokenId];
        require(block.timestamp <= product.warrantyEnd, 'Product Warranty Expired');
        _complaintIdCounter.increment();
        uint256 complaintId = _complaintIdCounter.current();
        Complaint memory complaint = Complaint(
            tokenId,
            description,
            Status.registered
        );
        complaintIdtoComplaint[complaintId] = complaint;
        emit ComplaintRegistered(complaintId, tokenId);
    }

    function updateComplaintStatus(uint256 complaintId, Status status) public onlyCreator {
        Complaint storage complaint = complaintIdtoComplaint[complaintId];
        Status prevStatus = complaint.complaintStatus;
        complaint.complaintStatus = status;
        emit ComplaintUpdated(complaintId, prevStatus, status);
    }

    function transferNFT(address to, uint256 tokenId) public onlyOwner(tokenId){
        transferFrom(msg.sender, to, tokenId);
    }

    function viewOwner(uint256 tokenId) public view returns(address) {
        return ownerOf(tokenId);
    }

    function viewComplaintStatus(uint256 complaintId) public view returns(Complaint memory) {
        Complaint memory complaint = complaintIdtoComplaint[complaintId];
        return complaint;
    }

    function warrantyLeft(uint256 tokenId) public view returns(uint256) {
        Product memory product = tokenIdtoProduct[tokenId];
        return (product.warrantyEnd - block.timestamp);
    }
}