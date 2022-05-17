export const packageName = 'sv2js'

export const cReset = '\u001b[0m'

const color = (code) => {
  return (str) => {
    return `\u001b[${code}m${str}${cReset}`
  }
}
export const colors = {
  red: color('31'),
  magenta: color('35'),
  cyan: color('36'),
  blue: color('34'),
  brightBlue: color('96'),
  brightGreen: color('92')
}

export const convertHrtime = (hrtime) => {
  const ns = hrtime
  const number = Number(ns)
  const ms = number / 1000000
  const s = number / 1000000000
  return {
    s,
    ms,
    ns
  }
}

export const convertTime = (hrtime, unit) => {
  const time = convertHrtime(hrtime[1])[unit]
  return {
    origin: time,
    fixed: time.toFixed(3),
    string: `${time.toFixed(3)}s`
  }
}

// {
//   '/dir': {
//     '$file': {}
//   }
// }
export const getMatchValueFromPath = (file, ext, options) => {
  if (!options) { return }

  const mark = {
    dir: '/',
    file: '$'
  }

  let currentVal = null
  let parentVal = null

  let split = file
    .replace(/(\.)+\//g, '/')
    .split(/(?=\/)/g)

  split[split.length - 1] = split[split.length - 1]
    .replace(/^\//, mark.file)
    .replace(ext, '')

  split.forEach((name, i) => {
    const targetConfig = (currentVal && currentVal[name])
    const baseConfig = options[name]
    const data = targetConfig || baseConfig
    for (const key in data) {
      const regexp = new RegExp(`^(${mark.dir}|${mark.file})`)
      if (key.match(regexp)) { break }
      if (!parentVal) { parentVal = {} }
      parentVal[key] = data[key]
    }
    if (data || parentVal) {
      currentVal = Object.assign({}, parentVal, data)
    }
  })
  return currentVal
}
