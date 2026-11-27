// Báo khi có bản mới. Tệp này chạy riêng để vẫn cập nhật được nếu phần khác của app bị lỗi.
(function () {
  const mine = (document.querySelector('meta[name="app-version"]') || {}).content;
  const store = { get: () => { try { return sessionStorage.getItem('updating') } catch (e) { return null } }, set: v => { try { sessionStorage.setItem('updating', v) } catch (e) {} } };
  let box = null, latest = '', checking = false;

  function show(info) {
    if (!box) {
      box = document.createElement('div');
      box.id = 'updateBox'; box.setAttribute('role', 'status');
      box.innerHTML = '<b></b><ul></ul><div><button type="button" id="updateLater">Để sau</button><button type="button" id="updateNow" class="primary">Cập nhật</button></div>';
      document.body.append(box);
      box.querySelector('#updateLater').onclick = () => { box.hidden = true; box.dataset.later = latest };
      box.querySelector('#updateNow').onclick = apply;
    }
    // đã bấm cập nhật mà máy chủ vẫn trả bản cũ
    box.querySelector('b').textContent = store.get() === latest ? 'Bản mới chưa tải xong. Đợi vài phút rồi bấm lại nhé.' : 'Có bản cập nhật mới!';
    box.querySelector('ul').replaceChildren(...(Array.isArray(info.notes) ? info.notes.slice(0, 4) : []).map(t => { const li = document.createElement('li'); li.textContent = t; return li }));
    const now = box.querySelector('#updateNow'); now.disabled = false; now.textContent = 'Cập nhật';
    box.hidden = false;
  }

  async function apply() {
    const now = box.querySelector('#updateNow'); now.disabled = true; now.textContent = 'Đang cập nhật...';
    store.set(latest);
    try {
      const reg = 'serviceWorker' in navigator && await navigator.serviceWorker.getRegistration();
      if (reg) await Promise.race([reg.update(), new Promise(r => setTimeout(r, 3000))]);
    } catch (e) {}
    location.reload();
  }

  async function check() {
    if (!mine || checking || document.hidden || !navigator.onLine) return;
    checking = true;
    try {
      const res = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const info = await res.json();
        if (typeof info.version === 'string' && info.version !== mine) {
          const fresh = latest !== info.version; latest = info.version;
          if ((fresh || !box || box.hidden) && !(box && box.dataset.later === latest)) show(info);
        } else if (box) box.hidden = true;
      }
    } catch (e) {}
    checking = false;
  }

  // Kiểm tra khi mở app, khi quay lại app, khi có mạng lại và mỗi 10 phút
  check();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { if (box) delete box.dataset.later; check() } });
  addEventListener('online', check);
  setInterval(check, 10 * 60000);
})();
