const cgi = require('cgi')
const http = require('http')
const { exec: execRaw } = require('child_process')

const {
  authenticate,
  createPasswordForUser,
  getUsers,
} = require('./users.js')

const port = 8080
const root = '/srv/gitrepos/root'


const exec
  = cmd => new Promise((resolve, reject) => {
    console.log(`About to perform (${cmd})\n\n`)
    execRaw(cmd, (err, stdout, stderr)  => {
      if(err) {
        reject(err)
      }
      resolve(stdout)
    })
  })

const gitCGI = cgi('/usr/lib/git-core/git-http-backend', {
  env: {
    GIT_HTTP_EXPORT_ALL: "",
    GIT_PROJECT_ROOT: '/srv/gitrepos',
    // Pretend the user is authenticated
    REMOTE_USER: 'a-git-user',
  },
  stderr: process.stderr
})

const projectData = {
  'introducetion': {
    location: 'git-workshop-upstream-introduction',
    hook: (path, user) => async i => {
      if(i != 1) return

      const cmd = `cd /srv/gitrepos/${path}`
                + ' && echo " * Woody Woodpecker" >> README.txt'
                + ' && git -c user.name="Woody Woodpecker" -c user.email="woody@dtek.se"'
                  + '  commit -am "Tought we\'d add a greeting"'
      await exec(cmd)
    },
  },
//  'Push n\' Pull': '',
}
const projects = Object.keys(projectData)

const getBody
  = req => new Promise((resolve, reject) => {
    let body = [];
    req
      .on('data', chunk => body.push(chunk))
      .on('end', () => resolve(Buffer.concat(body).toString()))
      .on('error', reject)
  })

const api
  = async (req, res) => {
    switch (req.method.toLowerCase()) {
      case 'post':
        const {project, username} = JSON.parse(await getBody(req))
        const password = createPasswordForUser(username)
        if(!password) {
          res.writeHead(409, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
          })
          res.end(JSON.stringify({message: 'username invalid or taken'}))
          return
        }
        const url = await deployProject(project, username)
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        })
        res.end(JSON.stringify({ username, password, url }))
        break
      case 'options':
        res.writeHead(200, {
          'Allow': 'OPTIONS, GET, POST',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        })
        res.end('')
        break
      default:
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
        })
        res.end(JSON.stringify(projects))
        break
    }
  }

const status
  = (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    })
    res.end(JSON.stringify({ users: getUsers(), projects: [...deployedProjects.keys()] }))
  }


const deployedProjects = new Map()
const deployProject = async (project, user) => {
  const projectPath = user + '/' + projectData[project].location

  // TODO: very stupid to pass user-data into this
  const cmd = `mkdir -p /srv/gitrepos/${user}`
            + ` && cd /srv/gitrepos/${user}`
            + ` && git clone ${root}/${projectData[project].location}`
            // Prevent complaints about non-bare projects
            + ` && cd ${projectData[project].location}`
            + ' && git config receive.denyCurrentBranch updateInstead'
  await exec(cmd)

  deployedProjects.set(projectPath, {hook: projectData[project].hook(projectPath, user), i: 0})
  return '/git/' + projectPath
}

const nothing = () => nothing
const hook
  = async projectPath => {
    const proj = deployedProjects.get(projectPath)
    if(!proj) return
    await proj.hook(proj.i++)
  }

const server = async (req, res) => {
  if(req.url === '/git/api/projects') return await api(req, res)
  if(req.url === '/git/api/status') return await status(req, res)

  const user
    = req.url.endsWith('/info/refs?service=git-upload-pack')
      || req.url.endsWith('/git-upload-pack')
    ? 'anyone'
    : authenticate(req.headers.authorization)

  if (!user) {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="example"')
    res.end('Access denied')
    return
  }

  req.url = req.url.slice(4) // remove /git
  await hook((/^\/([^\/]+\/[^\/]+)/g).exec(req.url)[1])
  gitCGI(req, res)
}

const catcher
  = hdlr => async (req, res) => {
    try {
      await hdlr(req, res)
    } catch(e) {
      console.error('Uncaught error:', e)
      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      })
      res.end(JSON.stringify({message: 'unknown error'}))
    }
  }

http.createServer(catcher(server)).listen(port)
console.log('Server listening on port ' + port)
