const cgi = require('cgi')
const stack = require('stack')
const http = require('http')

const gitCGI = cgi('/usr/lib/git-core/git-http-backend', {
  env: {
    GIT_HTTP_EXPORT_ALL: "",
    GIT_PROJECT_ROOT: '/srv/gitrepos',
    // Pretend the user is authenticated
    REMOTE_USER: 'a-git-user',
  },
  stderr: process.stderr
})

const logger = (req, _, next) => {
  console.log(`Requested "${req.url}"`)
  next()
}

http.createServer( stack(logger, gitCGI) ).listen(80);
