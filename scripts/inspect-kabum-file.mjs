import fs from 'fs';

const filePath = 'C:\\Users\\user\\Desktop\\PRODUTOS APENAS KABUM';
const content = fs.readFileSync(filePath, 'utf8');

console.log("File size:", content.length);
console.log("First 800 chars:\n", content.slice(0, 800));

try {
  const json = JSON.parse(content);
  console.log("\nIs valid JSON! Array length or keys:", Array.isArray(json) ? `Array with ${json.length} items` : Object.keys(json));
  if (Array.isArray(json) && json.length > 0) {
    console.log("\nSample Item 0:\n", JSON.stringify(json[0], null, 2));
    console.log("\nSample Item 1:\n", JSON.stringify(json[1], null, 2));
  }
} catch (err) {
  console.log("\nNot a single JSON:", err.message);
  // Check lines
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  console.log("Lines count:", lines.length);
  console.log("Sample Line 0:", lines[0]);
  console.log("Sample Line 1:", lines[1]);
}
