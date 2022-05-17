export default {
  extension: 'js',

  onSequence: (key, value, array) => {
    if (key === 'date') {
      value = value.replace(/-/g, '/')
    }
    return value
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
