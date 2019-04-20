
const internalServerError = (result, message) => {
  return (error)=> {
    result.status(500).json({
      results: {
        message: message,
      }
    })
}

export default expiredTokenError = (result) => {
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
