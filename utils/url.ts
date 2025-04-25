export const isUrlValid = (candidate: string | undefined): candidate is string => {
  if (!candidate) return false

  try {
    new URL(candidate)
    return true
  } catch (error) {
    return false
  }
}