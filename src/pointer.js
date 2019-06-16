function escapePointerToken (token) {
  return token
    .toString()
    .replace(/~/g, '~0')
    .replace(/\//g, '~1')
}

function pathToPointer (tokens) { // eslint-disable-line no-unused-vars
  if (tokens.length === 0) {
    return ''
  }
  return '/' + tokens
    .map(escapePointerToken)
    .join('/')
}

function unescapePointerToken (token) {
  return token
    .replace(/~1/g, '/')
    .replace(/~0/g, '~')
}

function pointerToPath (pointer) { // eslint-disable-line no-unused-vars
  if (pointer === '') {
    return []
  }
  if (pointer[0] !== '/') {
    throw new Error('Missing initial "/" in the reference')
  }
  return pointer
    .substr(1)
    .split('/')
    .map(unescapePointerToken)
}
