'use strict';

let binpack = require('..')
let Writer = binpack.Writer;

let Stream = require('stream').PassThrough;

describe('Writer', () => {
    describe('interface', () => {
        it('constructor', () => {
            let writer = new Writer;
        });

        it('read', () => {
            let writer = new Writer;

            writer.buffer(new Buffer([1, 2, 3, 4]));
            writer.read().should.deep.equal(new Buffer([1, 2, 3, 4]));
        });
    });

    describe('types', () => {
        it('buffer', () => {
            let writer = new Writer;

            writer.buffer(new Buffer("abc"));
            writer.buffer(new Buffer([0x01, 0x02, 0x03]));
            writer.read().should.deep.equal(new Buffer([97, 98, 99, 1, 2, 3]));
        });

        it.skip('array', () => {

        });

        it.skip('string', () => {

        });

        it('uint8', () => {
            let writer = new Writer(2);

            writer.uint8(7);
            writer.uint8(29);
            (() => writer.uint8(37)).should.throw(RangeError);

            writer.read().should.deep.equal(new Buffer([7, 29]));

            writer.uint8(37);

            writer.read().should.deep.equal(new Buffer([37]));
        });
    });
});
