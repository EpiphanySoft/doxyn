'use strict';

/* global require, describe, it, afterEach, beforeEach */

const Assert = require('assertly');
const expect = Assert.expect;

const File = require('phylo');

// const Location = require('../../../lib/model/Location');
// const Node = require('../../../lib/model/Node');
const Document = require('../../../lib/model/Document');

describe('model/Document', function () {
    let doc;

    beforeEach(function () {
        doc = Document.create();
        doc.baseDir = __dirname;
    });
    afterEach(function () {
        doc = null;
    });

    describe('basics', function () {
        it('should relativize files', function () {
            let f = File.from(__dirname).parent.parent.join('foo');

            f = doc.fileFromPath(f);
            expect(f.path).to.be('../../foo');
        });

        it('should rebase files if baseDir is changed', function () {
            let p = doc.baseDir.parent;
            let foo = p.parent.join('foo');
            let bar = p.parent.join('bar');

            expect(foo.isAbsolute()).to.be(true);

            let i = doc.getFileIndex(foo);
            expect(i).to.be(0);

            i = doc.getFileIndex(bar);
            expect(i).to.be(1);

            expect(doc.files.length).to.be(2);
            expect(Object.keys(doc._filesMap).length).to.be(2);

            let f = doc.getFile(0);
            expect(f.path).to.be('../../foo');

            f = doc.getFile(1);
            expect(f.path).to.be('../../bar');

            doc.baseDir = p;

            expect(doc.files.length).to.be(2);
            expect(Object.keys(doc._filesMap).length).to.be(2);

            f = doc.getFile(0);
            expect(f.path).to.be('../foo');

            f = doc.getFile(1);
            expect(f.path).to.be('../bar');
        });
    });
});
