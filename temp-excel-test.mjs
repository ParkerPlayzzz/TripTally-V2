import { promises as fs } from 'fs';
import path from 'path';
import { parseExcelActivities } from './src/lib/excel-import.js';
const filePath = path.resolve('C:/Users/Parker Lidgren/Downloads/Test Document.xlsx');
const buffer = await fs.readFile(filePath);
const file = {
  name: 'Test Document.xlsx',
  arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
};
const activities = await parseExcelActivities(file);
console.log('parsed count:', activities.length);
console.log(JSON.stringify(activities, null, 2));
