

import mongoose, { Model, Document, Query } from 'mongoose';
import chalk from 'chalk';
import mongooseModelCache from '../src';

const uri = 'mongodb://localhost:27017/test';
mongoose.Promise = Promise;

// nodemon mongoose-demo/proxy.ts
mongoose.set('debug', true);

const schema = new mongoose.Schema({
    name: String,
    color: String,
}, { strict: false });

const Cat = mongoose.model('Cat', schema);

const CatProxy = mongooseModelCache(Cat);

// overwrite global Cat
mongoose.models['Cat'] = CatProxy;

(async () => {
    await mongoose.connect(uri, {
        useMongoClient: true,
    });

    // return await (async () => {
    //     const M = mongoose.model('Cat');
    //     const cat = await M.findOne({
    //         name: 'Delilah'
    //     });
    //     console.log(cat);
    //     const cat2 = await M.findOne({
    //         name: 'Delilah'
    //     });
    // })();

    console.log(chalk.cyan('Fetching Original Count...'));
    // const cats = await CatProxy.count({}).where({
    //     name: 'fido'
    // });
    // console.log('Count', cats);
    // console.log('Fetching Original FindOne...');
    const cat = await CatProxy.findOne({
        // name: 'fido',
    })
        .select('name')
        .lean()
        ;
    console.log('Original Cat Result', cat);

    await (async () => {
        console.log(chalk.red('On Second call...'));
        // const countQuery = CatProxy.count({
        // name: 'foo'
        // });
        // const count1 = await countQuery;
        // const count2 = await countQuery;
        // const count3 = await countQuery;
        // console.log('Second Count', count3);
        const repeatCat = await CatProxy.findOne({
            // name: 'fido',
        })
            .select('name')
            .lean()

        console.log('Second Call Cat (cached)!', repeatCat);
        const cat = await CatProxy.findOne({
            name: 'fido',
        })
            .select('name')
            .lean();

        console.log('Third Call Cat!', cat);

        await Promise.all([
            CatProxy.findOne({
                name: 'fillenius',
            }),
            CatProxy.findOne({
                name: 'fillenius',
            })
        ]);

        const lifuses = await Promise.all([
            CatProxy.findOne({
                name: 'Delilah',
            }),
            CatProxy.findOne({
                name: 'Delilah',
            }).then(lifus => {
                console.log('Once!')
                return lifus;
            })
        ]);
        console.log(lifuses)
    })();

})().catch(e => {
    console.log(e);
});
