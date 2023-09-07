import fs from 'fs-extra';
import { Asset } from '@11thdeg/skaldstore';


const IMAGE_ENDINGS = [
  '.jpg', 
  '.jpeg', 
  '.png',
  'webp'
];

export function uploadImages(siteKey: string) {
  console.log(`Uploading images for ${siteKey}`)

  // Get all files from the site directory
  const imagePaths = fs.readdirSync(`./import/${siteKey}`)

  // Filter out non-image files
  const imageFiles = imagePaths.filter((path) => {
    const lower = path.toLowerCase()
    return IMAGE_ENDINGS.some((ending) => lower.endsWith(ending))
  })
  
  // Upload each image to the site's image directory

}