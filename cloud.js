// Đăng nhập và đồng bộ dữ liệu qua Firebase. Không cần sửa tệp này.
const SDK = 'https://www.gstatic.com/firebasejs/13.2.0/';
const app = window.HD;

const filled = v => typeof v === 'string' && v.trim() !== '' && !v.includes('DAN_VAO_DAY');

async function start() {
  const cfg = window.APP_CONFIG;
  if (!cfg) return app.fail('Không đọc được config.js. Kiểm tra lại dấu nháy, dấu phẩy trong tệp.');
  const f = cfg.firebaseConfig || {};
  if (![f.apiKey, f.authDomain, f.projectId, f.appId].every(filled))
    return app.fail('Chưa cấu hình: mở config.js và dán firebaseConfig của bạn.');

  let A, F, core;
  try {
    [core, A, F] = await Promise.all(['firebase-app.js', 'firebase-auth.js', 'firebase-firestore.js'].map(n => import(SDK + n)));
  } catch (e) {
    return app.fail('Không tải được Firebase. Kiểm tra mạng rồi tải lại trang.');
  }

  const fb = core.initializeApp(f);
  const auth = A.getAuth(fb);
  let fs;
  try {
    fs = F.initializeFirestore(fb, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) });
  } catch (e) {
    fs = F.getFirestore(fb);
  }

  // Khi mất mạng, Firestore chỉ báo xong lúc máy chủ nhận. Chờ tối đa 1,5 giây rồi để giao diện chạy tiếp;
  // thay đổi vẫn nằm trong hàng đợi. Lỗi bị từ chối đến muộn sẽ được báo riêng.
  const settle = write => {
    let late = false;
    write.catch(e => { if (late) app.lateError(e); });
    return Promise.race([write, new Promise(done => setTimeout(() => { late = true; done(); }, 1500))]);
  };

  const db = {
    collection: name => ({
      doc: id => ({
        set: value => settle(F.setDoc(F.doc(fs, name, id), value)),
        delete: () => settle(F.deleteDoc(F.doc(fs, name, id)))
      }),
      // newest: chỉ lấy N mục mới nhất (dùng cho ảnh kỷ niệm để đỡ tốn dung lượng tải)
      watch: (newest, next, fail) => {
        const ref = F.collection(fs, name);
        const q = newest ? F.query(ref, F.orderBy('at', 'desc'), F.limit(newest)) : ref;
        return F.onSnapshot(q, { includeMetadataChanges: true }, next, fail);
      }
    })
  };

  app.ready({
    signIn: (email, password) => A.signInWithEmailAndPassword(auth, email, password),
    reset: email => A.sendPasswordResetEmail(auth, email),
    signOut: () => A.signOut(auth)
  });

  A.onAuthStateChanged(auth, user => {
    if (!user) return app.signedOut();
    const who = user.uid === (cfg.UID_QUANG || '').trim() ? 'quang'
      : user.uid === (cfg.UID_NGOC || '').trim() ? 'tom' : '';
    if (!who) {
      app.reject('Tài khoản này chưa có trong config.js. UID của nó là: ' + user.uid);
      return A.signOut(auth);
    }
    app.signedIn(who, db);
  });
}

start().catch(() => app.fail('Không khởi động được Firebase. Kiểm tra lại config.js rồi tải lại trang.'));
