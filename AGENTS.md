<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Trendyol Süper Lig Veri Platformu 2026-2027 - AI Ajanı Rehberi (AGENTS.md)

Bu belge, bu projede çalışacak yapay zeka ajanları (Antigravity, Claude, Windsurf vb.) için proje bağlamını, teknoloji yığınını, genel mimariyi ve kodlama standartlarını tanımlamaktadır. Tüm ajanlar bu dosyadaki yönergeleri dikkate almalıdır.

## 🎯 Proje Özeti
Bu proje, Trendyol Süper Lig'in 2026-2027 sezonuna ait maç, takım, puan durumu ve istatistik verilerini toplayan, veritabanına kaydeden ve web üzerinden sunan kapsamlı bir veri platformudur. Projenin ana hedefi modern, hızlı ve SEO uyumlu bir web uygulaması oluşturmak ile birlikte web scraping (veri kazıma) yoluyla TFF ve diğer kaynaklardan otomatik veri toplamaktır.

## 🛠 Teknoloji Yığını
- **Framework:** Next.js 16 (App Router)
- **Dil:** TypeScript (Sıkı tip denetimi aktif)
- **Veritabanı:** SQLite (Geliştirme için `dev.db`), Prisma ORM
- **Stil & UI:** Tailwind CSS v3/v4, React Server Components (RSC)
- **Veri Kazıma & İşleme:** Puppeteer, Cheerio, RSS Parser, Axios, iconv-lite

## 🏗 Proje Yapısı
- `/src`: Tüm Next.js uygulama kodları (`app`, `components`, `lib`, `utils` vb.)
- `/prisma`: Veritabanı şeması (`schema.prisma`) ve migrasyonlar.
- `/scripts`: Veri kazıma (scraping) ve veritabanı besleme komut dosyaları (örn. `scrapeMatchToDb.ts`).
- `/public`: Statik dosyalar ve görseller.

## 🤖 Ajanlar İçin Kurallar ve Yönergeler

### 1. Genel Geliştirme Kuralları
- **TypeScript Kullanımı:** Tüm dosyalarda TypeScript kullanılmalıdır. `any` tipinden kaçınılmalı, arayüzler (Interfaces) ve tipler (Types) açıkça tanımlanmalıdır.
- **Next.js App Router (v16+):** Dosya yönlendirme sistemi `/src/app` altında olmalıdır. Yeni bir sayfa eklerken `page.tsx`, `layout.tsx`, `loading.tsx` gibi yapıları App Router standartlarına göre kurgulayın.
- **Sunucu ve İstemci Bileşenleri:** Next.js App Router ile varsayılan olarak her bileşen bir **Server Component**'tır. Sadece kullanıcı etkileşimi (hooks, event listeners) gerektiren yerlerde dosyanın en üstüne `"use client"` ekleyerek **Client Component** kullanın.
- **Veritabanı İşlemleri (Prisma):** Veritabanı sorguları Prisma Client üzerinden ve **sadece sunucu tarafında** (Server Components, Server Actions veya API Route) gerçekleştirilmelidir.

### 2. Stil ve Kullanıcı Arayüzü (UI)
- Uygulama, modern ve zengin bir arayüz deneyimine (canlı renkler, glassmorphism, estetik boşluklar) sahip olmalıdır.
- Tasarımlar **Tailwind CSS** kullanılarak yapılmalıdır. Custom CSS yazmaktan olabildiğince kaçının (`globals.css` içerisindeki kök değişkenler hariç).
- Tıklanabilir ve interaktif alanlar için hover, focus efektleri ve mikro animasyonlar (örn. `transition-all duration-300`) kullanılmalıdır.
- Bileşenleri modüler ve yeniden kullanılabilir parçalara ayırın.

### 3. Veri Kazıma (Web Scraping)
- `/scripts` dizininde yer alan scraping betikleri genellikle TFF gibi dış kaynaklardan veri alır.
- Web scraping işlemlerinde hız sınırlarına (rate-limiting) ve dış sitelerin çökmesini önleyecek `sleep` (bekleme) mekanizmalarına dikkat edin.
- Gelen verilerdeki Türkçe karakter sorunları için `iconv-lite` gibi kütüphaneleri etkin bir biçimde kullanın.
- Hata yönetimi (`try-catch`) kritik öneme sahiptir. Scraper hiçbir durumda uygulamanın genel çökmesine neden olmamalıdır ve konsola anlaşılır loglar basmalıdır.

### 4. İş Akışı ve Terminal Komutları
- **Geliştirme Sunucusu:** `npm run dev`
- **Veri Kazıma Betiğini Çalıştırma:** `npm run scrape-match` (TypeScript dosyalarını `ts-node` üzerinden doğrudan çalıştırır).
- **Prisma Migrasyon ve Client Güncelleme:** Veritabanı modelinde (`schema.prisma`) değişiklik yapıldığında:
  - `npx prisma db push` veya `npx prisma migrate dev`
  - `npx prisma generate`

### 5. Yapay Zeka Ajanı Davranış Yönergeleri
- Kod yazarken projenin mevcut dosya hiyerarşisine ve isimlendirme standartlarına saygı gösterin.
- Gereksiz veya tahminlere dayalı olarak var olan çalışan kodu değiştirmeyin.
- Değişiklik yaptığınız her kritik mantık bölümüne kısa, açıklayıcı yorum satırları ekleyin.
- Kodda Lint veya Build hatasına yol açacak yapısal değişiklikleri dikkatlice analiz etmeden uygulamayın.

---
**Son Güncelleme:** Yapay Zeka tarafından proje standartlarına uygun olarak otomatik üretilmiştir.
