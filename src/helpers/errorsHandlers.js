
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
      errors: {
        message: 'expired token'
      }
    }
  }
  if(isRefresh) {
    data.results.errors['isLogout'] = true
  }
  result.status(406).json(data)
};
export {
  expiredTokenError,
  internalServerError
}
