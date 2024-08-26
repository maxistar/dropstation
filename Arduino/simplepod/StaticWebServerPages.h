#ifndef STATIC_WEBSERVER_PAGES_H
#define STATIC_WEBSERVER_PAGES_H


const char bundle_js[] PROGMEM = R"rawliteral(
var app=function(){"use strict";function t(){}const e=t=>t;function n(t,e){for(const n in e)t[n]=e[n];return t}function o(t){return t()}function r(){return Object.create(null)}function s(t){t.forEach(o)}function c(t){return"function"==typeof t}function i(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function a(e,...n){if(null==e)return t;const o=e.subscribe(...n);return o.unsubscribe?()=>o.unsubscribe():o}function u(t,e,n){t.$$.on_destroy.push(a(e,n))}function l(t,e,n,o){if(t){const r=f(t,e,n,o);return t[0](r)}}function f(t,e,o,r){return t[1]&&r?n(o.ctx.slice(),t[1](r(e))):o.ctx}function p(t,e,n,o){if(t[2]&&o){const r=t[2](o(n));if(void 0===e.dirty)return r;if("object"==typeof r){const t=[],n=Math.max(e.dirty.length,r.length);for(let o=0;o<n;o+=1)t[o]=e.dirty[o]|r[o];return t}return e.dirty|r}return e.dirty}function d(t,e,n,o,r,s){if(r){const c=f(e,n,o,s);t.p(c,r)}}function h(t){if(t.ctx.length>32){const e=[],n=t.ctx.length/32;for(let t=0;t<n;t++)e[t]=-1;return e}return-1}function $(t){const e={};for(const n in t)"$"!==n[0]&&(e[n]=t[n]);return e}function m(t,e){const n={};e=new Set(e);for(const o in t)e.has(o)||"$"===o[0]||(n[o]=t[o]);return n}const g="undefined"!=typeof window;let b=g?()=>window.performance.now():()=>Date.now(),v=g?t=>requestAnimationFrame(t):t;const y=new Set;function w(t){y.forEach((e=>{e.c(t)||(y.delete(e),e.f())})),0!==y.size&&v(w)}function x(t){let e;return 0===y.size&&v(w),{promise:new Promise((n=>{y.add(e={c:t,f:n})})),abort(){y.delete(e)}}}function k(t,e){t.appendChild(e)}function _(t){if(!t)return document;const e=t.getRootNode?t.getRootNode():t.ownerDocument;return e&&e.host?e:t.ownerDocument}function S(t){const e=N("style");return function(t,e){k(t.head||t,e),e.sheet}(_(t),e),e.sheet}function E(t,e,n){t.insertBefore(e,n||null)}function P(t){t.parentNode&&t.parentNode.removeChild(t)}function N(t){return document.createElement(t)}function D(t){return document.createTextNode(t)}function j(){return D(" ")}function A(){return D("")}function C(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function O(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}const q=["width","height"];function R(t,e){const n=Object.getOwnPropertyDescriptors(t.__proto__);for(const o in e)null==e[o]?t.removeAttribute(o):"style"===o?t.style.cssText=e[o]:"__value"===o?t.value=t[o]=e[o]:n[o]&&n[o].set&&-1===q.indexOf(o)?t[o]=e[o]:O(t,o,e[o])}function W(t){return""===t?null:+t}function M(t,e){e=""+e,t.data!==e&&(t.data=e)}function z(t,e){t.value=null==e?"":e}function L(t,e,{bubbles:n=!1,cancelable:o=!1}={}){const r=document.createEvent("CustomEvent");return r.initCustomEvent(t,n,o,e),r}function T(t,e){return new t(e)}const B=new Map;let K,I=0;function U(t,e,n,o,r,s,c,i=0){const a=16.666/o;let u="{\n";for(let t=0;t<=1;t+=a){const o=e+(n-e)*s(t);u+=100*t+`%{${c(o,1-o)}}\n`}const l=u+`100% {${c(n,1-n)}}\n}`,f=`__svelte_${function(t){let e=5381,n=t.length;for(;n--;)e=(e<<5)-e^t.charCodeAt(n);return e>>>0}(l)}_${i}`,p=_(t),{stylesheet:d,rules:h}=B.get(p)||function(t,e){const n={stylesheet:S(e),rules:{}};return B.set(t,n),n}(p,t);h[f]||(h[f]=!0,d.insertRule(`@keyframes ${f} ${l}`,d.cssRules.length));const $=t.style.animation||"";return t.style.animation=`${$?`${$}, `:""}${f} ${o}ms linear ${r}ms 1 both`,I+=1,f}function F(t,e){const n=(t.style.animation||"").split(", "),o=n.filter(e?t=>t.indexOf(e)<0:t=>-1===t.indexOf("__svelte")),r=n.length-o.length;r&&(t.style.animation=o.join(", "),I-=r,I||v((()=>{I||(B.forEach((t=>{const{ownerNode:e}=t.stylesheet;e&&P(e)})),B.clear())})))}function H(t){K=t}function J(){if(!K)throw new Error("Function called outside component initialization");return K}function G(t){J().$$.on_mount.push(t)}function Q(t,e){return J().$$.context.set(t,e),e}function V(t){return J().$$.context.get(t)}const X=[],Y=[];let Z=[];const tt=[],et=Promise.resolve();let nt=!1;function ot(t){Z.push(t)}const rt=new Set;let st,ct=0;function it(){if(0!==ct)return;const t=K;do{try{for(;ct<X.length;){const t=X[ct];ct++,H(t),at(t.$$)}}catch(t){throw X.length=0,ct=0,t}for(H(null),X.length=0,ct=0;Y.length;)Y.pop()();for(let t=0;t<Z.length;t+=1){const e=Z[t];rt.has(e)||(rt.add(e),e())}Z.length=0}while(X.length);for(;tt.length;)tt.pop()();nt=!1,rt.clear(),H(t)}function at(t){if(null!==t.fragment){t.update(),s(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(ot)}}function ut(){return st||(st=Promise.resolve(),st.then((()=>{st=null}))),st}function lt(t,e,n){t.dispatchEvent(L(`${e?"intro":"outro"}${n}`))}const ft=new Set;let pt;function dt(){pt={r:0,c:[],p:pt}}function ht(){pt.r||s(pt.c),pt=pt.p}function $t(t,e){t&&t.i&&(ft.delete(t),t.i(e))}function mt(t,e,n,o){if(t&&t.o){if(ft.has(t))return;ft.add(t),pt.c.push((()=>{ft.delete(t),o&&(n&&t.d(1),o())})),t.o(e)}else o&&o()}const gt={duration:0};function bt(t,e){const n=e.token={};function o(t,o,r,s){if(e.token!==n)return;e.resolved=s;let c=e.ctx;void 0!==r&&(c=c.slice(),c[r]=s);const i=t&&(e.current=t)(c);let a=!1;e.block&&(e.blocks?e.blocks.forEach(((t,n)=>{n!==o&&t&&(dt(),mt(t,1,1,(()=>{e.blocks[n]===t&&(e.blocks[n]=null)})),ht())})):e.block.d(1),i.c(),$t(i,1),i.m(e.mount(),e.anchor),a=!0),e.block=i,e.blocks&&(e.blocks[o]=i),a&&it()}if(!(r=t)||"object"!=typeof r&&"function"!=typeof r||"function"!=typeof r.then){if(e.current!==e.then)return o(e.then,1,e.value,t),!0;e.resolved=t}else{const n=J();if(t.then((t=>{H(n),o(e.then,1,e.value,t),H(null)}),(t=>{if(H(n),o(e.catch,2,e.error,t),H(null),!e.hasCatch)throw t})),e.current!==e.pending)return o(e.pending,0),!0}var r}function vt(t,e){const n={},o={},r={$$scope:1};let s=t.length;for(;s--;){const c=t[s],i=e[s];if(i){for(const t in c)t in i||(o[t]=1);for(const t in i)r[t]||(n[t]=i[t],r[t]=1);t[s]=i}else for(const t in c)r[t]=1}for(const t in o)t in n||(n[t]=void 0);return n}function yt(t){return"object"==typeof t&&null!==t?t:{}}function wt(t){t&&t.c()}function xt(t,e,n,r){const{fragment:i,after_update:a}=t.$$;i&&i.m(e,n),r||ot((()=>{const e=t.$$.on_mount.map(o).filter(c);t.$$.on_destroy?t.$$.on_destroy.push(...e):s(e),t.$$.on_mount=[]})),a.forEach(ot)}function kt(t,e){const n=t.$$;null!==n.fragment&&(!function(t){const e=[],n=[];Z.forEach((o=>-1===t.indexOf(o)?e.push(o):n.push(o))),n.forEach((t=>t())),Z=e}(n.after_update),s(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function _t(t,e){-1===t.$$.dirty[0]&&(X.push(t),nt||(nt=!0,et.then(it)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function St(e,n,o,c,i,a,u,l=[-1]){const f=K;H(e);const p=e.$$={fragment:null,ctx:[],props:a,update:t,not_equal:i,bound:r(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(n.context||(f?f.$$.context:[])),callbacks:r(),dirty:l,skip_bound:!1,root:n.target||f.$$.root};u&&u(p.root);let d=!1;if(p.ctx=o?o(e,n.props||{},((t,n,...o)=>{const r=o.length?o[0]:n;return p.ctx&&i(p.ctx[t],p.ctx[t]=r)&&(!p.skip_bound&&p.bound[t]&&p.bound[t](r),d&&_t(e,t)),n})):[],p.update(),d=!0,s(p.before_update),p.fragment=!!c&&c(p.ctx),n.target){if(n.hydrate){const t=function(t){return Array.from(t.childNodes)}(n.target);p.fragment&&p.fragment.l(t),t.forEach(P)}else p.fragment&&p.fragment.c();n.intro&&$t(e.$$.fragment),xt(e,n.target,n.anchor,n.customElement),it()}H(f)}class Et{$destroy(){kt(this,1),this.$destroy=t}$on(e,n){if(!c(n))return t;const o=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return o.push(n),()=>{const t=o.indexOf(n);-1!==t&&o.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const Pt={},Nt={},Dt={},jt=/^:(.+)/,At=t=>t.replace(/(^\/+|\/+$)/g,"").split("/"),Ct=t=>t.replace(/(^\/+|\/+$)/g,""),Ot=(t,e)=>({route:t,score:t.default?0:At(t.path).reduce(((t,e)=>(t+=4,""===e?t+=1:jt.test(e)?t+=2:"*"===e[0]?t-=5:t+=3,t)),0),index:e}),qt=(t,e)=>{let n,o;const[r]=e.split("?"),s=At(r),c=""===s[0],i=(t=>t.map(Ot).sort(((t,e)=>t.score<e.score?1:t.score>e.score?-1:t.index-e.index)))(t);for(let t=0,r=i.length;t<r;t++){const r=i[t].route;let a=!1;if(r.default){o={route:r,params:{},uri:e};continue}const u=At(r.path),l={},f=Math.max(s.length,u.length);let p=0;for(;p<f;p++){const t=u[p],e=s[p];if(t&&"*"===t[0]){l["*"===t?"*":t.slice(1)]=s.slice(p).map(decodeURIComponent).join("/");break}if(void 0===e){a=!0;break}const n=jt.exec(t);if(n&&!c){const t=decodeURIComponent(e);l[n[1]]=t}else if(t!==e){a=!0;break}}if(!a){n={route:r,params:l,uri:"/"+s.slice(0,p).join("/")};break}}return n||o||null},Rt=(t,e)=>t+(e?`?${e}`:""),Wt=(t,e)=>`${Ct("/"===e?t:`${Ct(t)}/${Ct(e)}`)}/`,Mt=()=>"undefined"!=typeof window&&"document"in window&&"location"in window,zt=t=>({active:4&t}),Lt=t=>({active:!!t[2]});function Tt(t){let e,o,r,s;const c=t[17].default,i=l(c,t,t[16],Lt);let a=[{href:t[0]},{"aria-current":t[2]},t[1],t[6]],u={};for(let t=0;t<a.length;t+=1)u=n(u,a[t]);return{c(){e=N("a"),i&&i.c(),R(e,u)},m(n,c){E(n,e,c),i&&i.m(e,null),o=!0,r||(s=C(e,"click",t[5]),r=!0)},p(t,[n]){i&&i.p&&(!o||65540&n)&&d(i,c,t,t[16],o?p(c,t[16],n,zt):h(t[16]),Lt),R(e,u=vt(a,[(!o||1&n)&&{href:t[0]},(!o||4&n)&&{"aria-current":t[2]},2&n&&t[1],64&n&&t[6]]))},i(t){o||($t(i,t),o=!0)},o(t){mt(i,t),o=!1},d(t){t&&P(e),i&&i.d(t),r=!1,s()}}}function Bt(t,e,o){let r;const s=["to","replace","state","getProps","preserveScroll"];let c,i,a=m(e,s),{$$slots:l={},$$scope:f}=e,{to:p="#"}=e,{replace:d=!1}=e,{state:h={}}=e,{getProps:g=()=>({})}=e,{preserveScroll:b=!1}=e;const v=V(Pt);u(t,v,(t=>o(14,c=t)));const{base:y}=V(Nt);u(t,y,(t=>o(15,i=t)));const{navigate:w}=V(Dt),x=function(){const t=J();return(e,n,{cancelable:o=!1}={})=>{const r=t.$$.callbacks[e];if(r){const s=L(e,n,{cancelable:o});return r.slice().forEach((e=>{e.call(t,s)})),!s.defaultPrevented}return!0}}();let k,_,S,E;return t.$$set=t=>{e=n(n({},e),$(t)),o(6,a=m(e,s)),"to"in t&&o(7,p=t.to),"replace"in t&&o(8,d=t.replace),"state"in t&&o(9,h=t.state),"getProps"in t&&o(10,g=t.getProps),"preserveScroll"in t&&o(11,b=t.preserveScroll),"$$scope"in t&&o(16,f=t.$$scope)},t.$$.update=()=>{32896&t.$$.dirty&&o(0,k=((t,e)=>{if(t.startsWith("/"))return t;const[n,o]=t.split("?"),[r]=e.split("?"),s=At(n),c=At(r);if(""===s[0])return Rt(r,o);if(!s[0].startsWith(".")){const t=c.concat(s).join("/");return Rt(("/"===r?"":"/")+t,o)}const i=c.concat(s),a=[];return i.forEach((t=>{".."===t?a.pop():"."!==t&&a.push(t)})),Rt("/"+a.join("/"),o)})(p,i.uri)),16385&t.$$.dirty&&o(12,_=c.pathname.startsWith(k)),16385&t.$$.dirty&&o(13,S=k===c.pathname),8192&t.$$.dirty&&o(2,r=S?"page":void 0),o(1,E=g({location:c,href:k,isPartiallyCurrent:_,isCurrent:S,existingProps:a}))},[k,E,r,v,y,t=>{if(x("click",t),(t=>!t.defaultPrevented&&0===t.button&&!(t.metaKey||t.altKey||t.ctrlKey||t.shiftKey))(t)){t.preventDefault();const e=c.pathname===k||d;w(k,{state:h,replace:e,preserveScroll:b})}},a,p,d,h,g,b,_,S,c,i,f,l]}class Kt extends Et{constructor(t){super(),St(this,t,Bt,Tt,i,{to:7,replace:8,state:9,getProps:10,preserveScroll:11})}}const It=t=>({params:4&t}),Ut=t=>({params:t[2]});function Ft(t){let e,n,o,r;const s=[Jt,Ht],c=[];function i(t,e){return t[0]?0:1}return e=i(t),n=c[e]=s[e](t),{c(){n.c(),o=A()},m(t,n){c[e].m(t,n),E(t,o,n),r=!0},p(t,r){let a=e;e=i(t),e===a?c[e].p(t,r):(dt(),mt(c[a],1,1,(()=>{c[a]=null})),ht(),n=c[e],n?n.p(t,r):(n=c[e]=s[e](t),n.c()),$t(n,1),n.m(o.parentNode,o))},i(t){r||($t(n),r=!0)},o(t){mt(n),r=!1},d(t){c[e].d(t),t&&P(o)}}}function Ht(t){let e;const n=t[8].default,o=l(n,t,t[7],Ut);return{c(){o&&o.c()},m(t,n){o&&o.m(t,n),e=!0},p(t,r){o&&o.p&&(!e||132&r)&&d(o,n,t,t[7],e?p(n,t[7],r,It):h(t[7]),Ut)},i(t){e||($t(o,t),e=!0)},o(t){mt(o,t),e=!1},d(t){o&&o.d(t)}}}function Jt(t){let e,n,o,r={ctx:t,current:null,token:null,hasCatch:!1,pending:Vt,then:Qt,catch:Gt,value:12,blocks:[,,,]};return bt(n=t[0],r),{c(){e=A(),r.block.c()},m(t,n){E(t,e,n),r.block.m(t,r.anchor=n),r.mount=()=>e.parentNode,r.anchor=e,o=!0},p(e,o){t=e,r.ctx=t,1&o&&n!==(n=t[0])&&bt(n,r)||function(t,e,n){const o=e.slice(),{resolved:r}=t;t.current===t.then&&(o[t.value]=r),t.current===t.catch&&(o[t.error]=r),t.block.p(o,n)}(r,t,o)},i(t){o||($t(r.block),o=!0)},o(t){for(let t=0;t<3;t+=1){mt(r.blocks[t])}o=!1},d(t){t&&P(e),r.block.d(t),r.token=null,r=null}}}function Gt(e){return{c:t,m:t,p:t,i:t,o:t,d:t}}function Qt(t){let e,o,r;const s=[t[2],t[3]];var c=t[12]?.default||t[12];function i(t){let e={};for(let t=0;t<s.length;t+=1)e=n(e,s[t]);return{props:e}}return c&&(e=T(c,i())),{c(){e&&wt(e.$$.fragment),o=A()},m(t,n){e&&xt(e,t,n),E(t,o,n),r=!0},p(t,n){const r=12&n?vt(s,[4&n&&yt(t[2]),8&n&&yt(t[3])]):{};if(1&n&&c!==(c=t[12]?.default||t[12])){if(e){dt();const t=e;mt(t.$$.fragment,1,0,(()=>{kt(t,1)})),ht()}c?(e=T(c,i()),wt(e.$$.fragment),$t(e.$$.fragment,1),xt(e,o.parentNode,o)):e=null}else c&&e.$set(r)},i(t){r||(e&&$t(e.$$.fragment,t),r=!0)},o(t){e&&mt(e.$$.fragment,t),r=!1},d(t){t&&P(o),e&&kt(e,t)}}}function Vt(e){return{c:t,m:t,p:t,i:t,o:t,d:t}}function Xt(t){let e,n,o=t[1]&&t[1].route===t[5]&&Ft(t);return{c(){o&&o.c(),e=A()},m(t,r){o&&o.m(t,r),E(t,e,r),n=!0},p(t,[n]){t[1]&&t[1].route===t[5]?o?(o.p(t,n),2&n&&$t(o,1)):(o=Ft(t),o.c(),$t(o,1),o.m(e.parentNode,e)):o&&(dt(),mt(o,1,1,(()=>{o=null})),ht())},i(t){n||($t(o),n=!0)},o(t){mt(o),n=!1},d(t){o&&o.d(t),t&&P(e)}}}function Yt(t,e,o){let r,{$$slots:s={},$$scope:c}=e,{path:i=""}=e,{component:a=null}=e,l={},f={};const{registerRoute:p,unregisterRoute:d,activeRoute:h}=V(Nt);u(t,h,(t=>o(1,r=t)));const m={path:i,default:""===i};var g;return p(m),g=()=>{d(m)},J().$$.on_destroy.push(g),t.$$set=t=>{o(11,e=n(n({},e),$(t))),"path"in t&&o(6,i=t.path),"component"in t&&o(0,a=t.component),"$$scope"in t&&o(7,c=t.$$scope)},t.$$.update=()=>{if(r&&r.route===m){o(2,l=r.params);const{component:t,path:n,...s}=e;o(3,f=s),t&&(t.toString().startsWith("class ")?o(0,a=t):o(0,a=t())),Mt()&&!r.preserveScroll&&window?.scrollTo(0,0)}},e=$(e),[a,r,l,f,h,m,i,c,s]}class Zt extends Et{constructor(t){super(),St(this,t,Yt,Xt,i,{path:6,component:0})}}const te=[];function ee(e,n=t){let o;const r=new Set;function s(t){if(i(e,t)&&(e=t,o)){const t=!te.length;for(const t of r)t[1](),te.push(t,e);if(t){for(let t=0;t<te.length;t+=2)te[t][0](te[t+1]);te.length=0}}}return{set:s,update:function(t){s(t(e))},subscribe:function(c,i=t){const a=[c,i];return r.add(a),1===r.size&&(o=n(s)||t),c(e),()=>{r.delete(a),0===r.size&&o&&(o(),o=null)}}}}function ne(e,n,o){const r=!Array.isArray(e),i=r?[e]:e,u=n.length<2;return l=e=>{let o=!1;const l=[];let f=0,p=t;const d=()=>{if(f)return;p();const o=n(r?l[0]:l,e);u?e(o):p=c(o)?o:t},h=i.map(((t,e)=>a(t,(t=>{l[e]=t,f&=~(1<<e),o&&d()}),(()=>{f|=1<<e}))));return o=!0,d(),function(){s(h),p(),o=!1}},{subscribe:ee(o,l).subscribe};var l}const oe=t=>({...t.location,state:t.history.state,key:t.history.state&&t.history.state.key||"initial"}),re=(t=>{const e=[];let n=oe(t);return{get location(){return n},listen(o){e.push(o);const r=()=>{n=oe(t),o({location:n,action:"POP"})};return t.addEventListener("popstate",r),()=>{t.removeEventListener("popstate",r);const n=e.indexOf(o);e.splice(n,1)}},navigate(o,{state:r,replace:s=!1,preserveScroll:c=!1,blurActiveElement:i=!0}={}){r={...r,key:Date.now()+""};try{s?t.history.replaceState(r,"",o):t.history.pushState(r,"",o)}catch(e){t.location[s?"replace":"assign"](o)}n=oe(t),e.forEach((t=>t({location:n,action:"PUSH",preserveScroll:c}))),i&&document.activeElement.blur()}}})(Mt()?window:((t="/")=>{let e=0;const n=[{pathname:t,search:""}],o=[];return{get location(){return n[e]},addEventListener(t,e){},removeEventListener(t,e){},history:{get entries(){return n},get index(){return e},get state(){return o[e]},pushState(t,r,s){const[c,i=""]=s.split("?");e++,n.push({pathname:c,search:i}),o.push(t)},replaceState(t,r,s){const[c,i=""]=s.split("?");n[e]={pathname:c,search:i},o[e]=t}}}})()),se=t=>({route:4&t,location:2&t}),ce=t=>({route:t[2]&&t[2].uri,location:t[1]}),ie=t=>({route:4&t,location:2&t}),ae=t=>({route:t[2]&&t[2].uri,location:t[1]});function ue(t){let e;const n=t[15].default,o=l(n,t,t[14],ce);return{c(){o&&o.c()},m(t,n){o&&o.m(t,n),e=!0},p(t,r){o&&o.p&&(!e||16390&r)&&d(o,n,t,t[14],e?p(n,t[14],r,se):h(t[14]),ce)},i(t){e||($t(o,t),e=!0)},o(t){mt(o,t),e=!1},d(t){o&&o.d(t)}}}function le(e){let n,o,r=e[1].pathname,s=fe(e);return{c(){s.c(),n=A()},m(t,e){s.m(t,e),E(t,n,e),o=!0},p(e,o){2&o&&i(r,r=e[1].pathname)?(dt(),mt(s,1,1,t),ht(),s=fe(e),s.c(),$t(s,1),s.m(n.parentNode,n)):s.p(e,o)},i(t){o||($t(s),o=!0)},o(t){mt(s),o=!1},d(t){t&&P(n),s.d(t)}}}function fe(n){let o,r,i,a;const u=n[15].default,f=l(u,n,n[14],ae);return{c(){o=N("div"),f&&f.c()},m(t,e){E(t,o,e),f&&f.m(o,null),a=!0},p(t,e){f&&f.p&&(!a||16390&e)&&d(f,u,t,t[14],a?p(u,t[14],e,ie):h(t[14]),ae)},i(s){a||($t(f,s),ot((()=>{a&&(i&&i.end(1),r=function(n,o,r){const s={direction:"in"};let i,a,u=o(n,r,s),l=!1,f=0;function p(){i&&F(n,i)}function d(){const{delay:o=0,duration:r=300,easing:s=e,tick:c=t,css:d}=u||gt;d&&(i=U(n,0,1,r,o,s,d,f++)),c(0,1);const h=b()+o,$=h+r;a&&a.abort(),l=!0,ot((()=>lt(n,!0,"start"))),a=x((t=>{if(l){if(t>=$)return c(1,0),lt(n,!0,"end"),p(),l=!1;if(t>=h){const e=s((t-h)/r);c(e,1-e)}}return l}))}let h=!1;return{start(){h||(h=!0,F(n),c(u)?(u=u(s),ut().then(d)):d())},invalidate(){h=!1},end(){l&&(p(),l=!1)}}}(o,n[3],{}),r.start())})),a=!0)},o(u){mt(f,u),r&&r.invalidate(),i=function(n,o,r){const i={direction:"out"};let a,u=o(n,r,i),l=!0;const f=pt;function p(){const{delay:o=0,duration:r=300,easing:c=e,tick:i=t,css:p}=u||gt;p&&(a=U(n,1,0,r,o,c,p));const d=b()+o,h=d+r;ot((()=>lt(n,!1,"start"))),x((t=>{if(l){if(t>=h)return i(0,1),lt(n,!1,"end"),--f.r||s(f.c),!1;if(t>=d){const e=c((t-d)/r);i(1-e,e)}}return l}))}return f.r+=1,c(u)?ut().then((()=>{u=u(i),p()})):p(),{end(t){t&&u.tick&&u.tick(1,0),l&&(a&&F(n,a),l=!1)}}}(o,n[3],{}),a=!1},d(t){t&&P(o),f&&f.d(t),t&&i&&i.end()}}}function pe(t){let e,n,o,r;const s=[le,ue],c=[];function i(t,e){return t[0]?0:1}return e=i(t),n=c[e]=s[e](t),{c(){n.c(),o=A()},m(t,n){c[e].m(t,n),E(t,o,n),r=!0},p(t,[r]){let a=e;e=i(t),e===a?c[e].p(t,r):(dt(),mt(c[a],1,1,(()=>{c[a]=null})),ht(),n=c[e],n?n.p(t,r):(n=c[e]=s[e](t),n.c()),$t(n,1),n.m(o.parentNode,o))},i(t){r||($t(n),r=!0)},o(t){mt(n),r=!1},d(t){c[e].d(t),t&&P(o)}}}function de(t,e,n){let o,r,s,c,{$$slots:i={},$$scope:a}=e,{basepath:l="/"}=e,{url:f=null}=e,{viewtransition:p=null}=e,{history:d=re}=e;Q(Dt,d);const h=V(Pt),$=V(Nt),m=ee([]);u(t,m,(t=>n(12,r=t)));const g=ee(null);u(t,g,(t=>n(2,c=t)));let b=!1;const v=h||ee(f?{pathname:f}:d.location);u(t,v,(t=>n(1,o=t)));const y=$?$.routerBase:ee({path:l,uri:l});u(t,y,(t=>n(13,s=t)));const w=ne([y,g],(([t,e])=>{if(!e)return t;const{path:n}=t,{route:o,uri:r}=e;return{path:o.default?n:o.path.replace(/\*.*$/,""),uri:r}}));let x=!1;return h||(G((()=>d.listen((t=>{n(11,x=t.preserveScroll||!1),v.set(t.location)})))),Q(Pt,v)),Q(Nt,{activeRoute:g,base:y,routerBase:w,registerRoute:t=>{const{path:e}=s;let{path:n}=t;if(t._path=n,t.path=Wt(e,n),"undefined"==typeof window){if(b)return;const e=qt([t],o.pathname);e&&(g.set(e),b=!0)}else m.update((e=>[...e,t]))},unregisterRoute:t=>{m.update((e=>e.filter((e=>e!==t))))}}),t.$$set=t=>{"basepath"in t&&n(8,l=t.basepath),"url"in t&&n(9,f=t.url),"viewtransition"in t&&n(0,p=t.viewtransition),"history"in t&&n(10,d=t.history),"$$scope"in t&&n(14,a=t.$$scope)},t.$$.update=()=>{if(8192&t.$$.dirty){const{path:t}=s;m.update((e=>e.map((e=>Object.assign(e,{path:Wt(t,e._path)})))))}if(6146&t.$$.dirty){const t=qt(r,o.pathname);g.set(t?{...t,preserveScroll:x}:t)}},[p,o,c,(t,e,n)=>{const o=p(n);return"function"==typeof o?.fn?o.fn(t,o):o},m,g,v,y,l,f,d,x,r,s,a,i]}class he extends Et{constructor(t){super(),St(this,t,de,pe,i,{basepath:8,url:9,viewtransition:0,history:10})}}function $e(e){let n,o,r,s,c,i,a,u,l,f,p,d,h,$,m,g,b,v,y,w,x=e[0].battery+"",_=e[0].soilMoisture+"",S=e[0].lastWatering+"";return{c(){n=N("main"),o=N("h1"),o.textContent="Watering System",r=j(),s=N("p"),c=D("Battery: "),i=D(x),a=D("%"),u=j(),l=N("p"),f=D("Soil Moisture: "),p=D(_),d=D("%"),h=j(),$=N("p"),m=D("Last Watering: "),g=D(S),b=j(),v=N("button"),v.textContent="Water the plant"},m(t,e){E(t,n,e),k(n,o),k(n,r),k(n,s),k(s,c),k(s,i),k(s,a),k(n,u),k(n,l),k(l,f),k(l,p),k(l,d),k(n,h),k(n,$),k($,m),k($,g),k(n,b),k(n,v),y||(w=C(v,"click",me),y=!0)},p(t,[e]){1&e&&x!==(x=t[0].battery+"")&&M(i,x),1&e&&_!==(_=t[0].soilMoisture+"")&&M(p,_),1&e&&S!==(S=t[0].lastWatering+"")&&M(g,S)},i:t,o:t,d(t){t&&P(n),y=!1,w()}}}async function me(){await fetch("/api/water",{method:"POST"})}function ge(t,e,n){let o={battery:0,soilMoisture:0,lastWatering:""};return G((async()=>{const t=await fetch("/api/status");n(0,o=await t.json())})),[o]}class be extends Et{constructor(t){super(),St(this,t,ge,$e,i,{})}}function ve(e){let n,o,r,c,i,a,u,l,f,p,d,h,$,m,g,b,v,y,w,x,_,S,A,q,R,M,L;return{c(){n=N("main"),o=N("h1"),o.textContent="Settings",r=j(),c=N("form"),i=N("label"),a=D("Sleep Duration (seconds):\n            "),u=N("input"),l=j(),f=N("label"),p=D("Watering Pin:\n            "),d=N("input"),h=j(),$=N("label"),m=D("Watering Duration (seconds):\n            "),g=N("input"),b=j(),v=N("label"),y=D("IP Address:\n            "),w=N("input"),x=j(),_=N("label"),S=D("mDNS Name:\n            "),A=N("input"),q=j(),R=N("button"),R.textContent="Save Settings",O(u,"type","number"),O(u,"class","svelte-1aqasb2"),O(i,"class","svelte-1aqasb2"),O(d,"type","number"),O(d,"class","svelte-1aqasb2"),O(f,"class","svelte-1aqasb2"),O(g,"type","number"),O(g,"class","svelte-1aqasb2"),O($,"class","svelte-1aqasb2"),O(w,"type","text"),O(w,"class","svelte-1aqasb2"),O(v,"class","svelte-1aqasb2"),O(A,"type","text"),O(A,"class","svelte-1aqasb2"),O(_,"class","svelte-1aqasb2"),O(R,"type","submit"),O(c,"class","settings-form svelte-1aqasb2")},m(t,s){var P;E(t,n,s),k(n,o),k(n,r),k(n,c),k(c,i),k(i,a),k(i,u),z(u,e[0].sleepDuration),k(c,l),k(c,f),k(f,p),k(f,d),z(d,e[0].wateringPin),k(c,h),k(c,$),k($,m),k($,g),z(g,e[0].wateringDuration),k(c,b),k(c,v),k(v,y),k(v,w),z(w,e[0].ipAddress),k(c,x),k(c,_),k(_,S),k(_,A),z(A,e[0].mdnsName),k(c,q),k(c,R),M||(L=[C(u,"input",e[2]),C(d,"input",e[3]),C(g,"input",e[4]),C(w,"input",e[5]),C(A,"input",e[6]),C(c,"submit",(P=e[1],function(t){return t.preventDefault(),P.call(this,t)}))],M=!0)},p(t,[e]){1&e&&W(u.value)!==t[0].sleepDuration&&z(u,t[0].sleepDuration),1&e&&W(d.value)!==t[0].wateringPin&&z(d,t[0].wateringPin),1&e&&W(g.value)!==t[0].wateringDuration&&z(g,t[0].wateringDuration),1&e&&w.value!==t[0].ipAddress&&z(w,t[0].ipAddress),1&e&&A.value!==t[0].mdnsName&&z(A,t[0].mdnsName)},i:t,o:t,d(t){t&&P(n),M=!1,s(L)}}}function ye(t,e,n){let o={sleepDuration:0,wateringPin:0,wateringDuration:0,ipAddress:"",mdnsName:""};return G((async()=>{const t=await fetch("/api/settings");n(0,o=await t.json())})),[o,async function(){await fetch("/api/settings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)})},function(){o.sleepDuration=W(this.value),n(0,o)},function(){o.wateringPin=W(this.value),n(0,o)},function(){o.wateringDuration=W(this.value),n(0,o)},function(){o.ipAddress=this.value,n(0,o)},function(){o.mdnsName=this.value,n(0,o)}]}class we extends Et{constructor(t){super(),St(this,t,ye,ve,i,{})}}function xe(t){let e;return{c(){e=D("Home")},m(t,n){E(t,e,n)},d(t){t&&P(e)}}}function ke(t){let e;return{c(){e=D("Settings")},m(t,n){E(t,e,n)},d(t){t&&P(e)}}}function _e(t){let e,n,o,r,s,c,i,a,u,l;return n=new Kt({props:{to:"/",$$slots:{default:[xe]},$$scope:{ctx:t}}}),r=new Kt({props:{to:"/settings",$$slots:{default:[ke]},$$scope:{ctx:t}}}),i=new Zt({props:{path:"/",component:be}}),u=new Zt({props:{path:"/settings",component:we}}),{c(){e=N("nav"),wt(n.$$.fragment),o=j(),wt(r.$$.fragment),s=j(),c=N("div"),wt(i.$$.fragment),a=j(),wt(u.$$.fragment),O(e,"class","svelte-xx7voz"),O(c,"class","main svelte-xx7voz")},m(t,f){E(t,e,f),xt(n,e,null),k(e,o),xt(r,e,null),E(t,s,f),E(t,c,f),xt(i,c,null),k(c,a),xt(u,c,null),l=!0},p(t,e){const o={};1&e&&(o.$$scope={dirty:e,ctx:t}),n.$set(o);const s={};1&e&&(s.$$scope={dirty:e,ctx:t}),r.$set(s)},i(t){l||($t(n.$$.fragment,t),$t(r.$$.fragment,t),$t(i.$$.fragment,t),$t(u.$$.fragment,t),l=!0)},o(t){mt(n.$$.fragment,t),mt(r.$$.fragment,t),mt(i.$$.fragment,t),mt(u.$$.fragment,t),l=!1},d(t){t&&P(e),kt(n),kt(r),t&&P(s),t&&P(c),kt(i),kt(u)}}}function Se(t){let e,n,o;return n=new he({props:{$$slots:{default:[_e]},$$scope:{ctx:t}}}),{c(){e=N("main"),wt(n.$$.fragment)},m(t,r){E(t,e,r),xt(n,e,null),o=!0},p(t,[e]){const o={};1&e&&(o.$$scope={dirty:e,ctx:t}),n.$set(o)},i(t){o||($t(n.$$.fragment,t),o=!0)},o(t){mt(n.$$.fragment,t),o=!1},d(t){t&&P(e),kt(n)}}}return new class extends Et{constructor(t){super(),St(this,t,null,Se,i,{})}}({target:document.body,props:{name:"world"}})}();
)rawliteral";


const char bundle_css[] PROGMEM = R"rawliteral(
.settings-form.svelte-1aqasb2 label.svelte-1aqasb2{display:flex;justify-content:space-between}.settings-form.svelte-1aqasb2 input.svelte-1aqasb2{width:50%}\
.main.svelte-xx7voz{width:800px;margin:0 auto}nav.svelte-xx7voz{display:flex;gap:1rem;margin-bottom:1rem}
)rawliteral";

const char global_css[] PROGMEM = "\
html, body {\
	position: relative;\
	width: 100%;\
	height: 100%;\
}\
\
body {\
	color: #333;\
	margin: 0;\
	padding: 8px;\
	box-sizing: border-box;\
	font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen-Sans, Ubuntu, Cantarell, \"Helvetica Neue\", sans-serif;\
}\
\
a {\
	color: rgb(0,100,200);\
	text-decoration: none;\
}\
\
a:hover {\
	text-decoration: underline;\
}\
\
a:visited {\
	color: rgb(0,80,160);\
}\
\
label {\
	display: block;\
}\
\
input, button, select, textarea {\
	font-family: inherit;\
	font-size: inherit;\
	-webkit-padding: 0.4em 0;\
	padding: 0.4em;\
	margin: 0 0 0.5em 0;\
	box-sizing: border-box;\
	border: 1px solid #ccc;\
	border-radius: 2px;\
}\
\
input:disabled {\
	color: #ccc;\
}\
\
button {\
	color: #333;\
	background-color: #f4f4f4;\
	outline: none;\
}\
\
button:disabled {\
	color: #999;\
}\
\
button:not(:disabled):active {\
	background-color: #ddd;\
}\
\
button:focus {\
	border-color: #666;\
}\
\
\
";

const char main_html[] PROGMEM = "\
<!DOCTYPE html>\
<html lang=\"en\">\
<head>\
	<meta charset='utf-8'>\
	<meta name='viewport' content='width=device-width,initial-scale=1'>\
	<title>Svelte app</title>\
	<link rel='stylesheet' href='/global.css'>\
	<link rel='stylesheet' href='/build/bundle.css'>\
	<script defer src='/build/bundle.js'></script>\
</head>\
<body>\
</body>\
</html>\
";

#endif // STATIC_WEBSERVER_PAGES_H