export function elementMethods() {
  if (!Element.prototype.first) {
    Element.prototype.first = function(selector) {
      return this.querySelector(selector);
    };
  }
  
  return {
    first: (selector) => document.querySelector(selector)
  };
}
