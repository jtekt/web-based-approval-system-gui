export default {
  methods: {
    format_date (date) {
      const { year, month, day } = date
      return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`
    }
  }
}
