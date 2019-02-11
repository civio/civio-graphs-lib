// format & timeFormat default locales
// https://github.com/d3/d3-time-format#locales
// https://github.com/d3/d3-format/#locales

const formatDefaultLocale = {
  en: {
    decimal: '.',
    thousands: ',',
    grouping: [3],
    currency: ['$', '']
  },
  es: {
    decimal: ',',
    thousands: '.',
    grouping: [3],
    currency: ['', '\u00a0€']
  }
}

const timeFormatDefaultLocale = {
  en: {
    dateTime: '%x, %X',
    date: '%-m/%-d/%Y',
    time: '%-I:%M:%S %p',
    periods: ['AM', 'PM'],
    days: [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ],
    shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ],
    shortMonths: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ]
  },
  es: {
    dateTime: '%A, %e de %B de %Y, %X',
    date: '%d/%m/%Y',
    time: '%H:%M:%S',
    periods: ['AM', 'PM'],
    days: [
      'domingo',
      'lunes',
      'martes',
      'miércoles',
      'jueves',
      'viernes',
      'sábado'
    ],
    shortDays: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
    months: [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre'
    ],
    shortMonths: [
      'ene',
      'feb',
      'mar',
      'abr',
      'may',
      'jun',
      'jul',
      'ago',
      'sep',
      'oct',
      'nov',
      'dic'
    ]
  }
}

export { formatDefaultLocale, timeFormatDefaultLocale }
