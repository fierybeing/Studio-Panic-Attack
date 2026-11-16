// Verifies every image/video key in content.js exists in the media manifest and on disk.
const fs=require('fs'),path=require('path'); const site=process.argv[2];
global.window={}; require(path.join(site,'assets/js/media.js')); require(path.join(site,'assets/js/content.js'));
const M=window.SPA_MEDIA, C=window.SPA_CONTENT; let bad=0, n=0;
const used=new Set();
function walk(o,k){ if(typeof o==='string'){ if(/^(ev|gd|3d|imt|prod|typo|ai|da|mkt|ux|hol|photo|proj|exp|hl|vocab|about|contact|logo|fig)\/[a-z0-9-]+$/.test(o)){ n++; used.add(o); const i=M.images[o]; if(!i){bad++;console.log('MISSING image',o);} else { const f=path.join(site,'media',(i.src||o)+'.webp'); if(!fs.existsSync(f)||!fs.existsSync(f.replace(/\.webp$/,'.t.webp'))){bad++;console.log('NO FILE',f);} } } else if(k==='video'){ n++; if(!M.videos[o]||!fs.existsSync(path.join(site,'media/video',o+'.mp4'))){bad++;console.log('MISSING video',o);} } }
 else if(Array.isArray(o)) o.forEach(x=>walk(x,k)); else if(o&&typeof o==='object') for(const key in o) walk(o[key],key); }
walk(C,''); console.log('checked',n,'refs; problems:',bad);
const unused=Object.keys(M.images).filter(k=>!used.has(k)&&!M.images[k].src&&!/^(logo|about|contact|fig)\//.test(k)); console.log('unused originals:',unused.length, unused.join(' '));
