import mongoose from 'mongoose'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

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
    index: true,
    unique: true
  },
  passwordHash: {type: String, required: true},
  publicKey: { type: String, required: true },
  accessToken: { type: String },
  confirmed: { type: Boolean, default: false },
  refreshToken: { type: String }
})


schema.methods.generatePasswordHash = function generatePasswordHash(password) {
  return bcrypt.hashSync(password, 10);
}

schema.methods.checkPassword = function checkPassword(password) {
  return bcrypt.compareSync(password, this.passwordHash);
}

schema.methods.generateAccessToken = function generateAccessToken() {
  this.accessToken = this.generateJWT()
}
schema.methods.generateRefreshToken = function generateRefreshToken() {
  return this.generateJWT()
}

schema.methods.generateJWT = function generateJWT() {
  return jwt.sign(
    {
      email: this.email,
      username: this.username,
      confirmed: this.confirmed
    },
    process.env.JWT_SECRET
  );
}

schema.methods.generatePublicKey = function generatePublicKey() {
  const secret = process.env.SECRET
  const publicKey = bcrypt.hashSync(Math.random().toString(), 10);
  this.publicKey = publicKey
  this.passwordHash = publicKey
}


export default mongoose.model("User", schema);
