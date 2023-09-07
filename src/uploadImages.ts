import fs from 'fs-extra';
import { getStorage } from 'firebase-admin/storage';
import { Timestamp, getFirestore, FieldValue } from 'firebase-admin/firestore'

const IMAGE_ENDINGS = [
  '.jpg', 
  '.jpeg', 
  '.png',
  '.webp'
];

type AssetData = {
  url: string
  descrption: string
  license: string
  site: string
  mimetype: string
  storagePath: string
  createdAt: FieldValue
  updatedAt: FieldValue
  flowTime: FieldValue
  owners: string[]
  name: string
}

export async function uploadImages(siteKey: string, owners: string[]) {
  console.log(`Uploading images for ${siteKey}`)

  const urlconversionMap = new Map<string, string>()

  // Get all files from the site directory
  const imagePaths = fs.readdirSync(`./import/${siteKey}`)

  // Filter out non-image files
  const imageFiles = imagePaths.filter((path) => {
    const lower = path.toLowerCase()
    return IMAGE_ENDINGS.some((ending) => lower.endsWith(ending))
  })
  
  // Upload each image to the site's image directory
  const bucket = getStorage().bucket()

  // Loop images, add them to the bucket, and create a firestore asset entry for each
  for (const imageFile of imageFiles) {
    console.log(`Uploading ${imageFile}`)
    const imagePath = `./import/${siteKey}/${imageFile}`
    const image = fs.readFileSync(imagePath)

    const imageRef = bucket.file(`sites/${siteKey}/${imageFile}`)
    await imageRef.save(image)
    await imageRef.makePublic()
    const url = await imageRef.getSignedUrl({
      action: 'read',
      expires: '01-01-2100'
    })

    console.log(`Uploaded ${imageFile} to ${imageRef.metadata.id} - ${JSON.stringify(imageRef.metadata)}`)

    const db = getFirestore()

    const asset:AssetData = {
      url: url[0],
      descrption: 'This image was imported by the pelilauta-migrator, you might want to add a licence or description for it.',
      license: '',
      site: siteKey,
      name: imageFile,
      mimetype: imageRef.metadata.contentType,
      storagePath: imageRef.metadata.id,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      flowTime: FieldValue.serverTimestamp(),
      owners: owners
    }

    await db.collection('assets').add(asset)

    urlconversionMap.set(imagePath, url[0])
  }

  return urlconversionMap
}