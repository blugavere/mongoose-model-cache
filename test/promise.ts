
import { expect } from 'chai';
import mongoose from 'mongoose';
import mongooseModelCache from '../src';

const uri = 'mongodb://localhost:27017/test';
mongoose.Promise = Promise;

// mocha test/promise.ts --opts .mocharc 

mongoose.set('debug', true);

const schema = new mongoose.Schema({
    name: String,
    color: String,
}, { strict: false, collection: 'cats' });

const Dog = mongoose.model('Dog', schema);

const DogProxy = mongooseModelCache(Dog);

describe('promise api', () => {
    before(async () => {
        await mongoose.connect(uri);
        await DogProxy.create({});
    });
    it('should not impact writes', async () => {
        const doc = await DogProxy.create({});
        await DogProxy.findOneAndUpdate({ name: 'fido' }, { color: 'brown' }).lean().exec();
        await DogProxy.findOneAndUpdate({ name: 'fido' }, { color: 'gray' }).lean().exec();
        await DogProxy.findOneAndUpdate({ name: 'fido' }, { color: 'black' }).lean().exec();
        console.log('created');
        expect(doc).to.exist;
    });
    it('should accept promises', async () => {
        const doc = await DogProxy.findOne({}).lean().exec();
        console.log('1st');
        expect(doc).to.exist;
    });
    it('cache 1', async () => {
        const doc = await DogProxy.findOne({}).lean().exec();
        console.log('2nd');
        expect(doc).to.exist;
    });
    it('cache 2', async () => {
        const doc = await DogProxy.findOne({}).lean().exec();
        console.log('3rd');
        expect(doc).to.exist;
    });
    it('plain findOne', async () => {
        const doc = await DogProxy.findOne();
        console.log('4');
        expect(doc).to.exist;
    });
    it('plain findOne cached', async () => {
        const doc = await DogProxy.findOne();
        console.log('5');
        expect(doc).to.exist;
    });
    const timeout = 500;
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    it('timeout', async () => {
        const TimedProxy = mongooseModelCache(Dog, { ttl: 500 });
        await TimedProxy.findOne();
        await TimedProxy.findOne(); // cached
        await delay(timeout + 1);
        await TimedProxy.findOne(); // not cached
        await TimedProxy.findOne(); // cached
        await delay(timeout + 1);
        await TimedProxy.findOne(); // not cached
    });
});
