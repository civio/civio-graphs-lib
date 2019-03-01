import { select } from 'd3-selection'

export default class Table {
  constructor(selector, columns) {
    // Select table element
    this.el = select(selector)
    // Launch error if no selector found
    if (this.el.size() === 0)
      throw new Error(`Can't find root element ${selector}`)
    // Validate columns is an array & each element is an object with a key attribute
    if (!columns.length)
      throw new Error('Table columns is not an array or is empty')
    columns.forEach(d => {
      if (!d.hasOwnProperty('key'))
        throw new Error(`Table column has no key defined: ${JSON.stringify(d)}`)
    })
    this.columns = columns
    // Add table head & body
    this.thead = this.el.append('thead').append('tr')
    this.tbody = this.el.append('tbody')
    // set table header
    this.columns.forEach(this.addColumn.bind(this))
  }

  addColumn(column) {
    const td = this.thead.append('th')
    if (column.align) td.attr('class', `text-${column.align}`)
    td.html(column.name ? column.name : column.key)
  }

  addData(data) {
    // get each data item
    data.forEach(item => {
      const tr = this.tbody.append('tr')
      // get each column
      this.columns.forEach(key => {
        const td = tr.append('td')
        const value = item[key.key]
        // set value if defined
        if (value) {
          td.html(key.callback ? key.callback(item) : value)
          if (key.class) td.attr('class', key.class(item))
          if (key.dataSort) td.attr('data-sort', key.dataSort(value))
        }
      })
    })
  }
}
