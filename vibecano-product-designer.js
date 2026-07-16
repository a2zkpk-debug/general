(function () {
  "use strict";
  var VibeDesigner = window.VibeDesigner = {};
  var API = "/wp-json/wc/store/v1";
  var CART_TOKEN_KEY = "vcWcCartToken";
  var PRODUCT_CONTEXT_KEY = "vcDesignerProductContext";

  var PRINT_POSITIONS = [
    {
      id: "chest_left",
      label: "Chest (Left)",
      side: "front",
      zone: "chest_left",
      price: 200,
      sizeGuide: "Left chest: 6–8cm wide (10–12cm for oversize). Keep design simple and clear."
    },
    {
      id: "chest_right",
      label: "Chest (Right)",
      side: "front",
      zone: "chest_right",
      price: 200,
      sizeGuide: "Right chest: 6–8cm wide (10–12cm for oversize). Keep design simple and clear."
    },
    {
      id: "chest_center",
      label: "Chest (Center)",
      side: "front",
      zone: "full_front",
      price: 200,
      sizeGuide: "Centered chest: 10–15cm wide. Ideal for logos and short text."
    },
    {
      id: "full_front",
      label: "Full front",
      side: "front",
      zone: "full_front",
      price: 500,
      sizeGuide: "30cm wide (33cm+ for oversize). Use about 25cm wide for smaller prints."
    },
    {
      id: "upper_back",
      label: "Upper back",
      side: "back",
      zone: "upper_back",
      price: 200,
      sizeGuide: "Centered 6–8cm for circle logos, or 10–12cm for rectangle / text."
    },
    {
      id: "full_back",
      label: "Full back",
      side: "back",
      zone: "full_back",
      price: 500,
      sizeGuide: "Scale across size range for maximum impact — same reference sizes as full front."
    },
    {
      id: "short_sleeve",
      label: "Short sleeve",
      side: "front",
      zone: "short_sleeve",
      price: 200,
      sizeGuide: "Very limited area — simple marks only. Max width 10cm."
    },
    {
      id: "long_sleeve",
      label: "Long sleeve",
      side: "front",
      zone: "long_sleeve",
      price: 300,
      sizeGuide: "Maximum width 10cm · maximum height 40cm."
    },
    {
      id: "inside_neck",
      label: "Inside neck",
      side: "back",
      zone: "inside_neck",
      price: 200,
      sizeGuide: "6–8cm wide. Keep the design simple."
    }
  ];

  function getDualSides(posId) {
    return null;
  }
  function isDualPosition(posId) { return !!getDualSides(posId); }
  function zoneForSide(sideId) {
    var pos=PRINT_POSITIONS.find(function(p){ return p.id===sideId; });
    if(pos) return pos.zone;
    if (sideId === "back" || sideId === "full_back") return "full_back";
    if (sideId === "upper_back") return "upper_back";
    if (sideId === "pocket") return "pocket";
    if (sideId === "sleeve" || sideId === "short_sleeve") return "short_sleeve";
    if (sideId === "long_sleeve") return "long_sleeve";
    if (sideId === "left_chest" || sideId === "chest_left") return "chest_left";
    if (sideId === "right_chest" || sideId === "chest_right") return "chest_right";
    if (sideId === "inside_neck") return "inside_neck";
    return "full_front";
  }

  var ZONE_DEFAULTS = {
    full_front: { left: 18, top: 24, width: 64, height: 42 },
    front: { left: 18, top: 24, width: 64, height: 42 },
    full_back: { left: 18, top: 22, width: 64, height: 44 },
    back: { left: 18, top: 22, width: 64, height: 44 },
    upper_back: { left: 30, top: 18, width: 40, height: 18 },
    pocket: { left: 54, top: 34, width: 16, height: 14 },
    short_sleeve: { left: 6, top: 36, width: 16, height: 14 },
    sleeve: { left: 6, top: 36, width: 16, height: 14 },
    long_sleeve: { left: 4, top: 30, width: 14, height: 36 },
    chest_left: { left: 30, top: 30, width: 18, height: 14 },
    left_chest: { left: 30, top: 30, width: 18, height: 14 },
    chest_right: { left: 52, top: 30, width: 18, height: 14 },
    right_chest: { left: 52, top: 30, width: 18, height: 14 },
    inside_neck: { left: 38, top: 14, width: 24, height: 10 }
  };

  function getZoneLayout(store, zoneKey){
    if(store.zoneLayouts && store.zoneLayouts[zoneKey]) return Object.assign({}, store.zoneLayouts[zoneKey]);
    return Object.assign({}, ZONE_DEFAULTS[zoneKey] || ZONE_DEFAULTS.front);
  }

  function isWhiteColor(color){
    if(!color) return false;
    var hex=normalizeHex(color.hex||"")||String(color.hex||"").toUpperCase();
    var name=String(color.name||color.raw||"").toLowerCase();
    if(/white|ivory|cream|off[\s-]?white/.test(name)) return true;
    return hex==="#FFFFFF"||hex==="#F5F5F4"||hex==="#FAFAFA"||hex==="#F8F8F8"||hex==="#FFFDD0"||hex==="#FFF8E7";
  }
  function clampText(value){
    return String(value==null?"":value).slice(0,200);
  }
  function autosizeTextarea(el){
    if(!el) return;
    el.style.height="auto";
    el.style.height=Math.min(220, Math.max(48, el.scrollHeight))+"px";
  }
  function bindTextInputs(root){
    root=root||document.getElementById("vdTextEditor");
    if(!root) return;
    Array.prototype.forEach.call(root.querySelectorAll("textarea"), function(ta){
      ta.setAttribute("maxlength","200");
      autosizeTextarea(ta);
      if(ta._vdBound) return;
      ta._vdBound=true;
      ta.addEventListener("input", function(){
        if(ta.value.length>200) ta.value=ta.value.slice(0,200);
        autosizeTextarea(ta);
        var count=root.querySelector("[data-char-count='"+ta.id+"'], [data-char-for='"+ta.id+"']");
        if(!count) count=root.querySelector("[data-char-count]");
        if(count){
          count.textContent=ta.value.length+"/200";
          count.classList.toggle("is-limit", ta.value.length>=200);
        }
      });
    });
  }

  function deleteLayer(id){
    var store=VibeDesigner.Store;
    store.layers=store.layers.filter(function(l){ return l.id!==id; });
    if(store.selectedLayerId===id){ store.selectedLayerId=null; showTextEditor(false); }
    store.emit();
  }

  var FONTS = [
    { id: "manrope", family: "Manrope", label: "Manrope", preview: "Aa Bb Cc" },
    { id: "jakarta", family: "Plus Jakarta Sans", label: "Jakarta", preview: "Aa Bb Cc" },
    { id: "bebas", family: "Bebas Neue", label: "Bebas Neue", preview: "AA BB CC" },
    { id: "playfair", family: "Playfair Display", label: "Playfair", preview: "Aa Bb Cc" },
    { id: "pacifico", family: "Pacifico", label: "Pacifico", preview: "Aa Bb Cc" },
    { id: "oswald", family: "Oswald", label: "Oswald", preview: "Aa Bb Cc" },
    { id: "lora", family: "Lora", label: "Lora", preview: "Aa Bb Cc" },
    { id: "space", family: "Space Grotesk", label: "Space Grotesk", preview: "Aa Bb Cc" }
  ];

  var PRESET_COLORS = ["#FFFFFF","#111827","#0B3D4A","#0E7490","#F97316","#DC2626","#D97706","#16A34A","#1D4ED8","#7C3AED","#DB2777","#EAB308"];

  var COLOR_HEX_MAP = {
    black:"#111827",white:"#F5F5F4",red:"#DC2626",blue:"#2563EB",green:"#16A34A",yellow:"#EAB308",
    orange:"#F97316",pink:"#EC4899",purple:"#7C3AED",navy:"#0B3D4A",maroon:"#7F1D1D",gray:"#6B7280",
    grey:"#6B7280",charcoal:"#374151",olive:"#6B8E23",cream:"#FFFDD0",royal:"#1D4ED8",teal:"#0E7490",
    forest:"#166534",coral:"#EA580C",sand:"#D6B88D",heather:"#9CA3AF"
  };

  var CLIPART = [
    { id: "star", name: "Star", tags: "star shape", svg: '<svg viewBox="0 0 64 64" fill="currentColor"><path d="M32 6l7.4 15.1L56 23.5 44 35.2l2.8 16.3L32 43.8 17.2 51.5 20 35.2 8 23.5l16.6-2.4z"/></svg>' },
    { id: "heart", name: "Heart", tags: "heart love", svg: '<svg viewBox="0 0 64 64" fill="currentColor"><path d="M32 54S8 38 8 22a12 12 0 0122-6 12 12 0 0122 6c0 16-24 32-24 32z"/></svg>' },
    { id: "bolt", name: "Bolt", tags: "bolt energy", svg: '<svg viewBox="0 0 64 64" fill="currentColor"><path d="M36 4L14 36h16l-4 24 28-36H36l8-20z"/></svg>' },
    { id: "leaf", name: "Leaf", tags: "leaf nature", svg: '<svg viewBox="0 0 64 64" fill="currentColor"><path d="M52 8C28 10 12 28 12 48c12 0 28-8 36-24-4 2-8 4-12 4 8-8 14-14 16-20z"/></svg>' },
    { id: "flame", name: "Flame", tags: "flame fire", svg: '<svg viewBox="0 0 64 64" fill="currentColor"><path d="M32 6c4 10-8 14-8 26a14 14 0 0028 0c0-12-8-16-8-26-8 6-8 14-12 20z"/></svg>' },
    { id: "crown", name: "Crown", tags: "crown royal", svg: '<svg viewBox="0 0 64 64" fill="currentColor"><path d="M8 44l6-24 10 12 8-20 8 20 10-12 6 24H8zm4 4h40v6H12z"/></svg>' },
    { id: "smile", name: "Smile", tags: "smile face", svg: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><circle cx="32" cy="32" r="24"/><path d="M20 38c4 6 20 6 24 0"/><circle cx="24" cy="26" r="3" fill="currentColor"/><circle cx="40" cy="26" r="3" fill="currentColor"/></svg>' },
    { id: "mountain", name: "Mountain", tags: "mountain outdoor", svg: '<svg viewBox="0 0 64 64" fill="currentColor"><path d="M8 48l16-24 8 10 8-14 16 28H8z"/></svg>' },
    { id: "wave", name: "Wave", tags: "wave water", svg: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4"><path d="M4 36c8-10 12-10 20 0s12 10 20 0 12-10 20 0"/></svg>' },
    { id: "diamond", name: "Diamond", tags: "diamond gem", svg: '<svg viewBox="0 0 64 64" fill="currentColor"><path d="M12 24l8-12h24l8 12-20 28z"/></svg>' },
    { id: "music", name: "Music", tags: "music note", svg: '<svg viewBox="0 0 64 64" fill="currentColor"><path d="M44 8v28a10 10 0 11-6-9V18l-18 4v22a10 10 0 11-6-9V18l30-10z"/></svg>' },
    { id: "paw", name: "Paw", tags: "paw animal", svg: '<svg viewBox="0 0 64 64" fill="currentColor"><circle cx="20" cy="20" r="6"/><circle cx="44" cy="20" r="6"/><circle cx="14" cy="34" r="5"/><circle cx="50" cy="34" r="5"/><ellipse cx="32" cy="44" rx="12" ry="10"/></svg>' }
  ];

  var SAMPLE = {
    id: 1001,
    name: "Classic Cotton Tee",
    basePrice: 1499,
    currencySymbol: "Rs ",
    material: "100% Combed Cotton · 180 GSM",
    permalink: "/shop/",
    maxUploadMb: 15,
    images: {
      front: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=1100&fit=crop",
      back: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&h=1100&fit=crop"
    },
    colors: [
      { id: "white", name: "White", hex: "#F5F5F4", inStock: true },
      { id: "black", name: "Black", hex: "#111827", inStock: true },
      { id: "navy", name: "Deep Navy", hex: "#0B3D4A", inStock: true },
      { id: "heather", name: "Heather Grey", hex: "#9CA3AF", inStock: true },
      { id: "forest", name: "Forest", hex: "#166534", inStock: true },
      { id: "maroon", name: "Maroon", hex: "#7F1D1D", inStock: false },
      { id: "ocean", name: "Ocean Teal", hex: "#0E7490", inStock: true },
      { id: "coral", name: "Sunset Coral", hex: "#EA580C", inStock: true },
      { id: "royal", name: "Royal Blue", hex: "#1D4ED8", inStock: true },
      { id: "sand", name: "Desert Sand", hex: "#D6B88D", inStock: false }
    ],
    sizes: [
      { id: "xs", label: "XS", inStock: true },
      { id: "s", label: "S", inStock: true },
      { id: "m", label: "M", inStock: true },
      { id: "l", label: "L", inStock: true },
      { id: "xl", label: "XL", inStock: true },
      { id: "xxl", label: "XXL", inStock: false }
    ],
    variations: [],
    colorAttr: null,
    sizeAttr: null,
    sizeChart: {
      title: "Regular Fit Size Chart (inches)",
      columns: ["XS","S","M","L","XL","XXL"],
      rows: [
        { label: "Length", values: { XS: 26, S: 27, M: 28, L: 29, XL: 30, XXL: 31 } },
        { label: "Chest", values: { XS: 18.5, S: 19.5, M: 20.5, L: 21.5, XL: 22.5, XXL: 23.5 } },
        { label: "Shoulder", values: { XS: 17, S: 18, M: 19, L: 20, XL: 21, XXL: 22 } },
        { label: "Sleeve", values: { XS: 7.5, S: 8, M: 8.5, L: 9, XL: 9.5, XXL: 10 } }
      ]
    }
  };

  function uid(p){ return p + "_" + Math.random().toString(36).slice(2,9); }
  function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function money(n,sym){ return (sym||"Rs ") + Number(n||0).toLocaleString(); }
  function defaultText(){
    return { content:"", fontId:"manrope", fontSize:36, fontWeight:700, letterSpacing:0, lineHeight:1.2, rotation:0, opacity:1, align:"center", bold:false, italic:false, underline:false, textCase:"none", color:"#111827", effect:"none", strokeWidth:0, strokeColor:"#FFFFFF", shadowBlur:8, curveAmount:0, gradientEnabled:false, gradientFrom:"#0B3D4A", gradientTo:"#0E7490", patternFill:false };
  }
  function colorToHex(name){
    var key = String(name||"").toLowerCase().replace(/[^a-z]/g,"");
    for (var k in COLOR_HEX_MAP) if (key.indexOf(k)>-1) return COLOR_HEX_MAP[k];
    var hash=0; for(var i=0;i<key.length;i++) hash=key.charCodeAt(i)+((hash<<5)-hash);
    var c=(hash&0x00FFFFFF).toString(16).toUpperCase();
    return "#" + ("000000".substring(0,6-c.length)+c);
  }
  function slugify(v){ return String(v||"").toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9\-]/g,""); }
  function normalizeHex(v){
    v=String(v||"").trim();
    if(/^#?[0-9a-fA-F]{6}$/.test(v)) return (v[0]==="#"?v:"#"+v).toUpperCase();
    if(/^#?[0-9a-fA-F]{3}$/.test(v)){ var r=v.replace("#",""); return ("#"+r[0]+r[0]+r[1]+r[1]+r[2]+r[2]).toUpperCase(); }
    return null;
  }
  function hexToRgb(hex){
    var h=String(hex).replace("#",""); if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n=parseInt(h,16); if(isNaN(n)) return "0, 0, 0";
    return ((n>>16)&255)+", "+((n>>8)&255)+", "+(n&255);
  }
  function rgbToHex(value){
    var parts=String(value).split(",").map(function(p){return Number(p.trim());});
    if(parts.length!==3||parts.some(function(n){return isNaN(n)||n<0||n>255;})) return null;
    return "#"+parts.map(function(n){var s=n.toString(16);return s.length===1?"0"+s:s;}).join("").toUpperCase();
  }

  VibeDesigner.Store = {
    product: JSON.parse(JSON.stringify(SAMPLE)),
    printPositionId: "full_front",
    colorId: "white",
    sizeMode: "single",
    selectedSizeId: "m",
    sizeQuantities: { m: 1 },
    layers: [],
    selectedLayerId: null,
    activePanel: "options",
    recentFonts: ["manrope","bebas","pacifico"],
    recentColors: ["#111827","#FFFFFF","#0B3D4A","#F97316"],
    uploadTab: "computer",
    uploadMode: "image",
    uploadAbort: null,
    clipQuery: "",
    textEditorOpen: false,
    clipartOpen: false,
    previewSide: "front",
    uploadTargetSide: null,
    textPairId: null,
    pendingSecondUpload: null,
    selectedVariationId: null,
    zoneLayouts: {},
    listeners: [],
    subscribe: function(fn){ this.listeners.push(fn); },
    emit: function(){ var s=this; this.listeners.forEach(function(fn){ fn(s); }); },
    getColor: function(){ var id=this.colorId; return this.product.colors.find(function(c){return c.id===id;})||this.product.colors[0]; },
    getPosition: function(){
      var id=this.printPositionId;
      var list=VibeDesigner.API.getAvailablePositions(this.product);
      return list.find(function(p){return p.id===id;})||list[0]||PRINT_POSITIONS[0];
    },
    getSelectedLayer: function(){ var id=this.selectedLayerId; return this.layers.find(function(l){return l.id===id;})||null; },
    getSize: function(){ var id=this.selectedSizeId; return this.product.sizes.find(function(s){return s.id===id;})||this.product.sizes[0]; },
    qty: function(){
      var self=this;
      if(this.sizeMode==="single") return Math.max(1, this.sizeQuantities[this.selectedSizeId]||1);
      return Object.keys(this.sizeQuantities).reduce(function(sum,k){ return sum+(self.sizeQuantities[k]||0); },0);
    },
    printFee: function(){
      var pos=this.getPosition();
      return Number(pos && pos.price) || 0;
    },
    unitPrice: function(){
      return (Number(this.product.basePrice)||0) + this.printFee();
    },
    total: function(){ return this.unitPrice() * Math.max(1, this.qty()); }
  };

  VibeDesigner.UI = {
    toastTimer: null,
    toast: function(msg){
      var el=document.getElementById("vdToast");
      el.textContent=msg; el.classList.add("is-show");
      clearTimeout(this.toastTimer);
      this.toastTimer=setTimeout(function(){ el.classList.remove("is-show"); },2600);
    },
    error: function(msg){
      var el=document.getElementById("vdError");
      if(!msg){ el.textContent=""; el.classList.remove("is-show"); return; }
      el.textContent=msg; el.classList.add("is-show");
    },
    updateTotals: function(){
      var store=VibeDesigner.Store;
      var sym=store.product.currencySymbol||"Rs ";
      var totalEl=document.getElementById("vdTotal");
      if(totalEl) totalEl.textContent=money(store.total(), sym);
      var breakEl=document.getElementById("vdPriceBreak");
      if(breakEl){
        var qty=Math.max(1, store.qty());
        var printFee=store.printFee();
        var base=Number(store.product.basePrice)||0;
        var pos=store.getPosition();
        breakEl.innerHTML=
          '<div><span>Product</span><strong>'+esc(money(base,sym))+'</strong></div>'+
          '<div><span>Print · '+esc(pos.label)+'</span><strong>'+esc(money(printFee,sym))+'</strong></div>'+
          (qty>1?'<div><span>Qty</span><strong>× '+qty+'</strong></div>':'')+
          '<div style="margin-top:2px;padding-top:6px;border-top:1px solid var(--line)"><span>Unit</span><strong>'+esc(money(store.unitPrice(),sym))+'</strong></div>';
      }
    }
  };

  /* ---------- WooCommerce API ---------- */
  VibeDesigner.API = {
    getCartToken: function(){ try{ return sessionStorage.getItem(CART_TOKEN_KEY)||""; }catch(e){ return ""; } },
    setCartToken: function(res){
      var token=res&&res.headers?res.headers.get("Cart-Token"):"";
      if(!token) return this.getCartToken();
      try{ sessionStorage.setItem(CART_TOKEN_KEY, token); }catch(e){}
      return token;
    },
    cartHeaders: function(nonce, token){
      var h={ "Content-Type":"application/json", "Nonce":nonce||"", "X-WC-Store-API-Nonce":nonce||"" };
      token=token||this.getCartToken();
      if(token) h["Cart-Token"]=token;
      return h;
    },
    checkoutUrl: function(token){
      token=token||this.getCartToken();
      if(!token) return "/checkout/";
      try{ var u=new URL("/checkout/", window.location.origin); u.searchParams.set("session", token); return u.pathname+u.search; }
      catch(e){ return "/checkout/?session="+encodeURIComponent(token); }
    },
    getProductIdFromUrl: function(){
      try{
        var params=new URLSearchParams(window.location.search);
        var id=params.get("product_cms")||params.get("product_id")||params.get("pid");
        return id && /^\d+$/.test(String(id)) ? String(id) : "";
      }catch(e){ return ""; }
    },
    getSavedProductContext: function(){
      try{
        var raw=sessionStorage.getItem(PRODUCT_CONTEXT_KEY);
        if(raw) return JSON.parse(raw);
        try {
          var lr = localStorage.getItem(PRODUCT_CONTEXT_KEY);
          return lr ? JSON.parse(lr) : null;
        } catch(e){ return null; }
      }catch(e){ return null; }
    },
    saveProductContext: function(ctx){
      try{ if(ctx) sessionStorage.setItem(PRODUCT_CONTEXT_KEY, JSON.stringify(ctx)); }catch(e){}
    },
    attrKey: function(attr){
      if(!attr) return "";
      if(attr.taxonomy) return "attribute_"+String(attr.taxonomy).toLowerCase();
      return "attribute_"+String(attr.name||"").toLowerCase().replace(/\s+/g,"_");
    },
    getAttributeTerms: function(attr, variationDetails, pattern){
      var terms=[], seen={};
      function push(label){
        label=String(label||"").trim();
        if(!label) return;
        var key=label.toLowerCase();
        if(seen[key]) return;
        seen[key]=true;
        terms.push(label);
      }
      if(attr && Array.isArray(attr.terms) && attr.terms.length){
        attr.terms.forEach(function(term){ push(typeof term==="string"?term:(term&&term.name)||(term&&term.label)||(term&&term.slug)); });
      }else if(attr && Array.isArray(attr.options) && attr.options.length){
        attr.options.forEach(function(opt){ push(opt); });
      }
      if(!terms.length && variationDetails && variationDetails.length){
        variationDetails.forEach(function(variation){
          var attrs=variation.attributes||[];
          attrs.forEach(function(a){
            var name=String(a.name||a.taxonomy||a.attribute||"").toLowerCase();
            if(pattern.test(name)) push(a.value!=null?a.value:(a.option||""));
          });
        });
      }
      return terms;
    },
    loadVariations: function(product){
      var variations=Array.isArray(product.variations)?product.variations:[];
      if(!variations.length) return Promise.resolve([]);
      return Promise.all(variations.map(function(variation){
        var vid=variation && (variation.id||variation.variation_id||variation);
        if(!vid) return Promise.resolve(null);
        return fetch(API+"/products/"+encodeURIComponent(vid), { credentials:"same-origin" })
          .then(function(r){ return r.ok?r.json():null; })
          .catch(function(){ return null; });
      })).then(function(list){ return list.filter(Boolean); });
    },
    mapProduct: function(data, variationDetails){
      variationDetails=variationDetails||[];
      var gallery=(data.images||[]).map(function(img){ return img && img.src; }).filter(Boolean);
      var prices=data.prices||{};
      var decimals=Number(prices.currency_minor_unit); if(!Number.isFinite(decimals)) decimals=2;
      var base=Number.parseInt(prices.price||prices.regular_price||"0",10);
      if(!Number.isFinite(base)) base=SAMPLE.basePrice; else base=base/Math.pow(10,decimals);

      var colors=[], sizes=[], colorAttr=null, sizeAttr=null;
      (data.attributes||[]).forEach(function(attr){
        var name=String(attr.name||attr.taxonomy||"").toLowerCase();
        if(/colou?r/.test(name)){
          colorAttr=attr;
          VibeDesigner.API.getAttributeTerms(attr, variationDetails, /colou?r/i).forEach(function(label){
            var inStock=true;
            if(variationDetails.length){
              var matches=variationDetails.filter(function(v){
                return VibeDesigner.API.variationMatches(v, label, null);
              });
              if(matches.length){
                inStock=matches.some(function(v){ return VibeDesigner.API.isVariationInStock(v); });
              } else {
                inStock=true; // unmatched attribute values stay available
              }
            }
            colors.push({ id:slugify(label), name:label, hex:colorToHex(label), inStock:inStock, raw:label });
          });
        }
        if(/size/.test(name)){
          sizeAttr=attr;
          VibeDesigner.API.getAttributeTerms(attr, variationDetails, /size/i).forEach(function(label){
            var inStock=true;
            if(variationDetails.length){
              var matches=variationDetails.filter(function(v){
                return VibeDesigner.API.variationMatches(v, null, label);
              });
              if(matches.length){
                inStock=matches.some(function(v){ return VibeDesigner.API.isVariationInStock(v); });
              } else {
                inStock=true;
              }
            }
            sizes.push({ id:slugify(label), label:label, inStock:inStock, raw:label });
          });
        }
      });
      // Only product colors/sizes from the single product — never pad with sample extras
      if(!colors.length && !data.id) colors=SAMPLE.colors.slice();
      if(!sizes.length && !data.id) sizes=SAMPLE.sizes.slice();

      var front=gallery[0]||"";
      var back=gallery[1]||gallery[0]||"";
      var categories=Array.isArray(data.categories)?data.categories:[];
      var tags=Array.isArray(data.tags)?data.tags:[];

      return {
        id:data.id,
        name:data.name||"Custom Product",
        slug:data.slug||"",
        basePrice:base||SAMPLE.basePrice,
        currencySymbol:prices.currency_prefix||prices.currency_symbol||"Rs ",
        material:(data.short_description||"").replace(/<[^>]+>/g," ").trim().slice(0,90)||"",
        permalink:data.permalink||("/product/"+(data.slug||"")+"/"),
        maxUploadMb:15,
        images:{ front:front, back:back },
        gallery:gallery,
        categories:categories,
        tags:tags,
        colors:colors,
        sizes:sizes,
        variations:variationDetails.length?variationDetails:(Array.isArray(data.variations)?data.variations:[]),
        variationDetails:variationDetails,
        colorAttr:colorAttr,
        sizeAttr:sizeAttr,
        sizeChart:SAMPLE.sizeChart,
        priceDecimals:decimals,
        isCap:false
      };
    },
    loadProduct: function(){
      var self=this;
      var id=this.getProductIdFromUrl();
      if(!id){
        var saved=this.getSavedProductContext();
        if(saved && saved.id) id=String(saved.id);
      }
      if(!id) return Promise.resolve(null);
      return fetch(API+"/products/"+encodeURIComponent(id), { credentials:"same-origin" })
        .then(function(r){
          if(!r.ok) throw new Error("Product request failed: "+r.status);
          return r.json();
        })
        .then(function(data){
          return self.loadVariations(data).then(function(variationDetails){
            return self.mapProduct(data, variationDetails);
          });
        });
    },
    normalizeOption: function(value){
      return String(value||"").toLowerCase().replace(/\s+/g,"-");
    },
    variationMatches: function(variation, colorName, sizeLabel){
      var attrs=variation && variation.attributes;
      if(!Array.isArray(attrs) || !attrs.length) return !colorName && !sizeLabel;
      var okColor=!colorName, okSize=!sizeLabel;
      function selfMatch(actual, expected){
        actual=String(actual||"").toLowerCase().trim();
        expected=String(expected||"").toLowerCase().trim();
        if(!actual || !expected) return false;
        if(actual===expected) return true;
        if(VibeDesigner.API.normalizeOption(actual)===VibeDesigner.API.normalizeOption(expected)) return true;
        if(actual.indexOf(expected)>-1 || expected.indexOf(actual)>-1) return true;
        return slugify(actual)===slugify(expected);
      }
      attrs.forEach(function(a){
        var name=String(a.name||a.taxonomy||a.attribute||"").toLowerCase();
        var val=String(a.value!=null?a.value:(a.option||"")).trim();
        if((/colou?r|pa_colou?r|attribute_pa_colou?r/.test(name) || name==="color") && colorName){
          okColor = selfMatch(val, colorName);
        }
        if((/size|pa_size|attribute_pa_size/.test(name) || name==="size") && sizeLabel){
          okSize = selfMatch(val, sizeLabel);
        }
      });
      // If color requested but no color attribute on variation, don't fail color
      if(colorName && !attrs.some(function(a){ return /colou?r/.test(String(a.name||a.taxonomy||a.attribute||"").toLowerCase()); })){
        okColor=true;
      }
      if(sizeLabel && !attrs.some(function(a){ return /size/.test(String(a.name||a.taxonomy||a.attribute||"").toLowerCase()); })){
        okSize=true;
      }
      return okColor && okSize;
    },
    isVariationInStock: function(v){
      if(!v) return false;
      if(v.is_in_stock===true) return true;
      if(v.is_in_stock===false) return false;
      if(v.stock_status==="outofstock") return false;
      if(v.stock_status==="instock" || v.stock_status==="onbackorder") return true;
      // Store API often omits flags when available — treat as in stock
      return true;
    },
    isCapProduct: function(product){
      var bits=[];
      if(product){
        bits.push(product.name, product.slug, product.material);
        (product.categories||[]).forEach(function(c){ bits.push(c && (c.name||""), c && (c.slug||"")); });
        (product.tags||[]).forEach(function(t){ bits.push(t && (t.name||""), t && (t.slug||"")); });
      }
      var text=bits.join(" ").toLowerCase();
      return /\b(cap|caps|hat|hats|baseball\s*cap|snapback|trucker)\b/.test(text);
    },
    getAvailablePositions: function(product){
      if(VibeDesigner.API.isCapProduct(product)){
        return PRINT_POSITIONS.filter(function(p){ return p.id==="full_front"; });
      }
      return PRINT_POSITIONS.slice();
    },
    findMatchingVariationDetail: function(product, color, size){
      var list=product && (product.variationDetails||product.variations)||[];
      if(!list.length) return null;
      var colorName=color && (color.raw||color.name);
      var sizeLabel=size && (size.raw||size.label);
      // Prefer exact color+size, then color-only, then size-only
      var i, v;
      for(i=0;i<list.length;i++){
        if(VibeDesigner.API.variationMatches(list[i], colorName, sizeLabel)) return list[i];
      }
      if(colorName){
        for(i=0;i<list.length;i++){
          if(VibeDesigner.API.variationMatches(list[i], colorName, null)) return list[i];
        }
      }
      return null;
    },
    getPreviewImage: function(product, preview, color, size){
      var images=product && product.images ? product.images : { front:"", back:"" };
      var src=preview==="back" ? (images.back||images.front) : (images.front||images.back);
      var variation=VibeDesigner.API.findMatchingVariationDetail(product, color, size);
      if(variation && Array.isArray(variation.images) && variation.images.length){
        var vimg=variation.images[0] && (variation.images[0].src||variation.images[0].thumbnail);
        if(vimg) src=vimg;
      }
      // Also try gallery images by color name match in filename/alt
      if(color && Array.isArray(product.gallery) && product.gallery.length){
        var cname=String(color.name||color.raw||"").toLowerCase();
        var hit=product.gallery.find(function(url){ return cname && String(url).toLowerCase().indexOf(slugify(cname))>-1; });
        if(hit && !variation) src=hit;
      }
      return src||"";
    },
    syncSelectedVariation: function(store){
      var product=store.product, color=store.getColor(), size=store.getSize();
      var variation=VibeDesigner.API.findMatchingVariationDetail(product, color, size);
      store.selectedVariationId=variation && variation.id ? variation.id : null;
      if(variation && variation.prices){
        var decimals=Number.isFinite(Number(product.priceDecimals))?Number(product.priceDecimals):2;
        var amount=Number.parseInt(variation.prices.price||variation.prices.regular_price||"0",10);
        if(Number.isFinite(amount)) product.basePrice=amount/Math.pow(10,decimals);
      }
    },
    findVariationId: function(product, colorName, sizeLabel){
      var match=VibeDesigner.API.findMatchingVariationDetail(product, { name:colorName, raw:colorName }, { label:sizeLabel, raw:sizeLabel });
      return match && match.id ? match.id : null;
    },
    buildVariation: function(product, color, size){
      var variation=[];
      if(product.colorAttr && color){
        variation.push({ attribute: product.colorAttr.name||"Color", value: color.raw||color.name });
      }
      if(product.sizeAttr && size){
        variation.push({ attribute: product.sizeAttr.name||"Size", value: size.raw||size.label });
      }
      return variation;
    }
  };

  /* ---------- Canvas ---------- */
  VibeDesigner.Canvas = {
    drag: null,
    zoneDrag: null,
    currentZoneKey: "front",
    getActiveLayers: function(){
      var store=VibeDesigner.Store, pos=store.getPosition();
      var dual=getDualSides(store.printPositionId);
      var preview=store.previewSide || (pos.side || "front");
      return store.layers.filter(function(layer){
        if(!layer.visible) return false;
        if(dual){
          var activeSide=dual.find(function(s){ return s.preview===preview; }) || dual[0];
          return layer.positionId===activeSide.id;
        }
        return layer.positionId===store.printPositionId || layer.positionId===pos.zone;
      });
    },
    setSelectedLayer: function(id){
      VibeDesigner.Store.selectedLayerId=id;
      var zone=document.getElementById("vdZone");
      if(!zone) return;
      zone.querySelectorAll("[data-layer]").forEach(function(el){
        el.classList.toggle("is-selected", el.getAttribute("data-layer")===id);
      });
    },
    moveLayerDom: function(id, x, y){
      var zone=document.getElementById("vdZone");
      if(!zone) return;
      var el=zone.querySelector('[data-layer="'+id+'"]');
      if(el){ el.style.left=x+"%"; el.style.top=y+"%"; }
      var tools=zone.querySelector("[data-layer-tools]");
      if(tools){ tools.style.left=x+"%"; tools.style.top=y+"%"; }
    },
    render: function(){
      var store=VibeDesigner.Store, color=store.getColor(), pos=store.getPosition();
      var dual=getDualSides(store.printPositionId);
      var preview=store.previewSide || (pos.side || "front");
      if(!dual) preview = pos.side || "front";
      store.previewSide = preview;
      var stage=document.getElementById("vdStage");
      var img=document.getElementById("vdStageImg");
      var colorLayer=document.getElementById("vdStageColor");
      var zone=document.getElementById("vdZone");
      var previewSrc=VibeDesigner.API.getPreviewImage(store.product, preview, color, store.getSize());
      var variation=VibeDesigner.API.findMatchingVariationDetail(store.product, color, store.getSize());
      var hasVariationImage=!!(variation && Array.isArray(variation.images) && variation.images.length && (variation.images[0].src||variation.images[0].thumbnail));
      var whiteProduct=isWhiteColor(color);

      // Stage backdrop: black only for white products, white for every other color
      stage.classList.toggle("is-white-product", whiteProduct);
      stage.style.background=whiteProduct?"#111827":"#ffffff";

      img.src=previewSrc;
      img.alt=store.product.name+" "+preview;
      img.style.visibility=previewSrc?"visible":"hidden";

      // Dye the product (not the stage): color layer under image + multiply blend
      // Skip dye when variation already has a real colored photo
      if(colorLayer){
        if(hasVariationImage){
          colorLayer.style.background="transparent";
          img.classList.add("is-photo");
        } else {
          colorLayer.style.background=(color && color.hex) ? color.hex : "#ffffff";
          img.classList.remove("is-photo");
        }
      }
      var zoneName = pos.zone;
      if(dual){
        var sideMeta = dual.find(function(s){ return s.preview === preview; }) || (preview==="back" ? dual[1] : dual[0]);
        zoneName = sideMeta.zone;
      }
      VibeDesigner.Canvas.currentZoneKey = zoneName;
      var layout=getZoneLayout(store, zoneName);
      zone.className="vd-zone is-"+zoneName+" is-custom";
      zone.style.left=layout.left+"%";
      zone.style.top=layout.top+"%";
      zone.style.width=layout.width+"%";
      zone.style.height=layout.height+"%";
      zone.style.right="auto";

      var layers=store.layers.filter(function(layer){
        if(!layer.visible) return false;
        if(dual){
          var activeSide = dual.find(function(s){ return s.preview === preview; }) || dual[0];
          return layer.positionId === activeSide.id;
        }
        return layer.positionId===store.printPositionId || layer.positionId===pos.zone;
      });

      zone.innerHTML=layers.map(function(layer){
        var isSel=store.selectedLayerId===layer.id;
        var rot=(layer.type==="text"&&layer.text?layer.text.rotation:layer.rotation)||0;
        var op=(layer.type==="text"&&layer.text?layer.text.opacity:layer.opacity);
        var baseStyle="left:"+layer.x+"%;top:"+layer.y+"%;transform:translate(-50%,-50%) rotate("+rot+"deg) scale("+layer.scale+");opacity:"+op+";";
        var cls="vd-layer"+(layer.type==="text"?" vd-layer-text": layer.type==="clipart"?" vd-layer-clipart":" vd-layer-image")+(isSel?" is-selected":"");
        var resize=isSel?'<span class="vd-layer-resize" data-layer-resize="'+layer.id+'" aria-hidden="true"></span>':"";
        if(layer.type==="text"&&layer.text){
          var font=FONTS.find(function(f){return f.id===layer.text.fontId;})||FONTS[0];
          var content=layer.text.content||"Enter your text here...";
          if(layer.text.textCase==="uppercase") content=content.toUpperCase();
          if(layer.text.textCase==="lowercase") content=content.toLowerCase();
          var textStyle=[
            baseStyle,
            "font-family:'"+font.family+"',sans-serif",
            "font-size:"+(layer.text.fontSize*0.34)+"px",
            "font-weight:"+(layer.text.bold?800:layer.text.fontWeight),
            "font-style:"+(layer.text.italic?"italic":"normal"),
            "text-decoration:"+(layer.text.underline?"underline":"none"),
            "letter-spacing:"+layer.text.letterSpacing+"px",
            "line-height:"+layer.text.lineHeight,
            "text-align:"+layer.text.align,
            layer.text.effect==="vertical"?"writing-mode:vertical-rl":"",
            layer.text.effect==="shadow"?"text-shadow:0 2px "+layer.text.shadowBlur+"px rgba(0,0,0,.35)":"",
            layer.text.effect==="outline"&&layer.text.strokeWidth?"-webkit-text-stroke:"+(layer.text.strokeWidth*0.35)+"px "+layer.text.strokeColor:"",
            (layer.text.effect==="curved"||layer.text.effect==="arc")?"transform:translate(-50%,-50%) rotate("+layer.text.rotation+"deg) scale("+layer.scale+") skewX("+Math.max(-18,Math.min(18,layer.text.curveAmount/10))+"deg)":"",
            layer.text.gradientEnabled?"background-image:linear-gradient(90deg,"+layer.text.gradientFrom+","+layer.text.gradientTo+");-webkit-background-clip:text;-webkit-text-fill-color:transparent;color:transparent":"color:"+layer.text.color,
            layer.text.patternFill?"background-image:repeating-linear-gradient(45deg,"+layer.text.color+" 0 2px,transparent 2px 6px);-webkit-background-clip:text;-webkit-text-fill-color:transparent":""
          ].filter(Boolean).join(";");
          return '<button type="button" class="'+cls+'" data-layer="'+layer.id+'" style="'+textStyle+'">'+esc(content)+resize+'</button>';
        }
        if(layer.type==="clipart"&&layer.clipart){
          return '<button type="button" class="'+cls+'" data-layer="'+layer.id+'" style="'+baseStyle+'">'+layer.clipart.svg+resize+'</button>';
        }
        if(layer.image){
          return '<button type="button" class="'+cls+'" data-layer="'+layer.id+'" style="'+baseStyle+'"><img src="'+layer.image.src+'" alt="'+esc(layer.image.fileName)+'">'+resize+'</button>';
        }
        return "";
      }).join("");

      var selected=store.getSelectedLayer();
      var tools="";
      // Canvas delete control removed — delete from Layers panel
      zone.innerHTML=zone.innerHTML+tools+
        '<button type="button" class="vd-zone-grip vd-zone-grip--n" data-zone-resize="n" aria-label="Resize top"></button>'+
        '<button type="button" class="vd-zone-grip vd-zone-grip--s" data-zone-resize="s" aria-label="Resize bottom"></button>'+
        '<button type="button" class="vd-zone-grip vd-zone-grip--e" data-zone-resize="e" aria-label="Resize right"></button>'+
        '<button type="button" class="vd-zone-grip vd-zone-grip--w" data-zone-resize="w" aria-label="Resize left"></button>'+
        '<button type="button" class="vd-zone-grip vd-zone-grip--nw" data-zone-resize="nw" aria-label="Resize top-left"></button>'+
        '<button type="button" class="vd-zone-grip vd-zone-grip--ne" data-zone-resize="ne" aria-label="Resize top-right"></button>'+
        '<button type="button" class="vd-zone-grip vd-zone-grip--sw" data-zone-resize="sw" aria-label="Resize bottom-left"></button>'+
        '<button type="button" class="vd-zone-grip vd-zone-grip--se" data-zone-resize="se" aria-label="Resize bottom-right"></button>';

      var dualLabel = dual ? (preview==="back" ? "Back" : dual[0].label) : pos.label;
      document.getElementById("vdPreviewHint").innerHTML='Editing <strong>'+esc(pos.label)+'</strong> · drag box to move · <strong>corners/sides</strong> to resize · <strong>×</strong> deletes';
      document.getElementById("vdSideTabs").innerHTML=["front","back"].map(function(side){
        return '<button type="button" class="vd-side-tab'+(preview===side?" is-active":"")+'" data-side="'+side+'">'+(side==="front"?"Front":"Back")+'</button>';
      }).join("");
      document.getElementById("vdProductName").textContent=store.product.name;
      document.getElementById("vdProductMeta").textContent=store.product.material||"";
      VibeDesigner.UI.updateTotals();
    }
  };

  /* ---------- Options ---------- */
  VibeDesigner.Options = {
    render: function(){
      var store=VibeDesigner.Store;
      var positions=VibeDesigner.API.getAvailablePositions(store.product);
      if(!positions.some(function(p){ return p.id===store.printPositionId; })){
        store.printPositionId=positions[0] ? positions[0].id : "full_front";
      }
      document.getElementById("vdPositions").innerHTML=positions.map(function(pos){
        return '<button type="button" class="vd-segment__btn'+(store.printPositionId===pos.id?" is-active":"")+'" data-pos="'+pos.id+'">'+esc(pos.label)+'</button>';
      }).join("");
      var guide=document.getElementById("vdPrintGuide");
      var pos=store.getPosition();
      if(guide && pos){
        guide.hidden=false;
        document.getElementById("vdPrintGuideTitle").textContent=pos.label+" size guide";
        var priceEl=document.getElementById("vdPrintGuidePrice");
        if(priceEl){ priceEl.hidden=true; priceEl.textContent=""; }
        document.getElementById("vdPrintGuideText").textContent=pos.sizeGuide||"";
      }
      var colorsEl=document.getElementById("vdColors");
      if(!store.product.colors || !store.product.colors.length){
        colorsEl.innerHTML='<p class="vd-empty">No product colors found for this item.</p>';
      } else {
        colorsEl.innerHTML=store.product.colors.map(function(c){
          var tip=c.inStock?c.name:c.name+" · Out of stock";
          return '<span class="vd-tip" data-tip="'+esc(tip)+'"><button type="button" class="vd-swatch'+(store.colorId===c.id?" is-active":"")+(!c.inStock?" is-disabled":"")+'" style="background:'+c.hex+'" data-color="'+c.id+'" '+(c.inStock?"":"disabled")+' aria-label="'+esc(c.name)+'"></button></span>';
        }).join("");
      }

      var sizesEl=document.getElementById("vdSizes");
      if(store.sizeMode==="single"){
        var qty=store.sizeQuantities[store.selectedSizeId]||1;
        sizesEl.innerHTML='<div class="vd-chips">'+store.product.sizes.map(function(s){
          return '<button type="button" class="vd-chip'+(store.selectedSizeId===s.id?" is-active":"")+(!s.inStock?" is-disabled":"")+'" data-size="'+s.id+'" '+(s.inStock?"":"disabled")+'>'+s.label+"</button>";
        }).join("")+'</div><div class="vd-single-qty"><span>Quantity</span><div class="vd-stepper"><button type="button" data-single-qty="-1">-</button><input type="number" min="1" max="99" value="'+qty+'" id="vdSingleQty"><button type="button" data-single-qty="1">+</button></div></div>';
      } else {
        sizesEl.innerHTML='<div class="vd-qty-grid">'+store.product.sizes.map(function(s){
          var q=store.sizeQuantities[s.id]||0;
          return '<div class="vd-qty-row'+(!s.inStock?" is-disabled":"")+'"><span>'+s.label+'</span><div class="vd-stepper"><button type="button" data-qty-size="'+s.id+'" data-delta="-1" '+(s.inStock?"":"disabled")+'>-</button><input type="number" min="0" max="99" value="'+q+'" data-qty-input="'+s.id+'" '+(s.inStock?"":"disabled")+'><button type="button" data-qty-size="'+s.id+'" data-delta="1" '+(s.inStock?"":"disabled")+'>+</button></div></div>';
        }).join("")+"</div>";
      }
      Array.prototype.forEach.call(document.querySelectorAll("#vdSizeMode button"), function(btn){
        btn.classList.toggle("is-active", btn.getAttribute("data-mode")===store.sizeMode);
      });
      var chart=store.product.sizeChart;
      document.getElementById("vdChartTitle").textContent=chart.title;
      document.getElementById("vdChartBody").innerHTML='<table class="vd-table"><thead><tr><th>Measure</th>'+chart.columns.map(function(c){return "<th>"+c+"</th>";}).join("")+'</tr></thead><tbody>'+chart.rows.map(function(row){
        return "<tr><td>"+row.label+"</td>"+chart.columns.map(function(c){return "<td>"+row.values[c]+"</td>";}).join("")+"</tr>";
      }).join("")+"</tbody></table>";
      VibeDesigner.UI.updateTotals();
    }
  };

  /* ---------- Personalization ---------- */
  VibeDesigner.Personalize = {
    render: function(){
      var actions=[
        { id:"text", title:"Add Text", desc:"Type, drag & resize on preview", icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7V5h16v2"/><path d="M12 5v14"/><path d="M8 19h8"/></svg>' },
        { id:"image", title:"Upload Image", desc:"Computer, mobile, or camera", icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 15l-5-5-8 8"/></svg>' },
        { id:"clipart", title:"Add Clipart", desc:"Icons & shapes library", icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 10h.01M15 10h.01"/></svg>' },
        { id:"logo", title:"Add Logo", desc:"Upload brand mark / logo file", icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg>' }
      ];
      document.getElementById("vdActions").innerHTML=actions.map(function(a){
        return '<button type="button" class="vd-action" data-action="'+a.id+'"><span class="vd-action__icon">'+a.icon+'</span><span><strong>'+a.title+'</strong><small>'+a.desc+'</small></span></button>';
      }).join("");
    }
  };

  /* ---------- Clipart ---------- */
  VibeDesigner.Clipart = {
    render: function(){
      var q=(VibeDesigner.Store.clipQuery||"").toLowerCase();
      var list=CLIPART.filter(function(c){ return !q || c.name.toLowerCase().indexOf(q)>-1 || c.tags.indexOf(q)>-1; });
      document.getElementById("vdClipGrid").innerHTML=list.map(function(c){
        return '<button type="button" class="vd-clip-item" data-clip="'+c.id+'" title="'+esc(c.name)+'">'+c.svg+"</button>";
      }).join("") || '<p class="vd-empty">No clipart matches your search.</p>';
    },
    add: function(id){
      var item=CLIPART.find(function(c){return c.id===id;});
      if(!item) return;
      var store=VibeDesigner.Store;
      var dual=getDualSides(store.printPositionId);
      var target=store.printPositionId;
      var label=store.getPosition().label;
      if(dual){
        var active=dual.find(function(s){return s.preview===(store.previewSide||"front");}) || dual[0];
        target=active.id;
        label=active.label;
      }
      var layer={ id:uid("clip"), type:"clipart", name:item.name+" · "+label, positionId:target, visible:true, locked:false, x:50, y:45, scale:1, rotation:0, opacity:1, clipart:{ id:item.id, svg:item.svg } };
      store.layers=store.layers.concat([layer]);
      store.selectedLayerId=layer.id;
      store.emit();
      VibeDesigner.UI.toast(item.name+" added for "+label);
    }
  };

  /* ---------- Text ---------- */
  VibeDesigner.Text = {
    getPairLayers: function(){
      var store=VibeDesigner.Store;
      if(!store.textPairId) return [];
      return store.layers.filter(function(l){ return l.type==="text" && l.pairId===store.textPairId; });
    },
    render: function(){
      var store=VibeDesigner.Store, root=document.getElementById("vdTextEditor");
      var textCard=document.getElementById("vdTextCard");
      var dual=getDualSides(store.printPositionId);
      var pair=this.getPairLayers();
      var layer=store.getSelectedLayer();
      var hasText = dual ? pair.length>0 : (layer&&layer.type==="text"&&layer.text);
      if(textCard) textCard.hidden=!(store.textEditorOpen && hasText);
      if(!hasText){
        root.innerHTML='<p class="vd-empty">No text layer selected. Use <strong>Add Text</strong> to create one.</p>';
        return;
      }
      if(!store.textEditorOpen) return;

      // Active style source: selected text layer or first of pair
      if(dual){
        if(!layer || layer.type!=="text" || layer.pairId!==store.textPairId){
          layer = pair[0];
          store.selectedLayerId = layer.id;
        }
      }
      var t=layer.text;
      var currentFont=FONTS.find(function(f){return f.id===t.fontId;})||FONTS[0];

      var contentHtml = "";
      var contentLen = 0;
      if(dual){
        contentHtml = '<div class="vd-field"><span class="vd-label">Text by side</span>' + dual.map(function(side){
          var sideLayer = pair.find(function(l){ return l.positionId===side.id; });
          var val = clampText(sideLayer && sideLayer.text ? sideLayer.text.content : "");
          var lid = sideLayer ? sideLayer.id : "";
          return '<div class="vd-dual-box"><div class="vd-dual-head"><span>'+esc(side.heading)+' <em class="vd-dual-badge">'+esc(side.label)+'</em></span></div>'+
            '<textarea class="vd-textarea" rows="1" maxlength="200" data-side-text="'+side.id+'" data-layer-id="'+lid+'" placeholder="Enter text for '+esc(side.label)+'...">'+esc(val)+'</textarea>'+
            '<p class="vd-char-count" data-char-count>'+val.length+'/200</p></div>';
        }).join("") + '</div>';
      } else {
        var textVal=clampText(t.content||"");
        contentLen=textVal.length;
        contentHtml = '<label class="vd-field"><span class="vd-label">Your text</span><textarea class="vd-textarea" id="vdTextContent" maxlength="200" rows="1" placeholder="Enter your text here...">'+esc(textVal)+'</textarea><p class="vd-char-count" data-char-count id="vdTextCount">'+contentLen+'/200</p></label>';
      }

      root.innerHTML=
        contentHtml+
        '<div class="vd-field"><span class="vd-label">Font</span>'+
        '<select class="vd-select" id="vdFontSelect" aria-label="Font" style="font-family:'+currentFont.family+'">'+
        FONTS.map(function(f){
          return '<option value="'+f.id+'"'+(t.fontId===f.id?" selected":"")+' style="font-family:'+f.family+'">'+esc(f.label)+'</option>';
        }).join("")+
        '</select></div>'+
        '<div class="vd-field"><span class="vd-label">Text Color</span><div class="vd-swatches">'+PRESET_COLORS.map(function(hex){return '<button type="button" class="vd-swatch'+(t.color.toLowerCase()===hex.toLowerCase()?" is-active":"")+'" style="background:'+hex+'" data-text-color="'+hex+'" aria-label="'+hex+'"></button>';}).join("")+'</div>'+
        '<div class="vd-color-inputs" style="margin-top:10px"><label>Pick color<input type="color" id="vdColorPicker" value="'+(normalizeHex(t.color)||"#111827")+'" style="width:100%;height:42px;padding:4px;border:1px solid var(--line);border-radius:11px;background:#fff;cursor:pointer"></label><label>HEX<input class="vd-input" id="vdHex" value="'+(normalizeHex(t.color)||t.color)+'" placeholder="#111827"></label></div></div>';
      bindTextInputs(root);
    },
    update: function(patch, opts){
      opts = opts || {};
      var store=VibeDesigner.Store;
      if(patch && Object.prototype.hasOwnProperty.call(patch,"content")){
        patch=Object.assign({}, patch, { content: clampText(patch.content) });
      }
      var dual=getDualSides(store.printPositionId);
      var applyAll = !!opts.applyAllStyles && dual && store.textPairId;
      store.layers=store.layers.map(function(layer){
        if(!layer.text) return layer;
        if(applyAll){
          if(layer.pairId!==store.textPairId) return layer;
          var stylePatch = Object.assign({}, patch);
          delete stylePatch.content;
          return Object.assign({}, layer, { text: Object.assign({}, layer.text, stylePatch) });
        }
        if(layer.id!==store.selectedLayerId) return layer;
        return Object.assign({}, layer, { text: Object.assign({}, layer.text, patch) });
      });
      VibeDesigner.Canvas.render();
      VibeDesigner.Layers.render();
      if(opts.live) return;
      if(store.textEditorOpen) VibeDesigner.Text.render();
      VibeDesigner.Options.render();
    },
    updateSideContent: function(layerId, content){
      var store=VibeDesigner.Store;
      content=clampText(content);
      store.layers=store.layers.map(function(layer){
        if(layer.id!==layerId || !layer.text) return layer;
        return Object.assign({}, layer, { text: Object.assign({}, layer.text, { content: content }) });
      });
      store.selectedLayerId = layerId;
      VibeDesigner.Canvas.render();
      VibeDesigner.Layers.render();
    }
  };

  /* ---------- Layers ---------- */
  VibeDesigner.Layers = {
    render: function(){
      var store=VibeDesigner.Store, root=document.getElementById("vdLayers");
      if(!store.layers.length){ root.innerHTML='<p class="vd-empty">No layers yet. Add text, image, logo, or clipart.</p>'; return; }
      root.innerHTML='<ul class="vd-layers">'+store.layers.slice().reverse().map(function(layer){
        var type=layer.type==="text"?"T":layer.type==="clipart"?"CLIP":layer.type==="logo"?"LOGO":"IMG";
        var delLabel=layer.type==="text"?"Delete text":(layer.type==="image"||layer.type==="logo"?"Delete image":"Delete");
        return '<li class="'+(store.selectedLayerId===layer.id?"is-active":"")+'"><button type="button" class="vd-layers__main" data-select-layer="'+layer.id+'"><span class="vd-layers__type">'+type+'</span><span><strong>'+esc(layer.name)+'</strong><small>'+layer.positionId.replace(/_/g," ")+'</small></span></button><button type="button" class="vd-layers__del" data-del="'+layer.id+'">'+delLabel+'</button></li>';
      }).join("")+"</ul>";
    }
  };

  /* ---------- Upload ---------- */
  VibeDesigner.Upload = {
    lastFile:null,
    renderSidePicker:function(){
      var store=VibeDesigner.Store;
      var dual=getDualSides(store.printPositionId);
      var picker=document.getElementById("vdUploadSidePicker");
      var sidesEl=document.getElementById("vdUploadSides");
      var hint=document.getElementById("vdUploadSideHint");
      if(!dual){
        picker.hidden=true;
        picker.classList.add("is-disabled");
        store.uploadTargetSide=store.printPositionId;
        return;
      }
      picker.hidden=false;
      picker.classList.remove("is-disabled");
      if(!store.uploadTargetSide || !dual.some(function(s){return s.id===store.uploadTargetSide;})){
        store.uploadTargetSide = dual[0].id;
      }
      sidesEl.innerHTML = dual.map(function(s){
        return '<button type="button" class="vd-chip'+(store.uploadTargetSide===s.id?" is-active":"")+'" data-upload-side="'+s.id+'">'+esc(s.label)+"</button>";
      }).join("");
      var current = dual.find(function(s){return s.id===store.uploadTargetSide;}) || dual[0];
      var other = dual.find(function(s){return s.id!==store.uploadTargetSide;});
      hint.textContent = "This artwork will be placed on the "+current.label+"." + (other ? " After upload you can add one for "+other.label+" too." : "");
    },
    renderTabs:function(){
      var store=VibeDesigner.Store;
      var tabs=[["computer","My Computer",true],["mobile","Mobile Device",true],["camera","Camera",true],["drive","Google Drive",false],["dropbox","Dropbox",false],["onedrive","OneDrive",false]];
      document.getElementById("vdUploadTabs").innerHTML=tabs.map(function(t){
        return '<button type="button" class="vd-upload-tab'+(store.uploadTab===t[0]?" is-active":"")+(!t[2]?" is-soon":"")+'" data-upload-tab="'+t[0]+'" '+(t[2]?"":"disabled")+'>'+t[1]+(!t[2]?"<span>Soon</span>":"")+"</button>";
      }).join("");
      document.getElementById("vdMaxMb").textContent=String(store.product.maxUploadMb||15);
      var dual=getDualSides(store.printPositionId);
      var title = store.uploadMode==="logo"?"Upload Logo":"Upload Image";
      if(dual && store.uploadTargetSide){
        var side = dual.find(function(s){return s.id===store.uploadTargetSide;});
        if(side) title += " · "+side.label;
      }
      document.getElementById("vdUploadTitle").textContent=title;
      this.renderSidePicker();
    },
    open:function(mode, forceSide){
      var store=VibeDesigner.Store;
      store.uploadMode=mode||"image";
      store.pendingSecondUpload=null;
      var dual=getDualSides(store.printPositionId);
      if(dual){
        store.uploadTargetSide = forceSide || dual[0].id;
      } else {
        store.uploadTargetSide = store.printPositionId;
      }
      document.getElementById("vdUploadModal").classList.add("is-open");
      document.getElementById("vdUploadStatus").innerHTML="";
      this.renderTabs();
    },
    close:function(){
      document.getElementById("vdUploadModal").classList.remove("is-open");
      if(VibeDesigner.Store.uploadAbort) VibeDesigner.Store.uploadAbort.abort();
      VibeDesigner.Store.pendingSecondUpload=null;
    },
    validate:function(file){
      return new Promise(function(resolve){
        var maxMb=VibeDesigner.Store.product.maxUploadMb||15, errors=[], warnings=[];
        var mime=file.type||""; var ext=(file.name.split(".").pop()||"").toLowerCase();
        var map={png:"image/png",jpg:"image/jpeg",jpeg:"image/jpeg",svg:"image/svg+xml",pdf:"application/pdf"};
        if(!mime) mime=map[ext]||"";
        var ok={"image/png":1,"image/jpeg":1,"image/jpg":1,"image/svg+xml":1,"application/pdf":1};
        if(!ok[mime]) errors.push("Unsupported format. Use PNG, JPG, JPEG, SVG, or PDF.");
        if(file.size>maxMb*1024*1024) errors.push("File exceeds "+maxMb+" MB maximum.");
        if(errors.length||mime==="application/pdf"||mime==="image/svg+xml"){
          resolve({ok:!errors.length,errors:errors,warnings:warnings,meta:{width:0,height:0,hasTransparency:mime==="image/png",mime:mime}});
          return;
        }
        var url=URL.createObjectURL(file), img=new Image();
        img.onload=function(){
          if(img.naturalWidth<300||img.naturalHeight<300) warnings.push("Resolution is below 300×300 — print quality may look soft.");
          var ratio=img.naturalWidth/Math.max(1,img.naturalHeight);
          if(ratio<.4||ratio>2.5) warnings.push("Unusual aspect ratio — check how it sits in the print zone.");
          if(img.naturalWidth*img.naturalHeight<400000) warnings.push("Image quality may be low for large print areas.");
          var hasTransparency=mime==="image/png";
          try{
            if(mime==="image/png"){
              var canvas=document.createElement("canvas"); canvas.width=64; canvas.height=64;
              var ctx=canvas.getContext("2d"); ctx.drawImage(img,0,0,64,64);
              var data=ctx.getImageData(0,0,64,64).data; hasTransparency=false;
              for(var i=3;i<data.length;i+=4){ if(data[i]<250){ hasTransparency=true; break; } }
            }
          }catch(e){ hasTransparency=true; }
          URL.revokeObjectURL(url);
          resolve({ok:true,errors:errors,warnings:warnings,meta:{width:img.naturalWidth,height:img.naturalHeight,hasTransparency:hasTransparency,mime:mime}});
        };
        img.onerror=function(){ URL.revokeObjectURL(url); errors.push("Could not read image file."); resolve({ok:false,errors:errors,warnings:warnings,meta:null}); };
        img.src=url;
      });
    },
    process:function(file){
      var self=this; this.lastFile=file;
      var store=VibeDesigner.Store;
      var dual=getDualSides(store.printPositionId);
      if(dual && !store.uploadTargetSide){
        document.getElementById("vdUploadStatus").innerHTML='<div class="vd-upload-msgs"><p class="is-error">Choose whether this upload is for '+dual[0].label+' or '+dual[1].label+'.</p></div>';
        return;
      }
      var status=document.getElementById("vdUploadStatus"); status.innerHTML="";
      this.validate(file).then(function(result){
        var html="";
        if(result.errors.length) html+=result.errors.map(function(m){return '<p class="is-error">'+esc(m)+"</p>";}).join("");
        if(result.warnings.length) html+=result.warnings.map(function(m){return '<p class="is-warn">'+esc(m)+"</p>";}).join("");
        if(!result.ok){ status.innerHTML='<div class="vd-upload-msgs">'+html+'<button type="button" class="vd-btn vd-btn--outline" id="vdRetryUpload">Retry upload</button></div>'; return; }
        var previewUrl=URL.createObjectURL(file);
        status.innerHTML='<div class="vd-upload-progress"><img class="vd-upload-thumb" src="'+previewUrl+'" alt=""><div><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700"><strong>'+esc(file.name)+'</strong><span id="vdPct">0%</span></div><div class="vd-progress-bar"><i id="vdBar"></i></div><div style="margin-top:8px"><button type="button" class="vd-link" id="vdCancelUpload">Cancel</button></div></div></div>'+(html?'<div class="vd-upload-msgs">'+html+"</div>":"");
        var controller=new AbortController(); store.uploadAbort=controller; var pct=0;
        function tick(){
          if(controller.signal.aborted){ status.innerHTML='<div class="vd-upload-msgs"><p class="is-error">Upload cancelled.</p><button type="button" class="vd-btn vd-btn--outline" id="vdRetryUpload">Retry upload</button></div>'; return; }
          pct=Math.min(100,pct+Math.max(5,16-Math.round(file.size/(1024*1024))));
          document.getElementById("vdPct").textContent=pct+"%"; document.getElementById("vdBar").style.width=pct+"%";
          if(pct>=100){
            var isLogo=store.uploadMode==="logo";
            var targetSide = store.uploadTargetSide || store.printPositionId;
            var sideLabel = targetSide.replace(/_/g," ");
            if(dual){
              var sm = dual.find(function(s){return s.id===targetSide;});
              if(sm) sideLabel = sm.label;
            }
            store.layers=store.layers.concat([{
              id:uid(isLogo?"logo":"img"), type:isLogo?"logo":"image",
              name:(isLogo?"Logo":"Image")+" · "+sideLabel,
              positionId:targetSide, visible:true, locked:false, x:50, y:45, scale:1, rotation:0, opacity:1,
              image:{ src:previewUrl, fileName:file.name, width:result.meta.width||800, height:result.meta.height||800, hasTransparency:!!result.meta.hasTransparency }
            }]);
            store.selectedLayerId=store.layers[store.layers.length-1].id;
            // Switch preview to the side that was uploaded
            if(dual){
              var uploaded = dual.find(function(s){return s.id===targetSide;});
              if(uploaded) store.previewSide = uploaded.preview;
            }
            store.emit();
            VibeDesigner.UI.toast((isLogo?"Logo":"Image")+" added for "+sideLabel+".");

            if(dual){
              var other = dual.find(function(s){return s.id!==targetSide;});
              var alreadyHasOther = other && store.layers.some(function(l){
                return (l.type==="image"||l.type==="logo") && l.positionId===other.id;
              });
              if(other && !alreadyHasOther){
                store.pendingSecondUpload = { mode: store.uploadMode, side: other.id, label: other.label };
                status.innerHTML =
                  '<div class="vd-upload-msgs"><p class="is-warn">Added for <strong>'+esc(sideLabel)+'</strong>.</p></div>'+
                  '<div class="vd-upload-next">'+
                  '<button type="button" class="vd-btn vd-btn--primary vd-btn--block" id="vdUploadOtherSide">Upload for '+esc(other.label)+'</button>'+
                  '<button type="button" class="vd-btn vd-btn--outline vd-btn--block" id="vdUploadDoneSides">Done</button>'+
                  '</div>';
                return;
              }
            }
            status.innerHTML=
              '<div class="vd-upload-msgs"><p style="color:var(--ok);font-weight:700;margin:0 0 10px">Added for <strong>'+esc(sideLabel)+'</strong>.</p></div>'+
              '<button type="button" class="vd-btn vd-btn--primary vd-btn--block" id="vdUploadDoneSides">Done</button>';
            return;
          }
          setTimeout(tick,90);
        }
        tick();
      });
    }
  };

  /* ---------- Cart ---------- */
  VibeDesigner.Cart = {
    designPayload: function(){
      var store=VibeDesigner.Store, color=store.getColor(), size=store.getSize();
      return {
        product_id: store.product.id,
        name: store.product.name,
        color: color&&color.name,
        size: size&&size.label,
        sizeMode: store.sizeMode,
        sizeQuantities: store.sizeQuantities,
        printPosition: store.printPositionId,
        printLabel: store.getPosition().label,
        printSizeGuide: store.getPosition().sizeGuide,
        printFee: store.printFee(),
        quantity: store.qty(),
        productPrice: store.product.basePrice,
        unitPrice: store.unitPrice(),
        total: store.total(),
        layers: store.layers.map(function(l){
          return {
            id:l.id, type:l.type, name:l.name, positionId:l.positionId, x:l.x, y:l.y, scale:l.scale, rotation:l.rotation,
            text:l.text?{ content:l.text.content, fontId:l.text.fontId, fontSize:l.text.fontSize, color:l.text.color, effect:l.text.effect }:null,
            image:l.image?{ fileName:l.image.fileName, width:l.image.width, height:l.image.height, hasTransparency:l.image.hasTransparency }:null,
            clipart:l.clipart?{ id:l.clipart.id }:null
          };
        })
      };
    },
    add: function(){
      var store=VibeDesigner.Store;
      VibeDesigner.UI.error("");
      if(!store.layers.length){ VibeDesigner.UI.error("Add text, image, logo, or clipart before adding to cart."); document.getElementById("vdPersonalizeCard").scrollIntoView({behavior:"smooth",block:"nearest"}); return; }
      if(store.sizeMode==="multi"&&store.qty()<1){ VibeDesigner.UI.error("Set quantity for at least one size."); document.getElementById("vdOptionsCard").scrollIntoView({behavior:"smooth",block:"nearest"}); return; }
      if(store.sizeMode==="single"&&!store.selectedSizeId){ VibeDesigner.UI.error("Please choose a size."); document.getElementById("vdOptionsCard").scrollIntoView({behavior:"smooth",block:"nearest"}); return; }

      var btn=document.getElementById("vdAddCart");
      var btn2=document.getElementById("vdAddCartMobile");
      var old=btn2 ? btn2.textContent : "Add to Cart";
      if(btn){ btn.disabled=true; btn.textContent="Adding…"; }
      if(btn2){ btn2.disabled=true; btn2.textContent="Adding…"; }

      var payload=this.designPayload();
      try{ sessionStorage.setItem("vcDesignerLastOrder", JSON.stringify(payload)); }catch(e){}

      var color=store.getColor(), size=store.getSize();
      var variation=VibeDesigner.API.buildVariation(store.product, color, size);
      var body={ id:Number(store.product.id), quantity:Math.max(1, store.qty()), variation:variation };

      var cartToken=VibeDesigner.API.getCartToken();
      fetch(API+"/cart", { credentials:"include", headers: cartToken?{"Cart-Token":cartToken}:{} })
        .then(function(res){
          var nonce=res.headers.get("Nonce")||res.headers.get("X-WC-Store-API-Nonce")||"";
          cartToken=VibeDesigner.API.setCartToken(res);
          return fetch(API+"/cart/add-item", {
            method:"POST", credentials:"include",
            headers:VibeDesigner.API.cartHeaders(nonce, cartToken),
            body:JSON.stringify(body)
          });
        })
        .then(function(res){
          VibeDesigner.API.setCartToken(res);
          return res.json().then(function(data){
            if(!res.ok) throw new Error((data&&data.message)||"Add to cart failed");
            return data;
          });
        })
        .then(function(){
          document.body.dispatchEvent(new CustomEvent("wc-blocks_added_to_cart"));
          VibeDesigner.UI.toast("Added to cart");
          window.location.href=VibeDesigner.API.checkoutUrl(VibeDesigner.API.getCartToken());
        })
        .catch(function(){
          // Classic fallback
          var url="/?add-to-cart="+encodeURIComponent(store.product.id)+"&quantity="+encodeURIComponent(Math.max(1,store.qty()));
          if(store.selectedVariationId) url+="&variation_id="+encodeURIComponent(store.selectedVariationId);
          if(color) url+="&attribute_pa_color="+encodeURIComponent(slugify(color.name));
          if(size) url+="&attribute_pa_size="+encodeURIComponent(slugify(size.label));
          VibeDesigner.UI.toast("Opening checkout…");
          window.location.href=url+"&redirect_to="+encodeURIComponent("/checkout/");
        })
        .finally(function(){
          if(btn){ btn.disabled=false; btn.textContent=old; }
          if(btn2){ btn2.disabled=false; btn2.textContent=old; }
        });
    }
  };

  function showTextEditor(show){
    var store=VibeDesigner.Store;
    store.textEditorOpen=!!show;
    if(show) store.clipartOpen=false;
    if(!show){
      store.selectedLayerId=null;
      store.textPairId=null;
    }
    var card=document.getElementById("vdTextCard");
    var clip=document.getElementById("vdClipartCard");
    if(clip) clip.hidden=!store.clipartOpen;
    if(card){
      card.hidden=!store.textEditorOpen;
      if(show){
        VibeDesigner.Text.render();
        card.scrollIntoView({behavior:"smooth",block:"nearest"});
      }
    }
    VibeDesigner.Canvas.render();
    VibeDesigner.Layers.render();
  }

  function showClipart(show){
    var store=VibeDesigner.Store;
    store.clipartOpen=!!show;
    if(show) store.textEditorOpen=false;
    var card=document.getElementById("vdClipartCard");
    var text=document.getElementById("vdTextCard");
    if(text) text.hidden=!store.textEditorOpen;
    if(card){
      card.hidden=!store.clipartOpen;
      if(show){
        VibeDesigner.Clipart.render();
        card.scrollIntoView({behavior:"smooth",block:"nearest"});
      }
    }
  }

  function addTextLayer(){
    var store=VibeDesigner.Store;
    var dual=getDualSides(store.printPositionId);
    store.clipartOpen=false;
    store.textEditorOpen=true;
    if(dual){
      var pairId=uid("pair");
      store.textPairId=pairId;
      var style=Object.assign(defaultText(),{content:""});
      var layers=dual.map(function(side, idx){
        return {
          id:uid("txt"), type:"text", name:"Text · "+side.label, positionId:side.id, pairId:pairId,
          visible:true, locked:false, x:50, y:42, scale:1, rotation:0, opacity:1,
          text:Object.assign({}, style, { content: "" })
        };
      });
      store.layers=store.layers.concat(layers);
      store.selectedLayerId=layers[0].id;
      store.previewSide=dual[0].preview;
      store.emit();
      showTextEditor(true);
      VibeDesigner.UI.toast("Separate text boxes ready for "+dual[0].label+" and "+dual[1].label+".");
      return;
    }
    store.textPairId=null;
    var layer={ id:uid("txt"), type:"text", name:"Text", positionId:store.printPositionId, visible:true, locked:false, x:50, y:42, scale:1, rotation:0, opacity:1, text:Object.assign(defaultText(),{content:"Enter your text here..."}) };
    store.layers=store.layers.concat([layer]); store.selectedLayerId=layer.id;
    store.emit();
    showTextEditor(true);
  }

  function bind(){
    if(bind._bound) return;
    bind._bound=true;
    var store=VibeDesigner.Store, app=document.getElementById("vdApp");

    document.getElementById("vdTextDone").addEventListener("click", function(){ showTextEditor(false); });
    document.getElementById("vdClipDone").addEventListener("click", function(){ showClipart(false); });

    app.addEventListener("click", function(e){
      var t=e.target;
      var pos=t.closest("[data-pos]"); if(pos){
        var nextPos=pos.getAttribute("data-pos");
        var prevPos=store.printPositionId;
        if(nextPos!==prevPos){
          store.layers=store.layers.map(function(l){
            if(l.positionId===prevPos) return Object.assign({}, l, { positionId: nextPos });
            return l;
          });
        }
        store.printPositionId=nextPos;
        var dualPos=getDualSides(store.printPositionId);
        var meta=PRINT_POSITIONS.find(function(p){return p.id===store.printPositionId;});
        store.previewSide = dualPos ? dualPos[0].preview : (meta && meta.side) || "front";
        store.uploadTargetSide = dualPos ? dualPos[0].id : store.printPositionId;
        store.textPairId=null;
        store.emit();
        return;
      }
      var color=t.closest("[data-color]"); if(color&&!color.disabled){ store.colorId=color.getAttribute("data-color"); store.emit(); return; }
      var size=t.closest("[data-size]"); if(size&&!size.disabled){ store.selectedSizeId=size.getAttribute("data-size"); if(!store.sizeQuantities[store.selectedSizeId]) store.sizeQuantities[store.selectedSizeId]=1; store.emit(); return; }
      var mode=t.closest("#vdSizeMode [data-mode]"); if(mode){ store.sizeMode=mode.getAttribute("data-mode"); store.emit(); return; }
      var sq=t.closest("[data-single-qty]"); if(sq){ var d=Number(sq.getAttribute("data-single-qty")); store.sizeQuantities[store.selectedSizeId]=Math.max(1,Math.min(99,(store.sizeQuantities[store.selectedSizeId]||1)+d)); store.emit(); return; }
      var deltaBtn=t.closest("[data-qty-size]"); if(deltaBtn){ var sid=deltaBtn.getAttribute("data-qty-size"); var delta=Number(deltaBtn.getAttribute("data-delta")); store.sizeQuantities=Object.assign({},store.sizeQuantities); store.sizeQuantities[sid]=Math.max(0,Math.min(99,(store.sizeQuantities[sid]||0)+delta)); store.emit(); return; }
      var side=t.closest("[data-side]"); if(side){
        store.previewSide=side.getAttribute("data-side");
        store.emit();
        return;
      }
      var action=t.closest("[data-action]"); if(action){
        var id=action.getAttribute("data-action");
        if(id==="text") addTextLayer();
        if(id==="image") VibeDesigner.Upload.open("image");
        if(id==="logo") VibeDesigner.Upload.open("logo");
        if(id==="clipart") showClipart(true);
        return;
      }
      var clip=t.closest("[data-clip]"); if(clip){ VibeDesigner.Clipart.add(clip.getAttribute("data-clip")); return; }
      var canvasDel=t.closest("[data-canvas-del]"); if(canvasDel){ deleteLayer(canvasDel.getAttribute("data-canvas-del")); return; }
      var layerBtn=t.closest("[data-layer]"); if(layerBtn){ return; }
      var selectLayer=t.closest("[data-select-layer]"); if(selectLayer){ store.selectedLayerId=selectLayer.getAttribute("data-select-layer"); var selected=store.getSelectedLayer(); store.emit(); if(selected&&selected.type==="text"){ store.textPairId=selected.pairId||null; showTextEditor(true);} else showTextEditor(false); return; }
      var del=t.closest("[data-del]"); if(del){ deleteLayer(del.getAttribute("data-del")); return; }
    });

    app.addEventListener("input", function(e){
      var input=e.target.closest("[data-qty-input]");
      if(input){ store.sizeQuantities[input.getAttribute("data-qty-input")]=Math.max(0,Math.min(99,Number(input.value)||0)); store.emit(); }
      if(e.target.id==="vdSingleQty"){ store.sizeQuantities[store.selectedSizeId]=Math.max(1,Math.min(99,Number(e.target.value)||1)); store.emit(); }
      if(e.target.id==="vdClipSearch"){ store.clipQuery=e.target.value; VibeDesigner.Clipart.render(); }
    });

    // Drag layers / resize / move dotted print zone
    var zone=document.getElementById("vdZone");
    var stageEl=document.getElementById("vdStage");
    var dragSurface=stageEl||zone;
    function layerFromPoint(clientX, clientY){
      var active=VibeDesigner.Canvas.getActiveLayers();
      for(var i=active.length-1;i>=0;i--){
        var el=zone.querySelector('[data-layer="'+active[i].id+'"]');
        if(!el) continue;
        var r=el.getBoundingClientRect();
        if(clientX>=r.left && clientX<=r.right && clientY>=r.top && clientY<=r.bottom) return active[i].id;
      }
      return null;
    }
    function applyZoneLayout(layout){
      zone.style.left=layout.left+"%";
      zone.style.top=layout.top+"%";
      zone.style.width=layout.width+"%";
      zone.style.height=layout.height+"%";
      zone.style.right="auto";
    }
    function clampZone(layout){
      var minW=8, minH=8;
      var next=Object.assign({}, layout);
      next.width=Math.max(minW, Math.min(96, next.width));
      next.height=Math.max(minH, Math.min(96, next.height));
      next.left=Math.max(1, Math.min(99-next.width, next.left));
      next.top=Math.max(1, Math.min(99-next.height, next.top));
      return next;
    }
    function startZoneDrag(e, mode){
      var stageRect=stageEl.getBoundingClientRect();
      if(!stageRect.width || !stageRect.height) return;
      var zoneKey=VibeDesigner.Canvas.currentZoneKey || "front";
      var layout=getZoneLayout(store, zoneKey);
      VibeDesigner.Canvas.zoneDrag={
        zoneKey:zoneKey,
        mode:mode||"move",
        startX:e.clientX,
        startY:e.clientY,
        stageRect:stageRect,
        orig:Object.assign({}, layout)
      };
      zone.classList.add("is-dragging");
      if(stageEl.setPointerCapture) stageEl.setPointerCapture(e.pointerId);
    }
    function onDragPointerDown(e){
      if(e.button!==undefined && e.button!==0) return;
      if(e.target.closest("[data-canvas-del]") || e.target.closest("[data-layer-tools]")) return;

      var zoneResize=e.target.closest("[data-zone-resize]");
      if(zoneResize){
        startZoneDrag(e, zoneResize.getAttribute("data-zone-resize"));
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      var resizeBtn=e.target.closest("[data-layer-resize]");
      if(resizeBtn){
        var rid=resizeBtn.getAttribute("data-layer-resize");
        var rLayer=store.layers.find(function(l){ return l.id===rid; });
        if(!rLayer || rLayer.locked) return;
        VibeDesigner.Canvas.setSelectedLayer(rid);
        VibeDesigner.Canvas.drag={
          id:rid,
          mode:"resize",
          startX:e.clientX,
          startY:e.clientY,
          startScale:rLayer.scale||1,
          startFont:rLayer.text ? rLayer.text.fontSize : 36,
          moved:false,
          layerType:rLayer.type
        };
        if(dragSurface.setPointerCapture) dragSurface.setPointerCapture(e.pointerId);
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      var btn=e.target.closest("[data-layer]");
      var id=btn ? btn.getAttribute("data-layer") : layerFromPoint(e.clientX, e.clientY);
      if(id){
        var layer=store.layers.find(function(l){ return l.id===id; });
        if(!layer || layer.locked) return;
        VibeDesigner.Canvas.setSelectedLayer(id);
        var rect=zone.getBoundingClientRect();
        if(!rect.width || !rect.height) return;
        VibeDesigner.Canvas.drag={ id:id, mode:"move", rect:rect, moved:false, layerType:layer.type };
        if(dragSurface.setPointerCapture) dragSurface.setPointerCapture(e.pointerId);
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // Empty dotted box → move print area
      var overZone = e.target===zone || (zone.contains(e.target) && !e.target.closest("[data-layer]")) || (function(){
        var zr=zone.getBoundingClientRect();
        return e.clientX>=zr.left && e.clientX<=zr.right && e.clientY>=zr.top && e.clientY<=zr.bottom;
      })();
      if(overZone){
        startZoneDrag(e, "move");
        e.preventDefault();
        e.stopPropagation();
      }
    }
    function onDragPointerMove(e){
      var zd=VibeDesigner.Canvas.zoneDrag;
      if(zd){
        var dx=((e.clientX-zd.startX)/zd.stageRect.width)*100;
        var dy=((e.clientY-zd.startY)/zd.stageRect.height)*100;
        var o=zd.orig;
        var next={ left:o.left, top:o.top, width:o.width, height:o.height };
        var m=zd.mode||"move";
        if(m==="move"){
          next.left=o.left+dx;
          next.top=o.top+dy;
        } else {
          if(m==="e"||m==="ne"||m==="se"){ next.width=o.width+dx; }
          if(m==="s"||m==="se"||m==="sw"){ next.height=o.height+dy; }
          if(m==="w"||m==="nw"||m==="sw"){ next.left=o.left+dx; next.width=o.width-dx; }
          if(m==="n"||m==="nw"||m==="ne"){ next.top=o.top+dy; next.height=o.height-dy; }
        }
        next=clampZone(next);
        applyZoneLayout(next);
        e.preventDefault();
        return;
      }
      var drag=VibeDesigner.Canvas.drag;
      if(!drag) return;
      if(drag.mode==="resize"){
        var delta=(e.clientX-drag.startX + e.clientY-drag.startY)/80;
        var scale=Math.max(0.4, Math.min(3, drag.startScale + delta));
        drag.moved=true;
        store.layers=store.layers.map(function(l){
          if(l.id!==drag.id) return l;
          var nxt=Object.assign({}, l, { scale:scale });
          if(l.text){
            var fs=Math.max(12, Math.min(120, Math.round(drag.startFont * scale / drag.startScale)));
            nxt.text=Object.assign({}, l.text, { fontSize:fs });
          }
          return nxt;
        });
        var el=zone.querySelector('[data-layer="'+drag.id+'"]');
        if(el){
          var live=store.layers.find(function(l){ return l.id===drag.id; });
          var rot=live && live.text ? live.text.rotation : (live && live.rotation)||0;
          el.style.transform="translate(-50%,-50%) rotate("+rot+"deg) scale("+scale+")";
          if(live && live.text) el.style.fontSize=(live.text.fontSize*0.34)+"px";
        }
        e.preventDefault();
        return;
      }
      var x=((e.clientX-drag.rect.left)/drag.rect.width)*100;
      var y=((e.clientY-drag.rect.top)/drag.rect.height)*100;
      x=Math.max(5, Math.min(95, x));
      y=Math.max(5, Math.min(95, y));
      drag.moved=true;
      store.layers=store.layers.map(function(l){ return l.id===drag.id ? Object.assign({}, l, { x:x, y:y }) : l; });
      VibeDesigner.Canvas.moveLayerDom(drag.id, x, y);
      e.preventDefault();
    }
    function onDragPointerUp(e){
      var zd=VibeDesigner.Canvas.zoneDrag;
      if(zd){
        if(stageEl.releasePointerCapture){
          try{ stageEl.releasePointerCapture(e.pointerId); }catch(err){}
        }
        if(!store.zoneLayouts) store.zoneLayouts={};
        store.zoneLayouts[zd.zoneKey]={
          left:parseFloat(zone.style.left)||zd.orig.left,
          top:parseFloat(zone.style.top)||zd.orig.top,
          width:parseFloat(zone.style.width)||zd.orig.width,
          height:parseFloat(zone.style.height)||zd.orig.height
        };
        VibeDesigner.Canvas.zoneDrag=null;
        zone.classList.remove("is-dragging");
        e.preventDefault();
        return;
      }
      var drag=VibeDesigner.Canvas.drag;
      if(!drag) return;
      if(dragSurface.releasePointerCapture){
        try{ dragSurface.releasePointerCapture(e.pointerId); }catch(err){}
      }
      VibeDesigner.Canvas.drag=null;
      VibeDesigner.Canvas.render();
      VibeDesigner.Layers.render();
      if(!drag.moved && drag.layerType==="text" && drag.mode!=="resize"){
        var picked=store.layers.find(function(l){ return l.id===drag.id; });
        if(picked){ store.textPairId=picked.pairId||null; showTextEditor(true); }
      }
    }
    if(dragSurface){
      dragSurface.addEventListener("pointerdown", onDragPointerDown);
      dragSurface.addEventListener("pointermove", onDragPointerMove);
      dragSurface.addEventListener("pointerup", onDragPointerUp);
      dragSurface.addEventListener("pointercancel", onDragPointerUp);
    }

    document.getElementById("vdOpenChart").addEventListener("click", function(){ document.getElementById("vdChartModal").classList.add("is-open"); });
    document.querySelectorAll("[data-close='chart']").forEach(function(el){ el.addEventListener("click", function(){ document.getElementById("vdChartModal").classList.remove("is-open"); }); });
    document.querySelectorAll("[data-close='upload']").forEach(function(el){ el.addEventListener("click", function(){ VibeDesigner.Upload.close(); }); });

    document.getElementById("vdPanel").addEventListener("click", function(e){
      var align=e.target.closest("[data-align]"); if(align){ VibeDesigner.Text.update({align:align.getAttribute("data-align")},{applyAllStyles:true}); return; }
      var fmt=e.target.closest("[data-fmt]"); if(fmt){ var key=fmt.getAttribute("data-fmt"); var layer=store.getSelectedLayer(); if(layer&&layer.text){ var patch={}; patch[key]=!layer.text[key]; VibeDesigner.Text.update(patch,{applyAllStyles:true});} return; }
      var cse=e.target.closest("[data-case]"); if(cse){ var val=cse.getAttribute("data-case"); var cur=store.getSelectedLayer(); VibeDesigner.Text.update({textCase:cur&&cur.text&&cur.text.textCase===val?"none":val},{applyAllStyles:true}); return; }
      var colorBtn=e.target.closest("[data-text-color]"); if(colorBtn){ var hex=colorBtn.getAttribute("data-text-color"); VibeDesigner.Text.update({color:hex},{applyAllStyles:true}); store.recentColors=[hex].concat(store.recentColors.filter(function(c){return c!==hex;})).slice(0,8); return; }
      var effect=e.target.closest("[data-effect]"); if(effect){ VibeDesigner.Text.update({effect:effect.getAttribute("data-effect")},{applyAllStyles:true}); return; }
      var lact=e.target.closest("[data-layer-act]"); if(lact){
        var act=lact.getAttribute("data-layer-act"), sel=store.selectedLayerId;
        if(act==="del"){ store.layers=store.layers.filter(function(l){return l.id!==sel;}); store.selectedLayerId=null; showTextEditor(false); store.emit(); return; }
        if(act==="dup"){ var source=store.getSelectedLayer(); if(!source) return; var copy=JSON.parse(JSON.stringify(source)); copy.id=uid(source.type==="text"?"txt":"img"); copy.name=source.name+" copy"; store.layers=store.layers.concat([copy]); store.selectedLayerId=copy.id; store.emit(); return; }
        var layers=store.layers.slice(); var idx=layers.findIndex(function(l){return l.id===sel;}); var target=act==="up"?idx+1:idx-1;
        if(idx<0||target<0||target>=layers.length) return; var tmp=layers[idx]; layers[idx]=layers[target]; layers[target]=tmp; store.layers=layers; store.emit();
      }
    });

    document.getElementById("vdPanel").addEventListener("change", function(e){
      if(e.target.id==="vdFontSelect"){
        var fid=e.target.value;
        var font=FONTS.find(function(f){return f.id===fid;});
        VibeDesigner.Text.update({fontId:fid},{applyAllStyles:true});
        if(font) e.target.style.fontFamily=font.family;
        return;
      }
      if(e.target.id==="vdColorPicker"){
        var picked=normalizeHex(e.target.value);
        if(picked){
          VibeDesigner.Text.update({color:picked},{applyAllStyles:true});
          store.recentColors=[picked].concat(store.recentColors.filter(function(c){return c!==picked;})).slice(0,8);
        }
        return;
      }
      if(e.target.id==="vdHex"){ var hex=normalizeHex(e.target.value); if(hex){ VibeDesigner.Text.update({color:hex},{applyAllStyles:true}); store.recentColors=[hex].concat(store.recentColors.filter(function(c){return c!==hex;})).slice(0,8);} }
      if(e.target.id==="vdRgb"){ var hx=rgbToHex(e.target.value); if(hx){ VibeDesigner.Text.update({color:hx},{applyAllStyles:true}); store.recentColors=[hx].concat(store.recentColors.filter(function(c){return c!==hx;})).slice(0,8);} }
      if(e.target.id==="vdGradient") VibeDesigner.Text.update({gradientEnabled:e.target.checked},{applyAllStyles:true});
      if(e.target.id==="vdPattern") VibeDesigner.Text.update({patternFill:e.target.checked},{applyAllStyles:true});
    });

    document.getElementById("vdPanel").addEventListener("input", function(e){
      if(e.target.id==="vdColorPicker"){
        var live=normalizeHex(e.target.value);
        if(live){
          VibeDesigner.Text.update({color:live},{applyAllStyles:true, live:true});
          var hexInput=document.getElementById("vdHex");
          if(hexInput) hexInput.value=live;
        }
        return;
      }
      if(e.target.id==="vdTextContent"){
        e.target.value=clampText(e.target.value);
        VibeDesigner.Text.update({content:e.target.value},{live:true});
        autosizeTextarea(e.target);
        var count=document.getElementById("vdTextCount");
        if(count){ count.textContent=e.target.value.length+"/200"; count.classList.toggle("is-limit", e.target.value.length>=200); }
        return;
      }
      var sideText=e.target.closest("[data-side-text]");
      if(sideText){
        sideText.value=clampText(sideText.value);
        var lid=sideText.getAttribute("data-layer-id");
        if(lid) VibeDesigner.Text.updateSideContent(lid, sideText.value);
        autosizeTextarea(sideText);
        var sc=sideText.parentNode && sideText.parentNode.querySelector("[data-char-count]");
        if(sc){ sc.textContent=sideText.value.length+"/200"; sc.classList.toggle("is-limit", sideText.value.length>=200); }
        var dualNow=getDualSides(store.printPositionId);
        var sideId=sideText.getAttribute("data-side-text");
        if(dualNow){
          var sm=dualNow.find(function(s){return s.id===sideId;});
          if(sm && store.previewSide!==sm.preview){ store.previewSide=sm.preview; VibeDesigner.Canvas.render(); }
        }
        return;
      }
      var range=e.target.closest("[data-text-key]"); if(range){ var key=range.getAttribute("data-text-key"); var val=Number(range.value); if(key==="opacityPct") VibeDesigner.Text.update({opacity:val/100},{applyAllStyles:true}); else { var patch={}; patch[key]=val; VibeDesigner.Text.update(patch,{applyAllStyles:true});} }
    });

    var drop=document.getElementById("vdDropzone"), fileInput=document.getElementById("vdFileInput"), cameraInput=document.getElementById("vdCameraInput");
    document.getElementById("vdBrowseBtn").addEventListener("click", function(){ (store.uploadTab==="camera"?cameraInput:fileInput).click(); });
    fileInput.addEventListener("change", function(){ if(fileInput.files&&fileInput.files[0]) VibeDesigner.Upload.process(fileInput.files[0]); fileInput.value=""; });
    cameraInput.addEventListener("change", function(){ if(cameraInput.files&&cameraInput.files[0]) VibeDesigner.Upload.process(cameraInput.files[0]); cameraInput.value=""; });
    drop.addEventListener("dragover", function(e){ e.preventDefault(); drop.classList.add("is-over"); });
    drop.addEventListener("dragleave", function(){ drop.classList.remove("is-over"); });
    drop.addEventListener("drop", function(e){ e.preventDefault(); drop.classList.remove("is-over"); if(e.dataTransfer.files&&e.dataTransfer.files[0]) VibeDesigner.Upload.process(e.dataTransfer.files[0]); });
    document.getElementById("vdUploadModal").addEventListener("click", function(e){
      var tab=e.target.closest("[data-upload-tab]"); if(tab&&!tab.disabled){ store.uploadTab=tab.getAttribute("data-upload-tab"); VibeDesigner.Upload.renderTabs(); }
      var sideBtn=e.target.closest("[data-upload-side]"); if(sideBtn){
        store.uploadTargetSide=sideBtn.getAttribute("data-upload-side");
        VibeDesigner.Upload.renderTabs();
        return;
      }
      if(e.target.id==="vdCancelUpload"&&store.uploadAbort) store.uploadAbort.abort();
      if(e.target.id==="vdRetryUpload"&&VibeDesigner.Upload.lastFile) VibeDesigner.Upload.process(VibeDesigner.Upload.lastFile);
      if(e.target.id==="vdUploadDoneSides"){ VibeDesigner.Upload.close(); return; }
      if(e.target.id==="vdUploadOtherSide"){
        var pending=store.pendingSecondUpload;
        if(!pending) return;
        store.uploadMode=pending.mode;
        store.uploadTargetSide=pending.side;
        store.pendingSecondUpload=null;
        document.getElementById("vdUploadStatus").innerHTML="";
        VibeDesigner.Upload.renderTabs();
        VibeDesigner.UI.toast("Now upload artwork for "+pending.label+".");
        return;
      }
    });

    document.getElementById("vdAddCartMobile").addEventListener("click", function(){ VibeDesigner.Cart.add(); });
    var topCart=document.getElementById("vdAddCart");
    if(topCart) topCart.addEventListener("click", function(){ VibeDesigner.Cart.add(); });
  }

  function matchColorOption(colors, raw){
    var value=String(raw||"").trim();
    if(!value) return null;
    var lower=value.toLowerCase();
    return colors.find(function(c){
      return c.id===lower || c.id===slugify(value) || c.name.toLowerCase()===lower || slugify(c.name)===slugify(value) || c.hex.toLowerCase()===lower;
    }) || null;
  }

  function matchSizeOption(sizes, raw){
    var value=String(raw||"").trim();
    if(!value) return null;
    var lower=value.toLowerCase();
    return sizes.find(function(s){
      return s.id===lower || s.id===slugify(value) || s.label.toLowerCase()===lower || slugify(s.label)===slugify(value);
    }) || null;
  }

  function applyUrlDefaults(){
    var store=VibeDesigner.Store;
    var params=new URLSearchParams(window.location.search);
    var saved=VibeDesigner.API.getSavedProductContext();
    var colorParam=params.get("color")|| (saved && saved.color) || "";
    var sizeParam=params.get("size")|| (saved && saved.size) || "";

    var matchColor=matchColorOption(store.product.colors, colorParam);
    if(matchColor) store.colorId=matchColor.id;
    else {
      var first=store.product.colors.find(function(c){return c.inStock;})||store.product.colors[0];
      if(first) store.colorId=first.id;
    }

    var matchSize=matchSizeOption(store.product.sizes, sizeParam);
    if(matchSize){
      store.selectedSizeId=matchSize.id;
      store.sizeQuantities[matchSize.id]=1;
    } else {
      var m=store.product.sizes.find(function(s){return s.inStock&&(s.id==="m"||s.label.toLowerCase()==="m"||s.label.toLowerCase()==="medium");})||store.product.sizes.find(function(s){return s.inStock;})||store.product.sizes[0];
      if(m){ store.selectedSizeId=m.id; store.sizeQuantities[m.id]=store.sizeQuantities[m.id]||1; }
    }

    var positions=VibeDesigner.API.getAvailablePositions(store.product);
    if(!positions.some(function(p){ return p.id===store.printPositionId; })){
      store.printPositionId=positions[0] ? positions[0].id : "full_front";
    }

    VibeDesigner.API.syncSelectedVariation(store);
  }

  function renderAll(){
    VibeDesigner.API.syncSelectedVariation(VibeDesigner.Store);
    VibeDesigner.Options.render();
    VibeDesigner.Personalize.render();
    VibeDesigner.Text.render();
    if(VibeDesigner.Store.clipartOpen) VibeDesigner.Clipart.render();
    VibeDesigner.Layers.render();
    VibeDesigner.Canvas.render();
  }

  function hidePageHeading(){
    var selectors=[
      ".elementor-widget-theme-page-title",
      ".elementor-page-title",
      "h1.entry-title",
      ".page-header .entry-title",
      ".page-title",
      ".woocommerce-products-header__title",
      "header.entry-header",
      ".elementor-location-single .elementor-widget-heading .elementor-heading-title"
    ];
    selectors.forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el){
        var text=(el.textContent||"").trim().toLowerCase();
        if(!text || text.indexOf("customize")>-1 || text.indexOf("design")>-1 || el.closest(".elementor-widget-theme-page-title") || el.classList.contains("entry-title") || el.classList.contains("page-title") || el.classList.contains("elementor-page-title")){
          el.style.setProperty("display","none","important");
          el.classList.add("vd-hide-page-title");
          var wrap=el.closest(".elementor-element, .elementor-widget, header.entry-header, .page-header");
          if(wrap && wrap!==document.body) wrap.style.setProperty("display","none","important");
        }
      });
    });
    // Hide any Elementor heading immediately above the designer that looks like a page title
    var app=document.getElementById("vdApp");
    if(app){
      var prev=app.previousElementSibling;
      for(var i=0;i<4 && prev;i++){
        var heading=prev.querySelector && prev.querySelector("h1,h2,.elementor-heading-title");
        if(heading){
          var t=(heading.textContent||"").trim().toLowerCase();
          if(t.indexOf("customize")>-1 || t==="design editor" || t.indexOf("product")>-1 && t.length<40){
            prev.style.setProperty("display","none","important");
            break;
          }
        }
        prev=prev.previousElementSibling;
      }
    }
  }

  function hideLoading(){
    if(typeof window.vdClearSpinner==="function"){
      window.vdClearSpinner();
      return;
    }
    var ld=document.getElementById("vdLoading");
    var main=document.getElementById("vdMain");
    if(ld){
      ld.hidden=true;
      ld.setAttribute("hidden","");
      ld.classList.add("is-done");
      ld.style.setProperty("display","none","important");
      ld.style.setProperty("visibility","hidden","important");
      ld.style.setProperty("opacity","0","important");
      ld.setAttribute("aria-hidden","true");
      try{ if(ld.parentNode) ld.parentNode.removeChild(ld); }catch(e){}
    }
    if(main){
      main.hidden=false;
      main.removeAttribute("hidden");
      main.style.display="";
    }
  }

  function bootDesigner(product){
    hideLoading();
    try{
      hidePageHeading();
      var store=VibeDesigner.Store;
      var expectedId=VibeDesigner.API.getProductIdFromUrl() || (VibeDesigner.API.getSavedProductContext() && VibeDesigner.API.getSavedProductContext().id);

      if(product) store.product=product;
      else if(expectedId) VibeDesigner.UI.toast("Could not load product — check product ID and try again.");

      applyUrlDefaults();

      var back=document.getElementById("vdBack");
      if(back){
        if(document.referrer && /\/product\//.test(document.referrer)) back.href=document.referrer;
        else if(store.product.permalink) back.href=store.product.permalink;
      }

      bind();
      renderAll();
      showTextEditor(false);
      showClipart(false);
    }catch(err){
      hideLoading();
      try{ console.error("VibeDesigner boot error", err); }catch(e){}
      try{ VibeDesigner.UI.toast("Designer loaded with limited features. Reload if needed."); }catch(e){}
    }
  }

  try{
    VibeDesigner.Store.subscribe(function(){
      try{ renderAll(); }catch(err){ try{ console.error(err); }catch(e){} }
    });
  }catch(e){}

  hideLoading();

  try{
    VibeDesigner.API.loadProduct()
      .then(function(product){ bootDesigner(product); })
      .catch(function(){ bootDesigner(null); });
  }catch(e){
    bootDesigner(null);
  }

  // Hard safety: clear spinner even if API/boot stalls
  setTimeout(function(){
    hideLoading();
    if(!bind._bound){
      try{ bootDesigner(null); }catch(e){ hideLoading(); }
    }
  }, 1600);
  setTimeout(hideLoading, 4000);
})();
