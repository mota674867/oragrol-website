import { createRequire } from 'node:module';
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { isPublicSearchHref, validateSearchIndex } from '../app/lib/site-search.mjs';

const root = path.resolve(process.argv[2] ?? process.cwd());
const require = createRequire(path.join(root, 'package.json'));
const ts = require(process.env.SEARCH_TYPESCRIPT_PATH ?? 'typescript');
const app = path.join(root, 'app');
const documents = [];
const sources = new Map();
const publicWords = new Set(['title','text','name','heading','description','answer','question','q','a','questions','answers','summary','body','content','subtitle','label','blurb','items','value','detail','desc','copy','benefits','deliverables','problem','what_we_do','process','outcome','note','quote','bullets','paragraph','paragraphs','caption','lead','intro','tagline','seoTitle','seoDescription','code','price','unit','topic','industry','nextAction','why','how','what','solution','highlights','features']);
const ignored = /(?:^|[\/])(?:api|internal|dashboard|admin|auth|login|sign-in|style-guide|_development-preview|node_modules|\.git)(?:[\/]|$)/i;

function clean(value) {
  return String(value).replace(/<[^>]*>/g, ' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&#39;/g,"'").replace(/&quot;/g,'"')
    .replace(/[*#`]/g, '').replace(/\s+/g,' ').trim();
}
function publicFile(file) {
  const relative = path.relative(app,file);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative) && !ignored.test(relative) && /\.(?:tsx?|json)$/.test(relative) &&
    !/(?:ChatWidget|site-chrome|site-header|site-footer|footer|pre-footer-cta|nav-items|oragrol-mega-nav|public-site-search|header-search|submit-|site-config|route\.)/i.test(relative);
}
function load(file) {
  const text = readFileSync(file,'utf8');
  sources.set(path.relative(root,file).replaceAll('\\','/'),createHash('sha256').update(text).digest('hex'));
  return text;
}
function literal(node) {
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node)) return literal(node.expression);
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.filter(ts.isPropertyAssignment).map(property => [property.name.getText().replace(/^['"]|['"]$/g,''),literal(property.initializer)]));
  return undefined;
}
function stringValues(value, key='') {
  if (typeof value==='string') return (!key || publicWords.has(key)) ? [value] : [];
  if (Array.isArray(value)) return value.flatMap(item=>stringValues(item,key));
  if (value && typeof value==='object') return Object.entries(value).flatMap(([name,item])=>stringValues(item,name));
  return [];
}
function graph(file, seen=new Set()) {
  file=path.resolve(file);
  if (seen.has(file) || !publicFile(file)) return [];
  seen.add(file);
  const text=load(file);
  if(file.endsWith('.json')) return stringValues(JSON.parse(text));
  const source=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const collected=[];
  function contentKey(node) {
    let current=node.parent;
    while(current&&(ts.isArrayLiteralExpression(current)||ts.isAsExpression(current)||ts.isSatisfiesExpression(current)||ts.isParenthesizedExpression(current)))current=current.parent;
    if(current&&ts.isPropertyAssignment(current))return current.name.getText(source).replace(/^['"]|['"]$/g,'');
    if(current&&ts.isVariableDeclaration(current))return current.name.getText(source);
    return '';
  }
  function visit(node) {
    if(ts.isJsxAttribute(node)&&!['alt','title','placeholder'].includes(node.name.getText(source)))return;
    if(ts.isJsxElement(node)&&['script','style'].includes(node.openingElement.tagName.getText(source)))return;
    if(ts.isVariableDeclaration(node)&&node.name.getText(source)==='metadata')return;
    if(ts.isJsxText(node)) collected.push(node.text);
    if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node)) {
      const parent=node.parent;
      if(!ts.isImportDeclaration(parent) && !ts.isExportDeclaration(parent) && !ts.isJsxAttribute(parent) &&
         !(ts.isPropertyAssignment(parent)&&parent.name===node) &&
         (ts.isJsxExpression(parent) || publicWords.has(contentKey(node)))) collected.push(node.text);
    }
    if(ts.isImportDeclaration(node)&&ts.isStringLiteral(node.moduleSpecifier)) {
      const reference=node.moduleSpecifier.text;
      if(reference.startsWith('.')||reference.startsWith('@/app/')) {
        const target=reference.startsWith('@/')?path.resolve(root,reference.slice(2)):path.resolve(path.dirname(file),reference);
        const resolved=[target,target+'.tsx',target+'.ts',target+'.json',path.join(target,'index.tsx'),path.join(target,'index.ts')].find(candidate=>existsSync(candidate)&&publicFile(candidate));
        if(resolved) collected.push(...graph(resolved,seen));
      }
    }
    ts.forEachChild(node,visit);
  }
  visit(source);
  return collected;
}
function metadata(file) {
  const source=ts.createSourceFile(file,load(file),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  let result={};
  function visit(node) { if(ts.isVariableDeclaration(node)&&node.name.getText(source)==='metadata') result=literal(node.initializer)??{};ts.forEachChild(node,visit); }
  visit(source);return result;
}
function add(href,title,text,category) {
  if(!isPublicSearchHref(href))throw new Error('Non-public route refused');
  const content=[...new Set(text.map(clean).filter(Boolean))].join(' ').slice(0,150_000);
  if(!content)throw new Error(`No searchable public content: ${href}`);
  documents.push({href,title:clean(title).slice(0,300),text:content,category});
}
// The site wraps pages in app/[locale]/ (English is the default; the index is English only).
// That folder is transparent for URLs. The [...rest] catch-all is not a page and is skipped.
const stripLocale=(r)=>r.split('/').filter(p=>p!=='[locale]').join('/');
function walk(directory) {
  for(const entry of readdirSync(directory,{withFileTypes:true})){
    if(entry.isDirectory()&&entry.name==='[locale]'){ walk(path.join(directory,entry.name)); continue; }
    if(entry.isDirectory()&&entry.name.startsWith('[...')) continue;
    if(entry.isDirectory()&&entry.name.startsWith('[')){
      const route=stripLocale('/'+path.relative(app,path.join(directory,entry.name)).replaceAll('\\','/'));
      if(!['/services/[code]','/business-automation/[code]','/resources/[slug]'].includes(route))throw new Error(`New dynamic route needs a public-content extractor: ${route}`);
    }
    if(entry.isDirectory()&&!entry.name.startsWith('[')&&!entry.name.startsWith('_')&&!entry.name.startsWith('.')&&!ignored.test(entry.name)) walk(path.join(directory,entry.name));
    if(entry.isFile()&&entry.name==='page.tsx'){
      const file=path.join(directory,entry.name);
      const relative=path.relative(app,directory).split(path.sep).filter(part=>part&&part!=='[locale]'&&!part.startsWith('(')).join('/');
      const href='/'+relative;
      if(!isPublicSearchHref(href))continue;
      const meta=metadata(file);
      if(meta.robots?.index===false)continue;
      const title=typeof meta.title==='string'?meta.title:meta.title?.absolute??(relative?relative.replaceAll('-',' ').replace(/\b\w/g,c=>c.toUpperCase()):'ORAGROL Global');
      add(href,title,[meta.description??'',...graph(file)],'Website page');
    }
  }
}
walk(app);

// Follow the site's actual data-driven public detail route sources, never execute them.
const servicesFile=path.join(app,'data/oragrol-services-data.json');
const serviceData=JSON.parse(load(servicesFile));
for(const [field,route] of [['services_tier1','/services'],['business_automation_tier2','/business-automation']]){
  if(!Array.isArray(serviceData[field]))throw new Error('Service catalogue shape changed; review generator');
  for(const category of serviceData[field])for(const service of category.services){
    if(!/^[A-Z][0-9]{2}-S[0-9]{2}$/.test(service.code))throw new Error('Service code invalid');
    add(`${route}/${service.code.toLowerCase()}`,service.name,[service.blurb,service.problem,service.what_we_do,...service.deliverables,...service.benefits,service.process,service.outcome,category.name,service.code,service.price,service.unit],route==='/services'?'Cybersecurity service':'Business Automation');
  }
}
const articleFile=path.join(app,'[locale]/resources/[slug]/ORAGROL_ResourceArticles.ts');
const articleSource=ts.createSourceFile(articleFile,load(articleFile),ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
let articles;
function visitArticles(node){if(ts.isVariableDeclaration(node)&&node.name.getText(articleSource)==='RESOURCE_ARTICLES')articles=literal(node.initializer);ts.forEachChild(node,visitArticles);}
visitArticles(articleSource);
if(!Array.isArray(articles))throw new Error('Article catalogue shape changed; review generator');
for(const article of articles){
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug))throw new Error('Article slug invalid');
  add('/resources/'+article.slug,article.title,[article.summary,article.body,article.topic,article.industry,article.nextAction,article.primaryCta?.label??''],'Resource article');
}
documents.sort((a,b)=>a.href.localeCompare(b.href));
const index={version:1,documents};
validateSearchIndex(index);
const output=path.join(root,'public/site-search-index.json');
mkdirSync(path.dirname(output),{recursive:true});writeFileSync(output,JSON.stringify(index)+'\n');
const manifest={version:1,documentCount:documents.length,pageCount:documents.filter(d=>d.category==='Website page').length,articleCount:articles.length,
  serviceCount:documents.filter(d=>d.category==='Cybersecurity service').length,automationCount:documents.filter(d=>d.category==='Business Automation').length,
  excluded:'API, dashboard, internal/admin/auth, style guide, chat, secrets/configuration, user input and external destinations',sources:Object.fromEntries([...sources].sort())};
const manifestOutput=path.join(root,'scripts/site-search-source-manifest.json');
mkdirSync(path.dirname(manifestOutput),{recursive:true});writeFileSync(manifestOutput,JSON.stringify(manifest,null,2)+'\n');
console.log(`Public search index: ${manifest.documentCount} destinations (${manifest.pageCount} pages, ${manifest.articleCount} articles, ${manifest.serviceCount} services, ${manifest.automationCount} automation details).`);
