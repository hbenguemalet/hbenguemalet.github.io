(function(){
var D=window.BENCH,C=window.BENCH2,$=function(i){return document.getElementById(i)};
var eur=function(n){return n.toLocaleString("fr-FR",{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2})+"\u00a0€"};
var ls={get:function(k,d){try{var v=localStorage.getItem("benchpc:"+k);return v===null?d:JSON.parse(v)}catch(e){return d}},set:function(k,v){try{localStorage.setItem("benchpc:"+k,JSON.stringify(v))}catch(e){}}};
var S={tab:ls.get("tab","config"),card:ls.get("card","RTX 5070 Ti"),comp:ls.get("comp","gpu"),gpu:ls.get("gpu",0),res:ls.get("res","4k"),bsec:ls.get("bsec","cartes"),garde:ls.get("garde","cpu"),resale:ls.get("resale",0)};
var P={items:{},updated:null};
var COMPS=[["gpu","Carte graphique"],["psu","Alimentation"],["case","Boîtier"],["cooler","Refroidissement"],["fans","Ventilateurs"],["paste","Pâte"]];
var MAPMA={gpu:"gpu",psu:"psu",case:"case",cooler:"cool",fans:"cool",paste:"cool"};
var ICON={config:'<path d="M4 5h16v11H4zM9 20h6M12 16v4"/>',objectif:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>',compo:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',bench:'<path d="M5 20V10M12 20V4M19 20v-7"/>',goulot:'<path d="M4 5h16l-6 7v6l-4 2v-8z"/>',prix:'<path d="M3 12l9-9h8v8l-9 9z"/><circle cx="15.5" cy="8.5" r="1.3"/>'};
var TABS=[["config","Ma config"],["objectif","Objectif"],["compo","Pièces"],["bench","Bench"],["goulot","Goulot"],["prix","Prix"]];
function save(k,v){S[k]=v;ls.set(k,v)}
var TIER=["RTX 5070 Ti","RTX 5080","RTX 5090"];
function slug(n){return n.toLowerCase().replace(/[^a-z0-9]+/g,"-")}
function manual(n){return +ls.get("gpuprice:"+n,0)||0}
function G(n){return C.cartes.filter(function(c){return c.n===n})[0]}
function item(p,k){for(var i=0;i<p.items.length;i++){var id=p.items[i].id;if(id.slice(-k.length-1)==="-"+k)return p.items[i]}return null}
/* l'ensemble d'achat dépend de la carte choisie : paliers du document pour 5070 Ti/5080/5090, sinon même base avec l'alim conseillée */
function pal(){var n=S.card,ti=TIER.indexOf(n);if(ti>=0)return D.paliers[ti];
  var g=G(n)||G(TIER[0]),mp=manual(g.n),psuP=D.paliers[g.psu<=750?0:g.psu<=850?1:2];
  return {id:0,nom:g.n,sous:g.vram+" Go "+g.type,cible:"à calculer",accent:"#8fd3ff",custom:true,alt:null,
    items:D.paliers[0].items.map(function(it){
      if(it.k==="Carte graphique")return {id:"x-"+slug(g.n)+"-gpu",k:"Carte graphique",n:g.n,lo:mp,hi:mp,s:mp?"prix saisi par toi":"prix à relever",u:null,inconnu:!mp};
      if(it.k==="Alimentation")return psuP.items[1];
      return it})}}
/* prix : valeur relevée si dispo, sinon valeur du document */
function pr(it){if(it.inconnu)return{lo:0,hi:0,live:false,unknown:true};var r=P.items[it.id];
  if(it.lo!==it.hi&&!(r&&r.source==="site"))return{lo:it.lo,hi:it.hi,live:false};
  if(r&&r.source==="site")return{lo:r.price,hi:r.price,live:true,stock:r.stock,checked:r.checked};
  return{lo:it.lo,hi:it.hi,live:false}}
function total(p){var lo=0,hi=0;p.items.forEach(function(i){var x=pr(i);lo+=x.lo;hi+=x.hi});return{lo:lo,hi:hi}}
function tl(p,t){return p.items.some(function(i){return i.inconnu})?eur(Math.round(t.lo))+" + carte":rng(t)}
function rng(t){return t.lo===t.hi?eur(t.lo):eur(Math.round(t.lo))+" – "+eur(Math.round(t.hi))}
function ago(iso){var m=Math.round((Date.now()-new Date(iso))/60000);if(m<2)return "à l'instant";if(m<60)return "il y a "+m+" min";var h=Math.round(m/60);if(h<48)return "il y a "+h+" h";return "il y a "+Math.round(h/24)+" j"}
function fmtDate(iso){return new Date(iso).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}
function seg(arr,cur,key,cls){return '<div class="seg '+(cls||"")+'">'+arr.map(function(a){return '<button data-k="'+key+'" data-v="'+a[0]+'" class="'+(String(a[0])===String(cur)?"on":"")+'">'+a[1]+'</button>'}).join("")+'</div>'}
function bars(){requestAnimationFrame(function(){requestAnimationFrame(function(){document.querySelectorAll(".view.on .fill").forEach(function(f){f.style.width=f.dataset.w+"%"})})})}
function palSeg(){return seg(C.cartes.filter(function(c){return !c.actuel}).map(function(c){return [c.n,c.n]}),S.card,"card")}
function gpuInput(p){return p.custom?'<div class="row2"><span>Prix de la '+p.nom+' (€), à saisir</span><input id="gpuprice" type="number" inputmode="numeric" min="0" placeholder="0" value="'+(manual(p.nom)||"")+'" style="width:100px;background:#101217;border:1px solid var(--line);border-radius:10px;padding:9px 10px;color:var(--fg);font-size:16px"></div>':""}

/* ===== Ma config ===== */
function vConfig(){
  var chg=C.ma.filter(function(c){return c.statut==="change"}).length;
  return '<h2>Ce que j\'ai</h2><p class="sub">'+(C.ma.length-chg)+' pièces à garder, '+chg+' à changer.</p><div class="grid g2">'+C.ma.map(function(c){
    return '<div class="card cfg"><div class="top"><h3>'+c.nom+'</h3><span class="pill '+c.statut+'">'+(c.statut==="garde"?"Je garde":"À changer")+'</span></div><b>'+c.val+'</b><p>'+c.detail+'</p><p style="color:var(--fg)">'+c.note+'</p></div>'}).join("")+'</div>'}

/* ===== Objectif ===== */
function vObjectif(){var p=pal(),t=total(p);var r=S.resale;var net={lo:Math.max(0,t.lo-r),hi:Math.max(0,t.hi-r)};
  return '<h2>Ce que je dois avoir</h2><p class="sub">Choisis une carte : tout le site se cale dessus (alimentation comprise).</p>'+palSeg()+
  '<div class="card"><div class="mute small">'+(p.custom?(manual(p.nom)?'Total avec la carte à ton prix':'Total hors carte graphique, tant que son prix n\'est pas saisi'):'Budget annoncé '+p.cible)+'</div><div class="big" style="color:'+p.accent+'">'+tl(p,t)+'</div><div class="mute small">total estimé · '+p.sous+'</div>'+gpuInput(p)+
  '<div class="row2" style="margin-top:14px"><span>Revente de la 1070 et de l\'alim (€)</span><input id="resale" type="number" inputmode="numeric" min="0" placeholder="0" value="'+(r||"")+'" style="width:100px;background:#101217;border:1px solid var(--line);border-radius:10px;padding:9px 10px;color:var(--fg);font-size:16px"></div>'+
  (r?'<div class="row2"><span>Total après revente</span><span class="r"><b>'+tl(p,net)+'</b></span></div>':'')+'</div>'+
  '<h2 style="margin-top:26px;font-size:20px">À acheter</h2><div class="grid">'+p.items.map(function(it){var x=pr(it);
    return '<div class="card"><div class="mute small">'+it.k+'</div><b style="font-size:17px">'+it.n+'</b><div class="price-line"><span class="big" style="font-size:24px">'+(it.inconnu?'À relever':it.lo===it.hi?eur(x.lo):"env. "+eur(it.lo)+" à "+eur(it.hi))+'</span><span class="small mute">'+(x.live?"relevé "+ago(x.checked):it.s)+'</span></div></div>'}).join("")+'</div>'+
  '<h2 style="margin-top:26px;font-size:20px">Je garde</h2><div class="card">'+D.gardes.map(function(g){return '<div class="row2"><span><b>'+g[0]+'</b><br><span class="mute small">'+g[2]+'</span></span><span class="r">'+g[1]+'</span></div>'}).join("")+'</div>'}

/* ===== Pièces ===== */
function vCompo(){var p=pal(),it=item(p,S.comp),m=C.ma.filter(function(c){return c.id===MAPMA[S.comp]})[0];var x=pr(it);
  var h='<h2>Pièce par pièce</h2><p class="sub">Ce que j\'ai contre ce que je dois avoir.</p>'+palSeg()+seg(COMPS,S.comp,"comp");
  h+='<div class="vs"><div class="c"><small>Actuel</small><b>'+(S.comp==="gpu"?C.ma[1].val:S.comp==="psu"?C.ma[2].val:m.val)+'</b><span class="mute small">'+(S.comp==="gpu"?C.ma[1].detail:S.comp==="psu"?C.ma[2].detail:m.detail)+'</span></div><div class="c t"><small>Cible</small><b>'+it.n+'</b><span class="mute small">'+it.s+'</span></div></div>';
  h+='<div class="card" style="margin-top:12px"><div class="price-line" style="margin-top:0"><span class="big">'+(it.inconnu?'À relever':it.lo===it.hi?eur(x.lo):"env. "+eur(it.lo)+" à "+eur(it.hi))+'</span><span class="pill '+(x.live?"good":"mid")+'">'+(x.live?"Relevé "+ago(x.checked):"Prix du document")+'</span></div>'+
  (S.comp==='gpu'?gpuInput(p):'')+(it.w?'<div class="note">⚠ '+it.w+'</div>':'')+(it.u?'<a class="btn" href="'+it.u+'" target="_blank" rel="noopener">Voir l\'offre →</a>':'<p class="mute small" style="margin-top:12px">'+(S.comp==='gpu'?'Aucun lien : prix et stock à relever chez Alternate, LDLC ou Topachat.':'Pas encore choisi : à chercher.')+'</p>')+'</div>';
  var al=S.comp==="gpu"&&p.alt;if(al)h+='<div class="card" style="margin-top:12px"><div class="mute small">Alternative</div><b>'+al.n+'</b> · '+eur(prAlt(al))+'<p class="mute small" style="margin:4px 0">'+al.s+'. '+al.note+'</p><a class="lnk" href="'+al.u+'" target="_blank" rel="noopener">Voir →</a></div>';
  var tips={gpu:"Vérifier la longueur de la carte dans le boîtier. "+G(S.card).vram+" Go de mémoire vidéo ("+G(S.card).type+"), "+G(S.card).w+" W.",psu:"Puissance recommandée par le fabricant : "+G(S.card).psu+" W minimum pour cette carte.",case:"Mesurer la hauteur maximale de ventirad et la longueur maximale de carte avant de commander.",cooler:"Le Peerless Assassin mesure 155 mm de haut : à comparer à la limite du boîtier.",fans:"Pack de 5 : prévoir le sens du flux (entrée devant, sortie derrière et dessus).",paste:"Refaire la pâte lors du changement de ventirad."};
  return h+'<div class="note ok">'+tips[S.comp]+'</div>'}
function prAlt(a){var r=P.items[a.id];return r&&r.source==="site"?r.price:a.p}

/* ===== Bench ===== */
function vBench(){var h='<h2>Benchmarks</h2><p class="sub">Cartes proposées et pièces que je garde. Sources du '+C.bench_date+'.</p>'+seg([["cartes","Cartes graphiques"],["gardes","Pièces que je garde"]],S.bsec,"bsec");
  if(S.bsec==="gardes")return h+vGardes();
  var withPerf=C.cartes.filter(function(c){return c.perf!=null}).sort(function(a,b){return b.perf-a.perf}),max=withPerf[0].perf;
  var col=function(c){return c.actuel?"#6b7080":"#8fd3ff"};
  h+='<div class="card"><div class="mute small" style="margin-bottom:6px">Performance relative en jeu 4K · RTX 5070 Ti = 100</div>'+withPerf.map(function(c){
    return '<div><div class="br"><span class="nm">'+c.n+'</span><div class="track"><div class="fill" data-w="'+(c.perf/max*100)+'" style="background:'+col(c)+'"></div></div><span class="v">'+c.perf+'</span></div><div class="mute small" style="margin:-6px 0 0 114px">'+c.src+' · fiabilité : '+c.fiab+'</div></div>'}).join("")+'</div>'+
  '<div class="note">Ces écarts viennent de tests différents (jeux, réglages, dates). Ils donnent l\'ordre de grandeur, pas des FPS garantis. Le chiffre de la GTX 1070 est le moins fiable.</div>'+
  '<h2 style="margin-top:26px;font-size:20px">Toutes les cartes</h2><p class="sub">Fiche technique. Aucun prix inventé : ceux des paliers sont plus haut, les autres sont à relever.</p><div class="grid g2">'+C.cartes.map(function(c){
    var low=c.vram<16;return '<div class="card"><div class="top" style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b style="font-size:17px">'+c.n+'</b>'+(c.actuel?'<span class="pill change">Actuelle</span>':low?'<span class="pill bad">Moins de 16 Go</span>':'<span class="pill good">16 Go ou +</span>')+'</div>'+
    '<div class="row2"><span class="mute">Mémoire</span><span class="r">'+c.vram+' Go '+c.type+'</span></div><div class="row2"><span class="mute">Bus</span><span class="r">'+c.bus+' bits</span></div><div class="row2"><span class="mute">Consommation</span><span class="r">'+c.w+' W</span></div><div class="row2"><span class="mute">Alim conseillée</span><span class="r">'+c.psu+' W</span></div><div class="row2"><span class="mute">Perf. relative</span><span class="r">'+(c.perf!=null?c.perf:"non sourcée")+'</span></div></div>'}).join("")+'</div>'+
  '<h2 style="margin-top:26px;font-size:20px">Sources</h2><div class="card">'+C.sources.map(function(x){return '<div class="row2"><a class="lnk" href="'+x[1]+'" target="_blank" rel="noopener">'+x[0]+'</a></div>'}).join("")+'</div>';return h}
function vGardes(){var sel=C.gardes.filter(function(g){return g.id===S.garde})[0]||C.gardes[0];
  var order=C.gardes.slice().sort(function(a,b){return a.prio-b.prio});
  var h='<div class="note ok"><b>Ordre conseillé pour améliorer</b><br>'+order.map(function(g,i){return (i+1)+". "+g.nom}).join(" · ")+' <span class="mute">(après la carte graphique et l\'alimentation)</span></div>'+
  seg(C.gardes.map(function(g){return [g.id,g.nom]}),sel.id,"garde");
  h+='<div class="card"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b style="font-size:19px">'+sel.actuel+'</b><span class="pill '+(sel.prio<=2?"good":"mid")+'">Gain : '+sel.gain+'</span></div><p class="mute small" style="margin:6px 0 0">'+sel.sock+'</p><p style="margin-top:10px">'+sel.note+'</p></div>';
  if(sel.opts.length){h+='<div class="card" style="margin-top:12px"><div class="sh mute small" style="margin-bottom:6px">Comparatif</div>'+sel.opts.map(function(o){return '<div class="row2"><span><b>'+o.n+'</b>'+(o.actuel?' <span class="pill change">Actuel</span>':'')+'<br><span class="mute small">'+o.c+'</span></span><span class="r mute small">'+o.f+(o.w?'<br>'+o.w+' W max':'')+'</span></div>'}).join("")+'</div>'}
  h+='<div class="note">'+sel.verdict+'</div>';
  if(sel.src.length)h+='<div class="card" style="margin-top:12px">'+sel.src.map(function(x){return '<div class="row2"><a class="lnk" href="'+x[1]+'" target="_blank" rel="noopener">'+x[0]+'</a></div>'}).join("")+'</div>';
  return h}

/* ===== Goulot ===== */
function vGoulot(){var spec=C.cartes[Math.min(S.gpu,C.cartes.length-1)],g=spec.n,cur=!!spec.actuel,psu=650;
  var load=spec.w+C.cpuW+C.autresW,pct=Math.round(load/psu*100);var pc=pct>85?"bad":pct>75?"mid":"good";
  var res=S.res;var strong=spec.perf!=null&&spec.perf>=114;
  var gpuBound=res==="4k"||(res==="1440p"&&!strong)||(res==="1080p"&&cur);
  var items=[];
  items.push({t:"Carte graphique",c:gpuBound?(cur?"bad":"mid"):"good",d:gpuBound?(cur?"La carte limite presque tout en "+res.toUpperCase()+" : le processeur attend la GTX 1070.":"En "+res.toUpperCase()+", c'est la carte qui fixe les FPS, pas le processeur. C'est le comportement voulu."):"En "+res.toUpperCase()+" avec la "+g+", le processeur peut commencer à limiter. Règle générale, pas une mesure."});
  items.push({t:"Mémoire vidéo ("+spec.vram+" Go)",c:spec.vram<=8?"bad":spec.vram<16?"mid":"good",d:spec.vram<=8?"8 Go est souvent insuffisant en 4K avec textures élevées : risque de saccades.":spec.vram<16?"12 Go : juste pour le 4K, et sous ton minimum de 16 Go.":"Suffisant pour le 4K sur les jeux actuels."});
  items.push({t:"Alimentation actuelle (650 W)",c:pc,d:"Charge estimée "+load+" W ("+spec.w+" carte + "+C.cpuW+" processeur max + "+C.autresW+" reste) soit "+pct+" % de l'alim. "+(spec.psu>650?"Le fabricant conseille "+spec.psu+" W : à remplacer.":"Marge correcte.")});
  items.push({t:"Processeur i5-14600KF",c:"good",d:"14 cœurs, largement suffisant pour le 4K. À surveiller seulement en 1080p avec une carte très rapide."});
  items.push({t:"Mémoire DDR5 32 Go",c:"good",d:"Aucun frein pour le jeu. Vérifie que XMP/EXPO est activé."});
  items.push({t:"Carte mère B760",c:"good",d:"Pas un frein de performance. BIOS à jour : la stabilité des 13e/14e générations est couverte."});
  var worst=items.filter(function(i){return i.c==="bad"});
  var lab={bad:"Limite",mid:"À surveiller",good:"OK"};
  return '<h2>Goulots d\'étranglement</h2><p class="sub">Où ma config se fait freiner, selon la carte et la résolution.</p>'+
  seg(C.cartes.map(function(c,i){return [i,c.actuel?c.n+" (actuel)":c.n]}),S.gpu,"gpu")+seg([["1080p","1080p"],["1440p","1440p"],["4k","4K"]],S.res,"res")+
  '<div class="note '+(worst.length?"bad":"ok")+'"><b>'+(worst.length?worst.length+" maillon"+(worst.length>1?"s":"")+" limitant"+(worst.length>1?"s":""):"Aucun maillon bloquant")+'</b><br>'+(worst.length?worst.map(function(w){return w.t}).join(" · "):"Cette configuration est équilibrée pour "+res.toUpperCase()+".")+'</div>'+
  '<div class="card gauge" style="margin-top:12px"><div class="lab"><span>Charge de l\'alimentation actuelle</span><b>'+load+' / '+psu+' W</b></div><div class="track"><div class="fill" data-w="'+Math.min(pct,100)+'" style="background:'+(pc==="bad"?"var(--warn)":pc==="mid"?"var(--a3)":"var(--ok)")+'"></div></div><div class="mute small">Estimation : puissance max de la carte + processeur à pleine charge + 75 W pour le reste. Pas une mesure.</div></div>'+
  items.map(function(i){return '<div class="verdict"><span class="pill '+i.c+'">'+lab[i.c]+'</span><div><b>'+i.t+'</b>'+i.d+'</div></div>'}).join("")}

/* ===== Prix ===== */
function vPrix(){var p=pal();var rows=p.items.slice();var h='<h2>Prix</h2><p class="sub">'+(live()?"Relevé automatique toutes les heures, quand les sites répondent.":"Pour l'instant : prix du document du "+D.releve+". Le relevé automatique n'a pas encore lu de page.")+'</p>'+palSeg();
  var deals=[];
  h+='<div class="card">'+rows.map(function(it){var x=pr(it),r=P.items[it.id]||{},ref=r.ref||it.lo;var d=x.live&&it.lo===it.hi?x.lo-ref:0;if(d<=-ref*0.03)deals.push([it,x.lo,ref]);
    var st=x.live?'<span class="pill good">Relevé '+ago(x.checked)+'</span>':'<span class="pill mid">Document</span>';
    return '<div class="row2"><span><b>'+it.k+'</b><br><span class="mute small">'+it.n+'</span><br>'+st+(x.live&&x.stock===false?' <span class="pill bad">Rupture</span>':'')+'</span><span class="r"><b>'+(it.inconnu?'À relever':it.lo===it.hi?eur(x.lo):eur(it.lo)+" – "+eur(it.hi))+'</b>'+(d?'<br><span class="delta '+(d<0?"dn":"up")+' small">'+(d<0?"":"+")+eur(Math.round(d*100)/100)+' vs doc</span>':'')+(it.u?'<br><a class="lnk small" href="'+it.u+'" target="_blank" rel="noopener">Voir →</a>':'')+'</span></div>'}).join("")+
  '<div class="row2"><b>Total</b><span class="r"><b>'+tl(p,total(p))+'</b></span></div></div>';
  if(deals.length)h+='<div class="note ok"><b>Baisse détectée</b><br>'+deals.map(function(d){return d[0].k+" : "+eur(d[1])+" au lieu de "+eur(d[2])}).join("<br>")+'</div>';
  h+='<h2 style="margin-top:26px;font-size:20px">Bons plans</h2><div class="grid">'+D.bonsPlans.map(function(b){return '<div class="card"><span class="pill '+(b.warn?"bad":"good")+'">'+b.tag+'</span><b style="display:block;margin:10px 0 4px;font-size:17px">'+b.t+'</b><span class="big" style="font-size:26px">'+b.p+'</span><p class="mute small" style="margin-top:6px">'+b.d+'</p>'+(b.u?'<a class="lnk small" href="'+b.u+'" target="_blank" rel="noopener">Voir l\'offre →</a>':'')+'</div>'}).join("")+'</div>';
  return h}
function live(){return Object.keys(P.items).some(function(k){return P.items[k].source==="site"})}

var V={config:vConfig,objectif:vObjectif,compo:vCompo,bench:vBench,goulot:vGoulot,prix:vPrix};
function render(){
  TABS.forEach(function(t){var v=$("v-"+t[0]);var on=t[0]===S.tab;v.classList.toggle("on",on);if(on)v.innerHTML=V[t[0]]()});
  document.querySelectorAll("#tabbar button").forEach(function(b){b.classList.toggle("on",b.dataset.t===S.tab)});
  var gp=$("gpuprice");if(gp)gp.addEventListener("input",function(e){ls.set("gpuprice:"+S.card,Math.max(0,+e.target.value||0));var pos=e.target.selectionStart;render();var n=$("gpuprice");n.focus();try{n.setSelectionRange(pos,pos)}catch(x){}});
  var r=$("resale");if(r)r.addEventListener("input",function(e){save("resale",Math.max(0,+e.target.value||0));var pos=e.target.selectionStart;render();var n=$("resale");n.focus();try{n.setSelectionRange(pos,pos)}catch(x){}});
  bars();
}
function head(){var ls=null;Object.keys(P.items).forEach(function(k){var i=P.items[k];if(i.source==="site"&&(!ls||i.checked>ls))ls=i.checked});
  $("dot").className=ls?"":"off";$("maj").textContent=ls?"Prix relevés "+ago(ls):"Prix du document · "+D.releve}
$("tabbar").innerHTML=TABS.map(function(t){return '<button data-t="'+t[0]+'"><svg viewBox="0 0 24 24">'+ICON[t[0]]+'</svg>'+t[1]+'</button>'}).join("");
$("tabbar").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;save("tab",b.dataset.t);render();window.scrollTo({top:0,behavior:"smooth"})});
document.querySelector("main").addEventListener("click",function(e){var b=e.target.closest(".seg button");if(!b)return;var v=b.dataset.v;save(b.dataset.k,/^\d+$/.test(v)?+v:v);render()});
render();head();
fetch("prices.json",{cache:"no-cache"}).then(function(r){return r.ok?r.json():null}).then(function(j){if(j){P=j;render();head()}}).catch(function(){});
setInterval(function(){head()},60000);
})();
