import mongoose from 'mongoose'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
const algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

function decrypt(text, password){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

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
  const text = decrypt(password, this.publicKey)
  this.passwordHash = bcrypt.hashSync(text, 10);
}

schema.methods.checkPassword = function checkPassword(password) {
  const text = decrypt(password, this.publicKey)
  return bcrypt.compareSync(text, this.passwordHash);
}

schema.methods.generateAccessToken = function generateAccessToken() {
  const hour = {expiresIn: '1h'}
  this.accessToken = this.generateJWT(hour)
}

schema.methods.generateRefreshToken = function generateRefreshToken() {
  const month = {expiresIn: '1m'}
  this.refreshToken = this.generateJWT(month)
}


schema.methods.generateJWT = function generateJWT(expiresIn = {}) {
  return jwt.sign(
    {
      email: this.email,
      username: this.username,
      confirmed: this.confirmed,
    },
    process.env.JWT_SECRET,
    expiresIn
  );
}

schema.methods.generatePublicKey = function generatePublicKey() {
  const secret = process.env.SECRET
  const publicKey = bcrypt.hashSync(Math.random().toString(), 10);
  this.publicKey = publicKey
}

schema.methods.generateMailToken = function generateMailToken() {
  const hours = {expiresIn: '5h'}
  this.mailToken = this.generateJWT(hours)
}
schema.statics.decodePassword = function decodePassword(text, password) {
  return decrypt(text ,password)
}


export default mongoose.model("User", schema);
