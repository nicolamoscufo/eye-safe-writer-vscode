import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
test('canonical repository metadata',()=>{assert.equal(pkg.repository.url,'https://github.com/nicolamoscufo/eye-safe-writer-vscode.git');});
test('16 unique variants are contributed',()=>{const a=pkg.contributes.themes;assert.equal(a.length,16);assert.equal(new Set(a.map(x=>x.label)).size,16);assert.equal(new Set(a.map(x=>x.path)).size,16);});
test('all variants are well-formed VS Code themes',async()=>{
 for(const item of pkg.contributes.themes){
  const v=JSON.parse(await readFile(new URL('../'+item.path.replace(/^\.\//,''),import.meta.url),'utf8'));
  assert.ok(v.name);assert.equal(v.type,item.uiTheme==='vs'?'light':'dark');
  assert.ok(Object.keys(v.colors).length>=150);
  assert.ok(v.tokenColors.length>=20);
  assert.ok(Object.keys(v.semanticTokenColors).length>=10);
  assert.ok(/^#[a-f\d]{6}$/i.test(v.colors['editor.foreground']));
 }
});

test('editor foreground/background satisfy WCAG AA in all 16 variants', async () => {
 const lum=h=>{
  const c=h.slice(1).match(/.{2}/g).map(x=>parseInt(x,16)/255)
   .map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);
  return .2126*c[0]+.7152*c[1]+.0722*c[2];
 };
 const pairs=new Set();
 for(const x of pkg.contributes.themes){
  const theme=JSON.parse(await readFile(new URL('../'+x.path.replace(/^\.\//,''),import.meta.url),'utf8'));
  const fg=theme.colors['editor.foreground'], bg=theme.colors['editor.background'];
  const a=lum(fg),b=lum(bg);
  assert.ok((Math.max(a,b)+0.05)/(Math.min(a,b)+0.05)>=4.5,theme.name+' failed AA');
  pairs.add(fg+':'+bg);
 }
 assert.equal(pairs.size,16,'Palette generation must not duplicate Salvia colors');
});
