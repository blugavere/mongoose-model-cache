
import mongoose, { Document, Model } from 'mongoose';

const schema = new mongoose.Schema({
    name: String,
    color: String,
}, { strict: false });

const Cat = mongoose.model<ICat, ICatModel>('Cat', schema);

export default Cat;

export interface ICatModel extends Model<ICat> {
    findAllCats(): void;
}

export interface ICat extends Document {
    name: string;
    color: string;
}
