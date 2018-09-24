const GET = 'GET'
const POST = 'POST'
const backend = location.origin

const xhr
  = (url, verb=GET, data) => new Promise((resolve, reject) => {
    const req = new XMLHttpRequest
    req.onreadystatechange
      = () =>
        req.readyState == req.DONE
        && (req.status == 200 ? resolve : reject)(JSON.parse(req.response))
    req.onerror = reject
    req.open(verb, url)
    req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    req.send(JSON.stringify(data))
  })

const getProjects
  = () =>
    xhr(backend + '/git/api/projects')

const createProject
  = (project, username) =>
    xhr(backend + '/git/api/projects', POST, {project, username})

const project = document.getElementById('project')
const projects = document.getElementById('projects')
const name = document.getElementById('name')
const errorMsg = document.getElementById('error')
const successMsg = document.getElementById('success')
const theUsername = document.getElementById('the-username')
const thePwd = document.getElementById('the-pwd')
const theLink = document.getElementById('the-link')
const form = document.getElementById('selectProject')

const error
  = ({ message }) => {
    errorMsg.textContent = '[error] ' + message
    errorMsg.style.display = 'block'
  }

const success
  = ({ username, password, url }) => {
    theUsername.textContent = username
    thePwd.textContent = password
    theLink.href = url
    theLink.textContent = location.origin + url
    successMsg.style.display = 'block'
    form.style.display = 'none'
  }

const clearProjects
  = () => {
    while(projects.firstChild) projects.removeChild(projects.firstChild)
  }

const addProject
  = name => {
    const project = document.createElement('li')
    const projLink = document.createElement('a')
    projLink.addEventListener('click', selectProject)
    projLink.textContent = name
    projLink.href = '#'
    project.appendChild(projLink)
    projects.appendChild(project)
  }

const mapRepoOpts
  = mapper =>
    Array.from(document.getElementsByClassName('repoOptions'))
      .map(mapper)

const showRepoOpts
  = () =>
    mapRepoOpts(el => {el.style.display = 'block'})

const hideRepoOpts
  = () =>
    mapRepoOpts(el => {el.style.display = 'none'})

const setInstructions
  = name =>
    document.getElementById('projectPanel').setAttribute('data-project', name) || true


const projectHandlers
  = { "Introduction"
        : () =>
          setInstructions('intro') && showRepoOpts()
    , "Introduction (repetition)"
        : () =>
          setInstructions('intro2') && showRepoOpts()
    , "GitHub Account"
        : () =>
          setInstructions('gh') && hideRepoOpts()
    , "Collaborating on GitHub"
        : () =>
          setInstructions('co-gh') && hideRepoOpts()
    }

const selectProject
  = e => {
    e.preventDefault()
    project.textContent = e.target.textContent
    projectHandlers[e.target.textContent]()
  }

projects

form.addEventListener('submit', async e => {
  e.preventDefault()
  if(project.textContent == 'Select a project')
    return error({message:'no project selected'})

  errorMsg.style.display = 'none'
  try {
    success(await createProject('introduction', name.value))
  } catch(e) {
    error(e)
  }

})

setTimeout(async () => {
  clearProjects()
  Object.keys(projectHandlers).forEach(addProject)
})
