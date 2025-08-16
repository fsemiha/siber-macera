# 🌐 Çoklu Ekran Skor Sistemi - Firebase Kurulumu

Bu rehber, Siber Güvenlik Oyunu'nun 4-5 farklı ekranda çalışacak şekilde Firebase ile entegrasyonunu anlatır.

## 📋 Kurulum Adımları

### 1. Firebase Proje Oluşturma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. "Add project" butonuna tıklayın
3. Proje adı: `siber-macera` (veya istediğiniz ad)
4. Google Analytics'i isteğe bağlı olarak kapatabilirsiniz
5. "Create project" butonuna tıklayın

### 2. Realtime Database Kurulumu

1. Firebase projenizde sol menüden **"Realtime Database"** seçin
2. **"Create Database"** butonuna tıklayın
3. **"Start in test mode"** seçin (geliştirme için)
4. Location olarak **"europe-west1"** seçin (Avrupa sunucusu)
5. **"Done"** butonuna tıklayın

### 3. Web App Kaydı

1. Firebase projenizde sol üstteki ⚙️ **"Project Settings"** tıklayın
2. Aşağıda **"Your apps"** bölümünde **"Web"** simgesine (</>) tıklayın
3. App nickname: `siber-macera-web`
4. **"Register app"** butonuna tıklayın
5. Açılan sayfadaki **config object**'ini kopyalayın

### 4. Konfigürasyon

Kopyaladığınız Firebase config'ini aşağıdaki dosyalarda güncelleyin:

#### A) `index.html` dosyasında:
```javascript
const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

#### B) `scoreboard.html` dosyasında da aynı config'i güncelleyin.

### 5. Database Rules (Güvenlik)

Realtime Database'de **"Rules"** sekmesine gidin ve aşağıdaki kuralları ekleyin:

```json
{
  "rules": {
    "scores": {
      ".read": true,
      ".write": true,
      ".indexOn": ["score", "timestamp"]
    }
  }
}
```

**⚠️ Önemli:** Bu kurallar sadece test amaçlıdır. Canlı kullanım için daha güvenli kurallar yazın.

## 🚀 Çoklu Ekran Kullanımı

### Kurulum Sonrası:

1. **Firebase config'i güncelledikten sonra** oyun otomatik olarak çoklu ekran modunda çalışacak
2. Her cihaz/ekranın **aynı Firebase projesine** bağlandığından emin olun
3. **İnternet bağlantısı** gereklidir
4. Skorlar **gerçek zamanlı** olarak tüm ekranlarda güncellenir

### Test Etme:

1. Oyunu bir bilgisayarda açın ve oynayın
2. Başka bir bilgisayarda skor tablosunu açın
3. İlk bilgisayardaki skor, ikinci bilgisayarda otomatik görünmeli

## 🔧 Sorun Giderme

### Skorlar görünmüyor?
- Browser console'u açın (F12)
- Firebase bağlantı hatalarını kontrol edin
- Config bilgilerini doğrulayın

### "Yerel mod" yazıyor?
- Firebase config'inde `"AIzaSyExample..."` değiştirilmemiş
- İnternet bağlantısı problemi olabilir
- Config bilgileri hatalı olabilir

### Performans optimizasyonu:
- Database'de en fazla 20-50 skor tutulur
- Otomatik temizlik sistemi vardır
- 5 saniyede bir yenileme yapılır

## 📱 Özellikler

✅ **Gerçek zamanlı skor paylaşımı**  
✅ **4-5 ekran eş zamanlı kullanım**  
✅ **Offline mod desteği** (localStorage backup)  
✅ **Device ID ile oyuncu takibi**  
✅ **Otomatik skor temizliği**  
✅ **Hata durumunda yerel mod**  

## 🛡️ Güvenlik Notları

- Test modunda herkes okuma/yazma yapabilir
- Canlı kullanım için Firebase Auth ekleyin
- IP tabanlı erişim kısıtlaması yapabilirsiniz
- Spam koruması için rate limiting ekleyin

---

**💡 İpucu:** Firebase'in ücretsiz planı günlük 100MB veri transferi sağlar, bu oyun için yeterlidir. 