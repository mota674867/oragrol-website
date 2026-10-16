import test from 'node:test';
// Explicit Node command: do not add Node tests to the site's Playwright discovery glob.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizeSearchText,isPublicSearchHref,validateSearchIndex,searchPublicDocuments} from '../app/lib/site-search.mjs';

const documents=validateSearchIndex(JSON.parse(await readFile(new URL('../public/site-search-index.json',import.meta.url),'utf8')));
test('full public index has distinct page, resource, service and BA destinations',()=>{
  assert.ok(documents.length>80);assert.equal(new Set(documents.map(d=>d.href)).size,documents.length);
  for(const href of ['/','/or-one','/business-automation','/services','/faq','/company','/contact','/privacy-policy','/terms-of-use','/accessibility','/careers','/talent','/partnerships'])assert.ok(documents.some(d=>d.href===href),href);
  assert.ok(documents.some(d=>d.href.startsWith('/resources/')));assert.ok(documents.some(d=>d.href.startsWith('/services/')));assert.ok(documents.some(d=>d.href.startsWith('/business-automation/')));
});
test('case, punctuation and accents normalize without AI',()=>{
  assert.equal(normalizeSearchText('Café — CYBER-security'),'cafe cyber security');
  assert.deepEqual(searchPublicDocuments(documents,'mfa').map(d=>d.href),searchPublicDocuments(documents,'MFA').map(d=>d.href));
});
test('OR ONE, automation and service body information are searchable',()=>{
  assert.ok(searchPublicDocuments(documents,'OR ONE').some(d=>d.href==='/or-one'));
  assert.ok(searchPublicDocuments(documents,'automation').some(d=>d.href==='/business-automation'));
  assert.ok(searchPublicDocuments(documents,'DMARC').length>0);
});
test('article body is searched, not just its title',()=>{
  const bodyOnly=[{href:'/resources/example',title:'Example article',category:'Resource article',text:'Backups should be tested using a recovery exercise.'}];
  assert.equal(searchPublicDocuments(bodyOnly,'recovery exercise')[0].href,'/resources/example');
});
test('multiple keywords must all match and title matches rank first',()=>{
  const data=[{href:'/first',title:'MFA',category:'Page',text:'Authentication'},{href:'/second',title:'Other',category:'Page',text:'MFA and ransomware'}];
  assert.equal(searchPublicDocuments(data,'MFA')[0].href,'/first');assert.equal(searchPublicDocuments(data,'MFA ransomware').length,1);
});
test('empty, short and unknown queries have honest empty results',()=>{
  for(const query of ['', ' ', 'x','definitelynotapublicwebsiteword987654'])assert.equal(searchPublicDocuments(documents,query).length,0);
});
test('index rejects private routes, external URLs and duplicate entries',()=>{
  for(const href of ['/api/chat','/dashboard/client','/internal/ocs','/admin','/login','//evil.invalid','https://evil.invalid','/style-guide','/resources/../admin','/%61pi']){
    assert.equal(isPublicSearchHref(href),false,href);
    assert.throws(()=>validateSearchIndex({version:1,documents:[{href,title:'Private',text:'private',category:'Page'}]}));
  }
  assert.throws(()=>validateSearchIndex({version:1,documents:[documents[0],documents[0]]}));
});
test('query input is treated as literal text, never markup or a regular expression',async()=>{
  assert.doesNotThrow(()=>searchPublicDocuments(documents,'<script>alert(1)</script> [.*]'));
  const source=await readFile(new URL('../app/components/site/public-site-search.tsx',import.meta.url),'utf8');
  assert.doesNotMatch(source,/dangerouslySetInnerHTML|eval\(|\/api\/(?:chat|search)|localStorage|sessionStorage/);
  assert.match(source,/credentials: 'omit'/);
});
test('index contains no API paths, secrets or chat configuration',()=>{
  const text=JSON.stringify(documents);
  assert.doesNotMatch(text,/sb_secret_|BEGIN PRIVATE KEY|RESEND_API_KEY|BREVO_API_KEY|OCS_DATABASE_URL|\/api\/chat/);
  assert.ok(documents.every(d=>isPublicSearchHref(d.href)));
});
test('OR ONE rejects substring accidents and ranks its own public page first',()=>{
  assert.equal(searchPublicDocuments([{href:'/contact',title:'Contact',text:'For phone support.',category:'Page'}],'OR ONE').length,0);
  assert.equal(searchPublicDocuments(documents,'OR ONE')[0].href,'/or-one');
});
test('normalized accent matches retain the original readable excerpt',()=>{
  const data=[{href:'/cafe',title:'Locations',category:'Page',text:'Introductory context. '.repeat(40)+'Visit our Café for details and support.'}];
  assert.match(searchPublicDocuments(data,'cafe')[0].snippet,/Café/);
});
test('intentional excerpts exclude implementation and transient interface literals',()=>{
  const article=documents.find(document=>document.href==='/resources/when-automations-become-or-one');
  assert.match(article.text,/^Several disconnected automations/);
  assert.doesNotMatch(JSON.stringify(documents),/prefers-reduced-motion|Your PDF is taking longer/);
});
