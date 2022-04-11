import { findUp } from 'find-up'

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import path from 'path'
import fs from 'fs'
import { packageName } from './utilities.js'

const configFiles = [
  `.${packageName}rc`,
  `.${packageName}rc.mjs`,
  `.${packageName}rc.js`,
  `.${packageName}rc.json`
]
const configPath = await findUp(configFiles)

const isJS = configPath && configPath.match(/\.m?(t|j)sx?$/)
const configFile = isJS && await import(configPath)
const config = (configFile && configFile.default) || (configPath ? JSON.parse(fs.readFileSync(configPath)) : {})

const argv = yargs(hideBin(process.argv))
  .config(config || {})
  .option('separater', {
    alias: 's',
    describe: 'column separate => default: \\t',
    default: '\t',
  })
  .option('targetFile', {
    alias: 'tf',
    describe: 'target glob',
    default: './**/**.txt',
  })
  .option('extension', {
    alias: 'ext',
    describe: 'dist extension',
    default: 'js',
  })
  .option('template', {
    alias: 'temp',
    describe: 'dist template [esm|cjs|json]',
    default: 'esm',
  })
  .option('ignore', {
    alias: 'ig',
    describe: 'ignore files',
    default: './node_modules/**,**/node_modules/**',
  })
  .option('encode', {
    alias: 'enc',
    describe: 'base file encode',
    default: 'utf-8',
  })
  .argv

export const separater = argv.separater
export const targetFile = argv.targetFile
export const extension = argv.extension
export const template = argv.template
export const ignore = argv.ignore
export const encode = argv.encode

export const onSequence = config.onSequence
