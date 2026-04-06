import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const serverEntry = join(__dirname, '..', 'dist', 'adri-portfolio-front', 'server', 'server.mjs');

const { reqHandler } = await import(serverEntry);

export default reqHandler;
