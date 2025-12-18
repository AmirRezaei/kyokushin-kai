
import { CatalogJsonSchema } from '../src/data/model/validation';
import catalog from '../src/data/repo/catalog.json';

console.log('Validating catalog.json...');

const result = CatalogJsonSchema.safeParse(catalog);

if (!result.success) {
    console.error('❌ Catalog validation failed!');
    const formatted = result.error.format();
    console.error(JSON.stringify(formatted, null, 2));
    // result.error.errors.forEach((err: any) => {
    //     console.error(`Status: ${err.message} | Path: ${err.path.join('.')} | Code: ${err.code}`);
    // });
    process.exit(1);
} else {
    console.log('✅ Catalog validation passed!');
    process.exit(0);
}
