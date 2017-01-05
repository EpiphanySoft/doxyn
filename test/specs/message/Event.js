'use strict';

/* global describe, it, afterEach, beforeEach */

const Assert = require('assertly');
const expect = Assert.expect;

const Message = require('../../../lib/message/Message');
const Event   = require('../../../lib/message/Event');

describe('message/Event', function () {
    describe('no src, no extra message', function () {
        beforeEach(function () {
            this.event = new Event('D', null, Message.TagInvalidInContext);
        });

        it('toString should be correct', function () {
            let s = this.event.toString();

            expect(s).to.be('D1000: Tag is not valid in this context');
        });
    });

    describe('no src, extra message', function () {
        beforeEach(function () {
            this.event = new Event('D', null, Message.TagInvalidInContext, 'Hi $1', [42]);
        });

        it('toString should be correct', function () {
            let s = this.event.toString();

            expect(s).to.be('D1000: Tag is not valid in this context (Hi 42)');
        });
    });
});
