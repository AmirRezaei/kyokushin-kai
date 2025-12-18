
import { convertLegacyData } from '../src/data/repo/legacy_converter';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

console.log('Converting legacy data...');
try {
    const { store, curriculum } = convertLegacyData();

    const outputPath = resolve(__dirname, '../src/data/repo/catalog.json');
    console.log(`Writing to ${outputPath}...`);

    writeFileSync(outputPath, JSON.stringify({ store, curriculum }, null, 2));
    console.log('Done.');
} catch (e) {
    console.error('Error converting data:', e);
}
