#!/usr/bin/env node

'use strict'

/* @author ysknk */

import { promises as fs } from 'fs'
import glob from 'glob'
import path from 'path'

import { packageName, colors, convertTime } from './lib/utilities.js'
import {
  separater,
  targetFile,
  extension,
  template,
  ignore,
  encode,
  onSequence
} from './lib/arguments.js'

let data = []

const sequence = (key, column, array) => {
  if (onSequence) {
    return onSequence(key, column, array)
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

const convert = (content) => {
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
      column = sequence(key, column, array[count], {
        data,
        iterator: j
      })
      if (column.value !== undefined) {
        column = column.value
      }
      if (column.ignore !== undefined) {
        isIgnore = column.ignore
        if (!column.ignore) {
          delete array[count][key]
        }
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
      const regexp = new RegExp(`${path.extname(targetFile)}$`, 'i')
      const filename = file.replace(regexp, `.${extension}`)
      try {
        await fs.writeFile(filename, convert(content))
        onSuccess(`${file} => ${filename}`)
      } catch (e) {
        console.log(err)
      }
    }
  })()
})
