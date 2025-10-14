export function elementMethods() {
  const first = (selector, root = document) => root.querySelector(selector);
  return { first };
}
