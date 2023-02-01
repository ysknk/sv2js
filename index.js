#!/usr/bin/env node

'use strict'

/* @author ysknk */

import { promises as fs } from 'fs'
import glob from 'glob'
import path from 'path'

import utils from 'node-package-utilities'

import argv, { config } from './lib/arguments.js'

let data = []

const sequence = (fileconfig, key, column, array) => {
  let localconfig = fileconfig && fileconfig.onSequence
    || config && config.onSequence
  if (localconfig) {
    return localconfig(key, column, array)
  }
  return column
  // return {
  //   value: column,
  //   ignore: false
  // }
}

utils.message.begin()

let templateString = ((str) => {
  if (str.match(/esm/i)) {
    return 'export default '
  }
  if (str.match(/cjs/i)) {
    return 'module.exports = '
  }
  return ''
})(argv.template)

const convert = (content, fileconfig) => {
  const lineSep = new RegExp(argv.lineSeparator, 'g')
  const lines = content.split(lineSep)// NOTE: 改行文字
  const js = ''
  const array = []

  const columnSep = new RegExp(argv.columnSeparator, 'g')
  const baseColumn = lines[0] && lines[0].split(columnSep)
  if (!baseColumn) { return }
  const baseColumnLength = baseColumn.length

  // NOTE: line
  lines.forEach((line, i) => {
    let count = i - 1
    let columns = line.split(columnSep)

    // NOTE: column
    if (!columns[0]) { return }

    // NOTE: 1行目は以降配列のkeyになる
    if (i === 0) {
      data = columns
      return
    }

    columns.forEach((column, j) => {
      let key = data[j]
      let isIgnore = false
      if (!array[count]) { array[count] = {} }
      // NOTE: custom
      const columnObj = sequence(fileconfig, key, column, array[count])

      if (columnObj.key !== undefined) {
        key = columnObj.key
      }
      if (columnObj.value !== undefined) {
        column = columnObj.value
      }
      if (columnObj.ignore !== undefined) {
        isIgnore = columnObj.ignore
      }
      if (!isIgnore) {
        array[count][key] = column
      }
    })
  })

  let filterd = array.filter((obj) => obj)
  if (argv.key) {
    const objects = {}
    filterd.forEach((object, i) => {
      objects[object[argv.key]] = object
    })
    filterd = objects
  }
  return `${templateString}${JSON.stringify(filterd, null, 2)}`
}

glob(argv.src, {
  ignore: argv.ignore.split(',')
}, (err, files) => {
  if (err) {
    console.log(err)
    return
  }

  // NOTE: file read/write
  (async () => {
    for await (const file of files) {
      utils.message.processing(path.relative(process.cwd(), file))
      // NOTE: read
      let content = ''
      try {
        content = await fs.readFile(file, argv.encode)
      } catch (e) {
        utils.message.failure(e)
      }

      const ext = path.extname(argv.src)
      const regexp = new RegExp(`${ext}$`, 'i')
      const fileconfig = utils.value.fromPath(file, ext, config.options) || {}

      // NOTE: dest
      const filename = file.replace(regexp, `.${(fileconfig && fileconfig.extension) || (fileconfig && fileconfig.ext) || argv.extension}`)
      const dest = argv.dest
        ? path.resolve(`${argv.dest}${path.basename(filename)}`)
        : filename

      // NOTE: onPreprocess
      content = argv.onPreprocess(content)

      try {
        // NOTE: write
        await fs.writeFile(dest, convert(content, fileconfig))
        utils.message.success(`${path.relative(process.cwd(), file)} => ${path.relative(process.cwd(), dest)}`)
      } catch (e) {
        utils.message.failure(e)
      }
    }

    utils.message.finish()
  })()

})
