
import { expect } from 'chai';
import mongoose from 'mongoose';
import mongooseModelCache from '../src';
import Cat from './schema';

const uri = 'mongodb://localhost:27017/test';
mongoose.Promise = Promise;

// mocha test/callback.ts --opts .mocharc 

mongoose.set('debug', true);

const CatProxy = mongooseModelCache(Cat);

describe('callback api', () => {
    before(async () => {
        await mongoose.connect(uri);
        await CatProxy.create({});
    });
    it('should accept callbacks', (done) => {
        CatProxy.findOne({}).lean().exec((err, doc) => {
            if (err) {
                return done(err);
            }
            console.log('1st');
            expect(doc).to.exist;
            done();
        });
    });
    it('should return from cache', (done) => {
        CatProxy.findOne({}).lean().exec((err, doc) => {
            console.log('2nd');
            expect(doc).to.exist;
            done();
        });
    });
    it('should return from cache again', (done) => {
        CatProxy.findOne({}).lean().exec((err, doc) => {
            console.log('3rd');
            expect(doc).to.exist;
            done();
        });
    });
});
