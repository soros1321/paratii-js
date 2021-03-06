import Paratii from '../src/paratii.js'
import { ParatiiIPFS } from '../src/paratii.ipfs.js'
import { assert, expect } from 'chai'
import Ipfs from 'ipfs'

describe('ParatiiIPFS: :', function () {
  let paratiiIPFS
  this.timeout(30000)

  beforeEach(function () {
    paratiiIPFS = new ParatiiIPFS({
      ipfs: {repo: '/tmp/paratii-alpha-' + String(Math.random())}
    })
  })

  afterEach(async () => {
    await paratiiIPFS.stop()
    delete paratiiIPFS.ipfs
    assert.isNotOk(paratiiIPFS.ipfs)
  })

  it('should exist', (done) => {
    assert.isOk(paratiiIPFS)
    done()
  })

  it('ipfs.start() should return a promise', async () => {
    let p = paratiiIPFS.start()
    assert.isOk(p instanceof Promise)
    await p
  })
  it('ipfs.stop() should return a promise', async () => {
    let p = paratiiIPFS.stop()
    assert.isOk(p instanceof Promise)
    await p
  })

  it('should create an instance without trouble', (done) => {
    paratiiIPFS.getIPFSInstance().then((ipfs) => {
      assert.isOk(paratiiIPFS)
      assert.isOk(ipfs)
      assert.isTrue(ipfs.isOnline())
      done()
    }).catch(done)
  })

  it('should allow for simple add() and get() of files', async function () {
    let path = 'test/data/some-file.txt'
    // let fileStream = fs.createReadStream(path)
    let ev = paratiiIPFS.local.add(path)
    assert.isOk(ev)
    ev.on('done', async (result) => {
      let hash = result[0].hash
      let fileContent = await paratiiIPFS.local.get(hash)
      assert.equal(String(fileContent[0].content), 'with some content\n')
    })
  })

  it('put a JSON object and get it back', async function () {
    let multihash = await paratiiIPFS.local.addJSON({test: 1})
    assert.isOk(multihash)

    let data = await paratiiIPFS.local.getJSON(multihash)
    assert.isOk(data)
    expect(JSON.stringify(data)).to.equal(JSON.stringify({test: 1}))
  })

  it('should exist and work as an attribute on the Paratii object', async function () {
    let paratii = await new Paratii()
    assert.isOk(paratii.ipfs)
    assert.isOk(await paratii.ipfs.getIPFSInstance())
  })

  it('addAndPinJSON should work', async () => {
    let paratii = await new Paratii()
    let result = await paratii.ipfs.addAndPinJSON({test: 1})
    assert.isOk(result)
  })

  it('should be able to use a pre-existing ipfs instance', async function () {
    let repoPath = '/tmp/pre-existing-ipfs'
    let ipfs = new Ipfs({
      bitswap: {
        maxMessageSize: 256 * 1024
      },
      repo: repoPath,
      start: true
    })
    let existingIPFS = new ParatiiIPFS({
      ipfs: {
        instance: ipfs
      }
    })

    assert.isOk(existingIPFS)
    await existingIPFS.getIPFSInstance()
    assert.isOk(existingIPFS.ipfs)
    assert.equal(existingIPFS.ipfs._repo.path, repoPath)
  })
})
