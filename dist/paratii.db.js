'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiDb = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _paratiiDbVids = require('./paratii.db.vids.js');

var _paratiiDbUsers = require('./paratii.db.users.js');

var _schemas = require('./schemas.js');

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * ParatiiDb contains a functionality to interact with the Paratii Index.
 * @param {ParatiiDbSchema} config configuration object to initialize Paratii object
 * @property {ParatiiDbVids} vids operations on videos
 * @property {ParatiiDbUsers} users operations on users
 */
var ParatiiDb =
/**
* @typedef ParatiiDbSchema
* @property {dbSchema} db
* @property {accountSchema} account
*/
exports.ParatiiDb = function ParatiiDb(config) {
  (0, _classCallCheck3.default)(this, ParatiiDb);

  var schema = {
    db: _schemas.dbSchema,
    account: _schemas.accountSchema
  };
  var result = _joi2.default.validate(config, schema, { allowUnknown: true });
  if (result.error) throw result.error;

  this.config = config;
  this.config.db = result.value.db;
  this.config.account = result.value.account;
  this.vids = new _paratiiDbVids.ParatiiDbVids(this.config);
  this.users = new _paratiiDbUsers.ParatiiDbUsers(this.config);
};