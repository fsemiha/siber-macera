# 🔒 Firebase Kısıtlama ve Güvenlik Rehberi

Firebase'te güvenlik ve kısıtlama yapmanın tüm yolları burada açıklanmıştır.

## 🛡️ 1. Database Security Rules (En Önemli)

### Mevcut Durumunuz (RİSKLİ):
```json
{
  "rules": {
    "scores": {
      ".read": true,
      ".write": true
    }
  }
}
```
**⚠️ Bu kurallarda herkes her şeyi okuyup yazabilir!**

### Güvenli Kurallar:

#### A) Temel Kimlik Doğrulama:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

#### B) Skor-Specific Kurallar:
```json
{
  "rules": {
    "scores": {
      ".read": true,
      ".write": "auth != null",
      "$scoreId": {
        ".write": "auth != null && newData.child('userId').val() == auth.uid",
        ".validate": "newData.hasChildren(['playerName', 'score', 'timestamp'])"
      }
    }
  }
}
```

## 🔐 2. Firebase Authentication Kısıtlamaları

### Anonymous Auth (Anonim Giriş):
```javascript
// Sadece anonim kullanıcılara izin ver
firebase.auth().signInAnonymously()
```

### Email Doğrulaması Zorunlu:
```json
{
  "rules": {
    ".read": "auth != null && auth.token.email_verified == true",
    ".write": "auth != null && auth.token.email_verified == true"
  }
}
```

### Admin Kontrolü:
```json
{
  "rules": {
    "adminData": {
      ".read": "auth != null && root.child('admins').child(auth.uid).exists()",
      ".write": "auth != null && root.child('admins').child(auth.uid).exists()"
    }
  }
}
```

## 🌐 3. API Key Kısıtlamaları

### Firebase Console'da API Key Kısıtlama:

1. **Google Cloud Console**'a gidin
2. **APIs & Services** > **Credentials**
3. API key'inizi seçin
4. **Application restrictions**:
   - **HTTP referrers**: Sadece belirli domain'lerden erişim
   - **IP addresses**: Belirli IP'lerden erişim
   - **Android apps**: Sadece belirli Android uygulamalar
   - **iOS apps**: Sadece belirli iOS uygulamalar

### Domain Kısıtlama Örneği:
```
https://yourdomain.com/*
https://yoursubdomain.yourdomain.com/*
```

### IP Kısıtlama Örneği:
```
192.168.1.100/32
10.0.0.0/24
```

## ⏱️ 4. Rate Limiting (İstek Sınırlama)

### Database Level Rate Limiting:
```json
{
  "rules": {
    "scores": {
      ".write": "auth != null && (now - root.child('users').child(auth.uid).child('lastWrite').val()) > 1000"
    }
  }
}
```

### Client-Side Rate Limiting:
```javascript
let lastSubmit = 0;
const RATE_LIMIT = 5000; // 5 saniye

function submitScore(score) {
    const now = Date.now();
    if (now - lastSubmit < RATE_LIMIT) {
        alert('Çok hızlı gönderim yapıyorsunuz. Lütfen bekleyin.');
        return;
    }
    lastSubmit = now;
    // Skor gönder...
}
```

## 📊 5. Data Validation (Veri Doğrulama)

### Detaylı Validation Rules:
```json
{
  "rules": {
    "scores": {
      "$scoreId": {
        ".validate": "newData.hasChildren(['playerName', 'score', 'timestamp', 'deviceId'])",
        
        "playerName": {
          ".validate": "newData.isString() && newData.val().length >= 2 && newData.val().length <= 20 && newData.val().matches(/^[a-zA-Z0-9_\\s]+$/)"
        },
        "score": {
          ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 1000000"
        },
        "timestamp": {
          ".validate": "newData.isNumber() && newData.val() <= now"
        },
        "deviceId": {
          ".validate": "newData.isString() && newData.val().length == 36"
        }
      }
    }
  }
}
```

## 🚫 6. Content Filtering (İçerik Filtreleme)

### Kötü Kelime Filtreleme:
```json
{
  "rules": {
    "scores": {
      "$scoreId": {
        "playerName": {
          ".validate": "newData.isString() && !newData.val().toLowerCase().matches(/.*badword1.*/) && !newData.val().toLowerCase().matches(/.*badword2.*/)"
        }
      }
    }
  }
}
```

### JavaScript ile Client-Side Filtering:
```javascript
const bannedWords = ['küfür1', 'küfür2', 'spam'];

function validatePlayerName(name) {
    const lowerName = name.toLowerCase();
    for (let word of bannedWords) {
        if (lowerName.includes(word)) {
            return false;
        }
    }
    return true;
}
```

## 💾 7. Storage Kısıtlamaları

### Firebase Storage Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Sadece 5MB'dan küçük resimler
    match /images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null 
                   && resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

## ⚡ 8. Performans Kısıtlamaları

### Concurrent Connection Limit:
```javascript
// Max 100 eşzamanlı bağlantı
const database = firebase.database();
database.goOffline();
database.goOnline();
```

### Query Limitations:
```javascript
// Max 50 kayıt getir
database.ref('scores')
    .orderByChild('score')
    .limitToLast(50)
    .on('value', snapshot => {
        // Skorları işle
    });
```

## 💰 9. Billing Kısıtlamaları

### Firebase Console'da Budget Alert:
1. **Firebase Console** > **Usage and Billing**
2. **Budget & Alerts** tıklayın
3. Günlük/aylık limit belirleyin
4. %80 kullanımda uyarı alın

### Programmatik Quota Check:
```javascript
// Günlük read limit kontrolü
const MAX_DAILY_READS = 10000;
let dailyReads = parseInt(localStorage.getItem('dailyReads') || '0');

if (dailyReads > MAX_DAILY_READS) {
    console.warn('Günlük okuma limiti aşıldı');
    return;
}
```

## 🎯 10. Projeniz İçin Önerilen Kısıtlamalar

### Oyununuz için güvenli konfigürasyon:

1. **Anonymous Auth** kullanın
2. **Domain kısıtlaması** yapın  
3. **Rate limiting** (3 saniyede 1 skor)
4. **Skor limiti** (0-1,000,000 arası)
5. **İsim uzunluğu** (2-20 karakter)
6. **Günlük 1000 skor** limiti

### Hızlı Uygulama:
```javascript
// 1. Anonymous auth
firebase.auth().signInAnonymously();

// 2. Rate limiting
let lastSubmit = localStorage.getItem('lastSubmit') || 0;
if (Date.now() - lastSubmit < 3000) {
    return; // 3 saniye bekle
}

// 3. Validation
if (score < 0 || score > 1000000) {
    return; // Geçersiz skor
}

if (playerName.length < 2 || playerName.length > 20) {
    return; // Geçersiz isim
}
```

## 🚨 Acil Durum Planı

### Saldırı Durumunda:
1. **Database Rules**'ı hemen ".read": false, ".write": false yapın
2. **API Key**'i yenileyin
3. **Domain restriction** ekleyin
4. **Admin panelden** şüpheli verileri silin

### Backup Plan:
```javascript
// Offline mod'a geç
if (suspiciousActivity) {
    firebase.database().goOffline();
    // LocalStorage'a geç
    saveToLocalStorage(scoreData);
}
```

---

**⚠️ ÖNEMLİ:** Bu kısıtlamaları hemen uygulamayın! Önce test edin, sonra adım adım aktive edin. 