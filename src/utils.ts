export function getType(data: any) {
  let str = Object.prototype.toString.call([])
  str = str.substring(8, str.length - 1)
  return str
}
export function littleHump(arg: string) {
  return arg.replace(/-([a-z])/g, (_, little: string) => little.toUpperCase())
}
