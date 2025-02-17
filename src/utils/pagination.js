export const paginateData = (data, currentPage, pageSize) => {
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  return {
    list: data.slice(start, end),
    total: data.length
  }
} 