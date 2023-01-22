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
  .option('lineJoin', {
    alias: 'ljoin',
    describe: 'line join => default: \\n',
    default: '\\n',
  })
  .option('columnSeparator', {
    alias: 'csep',
    describe: 'column separate => default: \\t',
    default: '\t',
  })
  .option('src', {
    alias: 's',
    describe: 'source file glob',
    default: './**/**.txt',
  })
  .option('dest', {
    alias: 'd',
    describe: 'dest directory',
    default: '',
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

  .option('key', {
    alias: 'k',
    describe: 'for type object',
    default: '',
  })
  .argv

if (!argv.onPreprocess) {
  argv.onPreprocess = (content) => {
    const matchQuotes = content.match(/"((?:[^\\"]+|\\.)*)"/g)
    const formatQuotes = matchQuotes.map((matchQuote) => {
      return matchQuote
        .replace(/^"(\n)?|(\n)?"$/g, '')
        .replace(/\n/g, '<br>')
    })
    matchQuotes.map((matchQuote, i) => {
      content = content.replace(matchQuote, formatQuotes[i])
    })
    return content
  }
}

export default argv

