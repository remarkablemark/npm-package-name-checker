let e,t;/**
 * Adds class to DOM element.
 *
 * @param element - The element.
 * @param className - The class.
 * @returns - The element.
 */function n(e,t){return -1===e.className.indexOf(t)&&(e.className+=" "+t),e}function r(e,t){return e.className.indexOf(t)>-1&&(e.className=e.className.replace(t,"").trim()),e}function a(e,t,n){if(!e)throw Error("The first argument must be an element");/* eslint-enable @typescript-eslint/ban-ts-comment */return e[t]!==n&&(e[t]=n),e}function c(e,t){switch(t){case"error":r(e,"green"),n(e,"red"),a(e,"textContent","cancel");break;case"success":r(e,"red"),n(e,"green"),a(e,"textContent","check_circle");break;case"broken":r(e,"green"),n(e,"red"),a(e,"textContent","report_problem");break;default:r(e,"red"),r(e,"green"),a(e,"textContent","search")}}// cache DOM nodes
const o=document.getElementById("npc-package-name"),s=document.getElementById("npc-loading"),i=document.getElementById("npc-result-text"),l=document.getElementById("npc-result-icon");// check name when it is typed (with a debounce)
o.addEventListener("keyup",/**
 * Handles `keyup` event.
 *
 * @param event - The event handler.
 */function(){var m;let u=o.value.toLowerCase();// blank input
if(!u){r(s,"is-active"),a(i,"textContent",""),c(l,"default"),t="";return}// check whether input has changed
if(u!==t){// invalid package name
if(t=u,!/^[a-zA-Z0-9_-]+$/.test(u)||"_"===u[0]){r(s,"is-active"),a(i,"textContent","Invalid name."),c(l,"error");return}a(i,"textContent",""),a(l,"textContent",""),n(s,"is-active"),(m=async()=>{let e,t;try{e=await fetch(`https://corsmirror.com/v1?url=https://registry.npmjs.com/${encodeURIComponent(u)}`,{headers:{"Content-Type":"application/json"}}),t=await e.json(),a(i,"textContent","Name is taken."),a(i,"href",`https://www.npmjs.com/package/${u}`),a(i,"target","_blank"),n(i,"hover"),c(l,"error")}catch(e){e.status>=500&&(a(i,"textContent","Server error."),c(l,"broken"),// eslint-disable-next-line no-console
console.error(e))}r(s,"is-active"),(e?.status===404||t?.time?.unpublished)&&(a(i,"textContent","Name is available."),c(l,"success"),a(i,"href","#"),a(i,"target",""),r(i,"hover"))},function(...t){clearTimeout(e),e=setTimeout(()=>{m.apply(this,t)},300)})()}}//# sourceMappingURL=index.1a76b27e.js.map
,!1);
//# sourceMappingURL=index.1a76b27e.js.map
