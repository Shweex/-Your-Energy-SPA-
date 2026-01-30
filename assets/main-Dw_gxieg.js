(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&s(l)}).observe(document,{childList:!0,subtree:!0});function o(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(a){if(a.ep)return;a.ep=!0;const i=o(a);fetch(a.href,i)}})();const g="https://your-energy.b.goit.study/api",b="ye-quote",$="ye-favorites",E=/^\w+(\.\w+)?@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/,n={filter:"Muscles",category:null,page:1,limit:12,keyword:"",totalPages:1,mode:"categories"},r={filterButtons:document.querySelectorAll(".filter-btn"),categoryGrid:document.querySelector("[data-category-grid]"),exercisesResults:document.querySelector("[data-exercises-results]"),exercisesList:document.querySelector(".exercise-list"),exercisesTitle:document.querySelector(".exercises-results-title"),exercisesEmpty:document.querySelector(".exercises-empty"),exercisesBack:document.querySelector(".exercises-back-btn"),searchForm:document.querySelector(".exercises-search"),searchInput:document.querySelector(".exercises-search-input"),pagination:document.querySelector(".pagination"),quoteText:document.querySelector(".side-card-text"),quoteAuthor:document.querySelector(".side-card-author"),favoritesQuoteText:document.querySelector(".quote-text"),favoritesQuoteAuthor:document.querySelector(".quote-author"),favoritesList:document.querySelector(".favorites-list"),favoritesEmpty:document.querySelector(".favorites-empty"),subscribeForm:document.querySelector(".subscribe-form")},A=e=>e.toISOString().slice(0,10),d=e=>e?e.charAt(0).toUpperCase()+e.slice(1):"",m=e=>(e==null?void 0:e._id)||(e==null?void 0:e.id)||"",F=e=>{const t=Math.round(Number(e)||0);return Array.from({length:5},(o,s)=>s<t?"★":"☆").join("")},y=()=>{try{return JSON.parse(localStorage.getItem($))||[]}catch{return[]}},q=e=>{localStorage.setItem($,JSON.stringify(e))},N=e=>y().some(t=>m(t)===e),P=e=>{const t=y(),o=m(e),s=t.findIndex(a=>m(a)===o);return s>=0?t.splice(s,1):t.push(e),q(t),s<0},v=async e=>{const t=await fetch(e);if(!t.ok)throw new Error(`Request failed: ${t.status}`);return t.json()},w=e=>{if(Array.isArray(e))return{results:e,totalPages:1};const t=e.results||e.items||e.data||[],o=e.totalPages||e.total_pages||e.pages||Math.ceil((e.totalItems||t.length)/(e.perPage||1));return{results:t,totalPages:o||1}},R=async()=>{const e=localStorage.getItem(b),t=A(new Date);if(e)try{const a=JSON.parse(e);if(a.date===t)return a}catch{localStorage.removeItem(b)}const o=await v(`${g}/quote`),s={date:t,text:o.quote||o.text||"",author:o.author||""};return localStorage.setItem(b,JSON.stringify(s)),s},M=async()=>{try{const e=await R();r.quoteText&&(r.quoteText.textContent=e.text),r.quoteAuthor&&(r.quoteAuthor.textContent=e.author),r.favoritesQuoteText&&(r.favoritesQuoteText.textContent=e.text),r.favoritesQuoteAuthor&&(r.favoritesQuoteAuthor.textContent=`— ${e.author}`)}catch(e){console.error(e)}},O=e=>{r.filterButtons.forEach(t=>t.classList.remove("is-active")),e.classList.add("is-active")},I=async()=>{const e=new URLSearchParams({filter:n.filter,page:n.page,limit:n.limit}),t=await v(`${g}/filters?${e.toString()}`);return w(t)},B=e=>{r.categoryGrid&&(r.categoryGrid.innerHTML=e.map(t=>{const o=t.name||t.title||"",s=t.imgURL||t.imgUrl||t.image||t.previewUrl||"";return`
        <li class="category-tile" data-category="${o}">
          <img class="category-tile-image" src="${s}" alt="${o}" />
          <span class="category-tile-label">
            <span class="category-tile-title">${o}</span>
            <span class="category-tile-subtitle">${n.filter}</span>
          </span>
        </li>
      `}).join(""))},C=(e,t)=>{if(!r.pagination)return;if(e<=1){r.pagination.classList.add("is-hidden");return}r.pagination.classList.remove("is-hidden");const s=[...new Set([1,e,t,t-1,t+1])].filter(i=>i>=1&&i<=e).sort((i,l)=>i-l),a=[];s.forEach((i,l)=>{const c=s[l-1];c&&i-c>1&&a.push("dots"),a.push(i)}),r.pagination.innerHTML=`
    ${a.map(i=>i==="dots"?'<li class="pagination-item pagination-item--dots">...</li>':`
          <li class="pagination-item">
            <button class="pagination-btn ${i===t?"is-active":""}" type="button" data-page="${i}">
              ${i}
            </button>
          </li>
        `).join("")}
  `},G=async()=>{const e=new URLSearchParams({page:n.page,limit:n.limit});n.keyword&&e.set("keyword",n.keyword);const t=n.filter==="Body parts"?"bodypart":n.filter==="Muscles"?"muscles":"equipment";n.category&&e.set(t,n.category);const o=await v(`${g}/exercises?${e.toString()}`);return w(o)},j=e=>{r.exercisesList&&(r.exercisesList.innerHTML=e.map(t=>{const o=m(t),s=t.rating??0;return`
        <li class="exercise-card">
          <div class="exercise-card-head">
            <h4 class="exercise-name">${d(t.name)}</h4>
            <span class="exercise-rating">
              ${s}
              <span class="rating-stars">★</span>
            </span>
          </div>
          <div class="exercise-meta">
            <span>Body part: ${d(t.bodyPart)}</span>
            <span>Target: ${d(t.target)}</span>
          </div>
          <div class="exercise-stats">
            <span>${t.burnedCalories??0} kcal</span>
            <span>${t.time??0} min</span>
          </div>
          <button class="exercise-start-btn" type="button" data-id="${o}">
            Start
          </button>
        </li>
      `}).join(""))},D=()=>{r.categoryGrid&&r.categoryGrid.classList.add("is-hidden"),r.exercisesResults&&r.exercisesResults.classList.remove("is-hidden"),n.mode="exercises"},S=()=>{r.categoryGrid&&r.categoryGrid.classList.remove("is-hidden"),r.exercisesResults&&r.exercisesResults.classList.add("is-hidden"),n.mode="categories",n.keyword="",n.category=null,n.page=1},Q=()=>{if(!r.exercisesTitle)return;const e=n.category?`${n.filter} / ${n.category}`:"Exercises";r.exercisesTitle.textContent=e},f=async()=>{const{results:e,totalPages:t}=await I();B(e),C(t,n.page)},h=async()=>{const{results:e,totalPages:t}=await G();n.totalPages=t,j(e),Q(),C(t,n.page),r.exercisesEmpty&&r.exercisesEmpty.classList.toggle("is-hidden",e.length>0)},T=e=>{const t=document.createElement("div");t.className="modal-backdrop",t.innerHTML=e;const o=()=>{document.removeEventListener("keydown",s),t.remove()},s=i=>{i.key==="Escape"&&o()};t.addEventListener("click",i=>{i.target===t&&o()});const a=t.querySelector(".modal-close-btn");return a&&a.addEventListener("click",o),document.addEventListener("keydown",s),document.body.appendChild(t),{backdrop:t,onClose:o}},U=e=>{const{backdrop:t,onClose:o}=T(`
    <div class="modal modal--rating" role="dialog" aria-modal="true">
      <button class="modal-close-btn" type="button" aria-label="Close">×</button>
      <h3 class="modal-title">Rating</h3>
      <form class="rating-form">
        <div class="rating-row">
          <span class="rating-value">0.0</span>
          <div class="rating-options">
            ${[1,2,3,4,5].map(c=>`
                  <label class="rating-option">
                    <input type="radio" name="rating" value="${c}" ${c===5?"checked":""} />
                    <span>★</span>
                  </label>
                `).join("")}
          </div>
        </div>
        <input class="rating-email" type="email" name="email" placeholder="Email" required />
        <textarea class="rating-comment" name="comment" placeholder="Your comment"></textarea>
        <button class="modal-btn modal-btn-primary" type="submit">Send</button>
        <p class="form-message"></p>
      </form>
    </div>
  `),s=t.querySelector(".rating-form"),a=t.querySelector(".form-message"),i=t.querySelector(".rating-value"),l=5;i.textContent=l.toFixed(1),s.addEventListener("submit",async c=>{c.preventDefault();const u=new FormData(s),p=Number(u.get("rating")),k=String(u.get("email")).trim();if(!E.test(k)){a.textContent="Invalid email format.",a.className="form-message error";return}try{await fetch(`${g}/exercises/${m(e)}/rating`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({rating:p})}),a.textContent="Rating submitted successfully.",a.className="form-message success",setTimeout(()=>{o(),L(m(e))},600)}catch{a.textContent="Failed to submit rating.",a.className="form-message error"}}),s.addEventListener("change",c=>{if(c.target.name==="rating"){const u=Number(c.target.value);i.textContent=u.toFixed(1)}})},L=async e=>{var t,o;try{const s=await v(`${g}/exercises/${e}`),a=N(e)?"Remove from favorites":"Add to favorites",{backdrop:i,onClose:l}=T(`
      <div class="modal modal--exercise" role="dialog" aria-modal="true">
        <button class="modal-close-btn" type="button" aria-label="Close">×</button>
        <div class="modal-exercise">
          <div class="modal-media">
            ${s.gifUrl?`<img src="${s.gifUrl}" alt="${s.name}" />`:""}
          </div>
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title">${d(s.name)}</h3>
              <div class="modal-rating">
                <span class="modal-rating-value">${((o=(t=s.rating??0).toFixed)==null?void 0:o.call(t,2))??s.rating??0}</span>
                <span class="modal-rating-stars">${F(s.rating)}</span>
              </div>
            </div>
            <div class="modal-divider"></div>
            <ul class="modal-meta-list">
              <li><span class="modal-meta-label">Target</span><span class="modal-meta-value">${d(s.target)}</span></li>
              <li><span class="modal-meta-label">Body part</span><span class="modal-meta-value">${d(s.bodyPart)}</span></li>
              <li><span class="modal-meta-label">Equipment</span><span class="modal-meta-value">${d(s.equipment)}</span></li>
              <li><span class="modal-meta-label">Popular</span><span class="modal-meta-value">${s.popularity??0}</span></li>
            </ul>
            <div class="modal-divider"></div>
            <div class="modal-stats">
              <span>Burned calories: ${s.burnedCalories??0}</span>
              <span>Time: ${s.time??0} min</span>
            </div>
            <p class="modal-description">${s.description||""}</p>
            <div class="modal-actions">
              <button class="modal-btn modal-btn-primary" data-favorite type="button">
                ${a}
              </button>
              <button class="modal-btn modal-btn-secondary" data-rating type="button">
                Give a rating
              </button>
            </div>
          </div>
        </div>
      </div>
    `),c=i.querySelector("[data-favorite]"),u=i.querySelector("[data-rating]");c.addEventListener("click",()=>{const p=P(s);c.textContent=p?"Remove from favorites":"Add to favorites",r.favoritesList&&x()}),u.addEventListener("click",()=>{l(),U(s)})}catch{alert("Failed to load exercise details.")}},x=()=>{if(!r.favoritesList)return;const e=y();r.favoritesList.innerHTML=e.map(t=>{const o=m(t);return`
        <li class="favorite-card">
          <div class="favorite-card-head">
            <p class="favorite-name">${d(t.name)}</p>
            <button class="favorite-remove-btn" type="button" data-id="${o}">
              Remove
            </button>
          </div>
          <div class="favorite-meta">
            <p class="favorite-meta-item">Body part: ${d(t.bodyPart)}</p>
            <p class="favorite-meta-item">Target: ${d(t.target)}</p>
          </div>
          <div class="favorite-stats">
            <p class="favorite-stat">${t.burnedCalories??0} kcal</p>
            <p class="favorite-stat">${t.time??0} min</p>
          </div>
          <button class="favorite-start-btn" type="button" data-id="${o}">
            Start
          </button>
        </li>
      `}).join(""),r.favoritesEmpty&&r.favoritesEmpty.classList.toggle("is-hidden",e.length>0)},H=()=>{if(!r.subscribeForm)return;const e=document.createElement("p");e.className="form-message",r.subscribeForm.appendChild(e),r.subscribeForm.addEventListener("submit",async t=>{t.preventDefault();const o=r.subscribeForm.querySelector('input[name="email"]'),s=(o==null?void 0:o.value.trim())||"";if(!E.test(s)){e.textContent="Invalid email format.",e.className="form-message error";return}try{await fetch(`${g}/subscription`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:s})}),e.textContent="Subscription successful.",e.className="form-message success",r.subscribeForm.reset()}catch{e.textContent="Subscription failed.",e.className="form-message error"}})},_=()=>{var e,t,o;r.categoryGrid&&(r.filterButtons.forEach(s=>{s.addEventListener("click",async()=>{const a=s.textContent.trim();n.filter!==a&&(n.filter=a,n.page=1,n.keyword="",O(s),S(),await f())})}),r.categoryGrid.addEventListener("click",async s=>{const a=s.target.closest(".category-tile");a&&(n.category=a.dataset.category,n.page=1,D(),await h())}),r.exercisesList.addEventListener("click",s=>{const a=s.target.closest(".exercise-start-btn");a&&L(a.dataset.id)}),(e=r.exercisesBack)==null||e.addEventListener("click",async()=>{S(),await f()}),(t=r.searchForm)==null||t.addEventListener("submit",async s=>{var a;s.preventDefault(),n.keyword=((a=r.searchInput)==null?void 0:a.value.trim())||"",n.page=1,await h()}),(o=r.pagination)==null||o.addEventListener("click",async s=>{const a=s.target.closest("[data-page]");if(!a)return;const i=Number(a.dataset.page);i!==n.page&&(n.page=i,n.mode==="categories"?await f():await h())}),f())},J=()=>{r.favoritesList&&(x(),r.favoritesList.addEventListener("click",e=>{const t=e.target.closest(".favorite-remove-btn"),o=e.target.closest(".favorite-start-btn");if(t){const s=t.dataset.id,a=y().filter(i=>m(i)!==s);q(a),x()}o&&L(o.dataset.id)}))};document.addEventListener("DOMContentLoaded",()=>{const e=document.querySelector("[data-menu]"),t=document.querySelector(".burger-btn"),o=document.querySelector(".mobile-close-btn"),s=()=>{e&&(e.classList.add("is-hidden"),document.body.style.overflow="")},a=()=>{e&&(e.classList.remove("is-hidden"),document.body.style.overflow="hidden")};t==null||t.addEventListener("click",a),o==null||o.addEventListener("click",s),e==null||e.addEventListener("click",c=>{c.target.closest("a")&&s()});const l=window.location.pathname.replace(/\/+$/,"").endsWith("page-2.html");document.querySelectorAll(".nav-link").forEach(c=>{const u=c.getAttribute("href")||"",p=l&&u.includes("page-2.html")||!l&&u.includes("index.html");c.classList.toggle("is-active",p),p?c.setAttribute("aria-current","page"):c.removeAttribute("aria-current")}),M(),_(),J(),H()});
//# sourceMappingURL=main-Dw_gxieg.js.map
