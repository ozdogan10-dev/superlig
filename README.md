# 🏆 Trendyol Süper Lig Veri Platformu (2026-2027)

Bu proje, Trendyol Süper Lig'in 2026-2027 sezonuna ait güncel maç, takım, puan durumu ve fikstür verilerini toplayan, saklayan ve kullanıcı dostu modern bir arayüzle sunan kapsamlı bir web uygulamasıdır. Veriler TFF (Türkiye Futbol Federasyonu) ve çeşitli kaynaklardan otomatik olarak çekilmektedir (web scraping).

## ✨ Özellikler

- **Canlı Veri:** TFF üzerinden otomatik veri çekme ve veritabanına kaydetme.
- **Puan Durumu ve Fikstür:** Süper Lig takımlarının güncel puan durumu, fikstürü ve maç istatistikleri.
- **Modern Arayüz:** Tailwind CSS ile geliştirilmiş, estetik, hızlı ve mobil uyumlu kullanıcı arayüzü.
- **Hızlı ve SEO Uyumlu:** Next.js 16 (App Router) ve React Server Components (RSC) ile yüksek performans.

## 🛠️ Teknoloji Yığını

- **Frontend:** Next.js 16, React 19, Tailwind CSS
- **Backend:** Next.js Server Components / Actions, Node.js
- **Veritabanı:** Prisma ORM, SQLite (Geliştirme için)
- **Veri Kazıma (Scraping):** Puppeteer, Cheerio, RSS Parser, Axios
- **Dil:** TypeScript

## 🚀 Başlangıç

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

### Önkoşullar
- Node.js (v20 veya üzeri önerilir)
- npm, yarn, pnpm veya bun

### Kurulum

1. Depoyu klonlayın ve proje dizinine gidin:
   ```bash
   git clone <repo-url>
   cd superlig-app
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Çevresel değişkenleri ayarlayın (Gerekirse dizinde bir `.env` dosyası oluşturun).

4. Veritabanını oluşturun ve Prisma Client'ı güncelleyin:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

### Geliştirme Sunucusunu Başlatma

Uygulamayı çalıştırmak için:

```bash
npm run dev
```

Tarayıcınızdan [http://localhost:3000](http://localhost:3000) adresine giderek platformu görüntüleyebilirsiniz. Sayfayı düzenlemeye başlamak için `src/app/page.tsx` dosyasında değişiklik yapabilirsiniz.

## 🤖 Veri Kazıma (Scraping) İşlemleri

Maç verilerini ve diğer istatistikleri dış kaynaklardan (TFF vb.) çekip veritabanını güncellemek için projede özel betikler bulunmaktadır.

Örneğin, maç verilerini çekip veritabanına işlemek için aşağıdaki komutu kullanabilirsiniz:
```bash
npm run scrape-match
```
*Bu komut, `scripts/scraper/scrapeMatchToDb.ts` dosyasını `ts-node` aracılığıyla çalıştırır.*

## 📁 Proje Yapısı

- `src/app`: Next.js App Router yapısı (Sayfalar, Route'lar, Layoutlar).
- `src/components`: Yeniden kullanılabilir UI bileşenleri.
- `src/lib`: Prisma Client bağlantısı ve diğer yardımcı kütüphaneler.
- `prisma`: Veritabanı şeması (`schema.prisma`) ve SQLite yerel dosyası (`dev.db`).
- `scripts`: Web scraping ve veri çekme betikleri.
- `public`: Statik görseller, fontlar ve ikonlar.

## 🤝 Katkıda Bulunma

1. Bu depoyu forklayın.
2. Yeni bir dal (branch) oluşturun (`git checkout -b feature/yeni-ozellik`).
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`).
4. Dalınızı (branch) gönderin (`git push origin feature/yeni-ozellik`).
5. Bir Pull Request açın.

---

> **Not:** Proje standartları, geliştirme mimarisi ve yapay zeka ajanları (Antigravity vb.) için özel talimatlar hakkında daha fazla bilgi edinmek isterseniz lütfen [AGENTS.md](./AGENTS.md) dosyasını inceleyin.
