'use strict';

let assert = require('assert');
let binpack = require('..')
let Reader = binpack.Reader;

describe('Reader', () => {
    it('buffer', () => {
        let reader = new Reader(new Buffer([0x01, 0x02, 0x03]));

        assert.equal(3, reader.length());

        let buf = reader.buffer(2);
        assert.ok(buf.equals(new Buffer([0x01, 0x02])));

        assert.equal(1, reader.length());
        reader.compact();
        assert.equal(1, reader.length());

        assert.throws(() => {
            reader.buffer(2);
        });
    });
})
