function formatProxyUrl(proxyUrl) {
  // Split the original proxy URL
  const [host, port, username, password] = proxyUrl.split(":");
  // Remove any whitespace from the password
  const cleanedPassword = password.replace(/\s+/g, "");
  // Construct the new proxy URL
  return `http://${username}:${cleanedPassword}@${host}:${port}`;
}

module.exports = { formatProxyUrl };
