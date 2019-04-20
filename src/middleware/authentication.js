import jwt from 'jsonwebtoken'
import User from './../models/User'


const userInformation = (user) => {
  return {
    email: user.email,
    username: user.username,
    confirmed: user.confirmed
  }
}


/*Проверяю токены при каждом запросе на данные*/
const checkValidToken = (token = '', result, request, next, isRefresh = false) => {
  jwt.verify(token, process.env.JWT_SECRET, (err, decode)=> {
    if(!err) {
      User.findOne({email: decode.email}).then((user)=>{
          if(isRefresh) {
            user.generateAccessToken()
            user.generateRefreshToken()
            user.save().then((savedUser)=>{
              let userInfo = userInformation(savedUser)
              userInfo = {
                ...userInfo,
                accessToken: savedUser.accessToken,
                refreshToken: savedUser.refreshToken
              }
              request.currentUser = userInfo;
              next()
            })
          }else {
            request.currentUser = {
              email: decode.email,
              username: user.username,
              confirmed: user.confirmed
            };
            next()
          }
      })
      .catch((error)=>{
        result.status(500).json({
          results: {
            message: 'some things wrong',
          }
        })
      });

    }else {
      let data = {
        results: {
          message: 'expired token'
        }
      }
      if(isRefresh) {
        data.results['isRefresh'] = true
      }
      result.status(406).json(data)
    }
  })
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
