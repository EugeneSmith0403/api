import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  from: { type: Number, required: true },
  to: { type: Number, required: true },
  dateStart: { type: Date, default: Date.now },
  dateFinished: { type: Date, default: null},
  maxPlaces: { type: Number },
  occupiedPlaces: { type: Number },
  cost: { type: Number },
  carModel: { type: String },
  carYear: { type: String },
  bookedPeople: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  applyPeople: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  cancelPeople: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]

})

export default mongoose.model("Trip", schema);
