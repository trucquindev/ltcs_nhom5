export const mapOder = (originalArray, orderArray, key) => {
  if (!originalArray || !orderArray || !key) return []
  return [...originalArray].sort((a, b) => (orderArray.indexOf(a[key]))- (orderArray.indexOf(b[key])))
}