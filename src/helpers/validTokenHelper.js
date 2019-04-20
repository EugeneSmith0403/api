import User from './../models/User'

const userData = (user) => {
  return {
    email: user.email,
    username: user.username,
    confirmed: user.confirmed
  }
}

const getAfterUpdateRefreshToken(user, request) => {
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
    .catch(err=>err)
}


export default checkValidToken = (token = '', result, request, next, isRefresh = false) => {
  jwt.verify(token, process.env.JWT_SECRET, (err, decode)=> {
    if(!err) {
      User.findOne({email: decode.email})
        .then((user)=>{
          if(isRefresh) {
            getAfterUpdateRefreshToken(user, request)
          }else {
            request.currentUser = {
              ...userData(),
              email: decode.email
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
        data.results['isRefresh'] = false
      }
      result.status(406).json(data)
    }
  })
}
