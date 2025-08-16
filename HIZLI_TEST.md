# 🚀 Hızlı Test Rehberi

## ✅ Şu Anda Durum

Oyun şu anda **"Yerel Mod"**da çalışıyor - her cihaz kendi skorlarını görüyor.
Tüm cihazların skorlarını birlikte görmek için Firebase kurulumu gerekiyor.

## 🔍 Mevcut Durumu Kontrol Etme

1. **Oyunu açın** (`index.html`)
2. **Sağ üst köşeye** bakın:
   - 🔴 **"Firebase kurulum gerekli"** → Firebase henüz kurulmamış
   - 🟡 **"Yerel mod"** → Firebase yok, sadece bu cihazın skorları
   - 🟢 **"Çoklu ekran modu: AKTİF"** → Firebase çalışıyor!

3. **Browser Console'u açın** (F12 → Console)
   - Firebase durumu hakkında detaylı bilgi görürsünüz

## 🔧 Çoklu Ekran İçin Firebase Kurulumu

### ⚡ Hızlı Kurulum (5 dakika):

1. **Firebase Console'a gidin:** https://console.firebase.google.com/
2. **"Add project"** → Proje adı: `siber-macera`
3. **"Realtime Database"** → **"Create Database"** → **"Test mode"**
4. **⚙️ Project Settings** → **Web app** (</>) → **"Register app"**
5. Çıkan **config kodunu kopyalayın**

### 📝 Config'i Yapıştırın:

`index.html` ve `scoreboard.html` dosyalarında şu satırları bulun:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyExample...", // ← BURAYI DEĞİŞTİR
    authDomain: "siber-macera-default-rtdb.firebaseapp.com",
    databaseURL: "https://siber-macera-default-rtdb.firebaseio.com",
    // ... diğer satırlar
};
```

**Firebase'den aldığınız bilgilerle değiştirin.**

## 🧪 Test Etme

1. **Config'i güncelledikten sonra** sayfayı yenileyin
2. **Sağ üst köşede** 🟢 **"Çoklu ekran modu: AKTİF"** yazmalı
3. **Başka bir cihaz/tarayıcıda** da oyunu açın
4. **Bir cihazda oyun oynayın**, diğer cihazda skor tablosunu açın
5. **Skorun anında görünmesi** gerekiyor!

## 🐛 Sorun Giderme

### Hâlâ "Yerel mod" yazıyor?
- Config'i doğru yapıştırdığınızdan emin olun
- `"AIzaSyExample..."` kısmını gerçek API key ile değiştirin
- Sayfayı yenileyin (Ctrl+F5)

### Console'da hata var?
- Firebase projesi oluşturulmuş mu?
- Database kuralları ayarlandı mı?
- İnternet bağlantısı var mı?

### Skorlar senkronize olmuyor?
- İki cihazda da "Çoklu ekran modu: AKTİF" yazıyor mu?
- Browser cache'ini temizleyin
- Firebase Database'de "scores" node'u var mı?

---

## 📲 Başarılı Kurulum Sonrası Özellikler:

✅ **Gerçek zamanlı skorlar** - Anında güncelleme  
✅ **4-5 cihaz eşzamanlı** - Sınırsız oyuncu  
✅ **Offline yedek** - İnternet kopsa bile çalışır  
✅ **Cihaz göstergesi** - Hangi cihazdan geldiği belli  
✅ **Otomatik temizlik** - En iyi 20 skor tutulur  

**🎯 Hedef:** Sağ üstte 🟢 **"Çoklu ekran modu: AKTİF"** görünce hazırsınız! 