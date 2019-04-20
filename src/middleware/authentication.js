import User from './../models/User'
import {} from './../helpers/responseHandlers'
import checkValidToken from './../helpers/validTokenHelper'

const userInformation = (user) => {
  return {
    email: user.email,
    username: user.username,
    confirmed: user.confirmed
  }
}

export default (req,res, next) => {
  const {accessToken, refreshToken} = req.body
  const clearAccessToken = accessToken && accessToken.split(' ')[1]

  if(accessToken) {
    checkValidToken(clearAccessToken, res, req, next)
  }

  if(refreshToken) {
    checkValidToken(refreshToken, res, req, next, true)
  }

}
