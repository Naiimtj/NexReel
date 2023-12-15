const { plex } = require("../controllers");
const cron = require('node-cron');

function scheduleTasks() {
    // Schedule homework for 4:00 AM every day.
    cron.schedule('0 4 * * *', async () => {
      try {
        await plex.create();
        console.log("Data successfully downloaded at 4:00 AM.");
      } catch (error) {
        console.error("Error downloading data:", error);
      }
    });
  }
  
  module.exports = { scheduleTasks };
  