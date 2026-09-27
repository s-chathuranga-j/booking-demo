import catalog from '../shared/catalog.json'
import type { Extra, Package, Room } from './types'

export const rooms = catalog.rooms satisfies Room[]
export const packages = catalog.packages satisfies Package[]
export const extras = catalog.extras satisfies Extra[]
export const memberDiscount = catalog.memberDiscount
