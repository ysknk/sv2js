#!/usr/bin/env node

'use strict'

/* @author ysknk */

import { promises as fs } from 'fs'
import glob from 'glob'
import path from 'path'

import utils from 'node-package-utilities'

import {
  separater,
  targetFile,
  extension,
  template,
  ignore,
  encode,
  config
} from './lib/arguments.js'

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
    return 'module.exports='
  }
  return ''
})(template)


const convert = (content, fileconfig) => {
  const lines = content.split(/\r\n|\n/)// NOTE: 改行文字
  const js = ''
  const array = []

  // NOTE: line
  lines.forEach((line, i) => {
    let count = i - 1
    const columns = line.split(separater)
    // NOTE: column
    if (!columns[0]) { return }

    // NOTE: 1行目は以降配列のkeyになる
    if (i === 0) {
      data = columns
      return
    }

    columns.forEach((column, j) => {
      const key = data[j]
      let isIgnore = false
      if (!array[count]) { array[count] = {} }
      // NOTE: custom
      const columnObj = sequence(fileconfig, key, column, array[count])
      // , {
      //   data,
      //   iterator: j
      // }
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
  // console.log(array)
  return `${templateString}${JSON.stringify(array, null, 2)}`
}

glob(targetFile, {
  ignore: ignore.split(',')
}, (err, files) => {
  if (err) {
    console.log(err)
    return
  }

  // NOTE: file read/write
  (async () => {
    for await (const file of files) {
      utils.message.processing(file)
      // NOTE: read
      let content = ''
      try {
        content = await fs.readFile(file, encode)
      } catch (e) {
        utils.message.failure(e)
      }

      // NOTE: write
      const ext = path.extname(targetFile)
      const regexp = new RegExp(`${ext}$`, 'i')
      const fileconfig = utils.value.fromPath(file, ext, config.options) || {}

      const filename = file.replace(regexp, `.${(fileconfig && fileconfig.extension) || (fileconfig && fileconfig.ext) || extension}`)

      try {
        await fs.writeFile(filename, convert(content, fileconfig))
        utils.message.success(`${file} => ${filename}`)
      } catch (e) {
        utils.message.failure(e)
      }
    }

    utils.message.finish()
  })()

})
