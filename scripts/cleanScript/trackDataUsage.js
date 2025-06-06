async function trackDataUsage(page) {
  let totalDataSent = 0;
  let totalDataReceived = 0;

  // Track requests
  page.on("request", (request) => {
    const postData = request.postData() || "";
    const postDataSize = Buffer.byteLength(postData);
    totalDataSent += postDataSize;
  });

  // Track responses
  page.on("response", async (response) => {
    try {
      const responseBuffer = await response.buffer();
      totalDataReceived += responseBuffer.length;
    } catch (error) {
      // console.error("Error in tracking response size:", error);
    }
  });

  // This function allows retrieval of the tracked data in megabytes
  return async function getDataUsage() {
    const totalDataSentMB = totalDataSent / 1048576; // Convert to megabytes
    const totalDataReceivedMB = totalDataReceived / 1048576; // Convert to megabytes

    // Return the sum in megabytes
    return {
      totalDataSentMB: totalDataSentMB.toFixed(2), // Rounding to 2 decimal places
      totalDataReceivedMB: totalDataReceivedMB.toFixed(2), // Rounding to 2 decimal places
      totalDataUsedMB: (totalDataSentMB + totalDataReceivedMB).toFixed(2), // Sum in MB
    };
  };
}
module.exports = { trackDataUsage };
