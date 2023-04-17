import * as jwt from 'jsonwebtoken'
import { isNotEmptyString } from '../utils/is'
import * as whitelist from '../service/whitelist'

const authJWT = async (req, res, next) => {
  const JWT_SECRET = process.env.JWT_SECRET
  if (isNotEmptyString(JWT_SECRET)) {
    try {
      const bearerHeader = req.header('Authorization')

      const accessToken = bearerHeader && bearerHeader.split(' ')[1]

      if (!bearerHeader || !accessToken)
        throw new Error('Error: 无访问权限 | No access rights')

      // check whitelist
      const { address, uri } = jwt.verify(accessToken, process.env.JWT_SECRET || 'secret')

      if (uri !== req.headers.origin)
        throw new Error('Error: 无访问权限 | No access rights')

      if (!await whitelist.check(address))
        throw new Error('Error: 无访问权限 | No access rights')

      next()
    }
    catch (error) {
      // console.log("error",error);
      res.send({ status: 'Unauthorized', message: error.message ?? 'Please authenticate.', data: null })
    }
  }
  else {
    next()
  }
}

export { authJWT }
