"use client"

import { useState, useMemo } from "react"

export function useSearch<T>(data: T[], searchFields: (keyof T)[], initialQuery = "") {
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data

    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field]
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchQuery.toLowerCase())
        }
        if (typeof value === "number") {
          return value.toString().includes(searchQuery)
        }
        return false
      }),
    )
  }, [data, searchFields, searchQuery])

  return {
    searchQuery,
    setSearchQuery,
    filteredData,
  }
}
