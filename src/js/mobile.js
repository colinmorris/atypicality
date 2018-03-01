
function isMobile() {
  let bp = 600;
  // NB: Make sure this is in sync with the query used in css
  return window.matchMedia("(max-width: " + bp + "px)").matches
}

export {isMobile};
