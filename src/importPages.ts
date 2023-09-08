import fs from 'fs-extra';
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

type PageData = {
    createdAt: FieldValue
    updatedAt: FieldValue
    flowTime: FieldValue
    owners: string[]
    parentKey: string
    name: string
    markdownContent: string
    htmlContent: string
    category: string
    sortWeight: number
    tags: string[]
}

export async function importPages(siteKey: string, owners: string[], urlconversionMap: Map<string, string>) {
  // Get all .md files from the site directory
  const pagePaths = fs.readdirSync(`./import/${siteKey}`)

  // Filter out non-markdown files
  const pageFiles = pagePaths.filter((path) => path.toLowerCase().endsWith('.md'))

  // Loop pages, add them to the bucket, and create a firestore page entry for each
  for (const pageFile of pageFiles) {
    // Convert image urls
    const pagePath = `./import/${siteKey}/${pageFile}`
    const page = fs.readFileSync(pagePath, 'utf-8')
    const newPage = page.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
      const newUrl = urlconversionMap.get(url)
      if (newUrl) {
        return `![${alt}](${newUrl})`
      } else {
        return match
      }
    })

    //Convert local links
    const newPage2 = newPage.replace(/\[(.*?)\]\((.*?)\)/g, (match, text, url) => {
      if (url.startsWith('http')) {
        return match
      }
      const newUrl = url.replace(/\.md/g, '')
      return `[${text}](/sites/${siteKey}/pages/${newUrl})`
    })

    const pageKey = pageFile.substring(0, pageFile.length - 3)

    // Create the page
    const pageData: PageData = {
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      flowTime: FieldValue.serverTimestamp(),
      owners: owners,
      parentKey: siteKey,
      name: pageKey,
      markdownContent: newPage2,
      htmlContent: '',
      category: '',
      sortWeight: 0,
      tags: []
    }

    const db = getFirestore()
    const pageDoc = await db.collection('sites').doc(siteKey).collection('pages').doc(pageKey).set(pageData)

    // If this page was the site's homepage, set it as such
    if (pageFile === 'index.md') {
        await db.collection('sites').doc(siteKey).update({ homepage: pageKey })
    }

    /* Add the page to the site's index
    const siteDoc = await db.collection('sites').doc(siteKey).get()
    const siteData = siteDoc.data()
    const sitePages = siteData?.pages || []
    sitePages.push(pageDoc.id)
    await db.collection('sites').doc(siteKey).update({ pages: sitePages }) */

    console.log(`Imported ${pageFile}`)
  }
}