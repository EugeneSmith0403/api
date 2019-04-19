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
  mailToken: { type: String },
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
  const hour = Math.floor(Date.now() / 1000) + (60 * 60)
  this.accessToken = this.generateJWT({exp: hour})
}

schema.methods.generateRefreshToken = function generateRefreshToken() {
  const month = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 30)
  this.refreshToken = this.generateJWT(month)
}


schema.methods.generateJWT = function generateJWT(expiration = {}) {
  return jwt.sign(
    {
      email: this.email,
      username: this.username,
      confirmed: this.confirmed,
      ...expiration
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

schema.methods.generateMailToken = function generateMailToken() {
  const hours = Math.floor(Date.now() / 1000) + (60 * 60 * 5)
  this.mailToken = this.generateJWT(hours)
}


export default mongoose.model("User", schema);
