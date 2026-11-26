// CHỈ CẦN SỬA TỆP NÀY (và firestore.rules khi dán vào Firebase).

// 1) Thay cả khối firebaseConfig bên dưới bằng khối lấy từ Firebase.
//    Chỉ chép đoạn "const firebaseConfig = { ... };", không chép các dòng import.
const firebaseConfig = {
  apiKey: "AIzaSyARurh9Bys2K4xBVg6oFKlxSDd2EsJSytQ",
  authDomain: "pearl-2ecc2.firebaseapp.com",
  projectId: "pearl-2ecc2",
  storageBucket: "pearl-2ecc2.firebasestorage.app",
  messagingSenderId: "384324445635",
  appId: "1:384324445635:web:bf06425aa0cba091720976",
  measurementId: "G-9P3RT3T884"
};

// 2) Dán "User UID" của hai tài khoản vào giữa hai dấu nháy.
const UID_QUANG = "";
const UID_NGOC = "";

// Không sửa dòng này.
window.APP_CONFIG = { firebaseConfig, ZlFQANqcVqMbpHVK0N3ZXISNcci2, xU7PZ7b4vWVT2RtSQGkWKLvhTk12 };
