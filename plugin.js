/* Wazo 4K for Lampa — staged plugin, 2026-11-20. */
(function () {
  'use strict';
  if (window.wazo4kPluginLoaded || !window.Lampa) return;
  window.wazo4kPluginLoaded = true;

  const KEY_URL = 'wazo4k_api';
  const KEY_TOKEN = 'wazo4k_token';
  const KEY_PAIR = 'wazo4k_pair';
  const ICON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M4 4h16v16H4zM10 8v8l6-4z"/></svg>';
  const storage = Lampa.Storage;
  function base() { return String(storage.get(KEY_URL, '') || '').replace(/\/+$/, ''); }
  function token() { return storage.get(KEY_TOKEN, '') || ''; }
  function note(s) { Lampa.Noty.show(String(s), { time: 4000 }); }
  function esc(s) { return $('<div>').text(String(s == null ? '' : s)).html(); }
  function fmt(size) { return size ? (Number(size) / 1073741824).toFixed(1) + ' ГБ' : ''; }
  function edit(title, value, done) {
    Lampa.Input.edit({ title: title, value: value || '', free: true, nosave: true }, function (v) {
      try { Lampa.Controller.toggle('content'); } catch (_) {}
      if (v != null && String(v).trim()) done(String(v).trim());
    });
  }
  async function api(path, method, body, auth) {
    if (!base()) throw new Error('Сначала укажите HTTPS-адрес Wazo 4K');
    const headers = { 'Content-Type': 'application/json' };
    if (auth !== false && token()) headers.Authorization = 'Bearer ' + token();
    const opt = { method: method || 'GET', headers: headers };
    if (body) opt.body = JSON.stringify(body);
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 40000);
    opt.signal = ctrl.signal;
    try {
      const res = await fetch(base() + path, opt);
      let json = {};
      try { json = await res.json(); } catch (_) {}
      if (!res.ok) throw new Error(json.detail || ('HTTP ' + res.status));
      return json;
    } finally { clearTimeout(timeout); }
  }

  function Panel() {
    const self = this;
    const html = $('<div style="padding:1em 2%;"></div>');
    const info = $('<div style="opacity:.85;padding:.5em 0 1em"></div>');
    const scroll = new Lampa.Scroll({ mask: true, over: true });
    const list = $('<div></div>');
    html.append(info, scroll.render(true));
    scroll.append(list);
    let ready = false, last = false, currentRelease = null;
    let filesTimer = null;
    function button(text, action, subtitle) {
      const row = $('<div class="selector" style="padding:.65em 1em;margin:.45em 0;background:rgba(255,255,255,.09);border-radius:.5em;cursor:pointer"><div>'+esc(text)+'</div></div>');
      if (subtitle) row.append($('<div style="opacity:.65;font-size:.8em"></div>').text(subtitle));
      row.on('hover:enter', action);
      row.on('hover:focus', function (e) { last = e.target; scroll.update(row, true); });
      list.append(row); return row;
    }
    function clear() { list.empty(); last = false; }
    function alertError(err) { note(err && err.message || err); }
    function refresh() {
      clear();
      info.text('Wazo 4K • ' + (base() || 'сервер не указан'));
      button('Настроить адрес API', function () {
        edit('Адрес Wazo 4K (HTTPS)', base(), function (url) {
          if (!/^https:\/\//i.test(url) && !/^http:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.)/i.test(url)) {
            note('Для внешнего доступа необходим HTTPS'); return;
          }
          storage.set(KEY_URL, url); refresh();
        });
      });
      if (!token()) {
        const pair = storage.get(KEY_PAIR, null);
        button('Получить код привязки', async function () {
          try {
            const data = await api('/v1/pair/request', 'POST', {label: 'Lampa / Fire TV'}, false);
            storage.set(KEY_PAIR, data);
            note('Код: ' + data.code + ' (действует 10 минут)');
            refresh();
          } catch (err) { alertError(err); }
        });
        if (pair && pair.code) {
          info.text('Введите в Telegram-боте Wazo 4K код: ' + pair.code);
          button('Код: ' + pair.code, function () { note('Код: ' + pair.code); });
          button('Проверить привязку', async function () {
            try {
              const data = await api('/v1/pair/poll', 'POST', {pair_id:pair.pair_id, code:pair.code}, false);
              if (data.status !== 'active') return note('Ожидается подтверждение в Telegram');
              storage.set(KEY_TOKEN, data.access_token);
              storage.set(KEY_PAIR, null);
              refresh(); note('Устройство подключено');
            } catch(err) { alertError(err); }
          });
        }
        return;
      }
      button('Статус подписки', async function () {
        try {
          const d=await api('/v1/me');
          note('Подписка до: ' + new Date(d.subscription_expires_at).toLocaleString());
        } catch(err) { alertError(err); }
      });
      button('Поиск фильма / сериала', function () {
        edit('Название или год', '', function (q) { search(q); });
      });
      button('Отключить это устройство', function () {
        Lampa.Select.show({
          title: 'Удалить привязку на телевизоре?',
          items: [{title:'Отключить', action:'yes'},{title:'Отмена',action:'no'}],
          onSelect: function (item) {
            if (item.action === 'yes') { storage.set(KEY_TOKEN,''); refresh(); }
          },
          onBack: function () {}
        });
      });
    }
    async function search(q) {
      clear();
      info.text('Поиск: ' + q);
      button('Назад', refresh);
      try {
        const d = await api('/v1/search?q=' + encodeURIComponent(q));
        if (d.status !== 'ok') return note('Поисковые индексаторы ещё не настроены');
        if (!d.releases.length) { note('Подходящих раздач не найдено'); return; }
        d.releases.forEach(function (r) {
          button(r.title, function () { currentRelease = r; showFiles(r); },
            [r.quality, fmt(r.size), 'сиды '+(r.seeders==null?'?':r.seeders), r.source].filter(Boolean).join(' • '));
        });
      } catch (err) { alertError(err); }
    }
    async function showFiles(release) {
      clear();
      info.text(release.title);
      button('Назад к поиску', function () { refresh(); });
      button('Обновить файлы', function () { showFiles(release); });
      try {
        const data=await api('/v1/releases/'+release.id+'/files');
        if (!data.files || !data.files.length) return note('Ожидание метаданных торрента — повторите через несколько секунд');
        data.files.filter(function (f) {
          return /\.(mkv|mp4|avi|mov|ts|m4v)$/i.test(f.name);
        }).forEach(function (f) {
          button(f.name, function () { play(release, f); }, fmt(f.size));
        });
      } catch (err) { alertError(err); }
    }
    async function play(release, file) {
      try {
        const d=await api('/v1/releases/'+release.id+'/play/'+file.index, 'POST');
        const url = /^https?:\/\//.test(d.url) ? d.url : base() + d.url;
        const exe = (file.name.match(/\.[a-z0-9]+$/i) || ['.mkv'])[0];
        Lampa.Player.play({ url: url, title: file.name, source: 'Wazo 4K', exe: exe });
      } catch (err) { alertError(err); }
    }
    this.create = function () { return this.render(); };
    this.render = function () { return html; };
    this.start = function () {
      if (!ready) { ready=true; refresh(); }
      Lampa.Controller.add('content', {
        toggle: function () {
          Lampa.Controller.collectionSet(scroll.render(true), html);
          Lampa.Controller.collectionFocus(last || false, scroll.render(true));
        },
        up: function () { if (window.Navigator && Navigator.canmove('up')) Navigator.move('up'); else Lampa.Controller.toggle('head'); },
        down: function () { if (window.Navigator) Navigator.move('down'); },
        right: function () { if (window.Navigator) Navigator.move('right'); },
        left: function () { if (window.Navigator && Navigator.canmove('left')) Navigator.move('left'); else Lampa.Controller.toggle('menu'); },
        back: function () { Lampa.Activity.backward(); }
      });
      Lampa.Controller.toggle('content');
    };
    this.stop = function () {};
    this.pause = function () {};
    this.destroy = function () { if (filesTimer) clearTimeout(filesTimer); scroll.destroy(); html.remove(); };
    this.empty = function () {};
  }
  function open() { Lampa.Activity.push({url:'',title:'Wazo 4K',component:'wazo4k',page:1}); }
  function init() {
    Lampa.Component.add('wazo4k', Panel);
    try { Lampa.Menu.addButton(ICON, 'Wazo 4K', open); }
    catch (_) {
      let el=$('<li class="menu__item selector"><div class="menu__text">Wazo 4K</div></li>');
      el.on('hover:enter',open);
      $('.menu .menu__list').eq(0).append(el);
    }
  }
  if (window.appready) init();
  else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });
})();
