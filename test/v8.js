/* eslint-disable node/no-deprecated-api, no-eval */

var assert = require('assert')
var fs = require('fs')
var path = require('path')
var parse = require('..').parse

var root = path.resolve(__dirname, 'v8')
var directories = fs.readdirSync(root)

function addTest (arg, filePath) {
  try {
    var x = parse(arg, { mode: 'json5' })
  } catch (err) {
    x = 'fail'
  }
  try {
    var z = eval('(function(){"use strict"\nreturn (' + String(arg) + '\n)\n})()')
  } catch (err) {
    z = 'fail'
  }
  if (Number.isNaN(x)) x = '_NaN'
  if (Number.isNaN(z)) z = '_NaN'
  try {
    assert.deepEqual(x, z)
  } catch (error) {
    console.log(filePath)
    throw error
  }
}

function createTest (fileName, directory) {
  var filePath = path.join(root, directory, fileName)
  var source = fs.readFileSync(filePath, 'utf8')
  addTest(source, filePath)
}

directories.forEach(function (directory) {
  // create a test suite for this group of tests:
  exports[directory] = {}

  // otherwise create a test for each file in this group:
  fs.readdirSync(path.join(root, directory)).forEach(function (file) {
    createTest(file, directory)
  })
})
