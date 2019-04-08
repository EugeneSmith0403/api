import mongoose from 'mongoose'
const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  passwordHash: {type: String, required: true}

})
export default mongoose.model("User", schema);
