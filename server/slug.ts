import { randomBytes } from 'node:crypto'

import { findFormBySlug } from './storage'

const SLUG_BYTES = 6

function generateRandomSlug(): string {
  return randomBytes(SLUG_BYTES).toString('base64url')
}

export function generateUniqueSlug(): string {
  let slug = generateRandomSlug()

  while (findFormBySlug(slug)) {
    slug = generateRandomSlug()
  }
  
  return slug
}
