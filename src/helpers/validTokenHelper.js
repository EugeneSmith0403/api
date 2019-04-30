import jwt from 'jsonwebtoken'
import User from './../models/User'
import { internalServerError, expiredTokenError } from './errorsHandlers'

const userData = (user) => {
  return {
    email: user.email,
    username: user.username,
    confirmed: user.confirmed,
    phone: user.phone,
    image: user.images,
    age: user.age
  }
}

const getAfterUpdateRefreshToken = (user, result, request, next) => {
  user.generateAccessToken()
  user.generateRefreshToken()
  user.save()
    .then((savedUser)=>{
      let userInfo = userData(savedUser)
      userInfo = {
        ...userInfo,
        accessToken: savedUser.accessToken,
        refreshToken: savedUser.refreshToken
      }
      request.currentUser = userInfo;
      next()
    })
    .catch(internalServerError(result, '1somethings wrong, try again'))
}


export default (token = '', result, request, next) => {
  jwt.verify(token, process.env.JWT_SECRET, (err, decode)=> {
    if(!err) {
      User.findOne({email: decode.email})
        .then((user)=>{
          if(decode && decode.isRefreshToken) {
            getAfterUpdateRefreshToken(user, result, request, next)
          }else {
            request.currentUser = {
              ...userData(user),
              email: decode.email
            };
            next()
          }
      })
      .catch(internalServerError(result, '2somethings wrong, try again'));
    }else {
      expiredTokenError(result, decode && decode.isRefreshToken)
    }
  })
}
