import User from './../models/User'
import {} from './../helpers/responseHandlers'
import checkValidToken from './../helpers/validTokenHelper'

const userInformation = (user) => {
  return {
    email: user.email,
    username: user.username,
    confirmed: user.confirmed,
    phone: user.phone,
    image: user.image,
    age: user.age
  }
}

export default (req,res, next) => {
  const token = req.headers.authorization
  const clearToken = token && token.split(' ')[1]
  checkValidToken(clearToken, res, req, next)
}
