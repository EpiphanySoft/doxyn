const Message = require('../../lib/message/Message');
const Event   = require('../../lib/message/Event');

describe('message/Event', function () {
    const Msg = Message.create();

    describe('no src, no extra message', function () {
        beforeEach(function () {
            this.event = new Event('D', null, Msg.TagInvalidInContext);
        });

        it('toString should be correct', function () {
            var s = this.event.toString();

            expect(s).toBe('D1000: Tag is not valid in this context');
        });
    });

    describe('no src, extra message', function () {
        beforeEach(function () {
            this.event = new Event('D', null, Msg.TagInvalidInContext, 'Hi $1', [42]);
        });

        it('toString should be correct', function () {
            var s = this.event.toString();

            expect(s).toBe('D1000: Tag is not valid in this context (Hi 42)');
        });
    });
});
