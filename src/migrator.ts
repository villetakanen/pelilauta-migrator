import fs from 'fs-extra';
import { toMekanismiURI } from './toMekanismiURI.js';
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { uploadImages } from './uploadImages.js';

const importDir = './import';
const initialOwnerUid = 'YN8dQz3H8OMsb0L4jImAlROPQpo1'

function initFirebase() {
  initializeApp({
    credential: applicationDefault(),
    databaseURL: 'https://<DATABASE_NAME>.firebaseio.com',
    storageBucket: 'skaldbase.appspot.com',
});  
}

export function migrate(siteName: string, ownerUid: string = initialOwnerUid) {
  initFirebase();

  const siteKey = toMekanismiURI(siteName);
  console.log(`Migrating ${siteName} as ${siteKey}`);

  const siteDir = `${importDir}/${siteKey}`;
 
  // Count the files to be imported
  const files = fs.readdirSync(siteDir);
  console.log(`Found ${files.length} files to import`);

  // Create the site
  
  // Upload images
  uploadImages(siteKey, [ownerUid]);
}