const fs = require("fs");
const raw = require("../src/data.json"); // adjust path if needed

const statuses = ["Active", "Pending", "Closed", "Cancelled"];

function randomDate() {
  const start = new Date(2021, 0, 1);
  const end = new Date(2024, 11, 31);
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString().split("T")[0];
}

const cleaned = raw.users.map(u => ({
  id: u.id,
  name: `${u.firstName} ${u.lastName}`,
  date: randomDate(),
  status: statuses[Math.floor(Math.random() * statuses.length)],
  amount: Math.floor(Math.random() * 2000) + 100
}));

fs.writeFileSync("src/data.json", JSON.stringify(cleaned, null, 2));
console.log("✅ Fixed src/data.json with", cleaned.length, "rows");
