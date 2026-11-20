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
.wazotv-dashboard{margin:.9em 0 1.2em;display:flex;flex-wrap:wrap;gap:.7em}
.wazotv-stat{min-width:9em;flex:1;max-width:17em;padding:.7em 1em;
 border:1px solid rgba(113,218,236,.24);border-radius:.8em;background:rgba(16,67,99,.58)}
.wazotv-stat-num{font-size:1.6em;font-weight:850;color:#e6ffff}
.wazotv-stat-label{font-size:.82em;color:#b1c7d8}
.wazotv-section{font-size:1.25em;color:#b8eff5;margin:1.5em .2em .45em;font-weight:750}
.wazotv-grid{display:flex;flex-wrap:wrap;gap:.6em;padding:.25em 0}
.wazotv-tile{display:flex!important;align-items:center;gap:.7em;box-sizing:border-box;
 border:1px solid rgba(123,222,238,.2);background:linear-gradient(130deg,#14344d,#1a3657);
 border-radius:1em;padding:1.05em;min-height:4.7em;width:calc(25% - .5em);min-width:12.7em;
 color:#f1ffff}
.wazotv-tile.focus,.wazotv-tile:focus{background:#1a7b9c!important;border:2px solid #a2fff1!important}
.wazotv-tile-symbol{display:flex;align-items:center;justify-content:center;width:2.35em;height:2.35em;
 flex:0 0 auto;border-radius:.65em;background:rgba(63,218,220,.19);color:#79ffee;
 font-size:1.2em;font-weight:850}
.wazotv-tile-title{font-weight:750;font-size:1.06em}
.wazotv-tile-sub{font-size:.78em;color:#b8cfdf;margin-top:.3em}
.wazotv-ch-row{display:flex!important;align-items:center;gap:1em;min-height:4.5em}
.wazotv-ch-logo{width:3.2em;height:3.2em;flex:0 0 auto;border-radius:.65em;background:#1f445a;
 display:flex;align-items:center;justify-content:center;color:#8beeed;font-weight:900;overflow:hidden}
.wazotv-ch-logo img{max-width:90%;max-height:90%;object-fit:contain}
.wazotv-ch-title{font-size:1.03em;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.wazotv-ch-mark{margin-left:auto;font-weight:650;font-size:.85em;white-space:nowrap;
 color:#ffcd7b}
.wazotv-ch-mark--ok{color:#70ebbc}
.wazotv-filter{border-left:3px solid #52f5e3!important}
.wazotv-item:focus{outline:2px solid #e9ffff;outline-offset:1px}
@media screen and (max-width:850px){
 .wazotv-tile{width:calc(50% - .6em)}
 .wazotv-stat{min-width:6.6em}
 .wazotv-ch-mark{font-size:.68em}
}
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
let playing=null;
async function playNext(){
    if(!playing || playing.switching)return;
    const state=playing;
    const item=state.candidates.shift();
    if(!item){note('Доступные источники закончились. Выберите другой канал.');playing=null;return;}
    state.switching=true;
    try{
        const d=await req('/v1/tv/channels/'+state.channelId+'/play?stream_id='+item.id);
        if(playing!==state)return;
        state.lastSource=d.source;
        L.Player.play({url:d.url,title:d.title,source:'Wazo TV · '+d.source});
    }catch(e){
        state.switching=false;
        if(playing===state) {
            note('Ошибка источника, переключаемся на запасной');
            setTimeout(playNext,650);
        }
        return;
    }
    setTimeout(()=>{if(playing===state)state.switching=false;},1200);
}
async function beginPlayback(channelId,preferredStreamId){
    const d=await req('/v1/tv/channels/'+channelId+'/streams');
    // HTTP streams first, then AceStream via Wazo's authenticated bridge.
    const candidates=d.streams.filter(s=>s.kind==='http'||s.kind==='ace');
    if(!candidates.length)throw Error('Нет доступных видеоисточников');
    if(preferredStreamId)candidates.sort((a,b)=>Number(b.id===preferredStreamId)-Number(a.id===preferredStreamId));
    playing={channelId,candidates:candidates.slice(0,8),switching:false,lastSource:''};
    await playNext();
}
function monitorPlayback(){
    if(L.PlayerVideo&&L.PlayerVideo.listener){
        L.PlayerVideo.listener.follow('error',function(e){
            if(!playing || playing.switching || !e || !e.fatal)return;
            if(!playing.candidates.length){playing=null;return;}
            note('Источник недоступен. Пробую запасной…');
            setTimeout(()=>{if(playing&&!playing.switching)playNext();},900);
        });
    }
    if(L.Player&&L.Player.listener){
        L.Player.listener.follow('close',function(){
            if(playing && !playing.switching)playing=null;
        });
    }
}
function Panel(){
    const self=this,root=$('<div style="padding:1em 2%"></div>');
    const heading=$('<div class="wazotv-header"></div>').append(
        $(icon).css({width:'3.7em',height:'3.7em'}),
        $('<div><div class="wazotv-name">WAZO TV</div><div class="wazotv-sub">Телеканалы · Кино в эфире · Сериалы · Украина и Европа</div></div>')
    );
    const status=$('<div style="padding:1em .2em;color:#cad6e7"></div>');
    const scroll=new L.Scroll({mask:true,over:true});
    const list=$('<div style="padding-bottom:3em"></div>');
    root.append(heading,status,scroll.render(true));scroll.append(list);
    let activeRow=null, page=0, cat='Рабочие',lang='all',query='',onlyWorking=true;
    const LANGS=[['Все языки','all'],['Українська','uk'],['Русский','ru'],['English','en'],['Gaeilge','ga'],['Deutsch','de'],['Italiano','it'],['Español','es'],['Português','pt'],['Français','fr'],['Türkçe','tr'],['Nederlands','nl'],['Polski','pl'],['中文','zh'],['日本語','ja'],['한국어','ko'],['Română','ro'],['Svenska','sv'],['Язык не определён','und']];
    const CATS=[
       ['Рабочие','✓','Проверенные потоки'],
       ['Украинские','UA','Українські телеканали'],
       ['Ирландские','IE','Телеканалы Ирландии'],
       ['Киноканалы','▶','Кино по расписанию / эфир'],
       ['Сериальные каналы','S','Сериалы в эфире'],
       ['Детские','K','Мультфильмы и детское ТВ'],
       ['Спорт','S','Спортивные трансляции'],
       ['Новости','N','Информационные каналы'],
       ['Музыка','♫','Музыкальное телевидение'],
       ['Познавательные','D','Документальное кино'],
       ['Развлечения','TV','Шоу и развлечения'],
       ['Все','≡','Полный каталог'],
       ['Общие','○','Другие каналы']
    ];
    function add(text,sub,fn){
        let div=$('<div class="selector wazotv-item"></div>');
        div.append($('<div style="font-weight:650"></div>').text(text));
        if(sub)div.append($('<div class="wazotv-detail"></div>').text(sub));
        div.on('hover:enter',fn).on('hover:focus',function(e){
            activeRow=e.target;scroll.update(div,true);
        });list.append(div);return div;
    }
    function section(text) {
        list.append($('<div class="wazotv-section"></div>').text(text));
    }
    function tile(text,short,caption,fn,parent) {
        const el=$('<div class="selector wazotv-tile"></div>');
        el.append($('<div class="wazotv-tile-symbol"></div>').text(short));
        const title=$('<div></div>').append(
            $('<div class="wazotv-tile-title"></div>').text(text),
            $('<div class="wazotv-tile-sub"></div>').text(caption)
        );
        el.append(title);
        el.on('hover:enter',fn).on('hover:focus',function(e) {
            activeRow=e.target;scroll.update(el,true);
        });
        parent.append(el);
        return el;
    }
    function metrics(items){
        const bar=$('<div class="wazotv-dashboard"></div>');
        items.forEach(item=>bar.append(
            $('<div class="wazotv-stat"></div>').append(
                $('<div class="wazotv-stat-num"></div>').text(item[0]),
                $('<div class="wazotv-stat-label"></div>').text(item[1])
            )
        ));
        list.append(bar);
    }
    function channelRow(item,action){
        const verified=Number(item.verified_streams||0);
        const wrap=add('',null,action).addClass('wazotv-ch-row');
        wrap.empty();
        const logo=$('<div class="wazotv-ch-logo"></div>').text('TV');
        if(item.logo && (item.logo.startsWith('https://') || item.logo.startsWith('http://'))) {
            logo.empty().append($('<img alt="">').attr('src',item.logo).on('error',function(){
                $(this).remove();logo.text('TV');
            }));
        }
        const meta=$('<div style="flex:1;min-width:0"></div>');
        meta.append($('<div class="wazotv-ch-title"></div>').text(item.name));
        meta.append($('<div class="wazotv-detail"></div>').text([
           item.country==='XX'?'':item.country,
           item.language==='und'?'':item.language,
           item.category,
           item.alternatives+' источн.'
        ].filter(Boolean).join(' • ')));
        const badge=$('<div class="wazotv-ch-mark"></div>')
          .text(verified>0?'● проверено':'○ не проверено');
        if(verified>0)badge.addClass('wazotv-ch-mark--ok');
        wrap.append(logo,meta,badge);
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
    async function home(){
        if(!token())return pairing();
        clear('Независимый каталог телеканалов WAZO TV');
        metrics([['ТВ 24/7','Линейное телевидение'],['HD / 4K','Качество зависит от трансляции'],
                 ['AUTO','Резервные источники']]);
        section('Эфирное телевидение');
        const grid=$('<div class="wazotv-grid"></div>');list.append(grid);
        CATS.forEach(c=>tile(c[0],c[1],c[2],()=>{
            cat=c[0];page=0;query='';onlyWorking=c[0]==='Рабочие';channels();
        },grid));
        section('Поиск и фильтры');
        add('Поиск телеканала','Название, регион или язык',()=>{
            cat='Все';input('Поиск телеканала',query,v=>{query=v;page=0;channels();});
        }).addClass('wazotv-filter');
        add('Язык: '+(LANGS.find(x=>x[1]===lang)||LANGS[0])[0],
            'Все языки / украинский / русский / английский и другие',()=>chooseLanguage(home));
        add('Статус подписки','Управление устройствами через @Wazo4KBot',async()=>{
            try{const v=await req('/v1/me');note('Подписка до '+new Date(v.subscription_expires_at||v.expires_at).toLocaleString());}
            catch(e){fail(e);}
        });
        try{
            const summary=await req('/v1/tv/summary');
            status.text('Каталог: '+summary.total.channels+' каналов / '+summary.total.streams+
                ' потоков / '+summary.total.alternatives+' каналов с запасными вариантами');
        }catch(e){status.text('Каталог доступен после подключения к серверу');}
        section('Устройство');
        add('Сброс привязки на этом телевизоре','Не влияет на другие устройства',()=>{
            L.Select.show({title:'Удалить доступ на этом телевизоре?',
                items:[{title:'Отмена',value:'no'},{title:'Удалить',value:'yes'}],
                onSelect:x=>{if(x.value==='yes'){L.Storage.set(TOKEN_KEY,'');pairing();}},onBack:()=>{}});
        });
    }
    async function channels(){
        clear(cat+' · '+(LANGS.find(x=>x[1]===lang)||LANGS[0])[0]+' · стр. '+(page+1));
        add('← Категории WAZO TV','Вернуться на главный экран',home);
        add('Только проверенные: '+(onlyWorking?'ДА':'НЕТ'),
            onlyWorking?'Показываются только потоки после успешной проверки':'Также включены непроверенные адреса',
            ()=>{onlyWorking=!onlyWorking;page=0;channels();}).addClass('wazotv-filter');
        add('Выбрать язык','Сейчас '+(LANGS.find(x=>x[1]===lang)||LANGS[0])[0],()=>chooseLanguage(channels));
        add('Поиск: '+(query||'все каналы'),'Введите название',()=>{
            input('Название телеканала',query,v=>{query=v;page=0;channels();});
        });
        section(cat+' · список');
        try{
            const path='/v1/tv/channels?'+new URLSearchParams({
                category:cat,language:lang,q:query,working_only:String(onlyWorking),
                limit:'60',offset:String(page*60)
            });
            const result=await req(path);
            status.text('Раздел '+cat+' · найдено '+result.count+' · страница '+(page+1));
            if(!result.items.length)
                add('Пока нет подтверждённых каналов',
                    'Отключите фильтр «Только проверенные» для просмотра всего каталога',
                    ()=>{onlyWorking=false;page=0;channels();});
            result.items.forEach(item=>channelRow(item,()=>showChannel(item)));
            if((page+1)*60<result.count)add('Далее →','Следующие 60 каналов',()=>{page++;channels();});
            if(page>0)add('← Назад','Предыдущие 60 каналов',()=>{page--;channels();});
        }catch(err){fail(err);add('Повторить запрос','',channels);}
    }
    async function showChannel(item){
        clear(item.name+' · выбор видеоисточника');
        add('← К списку каналов','',channels);
        add('▶ Воспроизвести канал','Автоматический выбор более надёжного источника',()=>play(item.id));
        try{
            const d=await req('/v1/tv/channels/'+item.id+'/streams');
            if(!d.streams.length)note('Нет доступных ссылок');
            d.streams.forEach(s=>{
                const mark=s.healthy===true?'● проверено':s.healthy===false?'○ ошибка':'· не проверено';
                add(s.source_name+' · '+s.quality_hint,mark+' · '+(s.kind==='ace'?'AceStream / P2P':'HTTP / HLS'),
                    ()=>play(item.id,s.id));
            });
        }catch(e){fail(e);}
    }
    async function play(channelId,streamId){
        try{
            await beginPlayback(channelId,streamId);
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
    monitorPlayback();
    try{L.Menu.addButton(icon,'WAZO TV • Эфир',open);}
    catch(e){let el=$('<li class="menu__item selector"><div class="menu__text">WAZO TV</div></li>');el.on('hover:enter',open);$('.menu .menu__list').first().append(el);}
    decorate();
    const mo=new MutationObserver(()=>decorate());
    mo.observe(document.body,{childList:true,subtree:true});
}
// Some CUB builds do not set window.appready; register when the APIs are present.
if(L.Component && L.Menu && document.body)init();
else L.Listener.follow('app',function(e){if(e.type==='ready')init();});
})();