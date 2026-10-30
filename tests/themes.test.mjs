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
