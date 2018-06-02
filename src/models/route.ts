import * as mongoose from 'mongoose';

export type routeModel = mongoose.Document & {
    path: string,
    total_distance: number,
    total_time: number
};

const routeSchema = new mongoose.Schema({
  token: { type: String, unique: true },
  input: JSON,
  output: JSON,
  status: String,
  total_distance: Number,
  total_time: Number
}, { timestamps: true });

const routeModel = mongoose.model('route', routeSchema);
export default routeModel;
