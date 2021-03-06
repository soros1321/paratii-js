/* global ArrayBuffer */
import Protocol from 'paratii-protocol'
import { ipfsSchema, accountSchema } from './schemas.js'
import joi from 'joi'
import { EventEmitter } from 'events'
import { ParatiiIPFSRemote } from './paratii.ipfs.remote.js'
import { ParatiiIPFSLocal } from './paratii.ipfs.local.js'
import { ParatiiTranscoder } from './paratii.transcoder.js'
import { PromiseEventEmitter } from './utils.js'

global.Buffer = global.Buffer || require('buffer').Buffer

/**
 * Contains functions to interact with the IPFS instance
 * @param {ParatiiIPFSSchema} config configuration object to initialize Paratii object
 * @property {ParatiiIPFSLocal} local operations on the local node
 * @property {ParatiiIPFSRemote} remote operations on remote node
 */
export class ParatiiIPFS extends EventEmitter {
  /**
  * @typedef {Array} ParatiiIPFSSchema
  * @property {ipfsSchema=} ipfs
  * @property {accountSchema=} account
  * @property {boolean=} verbose
 */
  constructor (config) {
    super()
    const schema = joi.object({
      ipfs: ipfsSchema,
      account: accountSchema,
      verbose: joi.bool().default(true)
    })

    const result = joi.validate(config, schema, {allowUnknown: true})
    if (result.error) throw result.error
    this.config = config
    this.config.ipfs = result.value.ipfs
    this.config.account = result.value.account
    // TODO change this to some other name. this is wrong.
    // because `this` isn't an ipfs instance.
    this.config.ipfsInstance = this

    this.local = new ParatiiIPFSLocal(config)
    this.remote = new ParatiiIPFSRemote({ipfs: this.config.ipfs, paratiiIPFS: this})
    this.transcoder = new ParatiiTranscoder({ipfs: this.config.ipfs, paratiiIPFS: this})
  }

  /**
   * Starts the IPFS node
   * @return {Promise} that resolves in an IPFS instance
   * @example paratii.ipfs.start()
   */
  start () {
    return new Promise((resolve, reject) => {
      if (this.ipfs && this.ipfs.isOnline()) {
        // console.log('IPFS is already running')
        return resolve(this.ipfs)
      }

      this.getIPFSInstance().then(function (ipfs) {
        resolve(ipfs)
      })
    })
  }

  /**
   * Stops the IPFS node.
   * @example paratii.ipfs.stop()
   */
  stop () {
    return new Promise((resolve, reject) => {
      if (!this.ipfs || !this.ipfs.isOnline()) {
        resolve()
      }
      if (this.ipfs) {
        this.ipfs.stop(() => {
          setImmediate(() => {
            resolve()
          })
        })
      }
    })
  }

  _getAccount () {
    return (this.config.paratii && this.config.paratii.eth.getAccount()) || 'unknown'
  }

  /**
   * adds a JSON structure to the local node and signals remote node to pin it
   * @param  {object}  data JSON object to store
   * @return {string}      returns ipfs multihash of the stored object.
   * @example let result = await paratiiIPFS.addAndPinJSON(data)
   */
  async addAndPinJSON (data) {
    return new PromiseEventEmitter(async (resolve, reject) => {
      let hash = await this.local.addJSON(data)
      let pinFile = () => {
        let pinEv = this.remote.pinFile(hash,
          { author: this._getAccount() }
        )
        pinEv.on('pin:error', (err) => {
          console.warn('pin:error:', hash, ' : ', err)
          pinEv.removeAllListeners()
        })
        pinEv.on('pin:done', (hash) => {
          this.log('pin:done:', hash)
          pinEv.removeAllListeners()
        })
        return pinEv
      }

      let pinEv = pinFile()

      pinEv.on('pin:error', (err) => {
        console.warn('pin:error:', hash, ' : ', err)
        console.log('trying again')
        pinEv = pinFile()
      })

      pinEv.on('pin:done', (hash) => {
        resolve(hash)
      })
    })
  }

  /**
   * log messages on the console if verbose is set
   * @param  {string} msg text to log
   * @example
   * paratii.ipfs.log("some-text")
   * @private
   */
  log (...msg) {
    if (this.config.verbose) {
      console.log(...msg)
    }
  }
  /**
   * log warns on the console if verbose is set
   * @param  {string} msg warn text
   * @example
   * paratii.ipfs.warn("some-text")
   * @private
   */
  warn (...msg) {
    if (this.config.verbose) {
      console.warn(...msg)
    }
  }
  /**
   * log errors on the console if verbose is set
   * @param  {string} msg error message
   * @example
   * paratii.ipfs.error("some-text")
   * @private
   */
  error (...msg) {
    if (this.config.verbose) {
      console.error(...msg)
    }
  }
  /**
   * get an ipfs instance of jsipfs. Singleton pattern
   * @return {Object} Ipfs instance
   * @example ipfs = await paratii.ipfs.getIPFSInstance()
   * @private
   */
  getIPFSInstance () {
    return new Promise((resolve, reject) => {
      if (this.ipfs) {
        resolve(this.ipfs)
      } else {
        let config = this.config
        // there will be no joi in IPFS (pun indended)
        import(/* webpackChunkName: 'ipfs' */ 'ipfs') // eslint-disable-line
        .then((Ipfs) => {
          let ipfs
          if (this.config.ipfs.instance) {
            ipfs = this.config.ipfs.instance
          } else {
            ipfs = new Ipfs({
              bitswap: {
                // maxMessageSize: 256 * 1024
                maxMessageSize: this.config.ipfs['bitswap.maxMessageSize']
              },
              start: true,
              repo: config.ipfs.repo || '/tmp/test-repo-' + String(Math.random()),
              config: {
                Addresses: {
                  Swarm: this.config.ipfs.swarm
                  // [
                  //   '/dns4/star.paratii.video/tcp/443/wss/p2p-webrtc-star',
                  //   '/dns4/ws.star.paratii.video/tcp/443/wss/p2p-websocket-star/'
                  // ]
                },
                Bootstrap: this.config.ipfs.bootstrap
                // [
                //   '/dns4/bootstrap.paratii.video/tcp/443/wss/ipfs/QmeUmy6UtuEs91TH6bKnfuU1Yvp63CkZJWm624MjBEBazW'
                // ]
              }
            })
          }

          this.ipfs = ipfs

          ipfs.on('ready', () => {
            this.log('[IPFS] node Ready.')

            ipfs._bitswap.notifications.on('receivedNewBlock', (peerId, block) => {
              this.log('[IPFS] receivedNewBlock | peer: ', peerId.toB58String(), ' block length: ', block.data.length)
              this.log('---------[IPFS] bitswap LedgerMap ---------------------')
              ipfs._bitswap.engine.ledgerMap.forEach((ledger, peerId, ledgerMap) => {
                this.log(`${peerId} : ${JSON.stringify(ledger.accounting)}\n`)
              })
              this.log('-------------------------------------------------------')
            })

            ipfs.id().then((id) => {
              let peerInfo = id
              this.id = id
              this.log(`[IPFS] id:  ${peerInfo}`)

              this.initProtocol(ipfs)

              this.ipfs = ipfs
              this.protocol.start(() => {
                setTimeout(() => {
                  resolve(ipfs)
                }, 10)
              })
            })
          })

          ipfs.on('error', (err) => {
            if (err) {
              // this.log('IPFS node ', ipfs)
              this.error('[IPFS] Error ', err)
              reject(err)
            }
          })
        })
      }
    })
  }

  initProtocol (ipfs) {
    let ptiAddress = this.config.account.address || 'no_address'
    this.protocol = new Protocol(
      ipfs._libp2pNode,
      ipfs._repo.blocks,
      // add ETH Address here.
      ptiAddress
    )

    this._node = ipfs
    this.remote._node = ipfs

    this.protocol.notifications.on('message:new', (peerId, msg) => {
      this.log('[paratii-protocol] ', peerId.toB58String(), ' new Msg: ', msg)
    })
    // emit all commands.
    // NOTE : this will be changed once protocol upgrades are ready.
    this.protocol.notifications.on('command', (peerId, command) => {
      this.emit('protocol:incoming', peerId, command)
    })
  }
}
