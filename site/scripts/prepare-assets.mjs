import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const source=path.resolve('../assets/earth_ecologically_restored_package');
await mkdir('public/assets/earth',{recursive:true});
for (const [name,file] of Object.entries({day:'earth_day.jpg',normal:'earth_normal.jpg',roughness:'earth_roughness.jpg',clouds:'earth_cloud_opacity.png'})) {
  for(const mobile of [false,true]) {
    await sharp(path.join(source,file)).resize(mobile?1024:2048).webp({quality:name==='normal'?90:88,alphaQuality:90}).toFile(`public/assets/earth/${name}${mobile?'-mobile':''}.webp`);
  }
}
await sharp('../assets/space.png').resize(1536).webp({quality:75}).toFile('public/assets/space.webp');
console.log('Optimized Earth texture sets and space environment generated.');
