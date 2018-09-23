// Imports
const {
  compose,
  randomListElement,
  safeLowerCase,
} = require('./utils.js')
const decodeBase64 = require('atob')

// Globals
const users = new Map()

// Methods
const getUsers = module.exports.getUsers
  = () =>
    [...users.keys()]

const credentialsFor
  = ([name, pass]) =>
    users.get(safeLowerCase(name)) === pass
    ? safeLowerCase(name)
    : undefined

const parseCredentials
  = authHeader =>
    !authHeader || authHeader.slice(0, 6) !== 'Basic '
    ? []
    : decodeBase64(authHeader.slice(6)).split(':')

const authenticate = module.exports.authenticate
  = compose([parseCredentials, credentialsFor])


const createPasswordForUser = module.exports.createPasswordForUser
  = name => {
    name = name.toLowerCase()
    if (name.length < 3 || users.has(name) || name.match(/[^A-Za-z]/)) return false

    const pass
      = randomListElement(passwordComponentAdjectives)
      + ' '
      + randomListElement(passwordComponentNoun)

    users.set(name, pass)
    return pass
  }

// Data
const passwordComponentAdjectives
  = [
    'big',
    'black',
    'blue',
    'boiling',
    'brave',
    'broken',
    'calm',
    'cold',
    'cool',
    'creepy',
    'curly',
    'damaged',
    'dirty',
    'dry',
    'dusty',
    'fluffy',
    'freezing',
    'gray',
    'green',
    'happy',
    'hot',
    'jolly',
    'kind',
    'large',
    'little',
    'massive',
    'orange',
    'purple',
    'red',
    'short',
    'silly',
    'small',
    'tall',
    'tiny',
    'warm',
    'wet',
    'white',
    'yellow',
  ]
const passwordComponentNoun
  = [
    'ability',
    'activity',
    'area',
    'art',
    'bird',
    'computer',
    'data',
    'economics',
    'fact',
    'family',
    'flower',
    'food',
    'glass',
    'health',
    'history',
    'idea',
    'industry',
    'internet',
    'law',
    'library',
    'love',
    'map',
    'media',
    'music',
    'nature',
    'oven',
    'problem',
    'product',
    'science',
    'society',
    'software',
    'story',
    'system',
    'theory',
    'thing',
    'world',
    'year',
  ]
