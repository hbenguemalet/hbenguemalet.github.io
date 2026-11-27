(function(){
var D=window.BENCH,$=function(i){return document.getElementById(i)};
var eur=function(n){return n.toLocaleString("fr-FR",{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2})+" €"};
var colors=["#8fd3ff","#b9a6ff","#ffb877"];
$("releve").textContent=D.releve;
$("chips").innerHTML=[["Processeur",D.actuel.cpu],["Carte graphique",D.actuel.gpu],["Alimentation",D.actuel.psu],["Mémoire",D.actuel.ram],["Plateforme",D.actuel.carte]].map(function(c){return '<span class="chip">'+c[0]+' · <b>'+c[1]+'</b></span>'}).join("");

/* bons plans */
$("deals").innerHTML=D.bonsPlans.map(function(d){
  var t=d.u?'a href="'+d.u+'" target="_blank" rel="noopener"':'div';var e=d.u?'a':'div';
  return '<'+t+' class="card deal'+(d.warn?' warn':'')+'"><span class="tag">'+d.tag+'</span><h3>'+d.t+'</h3><div class="price">'+d.p+'</div><p>'+d.d+'</p>'+(d.u?'<span class="go">Voir l\'offre →</span>':'')+'</'+e+'>'}).join("");

/* totaux */
function tot(p){var lo=0,hi=0;p.items.forEach(function(i){lo+=i.lo;hi+=i.hi});return{lo:lo,hi:hi}}
function range(t){return t.lo===t.hi?eur(t.lo):eur(Math.round(t.lo))+" – "+eur(Math.round(t.hi))}
var resale=+localStorage.getItem("benchpc:resale")||0;
$("resale").value=resale||"";
function drawBars(){
  var max=Math.max.apply(null,D.paliers.map(function(p){return tot(p).hi}));
  $("bars").innerHTML=D.paliers.map(function(p,i){var t=tot(p);var net={lo:Math.max(0,t.lo-resale),hi:Math.max(0,t.hi-resale)};
    return '<div class="bar"><div class="top"><b style="color:'+p.accent+'">Palier '+p.id+' · '+p.nom+'</b><span>'+range(net)+(resale?' après revente':'')+'</span></div><div class="track"><div class="fill" data-w="'+(net.hi/max*100)+'" style="background:linear-gradient(90deg,'+p.accent+'88,'+p.accent+')"></div></div></div>'}).join("");
  requestAnimationFrame(function(){requestAnimationFrame(function(){document.querySelectorAll(".fill").forEach(function(f){f.style.width=f.dataset.w+"%"})})});
  $("resaleNote").textContent=resale?"Déduit de chaque total.":"Laisse vide : valeur non renseignée.";
}
$("resale").addEventListener("input",function(e){resale=Math.max(0,+e.target.value||0);localStorage.setItem("benchpc:resale",resale);drawBars();drawPalier(cur)});
drawBars();

/* cartes */
var maxV=32,maxW=575;
function specBlock(title,key,max,unit){return '<div><div class="sh">'+title+'</div><div class="spec">'+D.gpus.map(function(g,i){var c=g.actuel?"#6b7080":colors[i-1];
  return '<div class="row'+(g.actuel?' cur':'')+'"><span class="nm">'+g.nom+'</span><div class="track"><div class="fill" data-w="'+(g[key]/max*100)+'" style="background:'+c+'"></div></div><span class="v">'+g[key]+' '+unit+'</span></div>'}).join("")+'</div></div>'}
$("gpus").innerHTML=specBlock("Mémoire vidéo","vram",maxV,"Go")+specBlock("Consommation de la carte","w",maxW,"W")+'<div class="chip" style="align-self:start">Bus mémoire : '+D.gpus.map(function(g){return g.nom+' <b>'+g.bus+' bits</b>'}).join(" · ")+'</div>';

/* paliers */
var cur=0;
function drawPalier(i){cur=i;var p=D.paliers[i],t=tot(p);
  document.querySelectorAll(".tab").forEach(function(b,j){b.classList.toggle("on",j===i);b.style.background=j===i?D.paliers[j].accent:""});
  var net={lo:Math.max(0,t.lo-resale),hi:Math.max(0,t.hi-resale)};
  var h='<div class="ptitle"><div><h3 style="color:'+p.accent+'">'+p.nom+'</h3><small>'+p.sous+' · budget annoncé '+p.cible+'</small></div><div class="total">'+range(t)+'<small>'+(resale?'soit '+range(net)+' après revente':'total estimé')+'</small></div></div><div class="items">';
  h+=p.items.map(function(it){var pr=it.lo===it.hi?eur(it.lo):'env. '+eur(it.lo)+' à '+eur(it.hi);
    return '<div class="it"><span class="k">'+it.k+'</span><span class="n">'+it.n+'<span class="s">'+it.s+'</span>'+(it.w?'<span class="w">⚠ '+it.w+'</span>':'')+'</span><span class="p">'+pr+(it.u?'<a href="'+it.u+'" target="_blank" rel="noopener">Voir →</a>':'')+'</span></div>'}).join("")+'</div>';
  if(p.alt)h+='<div class="alt"><b>Alternative : '+p.alt.n+'</b> à '+eur(p.alt.p)+' ('+p.alt.s+'). '+p.alt.note+' <a href="'+p.alt.u+'" target="_blank" rel="noopener">Voir →</a></div>';
  if(p.msrp)h+='<div class="alt" style="border-color:rgba(255,138,122,.4);color:#ffc0b8">La RTX 5090 est vendue '+eur(9199.99)+' chez Topachat, pour un prix conseillé de '+eur(p.msrp)+'. Il est raisonnable d\'attendre une baisse.</div>';
  $("palier").innerHTML=h}
$("tabs").innerHTML=D.paliers.map(function(p,i){return '<button class="tab" data-i="'+i+'">Palier '+p.id+' · '+p.nom+'</button>'}).join("");
$("tabs").addEventListener("click",function(e){var b=e.target.closest(".tab");if(b)drawPalier(+b.dataset.i)});
drawPalier(0);

/* benchmarks */
$("bgrid").innerHTML='<div class="brow h"><span class="jeu">Jeu</span><span>5070 Ti</span><span>5080</span><span>5090</span></div>'+D.jeux.map(function(j){var f=D.fps[j]||{};
  function c(k){return f[k]?'<span>'+f[k].fps+' FPS<br><small class="na">'+f[k].reglage+' · '+f[k].up+'</small></span>':'<span class="na">à confirmer</span>'}
  return '<div class="brow"><span class="jeu">'+j+'</span>'+c("5070Ti")+c("5080")+c("5090")+'</div>'}).join("");

/* checklist */
var done=JSON.parse(localStorage.getItem("benchpc:chk")||"{}");
$("chk").innerHTML=D.verifs.map(function(v,i){return '<label><input type="checkbox" data-i="'+i+'"'+(done[i]?' checked':'')+'><span>'+v+'</span></label>'}).join("");
$("chk").addEventListener("change",function(e){done[e.target.dataset.i]=e.target.checked;localStorage.setItem("benchpc:chk",JSON.stringify(done))});

/* apparition + barres specs + nav */
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");e.target.querySelectorAll("#gpus .fill").forEach(function(f){f.style.width=f.dataset.w+"%"});io.unobserve(e.target)}})},{threshold:.12});
document.querySelectorAll(".reveal").forEach(function(s){io.observe(s)});
var links=[].slice.call(document.querySelectorAll("nav a"));
var so=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)links.forEach(function(a){a.classList.toggle("on",a.getAttribute("href")==="#"+e.target.id)})})},{rootMargin:"-45% 0px -50% 0px"});
document.querySelectorAll("main section").forEach(function(s){so.observe(s)});
})();
