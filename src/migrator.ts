import fs from 'fs-extra';
import { toMekanismiURI } from './toMekanismiURI.js';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { uploadImages } from './uploadImages.js';
import { initSite } from './initSite.js';
import { importPages } from './importPages.js';

const importDir = './import';
const initialOwnerUid = 'YN8dQz3H8OMsb0L4jImAlROPQpo1'

function initFirebase() {
  initializeApp({
    credential: applicationDefault(),
    databaseURL: 'https://<DATABASE_NAME>.firebaseio.com',
    storageBucket: 'skaldbase.appspot.com',
});  
}

export async function migrate(siteName: string, ownerUid: string = initialOwnerUid, forceSiteOverwrite = false) {
  initFirebase();

  const siteKey = toMekanismiURI(siteName);
  console.log(`Migrating ${siteName} as ${siteKey}`);

  const siteDir = `${importDir}/${siteKey}`;
 
  // Count the files to be imported
  const files = fs.readdirSync(siteDir);
  console.log(`Found ${files.length} files to import`);

  // Create the site
  await initSite(siteKey, [ownerUid], forceSiteOverwrite);
  
  // Upload images
  const urlconversionMap = await uploadImages(siteKey, [ownerUid]);

  console.log('URL conversion map:' + JSON.stringify(Object.fromEntries(urlconversionMap)));

  // Import pages
  await importPages(siteKey, [ownerUid], urlconversionMap);

  console.log('Done!');
}