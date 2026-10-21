import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const PROJECT_ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
export const DIST_DIR = path.join(PROJECT_ROOT, 'dist')
export const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html')
export const DATA_DIR = path.join(PROJECT_ROOT, 'data')
