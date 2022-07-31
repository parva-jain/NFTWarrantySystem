const CollectionFactory = artifacts.require("CollectionFactory");

module.exports = function (deployer) {
  deployer.deploy(CollectionFactory);
};
