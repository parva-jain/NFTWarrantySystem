const CollectionFactory = artifacts.require("CollectionFactory");
const Collection = artifacts.require("Collection");

contract("NFTWarranty", (accounts) => {
  let collectionFactory, collectionInstance;
  let fk = accounts[0];
  let seller = accounts[1];
  let user = accounts[2];

  it("should deploy the collectionFactory contract", async () => {
    collectionFactory = await CollectionFactory.deployed();
    assert(
      collectionFactory !== undefined,
      "CollectionFactory contract was not deployed"
    );
  });
  it("should let seller create a new collection", async () => {
    const result = await collectionFactory.createCollection(
      "Collection1",
      "COL",
      { from: seller }
    );
    // console.log(receipt);
    // const collectionAddress = await collectionFactory.idToCollection(1);
    //   console.log( collectionAddress );
    assert.equal(result.receipt.status, true, false);
  });

  it("should create collection instance", async () => {
    const collectionAddress = await collectionFactory.idToCollection(1);
    collectionInstance = await Collection.at(collectionAddress);
    const result = await collectionInstance.collectionCreator();
    assert.equal(result, seller);
  });

  it("should let seller mint NFT", async () => {
    const tx = await collectionInstance.safeMint(user, "details", 600, {
      from: seller,
    });
    const tokenOwner = await collectionInstance.viewOwner(0);
    assert.equal(tokenOwner, user);
  });

  it("should let user register a complaint", async () => {
    const tx = await collectionInstance.regComplaint(0, "Repair request", {
      from: user,
    });
    const complaint = await collectionInstance.viewComplaintStatus(1);
    assert.equal(complaint.complaintStatus, 0);
  });

  it("should let seller update the complaint", async () => {
    const tx = await collectionInstance.updateComplaintStatus(1, 1, {
      from: seller,
    });
    const complaint = await collectionInstance.viewComplaintStatus(1);
    assert.equal(complaint.complaintStatus, 1);

    const tx2 = await collectionInstance.updateComplaintStatus(1, 2, {
      from: seller,
    });
    const complaint2 = await collectionInstance.viewComplaintStatus(1);
    assert.equal(complaint2.complaintStatus, 2);
  });

  it("should let user transfer NFT to another EOA", async () => {
    const tx = await collectionInstance.transferNFT(fk, 0, {
      from: user,
    });
    const tokenOwner = await collectionInstance.viewOwner(0);
    assert.equal(tokenOwner, fk);
  });
});
