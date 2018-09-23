const compose = module.exports.compose
  = ([firstFunction, ...functions]) => (...args) =>
    functions.reduce(
      (lastRes, fn) => fn(lastRes),
      firstFunction(...args)
    )

const randomListElement = module.exports.randomListElement
  = list =>
    list[Math.floor(Math.random() * list.length)]

const safeLowerCase = module.exports.safeLowerCase
  = text =>
    text
      && typeof text.toLowerCase === 'function'
      && text.toLowerCase()
    || text
