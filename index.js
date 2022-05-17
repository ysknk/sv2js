#!/usr/bin/env node

'use strict'

/* @author ysknk */

import { promises as fs } from 'fs'
import glob from 'glob'
import path from 'path'

import {
  packageName,
  colors,
  convertTime,
  pathValsMatcher
} from './lib/utilities.js'

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

const hrtimes = []
hrtimes.push(process.hrtime())

const onSuccess = (string) => {
  hrtimes.push(process.hrtime())
  console.log(colors.brightGreen('success'), `${string} - ${convertTime(hrtimes[hrtimes.length - 1], 's').string}`)
}

let templateString = ''
;(() => {
  if (template.match(/esm/i)) {
    templateString = 'export default '
  }
  if (template.match(/cjs/i)) {
    templateString = 'module.exports='
  }
})()

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
      column = sequence(fileconfig, key, column, array[count])
      // , {
      //   data,
      //   iterator: j
      // }
      if (column.value !== undefined) {
        column = column.value
      }
      if (column.ignore !== undefined) {
        isIgnore = column.ignore
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
      console.log(colors.blue('processing'), file)
      // NOTE: read
      let content = ''
      try {
        content = await fs.readFile(file, encode)
      } catch (e) {
        console.log(colors.magenta('error'), e)
      }

      // NOTE: write
      const ext = path.extname(targetFile)
      const regexp = new RegExp(`${ext}$`, 'i')
      const fileconfig = pathValsMatcher(file, ext, config.options) || {}

      const filename = file.replace(regexp, `.${(fileconfig && fileconfig.extension) || (fileconfig && fileconfig.ext) || extension}`)

      try {
        await fs.writeFile(filename, convert(content, fileconfig))
        onSuccess(`${file} => ${filename}`)
      } catch (e) {
        console.log(err)
      }
    }
  })()
})
