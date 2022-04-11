export default {
  extension: 'js',

  onSequence: (key, column, array) => {
    if (key === 'date') {
      column = column.replace(/-/g, '/')
    }
    return column
  }
}
