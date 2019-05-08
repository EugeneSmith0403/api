import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  from: { type: Number },
  to: { type: Number },
  dateStart: { type: Date, default: Date.now },
  dateFinished: { type: Date, default: Date.now },
  maxPeople: { type: Number },
  occupiedPlaces: { type: Number },
  cost: { type: Number },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  peopleBooking: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
})

export default mongoose.model("Trip", schema);
