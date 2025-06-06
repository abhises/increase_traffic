function waitForTimeout(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

module.exports = { waitForTimeout };
