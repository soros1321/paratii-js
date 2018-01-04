'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParatiiCoreVids = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dopts = require('default-options');

/**
 * ParatiiCoreVids
 *
 */

var ParatiiCoreVids = exports.ParatiiCoreVids = function () {
  function ParatiiCoreVids(config) {
    (0, _classCallCheck3.default)(this, ParatiiCoreVids);

    var defaults = {
      'db.provider': null
    };
    var options = dopts(config, defaults, { allowUnknown: true });
    this.config = options;
    this.paratii = this.config.paratii;
  }

  (0, _createClass3.default)(ParatiiCoreVids, [{
    key: 'create',
    value: function create(options) {
      var defaults, hash;
      return _regenerator2.default.async(function create$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              defaults = {
                id: undefined, // must be a string
                owner: undefined, // must be a string
                price: 0, // must be a number
                title: undefined, // must be a string
                file: null, // must be string, optional
                ipfsHash: null // must be a string, optional
              };


              options = dopts(options, defaults);

              _context.next = 4;
              return _regenerator2.default.awrap(this.paratii.ipfs.addJSON({
                title: options.title
              }));

            case 4:
              hash = _context.sent;


              options.ipfsData = hash;
              options.ipfsHash = '';
              _context.next = 9;
              return _regenerator2.default.awrap(this.paratii.eth.vids.create({
                id: options.id,
                owner: options.owner,
                price: options.price,
                ipfsHash: options.ipfsHash,
                ipfsData: options.ipfsData
              }));

            case 9:
              return _context.abrupt('return', options);

            case 10:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'get',
    value: function get(videoId) {
      return _regenerator2.default.async(function get$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              return _context2.abrupt('return', this.paratii.db.vids.get(videoId));

            case 1:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }]);
  return ParatiiCoreVids;
}();