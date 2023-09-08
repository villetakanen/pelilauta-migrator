import { FieldValue, getFirestore } from "firebase-admin/firestore";

type SiteData = {
  name: string
  description: string
  systemBadge: string
  system: string
  hidden: true
  // pageCategories: PageCategory[]
  // players: string[]
  // posterURL
  // avatarURL
  // links: SiteLink[]
  // license: string
  lovesCount: number
  homepage: string
  // protected _sortOrder: string = Site.SORT_BY_NAME
  // tags: string[]
  customPageKeys: boolean
  createdAt: FieldValue
  updatedAt: FieldValue
  flowTime: FieldValue
  owners: string[]
}

export async function initSite(siteName: string, ownerUids: string[], force = false) {
  // Check if the site exists, abort if it does
  const db = getFirestore()

  const siteDoc = await db.collection('sites').doc(siteName).get()
  if (siteDoc.exists && !force) {
    throw new Error(`Site ${siteName} already exists, aborting initSite`)
  } else if (siteDoc.exists && force) {
    console.warn(`Site ${siteName} already exists, overwriting it by force`)
  }

  // Create the site
  const siteData: SiteData = {
    name: siteName,
    description: 'This site has been created by the pelilauta-migrator.',
    systemBadge: 'homebrew',
    system: 'homebrew',
    hidden: true,
    // pageCategories: PageCategory[]
    // players: string[]
    // posterURL
    // avatarURL
    // links: SiteLink[]
    // license: string
    lovesCount: 0,
    homepage: '',
    // protected _sortOrder: string = Site.SORT_BY_NAME
    // tags: string[]
    customPageKeys: false,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    flowTime: FieldValue.serverTimestamp(),
    owners: ownerUids
  }

  await db.collection('sites').doc(siteName).set(siteData)

  console.log(`Created site ${siteName}`)
}