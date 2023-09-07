import fs from 'fs-extra';
import { toMekanismiURI } from './toMekanismiURI';
import { initializeApp, applicationDefault } from 'firebase-admin/app';

const importDir = './import';
const initialOwnerUid = 'aaa'

function initFirebase() {
  initializeApp({
    credential: applicationDefault(),
    databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
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
}