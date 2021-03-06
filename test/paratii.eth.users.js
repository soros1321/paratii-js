import { Paratii } from '../src/paratii.js'
import { address, testConfig } from './utils.js'
import { assert } from 'chai'

describe('paratii.eth.users: :', function () {
  let paratii
  beforeEach(async function () {
    paratii = new Paratii(testConfig)
    await paratii.eth.deployContracts()
  })

  it('users.create(),  .get(), .update() and .delete() should work', async function () {
    let userId = address
    let user
    let userData = {
      id: userId,
      name: 'Humbert Humbert',
      email: 'humbert@humbert.ru',
      ipfsData: 'some-hash'
    }
    let result = await paratii.eth.users.create(userData)

    assert.equal(result, userId)

    user = await paratii.eth.users.get(userId)
    assert.deepEqual(user, userData)

    await paratii.eth.users.update(userId, {ipfsData: 'new-hash'})
    user = await paratii.eth.users.get(userId)
    assert.equal(user.ipfsData, 'new-hash')

    await paratii.eth.users.delete(userId)

    user = await paratii.eth.users.get(userId)
    assert.equal(user.ipfsData, '')
  })

  it.skip('missing or wrong arguments in users.create() should trhow meaningful errors', async function () {
    // let result = await paratii.eth.users.create({
    //   id: userId,
    //   owner: address1
    //   // price: price,
    //   // ipfsHash: 'some-hash'
    // })
  })
})
