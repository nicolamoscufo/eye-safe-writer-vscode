import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
const at=args.indexOf('--css');
const obsidian=at>=0?resolve(args[at+1]):resolve(root,'../eye-safe-writer/theme.css');
const source=await readFile(obsidian,'utf8');
const baseLight=JSON.parse(await readFile(resolve(root,'src/templates/light.json'),'utf8'));
const baseDark=JSON.parse(await readFile(resolve(root,'src/templates/dark.json'),'utf8'));
const generateThemes=function generateThemes(source,baseLight,baseDark){
 const variants=[["salvia","","Salvia"],["gruvbox","gruvbox","Gruvbox"],["amoled","amoled","AMOLED"],["tokyo","tokyo-night","Tokyo Night"],["rosepine","rose-pine","Rose Pine"],["solarized","solarized","Solarized"],["nord","nord","Nord"],["cappuccino","cappuccino","Cappuccino"]];
 function tokens(mode,variant){
  const selector=".theme-"+mode+(variant==="salvia"?"":".eye-safe-palette-"+variant);
  const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  const match=source.match(new RegExp(escaped+"\\s*\\{([\\s\\S]*?)\\n\\}"));
  if(!match)throw Error("Missing palette selector "+selector);
  const obj=Object.fromEntries([...match[1].matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(m=>[m[1],m[2].trim()]));
  if(Object.keys(obj).length<50)throw Error("Missing palette tokens for "+selector);
  return obj;
 }
 function rgb(v){
  if(/^#[0-9a-f]{6}$/i.test(v))return v.toLowerCase();
  if(typeof v==="string" && /^rgba?\(/i.test(v)){
   const values=v.match(/[0-9]+/g);
   if(values?.length>=3)return "#"+values.slice(0,3).map(x=>Number(x).toString(16).padStart(2,"0")).join("");
  }
  return null;
 }
 const outputs={};
 for(const [name,slug,label] of variants){
  for(const mode of ["light","dark"]){
   const base=mode==="light"?baseLight:baseDark;
   const src=tokens(mode,"salvia"),dest=tokens(mode,name);
   const remap=new Map();
   for(const [k,v] of Object.entries(src)){
    const a=rgb(v),b=rgb(dest[k]||"");
    if(a&&b&&!remap.has(a))remap.set(a,b);
   }
   function replaceColors(v){
    if(typeof v==="string")return v.replace(/#[0-9a-f]{6}(?:[0-9a-f]{2})?/gi,c=>{const m=remap.get(c.slice(0,7).toLowerCase());return m?m+c.slice(7):c;});
    if(Array.isArray(v))return v.map(replaceColors);
    if(v&&typeof v==="object")return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,replaceColors(x)]));
    return v;
   }
   const theme=replaceColors(base);
   theme.name="Eye Safe Writer "+(name==="salvia"?"":label+" ")+(mode==="light"?"Light":"Dark");
   theme.type=mode;
   const path="themes/eye-safe-writer"+(slug?"-"+slug:"")+"-"+mode+"-color-theme.json";
   if(theme.colors["editor.background"]===base.colors["editor.background"] && name!=="salvia")throw Error("Palette did not recolor editor: "+path);
   outputs[path]=JSON.stringify(theme,null,2)+"\n";
  }
 }
 return outputs;
};
const outputs=generateThemes(source,baseLight,baseDark);
for(const [relative,content] of Object.entries(outputs)){
 const file=resolve(root,relative);
 if(args.includes('--check')){
  const existing=await readFile(file,'utf8');
  if(content!==existing){console.error('Outdated '+relative);process.exitCode=1;}
 }else{await mkdir(dirname(file),{recursive:true});await writeFile(file,content);}
}
console.log((args.includes('--check')?'Checked ':'Generated ')+Object.keys(outputs).length+' palettes using '+obsidian);
