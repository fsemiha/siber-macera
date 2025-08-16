// Firebase Konfigürasyon Dosyası
// Bu dosyayı düzenleyerek Firebase ayarlarınızı yapın

const FIREBASE_CONFIG = {
    // Firebase Console'dan alacağınız bilgiler
    apiKey: "AIzaSyExample...", // Web API Key
    authDomain: "siber-macera-default-rtdb.firebaseapp.com",
    databaseURL: "https://siber-macera-default-rtdb.firebaseio.com", // Realtime Database URL
    projectId: "siber-macera",
    storageBucket: "siber-macera.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123def456"
};

// Bu konfigürasyonu otomatik olarak window nesnesine ekle
if (typeof window !== 'undefined') {
    window.FIREBASE_CONFIG = FIREBASE_CONFIG;
}

// Node.js uyumluluğu için
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FIREBASE_CONFIG;
} 