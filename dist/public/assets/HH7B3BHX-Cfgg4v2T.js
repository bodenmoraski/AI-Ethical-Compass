import{c as be,a as R,o as Mt,b as B,d as M,e as y,P as Oo,S as z,t as _,i as k,f as N,g as I,h as vs,j as rr,u as xe,k as U,s as Gn,m as Hn,l as ut,n as A,p as bs,q as Mn,r as Ke,v as xs,w as Ot,x as _t,y as ws,z as $s,A as bn,F as Cs,B as Rr,C as Rt,$ as Fo,D as Ss,E as ks,G as j,H as zr,I as Es,J as Ms,K as or,L as Ts,M as As,N as Rn,O as Is,Q as Ds,R as Z,T as Ps,U as Ls,V as Os}from"./index-OJXxNvUt.js";var Fs=e=>e!=null,qs=e=>e.filter(Fs);function _s(e){return(...t)=>{for(const n of e)n&&n(...t)}}var E=e=>typeof e=="function"&&!e.length?e():e,Vn=e=>Array.isArray(e)?e:e?[e]:[];function Rs(e,...t){return typeof e=="function"?e(...t):e}var zs=U;function Ks(e,t,n,r){const o=e.length,s=t.length;let a=0;if(!s){for(;a<o;a++)n(e[a]);return}if(!o){for(;a<s;a++)r(t[a]);return}for(;a<s&&t[a]===e[a];a++);let l,i;t=t.slice(a),e=e.slice(a);for(l of t)e.includes(l)||r(l);for(i of e)t.includes(i)||n(i)}function Bs(e){const[t,n]=R(),r=e?.throw?(f,h)=>{throw n(f instanceof Error?f:new Error(h)),f}:(f,h)=>{n(f instanceof Error?f:new Error(h))},o=e?.api?Array.isArray(e.api)?e.api:[e.api]:[globalThis.localStorage].filter(Boolean),s=e?.prefix?`${e.prefix}.`:"",a=new Map,l=new Proxy({},{get(f,h){let g=a.get(h);g||(g=R(void 0,{equals:!1}),a.set(h,g)),g[0]();const p=o.reduce((m,v)=>{if(m!==null||!v)return m;try{return v.getItem(`${s}${h}`)}catch(b){return r(b,`Error reading ${s}${h} from ${v.name}`),null}},null);return p!==null&&e?.deserializer?e.deserializer(p,h,e.options):p}}),i=(f,h,g)=>{const p=e?.serializer?e.serializer(h,f,g??e.options):h,m=`${s}${f}`;o.forEach(b=>{try{b.getItem(m)!==p&&b.setItem(m,p)}catch(x){r(x,`Error setting ${s}${f} to ${p} in ${b.name}`)}});const v=a.get(f);v&&v[1]()},c=f=>o.forEach(h=>{try{h.removeItem(`${s}${f}`)}catch(g){r(g,`Error removing ${s}${f} from ${h.name}`)}}),d=()=>o.forEach(f=>{try{f.clear()}catch(h){r(h,`Error clearing ${f.name}`)}}),u=()=>{const f={},h=(g,p)=>{if(!f.hasOwnProperty(g)){const m=p&&e?.deserializer?e.deserializer(p,g,e.options):p;m&&(f[g]=m)}};return o.forEach(g=>{if(typeof g.getAll=="function"){let p;try{p=g.getAll()}catch(m){r(m,`Error getting all values from in ${g.name}`)}for(const m of p)h(m,p[m])}else{let p=0,m;try{for(;m=g.key(p++);)f.hasOwnProperty(m)||h(m,g.getItem(m))}catch(v){r(v,`Error getting all values from ${g.name}`)}}}),f};return e?.sync!==!1&&Mt(()=>{const f=h=>{let g=!1;o.forEach(p=>{try{p!==h.storageArea&&h.key&&h.newValue!==p.getItem(h.key)&&(h.newValue?p.setItem(h.key,h.newValue):p.removeItem(h.key),g=!0)}catch(m){r(m,`Error synching api ${p.name} from storage event (${h.key}=${h.newValue})`)}}),g&&h.key&&a.get(h.key)?.[1]()};"addEventListener"in globalThis?(globalThis.addEventListener("storage",f),U(()=>globalThis.removeEventListener("storage",f))):(o.forEach(h=>h.addEventListener?.("storage",f)),U(()=>o.forEach(h=>h.removeEventListener?.("storage",f))))}),[l,i,{clear:d,error:t,remove:c,toJSON:u}]}var Ns=Bs,Us=e=>(typeof e.clear=="function"||(e.clear=()=>{let t;for(;t=e.key(0);)e.removeItem(t)}),e),Kr=e=>{if(!e)return"";let t="";for(const n in e){if(!e.hasOwnProperty(n))continue;const r=e[n];t+=r instanceof Date?`; ${n}=${r.toUTCString()}`:typeof r=="boolean"?`; ${n}`:`; ${n}=${r}`}return t},Fe=Us({_cookies:[globalThis.document,"cookie"],getItem:e=>Fe._cookies[0][Fe._cookies[1]].match("(^|;)\\s*"+e+"\\s*=\\s*([^;]+)")?.pop()??null,setItem:(e,t,n)=>{const r=Fe.getItem(e);Fe._cookies[0][Fe._cookies[1]]=`${e}=${t}${Kr(n)}`;const o=Object.assign(new Event("storage"),{key:e,oldValue:r,newValue:t,url:globalThis.document.URL,storageArea:Fe});window.dispatchEvent(o)},removeItem:e=>{Fe._cookies[0][Fe._cookies[1]]=`${e}=deleted${Kr({expires:new Date(0)})}`},key:e=>{let t=null,n=0;return Fe._cookies[0][Fe._cookies[1]].replace(/(?:^|;)\s*(.+?)\s*=\s*[^;]+/g,(r,o)=>(!t&&o&&n++===e&&(t=o),"")),t},get length(){let e=0;return Fe._cookies[0][Fe._cookies[1]].replace(/(?:^|;)\s*.+?\s*=\s*[^;]+/g,t=>(e+=t?1:0,"")),e}}),Gs=1024,Kt=796,qo=700,Hs="bottom-right",jn="bottom",Vs="system",js=!1,_o=500,Ws=500,Ro=500,Qs=Object.keys(Gn)[0],Br=1,Ys=Object.keys(Hn)[0],zo=be({client:void 0,onlineManager:void 0,queryFlavor:"",version:"",shadowDOMTarget:void 0});function K(){return xe(zo)}var Ko=be(void 0),Xs=e=>{const[t,n]=R(null),r=()=>{const a=t();a!=null&&(a.close(),n(null))},o=(a,l)=>{if(t()!=null)return;const i=window.open("","TSQD-Devtools-Panel",`width=${a},height=${l},popup`);if(!i)throw new Error("Failed to open popup. Please allow popups for this site to view the devtools in picture-in-picture mode.");i.document.head.innerHTML="",i.document.body.innerHTML="",vs(i.document),i.document.title="TanStack Query Devtools",i.document.body.style.margin="0",i.addEventListener("pagehide",()=>{e.setLocalStore("pip_open","false"),n(null)}),[...(K().shadowDOMTarget||document).styleSheets].forEach(c=>{try{const d=[...c.cssRules].map(g=>g.cssText).join(""),u=document.createElement("style"),f=c.ownerNode;let h="";f&&"id"in f&&(h=f.id),h&&u.setAttribute("id",h),u.textContent=d,i.document.head.appendChild(u)}catch{const u=document.createElement("link");if(c.href==null)return;u.rel="stylesheet",u.type=c.type,u.media=c.media.toString(),u.href=c.href,i.document.head.appendChild(u)}}),rr(["focusin","focusout","pointermove","keydown","pointerdown","pointerup","click","mousedown","input"],i.document),e.setLocalStore("pip_open","true"),n(i)};B(()=>{(e.localStore.pip_open??"false")==="true"&&!e.disabled&&o(Number(window.innerWidth),Number(e.localStore.height||Ws))}),B(()=>{const a=(K().shadowDOMTarget||document).querySelector("#_goober"),l=t();if(a&&l){const i=new MutationObserver(()=>{const c=(K().shadowDOMTarget||l.document).querySelector("#_goober");c&&(c.textContent=a.textContent)});i.observe(a,{childList:!0,subtree:!0,characterDataOldValue:!0}),U(()=>{i.disconnect()})}});const s=M(()=>({pipWindow:t(),requestPipWindow:o,closePipWindow:r,disabled:e.disabled??!1}));return y(Ko.Provider,{value:s,get children(){return e.children}})},ir=()=>M(()=>{const t=xe(Ko);if(!t)throw new Error("usePiPWindow must be used within a PiPProvider");return t()}),Bo=be(()=>"dark");function we(){return xe(Bo)}var No={À:"A",Á:"A",Â:"A",Ã:"A",Ä:"A",Å:"A",Ấ:"A",Ắ:"A",Ẳ:"A",Ẵ:"A",Ặ:"A",Æ:"AE",Ầ:"A",Ằ:"A",Ȃ:"A",Ç:"C",Ḉ:"C",È:"E",É:"E",Ê:"E",Ë:"E",Ế:"E",Ḗ:"E",Ề:"E",Ḕ:"E",Ḝ:"E",Ȇ:"E",Ì:"I",Í:"I",Î:"I",Ï:"I",Ḯ:"I",Ȋ:"I",Ð:"D",Ñ:"N",Ò:"O",Ó:"O",Ô:"O",Õ:"O",Ö:"O",Ø:"O",Ố:"O",Ṍ:"O",Ṓ:"O",Ȏ:"O",Ù:"U",Ú:"U",Û:"U",Ü:"U",Ý:"Y",à:"a",á:"a",â:"a",ã:"a",ä:"a",å:"a",ấ:"a",ắ:"a",ẳ:"a",ẵ:"a",ặ:"a",æ:"ae",ầ:"a",ằ:"a",ȃ:"a",ç:"c",ḉ:"c",è:"e",é:"e",ê:"e",ë:"e",ế:"e",ḗ:"e",ề:"e",ḕ:"e",ḝ:"e",ȇ:"e",ì:"i",í:"i",î:"i",ï:"i",ḯ:"i",ȋ:"i",ð:"d",ñ:"n",ò:"o",ó:"o",ô:"o",õ:"o",ö:"o",ø:"o",ố:"o",ṍ:"o",ṓ:"o",ȏ:"o",ù:"u",ú:"u",û:"u",ü:"u",ý:"y",ÿ:"y",Ā:"A",ā:"a",Ă:"A",ă:"a",Ą:"A",ą:"a",Ć:"C",ć:"c",Ĉ:"C",ĉ:"c",Ċ:"C",ċ:"c",Č:"C",č:"c",C̆:"C",c̆:"c",Ď:"D",ď:"d",Đ:"D",đ:"d",Ē:"E",ē:"e",Ĕ:"E",ĕ:"e",Ė:"E",ė:"e",Ę:"E",ę:"e",Ě:"E",ě:"e",Ĝ:"G",Ǵ:"G",ĝ:"g",ǵ:"g",Ğ:"G",ğ:"g",Ġ:"G",ġ:"g",Ģ:"G",ģ:"g",Ĥ:"H",ĥ:"h",Ħ:"H",ħ:"h",Ḫ:"H",ḫ:"h",Ĩ:"I",ĩ:"i",Ī:"I",ī:"i",Ĭ:"I",ĭ:"i",Į:"I",į:"i",İ:"I",ı:"i",Ĳ:"IJ",ĳ:"ij",Ĵ:"J",ĵ:"j",Ķ:"K",ķ:"k",Ḱ:"K",ḱ:"k",K̆:"K",k̆:"k",Ĺ:"L",ĺ:"l",Ļ:"L",ļ:"l",Ľ:"L",ľ:"l",Ŀ:"L",ŀ:"l",Ł:"l",ł:"l",Ḿ:"M",ḿ:"m",M̆:"M",m̆:"m",Ń:"N",ń:"n",Ņ:"N",ņ:"n",Ň:"N",ň:"n",ŉ:"n",N̆:"N",n̆:"n",Ō:"O",ō:"o",Ŏ:"O",ŏ:"o",Ő:"O",ő:"o",Œ:"OE",œ:"oe",P̆:"P",p̆:"p",Ŕ:"R",ŕ:"r",Ŗ:"R",ŗ:"r",Ř:"R",ř:"r",R̆:"R",r̆:"r",Ȓ:"R",ȓ:"r",Ś:"S",ś:"s",Ŝ:"S",ŝ:"s",Ş:"S",Ș:"S",ș:"s",ş:"s",Š:"S",š:"s",Ţ:"T",ţ:"t",ț:"t",Ț:"T",Ť:"T",ť:"t",Ŧ:"T",ŧ:"t",T̆:"T",t̆:"t",Ũ:"U",ũ:"u",Ū:"U",ū:"u",Ŭ:"U",ŭ:"u",Ů:"U",ů:"u",Ű:"U",ű:"u",Ų:"U",ų:"u",Ȗ:"U",ȗ:"u",V̆:"V",v̆:"v",Ŵ:"W",ŵ:"w",Ẃ:"W",ẃ:"w",X̆:"X",x̆:"x",Ŷ:"Y",ŷ:"y",Ÿ:"Y",Y̆:"Y",y̆:"y",Ź:"Z",ź:"z",Ż:"Z",ż:"z",Ž:"Z",ž:"z",ſ:"s",ƒ:"f",Ơ:"O",ơ:"o",Ư:"U",ư:"u",Ǎ:"A",ǎ:"a",Ǐ:"I",ǐ:"i",Ǒ:"O",ǒ:"o",Ǔ:"U",ǔ:"u",Ǖ:"U",ǖ:"u",Ǘ:"U",ǘ:"u",Ǚ:"U",ǚ:"u",Ǜ:"U",ǜ:"u",Ứ:"U",ứ:"u",Ṹ:"U",ṹ:"u",Ǻ:"A",ǻ:"a",Ǽ:"AE",ǽ:"ae",Ǿ:"O",ǿ:"o",Þ:"TH",þ:"th",Ṕ:"P",ṕ:"p",Ṥ:"S",ṥ:"s",X́:"X",x́:"x",Ѓ:"Г",ѓ:"г",Ќ:"К",ќ:"к",A̋:"A",a̋:"a",E̋:"E",e̋:"e",I̋:"I",i̋:"i",Ǹ:"N",ǹ:"n",Ồ:"O",ồ:"o",Ṑ:"O",ṑ:"o",Ừ:"U",ừ:"u",Ẁ:"W",ẁ:"w",Ỳ:"Y",ỳ:"y",Ȁ:"A",ȁ:"a",Ȅ:"E",ȅ:"e",Ȉ:"I",ȉ:"i",Ȍ:"O",ȍ:"o",Ȑ:"R",ȑ:"r",Ȕ:"U",ȕ:"u",B̌:"B",b̌:"b",Č̣:"C",č̣:"c",Ê̌:"E",ê̌:"e",F̌:"F",f̌:"f",Ǧ:"G",ǧ:"g",Ȟ:"H",ȟ:"h",J̌:"J",ǰ:"j",Ǩ:"K",ǩ:"k",M̌:"M",m̌:"m",P̌:"P",p̌:"p",Q̌:"Q",q̌:"q",Ř̩:"R",ř̩:"r",Ṧ:"S",ṧ:"s",V̌:"V",v̌:"v",W̌:"W",w̌:"w",X̌:"X",x̌:"x",Y̌:"Y",y̌:"y",A̧:"A",a̧:"a",B̧:"B",b̧:"b",Ḑ:"D",ḑ:"d",Ȩ:"E",ȩ:"e",Ɛ̧:"E",ɛ̧:"e",Ḩ:"H",ḩ:"h",I̧:"I",i̧:"i",Ɨ̧:"I",ɨ̧:"i",M̧:"M",m̧:"m",O̧:"O",o̧:"o",Q̧:"Q",q̧:"q",U̧:"U",u̧:"u",X̧:"X",x̧:"x",Z̧:"Z",z̧:"z"},Zs=Object.keys(No).join("|"),Js=new RegExp(Zs,"g");function ea(e){return e.replace(Js,t=>No[t])}var Ae={CASE_SENSITIVE_EQUAL:7,EQUAL:6,STARTS_WITH:5,WORD_STARTS_WITH:4,CONTAINS:3,ACRONYM:2,MATCHES:1,NO_MATCH:0};function Nr(e,t,n){var r;if(n=n||{},n.threshold=(r=n.threshold)!=null?r:Ae.MATCHES,!n.accessors){const a=Ur(e,t,n);return{rankedValue:e,rank:a,accessorIndex:-1,accessorThreshold:n.threshold,passed:a>=n.threshold}}const o=oa(e,n.accessors),s={rankedValue:e,rank:Ae.NO_MATCH,accessorIndex:-1,accessorThreshold:n.threshold,passed:!1};for(let a=0;a<o.length;a++){const l=o[a];let i=Ur(l.itemValue,t,n);const{minRanking:c,maxRanking:d,threshold:u=n.threshold}=l.attributes;i<c&&i>=Ae.MATCHES?i=c:i>d&&(i=d),i=Math.min(i,d),i>=u&&i>s.rank&&(s.rank=i,s.passed=!0,s.accessorIndex=a,s.accessorThreshold=u,s.rankedValue=l.itemValue)}return s}function Ur(e,t,n){return e=Gr(e,n),t=Gr(t,n),t.length>e.length?Ae.NO_MATCH:e===t?Ae.CASE_SENSITIVE_EQUAL:(e=e.toLowerCase(),t=t.toLowerCase(),e===t?Ae.EQUAL:e.startsWith(t)?Ae.STARTS_WITH:e.includes(` ${t}`)?Ae.WORD_STARTS_WITH:e.includes(t)?Ae.CONTAINS:t.length===1?Ae.NO_MATCH:ta(e).includes(t)?Ae.ACRONYM:na(e,t))}function ta(e){let t="";return e.split(" ").forEach(r=>{r.split("-").forEach(s=>{t+=s.substr(0,1)})}),t}function na(e,t){let n=0,r=0;function o(i,c,d){for(let u=d,f=c.length;u<f;u++)if(c[u]===i)return n+=1,u+1;return-1}function s(i){const c=1/i,d=n/t.length;return Ae.MATCHES+d*c}const a=o(t[0],e,0);if(a<0)return Ae.NO_MATCH;r=a;for(let i=1,c=t.length;i<c;i++){const d=t[i];if(r=o(d,e,r),!(r>-1))return Ae.NO_MATCH}const l=r-a;return s(l)}function Gr(e,t){let{keepDiacritics:n}=t;return e=`${e}`,n||(e=ea(e)),e}function ra(e,t){let n=t;typeof t=="object"&&(n=t.accessor);const r=n(e);return r==null?[]:Array.isArray(r)?r:[String(r)]}function oa(e,t){const n=[];for(let r=0,o=t.length;r<o;r++){const s=t[r],a=ia(s),l=ra(e,s);for(let i=0,c=l.length;i<c;i++)n.push({itemValue:l[i],attributes:a})}return n}var Hr={maxRanking:1/0,minRanking:-1/0};function ia(e){return typeof e=="function"?Hr:{...Hr,...e}}var sa={data:""},aa=e=>typeof window=="object"?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||sa,la=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,ca=/\/\*[^]*?\*\/|  +/g,Vr=/\n+/g,Et=(e,t)=>{let n="",r="",o="";for(let s in e){let a=e[s];s[0]=="@"?s[1]=="i"?n=s+" "+a+";":r+=s[1]=="f"?Et(a,s):s+"{"+Et(a,s[1]=="k"?"":t)+"}":typeof a=="object"?r+=Et(a,t?t.replace(/([^,])+/g,l=>s.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,i=>/&/.test(i)?i.replace(/&/g,l):l?l+" "+i:i)):s):a!=null&&(s=/^--/.test(s)?s:s.replace(/[A-Z]/g,"-$&").toLowerCase(),o+=Et.p?Et.p(s,a):s+":"+a+";")}return n+(t&&o?t+"{"+o+"}":o)+r},st={},Uo=e=>{if(typeof e=="object"){let t="";for(let n in e)t+=n+Uo(e[n]);return t}return e},ua=(e,t,n,r,o)=>{let s=Uo(e),a=st[s]||(st[s]=(i=>{let c=0,d=11;for(;c<i.length;)d=101*d+i.charCodeAt(c++)>>>0;return"go"+d})(s));if(!st[a]){let i=s!==e?e:(c=>{let d,u,f=[{}];for(;d=la.exec(c.replace(ca,""));)d[4]?f.shift():d[3]?(u=d[3].replace(Vr," ").trim(),f.unshift(f[0][u]=f[0][u]||{})):f[0][d[1]]=d[2].replace(Vr," ").trim();return f[0]})(e);st[a]=Et(o?{["@keyframes "+a]:i}:i,n?"":"."+a)}let l=n&&st.g?st.g:null;return n&&(st.g=st[a]),((i,c,d,u)=>{u?c.data=c.data.replace(u,i):c.data.indexOf(i)===-1&&(c.data=d?i+c.data:c.data+i)})(st[a],t,r,l),a},da=(e,t,n)=>e.reduce((r,o,s)=>{let a=t[s];if(a&&a.call){let l=a(n),i=l&&l.props&&l.props.className||/^go/.test(l)&&l;a=i?"."+i:l&&typeof l=="object"?l.props?"":Et(l,""):l===!1?"":l}return r+o+(a??"")},"");function W(e){let t=this||{},n=e.call?e(t.p):e;return ua(n.unshift?n.raw?da(n,[].slice.call(arguments,1),t.p):n.reduce((r,o)=>Object.assign(r,o&&o.call?o(t.p):o),{}):n,aa(t.target),t.g,t.o,t.k)}W.bind({g:1});W.bind({k:1});function Go(e){var t,n,r="";if(typeof e=="string"||typeof e=="number")r+=e;else if(typeof e=="object")if(Array.isArray(e)){var o=e.length;for(t=0;t<o;t++)e[t]&&(n=Go(e[t]))&&(r&&(r+=" "),r+=n)}else for(n in e)e[n]&&(r&&(r+=" "),r+=n);return r}function q(){for(var e,t,n=0,r="",o=arguments.length;n<o;n++)(e=arguments[n])&&(t=Go(e))&&(r&&(r+=" "),r+=t);return r}function fa(e,t){const n=Rt(e),{onChange:r}=t;let o=new Set(t.appear?void 0:n);const s=new WeakSet,[a,l]=R([],{equals:!1}),[i]=Ss(),c=u=>{l(f=>(f.push.apply(f,u),f));for(const f of u)s.delete(f)},d=(u,f,h)=>u.splice(h,0,f);return M(u=>{const f=a(),h=e();if(h[Fo],Rt(i))return i(),u;if(f.length){const g=u.filter(p=>!f.includes(p));return f.length=0,r({list:g,added:[],removed:[],unchanged:g,finishRemoved:c}),g}return Rt(()=>{const g=new Set(h),p=h.slice(),m=[],v=[],b=[];for(const w of h)(o.has(w)?b:m).push(w);let x=!m.length;for(let w=0;w<u.length;w++){const $=u[w];g.has($)||(s.has($)||(v.push($),s.add($)),d(p,$,w)),x&&$!==p[w]&&(x=!1)}return!v.length&&x?u:(r({list:p,added:m,removed:v,unchanged:b,finishRemoved:c}),o=g,p)})},t.appear?[]:n.slice())}function Me(...e){return _s(e)}var jr=e=>e instanceof Element;function Wn(e,t){if(t(e))return e;if(typeof e=="function"&&!e.length)return Wn(e(),t);if(Array.isArray(e)){const n=[];for(const r of e){const o=Wn(r,t);o&&(Array.isArray(o)?n.push.apply(n,o):n.push(o))}return n.length?n:null}return null}function ga(e,t=jr,n=jr){const r=M(e),o=M(()=>Wn(r(),t));return o.toArray=()=>{const s=o();return Array.isArray(s)?s:s?[s]:[]},o}function ha(e){return M(()=>{const t=e.name||"s";return{enterActive:(e.enterActiveClass||t+"-enter-active").split(" "),enter:(e.enterClass||t+"-enter").split(" "),enterTo:(e.enterToClass||t+"-enter-to").split(" "),exitActive:(e.exitActiveClass||t+"-exit-active").split(" "),exit:(e.exitClass||t+"-exit").split(" "),exitTo:(e.exitToClass||t+"-exit-to").split(" "),move:(e.moveClass||t+"-move").split(" ")}})}function Ho(e){requestAnimationFrame(()=>requestAnimationFrame(e))}function ya(e,t,n,r){const{onBeforeEnter:o,onEnter:s,onAfterEnter:a}=t;o?.(n),n.classList.add(...e.enter),n.classList.add(...e.enterActive),queueMicrotask(()=>{if(!n.parentNode)return r?.();s?.(n,()=>l())}),Ho(()=>{n.classList.remove(...e.enter),n.classList.add(...e.enterTo),(!s||s.length<2)&&(n.addEventListener("transitionend",l),n.addEventListener("animationend",l))});function l(i){(!i||i.target===n)&&(n.removeEventListener("transitionend",l),n.removeEventListener("animationend",l),n.classList.remove(...e.enterActive),n.classList.remove(...e.enterTo),a?.(n))}}function pa(e,t,n,r){const{onBeforeExit:o,onExit:s,onAfterExit:a}=t;if(!n.parentNode)return r?.();o?.(n),n.classList.add(...e.exit),n.classList.add(...e.exitActive),s?.(n,()=>l()),Ho(()=>{n.classList.remove(...e.exit),n.classList.add(...e.exitTo),(!s||s.length<2)&&(n.addEventListener("transitionend",l),n.addEventListener("animationend",l))});function l(i){(!i||i.target===n)&&(r?.(),n.removeEventListener("transitionend",l),n.removeEventListener("animationend",l),n.classList.remove(...e.exitActive),n.classList.remove(...e.exitTo),a?.(n))}}var Wr=e=>{const t=ha(e);return fa(ga(()=>e.children).toArray,{appear:e.appear,onChange({added:n,removed:r,finishRemoved:o,list:s}){const a=t();for(const i of n)ya(a,e,i);const l=[];for(const i of s)i.isConnected&&(i instanceof HTMLElement||i instanceof SVGElement)&&l.push({el:i,rect:i.getBoundingClientRect()});queueMicrotask(()=>{const i=[];for(const{el:c,rect:d}of l)if(c.isConnected){const u=c.getBoundingClientRect(),f=d.left-u.left,h=d.top-u.top;(f||h)&&(c.style.transform=`translate(${f}px, ${h}px)`,c.style.transitionDuration="0s",i.push(c))}document.body.offsetHeight;for(const c of i){let d=function(u){(u.target===c||/transform$/.test(u.propertyName))&&(c.removeEventListener("transitionend",d),c.classList.remove(...a.move))};c.classList.add(...a.move),c.style.transform=c.style.transitionDuration="",c.addEventListener("transitionend",d)}});for(const i of r)pa(a,e,i,()=>o([i]))}})},zn=Symbol("fallback");function Qr(e){for(const t of e)t.dispose()}function ma(e,t,n,r={}){const o=new Map;return U(()=>Qr(o.values())),()=>{const a=e()||[];return a[Fo],Rt(()=>{if(!a.length)return Qr(o.values()),o.clear(),r.fallback?[zr(u=>(o.set(zn,{dispose:u}),r.fallback()))]:[];const l=new Array(a.length),i=o.get(zn);if(!o.size||i){i?.dispose(),o.delete(zn);for(let d=0;d<a.length;d++){const u=a[d],f=t(u,d);s(l,u,d,f)}return l}const c=new Set(o.keys());for(let d=0;d<a.length;d++){const u=a[d],f=t(u,d);c.delete(f);const h=o.get(f);h?(l[d]=h.mapped,h.setIndex?.(d),h.setItem(()=>u)):s(l,u,d,f)}for(const d of c)o.get(d)?.dispose(),o.delete(d);return l})};function s(a,l,i,c){zr(d=>{const[u,f]=R(l),h={setItem:f,dispose:d};if(n.length>1){const[g,p]=R(i);h.setIndex=p,h.mapped=n(u,g)}else h.mapped=n(u);o.set(c,h),a[i]=h.mapped})}}function xn(e){const{by:t}=e;return M(ma(()=>e.each,typeof t=="function"?t:n=>n[t],e.children,"fallback"in e?{fallback:()=>e.fallback}:void 0))}function va(e,t,n,r){return e.addEventListener(t,n,r),zs(e.removeEventListener.bind(e,t,n,r))}function ba(e,t,n,r){const o=()=>{Vn(E(e)).forEach(s=>{s&&Vn(E(t)).forEach(a=>va(s,a,n,r))})};typeof e=="function"?B(o):N(o)}function xa(e,t){const n=new ResizeObserver(e);return U(n.disconnect.bind(n)),{observe:r=>n.observe(r,t),unobserve:n.unobserve.bind(n)}}function wa(e,t,n){const r=new WeakMap,{observe:o,unobserve:s}=xa(a=>{for(const l of a){const{contentRect:i,target:c}=l,d=Math.round(i.width),u=Math.round(i.height),f=r.get(c);(!f||f.width!==d||f.height!==u)&&(t(i,c,l),r.set(c,{width:d,height:u}))}},n);B(a=>{const l=qs(Vn(E(e)));return Ks(l,a,o,s),l},[])}var $a=/((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g;function Yr(e){const t={};let n;for(;n=$a.exec(e);)t[n[1]]=n[2];return t}function Tn(e,t){if(typeof e=="string"){if(typeof t=="string")return`${e};${t}`;e=Yr(e)}else typeof t=="string"&&(t=Yr(t));return{...e,...t}}function Ca(e,t,n=-1){return n in e?[...e.slice(0,n),t,...e.slice(n)]:[...e,t]}function Qn(e,t){const n=[...e],r=n.indexOf(t);return r!==-1&&n.splice(r,1),n}function Sa(e){return typeof e=="number"}function Ft(e){return Object.prototype.toString.call(e)==="[object String]"}function ka(e){return typeof e=="function"}function ln(e){return t=>`${e()}-${t}`}function Re(e,t){return e?e===t||e.contains(t):!1}function en(e,t=!1){const{activeElement:n}=Xe(e);if(!n?.nodeName)return null;if(Vo(n)&&n.contentDocument)return en(n.contentDocument.body,t);if(t){const r=n.getAttribute("aria-activedescendant");if(r){const o=Xe(n).getElementById(r);if(o)return o}}return n}function Ea(e){return Xe(e).defaultView||window}function Xe(e){return e?e.ownerDocument||e:document}function Vo(e){return e.tagName==="IFRAME"}var sr=(e=>(e.Escape="Escape",e.Enter="Enter",e.Tab="Tab",e.Space=" ",e.ArrowDown="ArrowDown",e.ArrowLeft="ArrowLeft",e.ArrowRight="ArrowRight",e.ArrowUp="ArrowUp",e.End="End",e.Home="Home",e.PageDown="PageDown",e.PageUp="PageUp",e))(sr||{});function ar(e){return typeof window<"u"&&window.navigator!=null?e.test(window.navigator.userAgentData?.platform||window.navigator.platform):!1}function An(){return ar(/^Mac/i)}function Ma(){return ar(/^iPhone/i)}function Ta(){return ar(/^iPad/i)||An()&&navigator.maxTouchPoints>1}function Aa(){return Ma()||Ta()}function Ia(){return An()||Aa()}function ue(e,t){return t&&(ka(t)?t(e):t[0](t[1],e)),e?.defaultPrevented}function ve(e){return t=>{for(const n of e)ue(t,n)}}function Da(e){return An()?e.metaKey&&!e.ctrlKey:e.ctrlKey&&!e.metaKey}function Se(e){if(e)if(Pa())e.focus({preventScroll:!0});else{const t=La(e);e.focus(),Oa(t)}}var pn=null;function Pa(){if(pn==null){pn=!1;try{document.createElement("div").focus({get preventScroll(){return pn=!0,!0}})}catch{}}return pn}function La(e){let t=e.parentNode;const n=[],r=document.scrollingElement||document.documentElement;for(;t instanceof HTMLElement&&t!==r;)(t.offsetHeight<t.scrollHeight||t.offsetWidth<t.scrollWidth)&&n.push({element:t,scrollTop:t.scrollTop,scrollLeft:t.scrollLeft}),t=t.parentNode;return r instanceof HTMLElement&&n.push({element:r,scrollTop:r.scrollTop,scrollLeft:r.scrollLeft}),n}function Oa(e){for(const{element:t,scrollTop:n,scrollLeft:r}of e)t.scrollTop=n,t.scrollLeft=r}var jo=["input:not([type='hidden']):not([disabled])","select:not([disabled])","textarea:not([disabled])","button:not([disabled])","a[href]","area[href]","[tabindex]","iframe","object","embed","audio[controls]","video[controls]","[contenteditable]:not([contenteditable='false'])"],Fa=[...jo,'[tabindex]:not([tabindex="-1"]):not([disabled])'],lr=jo.join(":not([hidden]),")+",[tabindex]:not([disabled]):not([hidden])",qa=Fa.join(':not([hidden]):not([tabindex="-1"]),');function Wo(e,t){const r=Array.from(e.querySelectorAll(lr)).filter(Xr);return t&&Xr(e)&&r.unshift(e),r.forEach((o,s)=>{if(Vo(o)&&o.contentDocument){const a=o.contentDocument.body,l=Wo(a,!1);r.splice(s,1,...l)}}),r}function Xr(e){return Qo(e)&&!_a(e)}function Qo(e){return e.matches(lr)&&cr(e)}function _a(e){return parseInt(e.getAttribute("tabindex")||"0",10)<0}function cr(e,t){return e.nodeName!=="#comment"&&Ra(e)&&za(e,t)&&(!e.parentElement||cr(e.parentElement,e))}function Ra(e){if(!(e instanceof HTMLElement)&&!(e instanceof SVGElement))return!1;const{display:t,visibility:n}=e.style;let r=t!=="none"&&n!=="hidden"&&n!=="collapse";if(r){if(!e.ownerDocument.defaultView)return r;const{getComputedStyle:o}=e.ownerDocument.defaultView,{display:s,visibility:a}=o(e);r=s!=="none"&&a!=="hidden"&&a!=="collapse"}return r}function za(e,t){return!e.hasAttribute("hidden")&&(e.nodeName==="DETAILS"&&t&&t.nodeName!=="SUMMARY"?e.hasAttribute("open"):!0)}function Ka(e,t,n){const r=t?.tabbable?qa:lr,o=document.createTreeWalker(e,NodeFilter.SHOW_ELEMENT,{acceptNode(s){return t?.from?.contains(s)?NodeFilter.FILTER_REJECT:s.matches(r)&&cr(s)&&(!t?.accept||t.accept(s))?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP}});return t?.from&&(o.currentNode=t.from),o}function Zr(e){for(;e&&!Ba(e);)e=e.parentElement;return e||document.scrollingElement||document.documentElement}function Ba(e){const t=window.getComputedStyle(e);return/(auto|scroll)/.test(t.overflow+t.overflowX+t.overflowY)}function Na(){}function Ua(e,t){const[n,r]=e;let o=!1;const s=t.length;for(let a=s,l=0,i=a-1;l<a;i=l++){const[c,d]=t[l],[u,f]=t[i],[,h]=t[i===0?a-1:i-1]||[0,0],g=(d-f)*(n-c)-(c-u)*(r-d);if(f<d){if(r>=f&&r<d){if(g===0)return!0;g>0&&(r===f?r>h&&(o=!o):o=!o)}}else if(d<f){if(r>d&&r<=f){if(g===0)return!0;g<0&&(r===f?r<h&&(o=!o):o=!o)}}else if(r==d&&(n>=u&&n<=c||n>=c&&n<=u))return!0}return o}function Q(e,t){return j(e,t)}var Yt=new Map,Jr=new Set;function eo(){if(typeof window>"u")return;const e=n=>{if(!n.target)return;let r=Yt.get(n.target);r||(r=new Set,Yt.set(n.target,r),n.target.addEventListener("transitioncancel",t)),r.add(n.propertyName)},t=n=>{if(!n.target)return;const r=Yt.get(n.target);if(r&&(r.delete(n.propertyName),r.size===0&&(n.target.removeEventListener("transitioncancel",t),Yt.delete(n.target)),Yt.size===0)){for(const o of Jr)o();Jr.clear()}};document.body.addEventListener("transitionrun",e),document.body.addEventListener("transitionend",t)}typeof document<"u"&&(document.readyState!=="loading"?eo():document.addEventListener("DOMContentLoaded",eo));function Yn(e,t){const n=to(e,t,"left"),r=to(e,t,"top"),o=t.offsetWidth,s=t.offsetHeight;let a=e.scrollLeft,l=e.scrollTop;const i=a+e.offsetWidth,c=l+e.offsetHeight;n<=a?a=n:n+o>i&&(a+=n+o-i),r<=l?l=r:r+s>c&&(l+=r+s-c),e.scrollLeft=a,e.scrollTop=l}function to(e,t,n){const r=n==="left"?"offsetLeft":"offsetTop";let o=0;for(;t.offsetParent&&(o+=t[r],t.offsetParent!==e);){if(t.offsetParent.contains(e)){o-=e[r];break}t=t.offsetParent}return o}function Ga(e,t){if(document.contains(e)){const n=document.scrollingElement||document.documentElement;if(window.getComputedStyle(n).overflow==="hidden"){let o=Zr(e);for(;e&&o&&e!==n&&o!==n;)Yn(o,e),e=o,o=Zr(e)}else{const{left:o,top:s}=e.getBoundingClientRect();e?.scrollIntoView?.({block:"nearest"});const{left:a,top:l}=e.getBoundingClientRect();(Math.abs(o-a)>1||Math.abs(s-l)>1)&&e.scrollIntoView?.({block:"nearest"})}}}var Yo={border:"0",clip:"rect(0 0 0 0)","clip-path":"inset(50%)",height:"1px",margin:"0 -1px -1px 0",overflow:"hidden",padding:"0",position:"absolute",width:"1px","white-space":"nowrap"};function ze(e){return t=>(e(t),()=>e(void 0))}function In(e,t){const[n,r]=R(no(t?.()));return B(()=>{r(e()?.tagName.toLowerCase()||no(t?.()))}),n}function no(e){return Ft(e)?e:void 0}function de(e){const[t,n]=Z(e,["as"]);if(!t.as)throw new Error("[kobalte]: Polymorphic is missing the required `as` prop.");return y(Ps,j(n,{get component(){return t.as}}))}var Ha=["id","name","validationState","required","disabled","readOnly"];function Va(e){const t=`form-control-${Ke()}`,n=Q({id:t},e),[r,o]=R(),[s,a]=R(),[l,i]=R(),[c,d]=R(),u=(p,m,v)=>{const b=v!=null||r()!=null;return[v,r(),b&&m!=null?p:void 0].filter(Boolean).join(" ")||void 0},f=p=>[l(),c(),p].filter(Boolean).join(" ")||void 0,h=M(()=>({"data-valid":E(n.validationState)==="valid"?"":void 0,"data-invalid":E(n.validationState)==="invalid"?"":void 0,"data-required":E(n.required)?"":void 0,"data-disabled":E(n.disabled)?"":void 0,"data-readonly":E(n.readOnly)?"":void 0}));return{formControlContext:{name:()=>E(n.name)??E(n.id),dataset:h,validationState:()=>E(n.validationState),isRequired:()=>E(n.required),isDisabled:()=>E(n.disabled),isReadOnly:()=>E(n.readOnly),labelId:r,fieldId:s,descriptionId:l,errorMessageId:c,getAriaLabelledBy:u,getAriaDescribedBy:f,generateId:ln(()=>E(n.id)),registerLabel:ze(o),registerField:ze(a),registerDescription:ze(i),registerErrorMessage:ze(d)}}}var Xo=be();function cn(){const e=xe(Xo);if(e===void 0)throw new Error("[kobalte]: `useFormControlContext` must be used within a `FormControlContext.Provider` component");return e}function Zo(e){const t=cn(),n=Q({id:t.generateId("description")},e);return B(()=>U(t.registerDescription(n.id))),y(de,j({as:"div"},()=>t.dataset(),n))}function Jo(e){const t=cn(),n=Q({id:t.generateId("error-message")},e),[r,o]=Z(n,["forceMount"]),s=()=>t.validationState()==="invalid";return B(()=>{s()&&U(t.registerErrorMessage(o.id))}),y(z,{get when(){return r.forceMount||s()},get children(){return y(de,j({as:"div"},()=>t.dataset(),o))}})}function ja(e){let t;const n=cn(),r=Q({id:n.generateId("label")},e),[o,s]=Z(r,["ref"]),a=In(()=>t,()=>"label");return B(()=>U(n.registerLabel(s.id))),y(de,j({as:"label",ref(l){const i=Me(c=>t=c,o.ref);typeof i=="function"&&i(l)},get for(){return M(()=>a()==="label")()?n.fieldId():void 0}},()=>n.dataset(),s))}function Wa(e,t){B(ut(e,n=>{if(n==null)return;const r=Qa(n);r!=null&&(r.addEventListener("reset",t,{passive:!0}),U(()=>{r.removeEventListener("reset",t)}))}))}function Qa(e){return Ya(e)?e.form:e.closest("form")}function Ya(e){return e.matches("textarea, input, select, button")}function un(e){const[t,n]=R(e.defaultValue?.()),r=M(()=>e.value?.()!==void 0),o=M(()=>r()?e.value?.():t());return[o,a=>{Rt(()=>{const l=Rs(a,o());return Object.is(l,o())||(r()||n(l),e.onChange?.(l)),l})}]}function ei(e){const[t,n]=un(e);return[()=>t()??!1,n]}function Xa(e){const[t,n]=un(e);return[()=>t()??[],n]}function Za(e={}){const[t,n]=ei({value:()=>E(e.isSelected),defaultValue:()=>!!E(e.defaultIsSelected),onChange:s=>e.onSelectedChange?.(s)});return{isSelected:t,setIsSelected:s=>{!E(e.isReadOnly)&&!E(e.isDisabled)&&n(s)},toggle:()=>{!E(e.isReadOnly)&&!E(e.isDisabled)&&n(!t())}}}var Ja=Object.defineProperty,Dn=(e,t)=>{for(var n in t)Ja(e,n,{get:t[n],enumerable:!0})},ti=be();function ni(){return xe(ti)}function el(){const e=ni();if(e===void 0)throw new Error("[kobalte]: `useDomCollectionContext` must be used within a `DomCollectionProvider` component");return e}function ri(e,t){return!!(t.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_PRECEDING)}function tl(e,t){const n=t.ref();if(!n)return-1;let r=e.length;if(!r)return-1;for(;r--;){const o=e[r]?.ref();if(o&&ri(o,n))return r+1}return 0}function nl(e){const t=e.map((r,o)=>[o,r]);let n=!1;return t.sort(([r,o],[s,a])=>{const l=o.ref(),i=a.ref();return l===i||!l||!i?0:ri(l,i)?(r>s&&(n=!0),-1):(r<s&&(n=!0),1)}),n?t.map(([r,o])=>o):e}function oi(e,t){const n=nl(e);e!==n&&t(n)}function rl(e){const t=e[0],n=e[e.length-1]?.ref();let r=t?.ref()?.parentElement;for(;r;){if(n&&r.contains(n))return r;r=r.parentElement}return Xe(r).body}function ol(e,t){B(()=>{const n=setTimeout(()=>{oi(e(),t)});U(()=>clearTimeout(n))})}function il(e,t){if(typeof IntersectionObserver!="function"){ol(e,t);return}let n=[];B(()=>{const r=()=>{const a=!!n.length;n=e(),a&&oi(e(),t)},o=rl(e()),s=new IntersectionObserver(r,{root:o});for(const a of e()){const l=a.ref();l&&s.observe(l)}U(()=>s.disconnect())})}function sl(e={}){const[t,n]=Xa({value:()=>E(e.items),onChange:s=>e.onItemsChange?.(s)});il(t,n);const r=s=>(n(a=>{const l=tl(a,s);return Ca(a,s,l)}),()=>{n(a=>{const l=a.filter(i=>i.ref()!==s.ref());return a.length===l.length?a:l})});return{DomCollectionProvider:s=>y(ti.Provider,{value:{registerItem:r},get children(){return s.children}})}}function al(e){const t=el(),n=Q({shouldRegisterItem:!0},e);B(()=>{if(!n.shouldRegisterItem)return;const r=t.registerItem(n.getItem());U(r)})}function ii(e){let t=e.startIndex??0;const n=e.startLevel??0,r=[],o=i=>{if(i==null)return"";const c=e.getKey??"key",d=Ft(c)?i[c]:c(i);return d!=null?String(d):""},s=i=>{if(i==null)return"";const c=e.getTextValue??"textValue",d=Ft(c)?i[c]:c(i);return d!=null?String(d):""},a=i=>{if(i==null)return!1;const c=e.getDisabled??"disabled";return(Ft(c)?i[c]:c(i))??!1},l=i=>{if(i!=null)return Ft(e.getSectionChildren)?i[e.getSectionChildren]:e.getSectionChildren?.(i)};for(const i of e.dataSource){if(Ft(i)||Sa(i)){r.push({type:"item",rawValue:i,key:String(i),textValue:String(i),disabled:a(i),level:n,index:t}),t++;continue}if(l(i)!=null){r.push({type:"section",rawValue:i,key:"",textValue:"",disabled:!1,level:n,index:t}),t++;const c=l(i)??[];if(c.length>0){const d=ii({dataSource:c,getKey:e.getKey,getTextValue:e.getTextValue,getDisabled:e.getDisabled,getSectionChildren:e.getSectionChildren,startIndex:t,startLevel:n+1});r.push(...d),t+=d.length}}else r.push({type:"item",rawValue:i,key:o(i),textValue:s(i),disabled:a(i),level:n,index:t}),t++}return r}function ll(e,t=[]){return M(()=>{const n=ii({dataSource:E(e.dataSource),getKey:E(e.getKey),getTextValue:E(e.getTextValue),getDisabled:E(e.getDisabled),getSectionChildren:E(e.getSectionChildren)});for(let r=0;r<t.length;r++)t[r]();return e.factory(n)})}var cl=new Set(["Avst","Arab","Armi","Syrc","Samr","Mand","Thaa","Mend","Nkoo","Adlm","Rohg","Hebr"]),ul=new Set(["ae","ar","arc","bcc","bqi","ckb","dv","fa","glk","he","ku","mzn","nqo","pnb","ps","sd","ug","ur","yi"]);function dl(e){if(Intl.Locale){const n=new Intl.Locale(e).maximize().script??"";return cl.has(n)}const t=e.split("-")[0];return ul.has(t)}function fl(e){return dl(e)?"rtl":"ltr"}function si(){let e=typeof navigator<"u"&&(navigator.language||navigator.userLanguage)||"en-US";return{locale:e,direction:fl(e)}}var Xn=si(),tn=new Set;function ro(){Xn=si();for(const e of tn)e(Xn)}function gl(){const[e,t]=R(Xn),n=M(()=>e());return Mt(()=>{tn.size===0&&window.addEventListener("languagechange",ro),tn.add(t),U(()=>{tn.delete(t),tn.size===0&&window.removeEventListener("languagechange",ro)})}),{locale:()=>n().locale,direction:()=>n().direction}}var hl=be();function $t(){const e=gl();return xe(hl)||e}var Kn=new Map;function yl(e){const{locale:t}=$t(),n=M(()=>t()+(e?Object.entries(e).sort((r,o)=>r[0]<o[0]?-1:1).join():""));return M(()=>{const r=n();let o;return Kn.has(r)&&(o=Kn.get(r)),o||(o=new Intl.Collator(t(),e),Kn.set(r,o)),o})}var at=class ai extends Set{anchorKey;currentKey;constructor(t,n,r){super(t),t instanceof ai?(this.anchorKey=n||t.anchorKey,this.currentKey=r||t.currentKey):(this.anchorKey=n,this.currentKey=r)}};function pl(e){const[t,n]=un(e);return[()=>t()??new at,n]}function li(e){return Ia()?e.altKey:e.ctrlKey}function qt(e){return An()?e.metaKey:e.ctrlKey}function oo(e){return new at(e)}function ml(e,t){if(e.size!==t.size)return!1;for(const n of e)if(!t.has(n))return!1;return!0}function vl(e){const t=Q({selectionMode:"none",selectionBehavior:"toggle"},e),[n,r]=R(!1),[o,s]=R(),a=M(()=>{const p=E(t.selectedKeys);return p!=null?oo(p):p}),l=M(()=>{const p=E(t.defaultSelectedKeys);return p!=null?oo(p):new at}),[i,c]=pl({value:a,defaultValue:l,onChange:p=>t.onSelectionChange?.(p)}),[d,u]=R(E(t.selectionBehavior)),f=()=>E(t.selectionMode),h=()=>E(t.disallowEmptySelection)??!1,g=p=>{(E(t.allowDuplicateSelectionEvents)||!ml(p,i()))&&c(p)};return B(()=>{const p=i();E(t.selectionBehavior)==="replace"&&d()==="toggle"&&typeof p=="object"&&p.size===0&&u("replace")}),B(()=>{u(E(t.selectionBehavior)??"toggle")}),{selectionMode:f,disallowEmptySelection:h,selectionBehavior:d,setSelectionBehavior:u,isFocused:n,setFocused:r,focusedKey:o,setFocusedKey:s,selectedKeys:i,setSelectedKeys:g}}function bl(e){const[t,n]=R(""),[r,o]=R(-1);return{typeSelectHandlers:{onKeyDown:a=>{if(E(e.isDisabled))return;const l=E(e.keyboardDelegate),i=E(e.selectionManager);if(!l.getKeyForSearch)return;const c=xl(a.key);if(!c||a.ctrlKey||a.metaKey)return;c===" "&&t().trim().length>0&&(a.preventDefault(),a.stopPropagation());let d=n(f=>f+c),u=l.getKeyForSearch(d,i.focusedKey())??l.getKeyForSearch(d);u==null&&wl(d)&&(d=d[0],u=l.getKeyForSearch(d,i.focusedKey())??l.getKeyForSearch(d)),u!=null&&(i.setFocusedKey(u),e.onTypeSelect?.(u)),clearTimeout(r()),o(window.setTimeout(()=>n(""),500))}}}}function xl(e){return e.length===1||!/^[A-Z]/i.test(e)?e:""}function wl(e){return e.split("").every(t=>t===e[0])}function $l(e,t,n){const o=j({selectOnFocus:()=>E(e.selectionManager).selectionBehavior()==="replace"},e),s=()=>t(),{direction:a}=$t();let l={top:0,left:0};ba(()=>E(o.isVirtualized)?void 0:s(),"scroll",()=>{const m=s();m&&(l={top:m.scrollTop,left:m.scrollLeft})});const{typeSelectHandlers:i}=bl({isDisabled:()=>E(o.disallowTypeAhead),keyboardDelegate:()=>E(o.keyboardDelegate),selectionManager:()=>E(o.selectionManager)}),c=()=>E(o.orientation)??"vertical",d=m=>{ue(m,i.onKeyDown),m.altKey&&m.key==="Tab"&&m.preventDefault();const v=t();if(!v?.contains(m.target))return;const b=E(o.selectionManager),x=E(o.selectOnFocus),w=O=>{O!=null&&(b.setFocusedKey(O),m.shiftKey&&b.selectionMode()==="multiple"?b.extendSelection(O):x&&!li(m)&&b.replaceSelection(O))},$=E(o.keyboardDelegate),F=E(o.shouldFocusWrap),D=b.focusedKey();switch(m.key){case(c()==="vertical"?"ArrowDown":"ArrowRight"):{if($.getKeyBelow){m.preventDefault();let O;D!=null?O=$.getKeyBelow(D):O=$.getFirstKey?.(),O==null&&F&&(O=$.getFirstKey?.(D)),w(O)}break}case(c()==="vertical"?"ArrowUp":"ArrowLeft"):{if($.getKeyAbove){m.preventDefault();let O;D!=null?O=$.getKeyAbove(D):O=$.getLastKey?.(),O==null&&F&&(O=$.getLastKey?.(D)),w(O)}break}case(c()==="vertical"?"ArrowLeft":"ArrowUp"):{if($.getKeyLeftOf){m.preventDefault();const O=a()==="rtl";let C;D!=null?C=$.getKeyLeftOf(D):C=O?$.getFirstKey?.():$.getLastKey?.(),w(C)}break}case(c()==="vertical"?"ArrowRight":"ArrowDown"):{if($.getKeyRightOf){m.preventDefault();const O=a()==="rtl";let C;D!=null?C=$.getKeyRightOf(D):C=O?$.getLastKey?.():$.getFirstKey?.(),w(C)}break}case"Home":if($.getFirstKey){m.preventDefault();const O=$.getFirstKey(D,qt(m));O!=null&&(b.setFocusedKey(O),qt(m)&&m.shiftKey&&b.selectionMode()==="multiple"?b.extendSelection(O):x&&b.replaceSelection(O))}break;case"End":if($.getLastKey){m.preventDefault();const O=$.getLastKey(D,qt(m));O!=null&&(b.setFocusedKey(O),qt(m)&&m.shiftKey&&b.selectionMode()==="multiple"?b.extendSelection(O):x&&b.replaceSelection(O))}break;case"PageDown":if($.getKeyPageBelow&&D!=null){m.preventDefault();const O=$.getKeyPageBelow(D);w(O)}break;case"PageUp":if($.getKeyPageAbove&&D!=null){m.preventDefault();const O=$.getKeyPageAbove(D);w(O)}break;case"a":qt(m)&&b.selectionMode()==="multiple"&&E(o.disallowSelectAll)!==!0&&(m.preventDefault(),b.selectAll());break;case"Escape":m.defaultPrevented||(m.preventDefault(),E(o.disallowEmptySelection)||b.clearSelection());break;case"Tab":if(!E(o.allowsTabNavigation)){if(m.shiftKey)v.focus();else{const O=Ka(v,{tabbable:!0});let C,P;do P=O.lastChild(),P&&(C=P);while(P);C&&!C.contains(document.activeElement)&&Se(C)}break}}},u=m=>{const v=E(o.selectionManager),b=E(o.keyboardDelegate),x=E(o.selectOnFocus);if(v.isFocused()){m.currentTarget.contains(m.target)||v.setFocused(!1);return}if(m.currentTarget.contains(m.target)){if(v.setFocused(!0),v.focusedKey()==null){const w=F=>{F!=null&&(v.setFocusedKey(F),x&&v.replaceSelection(F))},$=m.relatedTarget;$&&m.currentTarget.compareDocumentPosition($)&Node.DOCUMENT_POSITION_FOLLOWING?w(v.lastSelectedKey()??b.getLastKey?.()):w(v.firstSelectedKey()??b.getFirstKey?.())}else if(!E(o.isVirtualized)){const w=s();if(w){w.scrollTop=l.top,w.scrollLeft=l.left;const $=w.querySelector(`[data-key="${v.focusedKey()}"]`);$&&(Se($),Yn(w,$))}}}},f=m=>{const v=E(o.selectionManager);m.currentTarget.contains(m.relatedTarget)||v.setFocused(!1)},h=m=>{s()===m.target&&m.preventDefault()},g=()=>{const m=E(o.autoFocus);if(!m)return;const v=E(o.selectionManager),b=E(o.keyboardDelegate);let x;m==="first"&&(x=b.getFirstKey?.()),m==="last"&&(x=b.getLastKey?.());const w=v.selectedKeys();w.size&&(x=w.values().next().value),v.setFocused(!0),v.setFocusedKey(x);const $=t();$&&x==null&&!E(o.shouldUseVirtualFocus)&&Se($)};return Mt(()=>{o.deferAutoFocus?setTimeout(g,0):g()}),B(ut([s,()=>E(o.isVirtualized),()=>E(o.selectionManager).focusedKey()],m=>{const[v,b,x]=m;if(b)x&&o.scrollToKey?.(x);else if(x&&v){const w=v.querySelector(`[data-key="${x}"]`);w&&Yn(v,w)}})),{tabIndex:M(()=>{if(!E(o.shouldUseVirtualFocus))return E(o.selectionManager).focusedKey()==null?0:-1}),onKeyDown:d,onMouseDown:h,onFocusIn:u,onFocusOut:f}}function ci(e,t){const n=()=>E(e.selectionManager),r=()=>E(e.key),o=()=>E(e.shouldUseVirtualFocus),s=b=>{n().selectionMode()!=="none"&&(n().selectionMode()==="single"?n().isSelected(r())&&!n().disallowEmptySelection()?n().toggleSelection(r()):n().replaceSelection(r()):b?.shiftKey?n().extendSelection(r()):n().selectionBehavior()==="toggle"||qt(b)||"pointerType"in b&&b.pointerType==="touch"?n().toggleSelection(r()):n().replaceSelection(r()))},a=()=>n().isSelected(r()),l=()=>E(e.disabled)||n().isDisabled(r()),i=()=>!l()&&n().canSelectItem(r());let c=null;const d=b=>{i()&&(c=b.pointerType,b.pointerType==="mouse"&&b.button===0&&!E(e.shouldSelectOnPressUp)&&s(b))},u=b=>{i()&&b.pointerType==="mouse"&&b.button===0&&E(e.shouldSelectOnPressUp)&&E(e.allowsDifferentPressOrigin)&&s(b)},f=b=>{i()&&(E(e.shouldSelectOnPressUp)&&!E(e.allowsDifferentPressOrigin)||c!=="mouse")&&s(b)},h=b=>{!i()||!["Enter"," "].includes(b.key)||(li(b)?n().toggleSelection(r()):s(b))},g=b=>{l()&&b.preventDefault()},p=b=>{const x=t();o()||l()||!x||b.target===x&&n().setFocusedKey(r())},m=M(()=>{if(!(o()||l()))return r()===n().focusedKey()?0:-1}),v=M(()=>E(e.virtualized)?void 0:r());return B(ut([t,r,o,()=>n().focusedKey(),()=>n().isFocused()],([b,x,w,$,F])=>{b&&x===$&&F&&!w&&document.activeElement!==b&&(e.focus?e.focus():Se(b))})),{isSelected:a,isDisabled:l,allowsSelection:i,tabIndex:m,dataKey:v,onPointerDown:d,onPointerUp:u,onClick:f,onKeyDown:h,onMouseDown:g,onFocus:p}}var Cl=class{collection;state;constructor(e,t){this.collection=e,this.state=t}selectionMode(){return this.state.selectionMode()}disallowEmptySelection(){return this.state.disallowEmptySelection()}selectionBehavior(){return this.state.selectionBehavior()}setSelectionBehavior(e){this.state.setSelectionBehavior(e)}isFocused(){return this.state.isFocused()}setFocused(e){this.state.setFocused(e)}focusedKey(){return this.state.focusedKey()}setFocusedKey(e){(e==null||this.collection().getItem(e))&&this.state.setFocusedKey(e)}selectedKeys(){return this.state.selectedKeys()}isSelected(e){if(this.state.selectionMode()==="none")return!1;const t=this.getKey(e);return t==null?!1:this.state.selectedKeys().has(t)}isEmpty(){return this.state.selectedKeys().size===0}isSelectAll(){if(this.isEmpty())return!1;const e=this.state.selectedKeys();return this.getAllSelectableKeys().every(t=>e.has(t))}firstSelectedKey(){let e;for(const t of this.state.selectedKeys()){const n=this.collection().getItem(t),r=n?.index!=null&&e?.index!=null&&n.index<e.index;(!e||r)&&(e=n)}return e?.key}lastSelectedKey(){let e;for(const t of this.state.selectedKeys()){const n=this.collection().getItem(t),r=n?.index!=null&&e?.index!=null&&n.index>e.index;(!e||r)&&(e=n)}return e?.key}extendSelection(e){if(this.selectionMode()==="none")return;if(this.selectionMode()==="single"){this.replaceSelection(e);return}const t=this.getKey(e);if(t==null)return;const n=this.state.selectedKeys(),r=n.anchorKey||t,o=new at(n,r,t);for(const s of this.getKeyRange(r,n.currentKey||t))o.delete(s);for(const s of this.getKeyRange(t,r))this.canSelectItem(s)&&o.add(s);this.state.setSelectedKeys(o)}getKeyRange(e,t){const n=this.collection().getItem(e),r=this.collection().getItem(t);return n&&r?n.index!=null&&r.index!=null&&n.index<=r.index?this.getKeyRangeInternal(e,t):this.getKeyRangeInternal(t,e):[]}getKeyRangeInternal(e,t){const n=[];let r=e;for(;r!=null;){const o=this.collection().getItem(r);if(o&&o.type==="item"&&n.push(r),r===t)return n;r=this.collection().getKeyAfter(r)}return[]}getKey(e){const t=this.collection().getItem(e);return t?!t||t.type!=="item"?null:t.key:e}toggleSelection(e){if(this.selectionMode()==="none")return;if(this.selectionMode()==="single"&&!this.isSelected(e)){this.replaceSelection(e);return}const t=this.getKey(e);if(t==null)return;const n=new at(this.state.selectedKeys());n.has(t)?n.delete(t):this.canSelectItem(t)&&(n.add(t),n.anchorKey=t,n.currentKey=t),!(this.disallowEmptySelection()&&n.size===0)&&this.state.setSelectedKeys(n)}replaceSelection(e){if(this.selectionMode()==="none")return;const t=this.getKey(e);if(t==null)return;const n=this.canSelectItem(t)?new at([t],t,t):new at;this.state.setSelectedKeys(n)}setSelectedKeys(e){if(this.selectionMode()==="none")return;const t=new at;for(const n of e){const r=this.getKey(n);if(r!=null&&(t.add(r),this.selectionMode()==="single"))break}this.state.setSelectedKeys(t)}selectAll(){this.selectionMode()==="multiple"&&this.state.setSelectedKeys(new Set(this.getAllSelectableKeys()))}clearSelection(){const e=this.state.selectedKeys();!this.disallowEmptySelection()&&e.size>0&&this.state.setSelectedKeys(new at)}toggleSelectAll(){this.isSelectAll()?this.clearSelection():this.selectAll()}select(e,t){this.selectionMode()!=="none"&&(this.selectionMode()==="single"?this.isSelected(e)&&!this.disallowEmptySelection()?this.toggleSelection(e):this.replaceSelection(e):this.selectionBehavior()==="toggle"||t&&t.pointerType==="touch"?this.toggleSelection(e):this.replaceSelection(e))}isSelectionEqual(e){if(e===this.state.selectedKeys())return!0;const t=this.selectedKeys();if(e.size!==t.size)return!1;for(const n of e)if(!t.has(n))return!1;for(const n of t)if(!e.has(n))return!1;return!0}canSelectItem(e){if(this.state.selectionMode()==="none")return!1;const t=this.collection().getItem(e);return t!=null&&!t.disabled}isDisabled(e){const t=this.collection().getItem(e);return!t||t.disabled}getAllSelectableKeys(){const e=[];return(n=>{for(;n!=null;){if(this.canSelectItem(n)){const r=this.collection().getItem(n);if(!r)continue;r.type==="item"&&e.push(n)}n=this.collection().getKeyAfter(n)}})(this.collection().getFirstKey()),e}},io=class{keyMap=new Map;iterable;firstKey;lastKey;constructor(e){this.iterable=e;for(const r of e)this.keyMap.set(r.key,r);if(this.keyMap.size===0)return;let t,n=0;for(const[r,o]of this.keyMap)t?(t.nextKey=r,o.prevKey=t.key):(this.firstKey=r,o.prevKey=void 0),o.type==="item"&&(o.index=n++),t=o,t.nextKey=void 0;this.lastKey=t.key}*[Symbol.iterator](){yield*this.iterable}getSize(){return this.keyMap.size}getKeys(){return this.keyMap.keys()}getKeyBefore(e){return this.keyMap.get(e)?.prevKey}getKeyAfter(e){return this.keyMap.get(e)?.nextKey}getFirstKey(){return this.firstKey}getLastKey(){return this.lastKey}getItem(e){return this.keyMap.get(e)}at(e){const t=[...this.getKeys()];return this.getItem(t[e])}};function Sl(e){const t=vl(e),r=ll({dataSource:()=>E(e.dataSource),getKey:()=>E(e.getKey),getTextValue:()=>E(e.getTextValue),getDisabled:()=>E(e.getDisabled),getSectionChildren:()=>E(e.getSectionChildren),factory:s=>e.filter?new io(e.filter(s)):new io(s)},[()=>e.filter]),o=new Cl(r,t);return Ls(()=>{const s=t.focusedKey();s!=null&&!r().getItem(s)&&t.setFocusedKey(void 0)}),{collection:r,selectionManager:()=>o}}var Ce=e=>typeof e=="function"?e():e,kl=e=>{const t=M(()=>{const a=Ce(e.element);if(a)return getComputedStyle(a)}),n=()=>t()?.animationName??"none",[r,o]=R(Ce(e.show)?"present":"hidden");let s="none";return B(a=>{const l=Ce(e.show);return Rt(()=>{if(a===l)return l;const i=s,c=n();l?o("present"):c==="none"||t()?.display==="none"?o("hidden"):o(a===!0&&i!==c?"hiding":"hidden")}),l}),B(()=>{const a=Ce(e.element);if(!a)return;const l=c=>{c.target===a&&(s=n())},i=c=>{const u=n().includes(c.animationName);c.target===a&&u&&r()==="hiding"&&o("hidden")};a.addEventListener("animationstart",l),a.addEventListener("animationcancel",i),a.addEventListener("animationend",i),U(()=>{a.removeEventListener("animationstart",l),a.removeEventListener("animationcancel",i),a.removeEventListener("animationend",i)})}),{present:()=>r()==="present"||r()==="hiding",state:r}},El=kl,ui=El,wn="data-kb-top-layer",di,Zn=!1,dt=[];function rn(e){return dt.findIndex(t=>t.node===e)}function Ml(e){return dt[rn(e)]}function Tl(e){return dt[dt.length-1].node===e}function fi(){return dt.filter(e=>e.isPointerBlocking)}function Al(){return[...fi()].slice(-1)[0]}function ur(){return fi().length>0}function gi(e){const t=rn(Al()?.node);return rn(e)<t}function Il(e){dt.push(e)}function Dl(e){const t=rn(e);t<0||dt.splice(t,1)}function Pl(){for(const{node:e}of dt)e.style.pointerEvents=gi(e)?"none":"auto"}function Ll(e){if(ur()&&!Zn){const t=Xe(e);di=document.body.style.pointerEvents,t.body.style.pointerEvents="none",Zn=!0}}function Ol(e){if(ur())return;const t=Xe(e);t.body.style.pointerEvents=di,t.body.style.length===0&&t.body.removeAttribute("style"),Zn=!1}var Ie={layers:dt,isTopMostLayer:Tl,hasPointerBlockingLayer:ur,isBelowPointerBlockingLayer:gi,addLayer:Il,removeLayer:Dl,indexOf:rn,find:Ml,assignPointerEventToLayers:Pl,disableBodyPointerEvents:Ll,restoreBodyPointerEvents:Ol},Fl={};Dn(Fl,{Button:()=>Rl,Root:()=>dr});var ql=["button","color","file","image","reset","submit"];function _l(e){const t=e.tagName.toLowerCase();return t==="button"?!0:t==="input"&&e.type?ql.indexOf(e.type)!==-1:!1}function dr(e){let t;const n=Q({type:"button"},e),[r,o]=Z(n,["ref","type","disabled"]),s=In(()=>t,()=>"button"),a=M(()=>{const c=s();return c==null?!1:_l({tagName:c,type:r.type})}),l=M(()=>s()==="input"),i=M(()=>s()==="a"&&t?.getAttribute("href")!=null);return y(de,j({as:"button",ref(c){const d=Me(u=>t=u,r.ref);typeof d=="function"&&d(c)},get type(){return a()||l()?r.type:void 0},get role(){return!a()&&!i()?"button":void 0},get tabIndex(){return!a()&&!i()&&!r.disabled?0:void 0},get disabled(){return a()||l()?r.disabled:void 0},get"aria-disabled"(){return!a()&&!l()&&r.disabled?!0:void 0},get"data-disabled"(){return r.disabled?"":void 0}},o))}var Rl=dr,zl=["top","right","bottom","left"],Ye=Math.min,Pe=Math.max,$n=Math.round,mn=Math.floor,bt=e=>({x:e,y:e}),Kl={left:"right",right:"left",bottom:"top",top:"bottom"},Bl={start:"end",end:"start"};function Jn(e,t,n){return Pe(e,Ye(t,n))}function It(e,t){return typeof e=="function"?e(t):e}function xt(e){return e.split("-")[0]}function Nt(e){return e.split("-")[1]}function hi(e){return e==="x"?"y":"x"}function fr(e){return e==="y"?"height":"width"}function Tt(e){return["top","bottom"].includes(xt(e))?"y":"x"}function gr(e){return hi(Tt(e))}function Nl(e,t,n){n===void 0&&(n=!1);const r=Nt(e),o=gr(e),s=fr(o);let a=o==="x"?r===(n?"end":"start")?"right":"left":r==="start"?"bottom":"top";return t.reference[s]>t.floating[s]&&(a=Cn(a)),[a,Cn(a)]}function Ul(e){const t=Cn(e);return[er(e),t,er(t)]}function er(e){return e.replace(/start|end/g,t=>Bl[t])}function Gl(e,t,n){const r=["left","right"],o=["right","left"],s=["top","bottom"],a=["bottom","top"];switch(e){case"top":case"bottom":return n?t?o:r:t?r:o;case"left":case"right":return t?s:a;default:return[]}}function Hl(e,t,n,r){const o=Nt(e);let s=Gl(xt(e),n==="start",r);return o&&(s=s.map(a=>a+"-"+o),t&&(s=s.concat(s.map(er)))),s}function Cn(e){return e.replace(/left|right|bottom|top/g,t=>Kl[t])}function Vl(e){return{top:0,right:0,bottom:0,left:0,...e}}function yi(e){return typeof e!="number"?Vl(e):{top:e,right:e,bottom:e,left:e}}function Sn(e){const{x:t,y:n,width:r,height:o}=e;return{width:r,height:o,top:n,left:t,right:t+r,bottom:n+o,x:t,y:n}}function so(e,t,n){let{reference:r,floating:o}=e;const s=Tt(t),a=gr(t),l=fr(a),i=xt(t),c=s==="y",d=r.x+r.width/2-o.width/2,u=r.y+r.height/2-o.height/2,f=r[l]/2-o[l]/2;let h;switch(i){case"top":h={x:d,y:r.y-o.height};break;case"bottom":h={x:d,y:r.y+r.height};break;case"right":h={x:r.x+r.width,y:u};break;case"left":h={x:r.x-o.width,y:u};break;default:h={x:r.x,y:r.y}}switch(Nt(t)){case"start":h[a]-=f*(n&&c?-1:1);break;case"end":h[a]+=f*(n&&c?-1:1);break}return h}var jl=async(e,t,n)=>{const{placement:r="bottom",strategy:o="absolute",middleware:s=[],platform:a}=n,l=s.filter(Boolean),i=await(a.isRTL==null?void 0:a.isRTL(t));let c=await a.getElementRects({reference:e,floating:t,strategy:o}),{x:d,y:u}=so(c,r,i),f=r,h={},g=0;for(let p=0;p<l.length;p++){const{name:m,fn:v}=l[p],{x:b,y:x,data:w,reset:$}=await v({x:d,y:u,initialPlacement:r,placement:f,strategy:o,middlewareData:h,rects:c,platform:a,elements:{reference:e,floating:t}});d=b??d,u=x??u,h={...h,[m]:{...h[m],...w}},$&&g<=50&&(g++,typeof $=="object"&&($.placement&&(f=$.placement),$.rects&&(c=$.rects===!0?await a.getElementRects({reference:e,floating:t,strategy:o}):$.rects),{x:d,y:u}=so(c,f,i)),p=-1)}return{x:d,y:u,placement:f,strategy:o,middlewareData:h}};async function on(e,t){var n;t===void 0&&(t={});const{x:r,y:o,platform:s,rects:a,elements:l,strategy:i}=e,{boundary:c="clippingAncestors",rootBoundary:d="viewport",elementContext:u="floating",altBoundary:f=!1,padding:h=0}=It(t,e),g=yi(h),m=l[f?u==="floating"?"reference":"floating":u],v=Sn(await s.getClippingRect({element:(n=await(s.isElement==null?void 0:s.isElement(m)))==null||n?m:m.contextElement||await(s.getDocumentElement==null?void 0:s.getDocumentElement(l.floating)),boundary:c,rootBoundary:d,strategy:i})),b=u==="floating"?{x:r,y:o,width:a.floating.width,height:a.floating.height}:a.reference,x=await(s.getOffsetParent==null?void 0:s.getOffsetParent(l.floating)),w=await(s.isElement==null?void 0:s.isElement(x))?await(s.getScale==null?void 0:s.getScale(x))||{x:1,y:1}:{x:1,y:1},$=Sn(s.convertOffsetParentRelativeRectToViewportRelativeRect?await s.convertOffsetParentRelativeRectToViewportRelativeRect({elements:l,rect:b,offsetParent:x,strategy:i}):b);return{top:(v.top-$.top+g.top)/w.y,bottom:($.bottom-v.bottom+g.bottom)/w.y,left:(v.left-$.left+g.left)/w.x,right:($.right-v.right+g.right)/w.x}}var Wl=e=>({name:"arrow",options:e,async fn(t){const{x:n,y:r,placement:o,rects:s,platform:a,elements:l,middlewareData:i}=t,{element:c,padding:d=0}=It(e,t)||{};if(c==null)return{};const u=yi(d),f={x:n,y:r},h=gr(o),g=fr(h),p=await a.getDimensions(c),m=h==="y",v=m?"top":"left",b=m?"bottom":"right",x=m?"clientHeight":"clientWidth",w=s.reference[g]+s.reference[h]-f[h]-s.floating[g],$=f[h]-s.reference[h],F=await(a.getOffsetParent==null?void 0:a.getOffsetParent(c));let D=F?F[x]:0;(!D||!await(a.isElement==null?void 0:a.isElement(F)))&&(D=l.floating[x]||s.floating[g]);const O=w/2-$/2,C=D/2-p[g]/2-1,P=Ye(u[v],C),V=Ye(u[b],C),G=P,te=D-p[g]-V,J=D/2-p[g]/2+O,ae=Jn(G,J,te),oe=!i.arrow&&Nt(o)!=null&&J!==ae&&s.reference[g]/2-(J<G?P:V)-p[g]/2<0,ne=oe?J<G?J-G:J-te:0;return{[h]:f[h]+ne,data:{[h]:ae,centerOffset:J-ae-ne,...oe&&{alignmentOffset:ne}},reset:oe}}}),Ql=function(e){return e===void 0&&(e={}),{name:"flip",options:e,async fn(t){var n,r;const{placement:o,middlewareData:s,rects:a,initialPlacement:l,platform:i,elements:c}=t,{mainAxis:d=!0,crossAxis:u=!0,fallbackPlacements:f,fallbackStrategy:h="bestFit",fallbackAxisSideDirection:g="none",flipAlignment:p=!0,...m}=It(e,t);if((n=s.arrow)!=null&&n.alignmentOffset)return{};const v=xt(o),b=Tt(l),x=xt(l)===l,w=await(i.isRTL==null?void 0:i.isRTL(c.floating)),$=f||(x||!p?[Cn(l)]:Ul(l)),F=g!=="none";!f&&F&&$.push(...Hl(l,p,g,w));const D=[l,...$],O=await on(t,m),C=[];let P=((r=s.flip)==null?void 0:r.overflows)||[];if(d&&C.push(O[v]),u){const J=Nl(o,a,w);C.push(O[J[0]],O[J[1]])}if(P=[...P,{placement:o,overflows:C}],!C.every(J=>J<=0)){var V,G;const J=(((V=s.flip)==null?void 0:V.index)||0)+1,ae=D[J];if(ae)return{data:{index:J,overflows:P},reset:{placement:ae}};let oe=(G=P.filter(ne=>ne.overflows[0]<=0).sort((ne,ie)=>ne.overflows[1]-ie.overflows[1])[0])==null?void 0:G.placement;if(!oe)switch(h){case"bestFit":{var te;const ne=(te=P.filter(ie=>{if(F){const le=Tt(ie.placement);return le===b||le==="y"}return!0}).map(ie=>[ie.placement,ie.overflows.filter(le=>le>0).reduce((le,ye)=>le+ye,0)]).sort((ie,le)=>ie[1]-le[1])[0])==null?void 0:te[0];ne&&(oe=ne);break}case"initialPlacement":oe=l;break}if(o!==oe)return{reset:{placement:oe}}}return{}}}};function ao(e,t){return{top:e.top-t.height,right:e.right-t.width,bottom:e.bottom-t.height,left:e.left-t.width}}function lo(e){return zl.some(t=>e[t]>=0)}var Yl=function(e){return e===void 0&&(e={}),{name:"hide",options:e,async fn(t){const{rects:n}=t,{strategy:r="referenceHidden",...o}=It(e,t);switch(r){case"referenceHidden":{const s=await on(t,{...o,elementContext:"reference"}),a=ao(s,n.reference);return{data:{referenceHiddenOffsets:a,referenceHidden:lo(a)}}}case"escaped":{const s=await on(t,{...o,altBoundary:!0}),a=ao(s,n.floating);return{data:{escapedOffsets:a,escaped:lo(a)}}}default:return{}}}}};async function Xl(e,t){const{placement:n,platform:r,elements:o}=e,s=await(r.isRTL==null?void 0:r.isRTL(o.floating)),a=xt(n),l=Nt(n),i=Tt(n)==="y",c=["left","top"].includes(a)?-1:1,d=s&&i?-1:1,u=It(t,e);let{mainAxis:f,crossAxis:h,alignmentAxis:g}=typeof u=="number"?{mainAxis:u,crossAxis:0,alignmentAxis:null}:{mainAxis:0,crossAxis:0,alignmentAxis:null,...u};return l&&typeof g=="number"&&(h=l==="end"?g*-1:g),i?{x:h*d,y:f*c}:{x:f*c,y:h*d}}var Zl=function(e){return e===void 0&&(e=0),{name:"offset",options:e,async fn(t){var n,r;const{x:o,y:s,placement:a,middlewareData:l}=t,i=await Xl(t,e);return a===((n=l.offset)==null?void 0:n.placement)&&(r=l.arrow)!=null&&r.alignmentOffset?{}:{x:o+i.x,y:s+i.y,data:{...i,placement:a}}}}},Jl=function(e){return e===void 0&&(e={}),{name:"shift",options:e,async fn(t){const{x:n,y:r,placement:o}=t,{mainAxis:s=!0,crossAxis:a=!1,limiter:l={fn:m=>{let{x:v,y:b}=m;return{x:v,y:b}}},...i}=It(e,t),c={x:n,y:r},d=await on(t,i),u=Tt(xt(o)),f=hi(u);let h=c[f],g=c[u];if(s){const m=f==="y"?"top":"left",v=f==="y"?"bottom":"right",b=h+d[m],x=h-d[v];h=Jn(b,h,x)}if(a){const m=u==="y"?"top":"left",v=u==="y"?"bottom":"right",b=g+d[m],x=g-d[v];g=Jn(b,g,x)}const p=l.fn({...t,[f]:h,[u]:g});return{...p,data:{x:p.x-n,y:p.y-r}}}}},ec=function(e){return e===void 0&&(e={}),{name:"size",options:e,async fn(t){const{placement:n,rects:r,platform:o,elements:s}=t,{apply:a=()=>{},...l}=It(e,t),i=await on(t,l),c=xt(n),d=Nt(n),u=Tt(n)==="y",{width:f,height:h}=r.floating;let g,p;c==="top"||c==="bottom"?(g=c,p=d===(await(o.isRTL==null?void 0:o.isRTL(s.floating))?"start":"end")?"left":"right"):(p=c,g=d==="end"?"top":"bottom");const m=h-i.top-i.bottom,v=f-i.left-i.right,b=Ye(h-i[g],m),x=Ye(f-i[p],v),w=!t.middlewareData.shift;let $=b,F=x;if(u?F=d||w?Ye(x,v):v:$=d||w?Ye(b,m):m,w&&!d){const O=Pe(i.left,0),C=Pe(i.right,0),P=Pe(i.top,0),V=Pe(i.bottom,0);u?F=f-2*(O!==0||C!==0?O+C:Pe(i.left,i.right)):$=h-2*(P!==0||V!==0?P+V:Pe(i.top,i.bottom))}await a({...t,availableWidth:F,availableHeight:$});const D=await o.getDimensions(s.floating);return f!==D.width||h!==D.height?{reset:{rects:!0}}:{}}}};function Ut(e){return pi(e)?(e.nodeName||"").toLowerCase():"#document"}function Le(e){var t;return(e==null||(t=e.ownerDocument)==null?void 0:t.defaultView)||window}function ft(e){var t;return(t=(pi(e)?e.ownerDocument:e.document)||window.document)==null?void 0:t.documentElement}function pi(e){return e instanceof Node||e instanceof Le(e).Node}function Ge(e){return e instanceof Element||e instanceof Le(e).Element}function Ze(e){return e instanceof HTMLElement||e instanceof Le(e).HTMLElement}function co(e){return typeof ShadowRoot>"u"?!1:e instanceof ShadowRoot||e instanceof Le(e).ShadowRoot}function dn(e){const{overflow:t,overflowX:n,overflowY:r,display:o}=He(e);return/auto|scroll|overlay|hidden|clip/.test(t+r+n)&&!["inline","contents"].includes(o)}function tc(e){return["table","td","th"].includes(Ut(e))}function Pn(e){return[":popover-open",":modal"].some(t=>{try{return e.matches(t)}catch{return!1}})}function hr(e){const t=yr(),n=Ge(e)?He(e):e;return n.transform!=="none"||n.perspective!=="none"||(n.containerType?n.containerType!=="normal":!1)||!t&&(n.backdropFilter?n.backdropFilter!=="none":!1)||!t&&(n.filter?n.filter!=="none":!1)||["transform","perspective","filter"].some(r=>(n.willChange||"").includes(r))||["paint","layout","strict","content"].some(r=>(n.contain||"").includes(r))}function nc(e){let t=wt(e);for(;Ze(t)&&!Bt(t);){if(hr(t))return t;if(Pn(t))return null;t=wt(t)}return null}function yr(){return typeof CSS>"u"||!CSS.supports?!1:CSS.supports("-webkit-backdrop-filter","none")}function Bt(e){return["html","body","#document"].includes(Ut(e))}function He(e){return Le(e).getComputedStyle(e)}function Ln(e){return Ge(e)?{scrollLeft:e.scrollLeft,scrollTop:e.scrollTop}:{scrollLeft:e.scrollX,scrollTop:e.scrollY}}function wt(e){if(Ut(e)==="html")return e;const t=e.assignedSlot||e.parentNode||co(e)&&e.host||ft(e);return co(t)?t.host:t}function mi(e){const t=wt(e);return Bt(t)?e.ownerDocument?e.ownerDocument.body:e.body:Ze(t)&&dn(t)?t:mi(t)}function sn(e,t,n){var r;t===void 0&&(t=[]),n===void 0&&(n=!0);const o=mi(e),s=o===((r=e.ownerDocument)==null?void 0:r.body),a=Le(o);return s?t.concat(a,a.visualViewport||[],dn(o)?o:[],a.frameElement&&n?sn(a.frameElement):[]):t.concat(o,sn(o,[],n))}function vi(e){const t=He(e);let n=parseFloat(t.width)||0,r=parseFloat(t.height)||0;const o=Ze(e),s=o?e.offsetWidth:n,a=o?e.offsetHeight:r,l=$n(n)!==s||$n(r)!==a;return l&&(n=s,r=a),{width:n,height:r,$:l}}function pr(e){return Ge(e)?e:e.contextElement}function zt(e){const t=pr(e);if(!Ze(t))return bt(1);const n=t.getBoundingClientRect(),{width:r,height:o,$:s}=vi(t);let a=(s?$n(n.width):n.width)/r,l=(s?$n(n.height):n.height)/o;return(!a||!Number.isFinite(a))&&(a=1),(!l||!Number.isFinite(l))&&(l=1),{x:a,y:l}}var rc=bt(0);function bi(e){const t=Le(e);return!yr()||!t.visualViewport?rc:{x:t.visualViewport.offsetLeft,y:t.visualViewport.offsetTop}}function oc(e,t,n){return t===void 0&&(t=!1),!n||t&&n!==Le(e)?!1:t}function At(e,t,n,r){t===void 0&&(t=!1),n===void 0&&(n=!1);const o=e.getBoundingClientRect(),s=pr(e);let a=bt(1);t&&(r?Ge(r)&&(a=zt(r)):a=zt(e));const l=oc(s,n,r)?bi(s):bt(0);let i=(o.left+l.x)/a.x,c=(o.top+l.y)/a.y,d=o.width/a.x,u=o.height/a.y;if(s){const f=Le(s),h=r&&Ge(r)?Le(r):r;let g=f,p=g.frameElement;for(;p&&r&&h!==g;){const m=zt(p),v=p.getBoundingClientRect(),b=He(p),x=v.left+(p.clientLeft+parseFloat(b.paddingLeft))*m.x,w=v.top+(p.clientTop+parseFloat(b.paddingTop))*m.y;i*=m.x,c*=m.y,d*=m.x,u*=m.y,i+=x,c+=w,g=Le(p),p=g.frameElement}}return Sn({width:d,height:u,x:i,y:c})}function ic(e){let{elements:t,rect:n,offsetParent:r,strategy:o}=e;const s=o==="fixed",a=ft(r),l=t?Pn(t.floating):!1;if(r===a||l&&s)return n;let i={scrollLeft:0,scrollTop:0},c=bt(1);const d=bt(0),u=Ze(r);if((u||!u&&!s)&&((Ut(r)!=="body"||dn(a))&&(i=Ln(r)),Ze(r))){const f=At(r);c=zt(r),d.x=f.x+r.clientLeft,d.y=f.y+r.clientTop}return{width:n.width*c.x,height:n.height*c.y,x:n.x*c.x-i.scrollLeft*c.x+d.x,y:n.y*c.y-i.scrollTop*c.y+d.y}}function sc(e){return Array.from(e.getClientRects())}function xi(e){return At(ft(e)).left+Ln(e).scrollLeft}function ac(e){const t=ft(e),n=Ln(e),r=e.ownerDocument.body,o=Pe(t.scrollWidth,t.clientWidth,r.scrollWidth,r.clientWidth),s=Pe(t.scrollHeight,t.clientHeight,r.scrollHeight,r.clientHeight);let a=-n.scrollLeft+xi(e);const l=-n.scrollTop;return He(r).direction==="rtl"&&(a+=Pe(t.clientWidth,r.clientWidth)-o),{width:o,height:s,x:a,y:l}}function lc(e,t){const n=Le(e),r=ft(e),o=n.visualViewport;let s=r.clientWidth,a=r.clientHeight,l=0,i=0;if(o){s=o.width,a=o.height;const c=yr();(!c||c&&t==="fixed")&&(l=o.offsetLeft,i=o.offsetTop)}return{width:s,height:a,x:l,y:i}}function cc(e,t){const n=At(e,!0,t==="fixed"),r=n.top+e.clientTop,o=n.left+e.clientLeft,s=Ze(e)?zt(e):bt(1),a=e.clientWidth*s.x,l=e.clientHeight*s.y,i=o*s.x,c=r*s.y;return{width:a,height:l,x:i,y:c}}function uo(e,t,n){let r;if(t==="viewport")r=lc(e,n);else if(t==="document")r=ac(ft(e));else if(Ge(t))r=cc(t,n);else{const o=bi(e);r={...t,x:t.x-o.x,y:t.y-o.y}}return Sn(r)}function wi(e,t){const n=wt(e);return n===t||!Ge(n)||Bt(n)?!1:He(n).position==="fixed"||wi(n,t)}function uc(e,t){const n=t.get(e);if(n)return n;let r=sn(e,[],!1).filter(l=>Ge(l)&&Ut(l)!=="body"),o=null;const s=He(e).position==="fixed";let a=s?wt(e):e;for(;Ge(a)&&!Bt(a);){const l=He(a),i=hr(a);!i&&l.position==="fixed"&&(o=null),(s?!i&&!o:!i&&l.position==="static"&&!!o&&["absolute","fixed"].includes(o.position)||dn(a)&&!i&&wi(e,a))?r=r.filter(d=>d!==a):o=l,a=wt(a)}return t.set(e,r),r}function dc(e){let{element:t,boundary:n,rootBoundary:r,strategy:o}=e;const a=[...n==="clippingAncestors"?Pn(t)?[]:uc(t,this._c):[].concat(n),r],l=a[0],i=a.reduce((c,d)=>{const u=uo(t,d,o);return c.top=Pe(u.top,c.top),c.right=Ye(u.right,c.right),c.bottom=Ye(u.bottom,c.bottom),c.left=Pe(u.left,c.left),c},uo(t,l,o));return{width:i.right-i.left,height:i.bottom-i.top,x:i.left,y:i.top}}function fc(e){const{width:t,height:n}=vi(e);return{width:t,height:n}}function gc(e,t,n){const r=Ze(t),o=ft(t),s=n==="fixed",a=At(e,!0,s,t);let l={scrollLeft:0,scrollTop:0};const i=bt(0);if(r||!r&&!s)if((Ut(t)!=="body"||dn(o))&&(l=Ln(t)),r){const u=At(t,!0,s,t);i.x=u.x+t.clientLeft,i.y=u.y+t.clientTop}else o&&(i.x=xi(o));const c=a.left+l.scrollLeft-i.x,d=a.top+l.scrollTop-i.y;return{x:c,y:d,width:a.width,height:a.height}}function Bn(e){return He(e).position==="static"}function fo(e,t){return!Ze(e)||He(e).position==="fixed"?null:t?t(e):e.offsetParent}function $i(e,t){const n=Le(e);if(Pn(e))return n;if(!Ze(e)){let o=wt(e);for(;o&&!Bt(o);){if(Ge(o)&&!Bn(o))return o;o=wt(o)}return n}let r=fo(e,t);for(;r&&tc(r)&&Bn(r);)r=fo(r,t);return r&&Bt(r)&&Bn(r)&&!hr(r)?n:r||nc(e)||n}var hc=async function(e){const t=this.getOffsetParent||$i,n=this.getDimensions,r=await n(e.floating);return{reference:gc(e.reference,await t(e.floating),e.strategy),floating:{x:0,y:0,width:r.width,height:r.height}}};function yc(e){return He(e).direction==="rtl"}var Ci={convertOffsetParentRelativeRectToViewportRelativeRect:ic,getDocumentElement:ft,getClippingRect:dc,getOffsetParent:$i,getElementRects:hc,getClientRects:sc,getDimensions:fc,getScale:zt,isElement:Ge,isRTL:yc};function pc(e,t){let n=null,r;const o=ft(e);function s(){var l;clearTimeout(r),(l=n)==null||l.disconnect(),n=null}function a(l,i){l===void 0&&(l=!1),i===void 0&&(i=1),s();const{left:c,top:d,width:u,height:f}=e.getBoundingClientRect();if(l||t(),!u||!f)return;const h=mn(d),g=mn(o.clientWidth-(c+u)),p=mn(o.clientHeight-(d+f)),m=mn(c),b={rootMargin:-h+"px "+-g+"px "+-p+"px "+-m+"px",threshold:Pe(0,Ye(1,i))||1};let x=!0;function w($){const F=$[0].intersectionRatio;if(F!==i){if(!x)return a();F?a(!1,F):r=setTimeout(()=>{a(!1,1e-7)},1e3)}x=!1}try{n=new IntersectionObserver(w,{...b,root:o.ownerDocument})}catch{n=new IntersectionObserver(w,b)}n.observe(e)}return a(!0),s}function mc(e,t,n,r){r===void 0&&(r={});const{ancestorScroll:o=!0,ancestorResize:s=!0,elementResize:a=typeof ResizeObserver=="function",layoutShift:l=typeof IntersectionObserver=="function",animationFrame:i=!1}=r,c=pr(e),d=o||s?[...c?sn(c):[],...sn(t)]:[];d.forEach(v=>{o&&v.addEventListener("scroll",n,{passive:!0}),s&&v.addEventListener("resize",n)});const u=c&&l?pc(c,n):null;let f=-1,h=null;a&&(h=new ResizeObserver(v=>{let[b]=v;b&&b.target===c&&h&&(h.unobserve(t),cancelAnimationFrame(f),f=requestAnimationFrame(()=>{var x;(x=h)==null||x.observe(t)})),n()}),c&&!i&&h.observe(c),h.observe(t));let g,p=i?At(e):null;i&&m();function m(){const v=At(e);p&&(v.x!==p.x||v.y!==p.y||v.width!==p.width||v.height!==p.height)&&n(),p=v,g=requestAnimationFrame(m)}return n(),()=>{var v;d.forEach(b=>{o&&b.removeEventListener("scroll",n),s&&b.removeEventListener("resize",n)}),u?.(),(v=h)==null||v.disconnect(),h=null,i&&cancelAnimationFrame(g)}}var vc=Zl,bc=Jl,xc=Ql,wc=ec,$c=Yl,Cc=Wl,Sc=(e,t,n)=>{const r=new Map,o={platform:Ci,...n},s={...o.platform,_c:r};return jl(e,t,{...o,platform:s})},mr=be();function vr(){const e=xe(mr);if(e===void 0)throw new Error("[kobalte]: `usePopperContext` must be used within a `Popper` component");return e}var kc=_('<svg display="block" viewBox="0 0 30 30" style="transform:scale(1.02)"><g><path fill="none" d="M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z"></path><path stroke="none" d="M23,27.8c1.1,1.2,3.4,2.2,5,2.2h2H0h2c1.7,0,3.9-1,5-2.2l6.6-7.2c0.7-0.8,2-0.8,2.7,0L23,27.8L23,27.8z">'),tr=30,go=tr/2,Ec={top:180,right:-90,bottom:0,left:90};function br(e){const t=vr(),n=Q({size:tr},e),[r,o]=Z(n,["ref","style","size"]),s=()=>t.currentPlacement().split("-")[0],a=Mc(t.contentRef),l=()=>a()?.getPropertyValue("background-color")||"none",i=()=>a()?.getPropertyValue(`border-${s()}-color`)||"none",c=()=>a()?.getPropertyValue(`border-${s()}-width`)||"0px",d=()=>Number.parseInt(c())*2*(tr/r.size),u=()=>`rotate(${Ec[s()]} ${go} ${go}) translate(0 2)`;return y(de,j({as:"div",ref(f){const h=Me(t.setArrowRef,r.ref);typeof h=="function"&&h(f)},"aria-hidden":"true",get style(){return Tn({position:"absolute","font-size":`${r.size}px`,width:"1em",height:"1em","pointer-events":"none",fill:l(),stroke:i(),"stroke-width":d()},r.style)}},o,{get children(){const f=kc(),h=f.firstChild;return N(()=>A(h,"transform",u())),f}}))}function Mc(e){const[t,n]=R();return B(()=>{const r=e();r&&n(Ea(r).getComputedStyle(r))}),t}function Tc(e){const t=vr(),[n,r]=Z(e,["ref","style"]);return y(de,j({as:"div",ref(o){const s=Me(t.setPositionerRef,n.ref);typeof s=="function"&&s(o)},"data-popper-positioner":"",get style(){return Tn({position:"absolute",top:0,left:0,"min-width":"max-content"},n.style)}},r))}function ho(e){const{x:t=0,y:n=0,width:r=0,height:o=0}=e??{};if(typeof DOMRect=="function")return new DOMRect(t,n,r,o);const s={x:t,y:n,width:r,height:o,top:n,right:t+r,bottom:n+o,left:t};return{...s,toJSON:()=>s}}function Ac(e,t){return{contextElement:e,getBoundingClientRect:()=>{const r=t(e);return r?ho(r):e?e.getBoundingClientRect():ho()}}}function Ic(e){return/^(?:top|bottom|left|right)(?:-(?:start|end))?$/.test(e)}var Dc={top:"bottom",right:"left",bottom:"top",left:"right"};function Pc(e,t){const[n,r]=e.split("-"),o=Dc[n];return r?n==="left"||n==="right"?`${o} ${r==="start"?"top":"bottom"}`:r==="start"?`${o} ${t==="rtl"?"right":"left"}`:`${o} ${t==="rtl"?"left":"right"}`:`${o} center`}function Lc(e){const t=Q({getAnchorRect:f=>f?.getBoundingClientRect(),placement:"bottom",gutter:0,shift:0,flip:!0,slide:!0,overlap:!1,sameWidth:!1,fitViewport:!1,hideWhenDetached:!1,detachedPadding:0,arrowPadding:4,overflowPadding:8},e),[n,r]=R(),[o,s]=R(),[a,l]=R(t.placement),i=()=>Ac(t.anchorRef?.(),t.getAnchorRect),{direction:c}=$t();async function d(){const f=i(),h=n(),g=o();if(!f||!h)return;const p=(g?.clientHeight||0)/2,m=typeof t.gutter=="number"?t.gutter+p:t.gutter??p;h.style.setProperty("--kb-popper-content-overflow-padding",`${t.overflowPadding}px`),f.getBoundingClientRect();const v=[vc(({placement:F})=>{const D=!!F.split("-")[1];return{mainAxis:m,crossAxis:D?void 0:t.shift,alignmentAxis:t.shift}})];if(t.flip!==!1){const F=typeof t.flip=="string"?t.flip.split(" "):void 0;if(F!==void 0&&!F.every(Ic))throw new Error("`flip` expects a spaced-delimited list of placements");v.push(xc({padding:t.overflowPadding,fallbackPlacements:F}))}(t.slide||t.overlap)&&v.push(bc({mainAxis:t.slide,crossAxis:t.overlap,padding:t.overflowPadding})),v.push(wc({padding:t.overflowPadding,apply({availableWidth:F,availableHeight:D,rects:O}){const C=Math.round(O.reference.width);F=Math.floor(F),D=Math.floor(D),h.style.setProperty("--kb-popper-anchor-width",`${C}px`),h.style.setProperty("--kb-popper-content-available-width",`${F}px`),h.style.setProperty("--kb-popper-content-available-height",`${D}px`),t.sameWidth&&(h.style.width=`${C}px`),t.fitViewport&&(h.style.maxWidth=`${F}px`,h.style.maxHeight=`${D}px`)}})),t.hideWhenDetached&&v.push($c({padding:t.detachedPadding})),g&&v.push(Cc({element:g,padding:t.arrowPadding}));const b=await Sc(f,h,{placement:t.placement,strategy:"absolute",middleware:v,platform:{...Ci,isRTL:()=>c()==="rtl"}});if(l(b.placement),t.onCurrentPlacementChange?.(b.placement),!h)return;h.style.setProperty("--kb-popper-content-transform-origin",Pc(b.placement,c()));const x=Math.round(b.x),w=Math.round(b.y);let $;if(t.hideWhenDetached&&($=b.middlewareData.hide?.referenceHidden?"hidden":"visible"),Object.assign(h.style,{top:"0",left:"0",transform:`translate3d(${x}px, ${w}px, 0)`,visibility:$}),g&&b.middlewareData.arrow){const{x:F,y:D}=b.middlewareData.arrow,O=b.placement.split("-")[0];Object.assign(g.style,{left:F!=null?`${F}px`:"",top:D!=null?`${D}px`:"",[O]:"100%"})}}B(()=>{const f=i(),h=n();if(!f||!h)return;const g=mc(f,h,d,{elementResize:typeof ResizeObserver=="function"});U(g)}),B(()=>{const f=n(),h=t.contentRef?.();!f||!h||queueMicrotask(()=>{f.style.zIndex=getComputedStyle(h).zIndex})});const u={currentPlacement:a,contentRef:()=>t.contentRef?.(),setPositionerRef:r,setArrowRef:s};return y(mr.Provider,{value:u,get children(){return t.children}})}var Si=Object.assign(Lc,{Arrow:br,Context:mr,usePopperContext:vr,Positioner:Tc});function Oc(e){const t=n=>{n.key===sr.Escape&&e.onEscapeKeyDown?.(n)};B(()=>{if(E(e.isDisabled))return;const n=e.ownerDocument?.()??Xe();n.addEventListener("keydown",t),U(()=>{n.removeEventListener("keydown",t)})})}var yo="interactOutside.pointerDownOutside",po="interactOutside.focusOutside";function Fc(e,t){let n,r=Na;const o=()=>Xe(t()),s=u=>e.onPointerDownOutside?.(u),a=u=>e.onFocusOutside?.(u),l=u=>e.onInteractOutside?.(u),i=u=>{const f=u.target;return!(f instanceof HTMLElement)||f.closest(`[${wn}]`)||!Re(o(),f)||Re(t(),f)?!1:!e.shouldExcludeElement?.(f)},c=u=>{function f(){const h=t(),g=u.target;if(!h||!g||!i(u))return;const p=ve([s,l]);g.addEventListener(yo,p,{once:!0});const m=new CustomEvent(yo,{bubbles:!1,cancelable:!0,detail:{originalEvent:u,isContextMenu:u.button===2||Da(u)&&u.button===0}});g.dispatchEvent(m)}u.pointerType==="touch"?(o().removeEventListener("click",f),r=f,o().addEventListener("click",f,{once:!0})):f()},d=u=>{const f=t(),h=u.target;if(!f||!h||!i(u))return;const g=ve([a,l]);h.addEventListener(po,g,{once:!0});const p=new CustomEvent(po,{bubbles:!1,cancelable:!0,detail:{originalEvent:u,isContextMenu:!1}});h.dispatchEvent(p)};B(()=>{E(e.isDisabled)||(n=window.setTimeout(()=>{o().addEventListener("pointerdown",c,!0)},0),o().addEventListener("focusin",d,!0),U(()=>{window.clearTimeout(n),o().removeEventListener("click",r),o().removeEventListener("pointerdown",c,!0),o().removeEventListener("focusin",d,!0)}))})}var ki=be();function qc(){return xe(ki)}function _c(e){let t;const n=qc(),[r,o]=Z(e,["ref","disableOutsidePointerEvents","excludedElements","onEscapeKeyDown","onPointerDownOutside","onFocusOutside","onInteractOutside","onDismiss","bypassTopMostLayerCheck"]),s=new Set([]),a=u=>{s.add(u);const f=n?.registerNestedLayer(u);return()=>{s.delete(u),f?.()}};Fc({shouldExcludeElement:u=>t?r.excludedElements?.some(f=>Re(f(),u))||[...s].some(f=>Re(f,u)):!1,onPointerDownOutside:u=>{!t||Ie.isBelowPointerBlockingLayer(t)||!r.bypassTopMostLayerCheck&&!Ie.isTopMostLayer(t)||(r.onPointerDownOutside?.(u),r.onInteractOutside?.(u),u.defaultPrevented||r.onDismiss?.())},onFocusOutside:u=>{r.onFocusOutside?.(u),r.onInteractOutside?.(u),u.defaultPrevented||r.onDismiss?.()}},()=>t),Oc({ownerDocument:()=>Xe(t),onEscapeKeyDown:u=>{!t||!Ie.isTopMostLayer(t)||(r.onEscapeKeyDown?.(u),!u.defaultPrevented&&r.onDismiss&&(u.preventDefault(),r.onDismiss()))}}),Mt(()=>{if(!t)return;Ie.addLayer({node:t,isPointerBlocking:r.disableOutsidePointerEvents,dismiss:r.onDismiss});const u=n?.registerNestedLayer(t);Ie.assignPointerEventToLayers(),Ie.disableBodyPointerEvents(t),U(()=>{t&&(Ie.removeLayer(t),u?.(),Ie.assignPointerEventToLayers(),Ie.restoreBodyPointerEvents(t))})}),B(ut([()=>t,()=>r.disableOutsidePointerEvents],([u,f])=>{if(!u)return;const h=Ie.find(u);h&&h.isPointerBlocking!==f&&(h.isPointerBlocking=f,Ie.assignPointerEventToLayers()),f&&Ie.disableBodyPointerEvents(u),U(()=>{Ie.restoreBodyPointerEvents(u)})},{defer:!0}));const d={registerNestedLayer:a};return y(ki.Provider,{value:d,get children(){return y(de,j({as:"div",ref(u){const f=Me(h=>t=h,r.ref);typeof f=="function"&&f(u)}},o))}})}function Ei(e={}){const[t,n]=ei({value:()=>E(e.open),defaultValue:()=>!!E(e.defaultOpen),onChange:a=>e.onOpenChange?.(a)}),r=()=>{n(!0)},o=()=>{n(!1)};return{isOpen:t,setIsOpen:n,open:r,close:o,toggle:()=>{t()?o():r()}}}var _e={};Dn(_e,{Description:()=>Zo,ErrorMessage:()=>Jo,Item:()=>Ii,ItemControl:()=>Di,ItemDescription:()=>Pi,ItemIndicator:()=>Li,ItemInput:()=>Oi,ItemLabel:()=>Fi,Label:()=>qi,RadioGroup:()=>Rc,Root:()=>_i});var Mi=be();function Ti(){const e=xe(Mi);if(e===void 0)throw new Error("[kobalte]: `useRadioGroupContext` must be used within a `RadioGroup` component");return e}var Ai=be();function fn(){const e=xe(Ai);if(e===void 0)throw new Error("[kobalte]: `useRadioGroupItemContext` must be used within a `RadioGroup.Item` component");return e}function Ii(e){const t=cn(),n=Ti(),r=`${t.generateId("item")}-${Ke()}`,o=Q({id:r},e),[s,a]=Z(o,["value","disabled","onPointerDown"]),[l,i]=R(),[c,d]=R(),[u,f]=R(),[h,g]=R(),[p,m]=R(!1),v=M(()=>n.isSelectedValue(s.value)),b=M(()=>s.disabled||t.isDisabled()||!1),x=F=>{ue(F,s.onPointerDown),p()&&F.preventDefault()},w=M(()=>({...t.dataset(),"data-disabled":b()?"":void 0,"data-checked":v()?"":void 0})),$={value:()=>s.value,dataset:w,isSelected:v,isDisabled:b,inputId:l,labelId:c,descriptionId:u,inputRef:h,select:()=>n.setSelectedValue(s.value),generateId:ln(()=>a.id),registerInput:ze(i),registerLabel:ze(d),registerDescription:ze(f),setIsFocused:m,setInputRef:g};return y(Ai.Provider,{value:$,get children(){return y(de,j({as:"div",role:"group",onPointerDown:x},w,a))}})}function Di(e){const t=fn(),n=Q({id:t.generateId("control")},e),[r,o]=Z(n,["onClick","onKeyDown"]);return y(de,j({as:"div",onClick:l=>{ue(l,r.onClick),t.select(),t.inputRef()?.focus()},onKeyDown:l=>{ue(l,r.onKeyDown),l.key===sr.Space&&(t.select(),t.inputRef()?.focus())}},()=>t.dataset(),o))}function Pi(e){const t=fn(),n=Q({id:t.generateId("description")},e);return B(()=>U(t.registerDescription(n.id))),y(de,j({as:"div"},()=>t.dataset(),n))}function Li(e){const t=fn(),n=Q({id:t.generateId("indicator")},e),[r,o]=Z(n,["ref","forceMount"]),[s,a]=R(),{present:l}=ui({show:()=>r.forceMount||t.isSelected(),element:()=>s()??null});return y(z,{get when(){return l()},get children(){return y(de,j({as:"div",ref(i){const c=Me(a,r.ref);typeof c=="function"&&c(i)}},()=>t.dataset(),o))}})}function Oi(e){const t=cn(),n=Ti(),r=fn(),o=Q({id:r.generateId("input")},e),[s,a]=Z(o,["ref","style","aria-labelledby","aria-describedby","onChange","onFocus","onBlur"]),l=()=>[s["aria-labelledby"],r.labelId(),s["aria-labelledby"]!=null&&a["aria-label"]!=null?a.id:void 0].filter(Boolean).join(" ")||void 0,i=()=>[s["aria-describedby"],r.descriptionId(),n.ariaDescribedBy()].filter(Boolean).join(" ")||void 0,[c,d]=R(!1),u=g=>{if(ue(g,s.onChange),g.stopPropagation(),!c()){n.setSelectedValue(r.value());const p=g.target;p.checked=r.isSelected()}d(!1)},f=g=>{ue(g,s.onFocus),r.setIsFocused(!0)},h=g=>{ue(g,s.onBlur),r.setIsFocused(!1)};return B(ut([()=>r.isSelected(),()=>r.value()],g=>{if(!g[0]&&g[1]===r.value())return;d(!0);const p=r.inputRef();p?.dispatchEvent(new Event("input",{bubbles:!0,cancelable:!0})),p?.dispatchEvent(new Event("change",{bubbles:!0,cancelable:!0}))},{defer:!0})),B(()=>U(r.registerInput(a.id))),y(de,j({as:"input",ref(g){const p=Me(r.setInputRef,s.ref);typeof p=="function"&&p(g)},type:"radio",get name(){return t.name()},get value(){return r.value()},get checked(){return r.isSelected()},get required(){return t.isRequired()},get disabled(){return r.isDisabled()},get readonly(){return t.isReadOnly()},get style(){return Tn({...Yo},s.style)},get"aria-labelledby"(){return l()},get"aria-describedby"(){return i()},onChange:u,onFocus:f,onBlur:h},()=>r.dataset(),a))}function Fi(e){const t=fn(),n=Q({id:t.generateId("label")},e);return B(()=>U(t.registerLabel(n.id))),y(de,j({as:"label",get for(){return t.inputId()}},()=>t.dataset(),n))}function qi(e){return y(ja,j({as:"span"},e))}function _i(e){let t;const n=`radiogroup-${Ke()}`,r=Q({id:n,orientation:"vertical"},e),[o,s,a]=Z(r,["ref","value","defaultValue","onChange","orientation","aria-labelledby","aria-describedby"],Ha),[l,i]=un({value:()=>o.value,defaultValue:()=>o.defaultValue,onChange:g=>o.onChange?.(g)}),{formControlContext:c}=Va(s);Wa(()=>t,()=>i(o.defaultValue??""));const d=()=>c.getAriaLabelledBy(E(s.id),a["aria-label"],o["aria-labelledby"]),u=()=>c.getAriaDescribedBy(o["aria-describedby"]),f=g=>g===l(),h={ariaDescribedBy:u,isSelectedValue:f,setSelectedValue:g=>{if(!(c.isReadOnly()||c.isDisabled())&&(i(g),t))for(const p of t.querySelectorAll("[type='radio']")){const m=p;m.checked=f(m.value)}}};return y(Xo.Provider,{value:c,get children(){return y(Mi.Provider,{value:h,get children(){return y(de,j({as:"div",ref(g){const p=Me(m=>t=m,o.ref);typeof p=="function"&&p(g)},role:"radiogroup",get id(){return E(s.id)},get"aria-invalid"(){return c.validationState()==="invalid"||void 0},get"aria-required"(){return c.isRequired()||void 0},get"aria-disabled"(){return c.isDisabled()||void 0},get"aria-readonly"(){return c.isReadOnly()||void 0},get"aria-orientation"(){return o.orientation},get"aria-labelledby"(){return d()},get"aria-describedby"(){return u()}},()=>c.dataset(),a))}})}})}var Rc=Object.assign(_i,{Description:Zo,ErrorMessage:Jo,Item:Ii,ItemControl:Di,ItemDescription:Pi,ItemIndicator:Li,ItemInput:Oi,ItemLabel:Fi,Label:qi}),zc=class{collection;ref;collator;constructor(e,t,n){this.collection=e,this.ref=t,this.collator=n}getKeyBelow(e){let t=this.collection().getKeyAfter(e);for(;t!=null;){const n=this.collection().getItem(t);if(n&&n.type==="item"&&!n.disabled)return t;t=this.collection().getKeyAfter(t)}}getKeyAbove(e){let t=this.collection().getKeyBefore(e);for(;t!=null;){const n=this.collection().getItem(t);if(n&&n.type==="item"&&!n.disabled)return t;t=this.collection().getKeyBefore(t)}}getFirstKey(){let e=this.collection().getFirstKey();for(;e!=null;){const t=this.collection().getItem(e);if(t&&t.type==="item"&&!t.disabled)return e;e=this.collection().getKeyAfter(e)}}getLastKey(){let e=this.collection().getLastKey();for(;e!=null;){const t=this.collection().getItem(e);if(t&&t.type==="item"&&!t.disabled)return e;e=this.collection().getKeyBefore(e)}}getItem(e){return this.ref?.()?.querySelector(`[data-key="${e}"]`)??null}getKeyPageAbove(e){const t=this.ref?.();let n=this.getItem(e);if(!t||!n)return;const r=Math.max(0,n.offsetTop+n.offsetHeight-t.offsetHeight);let o=e;for(;o&&n&&n.offsetTop>r;)o=this.getKeyAbove(o),n=o!=null?this.getItem(o):null;return o}getKeyPageBelow(e){const t=this.ref?.();let n=this.getItem(e);if(!t||!n)return;const r=Math.min(t.scrollHeight,n.offsetTop-n.offsetHeight+t.offsetHeight);let o=e;for(;o&&n&&n.offsetTop<r;)o=this.getKeyBelow(o),n=o!=null?this.getItem(o):null;return o}getKeyForSearch(e,t){const n=this.collator?.();if(!n)return;let r=t!=null?this.getKeyBelow(t):this.getFirstKey();for(;r!=null;){const o=this.collection().getItem(r);if(o){const s=o.textValue.slice(0,e.length);if(o.textValue&&n.compare(s,e)===0)return r}r=this.getKeyBelow(r)}}};function Kc(e,t,n){const r=yl({usage:"search",sensitivity:"base"}),o=M(()=>{const s=E(e.keyboardDelegate);return s||new zc(e.collection,t,r)});return $l({selectionManager:()=>E(e.selectionManager),keyboardDelegate:o,autoFocus:()=>E(e.autoFocus),deferAutoFocus:()=>E(e.deferAutoFocus),shouldFocusWrap:()=>E(e.shouldFocusWrap),disallowEmptySelection:()=>E(e.disallowEmptySelection),selectOnFocus:()=>E(e.selectOnFocus),disallowTypeAhead:()=>E(e.disallowTypeAhead),shouldUseVirtualFocus:()=>E(e.shouldUseVirtualFocus),allowsTabNavigation:()=>E(e.allowsTabNavigation),isVirtualized:()=>E(e.isVirtualized),scrollToKey:s=>E(e.scrollToKey)?.(s),orientation:()=>E(e.orientation)},t)}var Nn="focusScope.autoFocusOnMount",Un="focusScope.autoFocusOnUnmount",mo={bubbles:!1,cancelable:!0},vo={stack:[],active(){return this.stack[0]},add(e){e!==this.active()&&this.active()?.pause(),this.stack=Qn(this.stack,e),this.stack.unshift(e)},remove(e){this.stack=Qn(this.stack,e),this.active()?.resume()}};function Bc(e,t){const[n,r]=R(!1),o={pause(){r(!0)},resume(){r(!1)}};let s=null;const a=g=>e.onMountAutoFocus?.(g),l=g=>e.onUnmountAutoFocus?.(g),i=()=>Xe(t()),c=()=>{const g=i().createElement("span");return g.setAttribute("data-focus-trap",""),g.tabIndex=0,Object.assign(g.style,Yo),g},d=()=>{const g=t();return g?Wo(g,!0).filter(p=>!p.hasAttribute("data-focus-trap")):[]},u=()=>{const g=d();return g.length>0?g[0]:null},f=()=>{const g=d();return g.length>0?g[g.length-1]:null},h=()=>{const g=t();if(!g)return!1;const p=en(g);return!p||Re(g,p)?!1:Qo(p)};B(()=>{const g=t();if(!g)return;vo.add(o);const p=en(g);if(!Re(g,p)){const v=new CustomEvent(Nn,mo);g.addEventListener(Nn,a),g.dispatchEvent(v),v.defaultPrevented||setTimeout(()=>{Se(u()),en(g)===p&&Se(g)},0)}U(()=>{g.removeEventListener(Nn,a),setTimeout(()=>{const v=new CustomEvent(Un,mo);h()&&v.preventDefault(),g.addEventListener(Un,l),g.dispatchEvent(v),v.defaultPrevented||Se(p??i().body),g.removeEventListener(Un,l),vo.remove(o)},0)})}),B(()=>{const g=t();if(!g||!E(e.trapFocus)||n())return;const p=v=>{const b=v.target;b?.closest(`[${wn}]`)||(Re(g,b)?s=b:Se(s))},m=v=>{const x=v.relatedTarget??en(g);x?.closest(`[${wn}]`)||Re(g,x)||Se(s)};i().addEventListener("focusin",p),i().addEventListener("focusout",m),U(()=>{i().removeEventListener("focusin",p),i().removeEventListener("focusout",m)})}),B(()=>{const g=t();if(!g||!E(e.trapFocus)||n())return;const p=c();g.insertAdjacentElement("afterbegin",p);const m=c();g.insertAdjacentElement("beforeend",m);function v(x){const w=u(),$=f();x.relatedTarget===w?Se($):Se(w)}p.addEventListener("focusin",v),m.addEventListener("focusin",v);const b=new MutationObserver(x=>{for(const w of x)w.previousSibling===m&&(m.remove(),g.insertAdjacentElement("beforeend",m)),w.nextSibling===p&&(p.remove(),g.insertAdjacentElement("afterbegin",p))});b.observe(g,{childList:!0,subtree:!1}),U(()=>{p.removeEventListener("focusin",v),m.removeEventListener("focusin",v),p.remove(),m.remove(),b.disconnect()})})}var Nc="data-live-announcer";function Uc(e){B(()=>{E(e.isDisabled)||U(Gc(E(e.targets),E(e.root)))})}var Xt=new WeakMap,qe=[];function Gc(e,t=document.body){const n=new Set(e),r=new Set,o=i=>{for(const f of i.querySelectorAll(`[${Nc}], [${wn}]`))n.add(f);const c=f=>{if(n.has(f)||f.parentElement&&r.has(f.parentElement)&&f.parentElement.getAttribute("role")!=="row")return NodeFilter.FILTER_REJECT;for(const h of n)if(f.contains(h))return NodeFilter.FILTER_SKIP;return NodeFilter.FILTER_ACCEPT},d=document.createTreeWalker(i,NodeFilter.SHOW_ELEMENT,{acceptNode:c}),u=c(i);if(u===NodeFilter.FILTER_ACCEPT&&s(i),u!==NodeFilter.FILTER_REJECT){let f=d.nextNode();for(;f!=null;)s(f),f=d.nextNode()}},s=i=>{const c=Xt.get(i)??0;i.getAttribute("aria-hidden")==="true"&&c===0||(c===0&&i.setAttribute("aria-hidden","true"),r.add(i),Xt.set(i,c+1))};qe.length&&qe[qe.length-1].disconnect(),o(t);const a=new MutationObserver(i=>{for(const c of i)if(!(c.type!=="childList"||c.addedNodes.length===0)&&![...n,...r].some(d=>d.contains(c.target))){for(const d of c.removedNodes)d instanceof Element&&(n.delete(d),r.delete(d));for(const d of c.addedNodes)(d instanceof HTMLElement||d instanceof SVGElement)&&(d.dataset.liveAnnouncer==="true"||d.dataset.reactAriaTopLayer==="true")?n.add(d):d instanceof Element&&o(d)}});a.observe(t,{childList:!0,subtree:!0});const l={observe(){a.observe(t,{childList:!0,subtree:!0})},disconnect(){a.disconnect()}};return qe.push(l),()=>{a.disconnect();for(const i of r){const c=Xt.get(i);if(c==null)return;c===1?(i.removeAttribute("aria-hidden"),Xt.delete(i)):Xt.set(i,c-1)}l===qe[qe.length-1]?(qe.pop(),qe.length&&qe[qe.length-1].observe()):qe.splice(qe.indexOf(l),1)}}var vn=new Map,Hc=e=>{B(()=>{const t=Ce(e.style)??{},n=Ce(e.properties)??[],r={};for(const s in t)r[s]=e.element.style[s];const o=vn.get(e.key);o?o.activeCount++:vn.set(e.key,{activeCount:1,originalStyles:r,properties:n.map(s=>s.key)}),Object.assign(e.element.style,e.style);for(const s of n)e.element.style.setProperty(s.key,s.value);U(()=>{const s=vn.get(e.key);if(s){if(s.activeCount!==1){s.activeCount--;return}vn.delete(e.key);for(const[a,l]of Object.entries(s.originalStyles))e.element.style[a]=l;for(const a of s.properties)e.element.style.removeProperty(a);e.element.style.length===0&&e.element.removeAttribute("style"),e.cleanup?.()}})})},bo=Hc,Vc=(e,t)=>{switch(t){case"x":return[e.clientWidth,e.scrollLeft,e.scrollWidth];case"y":return[e.clientHeight,e.scrollTop,e.scrollHeight]}},jc=(e,t)=>{const n=getComputedStyle(e),r=t==="x"?n.overflowX:n.overflowY;return r==="auto"||r==="scroll"||e.tagName==="HTML"&&r==="visible"},Wc=(e,t,n)=>{const r=t==="x"&&window.getComputedStyle(e).direction==="rtl"?-1:1;let o=e,s=0,a=0,l=!1;do{const[i,c,d]=Vc(o,t),u=d-i-r*c;(c!==0||u!==0)&&jc(o,t)&&(s+=u,a+=c),o===(n??document.documentElement)?l=!0:o=o._$host??o.parentElement}while(o&&!l);return[s,a]},[xo,wo]=R([]),Qc=e=>xo().indexOf(e)===xo().length-1,Yc=e=>{const t=j({element:null,enabled:!0,hideScrollbar:!0,preventScrollbarShift:!0,preventScrollbarShiftMode:"padding",restoreScrollPosition:!0,allowPinchZoom:!1},e),n=Ke();let r=[0,0],o=null,s=null;B(()=>{Ce(t.enabled)&&(wo(c=>[...c,n]),U(()=>{wo(c=>c.filter(d=>d!==n))}))}),B(()=>{if(!Ce(t.enabled)||!Ce(t.hideScrollbar))return;const{body:c}=document,d=window.innerWidth-c.offsetWidth;if(Ce(t.preventScrollbarShift)){const u={overflow:"hidden"},f=[];d>0&&(Ce(t.preventScrollbarShiftMode)==="padding"?u.paddingRight=`calc(${window.getComputedStyle(c).paddingRight} + ${d}px)`:u.marginRight=`calc(${window.getComputedStyle(c).marginRight} + ${d}px)`,f.push({key:"--scrollbar-width",value:`${d}px`}));const h=window.scrollY,g=window.scrollX;bo({key:"prevent-scroll",element:c,style:u,properties:f,cleanup:()=>{Ce(t.restoreScrollPosition)&&d>0&&window.scrollTo(g,h)}})}else bo({key:"prevent-scroll",element:c,style:{overflow:"hidden"}})}),B(()=>{!Qc(n)||!Ce(t.enabled)||(document.addEventListener("wheel",l,{passive:!1}),document.addEventListener("touchstart",a,{passive:!1}),document.addEventListener("touchmove",i,{passive:!1}),U(()=>{document.removeEventListener("wheel",l),document.removeEventListener("touchstart",a),document.removeEventListener("touchmove",i)}))});const a=c=>{r=$o(c),o=null,s=null},l=c=>{const d=c.target,u=Ce(t.element),f=Xc(c),h=Math.abs(f[0])>Math.abs(f[1])?"x":"y",g=h==="x"?f[0]:f[1],p=Co(d,h,g,u);let m;u&&nr(u,d)?m=!p:m=!0,m&&c.cancelable&&c.preventDefault()},i=c=>{const d=Ce(t.element),u=c.target;let f;if(c.touches.length===2)f=!Ce(t.allowPinchZoom);else{if(o==null||s===null){const h=$o(c).map((p,m)=>r[m]-p),g=Math.abs(h[0])>Math.abs(h[1])?"x":"y";o=g,s=g==="x"?h[0]:h[1]}if(u.type==="range")f=!1;else{const h=Co(u,o,s,d);d&&nr(d,u)?f=!h:f=!0}}f&&c.cancelable&&c.preventDefault()}},Xc=e=>[e.deltaX,e.deltaY],$o=e=>e.changedTouches[0]?[e.changedTouches[0].clientX,e.changedTouches[0].clientY]:[0,0],Co=(e,t,n,r)=>{const o=r!==null&&nr(r,e),[s,a]=Wc(e,t,o?r:void 0);return!(n>0&&Math.abs(s)<=1||n<0&&Math.abs(a)<1)},nr=(e,t)=>{if(e.contains(t))return!0;let n=t;for(;n;){if(n===e)return!0;n=n._$host??n.parentElement}return!1},Zc=Yc,Jc=Zc,Ri=be();function zi(){return xe(Ri)}function gt(){const e=zi();if(e===void 0)throw new Error("[kobalte]: `useMenuContext` must be used within a `Menu` component");return e}var Ki=be();function xr(){const e=xe(Ki);if(e===void 0)throw new Error("[kobalte]: `useMenuItemContext` must be used within a `Menu.Item` component");return e}var Bi=be();function Je(){const e=xe(Bi);if(e===void 0)throw new Error("[kobalte]: `useMenuRootContext` must be used within a `MenuRoot` component");return e}function wr(e){let t;const n=Je(),r=gt(),o=Q({id:n.generateId(`item-${Ke()}`)},e),[s,a]=Z(o,["ref","textValue","disabled","closeOnSelect","checked","indeterminate","onSelect","onPointerMove","onPointerLeave","onPointerDown","onPointerUp","onClick","onKeyDown","onMouseDown","onFocus"]),[l,i]=R(),[c,d]=R(),[u,f]=R(),h=()=>r.listState().selectionManager(),g=()=>a.id,p=()=>h().focusedKey()===g(),m=()=>{s.onSelect?.(),s.closeOnSelect&&setTimeout(()=>{r.close(!0)})};al({getItem:()=>({ref:()=>t,type:"item",key:g(),textValue:s.textValue??u()?.textContent??t?.textContent??"",disabled:s.disabled??!1})});const v=ci({key:g,selectionManager:h,shouldSelectOnPressUp:!0,allowsDifferentPressOrigin:!0,disabled:()=>s.disabled},()=>t),b=C=>{ue(C,s.onPointerMove),C.pointerType==="mouse"&&(s.disabled?r.onItemLeave(C):(r.onItemEnter(C),C.defaultPrevented||(Se(C.currentTarget),r.listState().selectionManager().setFocused(!0),r.listState().selectionManager().setFocusedKey(g()))))},x=C=>{ue(C,s.onPointerLeave),C.pointerType==="mouse"&&r.onItemLeave(C)},w=C=>{ue(C,s.onPointerUp),!s.disabled&&C.button===0&&m()},$=C=>{if(ue(C,s.onKeyDown),!C.repeat&&!s.disabled)switch(C.key){case"Enter":case" ":m();break}},F=M(()=>{if(s.indeterminate)return"mixed";if(s.checked!=null)return s.checked}),D=M(()=>({"data-indeterminate":s.indeterminate?"":void 0,"data-checked":s.checked&&!s.indeterminate?"":void 0,"data-disabled":s.disabled?"":void 0,"data-highlighted":p()?"":void 0})),O={isChecked:()=>s.checked,dataset:D,setLabelRef:f,generateId:ln(()=>a.id),registerLabel:ze(i),registerDescription:ze(d)};return y(Ki.Provider,{value:O,get children(){return y(de,j({as:"div",ref(C){const P=Me(V=>t=V,s.ref);typeof P=="function"&&P(C)},get tabIndex(){return v.tabIndex()},get"aria-checked"(){return F()},get"aria-disabled"(){return s.disabled},get"aria-labelledby"(){return l()},get"aria-describedby"(){return c()},get"data-key"(){return v.dataKey()},get onPointerDown(){return ve([s.onPointerDown,v.onPointerDown])},get onPointerUp(){return ve([w,v.onPointerUp])},get onClick(){return ve([s.onClick,v.onClick])},get onKeyDown(){return ve([$,v.onKeyDown])},get onMouseDown(){return ve([s.onMouseDown,v.onMouseDown])},get onFocus(){return ve([s.onFocus,v.onFocus])},onPointerMove:b,onPointerLeave:x},D,a))}})}function Ni(e){const t=Q({closeOnSelect:!1},e),[n,r]=Z(t,["checked","defaultChecked","onChange","onSelect"]),o=Za({isSelected:()=>n.checked,defaultIsSelected:()=>n.defaultChecked,onSelectedChange:a=>n.onChange?.(a),isDisabled:()=>r.disabled});return y(wr,j({role:"menuitemcheckbox",get checked(){return o.isSelected()},onSelect:()=>{n.onSelect?.(),o.toggle()}},r))}var eu=be();function On(){return xe(eu)}var an={next:(e,t)=>e==="ltr"?t==="horizontal"?"ArrowRight":"ArrowDown":t==="horizontal"?"ArrowLeft":"ArrowUp",previous:(e,t)=>an.next(e==="ltr"?"rtl":"ltr",t)},So={first:e=>e==="horizontal"?"ArrowDown":"ArrowRight",last:e=>e==="horizontal"?"ArrowUp":"ArrowLeft"};function Ui(e){const t=Je(),n=gt(),r=On(),{direction:o}=$t(),s=Q({id:t.generateId("trigger")},e),[a,l]=Z(s,["ref","id","disabled","onPointerDown","onClick","onKeyDown","onMouseOver","onFocus"]);let i=()=>t.value();r!==void 0&&(i=()=>t.value()??a.id,r.lastValue()===void 0&&r.setLastValue(i));const c=In(()=>n.triggerRef(),()=>"button"),d=M(()=>c()==="a"&&n.triggerRef()?.getAttribute("href")!=null);B(ut(()=>r?.value(),v=>{d()&&v===i()&&n.triggerRef()?.focus()}));const u=()=>{r!==void 0?n.isOpen()?r.value()===i()&&r.closeMenu():(r.autoFocusMenu()||r.setAutoFocusMenu(!0),n.open(!1)):n.toggle(!0)},f=v=>{ue(v,a.onPointerDown),v.currentTarget.dataset.pointerType=v.pointerType,!a.disabled&&v.pointerType!=="touch"&&v.button===0&&u()},h=v=>{ue(v,a.onClick),a.disabled||v.currentTarget.dataset.pointerType==="touch"&&u()},g=v=>{if(ue(v,a.onKeyDown),!a.disabled){if(d())switch(v.key){case"Enter":case" ":return}switch(v.key){case"Enter":case" ":case So.first(t.orientation()):v.stopPropagation(),v.preventDefault(),Ga(v.currentTarget),n.open("first"),r?.setAutoFocusMenu(!0),r?.setValue(i);break;case So.last(t.orientation()):v.stopPropagation(),v.preventDefault(),n.open("last");break;case an.next(o(),t.orientation()):if(r===void 0)break;v.stopPropagation(),v.preventDefault(),r.nextMenu();break;case an.previous(o(),t.orientation()):if(r===void 0)break;v.stopPropagation(),v.preventDefault(),r.previousMenu();break}}},p=v=>{ue(v,a.onMouseOver),n.triggerRef()?.dataset.pointerType!=="touch"&&!a.disabled&&r!==void 0&&r.value()!==void 0&&r.setValue(i)},m=v=>{ue(v,a.onFocus),r!==void 0&&v.currentTarget.dataset.pointerType!=="touch"&&r.setValue(i)};return B(()=>U(n.registerTriggerId(a.id))),y(dr,j({ref(v){const b=Me(n.setTriggerRef,a.ref);typeof b=="function"&&b(v)},get"data-kb-menu-value-trigger"(){return t.value()},get id(){return a.id},get disabled(){return a.disabled},"aria-haspopup":"true",get"aria-expanded"(){return n.isOpen()},get"aria-controls"(){return M(()=>!!n.isOpen())()?n.contentId():void 0},get"data-highlighted"(){return i()!==void 0&&r?.value()===i()?!0:void 0},get tabIndex(){return r!==void 0?r.value()===i()||r.lastValue()===i()?0:-1:void 0},onPointerDown:f,onMouseOver:p,onClick:h,onKeyDown:g,onFocus:m,role:r!==void 0?"menuitem":void 0},()=>n.dataset(),l))}var tu=be();function Gi(){return xe(tu)}function Hi(e){let t;const n=Je(),r=gt(),o=On(),s=Gi(),{direction:a}=$t(),l=Q({id:n.generateId(`content-${Ke()}`)},e),[i,c]=Z(l,["ref","id","style","onOpenAutoFocus","onCloseAutoFocus","onEscapeKeyDown","onFocusOutside","onPointerEnter","onPointerMove","onKeyDown","onMouseDown","onFocusIn","onFocusOut"]);let d=0;const u=()=>r.parentMenuContext()==null&&o===void 0&&n.isModal(),f=Kc({selectionManager:r.listState().selectionManager,collection:r.listState().collection,autoFocus:r.autoFocus,deferAutoFocus:!0,shouldFocusWrap:!0,disallowTypeAhead:()=>!r.listState().selectionManager().isFocused(),orientation:()=>n.orientation()==="horizontal"?"vertical":"horizontal"},()=>t);Bc({trapFocus:()=>u()&&r.isOpen(),onMountAutoFocus:x=>{o===void 0&&i.onOpenAutoFocus?.(x)},onUnmountAutoFocus:i.onCloseAutoFocus},()=>t);const h=x=>{if(Re(x.currentTarget,x.target)&&(x.key==="Tab"&&r.isOpen()&&x.preventDefault(),o!==void 0&&x.currentTarget.getAttribute("aria-haspopup")!=="true"))switch(x.key){case an.next(a(),n.orientation()):x.stopPropagation(),x.preventDefault(),r.close(!0),o.setAutoFocusMenu(!0),o.nextMenu();break;case an.previous(a(),n.orientation()):if(x.currentTarget.hasAttribute("data-closed"))break;x.stopPropagation(),x.preventDefault(),r.close(!0),o.setAutoFocusMenu(!0),o.previousMenu();break}},g=x=>{i.onEscapeKeyDown?.(x),o?.setAutoFocusMenu(!1),r.close(!0)},p=x=>{i.onFocusOutside?.(x),n.isModal()&&x.preventDefault()},m=x=>{ue(x,i.onPointerEnter),r.isOpen()&&(r.parentMenuContext()?.listState().selectionManager().setFocused(!1),r.parentMenuContext()?.listState().selectionManager().setFocusedKey(void 0))},v=x=>{if(ue(x,i.onPointerMove),x.pointerType!=="mouse")return;const w=x.target,$=d!==x.clientX;Re(x.currentTarget,w)&&$&&(r.setPointerDir(x.clientX>d?"right":"left"),d=x.clientX)};B(()=>U(r.registerContentId(i.id)));const b={ref:Me(x=>{r.setContentRef(x),t=x},i.ref),role:"menu",get id(){return i.id},get tabIndex(){return f.tabIndex()},get"aria-labelledby"(){return r.triggerId()},onKeyDown:ve([i.onKeyDown,f.onKeyDown,h]),onMouseDown:ve([i.onMouseDown,f.onMouseDown]),onFocusIn:ve([i.onFocusIn,f.onFocusIn]),onFocusOut:ve([i.onFocusOut,f.onFocusOut]),onPointerEnter:m,onPointerMove:v,get"data-orientation"(){return n.orientation()}};return y(z,{get when(){return r.contentPresent()},get children(){return y(z,{get when(){return s===void 0||r.parentMenuContext()!=null},get fallback(){return y(de,j({as:"div"},()=>r.dataset(),b,c))},get children(){return y(Si.Positioner,{get children(){return y(_c,j({get disableOutsidePointerEvents(){return M(()=>!!u())()&&r.isOpen()},get excludedElements(){return[r.triggerRef]},bypassTopMostLayerCheck:!0,get style(){return Tn({"--kb-menu-content-transform-origin":"var(--kb-popper-content-transform-origin)",position:"relative"},i.style)},onEscapeKeyDown:g,onFocusOutside:p,get onDismiss(){return r.close}},()=>r.dataset(),b,c))}})}})}})}function nu(e){let t;const n=Je(),r=gt(),[o,s]=Z(e,["ref"]);return Jc({element:()=>t??null,enabled:()=>r.contentPresent()&&n.preventScroll()}),y(Hi,j({ref(a){const l=Me(i=>{t=i},o.ref);typeof l=="function"&&l(a)}},s))}var Vi=be();function ru(){const e=xe(Vi);if(e===void 0)throw new Error("[kobalte]: `useMenuGroupContext` must be used within a `Menu.Group` component");return e}function $r(e){const t=Je(),n=Q({id:t.generateId(`group-${Ke()}`)},e),[r,o]=R(),s={generateId:ln(()=>n.id),registerLabelId:ze(o)};return y(Vi.Provider,{value:s,get children(){return y(de,j({as:"div",role:"group",get"aria-labelledby"(){return r()}},n))}})}function ji(e){const t=ru(),n=Q({id:t.generateId("label")},e),[r,o]=Z(n,["id"]);return B(()=>U(t.registerLabelId(r.id))),y(de,j({as:"span",get id(){return r.id},"aria-hidden":"true"},o))}function Wi(e){const t=gt(),n=Q({children:"▼"},e);return y(de,j({as:"span","aria-hidden":"true"},()=>t.dataset(),n))}function Qi(e){return y(wr,j({role:"menuitem",closeOnSelect:!0},e))}function Yi(e){const t=xr(),n=Q({id:t.generateId("description")},e),[r,o]=Z(n,["id"]);return B(()=>U(t.registerDescription(r.id))),y(de,j({as:"div",get id(){return r.id}},()=>t.dataset(),o))}function Xi(e){const t=xr(),n=Q({id:t.generateId("indicator")},e),[r,o]=Z(n,["forceMount"]);return y(z,{get when(){return r.forceMount||t.isChecked()},get children(){return y(de,j({as:"div"},()=>t.dataset(),o))}})}function Zi(e){const t=xr(),n=Q({id:t.generateId("label")},e),[r,o]=Z(n,["ref","id"]);return B(()=>U(t.registerLabel(r.id))),y(de,j({as:"div",ref(s){const a=Me(t.setLabelRef,r.ref);typeof a=="function"&&a(s)},get id(){return r.id}},()=>t.dataset(),o))}function Ji(e){const t=gt();return y(z,{get when(){return t.contentPresent()},get children(){return y(Oo,e)}})}var es=be();function ou(){const e=xe(es);if(e===void 0)throw new Error("[kobalte]: `useMenuRadioGroupContext` must be used within a `Menu.RadioGroup` component");return e}function ts(e){const n=Je().generateId(`radiogroup-${Ke()}`),r=Q({id:n},e),[o,s]=Z(r,["value","defaultValue","onChange","disabled"]),[a,l]=un({value:()=>o.value,defaultValue:()=>o.defaultValue,onChange:c=>o.onChange?.(c)}),i={isDisabled:()=>o.disabled,isSelectedValue:c=>c===a(),setSelectedValue:l};return y(es.Provider,{value:i,get children(){return y($r,s)}})}function ns(e){const t=ou(),n=Q({closeOnSelect:!1},e),[r,o]=Z(n,["value","onSelect"]);return y(wr,j({role:"menuitemradio",get checked(){return t.isSelectedValue(r.value)},onSelect:()=>{r.onSelect?.(),t.setSelectedValue(r.value)}},o))}function iu(e,t,n){const r=e.split("-")[0],o=n.getBoundingClientRect(),s=[],a=t.clientX,l=t.clientY;switch(r){case"top":s.push([a,l+5]),s.push([o.left,o.bottom]),s.push([o.left,o.top]),s.push([o.right,o.top]),s.push([o.right,o.bottom]);break;case"right":s.push([a-5,l]),s.push([o.left,o.top]),s.push([o.right,o.top]),s.push([o.right,o.bottom]),s.push([o.left,o.bottom]);break;case"bottom":s.push([a,l-5]),s.push([o.right,o.top]),s.push([o.right,o.bottom]),s.push([o.left,o.bottom]),s.push([o.left,o.top]);break;case"left":s.push([a+5,l]),s.push([o.right,o.bottom]),s.push([o.left,o.bottom]),s.push([o.left,o.top]),s.push([o.right,o.top]);break}return s}function su(e,t){return t?Ua([e.clientX,e.clientY],t):!1}function rs(e){const t=Je(),n=ni(),r=zi(),o=On(),s=Gi(),a=Q({placement:t.orientation()==="horizontal"?"bottom-start":"right-start"},e),[l,i]=Z(a,["open","defaultOpen","onOpenChange"]);let c=0,d=null,u="right";const[f,h]=R(),[g,p]=R(),[m,v]=R(),[b,x]=R(),[w,$]=R(!0),[F,D]=R(i.placement),[O,C]=R([]),[P,V]=R([]),{DomCollectionProvider:G}=sl({items:P,onItemsChange:V}),te=Ei({open:()=>l.open,defaultOpen:()=>l.defaultOpen,onOpenChange:H=>l.onOpenChange?.(H)}),{present:J}=ui({show:()=>t.forceMount()||te.isOpen(),element:()=>b()??null}),ae=Sl({selectionMode:"none",dataSource:P}),oe=H=>{$(H),te.open()},ne=(H=!1)=>{te.close(),H&&r&&r.close(!0)},ie=H=>{$(H),te.toggle()},le=()=>{const H=b();H&&(Se(H),ae.selectionManager().setFocused(!0),ae.selectionManager().setFocusedKey(void 0))},ye=()=>{s!=null?setTimeout(()=>le()):le()},Te=H=>{C($e=>[...$e,H]);const Be=r?.registerNestedMenu(H);return()=>{C($e=>Qn($e,H)),Be?.()}},ge=H=>u===d?.side&&su(H,d?.area),ke=H=>{ge(H)&&H.preventDefault()},T=H=>{ge(H)||ye()},fe=H=>{ge(H)&&H.preventDefault()};Uc({isDisabled:()=>!(r==null&&te.isOpen()&&t.isModal()),targets:()=>[b(),...O()].filter(Boolean)}),B(()=>{const H=b();if(!H||!r)return;const Be=r.registerNestedMenu(H);U(()=>{Be()})}),B(()=>{r===void 0&&o?.registerMenu(t.value(),[b(),...O()])}),B(()=>{r!==void 0||o===void 0||(o.value()===t.value()?(m()?.focus(),o.autoFocusMenu()&&oe(!0)):ne())}),B(()=>{r!==void 0||o===void 0||te.isOpen()&&o.setValue(t.value())}),U(()=>{r===void 0&&o?.unregisterMenu(t.value())});const ht={dataset:M(()=>({"data-expanded":te.isOpen()?"":void 0,"data-closed":te.isOpen()?void 0:""})),isOpen:te.isOpen,contentPresent:J,nestedMenus:O,currentPlacement:F,pointerGraceTimeoutId:()=>c,autoFocus:w,listState:()=>ae,parentMenuContext:()=>r,triggerRef:m,contentRef:b,triggerId:f,contentId:g,setTriggerRef:v,setContentRef:x,open:oe,close:ne,toggle:ie,focusContent:ye,onItemEnter:ke,onItemLeave:T,onTriggerLeave:fe,setPointerDir:H=>u=H,setPointerGraceTimeoutId:H=>c=H,setPointerGraceIntent:H=>d=H,registerNestedMenu:Te,registerItemToParentDomCollection:n?.registerItem,registerTriggerId:ze(h),registerContentId:ze(p)};return y(G,{get children(){return y(Ri.Provider,{value:ht,get children(){return y(z,{when:s===void 0,get fallback(){return i.children},get children(){return y(Si,j({anchorRef:m,contentRef:b,onCurrentPlacementChange:D},i))}})}})}})}function os(e){const{direction:t}=$t();return y(rs,j({get placement(){return t()==="rtl"?"left-start":"right-start"},flip:!0},e))}var au={close:(e,t)=>e==="ltr"?[t==="horizontal"?"ArrowLeft":"ArrowUp"]:[t==="horizontal"?"ArrowRight":"ArrowDown"]};function is(e){const t=gt(),n=Je(),[r,o]=Z(e,["onFocusOutside","onKeyDown"]),{direction:s}=$t();return y(Hi,j({onOpenAutoFocus:d=>{d.preventDefault()},onCloseAutoFocus:d=>{d.preventDefault()},onFocusOutside:d=>{r.onFocusOutside?.(d);const u=d.target;Re(t.triggerRef(),u)||t.close()},onKeyDown:d=>{ue(d,r.onKeyDown);const u=Re(d.currentTarget,d.target),f=au.close(s(),n.orientation()).includes(d.key),h=t.parentMenuContext()!=null;u&&f&&h&&(t.close(),Se(t.triggerRef()))}},o))}var ko=["Enter"," "],lu={open:(e,t)=>e==="ltr"?[...ko,t==="horizontal"?"ArrowRight":"ArrowDown"]:[...ko,t==="horizontal"?"ArrowLeft":"ArrowUp"]};function ss(e){let t;const n=Je(),r=gt(),o=Q({id:n.generateId(`sub-trigger-${Ke()}`)},e),[s,a]=Z(o,["ref","id","textValue","disabled","onPointerMove","onPointerLeave","onPointerDown","onPointerUp","onClick","onKeyDown","onMouseDown","onFocus"]);let l=null;const i=()=>{l&&window.clearTimeout(l),l=null},{direction:c}=$t(),d=()=>s.id,u=()=>{const x=r.parentMenuContext();if(x==null)throw new Error("[kobalte]: `Menu.SubTrigger` must be used within a `Menu.Sub` component");return x.listState().selectionManager()},f=()=>r.listState().collection(),h=()=>u().focusedKey()===d(),g=ci({key:d,selectionManager:u,shouldSelectOnPressUp:!0,allowsDifferentPressOrigin:!0,disabled:()=>s.disabled},()=>t),p=x=>{ue(x,s.onClick),!r.isOpen()&&!s.disabled&&r.open(!0)},m=x=>{if(ue(x,s.onPointerMove),x.pointerType!=="mouse")return;const w=r.parentMenuContext();if(w?.onItemEnter(x),!x.defaultPrevented){if(s.disabled){w?.onItemLeave(x);return}!r.isOpen()&&!l&&(r.parentMenuContext()?.setPointerGraceIntent(null),l=window.setTimeout(()=>{r.open(!1),i()},100)),w?.onItemEnter(x),x.defaultPrevented||(r.listState().selectionManager().isFocused()&&(r.listState().selectionManager().setFocused(!1),r.listState().selectionManager().setFocusedKey(void 0)),Se(x.currentTarget),w?.listState().selectionManager().setFocused(!0),w?.listState().selectionManager().setFocusedKey(d()))}},v=x=>{if(ue(x,s.onPointerLeave),x.pointerType!=="mouse")return;i();const w=r.parentMenuContext(),$=r.contentRef();if($){w?.setPointerGraceIntent({area:iu(r.currentPlacement(),x,$),side:r.currentPlacement().split("-")[0]}),window.clearTimeout(w?.pointerGraceTimeoutId());const F=window.setTimeout(()=>{w?.setPointerGraceIntent(null)},300);w?.setPointerGraceTimeoutId(F)}else{if(w?.onTriggerLeave(x),x.defaultPrevented)return;w?.setPointerGraceIntent(null)}w?.onItemLeave(x)},b=x=>{ue(x,s.onKeyDown),!x.repeat&&(s.disabled||lu.open(c(),n.orientation()).includes(x.key)&&(x.stopPropagation(),x.preventDefault(),u().setFocused(!1),u().setFocusedKey(void 0),r.isOpen()||r.open("first"),r.focusContent(),r.listState().selectionManager().setFocused(!0),r.listState().selectionManager().setFocusedKey(f().getFirstKey())))};return B(()=>{if(r.registerItemToParentDomCollection==null)throw new Error("[kobalte]: `Menu.SubTrigger` must be used within a `Menu.Sub` component");const x=r.registerItemToParentDomCollection({ref:()=>t,type:"item",key:d(),textValue:s.textValue??t?.textContent??"",disabled:s.disabled??!1});U(x)}),B(ut(()=>r.parentMenuContext()?.pointerGraceTimeoutId(),x=>{U(()=>{window.clearTimeout(x),r.parentMenuContext()?.setPointerGraceIntent(null)})})),B(()=>U(r.registerTriggerId(s.id))),U(()=>{i()}),y(de,j({as:"div",ref(x){const w=Me($=>{r.setTriggerRef($),t=$},s.ref);typeof w=="function"&&w(x)},get id(){return s.id},role:"menuitem",get tabIndex(){return g.tabIndex()},"aria-haspopup":"true",get"aria-expanded"(){return r.isOpen()},get"aria-controls"(){return M(()=>!!r.isOpen())()?r.contentId():void 0},get"aria-disabled"(){return s.disabled},get"data-key"(){return g.dataKey()},get"data-highlighted"(){return h()?"":void 0},get"data-disabled"(){return s.disabled?"":void 0},get onPointerDown(){return ve([s.onPointerDown,g.onPointerDown])},get onPointerUp(){return ve([s.onPointerUp,g.onPointerUp])},get onClick(){return ve([p,g.onClick])},get onKeyDown(){return ve([b,g.onKeyDown])},get onMouseDown(){return ve([s.onMouseDown,g.onMouseDown])},get onFocus(){return ve([s.onFocus,g.onFocus])},onPointerMove:m,onPointerLeave:v},()=>r.dataset(),a))}function cu(e){const t=On(),n=`menu-${Ke()}`,r=Q({id:n,modal:!0},e),[o,s]=Z(r,["id","modal","preventScroll","forceMount","open","defaultOpen","onOpenChange","value","orientation"]),a=Ei({open:()=>o.open,defaultOpen:()=>o.defaultOpen,onOpenChange:i=>o.onOpenChange?.(i)}),l={isModal:()=>o.modal??!0,preventScroll:()=>o.preventScroll??l.isModal(),forceMount:()=>o.forceMount??!1,generateId:ln(()=>o.id),value:()=>o.value,orientation:()=>o.orientation??t?.orientation()??"horizontal"};return y(Bi.Provider,{value:l,get children(){return y(rs,j({get open(){return a.isOpen()},get onOpenChange(){return a.setIsOpen}},s))}})}var uu={};Dn(uu,{Root:()=>Fn,Separator:()=>du});function Fn(e){let t;const n=Q({orientation:"horizontal"},e),[r,o]=Z(n,["ref","orientation"]),s=In(()=>t,()=>"hr");return y(de,j({as:"hr",ref(a){const l=Me(i=>t=i,r.ref);typeof l=="function"&&l(a)},get role(){return s()!=="hr"?"separator":void 0},get"aria-orientation"(){return r.orientation==="vertical"?"vertical":void 0},get"data-orientation"(){return r.orientation}},o))}var du=Fn,he={};Dn(he,{Arrow:()=>br,CheckboxItem:()=>Ni,Content:()=>as,DropdownMenu:()=>fu,Group:()=>$r,GroupLabel:()=>ji,Icon:()=>Wi,Item:()=>Qi,ItemDescription:()=>Yi,ItemIndicator:()=>Xi,ItemLabel:()=>Zi,Portal:()=>Ji,RadioGroup:()=>ts,RadioItem:()=>ns,Root:()=>ls,Separator:()=>Fn,Sub:()=>os,SubContent:()=>is,SubTrigger:()=>ss,Trigger:()=>Ui});function as(e){const t=Je(),n=gt(),[r,o]=Z(e,["onCloseAutoFocus","onInteractOutside"]);let s=!1;return y(nu,j({onCloseAutoFocus:i=>{r.onCloseAutoFocus?.(i),s||Se(n.triggerRef()),s=!1,i.preventDefault()},onInteractOutside:i=>{r.onInteractOutside?.(i),(!t.isModal()||i.detail.isContextMenu)&&(s=!0)}},o))}function ls(e){const t=`dropdownmenu-${Ke()}`,n=Q({id:t},e);return y(cu,n)}var fu=Object.assign(ls,{Arrow:br,CheckboxItem:Ni,Content:as,Group:$r,GroupLabel:ji,Icon:Wi,Item:Qi,ItemDescription:Yi,ItemIndicator:Xi,ItemLabel:Zi,Portal:Ji,RadioGroup:ts,RadioItem:ns,Separator:Fn,Sub:os,SubContent:is,SubTrigger:ss,Trigger:Ui}),S={colors:{inherit:"inherit",current:"currentColor",transparent:"transparent",black:"#000000",white:"#ffffff",neutral:{50:"#f9fafb",100:"#f2f4f7",200:"#eaecf0",300:"#d0d5dd",400:"#98a2b3",500:"#667085",600:"#475467",700:"#344054",800:"#1d2939",900:"#101828"},darkGray:{50:"#525c7a",100:"#49536e",200:"#414962",300:"#394056",400:"#313749",500:"#292e3d",600:"#212530",700:"#191c24",800:"#111318",900:"#0b0d10"},gray:{50:"#f9fafb",100:"#f2f4f7",200:"#eaecf0",300:"#d0d5dd",400:"#98a2b3",500:"#667085",600:"#475467",700:"#344054",800:"#1d2939",900:"#101828"},blue:{25:"#F5FAFF",50:"#EFF8FF",100:"#D1E9FF",200:"#B2DDFF",300:"#84CAFF",400:"#53B1FD",500:"#2E90FA",600:"#1570EF",700:"#175CD3",800:"#1849A9",900:"#194185"},green:{25:"#F6FEF9",50:"#ECFDF3",100:"#D1FADF",200:"#A6F4C5",300:"#6CE9A6",400:"#32D583",500:"#12B76A",600:"#039855",700:"#027A48",800:"#05603A",900:"#054F31"},red:{50:"#fef2f2",100:"#fee2e2",200:"#fecaca",300:"#fca5a5",400:"#f87171",500:"#ef4444",600:"#dc2626",700:"#b91c1c",800:"#991b1b",900:"#7f1d1d",950:"#450a0a"},yellow:{25:"#FFFCF5",50:"#FFFAEB",100:"#FEF0C7",200:"#FEDF89",300:"#FEC84B",400:"#FDB022",500:"#F79009",600:"#DC6803",700:"#B54708",800:"#93370D",900:"#7A2E0E"},purple:{25:"#FAFAFF",50:"#F4F3FF",100:"#EBE9FE",200:"#D9D6FE",300:"#BDB4FE",400:"#9B8AFB",500:"#7A5AF8",600:"#6938EF",700:"#5925DC",800:"#4A1FB8",900:"#3E1C96"},teal:{25:"#F6FEFC",50:"#F0FDF9",100:"#CCFBEF",200:"#99F6E0",300:"#5FE9D0",400:"#2ED3B7",500:"#15B79E",600:"#0E9384",700:"#107569",800:"#125D56",900:"#134E48"},pink:{25:"#fdf2f8",50:"#fce7f3",100:"#fbcfe8",200:"#f9a8d4",300:"#f472b6",400:"#ec4899",500:"#db2777",600:"#be185d",700:"#9d174d",800:"#831843",900:"#500724"},cyan:{25:"#ecfeff",50:"#cffafe",100:"#a5f3fc",200:"#67e8f9",300:"#22d3ee",400:"#06b6d4",500:"#0891b2",600:"#0e7490",700:"#155e75",800:"#164e63",900:"#083344"}},alpha:{90:"e5",80:"cc"},font:{size:{xs:"calc(var(--tsqd-font-size) * 0.75)",sm:"calc(var(--tsqd-font-size) * 0.875)",md:"var(--tsqd-font-size)"},lineHeight:{xs:"calc(var(--tsqd-font-size) * 1)",sm:"calc(var(--tsqd-font-size) * 1.25)",md:"calc(var(--tsqd-font-size) * 1.5)"},weight:{medium:"500",semibold:"600",bold:"700"}},border:{radius:{xs:"calc(var(--tsqd-font-size) * 0.125)",sm:"calc(var(--tsqd-font-size) * 0.25)",full:"9999px"}},size:{.25:"calc(var(--tsqd-font-size) * 0.0625)",.5:"calc(var(--tsqd-font-size) * 0.125)",1:"calc(var(--tsqd-font-size) * 0.25)",1.5:"calc(var(--tsqd-font-size) * 0.375)",2:"calc(var(--tsqd-font-size) * 0.5)",2.5:"calc(var(--tsqd-font-size) * 0.625)",3:"calc(var(--tsqd-font-size) * 0.75)",3.5:"calc(var(--tsqd-font-size) * 0.875)",4:"calc(var(--tsqd-font-size) * 1)",4.5:"calc(var(--tsqd-font-size) * 1.125)",5:"calc(var(--tsqd-font-size) * 1.25)",6:"calc(var(--tsqd-font-size) * 1.5)",6.5:"calc(var(--tsqd-font-size) * 1.625)",14:"calc(var(--tsqd-font-size) * 3.5)"},shadow:{xs:(e="rgb(0 0 0 / 0.1)")=>"0 1px 2px 0 rgb(0 0 0 / 0.05)",sm:(e="rgb(0 0 0 / 0.1)")=>`0 1px 3px 0 ${e}, 0 1px 2px -1px ${e}`,md:(e="rgb(0 0 0 / 0.1)")=>`0 4px 6px -1px ${e}, 0 2px 4px -2px ${e}`,lg:(e="rgb(0 0 0 / 0.1)")=>`0 10px 15px -3px ${e}, 0 4px 6px -4px ${e}`,xl:(e="rgb(0 0 0 / 0.1)")=>`0 20px 25px -5px ${e}, 0 8px 10px -6px ${e}`,"2xl":(e="rgb(0 0 0 / 0.25)")=>`0 25px 50px -12px ${e}`,inner:(e="rgb(0 0 0 / 0.05)")=>`inset 0 2px 4px 0 ${e}`,none:()=>"none"}},gu=_('<svg width=14 height=14 viewBox="0 0 14 14"fill=none xmlns=http://www.w3.org/2000/svg><path d="M13 13L9.00007 9M10.3333 5.66667C10.3333 8.244 8.244 10.3333 5.66667 10.3333C3.08934 10.3333 1 8.244 1 5.66667C1 3.08934 3.08934 1 5.66667 1C8.244 1 10.3333 3.08934 10.3333 5.66667Z"stroke=currentColor stroke-width=1.66667 stroke-linecap=round stroke-linejoin=round>'),hu=_('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0975 18.1409 18.8867 17.8 19.485C17.4999 20.0118 17.0472 20.4353 16.5017 20.6997C15.882 21 15.0911 21 13.5093 21H10.4907C8.90891 21 8.11803 21 7.49834 20.6997C6.95276 20.4353 6.50009 20.0118 6.19998 19.485C5.85911 18.8867 5.8065 18.0975 5.70129 16.5193L5 6M10 10.5V15.5M14 10.5V15.5"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),yu=_('<svg width=10 height=6 viewBox="0 0 10 6"fill=none xmlns=http://www.w3.org/2000/svg><path d="M1 1L5 5L9 1"stroke=currentColor stroke-width=1.66667 stroke-linecap=round stroke-linejoin=round>'),pu=_('<svg width=12 height=12 viewBox="0 0 16 16"fill=none xmlns=http://www.w3.org/2000/svg><path d="M8 13.3333V2.66667M8 2.66667L4 6.66667M8 2.66667L12 6.66667"stroke=currentColor stroke-width=1.66667 stroke-linecap=round stroke-linejoin=round>'),Cr=_('<svg width=12 height=12 viewBox="0 0 16 16"fill=none xmlns=http://www.w3.org/2000/svg><path d="M8 2.66667V13.3333M8 13.3333L4 9.33333M8 13.3333L12 9.33333"stroke=currentColor stroke-width=1.66667 stroke-linecap=round stroke-linejoin=round>'),mu=_('<svg viewBox="0 0 24 24"height=12 width=12 fill=none xmlns=http://www.w3.org/2000/svg><path d="M12 2v2m0 16v2M4 12H2m4.314-5.686L4.9 4.9m12.786 1.414L19.1 4.9M6.314 17.69 4.9 19.104m12.786-1.414 1.414 1.414M22 12h-2m-3 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),vu=_('<svg viewBox="0 0 24 24"height=12 width=12 fill=none xmlns=http://www.w3.org/2000/svg><path d="M22 15.844a10.424 10.424 0 0 1-4.306.925c-5.779 0-10.463-4.684-10.463-10.462 0-1.536.33-2.994.925-4.307A10.464 10.464 0 0 0 2 11.538C2 17.316 6.684 22 12.462 22c4.243 0 7.896-2.526 9.538-6.156Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),bu=_('<svg viewBox="0 0 24 24"height=12 width=12 fill=none xmlns=http://www.w3.org/2000/svg><path d="M8 21h8m-4-4v4m-5.2-4h10.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C22 14.72 22 13.88 22 12.2V7.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C19.72 3 18.88 3 17.2 3H6.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C2 5.28 2 6.12 2 7.8v4.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C4.28 17 5.12 17 6.8 17Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),xu=_('<svg stroke=currentColor fill=currentColor stroke-width=0 viewBox="0 0 24 24"height=1em width=1em xmlns=http://www.w3.org/2000/svg><path fill=none d="M0 0h24v24H0z"></path><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z">'),wu=_('<svg stroke-width=0 viewBox="0 0 24 24"height=1em width=1em xmlns=http://www.w3.org/2000/svg><path fill=none d="M24 .01c0-.01 0-.01 0 0L0 0v24h24V.01zM0 0h24v24H0V0zm0 0h24v24H0V0z"></path><path d="M22.99 9C19.15 5.16 13.8 3.76 8.84 4.78l2.52 2.52c3.47-.17 6.99 1.05 9.63 3.7l2-2zm-4 4a9.793 9.793 0 00-4.49-2.56l3.53 3.53.96-.97zM2 3.05L5.07 6.1C3.6 6.82 2.22 7.78 1 9l1.99 2c1.24-1.24 2.67-2.16 4.2-2.77l2.24 2.24A9.684 9.684 0 005 13v.01L6.99 15a7.042 7.042 0 014.92-2.06L18.98 20l1.27-1.26L3.29 1.79 2 3.05zM9 17l3 3 3-3a4.237 4.237 0 00-6 0z">'),$u=_('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M9.3951 19.3711L9.97955 20.6856C10.1533 21.0768 10.4368 21.4093 10.7958 21.6426C11.1547 21.8759 11.5737 22.0001 12.0018 22C12.4299 22.0001 12.8488 21.8759 13.2078 21.6426C13.5667 21.4093 13.8503 21.0768 14.024 20.6856L14.6084 19.3711C14.8165 18.9047 15.1664 18.5159 15.6084 18.26C16.0532 18.0034 16.5678 17.8941 17.0784 17.9478L18.5084 18.1C18.9341 18.145 19.3637 18.0656 19.7451 17.8713C20.1265 17.6771 20.4434 17.3763 20.6573 17.0056C20.8715 16.635 20.9735 16.2103 20.9511 15.7829C20.9286 15.3555 20.7825 14.9438 20.5307 14.5978L19.684 13.4344C19.3825 13.0171 19.2214 12.5148 19.224 12C19.2239 11.4866 19.3865 10.9864 19.6884 10.5711L20.5351 9.40778C20.787 9.06175 20.933 8.65007 20.9555 8.22267C20.978 7.79528 20.8759 7.37054 20.6618 7C20.4479 6.62923 20.131 6.32849 19.7496 6.13423C19.3681 5.93997 18.9386 5.86053 18.5129 5.90556L17.0829 6.05778C16.5722 6.11141 16.0577 6.00212 15.6129 5.74556C15.17 5.48825 14.82 5.09736 14.6129 4.62889L14.024 3.31444C13.8503 2.92317 13.5667 2.59072 13.2078 2.3574C12.8488 2.12408 12.4299 1.99993 12.0018 2C11.5737 1.99993 11.1547 2.12408 10.7958 2.3574C10.4368 2.59072 10.1533 2.92317 9.97955 3.31444L9.3951 4.62889C9.18803 5.09736 8.83798 5.48825 8.3951 5.74556C7.95032 6.00212 7.43577 6.11141 6.9251 6.05778L5.49066 5.90556C5.06499 5.86053 4.6354 5.93997 4.25397 6.13423C3.87255 6.32849 3.55567 6.62923 3.34177 7C3.12759 7.37054 3.02555 7.79528 3.04804 8.22267C3.07052 8.65007 3.21656 9.06175 3.46844 9.40778L4.3151 10.5711C4.61704 10.9864 4.77964 11.4866 4.77955 12C4.77964 12.5134 4.61704 13.0137 4.3151 13.4289L3.46844 14.5922C3.21656 14.9382 3.07052 15.3499 3.04804 15.7773C3.02555 16.2047 3.12759 16.6295 3.34177 17C3.55589 17.3706 3.8728 17.6712 4.25417 17.8654C4.63554 18.0596 5.06502 18.1392 5.49066 18.0944L6.92066 17.9422C7.43133 17.8886 7.94587 17.9979 8.39066 18.2544C8.83519 18.511 9.18687 18.902 9.3951 19.3711Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round></path><path d="M12 15C13.6568 15 15 13.6569 15 12C15 10.3431 13.6568 9 12 9C10.3431 9 8.99998 10.3431 8.99998 12C8.99998 13.6569 10.3431 15 12 15Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Cu=_('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M16 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V8M11.5 12.5L17 7M17 7H12M17 7V12M6.2 21H8.8C9.9201 21 10.4802 21 10.908 20.782C11.2843 20.5903 11.5903 20.2843 11.782 19.908C12 19.4802 12 18.9201 12 17.8V15.2C12 14.0799 12 13.5198 11.782 13.092C11.5903 12.7157 11.2843 12.4097 10.908 12.218C10.4802 12 9.92011 12 8.8 12H6.2C5.0799 12 4.51984 12 4.09202 12.218C3.71569 12.4097 3.40973 12.7157 3.21799 13.092C3 13.5198 3 14.0799 3 15.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Su=_('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path class=copier d="M8 8V5.2C8 4.0799 8 3.51984 8.21799 3.09202C8.40973 2.71569 8.71569 2.40973 9.09202 2.21799C9.51984 2 10.0799 2 11.2 2H18.8C19.9201 2 20.4802 2 20.908 2.21799C21.2843 2.40973 21.5903 2.71569 21.782 3.09202C22 3.51984 22 4.0799 22 5.2V12.8C22 13.9201 22 14.4802 21.782 14.908C21.5903 15.2843 21.2843 15.5903 20.908 15.782C20.4802 16 19.9201 16 18.8 16H16M5.2 22H12.8C13.9201 22 14.4802 22 14.908 21.782C15.2843 21.5903 15.5903 21.2843 15.782 20.908C16 20.4802 16 19.9201 16 18.8V11.2C16 10.0799 16 9.51984 15.782 9.09202C15.5903 8.71569 15.2843 8.40973 14.908 8.21799C14.4802 8 13.9201 8 12.8 8H5.2C4.0799 8 3.51984 8 3.09202 8.21799C2.71569 8.40973 2.40973 8.71569 2.21799 9.09202C2 9.51984 2 10.0799 2 11.2V18.8C2 19.9201 2 20.4802 2.21799 20.908C2.40973 21.2843 2.71569 21.5903 3.09202 21.782C3.51984 22 4.07989 22 5.2 22Z"stroke-width=2 stroke-linecap=round stroke-linejoin=round stroke=currentColor>'),ku=_('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M2.5 21.4998L8.04927 19.3655C8.40421 19.229 8.58168 19.1607 8.74772 19.0716C8.8952 18.9924 9.0358 18.901 9.16804 18.7984C9.31692 18.6829 9.45137 18.5484 9.72028 18.2795L21 6.99982C22.1046 5.89525 22.1046 4.10438 21 2.99981C19.8955 1.89525 18.1046 1.89524 17 2.99981L5.72028 14.2795C5.45138 14.5484 5.31692 14.6829 5.20139 14.8318C5.09877 14.964 5.0074 15.1046 4.92823 15.2521C4.83911 15.4181 4.77085 15.5956 4.63433 15.9506L2.5 21.4998ZM2.5 21.4998L4.55812 16.1488C4.7054 15.7659 4.77903 15.5744 4.90534 15.4867C5.01572 15.4101 5.1523 15.3811 5.2843 15.4063C5.43533 15.4351 5.58038 15.5802 5.87048 15.8703L8.12957 18.1294C8.41967 18.4195 8.56472 18.5645 8.59356 18.7155C8.61877 18.8475 8.58979 18.9841 8.51314 19.0945C8.42545 19.2208 8.23399 19.2944 7.85107 19.4417L2.5 21.4998Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),cs=_('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M7.5 12L10.5 15L16.5 9M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z"stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Eu=_('<svg width=24 height=24 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M9 9L15 15M15 9L9 15M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z"stroke=#F04438 stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Mu=_('<svg width=24 height=24 viewBox="0 0 24 24"fill=none stroke=currentColor stroke-width=2 xmlns=http://www.w3.org/2000/svg><rect class=list width=20 height=20 y=2 x=2 rx=2></rect><line class=list-item y1=7 y2=7 x1=6 x2=18></line><line class=list-item y2=12 y1=12 x1=6 x2=18></line><line class=list-item y1=17 y2=17 x1=6 x2=18>'),Tu=_('<svg viewBox="0 0 24 24"height=20 width=20 fill=none xmlns=http://www.w3.org/2000/svg><path d="M3 7.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C5.28 3 6.12 3 7.8 3h8.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C21 5.28 21 6.12 21 7.8v8.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C18.72 21 17.88 21 16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2V7.8Z"stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Au=_('<svg width=14 height=14 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M7.5 12L10.5 15L16.5 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Iu=_('<svg width=14 height=14 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.0784 19.0784L16.25 16.25M19.0784 4.99994L16.25 7.82837M4.92157 19.0784L7.75 16.25M4.92157 4.99994L7.75 7.82837"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round></path><animateTransform attributeName=transform attributeType=XML type=rotate from=0 to=360 dur=2s repeatCount=indefinite>'),Du=_('<svg width=14 height=14 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M15 9L9 15M9 9L15 15M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Pu=_('<svg width=14 height=14 viewBox="0 0 24 24"fill=none xmlns=http://www.w3.org/2000/svg><path d="M9.5 15V9M14.5 15V9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),Lu=_('<svg version=1.0 viewBox="0 0 633 633"><linearGradient x1=-666.45 x2=-666.45 y1=163.28 y2=163.99 gradientTransform="matrix(633 0 0 633 422177 -103358)"gradientUnits=userSpaceOnUse><stop stop-color=#6BDAFF offset=0></stop><stop stop-color=#F9FFB5 offset=.32></stop><stop stop-color=#FFA770 offset=.71></stop><stop stop-color=#FF7373 offset=1></stop></linearGradient><circle cx=316.5 cy=316.5 r=316.5></circle><defs><filter x=-137.5 y=412 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=-137.5 y=412 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=89.5 cy=610.5 rx=214.5 ry=186 fill=#015064 stroke=#00CFE2 stroke-width=25></ellipse></g><defs><filter x=316.5 y=412 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=316.5 y=412 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=543.5 cy=610.5 rx=214.5 ry=186 fill=#015064 stroke=#00CFE2 stroke-width=25></ellipse></g><defs><filter x=-137.5 y=450 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=-137.5 y=450 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=89.5 cy=648.5 rx=214.5 ry=186 fill=#015064 stroke=#00A8B8 stroke-width=25></ellipse></g><defs><filter x=316.5 y=450 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=316.5 y=450 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=543.5 cy=648.5 rx=214.5 ry=186 fill=#015064 stroke=#00A8B8 stroke-width=25></ellipse></g><defs><filter x=-137.5 y=486 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=-137.5 y=486 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=89.5 cy=684.5 rx=214.5 ry=186 fill=#015064 stroke=#007782 stroke-width=25></ellipse></g><defs><filter x=316.5 y=486 width=454 height=396.9 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=316.5 y=486 width=454 height=396.9 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><ellipse cx=543.5 cy=684.5 rx=214.5 ry=186 fill=#015064 stroke=#007782 stroke-width=25></ellipse></g><defs><filter x=272.2 y=308 width=176.9 height=129.3 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=272.2 y=308 width=176.9 height=129.3 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><line x1=436 x2=431 y1=403.2 y2=431.8 fill=none stroke=#000 stroke-linecap=round stroke-linejoin=bevel stroke-width=11></line><line x1=291 x2=280 y1=341.5 y2=403.5 fill=none stroke=#000 stroke-linecap=round stroke-linejoin=bevel stroke-width=11></line><line x1=332.9 x2=328.6 y1=384.1 y2=411.2 fill=none stroke=#000 stroke-linecap=round stroke-linejoin=bevel stroke-width=11></line><linearGradient x1=-670.75 x2=-671.59 y1=164.4 y2=164.49 gradientTransform="matrix(-184.16 -32.472 -11.461 64.997 -121359 -32126)"gradientUnits=userSpaceOnUse><stop stop-color=#EE2700 offset=0></stop><stop stop-color=#FF008E offset=1></stop></linearGradient><path d="m344.1 363 97.7 17.2c5.8 2.1 8.2 6.1 7.1 12.1s-4.7 9.2-11 9.9l-106-18.7-57.5-59.2c-3.2-4.8-2.9-9.1 0.8-12.8s8.3-4.4 13.7-2.1l55.2 53.6z"clip-rule=evenodd fill-rule=evenodd></path><line x1=428.2 x2=429.1 y1=384.5 y2=378 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line><line x1=395.2 x2=396.1 y1=379.5 y2=373 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line><line x1=362.2 x2=363.1 y1=373.5 y2=367.4 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line><line x1=324.2 x2=328.4 y1=351.3 y2=347.4 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line><line x1=303.2 x2=307.4 y1=331.3 y2=327.4 fill=none stroke=#fff stroke-linecap=round stroke-linejoin=bevel stroke-width=7></line></g><defs><filter x=73.2 y=113.8 width=280.6 height=317.4 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=73.2 y=113.8 width=280.6 height=317.4 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><linearGradient x1=-672.16 x2=-672.16 y1=165.03 y2=166.03 gradientTransform="matrix(-100.18 48.861 97.976 200.88 -83342 -93.059)"gradientUnits=userSpaceOnUse><stop stop-color=#A17500 offset=0></stop><stop stop-color=#5D2100 offset=1></stop></linearGradient><path d="m192.3 203c8.1 37.3 14 73.6 17.8 109.1 3.8 35.4 2.8 75.1-3 119.2l61.2-16.7c-15.6-59-25.2-97.9-28.6-116.6s-10.8-51.9-22.1-99.6l-25.3 4.6"clip-rule=evenodd fill-rule=evenodd></path><g stroke=#2F8A00><linearGradient x1=-660.23 x2=-660.23 y1=166.72 y2=167.72 gradientTransform="matrix(92.683 4.8573 -2.0259 38.657 61680 -3088.6)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m195 183.9s-12.6-22.1-36.5-29.9c-15.9-5.2-34.4-1.5-55.5 11.1 15.9 14.3 29.5 22.6 40.7 24.9 16.8 3.6 51.3-6.1 51.3-6.1z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-661.36 x2=-661.36 y1=164.18 y2=165.18 gradientTransform="matrix(110 5.7648 -6.3599 121.35 73933 -15933)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m194.9 184.5s-47.5-8.5-83.2 15.7c-23.8 16.2-34.3 49.3-31.6 99.4 30.3-27.8 52.1-48.5 65.2-61.9 19.8-20.2 49.6-53.2 49.6-53.2z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-656.79 x2=-656.79 y1=165.15 y2=166.15 gradientTransform="matrix(62.954 3.2993 -3.5023 66.828 42156 -8754.1)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m195 183.9c-0.8-21.9 6-38 20.6-48.2s29.8-15.4 45.5-15.3c-6.1 21.4-14.5 35.8-25.2 43.4s-24.4 14.2-40.9 20.1z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-663.07 x2=-663.07 y1=165.44 y2=166.44 gradientTransform="matrix(152.47 7.9907 -3.0936 59.029 101884 -4318.7)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m194.9 184.5c31.9-30 64.1-39.7 96.7-29s50.8 30.4 54.6 59.1c-35.2-5.5-60.4-9.6-75.8-12.1-15.3-2.6-40.5-8.6-75.5-18z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-662.57 x2=-662.57 y1=164.44 y2=165.44 gradientTransform="matrix(136.46 7.1517 -5.2163 99.533 91536 -11442)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m194.9 184.5c35.8-7.6 65.6-0.2 89.2 22s37.7 49 42.3 80.3c-39.8-9.7-68.3-23.8-85.5-42.4s-32.5-38.5-46-59.9z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><linearGradient x1=-656.43 x2=-656.43 y1=163.86 y2=164.86 gradientTransform="matrix(60.866 3.1899 -8.7773 167.48 41560 -25168)"gradientUnits=userSpaceOnUse><stop stop-color=#2F8A00 offset=0></stop><stop stop-color=#90FF57 offset=1></stop></linearGradient><path d="m194.9 184.5c-33.6 13.8-53.6 35.7-60.1 65.6s-3.6 63.1 8.7 99.6c27.4-40.3 43.2-69.6 47.4-88s5.6-44.1 4-77.2z"clip-rule=evenodd fill-rule=evenodd stroke-width=13></path><path d="m196.5 182.3c-14.8 21.6-25.1 41.4-30.8 59.4s-9.5 33-11.1 45.1"fill=none stroke-linecap=round stroke-width=8></path><path d="m194.9 185.7c-24.4 1.7-43.8 9-58.1 21.8s-24.7 25.4-31.3 37.8"fill=none stroke-linecap=round stroke-width=8></path><path d="m204.5 176.4c29.7-6.7 52-8.4 67-5.1s26.9 8.6 35.8 15.9"fill=none stroke-linecap=round stroke-width=8></path><path d="m196.5 181.4c20.3 9.9 38.2 20.5 53.9 31.9s27.4 22.1 35.1 32"fill=none stroke-linecap=round stroke-width=8></path></g></g><defs><filter x=50.5 y=399 width=532 height=633 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=50.5 y=399 width=532 height=633 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><linearGradient x1=-666.06 x2=-666.23 y1=163.36 y2=163.75 gradientTransform="matrix(532 0 0 633 354760 -102959)"gradientUnits=userSpaceOnUse><stop stop-color=#FFF400 offset=0></stop><stop stop-color=#3C8700 offset=1></stop></linearGradient><ellipse cx=316.5 cy=715.5 rx=266 ry=316.5></ellipse></g><defs><filter x=391 y=-24 width=288 height=283 filterUnits=userSpaceOnUse><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"></feColorMatrix></filter></defs><mask x=391 y=-24 width=288 height=283 maskUnits=userSpaceOnUse><g><circle cx=316.5 cy=316.5 r=316.5 fill=#fff></circle></g></mask><g><linearGradient x1=-664.56 x2=-664.56 y1=163.79 y2=164.79 gradientTransform="matrix(227 0 0 227 151421 -37204)"gradientUnits=userSpaceOnUse><stop stop-color=#FFDF00 offset=0></stop><stop stop-color=#FF9D00 offset=1></stop></linearGradient><circle cx=565.5 cy=89.5 r=113.5></circle><linearGradient x1=-644.5 x2=-645.77 y1=342 y2=342 gradientTransform="matrix(30 0 0 1 19770 -253)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=427 x2=397 y1=89 y2=89 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-641.56 x2=-642.83 y1=196.02 y2=196.07 gradientTransform="matrix(26.5 0 0 5.5 17439 -1025.5)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=430.5 x2=404 y1=55.5 y2=50 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-643.73 x2=-645 y1=185.83 y2=185.9 gradientTransform="matrix(29 0 0 8 19107 -1361)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=431 x2=402 y1=122 y2=130 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-638.94 x2=-640.22 y1=177.09 y2=177.39 gradientTransform="matrix(24 0 0 13 15783 -2145)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=442 x2=418 y1=153 y2=166 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-633.42 x2=-634.7 y1=172.41 y2=173.31 gradientTransform="matrix(20 0 0 19 13137 -3096)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=464 x2=444 y1=180 y2=199 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-619.05 x2=-619.52 y1=170.82 y2=171.82 gradientTransform="matrix(13.83 0 0 22.85 9050 -3703.4)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=491.4 x2=477.5 y1=203 y2=225.9 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=-578.5 x2=-578.63 y1=170.31 y2=171.31 gradientTransform="matrix(7.5 0 0 24.5 4860 -3953)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=524.5 x2=517 y1=219.5 y2=244 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12></line><linearGradient x1=666.5 x2=666.5 y1=170.31 y2=171.31 gradientTransform="matrix(.5 0 0 24.5 231.5 -3944)"gradientUnits=userSpaceOnUse><stop stop-color=#FFA400 offset=0></stop><stop stop-color=#FF5E00 offset=1></stop></linearGradient><line x1=564.5 x2=565 y1=228.5 y2=253 fill=none stroke-linecap=round stroke-linejoin=bevel stroke-width=12>');function Ou(){return gu()}function us(){return hu()}function nn(){return yu()}function Eo(){return pu()}function Mo(){return Cr()}function Fu(){return(()=>{var e=Cr();return e.style.setProperty("transform","rotate(90deg)"),e})()}function qu(){return(()=>{var e=Cr();return e.style.setProperty("transform","rotate(-90deg)"),e})()}function _u(){return mu()}function Ru(){return vu()}function zu(){return bu()}function Ku(){return xu()}function Bu(){return wu()}function Nu(){return $u()}function Uu(){return Cu()}function Gu(){return Su()}function Hu(){return ku()}function Vu(e){return(()=>{var t=cs(),n=t.firstChild;return N(()=>A(n,"stroke",e.theme==="dark"?"#12B76A":"#027A48")),t})()}function ju(){return Eu()}function Wu(){return Mu()}function Qu(e){return[y(z,{get when(){return e.checked},get children(){var t=cs(),n=t.firstChild;return N(()=>A(n,"stroke",e.theme==="dark"?"#9B8AFB":"#6938EF")),t}}),y(z,{get when(){return!e.checked},get children(){var t=Tu(),n=t.firstChild;return N(()=>A(n,"stroke",e.theme==="dark"?"#9B8AFB":"#6938EF")),t}})]}function Yu(){return Au()}function Xu(){return Iu()}function Zu(){return Du()}function Ju(){return Pu()}function To(){const e=Ke();return(()=>{var t=Lu(),n=t.firstChild,r=n.nextSibling,o=r.nextSibling,s=o.firstChild,a=o.nextSibling,l=a.firstChild,i=a.nextSibling,c=i.nextSibling,d=c.firstChild,u=c.nextSibling,f=u.firstChild,h=u.nextSibling,g=h.nextSibling,p=g.firstChild,m=g.nextSibling,v=m.firstChild,b=m.nextSibling,x=b.nextSibling,w=x.firstChild,$=x.nextSibling,F=$.firstChild,D=$.nextSibling,O=D.nextSibling,C=O.firstChild,P=O.nextSibling,V=P.firstChild,G=P.nextSibling,te=G.nextSibling,J=te.firstChild,ae=te.nextSibling,oe=ae.firstChild,ne=ae.nextSibling,ie=ne.nextSibling,le=ie.firstChild,ye=ie.nextSibling,Te=ye.firstChild,ge=ye.nextSibling,ke=ge.firstChild,T=ke.nextSibling,fe=T.nextSibling,Y=fe.nextSibling,ht=Y.nextSibling,H=ge.nextSibling,Be=H.firstChild,$e=H.nextSibling,Dt=$e.firstChild,Oe=$e.nextSibling,yt=Oe.firstChild,Ct=yt.nextSibling,et=Ct.nextSibling,We=et.firstChild,tt=We.nextSibling,L=tt.nextSibling,re=L.nextSibling,Ee=re.nextSibling,se=Ee.nextSibling,ee=se.nextSibling,ce=ee.nextSibling,pe=ce.nextSibling,X=pe.nextSibling,nt=X.nextSibling,rt=nt.nextSibling,Ne=Oe.nextSibling,St=Ne.firstChild,ot=Ne.nextSibling,kt=ot.firstChild,it=ot.nextSibling,pt=it.firstChild,gn=pt.nextSibling,Vt=it.nextSibling,hn=Vt.firstChild,Pt=Vt.nextSibling,yn=Pt.firstChild,jt=Pt.nextSibling,Wt=jt.firstChild,Qt=Wt.nextSibling,Lt=Qt.nextSibling,Sr=Lt.nextSibling,kr=Sr.nextSibling,Er=kr.nextSibling,Mr=Er.nextSibling,Tr=Mr.nextSibling,Ar=Tr.nextSibling,Ir=Ar.nextSibling,Dr=Ir.nextSibling,Pr=Dr.nextSibling,Lr=Pr.nextSibling,Or=Lr.nextSibling,Fr=Or.nextSibling,qr=Fr.nextSibling,_r=qr.nextSibling,ms=_r.nextSibling;return A(n,"id",`a-${e}`),A(r,"fill",`url(#a-${e})`),A(s,"id",`am-${e}`),A(a,"id",`b-${e}`),A(l,"filter",`url(#am-${e})`),A(i,"mask",`url(#b-${e})`),A(d,"id",`ah-${e}`),A(u,"id",`k-${e}`),A(f,"filter",`url(#ah-${e})`),A(h,"mask",`url(#k-${e})`),A(p,"id",`ae-${e}`),A(m,"id",`j-${e}`),A(v,"filter",`url(#ae-${e})`),A(b,"mask",`url(#j-${e})`),A(w,"id",`ai-${e}`),A($,"id",`i-${e}`),A(F,"filter",`url(#ai-${e})`),A(D,"mask",`url(#i-${e})`),A(C,"id",`aj-${e}`),A(P,"id",`h-${e}`),A(V,"filter",`url(#aj-${e})`),A(G,"mask",`url(#h-${e})`),A(J,"id",`ag-${e}`),A(ae,"id",`g-${e}`),A(oe,"filter",`url(#ag-${e})`),A(ne,"mask",`url(#g-${e})`),A(le,"id",`af-${e}`),A(ye,"id",`f-${e}`),A(Te,"filter",`url(#af-${e})`),A(ge,"mask",`url(#f-${e})`),A(Y,"id",`m-${e}`),A(ht,"fill",`url(#m-${e})`),A(Be,"id",`ak-${e}`),A($e,"id",`e-${e}`),A(Dt,"filter",`url(#ak-${e})`),A(Oe,"mask",`url(#e-${e})`),A(yt,"id",`n-${e}`),A(Ct,"fill",`url(#n-${e})`),A(We,"id",`r-${e}`),A(tt,"fill",`url(#r-${e})`),A(L,"id",`s-${e}`),A(re,"fill",`url(#s-${e})`),A(Ee,"id",`q-${e}`),A(se,"fill",`url(#q-${e})`),A(ee,"id",`p-${e}`),A(ce,"fill",`url(#p-${e})`),A(pe,"id",`o-${e}`),A(X,"fill",`url(#o-${e})`),A(nt,"id",`l-${e}`),A(rt,"fill",`url(#l-${e})`),A(St,"id",`al-${e}`),A(ot,"id",`d-${e}`),A(kt,"filter",`url(#al-${e})`),A(it,"mask",`url(#d-${e})`),A(pt,"id",`u-${e}`),A(gn,"fill",`url(#u-${e})`),A(hn,"id",`ad-${e}`),A(Pt,"id",`c-${e}`),A(yn,"filter",`url(#ad-${e})`),A(jt,"mask",`url(#c-${e})`),A(Wt,"id",`t-${e}`),A(Qt,"fill",`url(#t-${e})`),A(Lt,"id",`v-${e}`),A(Sr,"stroke",`url(#v-${e})`),A(kr,"id",`aa-${e}`),A(Er,"stroke",`url(#aa-${e})`),A(Mr,"id",`w-${e}`),A(Tr,"stroke",`url(#w-${e})`),A(Ar,"id",`ac-${e}`),A(Ir,"stroke",`url(#ac-${e})`),A(Dr,"id",`ab-${e}`),A(Pr,"stroke",`url(#ab-${e})`),A(Lr,"id",`y-${e}`),A(Or,"stroke",`url(#y-${e})`),A(Fr,"id",`x-${e}`),A(qr,"stroke",`url(#x-${e})`),A(_r,"id",`z-${e}`),A(ms,"stroke",`url(#z-${e})`),t})()}var ed=_('<span><svg width=16 height=16 viewBox="0 0 16 16"fill=none xmlns=http://www.w3.org/2000/svg><path d="M6 12L10 8L6 4"stroke-width=2 stroke-linecap=round stroke-linejoin=round>'),td=_('<button title="Copy object to clipboard">'),nd=_('<button title="Remove all items"aria-label="Remove all items">'),rd=_('<button title="Delete item"aria-label="Delete item">'),od=_('<button title="Toggle value"aria-label="Toggle value">'),id=_('<button title="Bulk Edit Data"aria-label="Bulk Edit Data">'),Zt=_("<div>"),sd=_("<div><button> <span></span> <span> "),ad=_("<input>"),Ao=_("<span>"),ld=_("<div><span>:"),cd=_("<div><div><button> [<!>...<!>]");function ud(e,t){let n=0;const r=[];for(;n<e.length;)r.push(e.slice(n,n+t)),n=n+t;return r}var Io=e=>{const t=we(),n=K().shadowDOMTarget?W.bind({target:K().shadowDOMTarget}):W,r=M(()=>t()==="dark"?Ht(n):Gt(n));return(()=>{var o=ed();return N(()=>I(o,q(r().expander,n`
          transform: rotate(${e.expanded?90:0}deg);
        `,e.expanded&&n`
            & svg {
              top: -1px;
            }
          `))),o})()},dd=e=>{const t=we(),n=K().shadowDOMTarget?W.bind({target:K().shadowDOMTarget}):W,r=M(()=>t()==="dark"?Ht(n):Gt(n)),[o,s]=R("NoCopy");return(()=>{var a=td();return Ts(a,"click",o()==="NoCopy"?()=>{navigator.clipboard.writeText(As(e.value)).then(()=>{s("SuccessCopy"),setTimeout(()=>{s("NoCopy")},1500)},l=>{console.error("Failed to copy: ",l),s("ErrorCopy"),setTimeout(()=>{s("NoCopy")},1500)})}:void 0,!0),k(a,y(Is,{get children(){return[y(Rn,{get when(){return o()==="NoCopy"},get children(){return y(Gu,{})}}),y(Rn,{get when(){return o()==="SuccessCopy"},get children(){return y(Vu,{get theme(){return t()}})}}),y(Rn,{get when(){return o()==="ErrorCopy"},get children(){return y(ju,{})}})]}})),N(l=>{var i=r().actionButton,c=`${o()==="NoCopy"?"Copy object to clipboard":o()==="SuccessCopy"?"Object copied to clipboard":"Error copying object to clipboard"}`;return i!==l.e&&I(a,l.e=i),c!==l.t&&A(a,"aria-label",l.t=c),l},{e:void 0,t:void 0}),a})()},fd=e=>{const t=we(),n=K().shadowDOMTarget?W.bind({target:K().shadowDOMTarget}):W,r=M(()=>t()==="dark"?Ht(n):Gt(n)),o=K().client;return(()=>{var s=nd();return s.$$click=()=>{const a=e.activeQuery.state.data,l=or(a,e.dataPath,[]);o.setQueryData(e.activeQuery.queryKey,l)},k(s,y(Wu,{})),N(()=>I(s,r().actionButton)),s})()},Do=e=>{const t=we(),n=K().shadowDOMTarget?W.bind({target:K().shadowDOMTarget}):W,r=M(()=>t()==="dark"?Ht(n):Gt(n)),o=K().client;return(()=>{var s=rd();return s.$$click=()=>{const a=e.activeQuery.state.data,l=Ds(a,e.dataPath);o.setQueryData(e.activeQuery.queryKey,l)},k(s,y(us,{})),N(()=>I(s,q(r().actionButton))),s})()},gd=e=>{const t=we(),n=K().shadowDOMTarget?W.bind({target:K().shadowDOMTarget}):W,r=M(()=>t()==="dark"?Ht(n):Gt(n)),o=K().client;return(()=>{var s=od();return s.$$click=()=>{const a=e.activeQuery.state.data,l=or(a,e.dataPath,!e.value);o.setQueryData(e.activeQuery.queryKey,l)},k(s,y(Qu,{get theme(){return t()},get checked(){return e.value}})),N(()=>I(s,q(r().actionButton,n`
          width: ${S.size[3.5]};
          height: ${S.size[3.5]};
        `))),s})()};function Po(e){return Symbol.iterator in e}function mt(e){const t=we(),n=K().shadowDOMTarget?W.bind({target:K().shadowDOMTarget}):W,r=M(()=>t()==="dark"?Ht(n):Gt(n)),o=K().client,[s,a]=R((e.defaultExpanded||[]).includes(e.label)),l=()=>a(g=>!g),[i,c]=R([]),d=M(()=>Array.isArray(e.value)?e.value.map((g,p)=>({label:p.toString(),value:g})):e.value!==null&&typeof e.value=="object"&&Po(e.value)&&typeof e.value[Symbol.iterator]=="function"?e.value instanceof Map?Array.from(e.value,([g,p])=>({label:g,value:p})):Array.from(e.value,(g,p)=>({label:p.toString(),value:g})):typeof e.value=="object"&&e.value!==null?Object.entries(e.value).map(([g,p])=>({label:g,value:p})):[]),u=M(()=>Array.isArray(e.value)?"array":e.value!==null&&typeof e.value=="object"&&Po(e.value)&&typeof e.value[Symbol.iterator]=="function"?"Iterable":typeof e.value=="object"&&e.value!==null?"object":typeof e.value),f=M(()=>ud(d(),100)),h=e.dataPath??[];return(()=>{var g=Zt();return k(g,y(z,{get when(){return f().length},get children(){return[(()=>{var p=sd(),m=p.firstChild,v=m.firstChild,b=v.nextSibling,x=b.nextSibling,w=x.nextSibling,$=w.firstChild;return m.$$click=()=>l(),k(m,y(Io,{get expanded(){return s()}}),v),k(b,()=>e.label),k(w,()=>String(u()).toLowerCase()==="iterable"?"(Iterable) ":"",$),k(w,()=>d().length,$),k(w,()=>d().length>1?"items":"item",null),k(p,y(z,{get when(){return e.editable},get children(){var F=Zt();return k(F,y(dd,{get value(){return e.value}}),null),k(F,y(z,{get when(){return e.itemsDeletable&&e.activeQuery!==void 0},get children(){return y(Do,{get activeQuery(){return e.activeQuery},dataPath:h})}}),null),k(F,y(z,{get when(){return u()==="array"&&e.activeQuery!==void 0},get children(){return y(fd,{get activeQuery(){return e.activeQuery},dataPath:h})}}),null),k(F,y(z,{get when(){return M(()=>!!e.onEdit)()&&!Es(e.value).meta},get children(){var D=id();return D.$$click=()=>{e.onEdit?.()},k(D,y(Hu,{})),N(()=>I(D,r().actionButton)),D}}),null),N(()=>I(F,r().actions)),F}}),null),N(F=>{var D=r().expanderButtonContainer,O=r().expanderButton,C=r().info;return D!==F.e&&I(p,F.e=D),O!==F.t&&I(m,F.t=O),C!==F.a&&I(w,F.a=C),F},{e:void 0,t:void 0,a:void 0}),p})(),y(z,{get when(){return s()},get children(){return[y(z,{get when(){return f().length===1},get children(){var p=Zt();return k(p,y(xn,{get each(){return d()},by:m=>m.label,children:m=>y(mt,{get defaultExpanded(){return e.defaultExpanded},get label(){return m().label},get value(){return m().value},get editable(){return e.editable},get dataPath(){return[...h,m().label]},get activeQuery(){return e.activeQuery},get itemsDeletable(){return u()==="array"||u()==="Iterable"||u()==="object"}})})),N(()=>I(p,r().subEntry)),p}}),y(z,{get when(){return f().length>1},get children(){var p=Zt();return k(p,y(Ms,{get each(){return f()},children:(m,v)=>(()=>{var b=cd(),x=b.firstChild,w=x.firstChild,$=w.firstChild,F=$.nextSibling,D=F.nextSibling,O=D.nextSibling;return O.nextSibling,w.$$click=()=>c(C=>C.includes(v)?C.filter(P=>P!==v):[...C,v]),k(w,y(Io,{get expanded(){return i().includes(v)}}),$),k(w,v*100,F),k(w,v*100+100-1,O),k(x,y(z,{get when(){return i().includes(v)},get children(){var C=Zt();return k(C,y(xn,{get each(){return m()},by:P=>P.label,children:P=>y(mt,{get defaultExpanded(){return e.defaultExpanded},get label(){return P().label},get value(){return P().value},get editable(){return e.editable},get dataPath(){return[...h,P().label]},get activeQuery(){return e.activeQuery}})})),N(()=>I(C,r().subEntry)),C}}),null),N(C=>{var P=r().entry,V=r().expanderButton;return P!==C.e&&I(x,C.e=P),V!==C.t&&I(w,C.t=V),C},{e:void 0,t:void 0}),b})()})),N(()=>I(p,r().subEntry)),p}})]}})]}}),null),k(g,y(z,{get when(){return f().length===0},get children(){var p=ld(),m=p.firstChild,v=m.firstChild;return k(m,()=>e.label,v),k(p,y(z,{get when(){return M(()=>!!(e.editable&&e.activeQuery!==void 0))()&&(u()==="string"||u()==="number"||u()==="boolean")},get fallback(){return(()=>{var b=Ao();return k(b,()=>bn(e.value)),N(()=>I(b,r().value)),b})()},get children(){return[y(z,{get when(){return M(()=>!!(e.editable&&e.activeQuery!==void 0))()&&(u()==="string"||u()==="number")},get children(){var b=ad();return b.addEventListener("change",x=>{const w=e.activeQuery.state.data,$=or(w,h,u()==="number"?x.target.valueAsNumber:x.target.value);o.setQueryData(e.activeQuery.queryKey,$)}),N(x=>{var w=u()==="number"?"number":"text",$=q(r().value,r().editableInput);return w!==x.e&&A(b,"type",x.e=w),$!==x.t&&I(b,x.t=$),x},{e:void 0,t:void 0}),N(()=>b.value=e.value),b}}),y(z,{get when(){return u()==="boolean"},get children(){var b=Ao();return k(b,y(gd,{get activeQuery(){return e.activeQuery},dataPath:h,get value(){return e.value}}),null),k(b,()=>bn(e.value),null),N(()=>I(b,q(r().value,r().actions,r().editableInput))),b}})]}}),null),k(p,y(z,{get when(){return e.editable&&e.itemsDeletable&&e.activeQuery!==void 0},get children(){return y(Do,{get activeQuery(){return e.activeQuery},dataPath:h})}}),null),N(b=>{var x=r().row,w=r().label;return x!==b.e&&I(p,b.e=x),w!==b.t&&I(m,b.t=w),b},{e:void 0,t:void 0}),p}}),null),N(()=>I(g,r().entry)),g})()}var ds=(e,t)=>{const{colors:n,font:r,size:o,border:s}=S,a=(l,i)=>e==="light"?l:i;return{entry:t`
      & * {
        font-size: ${r.size.xs};
        font-family:
          ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          'Liberation Mono', 'Courier New', monospace;
      }
      position: relative;
      outline: none;
      word-break: break-word;
    `,subEntry:t`
      margin: 0 0 0 0.5em;
      padding-left: 0.75em;
      border-left: 2px solid ${a(n.gray[300],n.darkGray[400])};
      /* outline: 1px solid ${n.teal[400]}; */
    `,expander:t`
      & path {
        stroke: ${n.gray[400]};
      }
      & svg {
        width: ${o[3]};
        height: ${o[3]};
      }
      display: inline-flex;
      align-items: center;
      transition: all 0.1s ease;
      /* outline: 1px solid ${n.blue[400]}; */
    `,expanderButtonContainer:t`
      display: flex;
      align-items: center;
      line-height: ${o[4]};
      min-height: ${o[4]};
      gap: ${o[2]};
    `,expanderButton:t`
      cursor: pointer;
      color: inherit;
      font: inherit;
      outline: inherit;
      height: ${o[5]};
      background: transparent;
      border: none;
      padding: 0;
      display: inline-flex;
      align-items: center;
      gap: ${o[1]};
      position: relative;
      /* outline: 1px solid ${n.green[400]}; */

      &:focus-visible {
        border-radius: ${s.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }

      & svg {
        position: relative;
        left: 1px;
      }
    `,info:t`
      color: ${a(n.gray[500],n.gray[500])};
      font-size: ${r.size.xs};
      margin-left: ${o[1]};
      /* outline: 1px solid ${n.yellow[400]}; */
    `,label:t`
      color: ${a(n.gray[700],n.gray[300])};
      white-space: nowrap;
    `,value:t`
      color: ${a(n.purple[600],n.purple[400])};
      flex-grow: 1;
    `,actions:t`
      display: inline-flex;
      gap: ${o[2]};
      align-items: center;
    `,row:t`
      display: inline-flex;
      gap: ${o[2]};
      width: 100%;
      margin: ${o[.25]} 0px;
      line-height: ${o[4.5]};
      align-items: center;
    `,editableInput:t`
      border: none;
      padding: ${o[.5]} ${o[1]} ${o[.5]} ${o[1.5]};
      flex-grow: 1;
      border-radius: ${s.radius.xs};
      background-color: ${a(n.gray[200],n.darkGray[500])};

      &:hover {
        background-color: ${a(n.gray[300],n.darkGray[600])};
      }
    `,actionButton:t`
      background-color: transparent;
      color: ${a(n.gray[500],n.gray[500])};
      border: none;
      display: inline-flex;
      padding: 0px;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: ${o[3]};
      height: ${o[3]};
      position: relative;
      z-index: 1;

      &:hover svg {
        color: ${a(n.gray[600],n.gray[400])};
      }

      &:focus-visible {
        border-radius: ${s.radius.xs};
        outline: 2px solid ${n.blue[800]};
        outline-offset: 2px;
      }
    `}},Gt=e=>ds("light",e),Ht=e=>ds("dark",e);rr(["click"]);var hd=_('<div><div aria-hidden=true></div><button type=button aria-label="Open Tanstack query devtools"class=tsqd-open-btn>'),qn=_("<div>"),yd=_('<aside aria-label="Tanstack query devtools"><div></div><button aria-label="Close tanstack query devtools">'),pd=_("<select name=tsqd-queries-filter-sort>"),md=_("<select name=tsqd-mutations-filter-sort>"),vd=_("<span>Asc"),bd=_("<span>Desc"),xd=_('<button aria-label="Open in picture-in-picture mode"title="Open in picture-in-picture mode">'),wd=_("<div>Settings"),$d=_("<span>Position"),Cd=_("<span>Top"),Sd=_("<span>Bottom"),kd=_("<span>Left"),Ed=_("<span>Right"),Md=_("<span>Theme"),Td=_("<span>Light"),Ad=_("<span>Dark"),Id=_("<span>System"),Dd=_("<div><div class=tsqd-queries-container>"),Pd=_("<div><div class=tsqd-mutations-container>"),Ld=_('<div><div><div><button aria-label="Close Tanstack query devtools"><span>TANSTACK</span><span> v</span></button></div></div><div><div><div><input aria-label="Filter queries by query key"type=text placeholder=Filter name=tsqd-query-filter-input></div><div></div><button class=tsqd-query-filter-sort-order-btn></button></div><div><button aria-label="Clear query cache"></button><button>'),Lo=_("<option>Sort by "),Od=_("<div class=tsqd-query-disabled-indicator>disabled"),Fd=_("<div class=tsqd-query-static-indicator>static"),fs=_("<button><div></div><code class=tsqd-query-hash>"),qd=_("<div role=tooltip id=tsqd-status-tooltip>"),_d=_("<span>"),Rd=_("<button><span></span><span>"),zd=_("<button><span></span> Error"),Kd=_('<div><span></span>Trigger Error<select><option value=""disabled selected>'),Bd=_('<div class="tsqd-query-details-explorer-container tsqd-query-details-data-explorer">'),Nd=_("<form><textarea name=data></textarea><div><span></span><div><button type=button>Cancel</button><button>Save"),Ud=_('<div><div>Query Details</div><div><div class=tsqd-query-details-summary><pre><code></code></pre><span></span></div><div class=tsqd-query-details-observers-count><span>Observers:</span><span></span></div><div class=tsqd-query-details-last-updated><span>Last Updated:</span><span></span></div></div><div>Actions</div><div><button><span></span>Refetch</button><button><span></span>Invalidate</button><button><span></span>Reset</button><button><span></span>Remove</button><button><span></span> Loading</button></div><div>Data </div><div>Query Explorer</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer">'),Gd=_("<option>"),Hd=_('<div><div>Mutation Details</div><div><div class=tsqd-query-details-summary><pre><code></code></pre><span></span></div><div class=tsqd-query-details-last-updated><span>Submitted At:</span><span></span></div></div><div>Variables Details</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer"></div><div>Context Details</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer"></div><div>Data Explorer</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer"></div><div>Mutations Explorer</div><div class="tsqd-query-details-explorer-container tsqd-query-details-query-explorer">'),[De,_n]=R(null),[vt,gs]=R(null),[ct,hs]=R(0),[Jt,Vd]=R(!1),jd=e=>{const t=we(),n=K().shadowDOMTarget?W.bind({target:K().shadowDOMTarget}):W,r=M(()=>t()==="dark"?je(n):Ve(n)),o=M(()=>K().onlineManager);Mt(()=>{const u=o().subscribe(f=>{Vd(!f)});U(()=>{u()})});const s=ir(),a=M(()=>K().buttonPosition||Hs),l=M(()=>e.localStore.open==="true"?!0:e.localStore.open==="false"?!1:K().initialIsOpen||js),i=M(()=>e.localStore.position||K().position||jn);let c;B(()=>{const u=c.parentElement,f=e.localStore.height||_o,h=e.localStore.width||Ro,g=i();u.style.setProperty("--tsqd-panel-height",`${g==="top"?"-":""}${f}px`),u.style.setProperty("--tsqd-panel-width",`${g==="left"?"-":""}${h}px`)}),Mt(()=>{const u=()=>{const f=c.parentElement,h=getComputedStyle(f).fontSize;f.style.setProperty("--tsqd-font-size",h)};u(),window.addEventListener("focus",u),U(()=>{window.removeEventListener("focus",u)})});const d=M(()=>e.localStore.pip_open??"false");return[y(z,{get when(){return M(()=>!!s().pipWindow)()&&d()=="true"},get children(){return y(Oo,{get mount(){return s().pipWindow?.document.body},get children(){return y(Wd,{get children(){return y(ys,e)}})}})}}),(()=>{var u=qn(),f=c;return typeof f=="function"?Mn(f,u):c=u,k(u,y(Wr,{name:"tsqd-panel-transition",get children(){return y(z,{get when(){return M(()=>!!(l()&&!s().pipWindow))()&&d()=="false"},get children(){return y(Qd,{get localStore(){return e.localStore},get setLocalStore(){return e.setLocalStore}})}})}}),null),k(u,y(Wr,{name:"tsqd-button-transition",get children(){return y(z,{get when(){return!l()},get children(){var h=hd(),g=h.firstChild,p=g.nextSibling;return k(g,y(To,{})),p.$$click=()=>e.setLocalStore("open","true"),k(p,y(To,{})),N(()=>I(h,q(r().devtoolsBtn,r()[`devtoolsBtn-position-${a()}`],"tsqd-open-btn-container"))),h}})}}),null),N(()=>I(u,q(n`
            & .tsqd-panel-transition-exit-active,
            & .tsqd-panel-transition-enter-active {
              transition:
                opacity 0.3s,
                transform 0.3s;
            }

            & .tsqd-panel-transition-exit-to,
            & .tsqd-panel-transition-enter {
              ${i()==="top"||i()==="bottom"?"transform: translateY(var(--tsqd-panel-height));":"transform: translateX(var(--tsqd-panel-width));"}
            }

            & .tsqd-button-transition-exit-active,
            & .tsqd-button-transition-enter-active {
              transition:
                opacity 0.3s,
                transform 0.3s;
              opacity: 1;
            }

            & .tsqd-button-transition-exit-to,
            & .tsqd-button-transition-enter {
              transform: ${a()==="relative"?"none;":a()==="top-left"?"translateX(-72px);":a()==="top-right"?"translateX(72px);":"translateY(72px);"};
              opacity: 0;
            }
          `,"tsqd-transitions-container"))),u})()]},Wd=e=>{const t=ir(),n=we(),r=K().shadowDOMTarget?W.bind({target:K().shadowDOMTarget}):W,o=M(()=>n()==="dark"?je(r):Ve(r)),s=()=>{const{colors:a}=S,l=(i,c)=>n()==="dark"?c:i;return ct()<Kt?r`
        flex-direction: column;
        background-color: ${l(a.gray[300],a.gray[600])};
      `:r`
      flex-direction: row;
      background-color: ${l(a.gray[200],a.darkGray[900])};
    `};return B(()=>{const a=t().pipWindow,l=()=>{a&&hs(a.innerWidth)};a&&(a.addEventListener("resize",l),l()),U(()=>{a&&a.removeEventListener("resize",l)})}),(()=>{var a=qn();return a.style.setProperty("--tsqd-font-size","16px"),a.style.setProperty("max-height","100vh"),a.style.setProperty("height","100vh"),a.style.setProperty("width","100vw"),k(a,()=>e.children),N(()=>I(a,q(o().panel,s(),{[r`
            min-width: min-content;
          `]:ct()<qo},"tsqd-main-panel"))),a})()},Qd=e=>{const t=we(),n=K().shadowDOMTarget?W.bind({target:K().shadowDOMTarget}):W,r=M(()=>t()==="dark"?je(n):Ve(n)),[o,s]=R(!1),a=M(()=>e.localStore.position||K().position||jn),l=d=>{const u=d.currentTarget.parentElement;if(!u)return;s(!0);const{height:f,width:h}=u.getBoundingClientRect(),g=d.clientX,p=d.clientY;let m=0;const v=Rr(3.5),b=Rr(12),x=$=>{if($.preventDefault(),a()==="left"||a()==="right"){const F=a()==="right"?g-$.clientX:$.clientX-g;m=Math.round(h+F),m<b&&(m=b),e.setLocalStore("width",String(Math.round(m)));const D=u.getBoundingClientRect().width;Number(e.localStore.width)<D&&e.setLocalStore("width",String(D))}else{const F=a()==="bottom"?p-$.clientY:$.clientY-p;m=Math.round(f+F),m<v&&(m=v,_n(null)),e.setLocalStore("height",String(Math.round(m)))}},w=()=>{o()&&s(!1),document.removeEventListener("mousemove",x,!1),document.removeEventListener("mouseUp",w,!1)};document.addEventListener("mousemove",x,!1),document.addEventListener("mouseup",w,!1)};let i;Mt(()=>{wa(i,({width:d},u)=>{u===i&&hs(d)})}),B(()=>{const d=i.parentElement?.parentElement?.parentElement;if(!d)return;const u=e.localStore.position||jn,f=bs("padding",u),h=e.localStore.position==="left"||e.localStore.position==="right",g=(({padding:p,paddingTop:m,paddingBottom:v,paddingLeft:b,paddingRight:x})=>({padding:p,paddingTop:m,paddingBottom:v,paddingLeft:b,paddingRight:x}))(d.style);d.style[f]=`${h?e.localStore.width:e.localStore.height}px`,U(()=>{Object.entries(g).forEach(([p,m])=>{d.style[p]=m})})});const c=()=>{const{colors:d}=S,u=(f,h)=>t()==="dark"?h:f;return ct()<Kt?n`
        flex-direction: column;
        background-color: ${u(d.gray[300],d.gray[600])};
      `:n`
      flex-direction: row;
      background-color: ${u(d.gray[200],d.darkGray[900])};
    `};return(()=>{var d=yd(),u=d.firstChild,f=u.nextSibling,h=i;return typeof h=="function"?Mn(h,d):i=d,u.$$mousedown=l,f.$$click=()=>e.setLocalStore("open","false"),k(f,y(nn,{})),k(d,y(ys,e),null),N(g=>{var p=q(r().panel,r()[`panel-position-${a()}`],c(),{[n`
            min-width: min-content;
          `]:ct()<qo&&(a()==="right"||a()==="left")},"tsqd-main-panel"),m=a()==="bottom"||a()==="top"?`${e.localStore.height||_o}px`:"auto",v=a()==="right"||a()==="left"?`${e.localStore.width||Ro}px`:"auto",b=q(r().dragHandle,r()[`dragHandle-position-${a()}`],"tsqd-drag-handle"),x=q(r().closeBtn,r()[`closeBtn-position-${a()}`],"tsqd-minimize-btn");return p!==g.e&&I(d,g.e=p),m!==g.t&&((g.t=m)!=null?d.style.setProperty("height",m):d.style.removeProperty("height")),v!==g.a&&((g.a=v)!=null?d.style.setProperty("width",v):d.style.removeProperty("width")),b!==g.o&&I(u,g.o=b),x!==g.i&&I(f,g.i=x),g},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0}),d})()},ys=e=>{nf(),rf();let t;const n=we(),r=K().shadowDOMTarget?W.bind({target:K().shadowDOMTarget}):W,o=M(()=>n()==="dark"?je(r):Ve(r)),s=ir(),[a,l]=R("queries"),i=M(()=>e.localStore.sort||Qs),c=M(()=>Number(e.localStore.sortOrder)||Br),d=M(()=>e.localStore.mutationSort||Ys),u=M(()=>Number(e.localStore.mutationSortOrder)||Br),f=M(()=>Gn[i()]),h=M(()=>Hn[d()]),g=M(()=>K().onlineManager),p=M(()=>K().client.getQueryCache()),m=M(()=>K().client.getMutationCache()),v=me(D=>D().getAll().length,!1),b=M(ut(()=>[v(),e.localStore.filter,i(),c()],()=>{const D=p().getAll(),O=e.localStore.filter?D.filter(P=>Nr(P.queryHash,e.localStore.filter||"").passed):[...D];return f()?O.sort((P,V)=>f()(P,V)*c()):O})),x=Ue(D=>D().getAll().length,!1),w=M(ut(()=>[x(),e.localStore.mutationFilter,d(),u()],()=>{const D=m().getAll(),O=e.localStore.mutationFilter?D.filter(P=>{const V=`${P.options.mutationKey?JSON.stringify(P.options.mutationKey)+" - ":""}${new Date(P.state.submittedAt).toLocaleString()}`;return Nr(V,e.localStore.mutationFilter||"").passed}):[...D];return h()?O.sort((P,V)=>h()(P,V)*u()):O})),$=D=>{e.setLocalStore("position",D)},F=D=>{const C=getComputedStyle(t).getPropertyValue("--tsqd-font-size");D.style.setProperty("--tsqd-font-size",C)};return[(()=>{var D=Ld(),O=D.firstChild,C=O.firstChild,P=C.firstChild,V=P.firstChild,G=V.nextSibling,te=G.firstChild,J=O.nextSibling,ae=J.firstChild,oe=ae.firstChild,ne=oe.firstChild,ie=oe.nextSibling,le=ie.nextSibling,ye=ae.nextSibling,Te=ye.firstChild,ge=Te.nextSibling,ke=t;return typeof ke=="function"?Mn(ke,D):t=D,P.$$click=()=>{if(!s().pipWindow&&!e.showPanelViewOnly){e.setLocalStore("open","false");return}e.onClose&&e.onClose()},k(G,()=>K().queryFlavor,te),k(G,()=>K().version,null),k(C,y(_e.Root,{get class(){return q(o().viewToggle)},get value(){return a()},onChange:T=>{l(T),_n(null),gs(null)},get children(){return[y(_e.Item,{value:"queries",class:"tsqd-radio-toggle",get children(){return[y(_e.ItemInput,{}),y(_e.ItemControl,{get children(){return y(_e.ItemIndicator,{})}}),y(_e.ItemLabel,{title:"Toggle Queries View",children:"Queries"})]}}),y(_e.Item,{value:"mutations",class:"tsqd-radio-toggle",get children(){return[y(_e.ItemInput,{}),y(_e.ItemControl,{get children(){return y(_e.ItemIndicator,{})}}),y(_e.ItemLabel,{title:"Toggle Mutations View",children:"Mutations"})]}})]}}),null),k(O,y(z,{get when(){return a()==="queries"},get children(){return y(Zd,{})}}),null),k(O,y(z,{get when(){return a()==="mutations"},get children(){return y(Jd,{})}}),null),k(oe,y(Ou,{}),ne),ne.$$input=T=>{a()==="queries"?e.setLocalStore("filter",T.currentTarget.value):e.setLocalStore("mutationFilter",T.currentTarget.value)},k(ie,y(z,{get when(){return a()==="queries"},get children(){var T=pd();return T.addEventListener("change",fe=>{e.setLocalStore("sort",fe.currentTarget.value)}),k(T,()=>Object.keys(Gn).map(fe=>(()=>{var Y=Lo();return Y.firstChild,Y.value=fe,k(Y,fe,null),Y})())),N(()=>T.value=i()),T}}),null),k(ie,y(z,{get when(){return a()==="mutations"},get children(){var T=md();return T.addEventListener("change",fe=>{e.setLocalStore("mutationSort",fe.currentTarget.value)}),k(T,()=>Object.keys(Hn).map(fe=>(()=>{var Y=Lo();return Y.firstChild,Y.value=fe,k(Y,fe,null),Y})())),N(()=>T.value=d()),T}}),null),k(ie,y(nn,{}),null),le.$$click=()=>{a()==="queries"?e.setLocalStore("sortOrder",String(c()*-1)):e.setLocalStore("mutationSortOrder",String(u()*-1))},k(le,y(z,{get when(){return(a()==="queries"?c():u())===1},get children(){return[vd(),y(Eo,{})]}}),null),k(le,y(z,{get when(){return(a()==="queries"?c():u())===-1},get children(){return[bd(),y(Mo,{})]}}),null),Te.$$click=()=>{a()==="queries"?(Qe({type:"CLEAR_QUERY_CACHE"}),p().clear()):(Qe({type:"CLEAR_MUTATION_CACHE"}),m().clear())},k(Te,y(us,{})),ge.$$click=()=>{g().setOnline(!g().isOnline())},k(ge,(()=>{var T=M(()=>!!Jt());return()=>T()?y(Bu,{}):y(Ku,{})})()),k(ye,y(z,{get when(){return M(()=>!s().pipWindow)()&&!s().disabled},get children(){var T=xd();return T.$$click=()=>{s().requestPipWindow(Number(window.innerWidth),Number(e.localStore.height??500))},k(T,y(Uu,{})),N(()=>I(T,q(o().actionsBtn,"tsqd-actions-btn","tsqd-action-open-pip"))),T}}),null),k(ye,y(he.Root,{gutter:4,get children(){return[y(he.Trigger,{get class(){return q(o().actionsBtn,"tsqd-actions-btn","tsqd-action-settings")},get children(){return y(Nu,{})}}),y(he.Portal,{ref:T=>F(T),get mount(){return M(()=>!!s().pipWindow)()?s().pipWindow.document.body:document.body},get children(){return y(he.Content,{get class(){return q(o().settingsMenu,"tsqd-settings-menu")},get children(){return[(()=>{var T=wd();return N(()=>I(T,q(o().settingsMenuHeader,"tsqd-settings-menu-header"))),T})(),y(z,{get when(){return!e.showPanelViewOnly},get children(){return y(he.Sub,{overlap:!0,gutter:8,shift:-4,get children(){return[y(he.SubTrigger,{get class(){return q(o().settingsSubTrigger,"tsqd-settings-menu-sub-trigger","tsqd-settings-menu-sub-trigger-position")},get children(){return[$d(),y(nn,{})]}}),y(he.Portal,{ref:T=>F(T),get mount(){return M(()=>!!s().pipWindow)()?s().pipWindow.document.body:document.body},get children(){return y(he.SubContent,{get class(){return q(o().settingsMenu,"tsqd-settings-submenu")},get children(){return[y(he.Item,{onSelect:()=>{$("top")},as:"button",get class(){return q(o().settingsSubButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-top")},get children(){return[Cd(),y(Eo,{})]}}),y(he.Item,{onSelect:()=>{$("bottom")},as:"button",get class(){return q(o().settingsSubButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-bottom")},get children(){return[Sd(),y(Mo,{})]}}),y(he.Item,{onSelect:()=>{$("left")},as:"button",get class(){return q(o().settingsSubButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-left")},get children(){return[kd(),y(Fu,{})]}}),y(he.Item,{onSelect:()=>{$("right")},as:"button",get class(){return q(o().settingsSubButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-right")},get children(){return[Ed(),y(qu,{})]}})]}})}})]}})}}),y(he.Sub,{overlap:!0,gutter:8,shift:-4,get children(){return[y(he.SubTrigger,{get class(){return q(o().settingsSubTrigger,"tsqd-settings-menu-sub-trigger","tsqd-settings-menu-sub-trigger-position")},get children(){return[Md(),y(nn,{})]}}),y(he.Portal,{ref:T=>F(T),get mount(){return M(()=>!!s().pipWindow)()?s().pipWindow.document.body:document.body},get children(){return y(he.SubContent,{get class(){return q(o().settingsMenu,"tsqd-settings-submenu")},get children(){return[y(he.Item,{onSelect:()=>{e.setLocalStore("theme_preference","light")},as:"button",get class(){return q(o().settingsSubButton,e.localStore.theme_preference==="light"&&o().themeSelectedButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-top")},get children(){return[Td(),y(_u,{})]}}),y(he.Item,{onSelect:()=>{e.setLocalStore("theme_preference","dark")},as:"button",get class(){return q(o().settingsSubButton,e.localStore.theme_preference==="dark"&&o().themeSelectedButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-bottom")},get children(){return[Ad(),y(Ru,{})]}}),y(he.Item,{onSelect:()=>{e.setLocalStore("theme_preference","system")},as:"button",get class(){return q(o().settingsSubButton,e.localStore.theme_preference==="system"&&o().themeSelectedButton,"tsqd-settings-menu-position-btn","tsqd-settings-menu-position-btn-left")},get children(){return[Id(),y(zu,{})]}})]}})}})]}})]}})}})]}}),null),k(D,y(z,{get when(){return a()==="queries"},get children(){var T=Dd(),fe=T.firstChild;return k(fe,y(xn,{by:Y=>Y.queryHash,get each(){return b()},children:Y=>y(Yd,{get query(){return Y()}})})),N(()=>I(T,q(o().overflowQueryContainer,"tsqd-queries-overflow-container"))),T}}),null),k(D,y(z,{get when(){return a()==="mutations"},get children(){var T=Pd(),fe=T.firstChild;return k(fe,y(xn,{by:Y=>Y.mutationId,get each(){return w()},children:Y=>y(Xd,{get mutation(){return Y()}})})),N(()=>I(T,q(o().overflowQueryContainer,"tsqd-mutations-overflow-container"))),T}}),null),N(T=>{var fe=q(o().queriesContainer,ct()<Kt&&(De()||vt())&&r`
              height: 50%;
              max-height: 50%;
            `,ct()<Kt&&!(De()||vt())&&r`
              height: 100%;
              max-height: 100%;
            `,"tsqd-queries-container"),Y=q(o().row,"tsqd-header"),ht=o().logoAndToggleContainer,H=q(o().logo,"tsqd-text-logo-container"),Be=q(o().tanstackLogo,"tsqd-text-logo-tanstack"),$e=q(o().queryFlavorLogo,"tsqd-text-logo-query-flavor"),Dt=q(o().row,"tsqd-filters-actions-container"),Oe=q(o().filtersContainer,"tsqd-filters-container"),yt=q(o().filterInput,"tsqd-query-filter-textfield-container"),Ct=q("tsqd-query-filter-textfield"),et=q(o().filterSelect,"tsqd-query-filter-sort-container"),We=`Sort order ${(a()==="queries"?c():u())===-1?"descending":"ascending"}`,tt=(a()==="queries"?c():u())===-1,L=q(o().actionsContainer,"tsqd-actions-container"),re=q(o().actionsBtn,"tsqd-actions-btn","tsqd-action-clear-cache"),Ee=`Clear ${a()} cache`,se=q(o().actionsBtn,Jt()&&o().actionsBtnOffline,"tsqd-actions-btn","tsqd-action-mock-offline-behavior"),ee=`${Jt()?"Unset offline mocking behavior":"Mock offline behavior"}`,ce=Jt(),pe=`${Jt()?"Unset offline mocking behavior":"Mock offline behavior"}`;return fe!==T.e&&I(D,T.e=fe),Y!==T.t&&I(O,T.t=Y),ht!==T.a&&I(C,T.a=ht),H!==T.o&&I(P,T.o=H),Be!==T.i&&I(V,T.i=Be),$e!==T.n&&I(G,T.n=$e),Dt!==T.s&&I(J,T.s=Dt),Oe!==T.h&&I(ae,T.h=Oe),yt!==T.r&&I(oe,T.r=yt),Ct!==T.d&&I(ne,T.d=Ct),et!==T.l&&I(ie,T.l=et),We!==T.u&&A(le,"aria-label",T.u=We),tt!==T.c&&A(le,"aria-pressed",T.c=tt),L!==T.w&&I(ye,T.w=L),re!==T.m&&I(Te,T.m=re),Ee!==T.f&&A(Te,"title",T.f=Ee),se!==T.y&&I(ge,T.y=se),ee!==T.g&&A(ge,"aria-label",T.g=ee),ce!==T.p&&A(ge,"aria-pressed",T.p=ce),pe!==T.b&&A(ge,"title",T.b=pe),T},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0,r:void 0,d:void 0,l:void 0,u:void 0,c:void 0,w:void 0,m:void 0,f:void 0,y:void 0,g:void 0,p:void 0,b:void 0}),N(()=>ne.value=a()==="queries"?e.localStore.filter||"":e.localStore.mutationFilter||""),D})(),y(z,{get when(){return M(()=>a()==="queries")()&&De()},get children(){return y(ef,{})}}),y(z,{get when(){return M(()=>a()==="mutations")()&&vt()},get children(){return y(tf,{})}})]},Yd=e=>{const t=we(),n=K().shadowDOMTarget?W.bind({target:K().shadowDOMTarget}):W,r=M(()=>t()==="dark"?je(n):Ve(n)),{colors:o,alpha:s}=S,a=(g,p)=>t()==="dark"?p:g,l=me(g=>g().find({queryKey:e.query.queryKey})?.state,!0,g=>g.query.queryHash===e.query.queryHash),i=me(g=>g().find({queryKey:e.query.queryKey})?.isDisabled()??!1,!0,g=>g.query.queryHash===e.query.queryHash),c=me(g=>g().find({queryKey:e.query.queryKey})?.isStatic()??!1,!0,g=>g.query.queryHash===e.query.queryHash),d=me(g=>g().find({queryKey:e.query.queryKey})?.isStale()??!1,!0,g=>g.query.queryHash===e.query.queryHash),u=me(g=>g().find({queryKey:e.query.queryKey})?.getObserversCount()??0,!0,g=>g.query.queryHash===e.query.queryHash),f=M(()=>ws({queryState:l(),observerCount:u(),isStale:d()})),h=()=>f()==="gray"?n`
        background-color: ${a(o[f()][200],o[f()][700])};
        color: ${a(o[f()][700],o[f()][300])};
      `:n`
      background-color: ${a(o[f()][200]+s[80],o[f()][900])};
      color: ${a(o[f()][800],o[f()][300])};
    `;return y(z,{get when(){return l()},get children(){var g=fs(),p=g.firstChild,m=p.nextSibling;return g.$$click=()=>_n(e.query.queryHash===De()?null:e.query.queryHash),k(p,u),k(m,()=>e.query.queryHash),k(g,y(z,{get when(){return i()},get children(){return Od()}}),null),k(g,y(z,{get when(){return c()},get children(){return Fd()}}),null),N(v=>{var b=q(r().queryRow,De()===e.query.queryHash&&r().selectedQueryRow,"tsqd-query-row"),x=`Query key ${e.query.queryHash}`,w=q(h(),"tsqd-query-observer-count");return b!==v.e&&I(g,v.e=b),x!==v.t&&A(g,"aria-label",v.t=x),w!==v.a&&I(p,v.a=w),v},{e:void 0,t:void 0,a:void 0}),g}})},Xd=e=>{const t=we(),n=K().shadowDOMTarget?W.bind({target:K().shadowDOMTarget}):W,r=M(()=>t()==="dark"?je(n):Ve(n)),{colors:o,alpha:s}=S,a=(f,h)=>t()==="dark"?h:f,l=Ue(f=>f().getAll().find(p=>p.mutationId===e.mutation.mutationId)?.state),i=Ue(f=>{const g=f().getAll().find(p=>p.mutationId===e.mutation.mutationId);return g?g.state.isPaused:!1}),c=Ue(f=>{const g=f().getAll().find(p=>p.mutationId===e.mutation.mutationId);return g?g.state.status:"idle"}),d=M(()=>_t({isPaused:i(),status:c()})),u=()=>d()==="gray"?n`
        background-color: ${a(o[d()][200],o[d()][700])};
        color: ${a(o[d()][700],o[d()][300])};
      `:n`
      background-color: ${a(o[d()][200]+s[80],o[d()][900])};
      color: ${a(o[d()][800],o[d()][300])};
    `;return y(z,{get when(){return l()},get children(){var f=fs(),h=f.firstChild,g=h.nextSibling;return f.$$click=()=>{gs(e.mutation.mutationId===vt()?null:e.mutation.mutationId)},k(h,y(z,{get when(){return d()==="purple"},get children(){return y(Ju,{})}}),null),k(h,y(z,{get when(){return d()==="green"},get children(){return y(Yu,{})}}),null),k(h,y(z,{get when(){return d()==="red"},get children(){return y(Zu,{})}}),null),k(h,y(z,{get when(){return d()==="yellow"},get children(){return y(Xu,{})}}),null),k(g,y(z,{get when(){return e.mutation.options.mutationKey},get children(){return[M(()=>JSON.stringify(e.mutation.options.mutationKey))," -"," "]}}),null),k(g,()=>new Date(e.mutation.state.submittedAt).toLocaleString(),null),N(p=>{var m=q(r().queryRow,vt()===e.mutation.mutationId&&r().selectedQueryRow,"tsqd-query-row"),v=`Mutation submitted at ${new Date(e.mutation.state.submittedAt).toLocaleString()}`,b=q(u(),"tsqd-query-observer-count");return m!==p.e&&I(f,p.e=m),v!==p.t&&A(f,"aria-label",p.t=v),b!==p.a&&I(h,p.a=b),p},{e:void 0,t:void 0,a:void 0}),f}})},Zd=()=>{const e=me(i=>i().getAll().filter(c=>Ot(c)==="stale").length),t=me(i=>i().getAll().filter(c=>Ot(c)==="fresh").length),n=me(i=>i().getAll().filter(c=>Ot(c)==="fetching").length),r=me(i=>i().getAll().filter(c=>Ot(c)==="paused").length),o=me(i=>i().getAll().filter(c=>Ot(c)==="inactive").length),s=we(),a=K().shadowDOMTarget?W.bind({target:K().shadowDOMTarget}):W,l=M(()=>s()==="dark"?je(a):Ve(a));return(()=>{var i=qn();return k(i,y(lt,{label:"Fresh",color:"green",get count(){return t()}}),null),k(i,y(lt,{label:"Fetching",color:"blue",get count(){return n()}}),null),k(i,y(lt,{label:"Paused",color:"purple",get count(){return r()}}),null),k(i,y(lt,{label:"Stale",color:"yellow",get count(){return e()}}),null),k(i,y(lt,{label:"Inactive",color:"gray",get count(){return o()}}),null),N(()=>I(i,q(l().queryStatusContainer,"tsqd-query-status-container"))),i})()},Jd=()=>{const e=Ue(l=>l().getAll().filter(i=>_t({isPaused:i.state.isPaused,status:i.state.status})==="green").length),t=Ue(l=>l().getAll().filter(i=>_t({isPaused:i.state.isPaused,status:i.state.status})==="yellow").length),n=Ue(l=>l().getAll().filter(i=>_t({isPaused:i.state.isPaused,status:i.state.status})==="purple").length),r=Ue(l=>l().getAll().filter(i=>_t({isPaused:i.state.isPaused,status:i.state.status})==="red").length),o=we(),s=K().shadowDOMTarget?W.bind({target:K().shadowDOMTarget}):W,a=M(()=>o()==="dark"?je(s):Ve(s));return(()=>{var l=qn();return k(l,y(lt,{label:"Paused",color:"purple",get count(){return n()}}),null),k(l,y(lt,{label:"Pending",color:"yellow",get count(){return t()}}),null),k(l,y(lt,{label:"Success",color:"green",get count(){return e()}}),null),k(l,y(lt,{label:"Error",color:"red",get count(){return r()}}),null),N(()=>I(l,q(a().queryStatusContainer,"tsqd-query-status-container"))),l})()},lt=e=>{const t=we(),n=K().shadowDOMTarget?W.bind({target:K().shadowDOMTarget}):W,r=M(()=>t()==="dark"?je(n):Ve(n)),{colors:o,alpha:s}=S,a=(h,g)=>t()==="dark"?g:h;let l;const[i,c]=R(!1),[d,u]=R(!1),f=M(()=>!(De()&&ct()<Gs&&ct()>Kt||ct()<Kt));return(()=>{var h=Rd(),g=h.firstChild,p=g.nextSibling,m=l;return typeof m=="function"?Mn(m,h):l=h,h.addEventListener("mouseleave",()=>{c(!1),u(!1)}),h.addEventListener("mouseenter",()=>c(!0)),h.addEventListener("blur",()=>u(!1)),h.addEventListener("focus",()=>u(!0)),ks(h,j({get disabled(){return f()},get class(){return q(r().queryStatusTag,!f()&&n`
            cursor: pointer;
            &:hover {
              background: ${a(o.gray[200],o.darkGray[400])}${s[80]};
            }
          `,"tsqd-query-status-tag",`tsqd-query-status-tag-${e.label.toLowerCase()}`)}},()=>i()||d()?{"aria-describedby":"tsqd-status-tooltip"}:{}),!1,!0),k(h,y(z,{get when(){return M(()=>!f())()&&(i()||d())},get children(){var v=qd();return k(v,()=>e.label),N(()=>I(v,q(r().statusTooltip,"tsqd-query-status-tooltip"))),v}}),g),k(h,y(z,{get when(){return f()},get children(){var v=_d();return k(v,()=>e.label),N(()=>I(v,q(r().queryStatusTagLabel,"tsqd-query-status-tag-label"))),v}}),p),k(p,()=>e.count),N(v=>{var b=q(n`
            width: ${S.size[1.5]};
            height: ${S.size[1.5]};
            border-radius: ${S.border.radius.full};
            background-color: ${S.colors[e.color][500]};
          `,"tsqd-query-status-tag-dot"),x=q(r().queryStatusCount,e.count>0&&e.color!=="gray"&&n`
              background-color: ${a(o[e.color][100],o[e.color][900])};
              color: ${a(o[e.color][700],o[e.color][300])};
            `,"tsqd-query-status-tag-count");return b!==v.e&&I(g,v.e=b),x!==v.t&&I(p,v.t=x),v},{e:void 0,t:void 0}),h})()},ef=()=>{const e=we(),t=K().shadowDOMTarget?W.bind({target:K().shadowDOMTarget}):W,n=M(()=>e()==="dark"?je(t):Ve(t)),{colors:r}=S,o=(C,P)=>e()==="dark"?P:C,s=K().client,[a,l]=R(!1),[i,c]=R("view"),[d,u]=R(!1),f=M(()=>K().errorTypes||[]),h=me(C=>C().getAll().find(P=>P.queryHash===De()),!1),g=me(C=>C().getAll().find(P=>P.queryHash===De()),!1),p=me(C=>C().getAll().find(P=>P.queryHash===De())?.state,!1),m=me(C=>C().getAll().find(P=>P.queryHash===De())?.state.data,!1),v=me(C=>{const P=C().getAll().find(V=>V.queryHash===De());return P?Ot(P):"inactive"}),b=me(C=>{const P=C().getAll().find(V=>V.queryHash===De());return P?P.state.status:"pending"}),x=me(C=>C().getAll().find(P=>P.queryHash===De())?.getObserversCount()??0),w=M(()=>$s(v())),$=()=>{Qe({type:"REFETCH",queryHash:h()?.queryHash}),h()?.fetch()?.catch(()=>{})},F=C=>{const P=h();if(!P)return;Qe({type:"TRIGGER_ERROR",queryHash:P.queryHash,metadata:{error:C?.name}});const V=C?.initializer(P)??new Error("Unknown error from devtools"),G=P.options;P.setState({status:"error",error:V,fetchMeta:{...P.state.fetchMeta,__previousQueryOptions:G}})},D=()=>{const C=h();if(!C)return;Qe({type:"RESTORE_LOADING",queryHash:C.queryHash});const P=C.state,V=C.state.fetchMeta?C.state.fetchMeta.__previousQueryOptions:null;C.cancel({silent:!0}),C.setState({...P,fetchStatus:"idle",fetchMeta:null}),V&&C.fetch(V)};B(()=>{v()!=="fetching"&&l(!1)});const O=()=>w()==="gray"?t`
        background-color: ${o(r[w()][200],r[w()][700])};
        color: ${o(r[w()][700],r[w()][300])};
        border-color: ${o(r[w()][400],r[w()][600])};
      `:t`
      background-color: ${o(r[w()][100],r[w()][900])};
      color: ${o(r[w()][700],r[w()][300])};
      border-color: ${o(r[w()][400],r[w()][600])};
    `;return y(z,{get when(){return M(()=>!!h())()&&p()},get children(){var C=Ud(),P=C.firstChild,V=P.nextSibling,G=V.firstChild,te=G.firstChild,J=te.firstChild,ae=te.nextSibling,oe=G.nextSibling,ne=oe.firstChild,ie=ne.nextSibling,le=oe.nextSibling,ye=le.firstChild,Te=ye.nextSibling,ge=V.nextSibling,ke=ge.nextSibling,T=ke.firstChild,fe=T.firstChild,Y=T.nextSibling,ht=Y.firstChild,H=Y.nextSibling,Be=H.firstChild,$e=H.nextSibling,Dt=$e.firstChild,Oe=$e.nextSibling,yt=Oe.firstChild,Ct=yt.nextSibling,et=ke.nextSibling;et.firstChild;var We=et.nextSibling,tt=We.nextSibling;return k(J,()=>bn(h().queryKey,!0)),k(ae,v),k(ie,x),k(Te,()=>new Date(p().dataUpdatedAt).toLocaleTimeString()),T.$$click=$,Y.$$click=()=>{Qe({type:"INVALIDATE",queryHash:h()?.queryHash}),s.invalidateQueries(h())},H.$$click=()=>{Qe({type:"RESET",queryHash:h()?.queryHash}),s.resetQueries(h())},$e.$$click=()=>{Qe({type:"REMOVE",queryHash:h()?.queryHash}),s.removeQueries(h()),_n(null)},Oe.$$click=()=>{if(h()?.state.data===void 0)l(!0),D();else{const L=h();if(!L)return;Qe({type:"TRIGGER_LOADING",queryHash:L.queryHash});const re=L.options;L.fetch({...re,queryFn:()=>new Promise(()=>{}),gcTime:-1}),L.setState({data:void 0,status:"pending",fetchMeta:{...L.state.fetchMeta,__previousQueryOptions:re}})}},k(Oe,()=>b()==="pending"?"Restore":"Trigger",Ct),k(ke,y(z,{get when(){return f().length===0||b()==="error"},get children(){var L=zd(),re=L.firstChild,Ee=re.nextSibling;return L.$$click=()=>{h().state.error?(Qe({type:"RESTORE_ERROR",queryHash:h()?.queryHash}),s.resetQueries(h())):F()},k(L,()=>b()==="error"?"Restore":"Trigger",Ee),N(se=>{var ee=q(t`
                  color: ${o(r.red[500],r.red[400])};
                `,"tsqd-query-details-actions-btn","tsqd-query-details-action-error"),ce=b()==="pending",pe=t`
                  background-color: ${o(r.red[500],r.red[400])};
                `;return ee!==se.e&&I(L,se.e=ee),ce!==se.t&&(L.disabled=se.t=ce),pe!==se.a&&I(re,se.a=pe),se},{e:void 0,t:void 0,a:void 0}),L}}),null),k(ke,y(z,{get when(){return!(f().length===0||b()==="error")},get children(){var L=Kd(),re=L.firstChild,Ee=re.nextSibling,se=Ee.nextSibling;return se.firstChild,se.addEventListener("change",ee=>{const ce=f().find(pe=>pe.name===ee.currentTarget.value);F(ce)}),k(se,y(Cs,{get each(){return f()},children:ee=>(()=>{var ce=Gd();return k(ce,()=>ee.name),N(()=>ce.value=ee.name),ce})()}),null),k(L,y(nn,{}),null),N(ee=>{var ce=q(n().actionsSelect,"tsqd-query-details-actions-btn","tsqd-query-details-action-error-multiple"),pe=t`
                  background-color: ${S.colors.red[400]};
                `,X=b()==="pending";return ce!==ee.e&&I(L,ee.e=ce),pe!==ee.t&&I(re,ee.t=pe),X!==ee.a&&(se.disabled=ee.a=X),ee},{e:void 0,t:void 0,a:void 0}),L}}),null),k(et,()=>i()==="view"?"Explorer":"Editor",null),k(C,y(z,{get when(){return i()==="view"},get children(){var L=Bd();return k(L,y(mt,{label:"Data",defaultExpanded:["Data"],get value(){return m()},editable:!0,onEdit:()=>c("edit"),get activeQuery(){return h()}})),N(re=>(re=S.size[2])!=null?L.style.setProperty("padding",re):L.style.removeProperty("padding")),L}}),We),k(C,y(z,{get when(){return i()==="edit"},get children(){var L=Nd(),re=L.firstChild,Ee=re.nextSibling,se=Ee.firstChild,ee=se.nextSibling,ce=ee.firstChild,pe=ce.nextSibling;return L.addEventListener("submit",X=>{X.preventDefault();const rt=new FormData(X.currentTarget).get("data");try{const Ne=JSON.parse(rt);h().setState({...h().state,data:Ne}),c("view")}catch{u(!0)}}),re.addEventListener("focus",()=>u(!1)),k(se,()=>d()?"Invalid Value":""),ce.$$click=()=>c("view"),N(X=>{var nt=q(n().devtoolsEditForm,"tsqd-query-details-data-editor"),rt=n().devtoolsEditTextarea,Ne=d(),St=n().devtoolsEditFormActions,ot=n().devtoolsEditFormError,kt=n().devtoolsEditFormActionContainer,it=q(n().devtoolsEditFormAction,t`
                      color: ${o(r.gray[600],r.gray[300])};
                    `),pt=q(n().devtoolsEditFormAction,t`
                      color: ${o(r.blue[600],r.blue[400])};
                    `);return nt!==X.e&&I(L,X.e=nt),rt!==X.t&&I(re,X.t=rt),Ne!==X.a&&A(re,"data-error",X.a=Ne),St!==X.o&&I(Ee,X.o=St),ot!==X.i&&I(se,X.i=ot),kt!==X.n&&I(ee,X.n=kt),it!==X.s&&I(ce,X.s=it),pt!==X.h&&I(pe,X.h=pt),X},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0}),N(()=>re.value=JSON.stringify(m(),null,2)),L}}),We),k(tt,y(mt,{label:"Query",defaultExpanded:["Query","queryKey"],get value(){return g()}})),N(L=>{var re=q(n().detailsContainer,"tsqd-query-details-container"),Ee=q(n().detailsHeader,"tsqd-query-details-header"),se=q(n().detailsBody,"tsqd-query-details-summary-container"),ee=q(n().queryDetailsStatus,O()),ce=q(n().detailsHeader,"tsqd-query-details-header"),pe=q(n().actionsBody,"tsqd-query-details-actions-container"),X=q(t`
                color: ${o(r.blue[600],r.blue[400])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-refetch"),nt=v()==="fetching",rt=t`
                background-color: ${o(r.blue[600],r.blue[400])};
              `,Ne=q(t`
                color: ${o(r.yellow[600],r.yellow[400])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-invalidate"),St=b()==="pending",ot=t`
                background-color: ${o(r.yellow[600],r.yellow[400])};
              `,kt=q(t`
                color: ${o(r.gray[600],r.gray[300])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-reset"),it=b()==="pending",pt=t`
                background-color: ${o(r.gray[600],r.gray[400])};
              `,gn=q(t`
                color: ${o(r.pink[500],r.pink[400])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-remove"),Vt=v()==="fetching",hn=t`
                background-color: ${o(r.pink[500],r.pink[400])};
              `,Pt=q(t`
                color: ${o(r.cyan[500],r.cyan[400])};
              `,"tsqd-query-details-actions-btn","tsqd-query-details-action-loading"),yn=a(),jt=t`
                background-color: ${o(r.cyan[500],r.cyan[400])};
              `,Wt=q(n().detailsHeader,"tsqd-query-details-header"),Qt=q(n().detailsHeader,"tsqd-query-details-header"),Lt=S.size[2];return re!==L.e&&I(C,L.e=re),Ee!==L.t&&I(P,L.t=Ee),se!==L.a&&I(V,L.a=se),ee!==L.o&&I(ae,L.o=ee),ce!==L.i&&I(ge,L.i=ce),pe!==L.n&&I(ke,L.n=pe),X!==L.s&&I(T,L.s=X),nt!==L.h&&(T.disabled=L.h=nt),rt!==L.r&&I(fe,L.r=rt),Ne!==L.d&&I(Y,L.d=Ne),St!==L.l&&(Y.disabled=L.l=St),ot!==L.u&&I(ht,L.u=ot),kt!==L.c&&I(H,L.c=kt),it!==L.w&&(H.disabled=L.w=it),pt!==L.m&&I(Be,L.m=pt),gn!==L.f&&I($e,L.f=gn),Vt!==L.y&&($e.disabled=L.y=Vt),hn!==L.g&&I(Dt,L.g=hn),Pt!==L.p&&I(Oe,L.p=Pt),yn!==L.b&&(Oe.disabled=L.b=yn),jt!==L.T&&I(yt,L.T=jt),Wt!==L.A&&I(et,L.A=Wt),Qt!==L.O&&I(We,L.O=Qt),Lt!==L.I&&((L.I=Lt)!=null?tt.style.setProperty("padding",Lt):tt.style.removeProperty("padding")),L},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0,r:void 0,d:void 0,l:void 0,u:void 0,c:void 0,w:void 0,m:void 0,f:void 0,y:void 0,g:void 0,p:void 0,b:void 0,T:void 0,A:void 0,O:void 0,I:void 0}),C}})},tf=()=>{const e=we(),t=K().shadowDOMTarget?W.bind({target:K().shadowDOMTarget}):W,n=M(()=>e()==="dark"?je(t):Ve(t)),{colors:r}=S,o=(d,u)=>e()==="dark"?u:d,s=Ue(d=>{const f=d().getAll().find(h=>h.mutationId===vt());return f?f.state.isPaused:!1}),a=Ue(d=>{const f=d().getAll().find(h=>h.mutationId===vt());return f?f.state.status:"idle"}),l=M(()=>_t({isPaused:s(),status:a()})),i=Ue(d=>d().getAll().find(u=>u.mutationId===vt()),!1),c=()=>l()==="gray"?t`
        background-color: ${o(r[l()][200],r[l()][700])};
        color: ${o(r[l()][700],r[l()][300])};
        border-color: ${o(r[l()][400],r[l()][600])};
      `:t`
      background-color: ${o(r[l()][100],r[l()][900])};
      color: ${o(r[l()][700],r[l()][300])};
      border-color: ${o(r[l()][400],r[l()][600])};
    `;return y(z,{get when(){return i()},get children(){var d=Hd(),u=d.firstChild,f=u.nextSibling,h=f.firstChild,g=h.firstChild,p=g.firstChild,m=g.nextSibling,v=h.nextSibling,b=v.firstChild,x=b.nextSibling,w=f.nextSibling,$=w.nextSibling,F=$.nextSibling,D=F.nextSibling,O=D.nextSibling,C=O.nextSibling,P=C.nextSibling,V=P.nextSibling;return k(p,y(z,{get when(){return i().options.mutationKey},fallback:"No mutationKey found",get children(){return bn(i().options.mutationKey,!0)}})),k(m,y(z,{get when(){return l()==="purple"},children:"pending"}),null),k(m,y(z,{get when(){return l()!=="purple"},get children(){return a()}}),null),k(x,()=>new Date(i().state.submittedAt).toLocaleTimeString()),k($,y(mt,{label:"Variables",defaultExpanded:["Variables"],get value(){return i().state.variables}})),k(D,y(mt,{label:"Context",defaultExpanded:["Context"],get value(){return i().state.context}})),k(C,y(mt,{label:"Data",defaultExpanded:["Data"],get value(){return i().state.data}})),k(V,y(mt,{label:"Mutation",defaultExpanded:["Mutation"],get value(){return i()}})),N(G=>{var te=q(n().detailsContainer,"tsqd-query-details-container"),J=q(n().detailsHeader,"tsqd-query-details-header"),ae=q(n().detailsBody,"tsqd-query-details-summary-container"),oe=q(n().queryDetailsStatus,c()),ne=q(n().detailsHeader,"tsqd-query-details-header"),ie=S.size[2],le=q(n().detailsHeader,"tsqd-query-details-header"),ye=S.size[2],Te=q(n().detailsHeader,"tsqd-query-details-header"),ge=S.size[2],ke=q(n().detailsHeader,"tsqd-query-details-header"),T=S.size[2];return te!==G.e&&I(d,G.e=te),J!==G.t&&I(u,G.t=J),ae!==G.a&&I(f,G.a=ae),oe!==G.o&&I(m,G.o=oe),ne!==G.i&&I(w,G.i=ne),ie!==G.n&&((G.n=ie)!=null?$.style.setProperty("padding",ie):$.style.removeProperty("padding")),le!==G.s&&I(F,G.s=le),ye!==G.h&&((G.h=ye)!=null?D.style.setProperty("padding",ye):D.style.removeProperty("padding")),Te!==G.r&&I(O,G.r=Te),ge!==G.d&&((G.d=ge)!=null?C.style.setProperty("padding",ge):C.style.removeProperty("padding")),ke!==G.l&&I(P,G.l=ke),T!==G.u&&((G.u=T)!=null?V.style.setProperty("padding",T):V.style.removeProperty("padding")),G},{e:void 0,t:void 0,a:void 0,o:void 0,i:void 0,n:void 0,s:void 0,h:void 0,r:void 0,d:void 0,l:void 0,u:void 0}),d}})},kn=new Map,nf=()=>{const e=M(()=>K().client.getQueryCache()),t=e().subscribe(n=>{xs(()=>{for(const[r,o]of kn.entries())o.shouldUpdate(n)&&o.setter(r(e))})});return U(()=>{kn.clear(),t()}),t},me=(e,t=!0,n=()=>!0)=>{const r=M(()=>K().client.getQueryCache()),[o,s]=R(e(r),t?void 0:{equals:!1});return B(()=>{s(e(r))}),kn.set(e,{setter:s,shouldUpdate:n}),U(()=>{kn.delete(e)}),o},En=new Map,rf=()=>{const e=M(()=>K().client.getMutationCache()),t=e().subscribe(()=>{for(const[n,r]of En.entries())queueMicrotask(()=>{r(n(e))})});return U(()=>{En.clear(),t()}),t},Ue=(e,t=!0)=>{const n=M(()=>K().client.getMutationCache()),[r,o]=R(e(n),t?void 0:{equals:!1});return B(()=>{o(e(n))}),En.set(e,o),U(()=>{En.delete(e)}),r},of="@tanstack/query-devtools-event",Qe=({type:e,queryHash:t,metadata:n})=>{const r=new CustomEvent(of,{detail:{type:e,queryHash:t,metadata:n},bubbles:!0,cancelable:!0});window.dispatchEvent(r)},ps=(e,t)=>{const{colors:n,font:r,size:o,alpha:s,shadow:a,border:l}=S,i=(c,d)=>e==="light"?c:d;return{devtoolsBtn:t`
      z-index: 100000;
      position: fixed;
      padding: 4px;
      text-align: left;

      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      box-shadow: ${a.md()};
      overflow: hidden;

      & div {
        position: absolute;
        top: -8px;
        left: -8px;
        right: -8px;
        bottom: -8px;
        border-radius: 9999px;

        & svg {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        filter: blur(6px) saturate(1.2) contrast(1.1);
      }

      &:focus-within {
        outline-offset: 2px;
        outline: 3px solid ${n.green[600]};
      }

      & button {
        position: relative;
        z-index: 1;
        padding: 0;
        border-radius: 9999px;
        background-color: transparent;
        border: none;
        height: 40px;
        display: flex;
        width: 40px;
        overflow: hidden;
        cursor: pointer;
        outline: none;
        & svg {
          position: absolute;
          width: 100%;
          height: 100%;
        }
      }
    `,panel:t`
      position: fixed;
      z-index: 9999;
      display: flex;
      gap: ${S.size[.5]};
      & * {
        box-sizing: border-box;
        text-transform: none;
      }

      & *::-webkit-scrollbar {
        width: 7px;
      }

      & *::-webkit-scrollbar-track {
        background: transparent;
      }

      & *::-webkit-scrollbar-thumb {
        background: ${i(n.gray[300],n.darkGray[200])};
      }

      & *::-webkit-scrollbar-thumb:hover {
        background: ${i(n.gray[400],n.darkGray[300])};
      }
    `,parentPanel:t`
      z-index: 9999;
      display: flex;
      height: 100%;
      gap: ${S.size[.5]};
      & * {
        box-sizing: border-box;
        text-transform: none;
      }

      & *::-webkit-scrollbar {
        width: 7px;
      }

      & *::-webkit-scrollbar-track {
        background: transparent;
      }

      & *::-webkit-scrollbar-thumb {
        background: ${i(n.gray[300],n.darkGray[200])};
      }

      & *::-webkit-scrollbar-thumb:hover {
        background: ${i(n.gray[400],n.darkGray[300])};
      }
    `,"devtoolsBtn-position-bottom-right":t`
      bottom: 12px;
      right: 12px;
    `,"devtoolsBtn-position-bottom-left":t`
      bottom: 12px;
      left: 12px;
    `,"devtoolsBtn-position-top-left":t`
      top: 12px;
      left: 12px;
    `,"devtoolsBtn-position-top-right":t`
      top: 12px;
      right: 12px;
    `,"devtoolsBtn-position-relative":t`
      position: relative;
    `,"panel-position-top":t`
      top: 0;
      right: 0;
      left: 0;
      max-height: 90%;
      min-height: ${o[14]};
      border-bottom: ${i(n.gray[400],n.darkGray[300])} 1px solid;
    `,"panel-position-bottom":t`
      bottom: 0;
      right: 0;
      left: 0;
      max-height: 90%;
      min-height: ${o[14]};
      border-top: ${i(n.gray[400],n.darkGray[300])} 1px solid;
    `,"panel-position-right":t`
      bottom: 0;
      right: 0;
      top: 0;
      border-left: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      max-width: 90%;
    `,"panel-position-left":t`
      bottom: 0;
      left: 0;
      top: 0;
      border-right: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      max-width: 90%;
    `,closeBtn:t`
      position: absolute;
      cursor: pointer;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      outline: none;
      background-color: ${i(n.gray[50],n.darkGray[700])};
      &:hover {
        background-color: ${i(n.gray[200],n.darkGray[500])};
      }
      &:focus-visible {
        outline: 2px solid ${n.blue[600]};
      }
      & svg {
        color: ${i(n.gray[600],n.gray[400])};
        width: ${o[2]};
        height: ${o[2]};
      }
    `,"closeBtn-position-top":t`
      bottom: 0;
      right: ${o[2]};
      transform: translate(0, 100%);
      border-right: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-left: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-top: none;
      border-bottom: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-radius: 0px 0px ${l.radius.sm} ${l.radius.sm};
      padding: ${o[.5]} ${o[1.5]} ${o[1]} ${o[1.5]};

      &::after {
        content: ' ';
        position: absolute;
        bottom: 100%;
        left: -${o[2.5]};
        height: ${o[1.5]};
        width: calc(100% + ${o[5]});
      }

      & svg {
        transform: rotate(180deg);
      }
    `,"closeBtn-position-bottom":t`
      top: 0;
      right: ${o[2]};
      transform: translate(0, -100%);
      border-right: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-left: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-top: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-bottom: none;
      border-radius: ${l.radius.sm} ${l.radius.sm} 0px 0px;
      padding: ${o[1]} ${o[1.5]} ${o[.5]} ${o[1.5]};

      &::after {
        content: ' ';
        position: absolute;
        top: 100%;
        left: -${o[2.5]};
        height: ${o[1.5]};
        width: calc(100% + ${o[5]});
      }
    `,"closeBtn-position-right":t`
      bottom: ${o[2]};
      left: 0;
      transform: translate(-100%, 0);
      border-right: none;
      border-left: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-top: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-bottom: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-radius: ${l.radius.sm} 0px 0px ${l.radius.sm};
      padding: ${o[1.5]} ${o[.5]} ${o[1.5]} ${o[1]};

      &::after {
        content: ' ';
        position: absolute;
        left: 100%;
        height: calc(100% + ${o[5]});
        width: ${o[1.5]};
      }

      & svg {
        transform: rotate(-90deg);
      }
    `,"closeBtn-position-left":t`
      bottom: ${o[2]};
      right: 0;
      transform: translate(100%, 0);
      border-left: none;
      border-right: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-top: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-bottom: ${i(n.gray[400],n.darkGray[300])} 1px solid;
      border-radius: 0px ${l.radius.sm} ${l.radius.sm} 0px;
      padding: ${o[1.5]} ${o[1]} ${o[1.5]} ${o[.5]};

      &::after {
        content: ' ';
        position: absolute;
        right: 100%;
        height: calc(100% + ${o[5]});
        width: ${o[1.5]};
      }

      & svg {
        transform: rotate(90deg);
      }
    `,queriesContainer:t`
      flex: 1 1 700px;
      background-color: ${i(n.gray[50],n.darkGray[700])};
      display: flex;
      flex-direction: column;
      & * {
        font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      }
    `,dragHandle:t`
      position: absolute;
      transition: background-color 0.125s ease;
      &:hover {
        background-color: ${n.purple[400]}${i("",s[90])};
      }
      z-index: 4;
    `,"dragHandle-position-top":t`
      bottom: 0;
      width: 100%;
      height: 3px;
      cursor: ns-resize;
    `,"dragHandle-position-bottom":t`
      top: 0;
      width: 100%;
      height: 3px;
      cursor: ns-resize;
    `,"dragHandle-position-right":t`
      left: 0;
      width: 3px;
      height: 100%;
      cursor: ew-resize;
    `,"dragHandle-position-left":t`
      right: 0;
      width: 3px;
      height: 100%;
      cursor: ew-resize;
    `,row:t`
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: ${S.size[2]} ${S.size[2.5]};
      gap: ${S.size[2.5]};
      border-bottom: ${i(n.gray[300],n.darkGray[500])} 1px solid;
      align-items: center;
      & > button {
        padding: 0;
        background: transparent;
        border: none;
        display: flex;
        gap: ${o[.5]};
        flex-direction: column;
      }
    `,logoAndToggleContainer:t`
      display: flex;
      gap: ${S.size[3]};
      align-items: center;
    `,logo:t`
      cursor: pointer;
      display: flex;
      flex-direction: column;
      background-color: transparent;
      border: none;
      gap: ${S.size[.5]};
      padding: 0px;
      &:hover {
        opacity: 0.7;
      }
      &:focus-visible {
        outline-offset: 4px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
    `,tanstackLogo:t`
      font-size: ${r.size.md};
      font-weight: ${r.weight.bold};
      line-height: ${r.lineHeight.xs};
      white-space: nowrap;
      color: ${i(n.gray[600],n.gray[300])};
    `,queryFlavorLogo:t`
      font-weight: ${r.weight.semibold};
      font-size: ${r.size.xs};
      background: linear-gradient(
        to right,
        ${i("#ea4037, #ff9b11","#dd524b, #e9a03b")}
      );
      background-clip: text;
      -webkit-background-clip: text;
      line-height: 1;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
    `,queryStatusContainer:t`
      display: flex;
      gap: ${S.size[2]};
      height: min-content;
    `,queryStatusTag:t`
      display: flex;
      gap: ${S.size[1.5]};
      box-sizing: border-box;
      height: ${S.size[6.5]};
      background: ${i(n.gray[50],n.darkGray[500])};
      color: ${i(n.gray[700],n.gray[300])};
      border-radius: ${S.border.radius.sm};
      font-size: ${r.size.sm};
      padding: ${S.size[1]};
      padding-left: ${S.size[1.5]};
      align-items: center;
      font-weight: ${r.weight.medium};
      border: ${i("1px solid "+n.gray[300],"1px solid transparent")};
      user-select: none;
      position: relative;
      &:focus-visible {
        outline-offset: 2px;
        outline: 2px solid ${n.blue[800]};
      }
    `,queryStatusTagLabel:t`
      font-size: ${r.size.xs};
    `,queryStatusCount:t`
      font-size: ${r.size.xs};
      padding: 0 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${i(n.gray[500],n.gray[400])};
      background-color: ${i(n.gray[200],n.darkGray[300])};
      border-radius: 2px;
      font-variant-numeric: tabular-nums;
      height: ${S.size[4.5]};
    `,statusTooltip:t`
      position: absolute;
      z-index: 1;
      background-color: ${i(n.gray[50],n.darkGray[500])};
      top: 100%;
      left: 50%;
      transform: translate(-50%, calc(${S.size[2]}));
      padding: ${S.size[.5]} ${S.size[2]};
      border-radius: ${S.border.radius.sm};
      font-size: ${r.size.xs};
      border: 1px solid ${i(n.gray[400],n.gray[600])};
      color: ${i(n.gray[600],n.gray[300])};

      &::before {
        top: 0px;
        content: ' ';
        display: block;
        left: 50%;
        transform: translate(-50%, -100%);
        position: absolute;
        border-color: transparent transparent
          ${i(n.gray[400],n.gray[600])} transparent;
        border-style: solid;
        border-width: 7px;
        /* transform: rotate(180deg); */
      }

      &::after {
        top: 0px;
        content: ' ';
        display: block;
        left: 50%;
        transform: translate(-50%, calc(-100% + 2px));
        position: absolute;
        border-color: transparent transparent
          ${i(n.gray[100],n.darkGray[500])} transparent;
        border-style: solid;
        border-width: 7px;
      }
    `,filtersContainer:t`
      display: flex;
      gap: ${S.size[2]};
      & > button {
        cursor: pointer;
        padding: ${S.size[.5]} ${S.size[1.5]} ${S.size[.5]}
          ${S.size[2]};
        border-radius: ${S.border.radius.sm};
        background-color: ${i(n.gray[100],n.darkGray[400])};
        border: 1px solid ${i(n.gray[300],n.darkGray[200])};
        color: ${i(n.gray[700],n.gray[300])};
        font-size: ${r.size.xs};
        display: flex;
        align-items: center;
        line-height: ${r.lineHeight.sm};
        gap: ${S.size[1.5]};
        max-width: 160px;
        &:focus-visible {
          outline-offset: 2px;
          border-radius: ${l.radius.xs};
          outline: 2px solid ${n.blue[800]};
        }
        & svg {
          width: ${S.size[3]};
          height: ${S.size[3]};
          color: ${i(n.gray[500],n.gray[400])};
        }
      }
    `,filterInput:t`
      padding: ${o[.5]} ${o[2]};
      border-radius: ${S.border.radius.sm};
      background-color: ${i(n.gray[100],n.darkGray[400])};
      display: flex;
      box-sizing: content-box;
      align-items: center;
      gap: ${S.size[1.5]};
      max-width: 160px;
      min-width: 100px;
      border: 1px solid ${i(n.gray[300],n.darkGray[200])};
      height: min-content;
      color: ${i(n.gray[600],n.gray[400])};
      & > svg {
        width: ${o[3]};
        height: ${o[3]};
      }
      & input {
        font-size: ${r.size.xs};
        width: 100%;
        background-color: ${i(n.gray[100],n.darkGray[400])};
        border: none;
        padding: 0;
        line-height: ${r.lineHeight.sm};
        color: ${i(n.gray[700],n.gray[300])};
        &::placeholder {
          color: ${i(n.gray[700],n.gray[300])};
        }
        &:focus {
          outline: none;
        }
      }

      &:focus-within {
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
    `,filterSelect:t`
      padding: ${S.size[.5]} ${S.size[2]};
      border-radius: ${S.border.radius.sm};
      background-color: ${i(n.gray[100],n.darkGray[400])};
      display: flex;
      align-items: center;
      gap: ${S.size[1.5]};
      box-sizing: content-box;
      max-width: 160px;
      border: 1px solid ${i(n.gray[300],n.darkGray[200])};
      height: min-content;
      & > svg {
        color: ${i(n.gray[600],n.gray[400])};
        width: ${S.size[2]};
        height: ${S.size[2]};
      }
      & > select {
        appearance: none;
        color: ${i(n.gray[700],n.gray[300])};
        min-width: 100px;
        line-height: ${r.lineHeight.sm};
        font-size: ${r.size.xs};
        background-color: ${i(n.gray[100],n.darkGray[400])};
        border: none;
        &:focus {
          outline: none;
        }
      }
      &:focus-within {
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
    `,actionsContainer:t`
      display: flex;
      gap: ${S.size[2]};
    `,actionsBtn:t`
      border-radius: ${S.border.radius.sm};
      background-color: ${i(n.gray[100],n.darkGray[400])};
      border: 1px solid ${i(n.gray[300],n.darkGray[200])};
      width: ${S.size[6.5]};
      height: ${S.size[6.5]};
      justify-content: center;
      display: flex;
      align-items: center;
      gap: ${S.size[1.5]};
      max-width: 160px;
      cursor: pointer;
      padding: 0;
      &:hover {
        background-color: ${i(n.gray[200],n.darkGray[500])};
      }
      & svg {
        color: ${i(n.gray[700],n.gray[300])};
        width: ${S.size[3]};
        height: ${S.size[3]};
      }
      &:focus-visible {
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
    `,actionsBtnOffline:t`
      & svg {
        stroke: ${i(n.yellow[700],n.yellow[500])};
        fill: ${i(n.yellow[700],n.yellow[500])};
      }
    `,overflowQueryContainer:t`
      flex: 1;
      overflow-y: auto;
      & > div {
        display: flex;
        flex-direction: column;
      }
    `,queryRow:t`
      display: flex;
      align-items: center;
      padding: 0;
      border: none;
      cursor: pointer;
      color: ${i(n.gray[700],n.gray[300])};
      background-color: ${i(n.gray[50],n.darkGray[700])};
      line-height: 1;
      &:focus {
        outline: none;
      }
      &:focus-visible {
        outline-offset: -2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
      &:hover .tsqd-query-hash {
        background-color: ${i(n.gray[200],n.darkGray[600])};
      }

      & .tsqd-query-observer-count {
        padding: 0 ${S.size[1]};
        user-select: none;
        min-width: ${S.size[6.5]};
        align-self: stretch;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${r.size.xs};
        font-weight: ${r.weight.medium};
        border-bottom-width: 1px;
        border-bottom-style: solid;
        border-bottom: 1px solid ${i(n.gray[300],n.darkGray[700])};
      }
      & .tsqd-query-hash {
        user-select: text;
        font-size: ${r.size.xs};
        display: flex;
        align-items: center;
        min-height: ${S.size[6]};
        flex: 1;
        padding: ${S.size[1]} ${S.size[2]};
        font-family:
          ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          'Liberation Mono', 'Courier New', monospace;
        border-bottom: 1px solid ${i(n.gray[300],n.darkGray[400])};
        text-align: left;
        text-overflow: clip;
        word-break: break-word;
      }

      & .tsqd-query-disabled-indicator {
        align-self: stretch;
        display: flex;
        align-items: center;
        padding: 0 ${S.size[2]};
        color: ${i(n.gray[800],n.gray[300])};
        background-color: ${i(n.gray[300],n.darkGray[600])};
        border-bottom: 1px solid ${i(n.gray[300],n.darkGray[400])};
        font-size: ${r.size.xs};
      }

      & .tsqd-query-static-indicator {
        align-self: stretch;
        display: flex;
        align-items: center;
        padding: 0 ${S.size[2]};
        color: ${i(n.teal[800],n.teal[300])};
        background-color: ${i(n.teal[100],n.teal[900])};
        border-bottom: 1px solid ${i(n.teal[300],n.teal[700])};
        font-size: ${r.size.xs};
      }
    `,selectedQueryRow:t`
      background-color: ${i(n.gray[200],n.darkGray[500])};
    `,detailsContainer:t`
      flex: 1 1 700px;
      background-color: ${i(n.gray[50],n.darkGray[700])};
      color: ${i(n.gray[700],n.gray[300])};
      font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      display: flex;
      text-align: left;
    `,detailsHeader:t`
      font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      position: sticky;
      top: 0;
      z-index: 2;
      background-color: ${i(n.gray[200],n.darkGray[600])};
      padding: ${S.size[1.5]} ${S.size[2]};
      font-weight: ${r.weight.medium};
      font-size: ${r.size.xs};
      line-height: ${r.lineHeight.xs};
      text-align: left;
    `,detailsBody:t`
      margin: ${S.size[1.5]} 0px ${S.size[2]} 0px;
      & > div {
        display: flex;
        align-items: stretch;
        padding: 0 ${S.size[2]};
        line-height: ${r.lineHeight.sm};
        justify-content: space-between;
        & > span {
          font-size: ${r.size.xs};
        }
        & > span:nth-child(2) {
          font-variant-numeric: tabular-nums;
        }
      }

      & > div:first-child {
        margin-bottom: ${S.size[1.5]};
      }

      & code {
        font-family:
          ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
          'Liberation Mono', 'Courier New', monospace;
        margin: 0;
        font-size: ${r.size.xs};
        line-height: ${r.lineHeight.xs};
      }

      & pre {
        margin: 0;
        display: flex;
        align-items: center;
      }
    `,queryDetailsStatus:t`
      border: 1px solid ${n.darkGray[200]};
      border-radius: ${S.border.radius.sm};
      font-weight: ${r.weight.medium};
      padding: ${S.size[1]} ${S.size[2.5]};
    `,actionsBody:t`
      flex-wrap: wrap;
      margin: ${S.size[2]} 0px ${S.size[2]} 0px;
      display: flex;
      gap: ${S.size[2]};
      padding: 0px ${S.size[2]};
      & > button {
        font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
        font-size: ${r.size.xs};
        padding: ${S.size[1]} ${S.size[2]};
        display: flex;
        border-radius: ${S.border.radius.sm};
        background-color: ${i(n.gray[100],n.darkGray[600])};
        border: 1px solid ${i(n.gray[300],n.darkGray[400])};
        align-items: center;
        gap: ${S.size[2]};
        font-weight: ${r.weight.medium};
        line-height: ${r.lineHeight.xs};
        cursor: pointer;
        &:focus-visible {
          outline-offset: 2px;
          border-radius: ${l.radius.xs};
          outline: 2px solid ${n.blue[800]};
        }
        &:hover {
          background-color: ${i(n.gray[200],n.darkGray[500])};
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        & > span {
          width: ${o[1.5]};
          height: ${o[1.5]};
          border-radius: ${S.border.radius.full};
        }
      }
    `,actionsSelect:t`
      font-size: ${r.size.xs};
      padding: ${S.size[.5]} ${S.size[2]};
      display: flex;
      border-radius: ${S.border.radius.sm};
      overflow: hidden;
      background-color: ${i(n.gray[100],n.darkGray[600])};
      border: 1px solid ${i(n.gray[300],n.darkGray[400])};
      align-items: center;
      gap: ${S.size[2]};
      font-weight: ${r.weight.medium};
      line-height: ${r.lineHeight.sm};
      color: ${i(n.red[500],n.red[400])};
      cursor: pointer;
      position: relative;
      &:hover {
        background-color: ${i(n.gray[200],n.darkGray[500])};
      }
      & > span {
        width: ${o[1.5]};
        height: ${o[1.5]};
        border-radius: ${S.border.radius.full};
      }
      &:focus-within {
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
      & select {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        appearance: none;
        background-color: transparent;
        border: none;
        color: transparent;
        outline: none;
      }

      & svg path {
        stroke: ${S.colors.red[400]};
      }
      & svg {
        width: ${S.size[2]};
        height: ${S.size[2]};
      }
    `,settingsMenu:t`
      display: flex;
      & * {
        font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      }
      flex-direction: column;
      gap: ${o[.5]};
      border-radius: ${S.border.radius.sm};
      border: 1px solid ${i(n.gray[300],n.gray[700])};
      background-color: ${i(n.gray[50],n.darkGray[600])};
      font-size: ${r.size.xs};
      color: ${i(n.gray[700],n.gray[300])};
      z-index: 99999;
      min-width: 120px;
      padding: ${o[.5]};
    `,settingsSubTrigger:t`
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: ${S.border.radius.xs};
      padding: ${S.size[1]} ${S.size[1]};
      cursor: pointer;
      background-color: transparent;
      border: none;
      color: ${i(n.gray[700],n.gray[300])};
      & svg {
        color: ${i(n.gray[600],n.gray[400])};
        transform: rotate(-90deg);
        width: ${S.size[2]};
        height: ${S.size[2]};
      }
      &:hover {
        background-color: ${i(n.gray[200],n.darkGray[500])};
      }
      &:focus-visible {
        outline-offset: 2px;
        outline: 2px solid ${n.blue[800]};
      }
      &.data-disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,settingsMenuHeader:t`
      padding: ${S.size[1]} ${S.size[1]};
      font-weight: ${r.weight.medium};
      border-bottom: 1px solid ${i(n.gray[300],n.darkGray[400])};
      color: ${i(n.gray[500],n.gray[400])};
      font-size: ${r.size.xs};
    `,settingsSubButton:t`
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: ${i(n.gray[700],n.gray[300])};
      font-size: ${r.size.xs};
      border-radius: ${S.border.radius.xs};
      padding: ${S.size[1]} ${S.size[1]};
      cursor: pointer;
      background-color: transparent;
      border: none;
      & svg {
        color: ${i(n.gray[600],n.gray[400])};
      }
      &:hover {
        background-color: ${i(n.gray[200],n.darkGray[500])};
      }
      &:focus-visible {
        outline-offset: 2px;
        outline: 2px solid ${n.blue[800]};
      }
    `,themeSelectedButton:t`
      background-color: ${i(n.purple[100],n.purple[900])};
      color: ${i(n.purple[700],n.purple[300])};
      & svg {
        color: ${i(n.purple[700],n.purple[300])};
      }
      &:hover {
        background-color: ${i(n.purple[100],n.purple[900])};
      }
    `,viewToggle:t`
      border-radius: ${S.border.radius.sm};
      background-color: ${i(n.gray[200],n.darkGray[600])};
      border: 1px solid ${i(n.gray[300],n.darkGray[200])};
      display: flex;
      padding: 0;
      font-size: ${r.size.xs};
      color: ${i(n.gray[700],n.gray[300])};
      overflow: hidden;

      &:has(:focus-visible) {
        outline: 2px solid ${n.blue[800]};
      }

      & .tsqd-radio-toggle {
        opacity: 0.5;
        display: flex;
        & label {
          display: flex;
          align-items: center;
          cursor: pointer;
          line-height: ${r.lineHeight.md};
        }

        & label:hover {
          background-color: ${i(n.gray[100],n.darkGray[500])};
        }
      }

      & > [data-checked] {
        opacity: 1;
        background-color: ${i(n.gray[100],n.darkGray[400])};
        & label:hover {
          background-color: ${i(n.gray[100],n.darkGray[400])};
        }
      }

      & .tsqd-radio-toggle:first-child {
        & label {
          padding: 0 ${S.size[1.5]} 0 ${S.size[2]};
        }
        border-right: 1px solid ${i(n.gray[300],n.darkGray[200])};
      }

      & .tsqd-radio-toggle:nth-child(2) {
        & label {
          padding: 0 ${S.size[2]} 0 ${S.size[1.5]};
        }
      }
    `,devtoolsEditForm:t`
      padding: ${o[2]};
      & > [data-error='true'] {
        outline: 2px solid ${i(n.red[200],n.red[800])};
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
      }
    `,devtoolsEditTextarea:t`
      width: 100%;
      max-height: 500px;
      font-family: 'Fira Code', monospace;
      font-size: ${r.size.xs};
      border-radius: ${l.radius.sm};
      field-sizing: content;
      padding: ${o[2]};
      background-color: ${i(n.gray[100],n.darkGray[800])};
      color: ${i(n.gray[900],n.gray[100])};
      border: 1px solid ${i(n.gray[200],n.gray[700])};
      resize: none;
      &:focus {
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${i(n.blue[200],n.blue[800])};
      }
    `,devtoolsEditFormActions:t`
      display: flex;
      justify-content: space-between;
      gap: ${o[2]};
      align-items: center;
      padding-top: ${o[1]};
      font-size: ${r.size.xs};
    `,devtoolsEditFormError:t`
      color: ${i(n.red[700],n.red[500])};
    `,devtoolsEditFormActionContainer:t`
      display: flex;
      gap: ${o[2]};
    `,devtoolsEditFormAction:t`
      font-family: ui-sans-serif, Inter, system-ui, sans-serif, sans-serif;
      font-size: ${r.size.xs};
      padding: ${o[1]} ${S.size[2]};
      display: flex;
      border-radius: ${l.radius.sm};
      background-color: ${i(n.gray[100],n.darkGray[600])};
      border: 1px solid ${i(n.gray[300],n.darkGray[400])};
      align-items: center;
      gap: ${o[2]};
      font-weight: ${r.weight.medium};
      line-height: ${r.lineHeight.xs};
      cursor: pointer;
      &:focus-visible {
        outline-offset: 2px;
        border-radius: ${l.radius.xs};
        outline: 2px solid ${n.blue[800]};
      }
      &:hover {
        background-color: ${i(n.gray[200],n.darkGray[500])};
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `}},Ve=e=>ps("light",e),je=e=>ps("dark",e);rr(["click","mousedown","input"]);var sf=e=>{const[t,n]=Ns({prefix:"TanstackQueryDevtools"}),r=Os(),o=M(()=>{const s=t.theme_preference||Vs;return s!=="system"?s:r()});return y(zo.Provider,{value:e,get children(){return y(Xs,{localStore:t,setLocalStore:n,get children(){return y(Bo.Provider,{value:o,get children(){return y(jd,{localStore:t,setLocalStore:n})}})}})}})},lf=sf;export{lf as default};
