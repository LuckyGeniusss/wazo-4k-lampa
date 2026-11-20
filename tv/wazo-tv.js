/* Wazo TV for Lampa — standalone branded IPTV client. No embedded access keys. */
(function() {
'use strict';
if (window.WazoTVLoaded || !window.Lampa || !window.jQuery) return;
window.WazoTVLoaded=true;
const L=window.Lampa, $=window.jQuery;
const API_KEY='wazo4k_api', TOKEN_KEY='wazo4k_token', PAIR_KEY='wazo4k_pair';
const icon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="32" height="32"><defs><linearGradient id="wzgrad" x1="0" x2="1"><stop stop-color="#43ebdc"/><stop offset="1" stop-color="#5e8bff"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="#132946"/><path d="m9 19 8 28h8l7-16 7 16h8l8-28h-10l-4 16-6-16h-7l-6 16-4-16z" fill="url(#wzgrad)"/></svg>';
function url(){return String(L.Storage.get(API_KEY,'https://4k.wazo.store')||'https://4k.wazo.store').replace(/\/+$/,'');}
function token(){return String(L.Storage.get(TOKEN_KEY,'')||'');}
function note(t){L.Noty.show(String(t||''),{time:4000});}
function esc(t){return $('<div/>').text(String(t===undefined||t===null?'':t)).html();}
function safeUrl(v){return /^https:\/\//i.test(v)||/^http:\/\/(?:localhost|127\.0\.0\.1|10\.|192\.168\.)/i.test(v);}
async function req(path,method,data,needToken=true){
    const headers={'Content-Type':'application/json'};
    if(needToken&&token())headers.Authorization='Bearer '+token();
    if(needToken&&!token())throw Error('Привяжите Wazo TV через Telegram');
    const c=new AbortController(); const timer=setTimeout(()=>c.abort(),25000);
    try{
      const r=await fetch(url()+path,{method:method||'GET',headers,body:data?JSON.stringify(data):undefined,signal:c.signal});
      let j={};try{j=await r.json();}catch(_){}
      if(!r.ok)throw Error(j.detail||'Ошибка API: '+r.status);
      return j;
    }finally{clearTimeout(timer);}
}
const CSS=`
.wazotv-brand{background:linear-gradient(120deg,#124d65,#136c86 55%,#37469c)!important;
 border:2px solid #46eade!important;border-radius:16px!important;
 box-shadow:0 6px 30px rgba(42,213,227,.35)!important;color:#fff!important}
.wazotv-brand .menu__text{font-weight:850!important;letter-spacing:.08em!important}
.wazotv-brand.focus{outline:3px solid #eafcff!important}
.wazotv-source-brand{background:linear-gradient(120deg,#114d60,#255ca4)!important;
 border:2px solid #52f5e3!important;color:white!important;border-radius:18px!important;
 box-shadow:0 3px 22px rgba(37,228,228,.32)!important;font-weight:850!important}
.wazotv-header{display:flex;align-items:center;gap:1em;padding:1em 1.25em;
 border-radius:1em;background:linear-gradient(105deg,#0a3348,#174a75 56%,#51469c);border:1px solid #41d8e0}
.wazotv-name{font-size:2.2em;font-weight:900;letter-spacing:.08em;color:#edffff}
.wazotv-sub{color:#bdeeff;font-size:.9em}
.wazotv-item{padding:.75em 1.1em;margin:.35em 0;border-radius:.65em;
 background:rgba(100,166,195,.11);border:1px solid rgba(112,224,245,.17)}
.wazotv-item.focus,.wazotv-item:focus{background:#247ba1!important;border-color:#97fff3!important}
.wazotv-item .wazotv-detail{font-size:.8em;color:#b9cadb;opacity:.9;margin-top:.2em}
`;
function decorate(){
    $('.menu__item').each(function(){
        if(/WAZO TV/i.test($(this).text()))$(this).addClass('wazotv-brand');
    });
    // Only style the already-existing Wazo movie source selector; never rename Lumio.
    $('.full-start__button,.full-start__online,.full-start__source,.selector').each(function(){
        const el=$(this);
        const value=el.text().replace(/\s+/g,' ').trim();
        if(/^Wazo$/i.test(value)||/^Wazo Online$/i.test(value))el.addClass('wazotv-source-brand');
    });
}
function input(title,defaultValue,done){
    L.Input.edit({title,value:defaultValue||'',free:true,nosave:true},function(v){
        try{L.Controller.toggle('content');}catch(_){}
        if(v!==null&&v!==undefined)done(String(v).trim());
    });
}
function Panel(){
    const self=this,root=$('<div style="padding:1em 2%"></div>');
    const heading=$('<div class="wazotv-header"></div>').append(
        $(icon).css({width:'3.7em',height:'3.7em'}),
        $('<div><div class="wazotv-name">WAZO TV</div><div class="wazotv-sub">Телевидение · Каналы · Запасные источники</div></div>')
    );
    const status=$('<div style="padding:1em .2em;color:#cad6e7"></div>');
    const scroll=new L.Scroll({mask:true,over:true});
    const list=$('<div style="padding-bottom:3em"></div>');
    root.append(heading,status,scroll.render(true));scroll.append(list);
    let activeRow=null, page=0, cat='Все',lang='all',query='';
    const LANGS=[['Все языки','all'],['Українська','uk'],['Русский','ru'],['English','en'],['Gaeilge','ga'],['Deutsch','de'],['Italiano','it'],['Español','es'],['Português','pt'],['Français','fr'],['Türkçe','tr'],['Nederlands','nl'],['Polski','pl'],['中文','zh'],['日本語','ja'],['한국어','ko'],['Română','ro'],['Svenska','sv'],['Язык не определён','und']];
    const CATS=['Все','Украинские','Ирландские','Фильмы','Детские','Спорт','Новости','Музыка','Познавательные','Развлечения','Общие'];
    function add(text,sub,fn){
        let div=$('<div class="selector wazotv-item"></div>');
        div.append($('<div style="font-weight:650"></div>').text(text));
        if(sub)div.append($('<div class="wazotv-detail"></div>').text(sub));
        div.on('hover:enter',fn).on('hover:focus',function(e){
            activeRow=e.target;scroll.update(div,true);
        });list.append(div);return div;
    }
    function clear(text){list.empty();status.text(text||'');activeRow=null;}
    function fail(err){note(err.message||String(err));}
    function pairing(){
        clear('Подключите устройство через Telegram: @Wazo4KBot');
        add('Адрес API: '+url(),'Изменить при необходимости',()=>input('HTTPS адрес Wazo 4K',url(),function(v){
            if(!safeUrl(v))return note('Введите HTTPS адрес'); L.Storage.set(API_KEY,v);pairing();
        }));
        add('Получить 10-значный код','Код активен 10 минут',async()=>{
            try{const p=await req('/v1/pair/request','POST',{label:'Wazo TV / Fire Stick'},false);
                L.Storage.set(PAIR_KEY,p);pairing();}catch(e){fail(e);}
        });
        const p=L.Storage.get(PAIR_KEY,null);
        if(p&&p.code){
            add('Код: '+p.code,'Отправьте /link '+p.code+' боту @Wazo4KBot',()=>note(p.code));
            add('Проверить привязку','После подтверждения в Telegram',async()=>{
                try{const d=await req('/v1/pair/poll','POST',{pair_id:p.pair_id,code:p.code},false);
                    if(d.status==='active'){
                        L.Storage.set(TOKEN_KEY,d.access_token);L.Storage.set(PAIR_KEY,null);home();
                    }else note('Подтверждение пока не получено');
                }catch(e){fail(e);}
            });
        }
    }
    function chooseLanguage(next){
        L.Select.show({title:'Язык телеканалов',items:LANGS.map(x=>({title:x[0],value:x[1]})),
          onSelect:chosen=>{lang=chosen.value;page=0;next();},onBack:()=>{}});
    }
    function home(){
        if(!token())return pairing();
        clear('Каталог Wazo TV · '+url());
        add('Поиск каналов','По названию, например 1+1, BBC, Sport',()=>{
            input('Найти канал',query,v=>{query=v;page=0;channels();});
        });
        add('Язык: '+(LANGS.find(x=>x[1]===lang)||LANGS[0])[0],'Выберите язык',()=>chooseLanguage(home));
        add('Категории и каналы','Выберите раздел');
        CATS.forEach(c=>add(c,c===cat?'Выбрано':'',()=>{cat=c;page=0;query='';channels();}));
        add('Проверить подписку','Устройства и срок действия',async()=>{
            try{const v=await req('/v1/me');note('Доступ до '+new Date(v.subscription_expires_at||v.expires_at).toLocaleString());}
            catch(e){fail(e);}
        });
        add('Сброс привязки на этом устройстве','Без изменения подписки',()=>{
            L.Select.show({title:'Удалить доступ на данном телевизоре?',
                items:[{title:'Отмена',value:'no'},{title:'Удалить',value:'yes'}],
                onSelect:x=>{if(x.value==='yes'){L.Storage.set(TOKEN_KEY,'');pairing();}},onBack:()=>{}});
        });
    }
    async function channels(){
        clear(cat+' · '+(LANGS.find(x=>x[1]===lang)||LANGS[0])[0]+' · '+(page+1)+' страница');
        add('Назад к разделам','',home);
        add('Изменить язык','Сейчас '+lang,()=>chooseLanguage(channels));
        add('Поиск: '+(query||'все'),'Изменить',()=>input('Название канала',query,v=>{query=v;page=0;channels();}));
        try{
            const path='/v1/tv/channels?'+new URLSearchParams({category:cat,language:lang,q:query,limit:'60',offset:String(page*60)});
            const result=await req(path);
            status.text('Wazo TV · '+result.count+' каналов · '+cat+' · стр. '+(page+1));
            if(!result.items.length)add('Ничего не найдено','Попробуйте другой фильтр',home);
            result.items.forEach(item=>{
                const desc=[item.country!=='XX'?item.country:null,item.language!=='und'?item.language:null,
                    item.category,item.alternatives+' источн.',item.verified_streams?item.verified_streams+' проверено':null].filter(Boolean).join(' · ');
                add(item.name,desc,()=>showChannel(item));
            });
            if((page+1)*60<result.count)add('Следующая страница','',()=>{page++;channels();});
            if(page>0)add('Предыдущая страница','',()=>{page--;channels();});
        }catch(err){fail(err);add('Попробовать снова','',channels);}
    }
    async function showChannel(item){
        clear(item.name+' · выбор видеоисточника');
        add('← К списку каналов','',channels);
        add('▶ Смотреть · лучший источник','Выбирается по результатам проверок',()=>play(item.id));
        try{
            const d=await req('/v1/tv/channels/'+item.id+'/streams');
            if(!d.streams.length)note('Нет доступных ссылок');
            d.streams.forEach(s=>{
                const mark=s.healthy===true?'● проверено':s.healthy===false?'○ ошибка':'· не проверено';
                add(s.source_name+' · '+s.quality_hint,mark+' · '+(s.kind==='ace'?'AceStream':'HTTP / HLS'),
                    ()=>play(item.id,s.id));
            });
        }catch(e){fail(e);}
    }
    async function play(channelId,streamId){
        try{
            const p='/v1/tv/channels/'+channelId+'/play'+(streamId?'?stream_id='+streamId:'');
            const d=await req(p);
            L.Player.play({url:d.url,title:d.title,source:'Wazo TV · '+d.source});
        }catch(e){fail(e);}
    }
    this.create=()=>root;
    this.render=()=>root;
    this.start=function(){
        home();
        L.Controller.add('content',{
            toggle:()=>{
                L.Controller.collectionSet(scroll.render(true),root);
                L.Controller.collectionFocus(activeRow||false,scroll.render(true));
            },
            up:()=>{if(window.Navigator&&Navigator.canmove('up'))Navigator.move('up');else L.Controller.toggle('head');},
            down:()=>{if(window.Navigator)Navigator.move('down');},
            right:()=>{if(window.Navigator)Navigator.move('right');},
            left:()=>{if(window.Navigator&&Navigator.canmove('left'))Navigator.move('left');else L.Controller.toggle('menu');},
            back:()=>L.Activity.backward()
        });
        L.Controller.toggle('content');
    };
    this.stop=()=>{};this.pause=()=>{};this.destroy=()=>{scroll.destroy();root.remove();};
    this.empty=()=>{};
}
function open(){L.Activity.push({url:'',title:'WAZO TV',component:'wazotv',page:1});}
function init(){
    if(document.getElementById('wazotv-css'))return;
    $('<style id="wazotv-css"></style>').text(CSS).appendTo('head');
    L.Component.add('wazotv',Panel);
    try{L.Menu.addButton(icon,'WAZO TV',open);}
    catch(e){let el=$('<li class="menu__item selector"><div class="menu__text">WAZO TV</div></li>');el.on('hover:enter',open);$('.menu .menu__list').first().append(el);}
    decorate();
    const mo=new MutationObserver(()=>decorate());
    mo.observe(document.body,{childList:true,subtree:true});
}
// Some CUB builds do not set window.appready; register when the APIs are present.
if(L.Component && L.Menu && document.body)init();
else L.Listener.follow('app',function(e){if(e.type==='ready')init();});
})();