# سَكينة | Sakinah

منصة ثنائية اللغة (العربية والإنجليزية) تقرأ صورة أو مقطعًا أو بثًا للحرم المكي، وتجيب عن سؤال واحد: **هل أزور الآن أم أنتظر؟ ومتى الأنسب لي؟**

A bilingual (Arabic / English) web app that reads a photo, clip, or live stream of Masjid al-Haram and answers one question: **should I go now, or wait — and when is best for me?**

> الحالة: **المرحلة 1 (الأساس) مكتملة.** لا يوجد تحليل بعد؛ يبدأ في المرحلة 3.
> Status: **Phase 1 (foundation) complete.** No analysis yet — that starts in phase 3.

- المواصفات: [`SPEC.md`](SPEC.md)
- المعمارية وخطة المراحل: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

## التشغيل · Running locally

المتطلبات: Node.js 20.9 أو أحدث (مُختبر على Node 24) · Requires Node.js ≥ 20.9 (tested on 24).

```bash
npm install            # تثبيت المكتبات · install dependencies
cp .env.example .env.local
npm run dev            # http://localhost:3000 → /ar أو /en حسب لغة المتصفح
```

| الأمر · Command | ماذا يفعل · What it does |
|---|---|
| `npm run dev` | خادم التطوير · development server |
| `npm run build` / `npm start` | بناء نسخة الإنتاج وتشغيلها · production build and serve |
| `npm run lint` | ESLint، ومنه قاعدة تمنع `ml-`/`mr-`/`left-`/`right-` · includes the RTL/LTR logical-class rule |
| `npm run typecheck` | TypeScript strict بلا إخراج · type-check only |
| `npm test` | Vitest: تطابق مفاتيح `ar.json`/`en.json` وقاعدة الـ lint · catalogue parity + lint rule tests |
| `npm run check` | الثلاثة السابقة معًا · lint + typecheck + test |

## اللغتان · Languages

- كل صفحة لها رابطان: `/ar/...` (RTL، الافتراضي) و`/en/...` (LTR).
- أول زيارة: تُفتح الإنجليزية إذا كانت مفضّلة على العربية في المتصفح، وإلا العربية.
- مبدّل اللغة في الأعلى يبقيك في نفس الصفحة، ويحفظ اختيارك في cookie `NEXT_LOCALE` لمدة سنة.
- كل النصوص في `messages/ar.json` و`messages/en.json`. أي مفتاح يُضاف لأحدهما يجب أن يُضاف للآخر، وإلا يفشل `npm test`.
- الأرقام لاتينية (0123) في اللغتين، والأوقات بتوقيت مكة (Asia/Riyadh).

## هيكل المشروع · Layout

```
messages/            نصوص الواجهة باللغتين
eslint-rules/        قاعدة lint محلية للخصائص المنطقية (RTL/LTR)
tests/               اختبارات Vitest
src/
  proxy.ts           كشف اللغة والتوجيه (next-intl) — لا يمر عليه /api
  i18n/              إعدادات اللغات والتنقّل وتحميل الرسائل
  lib/config/        إعدادات مركزية (اللغة، الأرقام، التوقيت)
  hooks/             useDirection
  components/layout/ Header · Footer · Wordmark · LanguageSwitcher
  app/[locale]/      الصفحات
```
