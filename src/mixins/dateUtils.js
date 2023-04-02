// Using these functions because ID have changed multiple times over the course of time
export default {
  methods: {
    format_date_neo4j({ year, month, day }) {
      return new Date(`${year}-${month}-${day}`).toDateString()
    },
  },
}
