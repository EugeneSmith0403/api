
const internalServerError = (result, message) => {
  return (error)=> {
    result.status(500).json({
      results: {
        message: message,
      }
    })
  }
}

const expiredTokenError = (result, isRefresh = false) => {
  let data = {
    results: {
      message: 'expired token'
    }
  }
  if(isRefresh) {
    data.results['isRefresh'] = false
  }
  result.status(406).json(data)
};
export {
  expiredTokenError,
  internalServerError
}
