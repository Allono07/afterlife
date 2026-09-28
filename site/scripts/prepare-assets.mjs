import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('..');
await mkdir('public/assets/earth-v2',{recursive:true});
for(const name of ['day','clouds','night']) for(const mobile of [false,true]) {
  const source=path.join(root,'assets/earth_photographic',`${name}.jpg`);
  await sharp(source).resize(mobile?1536:4096).webp({quality:name==='clouds'?94:90}).toFile(`public/assets/earth-v2/${name}${mobile?'-mobile':''}.webp`);
}
const character=await sharp(path.join(root,'assets/boy-cinematic.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const {data:rgba,info}=character;
const pixelCount=info.width*info.height;
const nearest=new Int32Array(pixelCount);
nearest.fill(-1);
const queue=new Int32Array(pixelCount);
let tail=0;
for(let i=0;i<pixelCount;i++) if(rgba[i*4+3]>=245){nearest[i]=i;queue[tail++]=i;}
for(let head=0;head<tail;head++){
  const current=queue[head],x=current%info.width,y=(current/info.width)|0;
  const source=nearest[current];
  for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){
    if(!dx&&!dy)continue;
    const nx=x+dx,ny=y+dy;
    if(nx<0||nx>=info.width||ny<0||ny>=info.height)continue;
    const next=ny*info.width+nx;
    if(nearest[next]!==-1)continue;
    nearest[next]=source;queue[tail++]=next;
  }
}
for(let i=0;i<pixelCount;i++) if(rgba[i*4+3]<245){
  const source=nearest[i]*4,target=i*4;
  rgba[target]=rgba[source];rgba[target+1]=rgba[source+1];rgba[target+2]=rgba[source+2];
}
const cleanCharacter=sharp(rgba,{raw:info});
await cleanCharacter.clone().resize(1254).webp({quality:93,alphaQuality:100}).toFile('public/assets/boy-cinematic.webp');
await cleanCharacter.clone().resize(768).webp({quality:89,alphaQuality:100}).toFile('public/assets/boy-cinematic-mobile.webp');
for(const name of ['diffuse','normal','arm']) for(const mobile of [false,true]) {
  const source=path.join(root,'assets/moon_material',`${name}.jpg`);
  await sharp(source).resize(mobile?1024:2048).webp({quality:name==='normal'?95:88}).toFile(`public/assets/lunar/${name}${mobile?'-mobile':''}.webp`);
}
for(const mobile of [false,true]) {
  await sharp(path.join(root,'assets/moon_material/lunar-albedo.webp')).linear(1.2,-25).sharpen({sigma:.7,m1:.8,m2:1.35}).resize(mobile?1024:2048).webp({quality:93}).toFile(`public/assets/lunar/albedo${mobile?'-mobile':''}.webp`);
}
console.log('Generated compressed Earth, lunar and character textures.');
