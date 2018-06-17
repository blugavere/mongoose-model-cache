
import mongooseModelCache from '../src';
import Cat, { ICat, ICatModel } from './schema';

const CatProxy = mongooseModelCache<ICat, ICatModel>(Cat);

console.log(CatProxy);
