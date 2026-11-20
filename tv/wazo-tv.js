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
function streamError(s){
    const status=Number(s.last_http_status||0);
    if(status>=400)return 'HTTP '+status;
    const messages={invalid_hls:'Неверный HLS',html_response:'HTML вместо видео',
        empty_body:'Пустой ответ',network_error:'Ошибка сети',
        url_blocked:'Заблокирован адрес',unexpected_status:'Ошибка ответа'};
    return messages[s.http_failure_reason]||'';
}
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
let guideChannelIds=[]; // current visible, verified TV page, not all catalog entries
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
        const current={id:Number(state.channelId),title:d.title,url:d.url};
        let list=(state.channelPlaylist||[]).map(x=>({
            id:Number(x.id),title:String(x.title||'TV'),url:String(x.url||'')
        })).filter(x=>/^https?:\/\//.test(x.url));
        const matched=list.findIndex(x=>x.id===current.id);
        if(matched>=0)list[matched]=current;
        else list.unshift(current);
        const playerItem={
            url:d.url,title:d.title,source:'Wazo TV · '+d.source,
            iptv:true,need_check_live_stream:true
        };
        // Lampa's Android TV wrapper passes >1 entries to ViMu as 'asusfilelist'.
        // Without this ViMu cannot know the next/previous channel.
        if(list.length>1)playerItem.playlist=list.map(x=>({title:x.title,url:x.url}));
        L.Player.play(playerItem);
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
    const candidates=d.streams.filter(s=>!s.manual_status && (s.kind==='http'||s.kind==='ace'));
    if(!candidates.length)throw Error('Нет доступных видеоисточников');
    if(preferredStreamId)candidates.sort((a,b)=>Number(b.id===preferredStreamId)-Number(a.id===preferredStreamId));
    let channelPlaylist=[];
    const ids=guideChannelIds.includes(Number(channelId))
        ?guideChannelIds.slice(0,36):[Number(channelId)];
    if(ids.length>1){
        try{
            const result=await req('/v1/tv/playlist?ids='+encodeURIComponent(ids.join(',')));
            channelPlaylist=Array.isArray(result.items)?result.items:[];
        }catch(_){
            // Failure of the batch request must never break single-channel playback.
            channelPlaylist=[];
        }
    }
    playing={channelId,candidates:candidates.slice(0,8),switching:false,lastSource:'',channelPlaylist};
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
            cat=c[0];page=0;query='';onlyWorking=true;channels();
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
                const fault=streamError(s);
                const mark=s.manual_status?'✕ недоступно: '+(s.manual_note||s.manual_status):fault?'△ '+fault:
                    (s.video_ok===true?'● декодирован видеокадр'+(s.audio_present===false?' · аудиодорожки нет':''):
                     s.video_ok===false?'△ видеокадр не получен':
                     s.healthy===true?'◐ HTTP доступен, видео не проверено':s.healthy===false?'○ ошибка':'· не проверено');
                const actual=s.video_width&&s.video_height?s.video_width+'×'+s.video_height:s.quality_hint;
                add(s.source_name+' · '+actual,mark+' · '+(s.kind==='ace'?'AceStream / P2P':'HTTP / HLS'),
                    ()=>s.manual_status?note('Источник отмечен как недоступный в этом регионе'):play(item.id,s.id));
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
/* WAZO TV Guide — TV remote friendly, Lumio-inspired sidebar, live EPG and optional muted HLS preview. */
function GuidePanel(){
    const self=this;
    const GUIDE_CSS=[
'.wazog-root{padding:.3em 1.6% 1.2em;color:#eaf3fd;font-family:inherit}',
'.wazog-hero{display:flex;align-items:center;gap:.85em;margin:.15em 0 1em;padding:.55em .8em;border-bottom:1px solid #2f4963}',
'.wazog-hero img{width:2.3em;height:2.3em;object-fit:contain}',
'.wazog-hero-title{font-size:1.65em;font-weight:800;letter-spacing:.03em}',
'.wazog-muted{font-size:.8em;color:#9fb5ca}',
'.wazog-shell{display:grid;grid-template-columns:18% 38% minmax(0,1fr);gap:.8em;height:calc(100vh - 9em);min-height:27em}',
'.wazog-panel{border-radius:.8em;background:#141d2b;border:1px solid #26374c;min-width:0;overflow:hidden}',
'.wazog-cat-panel{display:flex;flex-direction:column;padding:.45em}',
'.wazog-categories{overflow:auto;flex:1;min-height:0}',
'.wazog-cat{display:flex;align-items:center;gap:.6em;border:1px solid transparent;border-radius:.65em;padding:.75em .8em;margin:.2em 0;background:#1e2938;min-height:2em}',
'.wazog-cat.active{background:#153e57;color:#91e8fc;border-color:#2a8caa}',
'.wazog-cat.focus,.wazog-cat:focus{background:#286b82!important;border-color:#9ef7ff!important}',
'.wazog-cat-symbol{font-size:1.05em;min-width:1.6em;text-align:center;color:#71c7df;font-weight:750}',
'.wazog-cat-name{flex:1;font-size:.9em}',
'.wazog-cat-amount{color:#91b1c4;font-size:.7em}',
'.wazog-mid{display:flex;flex-direction:column;padding:.55em}',
'.wazog-tools{display:flex;gap:.35em;padding:0 0 .55em;flex-wrap:wrap;border-bottom:1px solid #2a394a}',
'.wazog-tool{font-size:.83em;background:#223348;border-radius:.48em;padding:.47em .65em;white-space:nowrap}',
'.wazog-tool.focus,.wazog-tool:focus{background:#267c9b!important}',
'.wazog-stat{font-size:.8em;color:#9fbed1;padding:.55em .3em}',
'.wazog-rows{overflow:auto;min-height:0;flex:1;scroll-behavior:smooth;padding-right:.14em}',
'.wazog-row{display:flex;align-items:center;gap:.72em;background:#202b39;border:1px solid transparent;border-radius:.62em;padding:.52em .55em;margin:.19em 0;min-height:3.3em}',
'.wazog-row.chosen{border-color:#287c9a;background:#193b54}',
'.wazog-row.focus,.wazog-row:focus{background:#276886!important;border-color:#90f5ff!important}',
'.wazog-logo{flex:0 0 3.4em;width:3.4em;height:2.7em;border-radius:.52em;background:#122233;display:flex;align-items:center;justify-content:center;color:#6dd4ef;font-size:.9em;font-weight:800;overflow:hidden}',
'.wazog-logo img{max-width:92%;max-height:92%;object-fit:contain}',
'.wazog-logo--fallback{background:linear-gradient(135deg,#286e91,#173c6f);border:1px solid #4fc4db}',
'.wazog-monogram{font-size:1.1em;font-weight:900;color:#d8fbff;letter-spacing:-.06em}',
'.wazog-row-fav{font-size:1em;color:#ffcf5e;margin-right:.18em}',
'.wazog-row-name{font-size:.94em;font-weight:700;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}',
'.wazog-row-programme{font-size:.72em;color:#abc1d0;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;margin-top:.16em}',
'.wazog-row-flag{font-size:.68em;color:#70dfac;flex:0 0 auto}',
'.wazog-row-flag--http{color:#f6cd7a}',
'.wazog-row-flag--unknown{color:#8594ac}',
'.wazog-progress{height:2px;background:#31516a;margin-top:.32em;position:relative}',
'.wazog-progress>span{position:absolute;top:0;left:0;bottom:0;background:#6be0e7}',
'.wazog-pager{display:flex;gap:.5em;padding:.4em 0 0;border-top:1px solid #293a4b}',
'.wazog-right{padding:.7em;overflow:auto}',
'.wazog-preview{width:100%;height:clamp(14em,40vh,28em);aspect-ratio:16/9;border-radius:.65em;background:linear-gradient(145deg,#091b2e,#153955,#24315b);border:1px solid #355777;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;box-sizing:border-box}',
'.wazog-preview video{position:absolute;width:100%;height:100%;object-fit:contain;top:0;left:0;background:#000}',
'.wazog-preview .wazog-frame{position:absolute;z-index:2;inset:0;width:100%;height:100%;object-fit:contain;background:#091826;display:none}',
'.wazog-preview .wazog-live{z-index:4}',
'.wazog-preview .wazog-placeholder{z-index:3}',
'.wazog-placeholder{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:.5em;padding:1.5em;background:linear-gradient(160deg,rgba(8,25,42,.7),rgba(28,49,78,.88))}',
'.wazog-placeholder-logo{font-size:2.9em;font-weight:900;color:#8eeefa;line-height:1.1}',
'.wazog-placeholder-text{font-size:.85em;color:#bcd8e8}',
'.wazog-live{position:absolute;right:.6em;top:.6em;padding:.25em .5em;border-radius:.32em;background:rgba(5,20,32,.8);font-size:.68em;color:#a8dce5}',
'.wazog-detail-name{font-size:1.5em;font-weight:780;margin:.85em .2em .1em;line-height:1.25}',
'.wazog-detail-meta{font-size:.8em;color:#9fb6c9;margin:0 .3em .7em}',
'.wazog-buttons{display:grid;grid-template-columns:1fr 1fr;gap:.4em;margin:.55em 0 .95em}',
'.wazog-btn{border-radius:.5em;background:#244260;padding:.65em .35em;text-align:center;font-size:.82em;font-weight:650}',
'.wazog-btn.primary{background:linear-gradient(110deg,#127f9a,#2153a5);color:#fff}',
'.wazog-btn.focus,.wazog-btn:focus{background:#3085b0!important;outline:2px solid #91f6fd}',
'.wazog-epg-head{font-size:1.05em;font-weight:750;margin:.4em 0 .35em;color:#8be6ef}',
'.wazog-epg-line{padding:.53em .28em;border-bottom:1px solid #26384e}',
'.wazog-epg-time{font-size:.75em;color:#7fdbe5;margin-bottom:.2em}',
'.wazog-epg-title{font-size:.87em;line-height:1.25}',
'.wazog-epg-desc{font-size:.7em;color:#95acbd;margin-top:.25em;line-height:1.3}',
'@media(max-width:1100px){.wazog-shell{grid-template-columns:18% 38% minmax(0,1fr)}.wazog-preview{height:clamp(13em,34vh,23em)}.wazog-cat{padding:.5em}.wazog-right{padding:.45em}}',
'@media(max-width:750px){.wazog-shell{grid-template-columns:25% 1fr;min-height:25em;height:auto}.wazog-right{grid-column:1 / -1}.wazog-preview{height:auto;min-height:14em;aspect-ratio:16/9}}'
    ].join('');
    if(!document.getElementById('wazog-style')){
        $('<style id="wazog-style"></style>').text(GUIDE_CSS).appendTo('head');
    }
    const root=$('<div class="wazog-root"></div>');
    const head=$('<div class="wazog-hero"></div>');
    head.append($(icon).css({width:'2.6em',height:'2.6em'}));
    head.append($('<div></div>').append(
        $('<div class="wazog-hero-title"></div>').text('WAZO TV'),
        $('<div class="wazog-muted"></div>').text('Прямой эфир · Программа передач · Украина · Ирландия')
    ));
    const layout=$('<div class="wazog-shell"></div>');
    const left=$('<div class="wazog-panel wazog-cat-panel"></div>');
    const rail=$('<div class="wazog-categories"></div>');
    left.append(rail);
    const middle=$('<div class="wazog-panel wazog-mid"></div>');
    const tools=$('<div class="wazog-tools"></div>');
    const stat=$('<div class="wazog-stat"></div>').text('Загрузка каналов...');
    const rows=$('<div class="wazog-rows"></div>');
    const pager=$('<div class="wazog-pager"></div>');
    middle.append(tools,stat,rows,pager);
    const right=$('<div class="wazog-panel wazog-right"></div>');
    const frame=$('<div class="wazog-preview"></div>');
    const video=$('<video playsinline webkit-playsinline muted autoplay preload="none"></video>')[0];
    let audioEnabled=false; // never surprise the user with autoplay sound
    video.muted=true;
    video.setAttribute('muted','');
    video.volume=0;
    const snapshot=$('<img class="wazog-frame" alt="Предпросмотр эфира">')[0];
    const overlay=$('<div class="wazog-placeholder"></div>');
    const overLogo=$('<div class="wazog-placeholder-logo"></div>').text('W');
    const overText=$('<div class="wazog-placeholder-text"></div>').text('Выберите канал');
    overlay.append(overLogo,overText);
    const live=$('<div class="wazog-live"></div>').text('ПРЕДПРОСМОТР');
    frame.append(video,snapshot,overlay,live);
    const detailName=$('<div class="wazog-detail-name"></div>').text('WAZO TV');
    const detailMeta=$('<div class="wazog-detail-meta"></div>').text('Категории и каналы — слева');
    const actions=$('<div class="wazog-buttons"></div>');
    const schedule=$('<div></div>');
    const scheduleHead=$('<div class="wazog-epg-head"></div>').text('Программа передач');
    schedule.append(scheduleHead);
    right.append(frame,detailName,detailMeta,actions,schedule);
    layout.append(left,middle,right);root.append(head,layout);
    const cats=[
        ['Рабочие','✓'],['Избранное','★'],['Украинские','UA'],['Ирландские','IE'],
        ['Киноканалы','▶'],['Сериальные каналы','S'],['Детские','K'],
        ['Новости','N'],['Спорт','S'],['Музыка','♫'],
        ['Познавательные','D'],['Развлечения','TV'],['Все','≡'],['Общие','○']
    ];
    let category=String(L.Storage.get('wazog-category','Рабочие')||'Рабочие');
    if(!cats.some(x=>x[0]===category))category='Рабочие';
    let page=0,search='',onlyWorking=true,language='all',myList='';
    const LIST_KEY='wazog-lists';
    function getLists(){
        let ls=L.Storage.get(LIST_KEY,{})||{};
        if(typeof ls!=='object'||Array.isArray(ls))ls={};
        const old=L.Storage.get('wazog-favorites',[])||[];
        if(!Array.isArray(ls['Избранное']))ls['Избранное']=Array.isArray(old)?old:[];
        if(!Array.isArray(ls['Мой список']))ls['Мой список']=[];
        if(!Array.isArray(ls['Смотреть позже']))ls['Смотреть позже']=[];
        Object.keys(ls).forEach(k=>{
            ls[k]=Array.isArray(ls[k])?Array.from(new Set(ls[k].map(Number).filter(Number.isInteger))):[];
        });
        return ls;
    }
    function saveLists(ls){
        L.Storage.set(LIST_KEY,ls);
        L.Storage.set('wazog-favorites',ls['Избранное']||[]);
    }
    function listIds(name){return getLists()[name]||[];}
    function isFavourite(id){return listIds('Избранное').includes(Number(id));}
    function toggleSaved(name,id){
        const lists=getLists(),val=Number(id);
        if(!lists[name])lists[name]=[];
        if(lists[name].includes(val))lists[name]=lists[name].filter(x=>x!==val);
        else lists[name].push(val);
        saveLists(lists);
        const saved=lists[name].includes(val);
        note(saved?'Добавлено: '+name:'Удалено из списка: '+name);
        if(name==='Избранное'){
            const row=rowNodes.get(val);
            if(row){
                row.find('.wazog-row-fav').remove();
                if(saved)row.find('.wazog-row-flag').before($('<div class="wazog-row-fav"></div>').text('★'));
            }
            if(selected && Number(selected.id)===val){
                actions.find('.wazog-btn').eq(3).text(saved?'★ Убрать':'☆ Избранное');
            }
        }
        if(myList===name && !saved)load();
    }
    function createNamedList(callback){
        input('Название списка каналов','',function(name){
            name=String(name||'').trim().slice(0,32);
            if(!name){note('Укажите название списка');return;}
            const lists=getLists();
            if(!Object.prototype.hasOwnProperty.call(lists,name))lists[name]=[];
            saveLists(lists);
            if(callback)callback(name);
        });
    }
    function chooseListToSave(item){
        const lists=getLists();
        const items=Object.keys(lists).map(name=>({
            title:(lists[name].includes(Number(item.id))?'✓ ':'+ ')+name+' · '+lists[name].length,
            value:name
        }));
        items.push({title:'+ Новый список',value:'__create'});
        L.Select.show({title:'Добавить канал в список',items,onSelect:x=>{
            if(x.value==='__create')createNamedList(name=>toggleSaved(name,item.id));
            else toggleSaved(x.value,item.id);
            try{L.Controller.toggle('content');}catch(_){}
        },onBack:()=>{try{L.Controller.toggle('content');}catch(_){}}});
    }
    function showMyLists(){
        const lists=getLists();
        const items=Object.keys(lists).map(name=>({title:name+' ('+lists[name].length+')',value:name}));
        items.push({title:'+ Новый список',value:'__create'});
        L.Select.show({title:'Мои списки телеканалов',items,onSelect:x=>{
            if(x.value==='__create')createNamedList(name=>openMyList(name));
            else openMyList(x.value);
            try{L.Controller.toggle('content');}catch(_){}
        },onBack:()=>{try{L.Controller.toggle('content');}catch(_){}}});
    }
    function openMyList(name){
        myList=name;category='Все';search='';onlyWorking=false;language='all';page=0;load();
        restoreToolFocus('mine');
    }
    function channelMonogram(name){
        const raw=String(name||'TV').replace(/\([^)]*\)|\[[^\]]*\]/g,'').trim();
        const words=raw.split(/\s+/).filter(Boolean);
        if(!words.length)return 'TV';
        if(/^\d/.test(words[0]))return words[0].slice(0,3).toUpperCase();
        return (words.length>1?words.slice(0,2).map(x=>x[0]).join(''):words[0].slice(0,3)).toUpperCase();
    }
    let selected=null,marked=null,focused=null;
    let generation=0,selectionVersion=0,previewTimer=null,hls=null,previewActive=false;
    let frameTimer=null,frameObjectURL=null,frameBusy=false,frameSeq=0;
    let epg={},channelItems=[],rowNodes=new Map(), counts={};
    let destroyed=false;
    const time=t=>{try{return new Date(t).toLocaleTimeString('en-IE',{hour:'2-digit',minute:'2-digit',hour12:false});}catch(_){return '';}};
    const nowProgramme=items=>(items||[]).find(p=>new Date(p.start)<=new Date() && new Date(p.end)>new Date());
    const stateText=message=>{overText.text(message);overlay.show();live.text('ПРЕДПРОСМОТР');};
    function togglePreviewAudio(){
        audioEnabled=!audioEnabled;
        video.muted=!audioEnabled;
        video.volume=audioEnabled?1:0;
        if(audioEnabled)video.removeAttribute('muted');
        else video.setAttribute('muted','');
        const button=actions.find('.wazog-btn').filter((_,x)=>x.textContent.includes('Звук'));
        button.text(audioEnabled?'♫ Звук: вкл.':'♫ Звук: выкл.');
        if(audioEnabled && !hls)note('Показываются кадры без аудио. Для звука откройте полный плеер.');
        else if(audioEnabled){video.play().catch(()=>note('Аудио недоступно в предпросмотре'));}
        else note('Звук предпросмотра выключен');
    }
    function clearFrames(){
        if(frameTimer){clearInterval(frameTimer);frameTimer=null;}
        frameSeq++;frameBusy=false;
        snapshot.style.display='none';
        snapshot.removeAttribute('src');
        if(frameObjectURL){URL.revokeObjectURL(frameObjectURL);frameObjectURL=null;}
    }
    async function refreshFrame(sid,version,seq){
        if(frameBusy||destroyed||version!==selectionVersion||seq!==frameSeq||previewSessionId!==sid)return;
        frameBusy=true;
        try{
            const response=await fetch(url()+'/v1/tv/preview/'+encodeURIComponent(sid)+'/frame.jpg',{
                headers:{Authorization:'Bearer '+token()},cache:'no-store'
            });
            if(!response.ok)throw Error('Video frame unavailable');
            const blob=await response.blob();
            if(blob.size<800)throw Error('Blank frame');
            const object=URL.createObjectURL(blob);
            const img=new Image();
            img.onload=()=>{
                if(destroyed||version!==selectionVersion||seq!==frameSeq||previewSessionId!==sid){
                    URL.revokeObjectURL(object);return;
                }
                snapshot.src=object;
                snapshot.style.display='block';
                if(frameObjectURL)URL.revokeObjectURL(frameObjectURL);
                frameObjectURL=object;
                previewActive=true;overlay.hide();
                live.text('● КАДРЫ ЭФИРА');
            };
            img.onerror=()=>URL.revokeObjectURL(object);
            img.src=object;
        }catch(_){if(!previewActive)stateText('Получаю кадры телеканала…');}
        finally{frameBusy=false;}
    }
    function beginFramePreview(sid,version){
        clearFrames();
        const seq=frameSeq;
        refreshFrame(sid,version,seq);
        frameTimer=setInterval(()=>refreshFrame(sid,version,seq),1550);
    }
    function stopPreview(){
        clearFrames();
        if(typeof releasePreviewSession==='function')releasePreviewSession();
        if(previewTimer){clearTimeout(previewTimer);previewTimer=null;}
        if(hls){try{hls.destroy();}catch(_){} hls=null;}
        try{video.pause();video.removeAttribute('src');video.load();}catch(_){}
        previewActive=false;overlay.show();
    }
    function focusable(el,fn,onfocus){
        el.addClass('selector').on('hover:enter',fn);
        el.on('hover:focus',function(){
            focused=this;
            try{this.scrollIntoView({block:'nearest',inline:'nearest'});}catch(_){}
            if(onfocus)onfocus();
        });
        return el;
    }
    function currentFocus(){
        // Lampa keeps navigation state in Navigator, not the browser's activeElement.
        const native = root.find('.focus.selector').last().get(0);
        return native || (focused && root[0].contains(focused) ? focused : root.find('.wazog-cat.active').get(0));
    }
    function setGuideFocus(node){
        if(!node || !root[0].contains(node))return false;
        try{
            L.Controller.collectionSet(root);
            if(window.Navigator && typeof Navigator.focus==='function'){
                Navigator.focus(node);
            }else{
                L.Controller.collectionFocus($(node),root);
            }
            focused=node;
            if(node.scrollIntoView)node.scrollIntoView({block:'nearest',inline:'nearest'});
            return true;
        }catch(err){
            try{L.Controller.collectionFocus($(node),root);focused=node;return true;}catch(_){return false;}
        }
    }
    function restoreToolFocus(key){
        // Select/Input tears down its own controller after the callback. Restore focus
        // once the popup is gone, not during its teardown.
        setTimeout(()=>{
            if(destroyed || !root[0].isConnected)return;
            const node=tools.find('.wazog-tool').filter((_,el)=>el.getAttribute('data-wazo-tool')===key).get(0);
            if(node)setGuideFocus(node);
        },90);
    }
    function guideMove(direction){
        const current=currentFocus();
        const cat=root.find('.wazog-cat.selector').toArray();
        const row=root.find('.wazog-row.selector').toArray();
        const tool=root.find('.wazog-tool.selector').toArray();
        const buttons=root.find('.wazog-btn.selector').toArray();
        const inGroup=group=>group.includes(current);
        const selectedRow=()=>row.find(el=>Number($(el).attr('data-channel-id'))===Number(selected?.id)) || row[0];
        let target=null;
        if(direction==='right'){
            if(inGroup(cat))target=selectedRow() || tool[0];
            else if(inGroup(tool))target=tool[tool.indexOf(current)+1] || buttons[0];
            else if(inGroup(row))target=buttons[0];
            else if(inGroup(buttons))target=buttons[Math.min(buttons.length-1,buttons.indexOf(current)+1)];
        }else if(direction==='left'){
            if(inGroup(tool))target=tool[tool.indexOf(current)-1] || cat.find(el=>el.classList.contains('active')) || cat[0];
            else if(inGroup(buttons))target=selectedRow() || row[0];
            else if(inGroup(row))target=cat.find(el=>el.classList.contains('active')) || cat[0];
        }else if(direction==='up'||direction==='down'){
            const delta=direction==='down'?1:-1;
            if(inGroup(tool) && direction==='down')target=selectedRow() || row[0];
            const group=inGroup(cat)?cat:inGroup(row)?row:inGroup(buttons)?buttons:[];
            if(group.length){
                const idx=group.indexOf(current);
                const next=idx+delta;
                if(next>=0 && next<group.length)target=group[next];
                else if(inGroup(row)&&next<0)target=tool[0];
                else if(inGroup(tool)&&next>=group.length)target=row[0];
            }
        }
        if(target && setGuideFocus(target))return;
        // Never let a missing right-hand target unexpectedly open the Lampa main menu.
        if(direction==='up' && window.Navigator && Navigator.canmove('up'))Navigator.move('up');
        if(direction==='down' && window.Navigator && Navigator.canmove('down'))Navigator.move('down');
    }
    function refreshController(){
        L.Controller.collectionSet(root);
        if(!setGuideFocus(currentFocus())){
            const start=root.find('.wazog-cat.active').get(0);
            if(start)setGuideFocus(start);
        }
    }
    function addButton(text,fn,primary){
        const el=focusable($('<div class="wazog-btn"></div>').toggleClass('primary',!!primary).text(text),fn);
        actions.append(el);return el;
    }
    function renderSchedule(item){
        schedule.empty().append(scheduleHead);
        const programmes=epg[String(item.id)]||[];
        if(!programmes.length){
            schedule.append($('<div class="wazog-muted"></div>').text('Нет EPG для этого канала. Попробуйте позже.'));
            return;
        }
        const current=nowProgramme(programmes);
        if(current){
            const line=$('<div class="wazog-epg-line"></div>');
            line.append($('<div class="wazog-epg-time"></div>').text('СЕЙЧАС · '+time(current.start)+'–'+time(current.end)));
            line.append($('<div class="wazog-epg-title"></div>').text(current.title));
            if(current.description)line.append($('<div class="wazog-epg-desc"></div>').text(current.description.substring(0,185)));
            schedule.append(line);
        }
        programmes.filter(p=>p!==current).slice(0,6).forEach(function(p){
            schedule.append($('<div class="wazog-epg-line"></div>').append(
                $('<div class="wazog-epg-time"></div>').text(time(p.start)+'–'+time(p.end)),
                $('<div class="wazog-epg-title"></div>').text(p.title)));
        });
    }
    function updateRowEpg(item){
        const row=rowNodes.get(item.id);
        if(!row)return;
        const programme=nowProgramme(epg[String(item.id)]);
        row.find('.wazog-row-programme').text(programme?'Сейчас: '+programme.title:'Программа передач не найдена');
        const bar=row.find('.wazog-progress span');
        if(programme){
            const start=new Date(programme.start).getTime(),end=new Date(programme.end).getTime();
            const percent=Math.max(0,Math.min(100,100*(Date.now()-start)/Math.max(1,end-start)));
            bar.css('width',percent+'%');
        }else bar.css('width','0');
    }
    async function loadHls(){
        if(window.Hls)return window.Hls;
        if(window.WazoGuideHlsPromise)return window.WazoGuideHlsPromise;
        window.WazoGuideHlsPromise=new Promise(function(resolve){
            const script=document.createElement('script');
            script.src=url()+'/hls.min.js';
            script.onload=()=>resolve(window.Hls||null);
            script.onerror=()=>resolve(null);
            document.head.appendChild(script);
        });
        return window.WazoGuideHlsPromise;
    }
    let previewSessionId=null;
    function releasePreviewSession(){
        const sid=previewSessionId;
        previewSessionId=null;
        if(sid)req('/v1/tv/preview/'+encodeURIComponent(sid)+'/stop','POST',{}).catch(()=>{});
    }
    async function serverPreview(item,version,library){
        if(destroyed||version!==selectionVersion)return;
        stopPreview();
        stateText('Включаю серверный предпросмотр до 480p…');
        try{
            // No URL accepted from the client: backend selects a vetted catalogue entry.
            const session=await req('/v1/tv/channels/'+item.id+'/preview/start','POST',{});
            const sid=String(session.playlist||'').split('/')[4];
            if(destroyed||version!==selectionVersion||!sid){
                if(sid)req('/v1/tv/preview/'+sid+'/stop','POST',{}).catch(()=>{});
                return;
            }
            previewSessionId=sid;
            const remote=url()+session.playlist;
            // JPEG frames always work in Fire TV WebView even when its video
            // surface is black. HLS is optional: audio only when supported.
            if(library && library.isSupported && library.isSupported()){
                try{
                    hls=new library({
                        enableWorker:true,maxBufferLength:6,maxMaxBufferLength:12,
                        liveSyncDurationCount:2,
                        xhrSetup:function(xhr){xhr.setRequestHeader('Authorization','Bearer '+token());}
                    });
                    hls.on(library.Events.MEDIA_ATTACHED,()=>{
                        if(version===selectionVersion)hls.loadSource(remote);
                    });
                    hls.on(library.Events.MANIFEST_PARSED,()=>{
                        if(version===selectionVersion)video.play().catch(()=>{});
                    });
                    hls.on(library.Events.ERROR,(_ev,detail)=>{
                        if(version===selectionVersion && detail && detail.fatal){
                            // Do not kill the working still-frame preview.
                            try{hls.destroy();}catch(_){}
                            hls=null;video.pause();
                        }
                    });
                    hls.attachMedia(video);
                    video.muted=!audioEnabled;
                    video.volume=audioEnabled?1:0;
                }catch(_){hls=null;}
            }
            beginFramePreview(sid,version);
            stateText('Получаю видеокадры с сервера…');
        }catch(e){
            if(version===selectionVersion){
                const text=String(e.message||e);
                stateText('Предпросмотр недоступен: '+text.slice(0,105));
            }
        }
    }
    async function startPreview(item,version){
        if(destroyed || version!==selectionVersion || !selected || selected.id!==item.id)return;
        stopPreview();
        stateText('Проверяю видеопоток…');
        if(Number(item.verified_streams||0)<1){
            stateText('Источник ещё не проверен. Попробуйте полный плеер.');
            return;
        }
        let library=null;
        try{library=await loadHls();}catch(_){}
        if(destroyed||version!==selectionVersion)return;
        return serverPreview(item,version,library);
    }
    video.addEventListener('playing',()=>{
        // Fire TV WebView can fire 'playing' while its video plane is black.
        // The LIVE badge requires an actual decoded JPEG frame in server preview.
        if(destroyed||previewSessionId)return;
        let decoded=0;
        try{decoded=video.getVideoPlaybackQuality()?.totalVideoFrames||0;}catch(_){}
        if(decoded>=3&&video.videoWidth>0&&video.readyState>=3){
            previewActive=true;overlay.hide();
            live.text('● ВИДЕО · '+(audioEnabled?'СО ЗВУКОМ':'БЕЗ ЗВУКА'));
        }
    });
    video.addEventListener('error',()=>{if(!destroyed){overlay.show();live.text('ПРЕДПРОСМОТР');overText.text('Для этого канала используйте полный плеер');}});
    function select(item,delayPreview=true){
        if(!item || destroyed)return;
        const changed=!selected || selected.id!==item.id;
        selected=item;
        rowNodes.forEach((node,id)=>node.toggleClass('chosen',Number(id)===Number(item.id)));
        if(changed)selectionVersion++;
        const currentVersion=selectionVersion;
        stopPreview();
        overLogo.text((item.name||'TV').substring(0,2).toUpperCase());
        detailName.text(item.name||'Телеканал');
        detailMeta.text([item.country,item.language==='und'?'':item.language,item.category,Number(item.alternatives||0)+' источников',
            Number(item.decoded_streams||0)>0?'✓ Видеокадры проверены':
            Number(item.verified_streams||0)>0?'◐ HTTP доступен, видео не подтверждено':'○ Источники не проверены'
        ].filter(Boolean).join(' · '));
        stateText('Переключите канал — покажу предпросмотр, если формат доступен');
        const rightFocus=root.find('.wazog-buttons .focus').get(0);
        const previousButton=rightFocus && currentFocus()===rightFocus ? $(rightFocus).index() : -1;
        actions.empty();
        addButton('▶ Смотреть',()=>{stopPreview();beginPlayback(item.id).catch(e=>note(e.message||String(e)));},true);
        addButton('▷ Предпросмотр',()=>startPreview(item,selectionVersion),false);
        addButton('Источники',()=>sources(item),false);
        addButton(isFavourite(item.id)?'★ Убрать':'☆ Избранное',()=>toggleSaved('Избранное',item.id));
        addButton('＋ В мой список',()=>chooseListToSave(item));
        addButton('♫ Звук: выкл.',()=>togglePreviewAudio());
        if(previousButton>=0)setGuideFocus(actions.find('.wazog-btn').eq(previousButton).get(0));
        renderSchedule(item);
        if(delayPreview){
            previewTimer=setTimeout(()=>startPreview(item,currentVersion),1900);
        }
    }
    async function sources(item){
        try{
            const result=await req('/v1/tv/channels/'+item.id+'/streams');
            const choices=result.streams.filter(s=>s.kind==='http'||s.kind==='ace').map(s=>({
                title:s.source_name+' · '+(s.video_width&&s.video_height?s.video_width+'×'+s.video_height:s.quality_hint)+
                    (s.video_ok===true?' · ✓ видео':s.video_ok===false?' · △ нет кадра':s.healthy===true?' · ◐ HTTP':' · ○ не проверен')+
                    (s.video_ok===true&&s.audio_present===false?' · нет аудиодорожки':
                     s.audio_present===true?' · аудио '+(s.audio_codec||'есть'):'')+
                    (streamError(s)?' · ⚠ '+streamError(s):''),
                streamId:s.id
            }));
            if(!choices.length){note('Источники не найдены');return;}
            L.Select.show({title:'Видеоисточники: '+item.name,items:choices,
                onSelect:chosen=>{stopPreview();beginPlayback(item.id,chosen.streamId).catch(e=>note(e.message||String(e)));},
                onBack:()=>{try{L.Controller.toggle('content');}catch(_){}}});
        }catch(e){note(e.message||String(e));}
    }
    function selectCategory(cat){
        if(cat==='Избранное'){openMyList('Избранное');return;}
        category=cat;myList='';L.Storage.set('wazog-category',cat);
        page=0;search='';renderCategories();load();
    }
    function renderCategories(){
        rail.empty();
        cats.forEach(function(c){
            const el=$('<div class="wazog-cat"></div>').toggleClass('active',myList?myList===c[0]:category===c[0]);
            el.append($('<div class="wazog-cat-symbol"></div>').text(c[1]),
                $('<div class="wazog-cat-name"></div>').text(c[0]));
            if(counts[c[0]])el.append($('<div class="wazog-cat-amount"></div>').text(counts[c[0]]));
            focusable(el,()=>selectCategory(c[0]));
            rail.append(el);
        });
        const old=focusable($('<div class="wazog-cat"></div>').append(
           $('<div class="wazog-cat-symbol"></div>').text('◫'),
           $('<div class="wazog-cat-name"></div>').text('Классический вид')),
           ()=>{stopPreview();L.Activity.push({url:'',title:'WAZO TV (классический)',component:'wazotv',page:1});});
        rail.append(old);
    }
    function renderTools(){
        const key=root.find('.wazog-tools .focus').attr('data-wazo-tool');
        tools.empty();
        function tool(id,label,fn){
            tools.append(focusable($('<div class="wazog-tool"></div>').attr('data-wazo-tool',id).text(label),fn));
        }
        tool('search','⌕ Поиск',()=>input('Найти телеканал',search,function(v){myList='';search=v;page=0;load();restoreToolFocus('search');}));
        tool('verified',onlyWorking?'✓ Проверенные':'Все источники',()=>{myList='';onlyWorking=!onlyWorking;page=0;load();restoreToolFocus('verified');});
        tool('language',language==='all'?'Языки':'Язык: '+language,()=>{
            L.Select.show({title:'Язык телеканала',items:[
                {title:'Все',value:'all'},{title:'Українська',value:'uk'},{title:'Русский',value:'ru'},
                {title:'English',value:'en'},{title:'Gaeilge',value:'ga'}
            ],onSelect:x=>{language=x.value;myList='';page=0;load();
              try{L.Controller.toggle('content');}catch(_){}
              restoreToolFocus('language');
            },onBack:()=>{try{L.Controller.toggle('content');}catch(_){}restoreToolFocus('language');}});
        });
        tool('mine',myList?'★ '+myList:'☆ Мои',()=>showMyLists());
        if(key){
            const element=tools.find('.wazog-tool').filter((_,el)=>el.getAttribute('data-wazo-tool')===key).get(0);
            if(element)setGuideFocus(element);
        }
    }
    async function load(){
        const current=++generation;
        selectionVersion++;stopPreview();selected=null;rowNodes.clear();epg={};
        rows.empty().append($('<div class="wazog-muted"></div>').text('Загружаю каналы...'));
        pager.empty();stat.text('Категория: '+category+' · обновляю каталог');
        const focusKey=root.find('.wazog-tools .focus').attr('data-wazo-tool');
        renderTools();renderCategories();
        if(focusKey){
            const el=tools.find('.wazog-tool').filter((_,v)=>v.getAttribute('data-wazo-tool')===focusKey).get(0);
            if(el)setGuideFocus(el);
        }
        try{
            const ids=myList?listIds(myList):[];
            if(myList&&!ids.length){
                rows.empty().append($('<div class="wazog-muted"></div>').text('Список пуст. Добавьте каналы кнопкой «В мой список».'));
                stat.text('Мой список: '+myList+' · 0 каналов');
                refreshController();return;
            }
            const params=new URLSearchParams({
                category:myList?'Все':category,language:language,q:search,
                working_only:String(myList?false:onlyWorking),
                limit:'36',offset:String(page*36)
            });
            if(myList)params.set('ids',ids.slice(0,200).join(','));
            const result=await req('/v1/tv/channels?'+params.toString());
            if(current!==generation||destroyed)return;
            let items=result.items||[];
            channelItems=items;
            guideChannelIds=items.filter(x=>Number(x.verified_streams||0)>0)
                .map(x=>Number(x.id)).filter(Number.isInteger);
            rows.empty();
            stat.text((myList?'Мой список: '+myList:category)+' · '+result.count+' каналов · страница '+(page+1));
            if(!items.length)rows.append($('<div class="wazog-muted"></div>').text('Нет каналов для выбранного фильтра'));
            items.forEach(function(item){
                const row=$('<div class="wazog-row"></div>');
                const logo=$('<div class="wazog-logo"></div>');
                const fallback=()=>{
                    logo.empty().addClass('wazog-logo--fallback')
                        .append($('<span class="wazog-monogram"></span>').text(channelMonogram(item.name)));
                };
                fallback();
                if(/^https?:\/\//i.test(item.logo||'')){
                    const img=$('<img alt="">').attr('src',item.logo);
                    img.on('error',fallback);
                    logo.removeClass('wazog-logo--fallback').empty().append(img);
                }
                const mid=$('<div style="flex:1;min-width:0"></div>');
                mid.append($('<div class="wazog-row-name"></div>').text(item.name),
                    $('<div class="wazog-row-programme"></div>').text('Загрузка EPG...'),
                    $('<div class="wazog-progress"><span></span></div>'));
                row.append(logo,mid);
                if(isFavourite(item.id))row.append($('<div class="wazog-row-fav"></div>').text('★'));
                row.append($('<div class="wazog-row-flag"></div>')
                    .toggleClass('wazog-row-flag--http',!Number(item.decoded_streams||0)&&Number(item.verified_streams||0)>0)
                    .toggleClass('wazog-row-flag--unknown',!Number(item.verified_streams||0))
                    .text(Number(item.decoded_streams||0)>0?'●':Number(item.verified_streams||0)>0?'◐':'○'));
                row.attr('data-channel-id',String(item.id));
                focusable(row,()=>{
                    select(item,false);
                    stopPreview();
                    beginPlayback(item.id).catch(e=>note(e.message||String(e)));
                },()=>{if(!selected||selected.id!==item.id)select(item);});
                rowNodes.set(item.id,row);rows.append(row);
            });
            if(page>0)pager.append(focusable($('<div class="wazog-tool"></div>').text('← Назад'),()=>{page--;load();}));
            if((page+1)*36<result.count)pager.append(focusable($('<div class="wazog-tool"></div>').text('Далее →'),()=>{page++;load();}));
            if(items.length)select(items[0]);
            refreshController();
            if(items.length){
                try{
                    const ids=items.map(x=>x.id).join(',');
                    const guide=await req('/v1/tv/epg?channel_ids='+encodeURIComponent(ids));
                    if(current!==generation||destroyed)return;
                    epg=guide.channels||{};
                    items.forEach(updateRowEpg);
                    if(selected)renderSchedule(selected);
                }catch(_){
                    items.forEach(updateRowEpg);
                    if(selected)renderSchedule(selected);
                }
            }
        }catch(e){
            if(current===generation){rows.empty().append($('<div class="wazog-muted"></div>').text('Не удалось получить список: '+String(e.message||e)));stat.text('Ошибка соединения с каталогом');}
        }
    }
    this.create=()=>root;
    this.render=()=>root;
    this.start=function(){
        if(!token()){
            L.Activity.push({url:'',title:'Привязка WAZO TV',component:'wazotv',page:1});
            return;
        }
        renderCategories();renderTools();load();
        req('/v1/tv/summary').then(info=>{
            if(destroyed || !info || !info.verification)return;
            const progress=info.verification;
            const total=Number(progress.eligible_channels||0),checked=Number(progress.decoded_channels||0);
            if(total>0)head.find('.wazog-muted').text('IPTV · EPG · проверены видеокадры: '+checked+' из '+total+' каналов');
        }).catch(()=>{});
        L.Controller.add('content',{
            toggle:()=>refreshController(),
            up:()=>guideMove('up'),
            down:()=>guideMove('down'),
            right:()=>guideMove('right'),
            left:()=>guideMove('left'),
            back:()=>L.Activity.backward()
        });
        L.Controller.toggle('content');
    };
    this.pause=stopPreview;
    this.stop=stopPreview;
    this.destroy=()=>{destroyed=true;generation++;selectionVersion++;stopPreview();root.remove();};
    this.empty=()=>{};
}

function open(){L.Activity.push({url:'',title:'WAZO TV',component:'wazoguide',page:1});}
function ensureMenuButton(){
    const root=$('.menu .menu__list').first();
    if(!root.length || root.find('[data-wazotv-menu="1"]').length)return;
    const item=$('<li class="menu__item selector wazotv-brand" data-wazotv-menu="1"></li>');
    item.append($('<div class="menu__ico"></div>').html(icon));
    item.append($('<div class="menu__text"></div>').text('WAZO TV • Эфир'));
    item.on('hover:enter',open);
    root.append(item);
}
function init(){
    if(document.getElementById('wazotv-css'))return;
    $('<style id="wazotv-css"></style>').text(CSS).appendTo('head');
    window.Lampa.Component.add('wazotv',Panel);
    window.Lampa.Component.add('wazoguide',GuidePanel);
    monitorPlayback();
    L.Listener.follow('menu',function(e){if(e && e.type==='start')setTimeout(ensureMenuButton,0);});
    ensureMenuButton();
    decorate();
    let scheduled=false;
    const mo=new MutationObserver(function(){
        if(scheduled)return;
        scheduled=true;
        requestAnimationFrame(function(){scheduled=false;ensureMenuButton();decorate();});
    });
    mo.observe(document.body,{childList:true,subtree:true});
}
// Some CUB builds do not set window.appready; register when the APIs are present.
if(L.Component && L.Menu && document.body)init();
else L.Listener.follow('app',function(e){if(e.type==='ready')init();});
})();