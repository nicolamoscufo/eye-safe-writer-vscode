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
 const variants=[["salvia","", "Salvia"],["gruvbox","gruvbox","Gruvbox"],["amoled","amoled","AMOLED"],["tokyo","tokyo-night","Tokyo Night"],["rosepine","rose-pine","Rose Pine"],["solarized","solarized","Solarized"],["nord","nord","Nord"],["cappuccino","cappuccino","Cappuccino"]];
 function tokens(mode,variant){
  const sel=".theme-"+mode+(variant==="salvia"?"":".eye-safe-palette-"+variant);
  const esc=sel.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  const match=source.match(new RegExp(esc+"\\s*\\{([\\s\\S]*?)\\n\\}"));
  if(!match)throw Error("Missing CSS selector: "+sel);
  return Object.fromEntries([...match[1].matchAll(/(--[\\w-]+):\\s*([^;]+);/g)].map(m=>[m[1],m[2].trim()]));
 }
 function rgb(v){
  if(/^#[a-f\\d]{6}$/i.test(v))return v.toLowerCase();
  const m=v.match(/^rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)(?:\\s*,\\s*[\\d.]+)?\\s*\\)$/i);
  if(m)return "#"+m.slice(1,4).map(x=>Number(x).toString(16).padStart(2,"0")).join("");
  return null;
 }
 const outputs={};
 for(const [cssName,slug,label] of variants){
  for(const mode of ["light","dark"]){
   const original=mode==="light"?baseLight:baseDark;
   const originalColors=tokens(mode,"salvia"),desired=tokens(mode,cssName);
   const paletteMap=new Map();
   for(const [name,old] of Object.entries(originalColors)){
    const a=rgb(old),b=rgb(desired[name]||"");
    if(a&&b&&!paletteMap.has(a))paletteMap.set(a,b);
   }
   // Remap the leading RGB in both #RRGGBB and #RRGGBBAA strings, retaining opacity.
   function recolor(v){
    if(typeof v==="string")return v.replace(/#[a-f\\d]{6}(?:[a-f\\d]{2})?/gi,color=>{const mapped=paletteMap.get(color.slice(0,7).toLowerCase());return mapped?mapped+color.slice(7):color;});
    if(Array.isArray(v))return v.map(recolor);
    if(v&&typeof v==="object")return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,recolor(x)]));
    return v;
   }
   const theme=recolor(original);
   theme.name="Eye Safe Writer "+(cssName==="salvia"?"":label+" ")+(mode==="light"?"Light":"Dark");
   theme.type=mode;
   const filename="themes/eye-safe-writer"+(slug?"-"+slug:"")+"-"+mode+"-color-theme.json";
   outputs[filename]=JSON.stringify(theme,null,2)+"\\n".replace("\\n","\n");
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
