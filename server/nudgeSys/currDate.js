const currentDate = new Date();
const isoString = currentDate.toISOString(); // e.g., "2024-08-01T02:10:00.000Z"
const formattedDate = isoString.replace("Z", "+00:00");

console.log(`Current Date: ${formattedDate}`); // Outputs something like "2024-08-01T02:10:00.000+00:00"

// Add 30 seconds to the current date
const futureDate30 = new Date(currentDate.getTime() + 180 * 1000);
const futureIsoString30 = futureDate30.toISOString(); // e.g., "2024-08-01T02:10:30.000Z"
const futureFormattedDate30 = futureIsoString30.replace("Z", "+00:00");

console.log(`180 Seconds from Now: ${futureFormattedDate30}`); // Outputs something like "2024-08-01T02:10:30.000+00:00"

// Add 1 minute (60 seconds) to the current date
const futureDate1Minute = new Date(currentDate.getTime() + 240 * 1000);
const futureIsoString1Minute = futureDate1Minute.toISOString(); // e.g., "2024-08-01T02:11:00.000Z"
const futureFormattedDate1Minute = futureIsoString1Minute.replace(
  "Z",
  "+00:00"
);

console.log(`240 secs from Now: ${futureFormattedDate1Minute}`); // Outputs something like "2024-08-01T02:11:00.000+00:00"
