import jwt from 'jsonwebtoken'
import User from './../models/User'
import { internalServerError, expiredTokenError } from './errorsHandlers'

const userData = (user) => {
  return {
    email: user.email,
    username: user.username,
    confirmed: user.confirmed
  }
}

const getAfterUpdateRefreshToken = (user, result, request) => {
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
    .catch(internalServerError(result, 'somethings wrong, try again'))
}


export default (token = '', result, request, next, isRefresh = false) => {
  jwt.verify(token, process.env.JWT_SECRET, (err, decode)=> {
    if(!err) {
      User.findOne({email: decode.email})
        .then((user)=>{
          if(isRefresh) {
            getAfterUpdateRefreshToken(user, result, request)
          }else {
            request.currentUser = {
              ...userData(user),
              email: decode.email
            };
            next()
          }
      })
      .catch(internalServerError(result, 'somethings wrong, try again'));
    }else {
      expiredTokenError(result, isRefresh)
    }
  })
}
