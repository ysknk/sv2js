export default {
  extension: 'js',

  onSequence: (key, value, array) => {
    let ignore = false
    if (key === 'date') {
      value = value.replace(/-/g, '/')
    }
    return {
      value,
      ignore
    }
  },

  // NOTE: dir local options
  // options: {
  //   '/dirname1': {
  //     '/dirname2': {
  //       '$filename': {}
  //     }
  //   }
  // }

}
