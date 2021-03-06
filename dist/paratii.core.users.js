'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiUsers = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var joi = require('joi');

/**
 * Utilities to create and manipulate information about the users on the blockchain.
 * @param {ParatiiConfigSchema} config configuration object to initialize Paratii object
 * @example let paratii = new Paratii()
 * paratii.users // <- this is an instance of ParatiiUsers
 */

var ParatiiUsers = exports.ParatiiUsers = function () {
  function ParatiiUsers(config) {
    (0, _classCallCheck3.default)(this, ParatiiUsers);

    // const schema = joi.object({
    //   'db.provider': joi.string().default(null)
    // }).unknown()
    //
    // const result = joi.validate(config, schema)
    // // const error = result.error
    // if (error) throw error
    this.config = config;
  }
  /**
   * @typedef {Array} userSchema
   * @property {string} id the Ethereum address of the user
   * @property {string=} name
   * @property {string=} email
   */

  /**
   * Creates a user, fields id, name and email go to the smart contract Users, other fields are stored on IPFS.
   * @param  {userSchema}  options information about the video ( id, name, email ... )
   * @return {Promise}         the id of the newly created user
   * @example let userData = {
   *                    id: '0x12456....',
   *                    name: 'Humbert Humbert',
   *                    email: 'humbert@humbert.ru',
   *                    ipfsData: 'some-hash'
   *              }
   *   let result = await paratii.eth.users.create(userData)
   *  })
   */
  // FIXME: do some joi validation here


  (0, _createClass3.default)(ParatiiUsers, [{
    key: 'create',
    value: function create(options) {
      var keysForBlockchain, optionsKeys, optionsBlockchain, optionsIpfs, hash;
      return _regenerator2.default.async(function create$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              keysForBlockchain = ['id', 'name', 'email'];
              optionsKeys = (0, _keys2.default)(options);
              optionsBlockchain = {};
              optionsIpfs = {};

              optionsKeys.forEach(function (key) {
                if (keysForBlockchain.includes(key)) {
                  optionsBlockchain[key] = options[key];
                } else {
                  optionsIpfs[key] = options[key];
                }
              });
              _context.next = 7;
              return _regenerator2.default.awrap(this.config.paratii.ipfs.local.addJSON(optionsIpfs));

            case 7:
              hash = _context.sent;

              optionsBlockchain['ipfsData'] = hash;
              return _context.abrupt('return', this.config.paratii.eth.users.create(optionsBlockchain));

            case 10:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }

    /**
     * retrieve data about the user
     * @param  {string} id user univocal id
     * @return {Object}    data about the user
     * @example paratii.users.get('some-user-id')
    */

  }, {
    key: 'get',
    value: function get(id) {
      return this.config.paratii.db.users.get(id);
    }
    /**
     * Updates a user's details. name and email are defined in the smart contract Users, other fields get written to IPFS.
     * @param  {string}  userId  user univocal id
     * @param  {UserSchema}  options updated data i.e. { name: 'A new user name' }
     * @return {Promise}         updated data about the user
     * @example let updatedData = await paratii.users.update('some-user-id', {name: 'A new user name'})
     */

  }, {
    key: 'update',
    value: function update(userId, options) {
      var schema, result, error, data, key;
      return _regenerator2.default.async(function update$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              schema = joi.object({
                name: joi.string().default(null),
                email: joi.string().default(null)
              });
              result = joi.validate(options, schema);
              error = result.error;

              if (!error) {
                _context2.next = 5;
                break;
              }

              throw error;

            case 5:
              options = result.value;

              _context2.next = 8;
              return _regenerator2.default.awrap(this.get(userId));

            case 8:
              data = _context2.sent;

              for (key in options) {
                if (options[key] !== null) {
                  data[key] = options[key];
                }
              }

              data['id'] = userId;

              _context2.next = 13;
              return _regenerator2.default.awrap(this.create(data));

            case 13:
              return _context2.abrupt('return', data);

            case 14:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }

    /**
     * migrate all contract data for  paratii.config.account to a new account
     * @param newAccount Address of new account
     * @private
     */

  }, {
    key: 'migrateAccount',
    value: function migrateAccount(newAccount) {
      var paratii, oldAccount, search, vids, i, vid, videoId, didVideoApply, ptiBalance;
      return _regenerator2.default.async(function migrateAccount$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              // migrate the videos
              paratii = this.config.paratii;
              oldAccount = this.config.account.address;
              _context3.next = 4;
              return _regenerator2.default.awrap(paratii.vids.search({ owner: oldAccount }));

            case 4:
              search = _context3.sent;
              vids = search.results;

              if (!vids) {
                _context3.next = 22;
                break;
              }

              i = 0;

            case 8:
              if (!(i < vids.length)) {
                _context3.next = 22;
                break;
              }

              vid = vids[i];
              videoId = vid.id || vid._id;
              _context3.next = 13;
              return _regenerator2.default.awrap(paratii.vids.update(videoId, { owner: newAccount }));

            case 13:
              _context3.next = 15;
              return _regenerator2.default.awrap(paratii.eth.tcr.didVideoApply(videoId));

            case 15:
              didVideoApply = _context3.sent;

              if (!didVideoApply) {
                _context3.next = 19;
                break;
              }

              _context3.next = 19;
              return _regenerator2.default.awrap(paratii.eth.tcr.exit(videoId));

            case 19:
              i++;
              _context3.next = 8;
              break;

            case 22:
              _context3.next = 24;
              return _regenerator2.default.awrap(paratii.eth.balanceOf(oldAccount, 'PTI'));

            case 24:
              ptiBalance = _context3.sent;
              _context3.next = 27;
              return _regenerator2.default.awrap(paratii.eth.transfer(newAccount, ptiBalance, 'PTI'));

            case 27:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiUsers;
}();