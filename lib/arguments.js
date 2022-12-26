import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

import utils from 'node-package-utilities'

export const packageName = 'sv2js'

export const config = await utils.value.fromConfig(packageName)

const argv = yargs(hideBin(process.argv))
  .config(config || {})
  .option('lineSeparator', {
    alias: 'lsep',
    describe: 'line separate => default: \\r\\n|\\n',
    default: '\r\n|\n',
  })
  .option('columnSeparater', {
    alias: 'csep',
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
    alias: 'tmpl',
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

export default argv

