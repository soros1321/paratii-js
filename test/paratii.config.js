import { Paratii } from '../lib/paratii.js'
import { address, privateKey } from './utils.js'
var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')

chai.use(chaiAsPromised)
var assert = chai.assert

describe('Paratii configuration:', function () {
  let paratii

  beforeEach(function () {
  })

  it('paratii.config should return the configuration with default values', async function () {
    paratii = new Paratii({
      address: address,
      privateKey: privateKey
    })

    let expected = {
      account: {
        address: address,
        privateKey: privateKey
      },
      provider: 'http://localhost:8545',
      registryAddress: null,
      isTestNet: true
    }
    assert.deepInclude(paratii.config, expected)
  })

  it('testnet configuration should be recognized', async function () {
    paratii = new Paratii({provider: 'http://127.0.0.1:8545'})
    assert.isOk(paratii.config.isTestNet)
    paratii = new Paratii({provider: 'http://localhost:8545'})
    assert.isOk(paratii.config.isTestNet)
  })

  it('should be possible to create a second Paratii object with the same settings', async function () {
    console.log(1)
    // deploy the contracts so we have a registry address
    paratii = new Paratii({
      // this address and key are the first accounts on testrpc when started with the --deterministic flag
      provider: 'http://localhost:8545',
      address: address,
      privateKey: privateKey
    })

    await paratii.eth.deployContracts()
    assert.isOk(paratii.eth.config.registryAddress)
    // assert.isOk(paratii.config.registryAddress)

    let paratii2 = new Paratii({
      address: address,
      privateKey: privateKey,
      registryAddress: paratii.config.registryAddress,
      provider: 'http://localhost:8545',
      repo: paratii.config.repo
    })

    assert.deepEqual(paratii.config, paratii2.config)
  })

  it('should be possible to create a Paratii instance without an address or registryAddress', async function () {
    let paratii = new Paratii({
      provider: 'http://chain.paratii.video/'
    })
    let expected = {
      account: {
        address: null,
        privateKey: null
      },
      provider: 'http://chain.paratii.video/',
      isTestNet: false,
      registryAddress: null
    }
    assert.deepInclude(paratii.config, expected)

    // functions should still work
    let promise = paratii.eth.getContract('ParatiiToken')
    assert.isRejected(promise, /No registry/)
  })

  it('setAccount should set the account', async function () {
    let paratii = new Paratii({
      provider: 'http://127.0.0.1:8545'
    })
    // let beneficiary = account1
    // let amount = 0.3 * 10 ** 18
    // let promise = paratii.eth.transfer(beneficiary, amount, 'PTI')
    // assert.isRejected(promise, /No account/)
    //
    await paratii.setAccount(address)
    assert.equal(paratii.config.account.address, address)
    assert.equal(paratii.eth.config.account.address, address)
    // promise = paratii.eth.transfer(beneficiary, amount, 'PTI')
    // await assert.isFulfilled(promise)
  })
  it('paratii.eth.web3 should be available', async function () {
    let paratii = new Paratii({})
    assert.isOk(paratii.eth.web3)
  })
})