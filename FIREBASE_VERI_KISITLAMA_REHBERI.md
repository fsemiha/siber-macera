# 📊 Firebase Skor Tablosu Veri Kısıtlama Rehberi

Firebase'te skor tablosunda veri tutmada karşılaşabileceğiniz kısıtlamalar ve çözümleri.

## 🔍 Mevcut Projenizde Uygulanan Kısıtlamalar

Kodunuzu incelediğimde şu kısıtlamaları uyguladığınızı görüyorum:

### ✅ **Aktif Kısıtlamalar:**
```javascript
// 1. Maksimum 20 skor tutma
if (allScores.length > 20) {
    const toDelete = allScores.slice(20);
    toDelete.forEach(scoreToDelete => {
        scoresRef.child(scoreToDelete.key).remove();
    });
}

// 2. En fazla 100 skor çekme (sorgu limiti)
scoresRef.orderByChild('score').limitToLast(100)

// 3. LocalStorage'da maksimum 10 skor
if (scores.length > 10) {
    scores.splice(10);
}
```

## 🚧 Firebase Realtime Database Kısıtlamaları

### 1. **Veri Boyutu Kısıtlamaları**

#### A) **Node Boyutu:**
- **Maksimum 32MB** per node
- Her skor kaydı yaklaşık **150-300 byte**
- **~100,000 skor** kaydı tutabilirsiniz

#### B) **Toplam Database Boyutu:**
```
Ücretsiz Plan (Spark): 1GB toplam
Blaze Plan: Sınırsız (ücretli)
```

### 2. **Okuma/Yazma Kısıtlamaları**

#### A) **Eşzamanlı Bağlantı:**
```
Ücretsiz Plan: 100 eşzamanlı bağlantı
Blaze Plan: 200,000 bağlantı
```

#### B) **Bandwidth Limitleri:**
```
Ücretsiz Plan: 10GB/ay transfer
Blaze Plan: $1/GB
```

### 3. **Performans Kısıtlamaları**

#### A) **Query Limitleri:**
```javascript
// Maximum 1000 kayıt per query
database.ref('scores').limitToLast(1000) // ✅ OK
database.ref('scores').limitToLast(5000) // ❌ Problem

// Index gerekli sıralama için
".indexOn": ["score", "timestamp"]
```

#### B) **Yazma Hızı:**
```javascript
// Saniyede max ~1000 yazma işlemi
// Rate limiting önerisi: 3 saniyede 1 skor
```

## 📈 Veri Optimizasyon Stratejileri

### 1. **Skor Verisi Optimizasyonu**

#### Mevcut Veri Yapısı:
```javascript
{
    username: "Kullanıcı",      // ~10-20 byte
    score: 2500,                // ~4 byte
    time: "02:34",              // ~5 byte
    date: "25/12/2023",         // ~10 byte
    timestamp: 1703520000000,   // ~8 byte
    deviceId: "device_abc123"   // ~20 byte
}
// Toplam: ~60 byte per skor
```

#### Optimize Edilmiş Yapı:
```javascript
{
    u: "Kullanıcı",            // username kısaltıldı
    s: 2500,                   // score
    t: 154,                    // time in seconds
    ts: 1703520000,            // timestamp (saniye)
    d: "abc123"                // device kısaltıldı
}
// Toplam: ~30 byte per skor (%50 tasarruf)
```

### 2. **Skor Arşivleme Sistemi**

#### Otomatik Arşivleme:
```javascript
// Aylık arşivleme
const archiveOldScores = () => {
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    database.ref('scores')
        .orderByChild('timestamp')
        .endAt(oneMonthAgo)
        .once('value', (snapshot) => {
            const oldScores = [];
            snapshot.forEach(child => {
                oldScores.push(child.val());
                child.ref.remove(); // Ana tablodan sil
            });
            
            // Arşiv tablosuna taşı
            const archiveRef = database.ref('archive/' + new Date().getFullYear());
            archiveRef.push({ scores: oldScores });
        });
};
```

### 3. **Paginated Scoring (Sayfalama)**

```javascript
// Büyük skor listesi için sayfalama
const getScoresByPage = (page = 1, limit = 20) => {
    const offset = (page - 1) * limit;
    
    return database.ref('scores')
        .orderByChild('score')
        .limitToLast(offset + limit)
        .once('value')
        .then(snapshot => {
            const allScores = [];
            snapshot.forEach(child => allScores.push(child.val()));
            return allScores.slice(offset, offset + limit);
        });
};
```

## ⚡ Performans Optimizasyonu

### 1. **Batch Operations**

```javascript
// Toplu işlem yapın
const batchUpdate = (updates) => {
    return database.ref().update(updates);
};

// Örnek: 10 skoru birden güncelleyin
const updates = {};
scores.forEach((score, index) => {
    updates[`scores/${score.id}/rank`] = index + 1;
});
batchUpdate(updates);
```

### 2. **Connection Pooling**

```javascript
// Tek bağlantı kullanın, sürekli açıp kapamayın
const database = firebase.database();

// Oyun bittiğinde bağlantıyı kapatmayın
// database.goOffline(); // ❌ Yapmayın

// Uygulama kapanırken kapatın
window.addEventListener('beforeunload', () => {
    database.goOffline();
});
```

### 3. **Caching Strategy**

```javascript
let cachedScores = null;
let lastCacheTime = 0;
const CACHE_DURATION = 30000; // 30 saniye

const getCachedScores = () => {
    const now = Date.now();
    if (cachedScores && (now - lastCacheTime) < CACHE_DURATION) {
        return Promise.resolve(cachedScores);
    }
    
    return getScoresFromFirebase().then(scores => {
        cachedScores = scores;
        lastCacheTime = now;
        return scores;
    });
};
```

## 💰 Maliyet Optimizasyonu

### 1. **Read/Write Limitasyonu**

```javascript
// Günlük okuma/yazma sayacı
let dailyReads = parseInt(localStorage.getItem('dailyReads') || '0');
let dailyWrites = parseInt(localStorage.getItem('dailyWrites') || '0');

const MAX_DAILY_READS = 5000;   // Ücretsiz plan limiti
const MAX_DAILY_WRITES = 1000;  // Güvenli limit

const safeDatabaseRead = (ref) => {
    if (dailyReads >= MAX_DAILY_READS) {
        console.warn('Günlük okuma limiti aşıldı');
        return Promise.resolve(getLocalScores());
    }
    
    dailyReads++;
    localStorage.setItem('dailyReads', dailyReads);
    return ref.once('value');
};
```

### 2. **Bandwidth Tasarrufu**

```javascript
// Sadece gerekli alanları çekin
database.ref('scores')
    .orderByChild('score')
    .limitToLast(20)
    .on('value', snapshot => {
        // Full data yerine sadece gerekli fields
        const scores = [];
        snapshot.forEach(child => {
            const data = child.val();
            scores.push({
                username: data.username,
                score: data.score,
                time: data.time
                // deviceId ve diğer meta data'ları almayın
            });
        });
    });
```

## 🛡️ Güvenlik Kısıtlamaları

### 1. **Spam Koruması**

```javascript
// Aynı kullanıcıdan çok sık skor gönderimi engelleme
const lastSubmissions = new Map();

const isSpamSubmission = (deviceId, username) => {
    const key = `${deviceId}_${username}`;
    const lastTime = lastSubmissions.get(key) || 0;
    const now = Date.now();
    
    if (now - lastTime < 60000) { // 1 dakika limit
        return true;
    }
    
    lastSubmissions.set(key, now);
    return false;
};
```

### 2. **Data Validation**

```javascript
const validateScoreData = (scoreData) => {
    // Skor limiti
    if (scoreData.score < 0 || scoreData.score > 1000000) {
        throw new Error('Geçersiz skor değeri');
    }
    
    // Username limiti
    if (!scoreData.username || scoreData.username.length > 20) {
        throw new Error('Geçersiz kullanıcı adı');
    }
    
    // Zamanlama kontrolü
    const timeSeconds = convertTimeToSeconds(scoreData.time);
    if (timeSeconds < 10 || timeSeconds > 3600) { // Min 10 sn, Max 1 saat
        throw new Error('Geçersiz süre');
    }
    
    return true;
};
```

## 📊 Monitoring ve Alerts

### 1. **Quota Monitoring**

```javascript
// Firebase kullanım istatistikleri
const trackUsage = () => {
    const stats = {
        totalReads: parseInt(localStorage.getItem('totalReads') || '0'),
        totalWrites: parseInt(localStorage.getItem('totalWrites') || '0'),
        lastReset: localStorage.getItem('statsReset') || Date.now()
    };
    
    // Günlük reset
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    if (stats.lastReset < oneDayAgo) {
        localStorage.setItem('dailyReads', '0');
        localStorage.setItem('dailyWrites', '0');
        localStorage.setItem('statsReset', Date.now());
    }
    
    return stats;
};
```

### 2. **Error Monitoring**

```javascript
// Firebase hatalarını takip edin
const trackFirebaseErrors = (error) => {
    const errorLog = JSON.parse(localStorage.getItem('firebaseErrors') || '[]');
    errorLog.push({
        error: error.message,
        timestamp: Date.now(),
        code: error.code
    });
    
    // Son 100 hatayı tut
    if (errorLog.length > 100) {
        errorLog.splice(0, errorLog.length - 100);
    }
    
    localStorage.setItem('firebaseErrors', JSON.stringify(errorLog));
};
```

## 🎯 Önerilen Kısıtlama Değerleri

### Projeniz için ideal kısıtlamalar:

```javascript
const SCORE_LIMITS = {
    MAX_SCORES_IN_DB: 50,           // Database'de max skor
    MAX_SCORES_DISPLAY: 20,         // Gösterim için max skor
    MAX_SCORES_LOCAL: 10,           // LocalStorage max skor
    RATE_LIMIT_MS: 3000,            // 3 saniyede 1 skor
    MAX_USERNAME_LENGTH: 20,         // Max kullanıcı adı
    MAX_SCORE_VALUE: 1000000,       // Max skor değeri
    MIN_GAME_TIME: 10,              // Min oyun süresi (saniye)
    MAX_GAME_TIME: 3600,            // Max oyun süresi (saniye)
    CACHE_DURATION: 30000,          // 30 saniye cache
    DAILY_READ_LIMIT: 5000,         // Günlük okuma limiti
    DAILY_WRITE_LIMIT: 1000         // Günlük yazma limiti
};
```

---

**💡 TİP:** Bu kısıtlamaları kademeli olarak uygulayın. Önce monitoring ekleyin, sonra limitler belirleyin, en son kısıtlamaları aktive edin. 