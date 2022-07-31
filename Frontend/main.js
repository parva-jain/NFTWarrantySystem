require("dotenv").config();
const key = process.env.PINATA_KEY;
const secret = process.env.PINATA_SECRET;
const Web3 = require("web3");
const CollectionFactory = require("../build/contracts/CollectionFactory.json");
const Collection = require("../build/contracts/Collection.json");
const axios = require("axios");

init = async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
    console.log("Connected");
  } else {
    alert("Metamask not found");
  }

  console.log("All Set up!!");
};

const createCollection = async () => {
  const id = await web3.eth.net.getId();
  deployedCreateCollection = CollectionFactory.networks[id];
  contractCreateCollection = new web3.eth.Contract(
    CollectionFactory.abi,
    deployedCreateCollection.address
  );
  accounts = await web3.eth.getAccounts();
  const tx = await contractCreateCollection.methods
    .createCollection(collectionName.value, collectionSymbol.value)
    .send({ from: accounts[0] });
  console.log(tx);
  console.log(tx.events.CollectionCreated.returnValues);
  console.log("Collection Created!!");
};

const collectionName = document.getElementById("collectionName");
const collectionSymbol = document.getElementById("collectionSymbol");

const btnCreateCollection = document.getElementById("btnCreateCollection");
btnCreateCollection.onclick = createCollection;

const pinJSONToIPFS = async (JSONBody) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  //making axios POST request to Pinata ⬇️
  return axios
    .post(url, JSONBody, {
      headers: {
        pinata_api_key: key,
        pinata_secret_api_key: secret,
      },
    })
    .then(function (response) {
      return {
        success: true,
        pinataUrl:
          "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash,
      };
    })
    .catch(function (error) {
      console.log(error);
      return {
        success: false,
        message: error.message,
      };
    });
};

const mintNFTWarranty = async () => {
  //make metadata
  const metadata = new Object();
  metadata.id = id.value;
  metadata.name = name.value;
  metadata.date = date.value;
  metadata.details = details.value;

  //make pinata call
  const pinataResponse = await pinJSONToIPFS(metadata);
  if (!pinataResponse.success) {
    return {
      success: false,
      status: "😢 Something went wrong while uploading your tokenURI.",
    };
  }
  const tokenURI = pinataResponse.pinataUrl;
  accounts = await web3.eth.getAccounts();

  const contractCollection = await new web3.eth.Contract(
    Collection.abi,
    collectionAddress.value
  );

  const receipt = await contractCollection.methods
    .safeMint(recipient.value, tokenURI, warrantyPeriod.value)
    .send({ from: accounts[0] });
  console.log(receipt);
  console.log("NFT Minted!!");
};

const collectionAddress = document.getElementById("collectionAddress");
const recipient = document.getElementById("ownerAddress");
const id = document.getElementById("productID");
const name = document.getElementById("productName");
const date = document.getElementById("buyingDate");
const details = document.getElementById("moreDetails");
const warrantyPeriod = document.getElementById("warrantyPeriod");

const btnMintNFT = document.getElementById("btnCreateItem");
btnMintNFT.onclick = mintNFTWarranty;

const regComplaint = async () => {
  accounts = await web3.eth.getAccounts();
  const contractCollection = await new web3.eth.Contract(
    Collection.abi,
    regCollectionAddress.value
  );

  const receipt = await contractCollection.methods
    .regComplaint(regTokenId.value, regDescription.value)
    .send({ from: accounts[0] });
  console.log(receipt);
  console.log("ComplaintRegister");
};

const regCollectionAddress = document.getElementById("regCollectionAddress");
const regTokenId = document.getElementById("regTokenId");
const regDescription = document.getElementById("regDescription");

const btnRegComplaint = document.getElementById("btnRegComplaint");
btnRegComplaint.onclick = regComplaint;

const updateComplaint = async () => {
  accounts = await web3.eth.getAccounts();
  const contractCollection = await new web3.eth.Contract(
    Collection.abi,
    updateCollectionAddress.value
  );

  const receipt = await contractCollection.methods
    .updateComplaintStatus(updateComplaintId.value, updateStatus.value)
    .send({ from: accounts[0] });
  console.log(receipt);
  console.log("Status Updated");
};

const updateCollectionAddress = document.getElementById(
  "updateCollectionAddress"
);
const updateComplaintId = document.getElementById("updateComplaintId");
const updateStatus = document.getElementById("updateStatus");

const btnUpdateComplaint = document.getElementById("btnUpdateComplaint");
btnUpdateComplaint.onclick = updateComplaint;

const transferNFT = async () => {
  accounts = await web3.eth.getAccounts();
  const contractCollection = await new web3.eth.Contract(
    Collection.abi,
    transferCollectionAddress.value
  );

  const receipt = await contractCollection.methods
    .transferNFT(transferRecipientAddress.value, transferTokenId.value)
    .send({ from: accounts[0] });
  console.log(receipt);
  console.log("Transferred");
};

const transferCollectionAddress = document.getElementById(
  "transferCollectionAddress"
);
const transferRecipientAddress = document.getElementById("recieverAddress");
const transferTokenId = document.getElementById("transferTokenId");

const btnTransferNFT = document.getElementById("btnTransferNFT");
btnTransferNFT.onclick = transferNFT;

const viewComplaint = async () => {
  accounts = await web3.eth.getAccounts();
  const contractCollection = await new web3.eth.Contract(
    Collection.abi,
    statusCollectionAddress.value
  );

  const receipt = await contractCollection.methods
    .viewComplaintStatus(statusComplaintId.value)
    .call();
  console.log(receipt);
};

const statusCollectionAddress = document.getElementById(
  "statusCollectionAddress"
);
const statusComplaintId = document.getElementById("statusComplaintId");

const btnViewComplaint = document.getElementById("btnViewComplaint");
btnViewComplaint.onclick = viewComplaint;

const viewWarranty = async () => {
  accounts = await web3.eth.getAccounts();
  const contractCollection = await new web3.eth.Contract(
    Collection.abi,
    warrantyCollectionAddress.value
  );

  const receipt = await contractCollection.methods
    .warrantyLeft(warrantyTokenId.value)
    .call();
  console.log(receipt);
};

const warrantyCollectionAddress = document.getElementById(
  "warrantyCollectionAddress"
);
const warrantyTokenId = document.getElementById("warrantyTokenId");

const btnViewWarranty = document.getElementById("btnViewWarranty");
btnViewWarranty.onclick = viewWarranty;

const viewOwner = async () => {
  accounts = await web3.eth.getAccounts();
  const contractCollection = await new web3.eth.Contract(
    Collection.abi,
    ownerCollectionAddress.value
  );

  const receipt = await contractCollection.methods
    .viewOwner(ownerTokenId.value)
    .call();
  console.log(receipt);
};

const ownerCollectionAddress = document.getElementById(
  "ownerCollectionAddress"
);
const ownerTokenId = document.getElementById("ownerTokenId");

const btnViewOwner = document.getElementById("btnViewOwner");
btnViewOwner.onclick = viewOwner;

const getTokenURI = async () => {
  const uri = await contractNFTWarranty.methods.tokenURI(tokenId.value).call();
  console.log(uri);
};

const tokenId = document.getElementById("tokenId");

const btnGetTokenURI = document.getElementById("btnGetTokenURI");
btnGetTokenURI.onclick = getTokenURI;

init();
