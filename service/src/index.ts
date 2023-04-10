
import app from './app'

app.listen(process.env.APP_PORT || 3000, () => globalThis.console.log(`Server is running on port ${process.env.APP_PORT || 3000}`))
