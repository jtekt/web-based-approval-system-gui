import type { Neo4jDate } from '@/types'

export function useDateUtils() {
  function formatDateNeo4j(date: Neo4jDate): string {
    return new Date(`${date.year}-${date.month}-${date.day}`).toDateString()
  }

  return { formatDateNeo4j }
}
