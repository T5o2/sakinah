# سَكينة — الوثيقة المعمارية

> الحالة: المرحلة 0 منتهية والقرارات معتمدة (E.2). **المرحلة 1: المهمة 1.1 منفذة وبانتظار مراجعة المستخدم**، والتالية 1.2 (E.3). الأساس منجز، والمشهد معتمد مبدئيًا، وفيه عيب بصري معروف واحد مفتوح (V2 في E.4). لا يوجد تحليل ولا خادم API بعد. · المرجع: `SPEC.md` · آخر تحديث: 2026-10-15

---

## سجل التغيير

### 2026-10-15 (3): المهمة 1.1، إصلاح فراغ الطائفين
| القسم | ما تغيّر | السبب |
|---|---|---|
| **B (المشهد)** | المسارات الداخلية تتبع شكل الكعبة والحِجر وتتحول إلى الحلقات القديمة خلال 7 م، والطائف يتقدم بالمسافة المقطوعة، والمسارات تنحرف حول الحراس | العيب V1 |
| **E.3 و E.4** | المهمة 1.1 منفذة بأرقام قبل وبعد، وV1 مغلق بانتظار اعتماد المستخدم | — |

### 2026-10-15 (2): القرارات المعتمدة ومراجعة المرحلة 1
| القسم | ما تغيّر | السبب |
|---|---|---|
| **E.2** | القرارات التسعة معتمدة بنص المستخدم، والدمج في `main` مؤجل | قرارات المستخدم |
| **E.3 (جديد)** | المرحلة 1 مقسمة إلى 10 مهام صغيرة مرتبة، لكل منها نطاق وشروط إنجاز وتبعيات. أولها إصلاح فراغ الطائفين | طلب المستخدم |
| **E.4 (جديد)** | سجل العيوب البصرية المعروفة: فراغ الطائفين، والأشكال السوداء الطويلة، مع الأسباب المحتملة وما يثبتها | طلب المستخدم، وفحص الكود ولقطات من المشهد |
| **A.1 و E.1** | الاستضافة مرنة: الواجهة والتحليل القصير يعملان على Vercel، والخدمة الدائمة تُقيَّم عند الحاجة وبموافقة | القرار 7 |
| **H.4 (جديد)** | متطلبات طلب الإذن الرسمي لتحليل بث الحرم، وليس شرطًا لبقية العمل | القرار 8 |
| **I.4 (جديد)** | خطة تجربة مقارنة النماذج بسقف $20 | القرار 6 |
| **المراجعة: «يتعارض مع التكليف»** | `CLAUDE.md` حُدّث، فخرج من قائمة التعارضات | القرار 9 |

### 2026-10-15: المرحلة 0 وفق «التكليف الموحد»

| القسم | ما تغيّر | السبب |
|---|---|---|
| **A.1** | طبقة مصادر جديدة قبل الاستقبال: Discovery ← Registry ← Validation ← Display / Ingestion. والتوصية صارت طبقة لاحقة بعد السجل التاريخي | التكليف §12 |
| **A.4 (جديد)** | سجل المصادر، وفصل قدرة العرض عن قدرة التحليل، والتحقق الآلي، والترتيب، والتبديل، وسياق المشهد | التكليف §4 |
| **A.5** | الاستقبال صار يقبل مصدرًا من السجل. ويوتيوب صار `display_only` بدل الرفض الكلي | التكليف §4.2: فصل العرض عن التحليل |
| **A.6** | المحلل محايد للمكان (`scene_type` بدل `is_haram_scene`)، والتقدير الديموغرافي اختياري ومقيّد بنوع المكان، و`crowd_index` مؤشر نسبي معرَّف | التكليف §1 و§6 و§7 |
| **A.7 (جديد)** | جلسة المراقبة المتكررة والاتجاه | التكليف §3 و§13 |
| **A.8** | جداول جديدة: `sources` و`source_checks` و`source_events` و`monitoring_sessions`، وحقول هوية المصدر وسياق المشهد في `readings` | التكليف §10 و§11 |
| **A.10** | محرك التوصية صار «تقييم ملاءمة» لاحقًا، بلا نسبة الجنس، وبلا نوافذ «نمط الصلاة» قبل وجود بيانات | التكليف §7 و§9 و§10 |
| **B** | الافتتاحية بعمودين وزر «تحليل الكثافة»، وصفحة التحليل بالمشغل بجانب النتائج | التكليف §2 و§3 |
| **C و D** | نماذج وعقود API للمصادر والجلسات | التكليف §4 و§13 |
| **E** | خطة المراحل 0 إلى 8، والقرارات (اعتُمدت لاحقًا في نفس اليوم) | التكليف §13 و§15 |
| **F** | مخاطر جديدة: شروط المصادر، وتنقل كاميرات البث، والتكلفة المستمرة | التكليف §11 |
| **G و H و I (جديدة)** | تقييم n8n، وتقييم المصدر الأول، وتقدير التكلفة | التكليف §5 و§15 |

**ما بقي كما هو:** A.2 وA.2.1 (الواجهة وثنائية اللغة)، وA.9 (الملفات المؤقتة)، وأقسام المشهد ثلاثي الأبعاد وأبعاد الكعبة والحراس في B، وملاحظات المرحلة 1، والقرارات المعتمدة.

---

## المراجعة: ما اكتمل وما خُطط وما يتعارض (2026-10-15)

فُحص الكود الفعلي، لا الوثائق وحدها. `npm run check` ناجح (lint، وtypecheck، و95 اختبارًا في 9 ملفات)، و`npm run build` ناجح.

### اكتمل فعلًا (في الكود)
| البند | الدليل |
|---|---|
| الأساس: Next 16 وTypeScript strict وTailwind وtokens والخطوط لكل لغة | `src/app/[locale]/layout.tsx`، و`globals.css`، و`fonts.ts` |
| ثنائية اللغة: مسارات `/ar` و`/en`، وكشف لغة المتصفح، و`NEXT_LOCALE`، والمبدّل، و`dir` ديناميكي | `src/proxy.ts`، و`src/i18n/`، و`LanguageSwitcher.tsx`، واختبار تطابق المفاتيح |
| قاعدة lint تمنع الخصائص الفيزيائية | `eslint-rules/no-physical-direction.mjs` واختبارها |
| المشهد: الكعبة بكل تفاصيلها (معتمدة)، ومقام إبراهيم، والحِجر، والأروقة، والمطاف، والإضاءة | `src/components/scene/` |
| الحراس الأربعة | `figures/guards.ts`، بانتظار الاعتماد (عدا وقفة حارس الحجر الأسود المعتمدة) |
| الطائفون: 400 / 220 / 120 حسب الجهاز، بمشي في الـ shader، ومجموعات، وأطفال | `TawafCrowd.tsx`، و`walkers.ts`، و`walkerMaterial.ts`، بانتظار الاعتماد |
| مستويات الجهاز وخفضها عند انخفاض الإطارات، والتدوير بالسحب، وreduced-motion | `deviceTier.ts`، و`orbitGesture.ts`، و`HaramScene.tsx` |
| أداء مقيس: 23 draw call و133 ألف مثلث على الديسكتوب، ونحو 144 إطارًا في الثانية | `PHASE2-HANDOFF.md` §1 |

### مخطط فقط (موثق ولا يوجد في الكود)
| البند | الملاحظة |
|---|---|
| **Poster وبديل WebGL** | `src/lib/webgl.ts` موجود **وغير مستخدم**. `HeroStage` يُظهر المشهد بلا صورة بديلة، فعند تعذر WebGL تبقى خلفية سوداء |
| الطيور (الحمام) | الخطوة التالية في التسليم |
| تسلسل الترحيب، والانتقال السينمائي، وزر الدخول | `onActivate` موجود في `HaramScene` ولا يمرره `HeroStage` |
| صفحة `/analyze` | لا توجد |
| كل الخادم: `server/`، و`/api`، و`CrowdAnalyzer`، وsharp، وffmpeg، وZod، وDB | لا شيء منها مثبت أو مكتوب. `package.json` لا يحتوي `zod` ولا `@anthropic-ai/sdk` ولا `drizzle` |
| `MotionConfig reducedMotion="user"` | `motion` مثبت ويُستخدم فيه `useReducedMotion` فقط |
| قسم المرحلة 2 في `INTERVIEW-NOTES.md` | لم يُكتب بعد |
| قياس أداء الجوال بمعالج مخفّض | القياس الموجود محاكاة شاشة جوال على جهاز سريع |

### يتعارض مع التكليف
| البند | أين | التعارض | المعالجة |
|---|---|---|---|
| توزيع الافتتاحية | `src/app/[locale]/page.tsx` | النص فوق مشهد يملأ الشاشة، لا عمودان | المرحلة 1 |
| لا زر «تحليل الكثافة» | نفسه | التكليف يطلب زرًا أساسيًا واضحًا | المرحلة 1 |
| الوصف يَعِد بما لم يُبنَ | `messages/*.json` (`home.lead`): «تقترح عليك أنسب وقت» | لا توجد توصية، والتوصية صارت لاحقة | المرحلة 1 (تعديل النص) |
| عنوان الصفحة في الـ metadata | `metadata.title`: «متى تزور الحرم؟» | يحصر المنتج في الحرم والتوقيت | المرحلة 1، بقرار النطاق |
| سطر الخصوصية في الـ Footer | «نحفظ أرقام التحليل فقط لتحسين التوصيات» | يشير إلى توصيات غير موجودة | المرحلة 2 (عند وجود تحليل فعلي) |
| `CLAUDE.md` | «المشروع باختصار»، والقاعدة 5، وأنواع الزيارة، و«المراحل في SPEC §14» | كان يصف منتجًا محوره الحرم والتوصية حسب نوع الزيارة | **حُدّث** في 2026-10-15 (القرار 9) |
| المشهد | فراغ بلا طائفين بجانب الجدار والحِجر، وأشكال سوداء طويلة بجانب الكعبة | يكسر استمرارية مشهد الطواف | المهمتان 1.1 و1.2 (E.3، E.4) |
| الوثائق القديمة: Crowd Score كرقم أساسي، وبطاقتا الرجال والنساء، ونوافذ «نمط الصلاة»، ورفض يوتيوب كليًا | `SPEC.md` و`ARCHITECTURE.md` السابقان | التكليف §6 و§7 و§9 و§10 و§4 | **عُدّلت في هذا الـ commit** |

---

## A. Product Architecture

### A.1 نظرة عامة
تطبيق Next.js واحد (App Router) يعمل على **عملية Node طويلة العمر**، ويحتوي الواجهة والـ API والمهام الخلفية. يناسب هذا الـ MVP: نشر واحد، وأنواع مشتركة، ولا خدمات إضافية. منطق الخادم كله داخل `src/server/` بطبقات مفصولة، وكل ملف فيه يبدأ بـ `import "server-only"`.

**الاستضافة مرنة (القرار 7):**
- **الواجهة والتحليل القصير** (صورة، وفيديو قصير) يجب أن يعملا على Vercel: تحليل الطلب الواحد ينتهي داخل حدود دالة serverless، ولا يعتمد على حالة في الذاكرة بين الطلبات. حدود المدة وحجم `ffmpeg-static` على Vercel تُتحقق منها في المرحلة 2 قبل الاعتماد عليها.
- **المهام الدائمة** (الفحص المجدول للمصادر في المرحلة 4، وجلسات المراقبة في المرحلة 5) تحتاج عملية تبقى تعمل. تُقيَّم لها خدمة دائمة التشغيل عند الحاجة الفعلية، **ولا تُضاف تكلفة استضافة متكررة دون موافقة المستخدم.**
- لذلك تبقى `JobRunner` و`Scheduler` واجهتين، ولكل منهما تنفيذ يعمل محليًا داخل العملية، ويمكن استبداله دون تغيير منطق التحليل.

```mermaid
flowchart LR
  UI[UI · React/R3F] -->|HTTP + SSE فقط| API[Route Handlers /api]

  subgraph Sources[طبقة المصادر]
    DISC[Discovery<br/>مرشحون فقط] --> REG[(Source Registry)]
    REG --> VALD[Validation<br/>صحة تقنية + قدرة]
    SCHED[Health Scheduler<br/>داخل العملية] --> VALD
    VALD --> RANK[Ranking + Failover]
  end

  API --> RANK
  RANK -->|display_only| DISP[مشغل رسمي في الواجهة<br/>لا سحب إطارات]
  RANK -->|display_and_analyze| ING[Ingestion<br/>image · video · stream]
  API --> ING
  ING --> FX[Frame Extraction<br/>ffmpeg]
  FX --> PRE[Preprocessing<br/>sharp: resize + quality]
  PRE --> AN[CrowdAnalyzer<br/>Claude | Mock]
  AN --> VAL[Validation · Zod]
  VAL --> AGG[Aggregation]
  AGG --> RES[Results]
  AGG --> DB[(SQLite · Drizzle)]
  MON[Monitoring Session] --> ING
  DB -.لاحقًا.-> FC[Forecast]
  FC -.لاحقًا.-> SUIT[Suitability]
  ING -.temp files.-> TMP[/tmp/sakinah/&lt;id&gt;/]
```

**قاعدة الاعتماد:** `app/(ui)` ← `lib/api-client` ← `/api` ← `server/*`. الواجهة لا تستورد من `server/` إطلاقًا، والمشترك الوحيد `lib/schemas` (Zod) و`lib/config`.

**هيكل `src/server/`:**
```
server/
  sources/      registry · validation · health · ranking · failover · providers/{youtube,hls}
  ingestion/    image · video · stream (ffmpeg) · ssrf guard
  analysis/     preprocess · analyzers/{claude,mock} · validate · aggregate
  monitoring/   session runner · comparability
  storage/      db (drizzle) · repositories · temp files
  jobs/         in-process runner · scheduler
```

### A.2 Frontend
- Next.js App Router + TypeScript strict + Tailwind (Design tokens من SPEC §2 كمتغيرات CSS في `@theme`).
- Motion: `MotionConfig reducedMotion="user"` على مستوى الـ layout.
- المشهد 3D: Three.js + R3F + drei، ويُحمَّل عبر `dynamic(..., { ssr: false })` خلف صورة Poster ثابتة (هي الـ LCP).
- **الأرقام:** لاتينية (0123) في اللغتين. `Intl.NumberFormat(locale, { numberingSystem: "latn" })` مضبوط مرة واحدة في `lib/config/locale.ts`، مع `tabular-nums` دائمًا. الأوقات تُعرض بـ `Intl.DateTimeFormat` بتوقيت المكان (Asia/Riyadh للحرم) وبنفس الأرقام اللاتينية.

### A.2.1 ثنائية اللغة (ar / en) بنفس مستوى الجودة
لا توجد لغة «ثانوية». كل صفحة وحالة (تحميل، وخطأ، وفراغ، ورسائل الخادم) مكتملة وملمّعة في اللغتين.

- **التوجيه:** next-intl بمسارات `/ar/...` و`/en/...` (`localePrefix: "always"`). لكل لغة رابط مستقل قابل للمشاركة، مع `hreflang` و`alternate` في الـ metadata.
- **أول زيارة:** الـ proxy يقرأ `Accept-Language`. إذا كانت الإنجليزية هي الأعلى تفضيلًا بين `ar` و`en` تُفتح `en`، وفي أي حالة أخرى تُفتح `ar` (الافتراضي).
- **حفظ الاختيار:** أي اختيار يدوي يُحفظ في cookie `NEXT_LOCALE` لمدة سنة، ويتقدم على لغة المتصفح في الزيارات التالية.
- **`LanguageSwitcher`:** في الـ Header، يعرض اسم اللغة الأخرى بلغتها («English» / «العربية») مع `lang` و`hreflang` على الرابط. يبقي المستخدم في نفس المسار ونفس الحالة. هدف اللمس فيه 44px على الأقل.
- **الاتجاه:** `dir` و`lang` على `<html>` من الـ locale (`ar` = `rtl`، و`en` = `ltr`). نستخدم logical utilities فقط (`ms-`/`me-`/`ps-`/`start`/`end`)، مع قاعدة lint تمنع `ml-`/`mr-`/`left-`/`right-`.
- **الحركة حسب الاتجاه:** hook `useDirection()` يعطي `sign` (`-1` في RTL، و`+1` في LTR)، وكل إزاحة أفقية في Motion تُضرب فيه. الأيقونات الاتجاهية تنعكس بـ `rtl:-scale-x-100`.
- **المحتوى المختلط:** الأرقام والأوقات والروابط والأسماء اللاتينية داخل نص عربي (وبالعكس) تُعزل بـ `<bdi>` أو `unicode-bidi: isolate`.
- **الترجمة:** كل النصوص في `messages/ar.json` و`messages/en.json`، ولا نص داخل المكونات. اختبار Vitest يفشل إذا اختلفت المفاتيح، والأنواع مستنتجة من `ar.json`.
- **الخطوط لكل لغة** عبر `:lang()` ومتغيرات `--font-display` و`--font-body`:
  - العربية: Reem Kufi للعناوين، وIBM Plex Sans Arabic للنص، بـ line-height بين 1.7 و1.9.
  - الإنجليزية: **Marcellus** للعناوين، وIBM Plex Sans للنص بـ line-height قرابة 1.6.
  - **سبب اختيار Marcellus (قرار معتمد 2026-09-30):** قُورن في المرحلة 1 بـ Reem Kufi اللاتيني وCormorant Garamond على خلفية `--ink`. Cormorant أنيق لكنه نحيف وضعيف القراءة على الأسود بالأحجام الصغيرة. وReem Kufi اللاتيني هندسي قريب من Futura، ومسافات كلماته ضيقة. أما Marcellus فحروفه رومانية بطابع الحجر المنقوش، تنسجم مع الكوفي وتُقرأ جيدًا بالحجمين. قيده أن له وزنًا واحدًا (400)، فلا تعتمد العناوين الإنجليزية على الـ bold. يبقى Reem Kufi خط العناوين العربية، ومعه subset لاتيني للأرقام اللاتينية داخلها.
- **النصوص الروحية بالإنجليزية:** صياغة هادئة لائقة، لا ترجمة حرفية:

  | العربية | English |
  |---|---|
  | مرحبًا بك | Welcome |
  | اختر وقتك بهدوء، لتؤدي عبادتك بخشوع. | Choose your time calmly, and worship with a present heart. |
  | اللهم يسّر لك زيارة مباركة. | May Allah make your visit easy and blessed. |

### A.3 Backend
- Route Handlers في `app/api/**` بـ `runtime = "nodejs"`. دورها رقيق: تتحقق من المدخلات (Zod)، وتستدعي خدمة من `server/`، وتحوّل الأخطاء إلى `ApiError` له `code` ثابت ورسالة مفهومة بلغة المستخدم (انظر D).
- **Job runner داخل العملية:** `POST /api/analyses` ينشئ سجلًا ويعيد `202` فورًا، ثم يعمل التحليل في الخلفية (حد تزامن قابل للضبط، الافتراضي 2). المراحل تُبث عبر `EventEmitter` لكل `analysisId`، وتُحفظ آخر مرحلة في DB حتى تعمل إعادة اتصال SSE والـ polling.
- **المجدول داخل العملية:** `instrumentation.ts` (`register()`) يبدأ `HealthScheduler` مرة واحدة: `setInterval` بتأخير عشوائي صغير، و«single-flight» (لا يبدأ فحص قبل انتهاء سابقه)، وتنظيف الملفات المؤقتة في نفس الحلقة. لا مكتبة cron (القاعدة 7).
- **على Vercel** (A.1) لا يُضمن بقاء عمل في الخلفية بعد إرسال الاستجابة. لذلك يكون للـ `JobRunner` تنفيذ ثانٍ يحلل داخل نفس الطلب ويبث المراحل في استجابته نفسها (streaming). يُختار التنفيذ في المرحلة 2 بعد التحقق من حدود المنصة.
- القيد المعروف: هذا يعمل على instance واحد فقط. للتوسع لاحقًا يُستبدل الـ runner والمجدول بطابور (Redis/BullMQ) أو بمنسق خارجي (G) خلف نفس الواجهات `JobRunner` و`Scheduler`.
- **مهم:** الـ `proxy` الخاص بـ next-intl يُستثنى منه `/api` في الـ matcher، لأنه يخزّن جسم الطلب مؤقتًا ويقصّه عند حد معين، وهذا يكسر رفع الفيديو.

### A.4 طبقة المصادر (Auto Stream Discovery & Failover)

#### A.4.1 قدرتان مستقلتان
```
Capability = Permission (قانوني، من مراجعة بشرية) ∧ Health (تقني، من فحص آلي)
```
| | العرض | التحليل |
|---|---|---|
| **الإذن** | الشروط تسمح بالتضمين بالمشغل الرسمي | ترخيص صريح أو إذن كتابي أو محتوى المستخدم نفسه يسمح بسحب الإطارات |
| **الصحة** | البث نشط، والتضمين غير معطل | خادمنا يصل إلى الإطارات (HLS أو ملف)، والـ playlist يتقدم، والإطار مقروء |

- `analyzePermission` له `basis`: `license` · `written_permission` · `user_owned` · `none`. القيمة `none` تعني أن التحليل ممنوع مهما كانت الصحة التقنية.
- **الاكتشاف الآلي لا يمنح إذنًا.** ينشئ سجلات `candidate` فقط، والترقية إلى `active` تحتاج مراجعة بشرية تسجل رابط الدليل وتاريخه (`reviewedAt`, `evidenceUrl`).
- التصنيف المعروض (`display_and_analyze` / `display_only` / `unavailable`) **مشتق** من الإذن والصحة لحظة الطلب، ولا يُخزَّن ثابتًا.

#### A.4.2 السجل
- البذرة في `src/lib/config/sources.ts`: قائمة صغيرة مراجعة يدويًا (H)، تُزامَن إلى جدول `sources` عند بدء التشغيل. أي تعديل على الإذن يمر عبر هذا الملف ومراجعة الكود، لا عبر API عام.
- الاكتشاف (المرحلة 4، بعد ثبات السجل): مزودات بحث بواجهات رسمية فقط، مثل YouTube Data API (`search.list` بـ `eventType=live`)، تنتج مرشحين للعرض فقط. لا كشط صفحات (scraping).

#### A.4.3 الفحص الآلي
| المزود | فحص الصحة | التكلفة |
|---|---|---|
| `youtube` (عرض فقط) | YouTube Data API: `liveBroadcastContent` و`status.embeddable`. وفي الواجهة: أحداث مشغل IFrame (الخطأ 101/150 = التضمين معطل) | حصة مجانية من الـ API، ولا سحب لأي إطار |
| `hls` (عرض وتحليل) | جلب الـ playlist عبر حارس SSRF، والتحقق من `#EXTM3U`، وتقدم `MEDIA-SEQUENCE`، وحداثة آخر مقطع، ثم إطار واحد بـ ffmpeg وجودة محلية بـ sharp | محلية، بلا استدعاء نموذج |
| ملاءمة المشهد (كل المصادر القابلة للتحليل) | استدعاء المحلل على إطار واحد بتكرار منخفض (مثل كل 30 دقيقة) لتسجيل وجود حشد ووضوح الأشخاص | مستدعى نادرًا، ومحسوب في I |

نتيجة كل فحص تُحفظ في `source_checks`، وتُحدّث `health` و`uptimeEwma` و`consecutiveFailures` في `sources`.

#### A.4.4 الترتيب
1. **الأهلية:** القدرة المطلوبة متاحة، و`health ∈ {ok, degraded}`، و`breakerUntil` منتهٍ.
2. **الدرجة:** `score = w_place·placeMatch + w_vis·visibility + w_up·uptimeEwma + w_q·quality − w_age·checkAge`، والأوزان في `lib/config/sources.ts`.
3. **Circuit breaker:** بعد K فشل متتالٍ، يُستبعد المصدر لمدة تتضاعف (5، ثم 10، ثم 20 دقيقة، بحد أقصى).

دوال نقية في `server/sources/ranking.ts`، عليها اختبارات Vitest.

#### A.4.5 التبديل
آلة حالات نقية (`server/sources/failover.ts`) تُغذّى بأحداث، فتُختبر بلا شبكة:

```
connecting → connected → stalled → recovering → connected            (نفس المصدر، نفس السياق)
                                   recovering → switching → connected (مصدر جديد، سياق جديد)
                                                switching → no_source
```
- **`stalled`:** لا مقطع ولا إطار جديد لمدة `stallThresholdSec` (الافتراضي 20). التخزين المؤقت القصير لا يغير الحالة.
- **`recovering`:** يتأكد الانقطاع بفشل فحصين متتاليين، ثم حتى `maxRetries` (الافتراضي 3) بمهلة تتضاعف، وبمهلة كلية `recoveryTimeoutSec` (الافتراضي 60).
- **`switching`:** يُتحقق من أفضل مرشح (A.4.3) قبل تشغيله، وإلا ينتقل للتالي.
- كل انتقال يكتب `source_events` (`switch` · `stall` · `recovered` · `no_source`)، ويُرسل حدثًا للواجهة لتبلغ المستخدم.
- **مصادر العرض فقط:** المتصفح يراقب أحداث مشغل IFrame ويطلب من الخادم بديلًا (`POST /api/sources/next`)، فالمنطق نفسه في مكان واحد.

#### A.4.6 سياق المشهد
- `sceneContextId` يبدأ جديدًا عند: تبديل المصدر، أو بداية جلسة، أو **تغير حاد في المشهد** داخل نفس البث (البث التلفزيوني يتنقل بين الكاميرات).
- كشف التغير الحاد محلي ورخيص: بصمة إدراكية صغيرة (difference hash) للإطار بـ sharp، ومسافة Hamming فوق حد.
- القراءات لا تُقارن ولا تُجمّع إلا داخل نفس `sceneContextId`.

### A.5 Ingestion
واجهة موحدة: `Ingestor.ingest(input) → AsyncIterable<FrameRef>`، ولها ثلاثة تنفيذات:

| النوع | الاستقبال | استخراج الإطارات |
|---|---|---|
| صورة | جسم الطلب الخام يُكتب إلى القرص بالتدفق مع عدّ البايتات وقطعه عند الحد | إطار واحد. التحقق من النوع عبر `sharp.metadata()` (magic bytes، لا الامتداد) |
| فيديو | نفس الطريقة | `ffmpeg-static`: قراءة المدة ثم عينات متساوية التباعد (`sampleEverySec` و`maxFrames`) |
| بث HLS | `sourceId` من السجل، أو `{ url }` يدخله المستخدم ويمر بنفس التحقق | حارس SSRF ثم ffmpeg يلتقط K إطارات بفاصل N ثانية، مع Timeout صارم |

**لماذا الجسم الخام بدل multipart؟** يُكتب مباشرة إلى القرص بلا مكتبة parsing إضافية، مع تقدم رفع حقيقي عبر `XMLHttpRequest.upload.onprogress`.

**حماية روابط البث (SSRF):**
- `https` فقط، وفحص DNS يرفض العناوين الخاصة وloopback وlink-local وCGNAT وIPv6 الخاصة، **بعد كل تحويل (redirect)** وبالعنوان الذي حُلّ فعلًا (منع DNS rebinding).
- نجلب الـ master playlist بأنفسنا، ونتحقق من `#EXTM3U`، ثم **نتحقق من كل رابط variant ومقطع داخله** بنفس القواعد، ونمرر لـ ffmpeg رابطًا محددًا مع `-protocol_whitelist https,tls,tcp,hls` محدودة.
- حد لحجم الـ playlist وعدد الـ variants.

**روابط يوتيوب:** تُقبل كمصدر **عرض فقط** عبر مشغل IFrame الرسمي، ولا تمر إلى الـ Ingestor أبدًا (H.1).

### A.6 CV Pipeline
```
FrameRef → preprocess (sharp: تدوير حسب EXIF، إزالة كل metadata، resize إلى 1568px كحد أقصى، JPEG)
        → localQuality (sharp.stats: sharpness، entropy، brightness) + dHash
        → gate (جودة محلية دنيا، وتغير كافٍ عن الإطار السابق في المراقبة)
        → CrowdAnalyzer.analyzeFrame(jpeg, ctx) → FrameAnalysisRaw
        → Zod validate + normalize
        → Aggregator(frames[]) → AnalysisResult
```
- **`CrowdAnalyzer`** (واجهة): `analyzeFrame(image, ctx: { placeType, demographicsEnabled }) → Promise<FrameAnalysis>`.
  - `ClaudeVisionAnalyzer`: يستخدم `@anthropic-ai/sdk`. الموديل من `ANTHROPIC_MODEL`. الإخراج بمخطط صارم (structured outputs، أو أداة بـ `strict: true` مع `tool_choice: auto`، لأن Opus 5.5 وSonnet 5.5 يرفضان `tool_choice` الإجباري). Timeout 30 ثانية، وإعادة محاولة واحدة عند فشل Zod أو 5xx، والتعليمات الثابتة مُخزَّنة بـ prompt caching. يُسجَّل `usage` لكل استدعاء لحساب التكلفة الفعلية.
  - `MockAnalyzer`: يعمل فقط عند `ANALYZER=mock` و`NODE_ENV !== "production"`. كل نتيجة تحمل `analyzer: "mock"` و`isMock: true`، والواجهة تعرض `MockModeBanner` من النتيجة نفسها. قراءات الـ Mock **لا تدخل** التاريخ ولا الاتجاه أبدًا.
  - `DetectorAnalyzer` (مستقبلًا، المرحلة 6): نفس الواجهة.
- **حياد المكان:** `scene_type` (`crowd_scene` · `no_people` · `not_a_crowd_scene` · `unclear`) بدل `is_haram_scene`. نوع المكان يأتي من السجل أو من اختيار المستخدم، لا من الصورة.
- **التقدير الديموغرافي:** يُطلب فقط عند `demographicsEnabled && placeType === "haram"`، وإلا يُحذف من البرومبت والمخطط معًا (أقل تكلفة، وأقل إغراء بالتخمين).
- **الفصل المنطقي:** `FrameAnalysis` تُقسَّم فور التحقق إلى `CrowdEstimate` و`DemographicEstimate | null` و`QualityAssessment`.
- **Aggregation** (دوال نقية قابلة للاختبار):
  1. استبعاد الإطارات التي `scene_type ≠ crowd_scene` أو جودتها تحت `minFrameQuality`.
  2. إزالة القيم الشاذة في `crowd_index` بطريقة median ± k·MAD.
  3. متوسط مرجّح: وزن الكثافة `crowd_confidence × quality`، ووزن التوزيع `demographic.confidence × quality`.
  4. ثقة التجميع = f(متوسط الثقة، تشتت الإطارات، عدد الإطارات المستخدمة).
  5. `reliability`: `reliable` (المستوى والمؤشر والنطاق) · `limited` (المستوى فقط) · `insufficient` (رسالة واقتراح بلا أرقام).
- **`crowd_index`:** مؤشر نسبي 0–100 لامتلاء المساحة الظاهرة، يُعرض مع تعريفه وبلا %. نطاق العدد يُعرض فقط إذا تجاوزت `crowd_confidence` حدًا مرتفعًا.
- حدود المستويات والثقة كلها في `lib/config/analysis.ts` (القيم الأولية: منخفضة < 35 ≤ متوسطة < 65 ≤ مرتفعة، وتُعاير في المرحلة 6).
- **مجموعة الاختبار** (`tests/fixtures/scenes/`): ملف وصفي بالمصدر والترخيص والنطاق المتوقع لكل صورة. الصور نفسها لا تُحفظ في المستودع، بل تُنزَّل بسكربت من مصادرها المرخصة (H.2).

### A.7 المراقبة المتكررة
- `MonitoringSession` في الذاكرة لكل جلسة، ومسجلة في `monitoring_sessions`: `sourceId`، و`intervalSec` (الافتراضي 30، والأدنى 20)، و`maxDurationMin` (الافتراضي 30)، و`maxFrames`، و`costCapUsd`.
- حلقة: التقاط إطار ← gate محلي ← تحليل ← قراءة ← حدث SSE. تتوقف عند: طلب المستخدم، أو انتهاء الحدود، أو `no_source`، أو غياب أي مستمع SSE لأكثر من 60 ثانية.
- **الاتجاه** (`server/monitoring/trend.ts`، دالة نقية): ميل انحدار خطي بسيط على آخر قراءات قابلة للمقارنة (نفس `sceneContextId`، و`reliability ≠ insufficient`، و`isMock = false`)، بحد أدنى 3 قراءات خلال 15 دقيقة، وعتبة ميل لاعتبار التغير «ثابتًا». أقل من ذلك: `trend = null` ← «غير متاح بعد».
- **الحداثة:** القراءة «حديثة» إذا كان عمرها أقل من `2 × intervalSec`، وإلا تُعلَّم «قديمة» في الواجهة.

### A.8 DB
- Drizzle ORM + SQLite (`better-sqlite3`) في `data/sakinah.db`، والمخطط مكتوب بطريقة قابلة للترحيل إلى Postgres.
- **لا صور، ولا وجوه، ولا IP، ولا بيانات شخصية.** الجداول:
  - `sources`: id، provider، placeType، placeName، locator (videoId أو URL)، displayPermission + evidenceUrl، analyzePermission + basis + evidenceUrl، reviewedAt، status (`candidate` · `active` · `retired`)، health، uptimeEwma، consecutiveFailures، breakerUntil، lastCheckedAt.
  - `source_checks`: id، sourceId، checkedAt، kind (`liveness` · `frame` · `scene`)، ok، latencyMs، errorCode، quality؟، visibility؟.
  - `source_events`: id، sessionId؟، at، kind (`switch` · `stall` · `recovered` · `no_source`)، fromSourceId؟، toSourceId؟، reason.
  - `monitoring_sessions`: id، sourceId، startedAt، endedAt، endReason، intervalSec، framesAnalyzed، costUsd.
  - `analyses`: id، status، stage، sourceKind، sourceId؟، analyzer، model، promptVersion، isMock، errorCode، result (JSON)، costUsd، createdAt، completedAt.
  - `readings`: id، analysisId؟، sessionId؟، sourceId؟، sceneContextId، placeType، capturedAt، analyzedAt، timeTrust، crowdIndex، crowdLevel، personMin/Max، quality، crowdConf، reliability، demographics (JSON؟)، analyzer، model، promptVersion، isMock.
  - `prayer_times`: date (PK)، timings JSON، fetchedAt.
- **العزل:** كل استعلام للتاريخ أو الاتجاه أو التقييم يمر بدالة repository واحدة تضيف `isMock = false` و`timeTrust ≠ unknown`. لا استعلام مباشر على `readings` خارجها.
- كل الحسابات الزمنية بتوقيت المكان (Asia/Riyadh للحرم).

### A.9 Storage (ملفات مؤقتة)
- `os.tmpdir()/sakinah/<analysisId>/`، تُحذف في `finally` بعد التحليل مهما كانت النتيجة.
- تنظيف احتياطي من المجدول: كل 10 دقائق، يحذف أي مجلد أقدم من 15 دقيقة.
- لا تخزين دائم للوسائط. الإطارات تُمرَّر إلى Anthropic API ولا تُحفظ عندنا.

### A.10 الملاءمة والتوصية (المرحلة 7)
دوال نقية في `server/suitability/`، والأوزان والحدود في `lib/config/suitability.ts`.
- **Input:** القراءة الحالية وحداثتها · الاتجاه · السياق (نوع المكان، وأوقات الصلاة في الحرم) · الاحتياج المعلن (`family` · `individual` · `group` · `easier_mobility`).
- **Output:** `{ assessment: "comfortable" | "busy" | "very_busy" | "insufficient_data", reasons: { code, params }[], confidence, dataSufficiency }`.
- لا يقرأ `demographics` إطلاقًا (اختبار يتأكد من ذلك).
- **أوقات الصلاة:** Aladhan API (مكة، `method=4`)، Timeout 8 ثوانٍ وcache يومي. تُعرض سياقًا فقط.
- **التنبؤ** (`server/forecast/`): خط أساس بمتوسط الخانة (يوم الأسبوع × نصف ساعة) لكل `sourceId` و`sceneContextId` ثابت، ثم مقارنة نموذج إن كان مبررًا، والتقييم بـ MAE/RMSE على فترة لاحقة لم تدخل التدريب. لا يُعرض قبل أن يتفوق على خط الأساس الساذج (آخر قيمة).

## B. Component Tree

```
src/app/[locale]/layout.tsx          ← fonts per locale, dir/lang, NextIntlClientProvider, MotionConfig
├─ SiteHeader → Wordmark · LanguageSwitcher
├─ MockModeBanner                    (يظهر فقط عند نتيجة isMock)
├─ page.tsx  (الافتتاحية)
│  └─ HeroLayout                     (عمودان ≥ 1024px، وعمودي على الجوال)
│     ├─ HeroCopy → h1 · lead · PrimaryCta («تحليل الكثافة» → /analyze)
│     └─ SceneStage
│        ├─ HeroPoster               (صورة ثابتة، LCP، وبديل عدم دعم WebGL أو فقد السياق)
│        └─ HaramScene  [dynamic, ssr:false]
│           └─ <Canvas> SceneLighting · MatafFloor · Arcade · HaramLandmarks
│                       · Guards · TawafCrowd · PigeonFlock · CameraRig
├─ analyze/page.tsx                  (المصدر والنتائج جنبًا إلى جنب)
│  ├─ SourcePanel
│  │  ├─ SourceSelector              (تلقائي من السجل · رابط · صورة · فيديو)
│  │  ├─ SourceStatusBadge           (القدرة + حالة الاتصال، aria-live)
│  │  ├─ StreamViewer                (YouTubeEmbed | HlsPlayer) · MediaPreview
│  │  └─ ImageDropzone | VideoUploader (UploadProgress) | StreamUrlForm
│  ├─ ResultsPanel
│  │  ├─ AnalysisStages              (SSE مع fallback polling)
│  │  ├─ DensityCard → DensityGauge · CrowdIndex (مع تعريفه) · CountRange · ConfidenceBadge
│  │  ├─ QualityCard
│  │  ├─ FreshnessStamp              (وقت الالتقاط، وعمر القراءة، و«قديمة»)
│  │  ├─ TrendChart                  (جلسة المراقبة فقط)
│  │  ├─ DemographicEstimate         (تجريبي، مخفي افتراضيًا)
│  │  └─ EstimateDisclaimer · AnalysisDisclosure
│  ├─ MonitoringControls             (تشغيل / إيقاف، الفاصل، الحدود)
│  └─ ErrorState (حسب ErrorCode)
└─ analyze/[id]/page.tsx             (نتيجة قابلة للمشاركة برابط)
shared/ui: Button · Card · ConfidenceBadge · AnimatedNumber · VisuallyHidden · DirectionalIcon
shared/hooks: useDirection
```

**مشغلات البث:**
- `YouTubeEmbed`: IFrame API الرسمي، بلا تعديل على المشغل أو تغطية لعلامة يوتيوب، وبحجم يسمح بظهور عناصره. لا canvas ولا التقاط.
- `HlsPlayer`: `<video>` أصلي على Safari، وعلى غيره مكتبة `hls.js` **فقط إذا** ثبت في المرحلة 3 أن لدينا مصدر HLS مرخص للعرض (القاعدة 7). العرض في المتصفح منفصل عن الاستقبال في الخادم.

**الانتقال إلى `/analyze`:** رابط عادي من `next-intl/navigation` مع prefetch. الانتقال السينمائي (اقتراب الكاميرا ثم تلاشٍ ذهبي) مؤجل إلى المرحلة 8، ولا يؤخر التنقل.

**المشهد 3D، الحل المعتمد (SPEC §3.3):** هندسة إجرائية low-poly بدل نماذج GLTF ثقيلة:
- الكعبة صندوق بمواد PBR، والحزام الذهبي شريط بنقش هندسي تجريدي. لا نحاول رسم خط قرآني، احترامًا وتجنبًا لأي خطأ.
- الطائفون ثلاث `InstancedMesh` (lathe geometry بلا ملامح). الحركة عكس عقارب الساعة، والسرعة وأنصاف الأقطار متفاوتة لكل instance.
- اتجاه الطواف وحركة الكاميرا **ثابتان في اللغتين** لأنهما واقع مكاني لا اتجاه قراءة. ما ينعكس هو طبقة الواجهة فوق المشهد فقط.
- الأعداد حسب مستوى الجهاز: 400 على الديسكتوب، و220 على الجوال، و120 على الأجهزة الضعيفة (60% إحرام، و32% عباية، و5% رجال يحملون طفلًا، و3% أمهات يحملن طفلًا في أذرعهن، ثم 3.5% أطفال يمشون مع أب أو أم تُخصم من الكل بنسبه). يبدأ المستوى من إشارات الجهاز، و`PerformanceMonitor` من drei ينزله خطوة فقط عند انخفاض مستمر في الإطارات، بعد 3 ثوانٍ من التحميل. بلا `flipflops`/`onFallback`، لأن drei يعدّ كل ارتفاع في الأداء «flip»، فكان الجهاز السريع ينزل إلى الأدنى.
- **شكل المسارات (المهمة 1.1):** أقرب مسار على 0.5 م من الشاذروان ومن الوجه الخارجي لجدار الحِجر (مع غطائه)، بين جسم الطائف متوسط العرض والجدار. كل مسار بعده أبعد بمسافة بين المسارات، فالمسارات الداخلية مستطيل بزوايا مدورة ونصف قطع ناقص حول الحِجر. خلال 7 م (`TAWAF.shapeBlend`) تتحول تدريجيًا إلى الحلقات القديمة نفسها (دائرة 9.7 م بانتفاخ حول الحِجر)، فلا يتغير شيء حول المقام وما بعده.
  - **الحساب:** `laneShapeRadius` في `lib/tawaf.ts`، حيث حد الشاذروان حل مباشر، وحد الحِجر بحث ثنائي. كل مسار يُحسب مرة واحدة (720 عيّنة) ويُخزَّن.
  - **الحركة:** الطائف يتقدم بالمسافة المقطوعة على مساره (`lanePoint`)، لا بالزاوية، فسرعته ثابتة عند الأركان وحول الحِجر، وخطواته تطابق الأرض. سرعة «الطور» واحدة لكل ممر، فتبقى المجموعات معًا.
  - **الحراس:** المسارات القريبة تنحرف عن كل حارس حتى تبعد عنه 1 م على الأقل من مركز إلى مركز (`TAWAF.guardKeepOut`)، ويتلاشى الانحراف خلال 3 م عبر المسارات وعلى طولها. ومواضع الحراس في `guardFloorPositions`، وعليها اختبار يطابقها مع `guardPlacements`.
- الطائفون يلتفون حول مقام إبراهيم بالتفاف ناعم في نصف القطر (`aroundMaqam` في `lib/tawaf.ts`)، ويظهرون بعد أول إطارين حتى لا تلتقطهم ظلال الأرضية التي تُرسم مرة واحدة. ومع reduced-motion يقفون ثابتين.
- الطائفون في حلقات متباعدة 0.9 م، لكل حلقة سرعتها وفراغ أدنى بين أفرادها، فلا تداخل بلا حساب تصادم في كل إطار. المشي (تأرجح الساقين والذراعين وتمايل طرف الثوب) في الـ vertex shader (`walkerMaterial.ts`) من طور خطوة لكل نسخة، والتنوع (البشرة والشعر والتسريحة) بخصائص لكل نسخة (`InstancedBufferAttribute`)، لا بنماذج إضافية. والطول والعرض بمقياس غير متساوٍ في مصفوفة كل نسخة، والفراغ الأدنى بين الجارين يتبع عرضيهما. وأطوال الشعر الستة وحجم الطفل المحمول وجنسه ولون لباسه يشكّلها الـ shader من خصائص النسخة، بلا نماذج إضافية. وذراعا من يمسك طفلًا أو والدًا تُرفعان في الـ shader أيضًا. **قيد:** WebGL يسمح بـ 16 خانة attributes، ومصفوفة النسخة تأخذ 4، فالخصائص مضمومة (`aChildLook` = الحجم، والجنس، ورفع الذراعين)، وعليه اختبار.
- المجموعات (زوجان، وعائلة، وأصدقاء، نحو 38%): الحلقات مقرونة في «ممرات» من حلقتين بسرعة زاوية واحدة، فتمشي المجموعة جنبًا إلى جنب بلا تفرق. والمقام بين ممرين، والتعبئة بمؤشر لكل حلقة.
- `reduced-motion`: كاميرا ثابتة وحركة شبه متوقفة.
- الـ Poster نفسه لقطة حقيقية من المشهد تُلتقط بـ Playwright في المرحلة 1.
- **في التوزيع الجديد** يصغر عرض المشهد إلى نحو نصف الشاشة على الديسكتوب، فقد تحتاج زاوية الكاميرا المعتمدة (المسافة 78، والارتفاع 22°) إلى تعديل الإطار (framing) فقط. أي تعديل عليها يحتاج موافقة المستخدم.

**أبعاد الكعبة (في `src/components/scene/lib/layout.ts`):** الأبعاد من الأرقام الموثقة، والصور القريبة للشكل فقط.
- **الجدران:** المشهد مستطيل بمتوسط كل جدارين متقابلين: **12.48 × 11.40 م**.
  - جدار الباب (الملتزم) 12.84 ومقابله 12.11.
  - جدار الحِجر 11.28 ومقابله 11.52.
  - مجموعها 47.75 م يطابق طول الحزام الموثق 47 م (ويكيبيديا Kiswah).
- **الحزام:** عرضه 0.95 م، و16 قطعة (4 لكل جهة).
- **الباب:** 1.71 × 3.18 م، وأسفله على 2.22 م (ويكيبيديا العربية).
- **موضع الباب:** مركزه على 3.26 م من ركن الحجر الأسود، من الصورة 51 الأمامية. هذا يجعل الملتزم 2.40 م، والرقم المتداول «نحو 2 م».
- **الارتفاع (14 م):** المصادر فيه متعارضة (13.1 و14 و15)، فأُبقي كما اعتُمد.
- **الستارة:** عرضها 3.47 م من الصورة 51 الأمامية (0.278 من الجدار)، ويتفق مع ويكيبيديا Kiswah (3.5 م). ارتفاعها 6.04 م، من الخط الواحد تحت الحزام إلى 0.3 م فوق أسفل الباب. التفاصيل في `docs/PHASE2-HANDOFF.md`.
- **مقاسات الزخارف** غير موثقة، فهي مقيسة من صور نسبةً إلى الحزام.

**الحراس (في `src/components/scene/figures/guards.ts`):**
- أربعة حراس ثابتون بلا ملامح ولا شارات: عند الحجر الأسود ببريهة حمراء (على درجة رخامية مستقلة خلف قطعة الرخام)، وعند الركن اليماني وبوابتي الحِجر ببريهة سوداء. مواضعهم في `GUARDS` داخل `layout.ts`.
- نموذج واحد تبنيه دالة واحدة، والوقفة معامل فيها (استرح، أو ذراع ممدودة تُحل بعظمتين). الأربعة ثابتون، فيُدمجون في هندسة واحدة بألوان في الرؤوس: draw call واحد.
- التمويه بثلاث درجات لكل مثلث من موضعه في العالم (value noise)، بلا texture.
- علاقة حارس الحجر الأسود: قماش أسود مطوي (TubeGeometry على منحنى مغلق) مع شبكة الحراس، وحلقتها مع المعادن، فلا draw call إضافي.

## C. Data Models
كل النماذج Zod في `src/lib/schemas/`، والأنواع عبر `z.infer`.

```ts
Locale           = "ar" | "en"
PlaceType        = "haram" | "square" | "stadium" | "station" | "event" | "other"
SourceProvider   = "youtube" | "hls" | "file"
PermissionBasis  = "license" | "written_permission" | "user_owned" | "none"
Source           = { id; provider; placeType; placeName; locator;
                     display:{ allowed; evidenceUrl }; analyze:{ basis: PermissionBasis; evidenceUrl? };
                     status:"candidate"|"active"|"retired"; reviewedAt;
                     health:"ok"|"degraded"|"down"|"unknown"; uptimeEwma; breakerUntil?; lastCheckedAt? }
SourceCapability = "display_and_analyze" | "display_only" | "unavailable"   // مشتق، لا يُخزَّن
ConnectionState  = "connecting" | "connected" | "stalled" | "recovering" | "switching" | "no_source"
SourceInput      = { kind:"image"|"video"; mime; bytes } | { kind:"stream"; sourceId } | { kind:"stream"; url }
Frame            = { index; capturedAt; width; height; localQuality:{ sharpness; brightness; entropy }; dhash }
FrameAnalysisRaw = /* SPEC §7.2 حرفيًا، snake_case */
CrowdEstimate    = { index:0–100; level:"low"|"moderate"|"high"|"unknown";
                     personCount:{ min; max } | null; confidence }
DemographicEstimate = { men; women; unclear; confidence; basis:"attire"; experimental:true } // المجموع = 1
QualityAssessment   = { sourceQuality; visibility; overallConfidence;
                        reliability:"reliable"|"limited"|"insufficient";
                        decisionReady:boolean; issues: QualityIssue[] }
Analysis         = { id; status:"queued"|"processing"|"completed"|"failed"; stage?: Stage;
                     source:{ kind; sourceId?; receivedAt; timeTrust };
                     analyzer:"claude-vision"|"mock"; model?; promptVersion; isMock;
                     frames:{ sampled; used; discarded }; sceneType;
                     crowd?; demographics?: DemographicEstimate | null; quality?; costUsd?; error?: ApiError }
Reading          = { id; analysisId?; sessionId?; sourceId?; sceneContextId; placeType;
                     capturedAt; analyzedAt; timeTrust:"live"|"user_confirmed"|"unknown";
                     crowd; quality; demographics?; analyzer; model?; promptVersion; isMock }
MonitoringSession = { id; sourceId; state:"running"|"stopped"; intervalSec; maxDurationMin;
                      startedAt; endedAt?; endReason?; framesAnalyzed; costUsd }
Trend            = { direction:"rising"|"steady"|"falling"; slopePerMin; readings:number; windowMin } | null
SourceEvent      = { at; kind:"switch"|"stall"|"recovered"|"no_source"; from?; to?; reason }
Stage            = "receiving" | "extracting_frames" | "estimating_density" | "validating"
ApiError         = { code: ErrorCode; message /* بلغة الطلب */; hint? }
ErrorCode        = "unsupported_format" | "file_too_large" | "video_corrupt" | "image_unclear"
                 | "invalid_url" | "private_address" | "stream_unreachable" | "display_only_source"
                 | "embed_disabled" | "source_lost" | "no_alternative_source"
                 | "no_people" | "not_a_crowd_scene" | "too_dense_to_estimate" | "insufficient_quality"
                 | "analysis_failed" | "timeout" | "rate_limited" | "cost_cap_reached"
                 | "network" | "stale_reading" | "not_found"
// لاحقًا (المرحلة 7):
Need             = "family" | "individual" | "group" | "easier_mobility"
Suitability      = { need; assessment; reasons:{ code; params }[]; confidence; dataSufficiency }
```

## D. API Contract
كل الأخطاء بشكل واحد: `{ error: ApiError }` مع HTTP status المناسب.

**لغة الاستجابة:** من cookie `NEXT_LOCALE`، ثم `Accept-Language`، ثم `ar`. يُعاد `message` و`hint` بتلك اللغة، والواجهة تعتمد على `code`.

| Method · Path | Request | Response |
|---|---|---|
| `POST /api/analyses?kind=image\|video[&capturedNow=1]` | جسم خام، و`Content-Type` هو نوع الملف | `202 { analysisId }` · 400 / 413 / 415 / 429 |
| `POST /api/analyses` | `{ kind:"stream", sourceId }` أو `{ kind:"stream", url }` | `202 { analysisId }` · 400 `invalid_url` / `private_address` / `display_only_source` · 429 |
| `GET /api/analyses/:id/events` | SSE (يدعم `Last-Event-ID`) | `stage` · `completed` · `failed`، ونبضة كل 15 ثانية |
| `GET /api/analyses/:id` | — | `200 Analysis` · 404 |
| `GET /api/sources?placeType=&capability=` | — | `200 { sources: (Source & { capability })[] }` مرتبة (A.4.4)، بلا مرشحين غير مراجَعين |
| `POST /api/sources/next` | `{ currentSourceId, reason, capability }` | `200 { source } ` · `404 no_alternative_source` |
| `POST /api/monitoring` | `{ sourceId, intervalSec? }` | `201 { sessionId }` · 400 `display_only_source` · 429 |
| `GET /api/monitoring/:id/events` | SSE | `reading` · `trend` · `source` (حالة الاتصال والتبديل) · `ended` |
| `DELETE /api/monitoring/:id` | — | `204` |
| `GET /api/prayer-times[?date=]` | — | `200 PrayerTimes` (cache يومي) |
| *(المرحلة 7)* `GET /api/suitability?need=&sourceId=` | — | `200 Suitability` |

- **الحدود (في الإعدادات):** صورة ≤ 15MB (JPEG/PNG/WebP/HEIC)، فيديو ≤ 150MB و≤ 5 دقائق (MP4/MOV/WebM)، و`maxFrames` = 12 للفيديو.
- **Rate limiting:** token bucket في الذاكرة لكل IP على `POST /api/analyses` و`POST /api/monitoring`. الـ IP لا يُخزَّن.
- **سقف التكلفة:** لكل تحليل، ولكل جلسة، وسقف يومي عام (`DAILY_COST_CAP_USD`). عند بلوغه: `cost_cap_reached`.
- **Timeouts:** Anthropic 30 ثانية لكل إطار · Aladhan 8 ثوانٍ · جلب الـ playlist 8 ثوانٍ · ffmpeg للبث 25 ثانية · التحليل كاملًا 3 دقائق.

## E. خطة التنفيذ

### E.1 المراحل
| # | المرحلة | المخرجات | تُعتبر منتهية عندما |
|---|---|---|---|
| 0 | المراجعة والتخطيط | هذا الملف و`SPEC.md`، وG وH وI | موافقة المستخدم |
| 1 | الواجهة الافتتاحية | المهام 1.1 إلى 1.10 في E.3: إصلاح العيوب البصرية · `HeroLayout` بعمودين والجوال عمودي · `PrimaryCta` · الحمام · `HeroPoster` وبديل WebGL وفقد السياق · إيقاف الرسم خارج الشاشة · `MotionConfig` · نصوص لا تَعِد بما لم يُبنَ | الزر ظاهر دون تمرير على 390×844 · بديل ثابت عند تعطيل WebGL · reduced-motion · 30 draw call و150 ألف مثلث · قياس على جوال بمعالج مخفّض 4× · لقطات Playwright الأربع |
| 2 | أول مسار تحليل | `zod` · `@anthropic-ai/sdk` · `sharp` · `ffmpeg-static` · Drizzle · `ClaudeVisionAnalyzer` و`MockAnalyzer` · التجميع · Job runner وSSE (بتنفيذ يعمل على Vercel، A.3) · صفحة `/analyze` (صورة ثم فيديو) · تسجيل التكلفة · تجربة النماذج (I.4) | صورة حقيقية من البداية إلى النهاية · فيديو بتقدم حقيقي · اختبارات التجميع والتحقق · مجموعة الاختبار الموسومة الأولى (H.2) · تقرير المقارنة بالدقة والتكلفة معروض على المستخدم |
| 3 | صفحة البث والنتائج | `StreamViewer` · `SourceStatusBadge` · `FreshnessStamp` · كل حالات الخطأ · استقبال HLS بحارس SSRF | كل `ErrorCode` له واجهة · اختبارات SSRF (redirect، وvariant داخلي، وDNS rebinding) |
| 4 | المصادر والتبديل | `sources.ts` · الفحص المجدول · الترتيب · آلة التبديل · `source_events` | اختبارات الترتيب وتأكيد الانقطاع والتبديل وسياق المشهد · مصدر `display_only` ومصدر `display_and_analyze` يظهران مختلفين |
| 5 | المراقبة | `MonitoringSession` · gate التغير · الاتجاه · `TrendChart` | جلسة تبدأ وتتوقف بحدودها · اتجاه من قراءات قابلة للمقارنة فقط · لا Mock في الاتجاه |
| 6 | الدقة والتمثيل | تقرير دقة على مجموعة الاختبار · قرار `DetectorAnalyzer` · تمثيل مكاني إن ثبتت مخرجاته | أرقام دقة منشورة في هذا الملف |
| 7 | الملاءمة والتنبؤ | `server/suitability/` · `server/forecast/` | اختبارات (بيانات كافية / ناقصة) · MAE/RMSE مقابل خط الأساس |
| 8 | المراجعة النهائية | الأمان، والخصوصية، والتكلفة، والأداء، واللغتان، والوصولية، والتلميع | SPEC §16 |

بعد كل مرحلة: تشغيل، ومراجعة بصرية بـ Playwright على 390px و1440px **باللغتين**، وإصلاح، ثم ملخص. أي ميزة لا تُعتبر منتهية إلا بنصوصها في `ar.json` و`en.json` معًا.

**الـ Dependencies وسبب كل منها:**

| المكتبة | سبب وجودها | متى |
|---|---|---|
| `next` · `react` · `typescript` · `tailwindcss` | الأساس | مثبتة |
| `next-intl` | الترجمة، ومسارات اللغتين | مثبتة |
| `motion` | الحركة | مثبتة |
| `three` · `@react-three/fiber` · `@react-three/drei` | المشهد | مثبتة |
| `zod` | العقود والتحقق | المرحلة 2 |
| `@anthropic-ai/sdk` | المحلّل | المرحلة 2 |
| `sharp` | تصغير يقلل التكلفة، وإزالة الـ metadata، وقياس الجودة وdHash محليًا | المرحلة 2 |
| `ffmpeg-static` | لا يوجد ffmpeg على الجهاز، وهذا يضمن نسخة ثابتة | المرحلة 2 (الفيديو) |
| `drizzle-orm` · `better-sqlite3` · `drizzle-kit` (dev) | قاعدة البيانات والترحيل | المرحلة 2 |
| `hls.js` | تشغيل HLS في غير Safari، **فقط** إذا وُجد مصدر HLS مرخص للعرض | المرحلة 3، مشروط |
| `vitest` (dev) | الاختبارات | مثبتة |

**لا:** مكتبة UI جاهزة، ولا state manager، ولا axios، ولا مكتبة multipart، ولا مكتبة cron، ولا n8n في الـ MVP (G).

**متغيرات البيئة (`.env.local`، مع `.env.example`):** `ANTHROPIC_API_KEY` · `ANTHROPIC_MODEL` · `ANALYZER=claude|mock` · `DATABASE_URL` · `DAILY_COST_CAP_USD` · `YOUTUBE_API_KEY` (المرحلة 4، اختياري) · `DEMOGRAPHICS_EXPERIMENT=0|1`.

### E.2 القرارات المعتمدة (2026-10-15)
| # | القرار | نص قرار المستخدم (مختصر) | أثره في الوثائق |
|---|---|---|---|
| 1 | اتجاه المنتج | **اعتماد مع تعديل:** تحليل الحشود هو الوظيفة الأساسية، والتوصيات تأتي بعد التحليل وتعتمد على جودة النتائج والبيانات المتاحة. تقدير الرجال والنساء تجريبي وليس شرطًا لإطلاق النسخة الأولى | SPEC §0 و§7.4 |
| 2 | الواجهة الإنجليزية | التوزيع ينعكس مع اتجاه اللغة: بالعربية النص يمينًا والمشهد يسارًا، وبالإنجليزية النص يسارًا والمشهد يمينًا | SPEC §3.1، والمهمة 1.6 |
| 3 | المشهد والشخصيات | اعتماد الهوية والشكل الحاليين **مبدئيًا**، ثم تحسين التفاصيل بعد اختبار الأداء الفعلي. لا إعادة بناء للمشهد دون مبرر | SPEC §3.3، وE.3 وE.4 |
| 4 | الترحيب والانتقالات | تأجيل التسلسل الترحيبي الطويل والانتقالات المعقدة، مع الإبقاء على مشهد 3D وزر دخول واضح وسريع إلى صفحة الرصد | SPEC §3.2 و§3.5 |
| 5 | الاسم | Sakinah مع الوصف الفرعي **Crowd Intelligence** بدل Haramain | SPEC (الرأس)، والمهمة 1.8 |
| 6 | نموذج الرؤية | مقارنة النماذج الثلاثة على مجموعة اختبار واحدة، بالجودة والتكلفة. **سقف التجربة الكلي $20**، ولا إنفاق شهري متكرر قبل عرض النتائج والتكلفة. المقارنة وحدها ليست إثباتًا للدقة دون تقييم مناسب | SPEC §7.5، وI.4 |
| 7 | الاستضافة | مرنة: الواجهة يمكن نشرها على Vercel، وتُقيَّم خدمة دائمة التشغيل للبث والمراقبة عند الحاجة الفعلية. لا تكلفة استضافة متكررة دون موافقة | A.1 وA.3 |
| 8 | إذن بث الحرم | تجهيز متطلبات طلب الإذن الرسمي، دون جعله شرطًا لتطوير بقية المشروع أو اختبار مصادر أخرى مسموح بها | H.4 |
| 9 | `CLAUDE.md` | تحديثه ليتوافق مع SPEC وARCHITECTURE، مركزًا وواضحًا | نُفّذ في هذا الـ commit |

**مؤجل إلى ما بعد مراجعة المرحلة 1:** دمج `phase-2/intro-hero` في `main`.

**التبعيات الخارجية للمراحل:**
| ما نحتاجه | متى | يوقف المرحلة 1؟ |
|---|---|---|
| مفتاح Anthropic API | المرحلة 2 (أول تحليل حقيقي). بدايتها ممكنة بالـ Mock | لا |
| ميزانية تجربة النماذج ($20 كحد أقصى) | المرحلة 2 | لا |
| مفتاح YouTube Data API (اختياري، حصة مجانية) | المرحلة 4 | لا |
| خدمة دائمة التشغيل (بموافقة) | المرحلتان 4 و5 | لا |
| إذن بث الحرم | غير مرتبط بمرحلة، ويوسع المصادر فقط | لا |

### E.3 مهام المرحلة 1 (بالترتيب)
**قواعد التنفيذ:** مهمة واحدة في كل مرة، ولكل مهمة commit مستقل، ثم توقف لمراجعة المستخدم قبل التالية. كل مهمة تنتهي و`npm run check` و`npm run build` ناجحان، والـ console في الإنتاج فارغ، وميزانية المشهد محفوظة (30 draw call و150 ألف مثلث على الديسكتوب) ما لم تذكر المهمة غير ذلك. اللقطات تُحفظ في `.playwright-mcp/` (خارج Git). أي تعديل على الكاميرا المعتمدة أو الكعبة أو وقفة حارس الحجر الأسود يحتاج موافقة صريحة.

| # | المهمة | النطاق | تعتمد على | شروط الإنجاز |
|---|---|---|---|---|
| **1.1** ✅ | **إصلاح فراغ الطائفين بجانب الكعبة والحِجر** (العيب V1 في E.4). **منفذة، والأرقام في E.4، بانتظار اعتماد المستخدم** | **المشكلة:** شريط خالٍ من الطائفين بين جدران الكعبة وأقرب الطائفين، وحول جدار الحِجر الخارجي، فتنقطع استمرارية الطواف. **المكان المتوقع:** أوضح ما يكون في منتصف كل جدار، وعلى طول جدار الحِجر الخارجي. **أول خطوة:** إثبات السبب بالقياس قبل أي تعديل (الأسباب في E.4 فرضيات لم تُثبت). **خارج النطاق:** شكل الشخصيات وعددها ونسبها، والكعبة، والكاميرا | — | (1) قياس آلي قبل وبعد: أقصى مسافة بين حد الكعبة (مع الشاذروان) أو جدار الحِجر وأقرب مسار طواف، على طول المحيط كله، تنزل من القيمة المقيسة الآن إلى حد يُتفق عليه بعد القياس، ويُضاف لها اختبار. (2) الاختبارات القائمة تبقى ناجحة: لا دخول في الكعبة ولا الشاذروان ولا الحِجر، ولا تداخل بين الطائفين، والالتفاف حول المقام والحراس، والكثافة تقل كلما ابتعدنا، والطواف عكس عقارب الساعة. (3) لقطات قبل وبعد: من الأعلى، والكاميرا الافتراضية على الديسكتوب والجوال، وقرب جدار الباب، وقرب الحِجر. (4) الأداء لم يتغير (نفس draw calls والمثلثات). (5) اعتماد المستخدم بصريًا |
| **1.2** | **تحديد الأشكال السوداء الطويلة وإصلاحها** (العيب V2) | **المشكلة:** شكلان أسودان طويلان بجانب الكعبة يبدوان كخلل. **أول خطوة:** تحديد العنصر بالضبط من لقطة المستخدم أو من الموضع الذي يحدده، ثم التحقق هل يبقى في مكانه مع الوقت (هندسة ثابتة) أم يتحرك (طائفون). **ثم:** إصلاح السبب المثبت فقط | 1.1 (تغيير المسارات قد يغير الأشكال، فيُعاد الفحص بعده) | السبب مثبت بلقطة قبل التعديل · الشكلان لا يظهران في لقطات بالكاميرا الافتراضية خلال دقيقة كاملة (لقطة كل 5 ثوانٍ) · لا تراجع في الاختبارات أو الأداء · اعتماد المستخدم |
| **1.3** | **مراجعة المشهد بعد الإصلاحين** | جولة لقطات ثابتة بزوايا محددة (الكاميرا الافتراضية، والأعلى، وكل جهة) على الديسكتوب والجوال، لتسجيل أي عيب آخر في E.4. **لا إصلاحات** في هذه المهمة | 1.1، 1.2 | قائمة العيوب في E.4 محدّثة، وكل عيب جديد له وصف وموضع ولقطة. يقرر المستخدم ما يُصلح الآن وما يؤجل |
| **1.4** | **قياس الأداء الفعلي (خط الأساس)** | سكربت قياس قابل للإعادة: draw calls، والمثلثات، والإطارات في الثانية بعد الاستقرار، ووقت أول إطار، والذاكرة. على الديسكتوب، وعلى محاكاة جوال بمعالج مخفّض 4×، وبالمستويات الثلاثة. **قياس فقط**، والتحسين مهمة لاحقة إن لزم | 1.3 | جدول أرقام في هذا الملف مع طريقة القياس · قرار مكتوب: هل يحتاج المشهد تحسينًا قبل إضافة الحمام؟ |
| **1.5** | **الحمام** | سرب حمام بـ instancing يحلق فوق المطاف، بلا ملامح، ومتوقف مع reduced-motion، وعدده حسب مستوى الجهاز | 1.4 | يبقى ضمن الميزانية المتبقية المقيسة في 1.4 · اختبار للعدد والميزانية · لقطات · اعتماد المستخدم |
| **1.6** | **التوزيع الجديد للصفحة الافتتاحية** | عمودان على ≥ 1024px، ينعكسان مع اللغة (القرار 2)، وعمودي على الجوال (المشهد في الأعلى ثم النص). إعادة تأطير المشهد في عمود. **بلا** زر ولا صفحة جديدة | 1.5 | لقطات 390 و1440 باللغتين · لا خصائص فيزيائية (lint) · الكعبة ظاهرة كاملة في العمود · أي تغيير في الكاميرا معروض على المستخدم قبل اعتماده |
| **1.7** | **زر «تحليل الكثافة» وصفحة الرصد الأولية** | زر أساسي في عمود النص يفتح `/[locale]/analyze`. الصفحة في هذه المرحلة تعرض عنوانها، وشرحًا صادقًا بأن التحليل يُبنى في المرحلة 2، ورابط عودة. لا عناصر رفع ولا أزرار لا تعمل. الفرع لا يُدمج في `main` قبل أن تعمل الصفحة فعليًا | 1.6 | الزر ظاهر دون تمرير على 390×844 · يعمل بلوحة المفاتيح، وهدف اللمس ≥ 44px · الصفحة باللغتين · لا رابط ولا زر ميت |
| **1.8** | **النصوص والهوية** | الوصف بلا وعود غير منفذة، والوصف الفرعي «Crowd Intelligence»، و`metadata.title` و`description`، وسطر الخصوصية في الـ Footer بلا ذكر التوصيات. باللغتين | 1.7 | اختبار تطابق المفاتيح ناجح · مراجعة الصياغة الإنجليزية · لا نص يَعِد بميزة غير موجودة |
| **1.9** | **الصورة البديلة والمتانة** | `HeroPoster` (لقطة حقيقية من المشهد النهائي بعد 1.5 و1.6) بصفتها LCP، وبديل عند تعذر WebGL، وعند فقد السياق (`webglcontextlost`)، وإيقاف الرسم خارج الشاشة وعند إخفاء التبويب، و`MotionConfig reducedMotion="user"` | 1.6 | تعطيل WebGL في المتصفح يُظهر الصورة لا خلفية سوداء · محاكاة فقد السياق تعيد الصورة · reduced-motion يوقف الحركة · LCP مقيس قبل وبعد |
| **1.10** | **التحقق النهائي للمرحلة** | إعادة قياس 1.4، ولقطات Playwright الأربع للصفحتين، ولوحة المفاتيح وقارئ الشاشة، و`code-review` و`security-review`، وتحديث README وهذا الملف وقسم المرحلة 1 في `INTERVIEW-NOTES.md`، وتحديث `PHASE2-HANDOFF.md` | 1.1–1.9 | كل شروط المرحلة 1 في E.1 · تقرير بما ثبت وما بقي · مراجعة المستخدم، ثم قرار الدمج |

### E.4 العيوب البصرية المعروفة في المشهد
**مصدر المعلومات:** وصف المستخدم (2026-10-15)، وفحص الكود، ولقطات فحص من خادم التطوير بالكاميرا الافتراضية ومن الأعلى ومن جهتي الباب والركن الشامي (`.playwright-mcp/p0-*.png`، خارج Git). **لم يُعدَّل أي كود.** الأسباب أدناه فرضيات تحتاج إثباتًا في مهمتها قبل أي إصلاح.

#### V1: فراغ بلا طائفين بجانب جدار الكعبة ومنطقة الحِجر (المهمة 1.1): ✅ أُصلح، بانتظار اعتماد المستخدم
**السبب المثبت بالقياس:** الفرضيتان 1 و2 أدناه. خط الطواف كان دائرة 9.7 م مضبوطة على الأركان، وأقرب مسار كان على إزاحة 1.63 م منها. والانتفاخ حول الحِجر لم يتبع شكل جداره.

**أقرب طائف من الجدار** (400 طائف على مدى 6 دقائق، عند منتصف كل جدار ±8°، وحول الحِجر). المسافة إلى حافة الشاذروان أو الوجه الخارجي للحِجر:

| الموضع | قبل: من المركز / من حافة الجسم | بعد: من المركز / من حافة الجسم |
|---|---|---|
| منتصف جدار الباب | 5.07 / 4.76 م | 0.77 / 0.46 م |
| منتصف الجدار الجنوبي الغربي | 5.07 / 4.78 م | 0.77 / 0.46 م |
| منتصف الجدار الجنوبي الشرقي | 4.53 / 4.23 م | 0.77 / 0.46 م |
| قمة الحِجر | 3.13 / 2.82 م | 0.76 / 0.44 م |
| جانبا الحِجر | 2.21 / 1.90 م | 0.77 / 0.45 م |

**الأداء** (نسخة الإنتاج، والمتصفح في الواجهة):

| | قبل | بعد |
|---|---|---|
| Draw calls (كمبيوتر / جوال) | 23 / 23 | 23 / 23 |
| مثلثات (كمبيوتر / جوال) | 133,287 / 90,163 | 133,287 / 90,163 |
| FPS (كمبيوتر 1440 / جوال 390، شاشة 144Hz) | 144.2 / 117.5 | 144.2 / 117.7 |
| تحديث 400 طائف في الإطار (Node) | 0.26 ms | 0.40 ms |
| بناء الطائفين عند التحميل (مرة واحدة) | 5.6 ms | 29.4 ms |

- **قيد القياس:** FPS من متصفح Playwright بعد تفعيل محاكاة التركيز. بدونها يُبطّئ المتصفح النافذة غير الظاهرة إلى نحو 1 إطار في الثانية.
- **اللقطات:** `.playwright-mcp/t11-before-*` و`t11-after-*` و`t11-compare-*` (خارج Git): من الأعلى، والكاميرا الافتراضية على الكمبيوتر والجوال، وقرب جدار الباب، والحِجر، والجدار الجنوبي الشرقي. التُقطت مع تقليل الحركة، فيقف الطائفون في نفس اللحظة (t=0) قبل وبعد.
- **الاختبارات الجديدة** (`tests/tawaf.test.ts` و`tests/guards.test.ts`):
  - لا يدخل أي طائف الكعبة ولا الشاذروان ولا الحِجر: أقل مسافة من حافة الجسم أكبر من 0.4 م.
  - أقرب الطائفين بين 0.4 و0.6 م من الجدار في كل قطاع.
  - المسار الداخلي على مسافة ثابتة من الجدران، والخارجية هي الحلقات القديمة.
  - المسارات لا تتقاطع.
  - السرعة ثابتة على المسار.
  - المسار الداخلي يبتعد عن كل حارس.
  - **وبقيت ناجحة:** عدم التداخل، والمقام، والحراس، والطواف عكس عقارب الساعة، والكثافة الأعلى قرب الكعبة، والمجموعات.

- **ما ظهر في اللقطات:** من الأعلى، الطائفون يبدؤون على دائرة حول الكعبة، فيبقى شريط خالٍ بين كل جدار وأقرب الطائفين، أعرض ما يكون في منتصف الجدار وأضيق عند الأركان. وحول جدار الحِجر الخارجي يظهر فراغ أيضًا.
- **فرضية 1 (الجدران)، وأرقامها من الكود:** خط الطواف (`clearanceRadius` في `lib/tawaf.ts`) دائري نصف قطره `CLEARANCE.base = 9.7` م من مركز الكعبة، وهو محسوب ليبعد عن **الأركان** (حافة الشاذروان عند الركن على نحو 9.1 م). وأقرب مسار يبدأ بعد إزاحة لا تقل عن `TAWAF.offset[0] = 0.8` م، فأقرب طائف على نحو 10.5 م أو أبعد. أما وجه الجدار مع الشاذروان ففي منتصفه على 6.15 م (جدار الباب ومقابله) و6.69 م (جدار الحِجر ومقابله). **الفراغ المتوقع في منتصف الجدار نحو 3.8 إلى 4.4 م**، وينكمش إلى نحو 1.4 م عند الركن. هذا يطابق شكل الفراغ في لقطة الأعلى، ولم يُقس بعد بدقة.
- **فرضية 2 (الحِجر):** انتفاخ الخط حول الحِجر بشكل `cos²` على ±50° حول المحور (`hijrBulge = 7.5`)، وليس على شكل القطع الناقص للحِجر (`HIJR.radiusX = 8.4` و`radiusZ = 4.9`). عند قمة الحِجر يكون الخط على 17.2 م، وأقرب طائف على 18 م تقريبًا، بينما الوجه الخارجي لجدار الحِجر على نحو 15.4 م: **فراغ قرابة 2.6 م**، يتفاوت على طول القوس لأن شكل الانتفاخ يختلف عن شكل الجدار.
- **فرضية 3 (ثانوية):** كل ممر يُملأ حتى نصفه فقط (`tryPlace` يرفض ما يتجاوز π)، فقد تظهر فراغات متفرقة في المسارات الداخلية. لا تفسر الشريط المنتظم، لكنها قد تزيده.
- **قيود الإصلاح:** اختبارات `tests/tawaf.test.ts` القائمة تمنع دخول الكعبة والشاذروان والحِجر، وتداخل الطائفين، ومرورهم في المقام والحراس، وتضمن أن الكثافة تقل مع البعد. كل ذلك يبقى ناجحًا.

#### V2: شكلان أسودان طويلان بجانب الكعبة (المهمة 1.2)
- **ما ظهر في اللقطات:** في لقطة بالكاميرا الافتراضية ظهرت عند حافة الكعبة اليمنى (قرب فتحة الحِجر) أعمدة سوداء طويلة ملاصقة لجدارها. التكبير أظهر أنها في تلك اللقطة **طائفات بعباءات سوداء** يقف بعضهن خلف بعض على خط النظر، فتندمج أجسامهن في شكل واحد طويل، ويندمج طرفها مع سواد الكسوة خلفها. بعد 9 ثوانٍ لم يكن في نفس الموضع شيء ثابت مماثل.
- **فرضية 1 (الأرجح من الفحص):** تراكب طائفات بعباءات على خط النظر، مع ضعف التباين: مادة العباءة شبه سوداء بلا إضاءة حافة، فتقرأ كمقطع أسود مسطح أطول من الإنسان، خصوصًا أمام الكسوة.
- **فرضية 2:** طائفون في أقرب مسار عند فتحتي الحِجر قرب الركنين العراقي والشامي، حيث يبدأ انتفاخ الخط، فيتجمعون في هذا الموضع ويظهرون ملاصقين للكعبة من زاوية الكاميرا.
- **فرضية 3 (لم تُستبعد):** عنصر ثابت آخر (ظل، أو حارس، أو جزء من بوابة الحِجر أو قاعدة القنديل) في الموضع الذي رآه المستخدم إن كان غير الذي صورته. **يحتاج لقطة المستخدم أو تحديد الموضع** لإثبات أنه نفس الشيء.
- **ملاحظة:** إصلاح V1 يغير مواضع الطائفين قرب الجدران، فقد يغير V2 أو يزيده. لذلك تأتي 1.2 بعد 1.1.

## F. تحليل المخاطر

| المخاطرة | الأثر | التخفيف |
|---|---|---|
| **شروط المصادر** | أغلب البثوث العامة (يوتيوب، وبث الحرم الرسمي) تمنع سحب الإطارات وتحليلها | فصل العرض عن التحليل · إذن مسجل بدليل لكل مصدر · لا التفاف تقني · الرفع بديل دائم (H) |
| **لا مصدر بث مرخص للتحليل** | المسار التلقائي الكامل للحرم قد لا يتحقق قريبًا | إثبات المسار على الصورة والفيديو أولًا · ميزة المراقبة تُختبر على مصدر HLS مرخص من مكان آخر إن وُجد · توثيق ما ثبت وما بقي افتراضًا |
| **تنقل كاميرات البث** | قراءات غير قابلة للمقارنة تُعرض كاتجاه | `sceneContextId` · كشف التغير الحاد بـ dHash · حد أدنى للقراءات |
| **Stream ingestion وSSRF** | روابط داخلية عبر redirect أو داخل الـ playlist | A.5: فحص كل قفزة وكل variant ومقطع، والعنوان المحلول فعلًا |
| **دقة التحليل** | نماذج الرؤية العامة تقريبية في عدّ الحشود الكثيفة (توثيق Anthropic نفسه يذكر ذلك) | مستوى ومؤشر لا عدّ · نطاقات · تجميع · `reliability` · مجموعة اختبار · `DetectorAnalyzer` في المرحلة 6 |
| **التقدير الديموغرافي** | تخمين يُقرأ كحقيقة، وإشارة اللباس لا تعمل خارج الحرم | معطل افتراضيًا · مقيد بالحرم · حد قبول (SPEC §7.4) · لا يدخل التقييم |
| **التكلفة المستمرة** | المراقبة تستدعي النموذج كل دقيقة | فاصل ≥ 20 ثانية · gate التغير · سقف لكل جلسة وسقف يومي · Batch API للعينات التاريخية غير الفورية · مقارنة النماذج (I) |
| **قيود المتصفح** | WebGL غير مدعوم، وفقد السياق على iOS، وتقدم الرفع لا يتوفر في `fetch` | Poster بديل · `webglcontextlost` يعيد الـ Poster · XHR للرفع · EventSource مع fallback polling |
| **الأداء** | المشهد ثقيل على الجوال الضعيف | القياس المخفّض في المرحلة 1 · مستويات الجهاز · إيقاف الرسم خارج الشاشة · صفحة التحليل لا تحمّل three |
| **الخصوصية** | وسائط لأشخاص حقيقيين تُرسل لطرف ثالث | حذف فوري · إزالة EXIF وGPS · لا تعرف على الوجوه · لا IP · إفصاح واضح |
| **تلوث البيانات** | صور قديمة كأنها «الآن»، أو قراءات Mock | `timeTrust` · repository واحدة تعزل `isMock` · القراءة القديمة معلَّمة |
| **النشر** | الجدولة والمراقبة تتوقف على serverless | الواجهة والتحليل القصير على Vercel، والمهام الدائمة على خدمة دائمة التشغيل بموافقة عند الحاجة (القرار 7، A.1) |
| **حساسية المحتوى** | تمثيل الكعبة والأشخاص | شخصيات مجردة بلا ملامح · لا خط قرآني · لغة هادئة |
| **ثنائية اللغة** | انحراف الترجمات، وتخطيط ينكسر في اتجاه واحد | اختبار تطابق المفاتيح · lint للخصائص المنطقية · Playwright في الاتجاهين بعد كل مرحلة |

## G. تقييم n8n مقابل التنفيذ داخل الخادم

**ما المطلوب أتمتته فعلًا؟** في الـ MVP: فحص صحة عدد قليل من المصادر كل بضع دقائق، وتحديث حالتها، وتنظيف الملفات المؤقتة. ولاحقًا: بحث دوري عن مرشحين جدد، وتنبيه عند انقطاع مصدر.

| المعيار | داخل الخادم (setInterval في `instrumentation.ts`) | n8n |
|---|---|---|
| **بساطة النشر** | لا شيء إضافي. نفس العملية التي تحتاجها ffmpeg والـ SSE أصلًا | خدمة ثانية (Docker + قاعدة بياناتها) أو اشتراك سحابي، ومزامنة الإعدادات والمفاتيح بين نظامين |
| **التكلفة** | صفر إضافي | استضافة ذاتية: موارد خادم وصيانة. سحابي: اشتراك شهري |
| **الاعتمادية** | تتوقف الجدولة إذا توقف الخادم، لكن التحليل يتوقف معه أصلًا، فلا خسارة إضافية | نقطة فشل ثانية، وتحتاج مراقبة هي الأخرى، ويحتاج وصولًا إلى قاعدة بيانات سَكينة أو API داخلية محمية |
| **الصيانة** | كود TypeScript نفسه، باختبارات Vitest (منطق الفحص والترتيب دوال نقية) | منطق موزع بين workflows مرئية وكود المشروع، وصعب الاختبار الآلي وصعب المراجعة في Git |
| **الأمان** | لا سطح هجوم جديد | لوحة تحكم مكشوفة وتحديثات أمنية مستمرة، ومفاتيح API في نظام إضافي |
| **الترخيص** | — | n8n برخصة «Sustainable Use» (fair-code) لا رخصة مفتوحة تقليدية. مناسبة للاستخدام الداخلي، وتحتاج مراجعة عند أي استخدام تجاري |
| **قيمته الحقيقية** | — | تكاملات جاهزة كثيرة (Slack، وTelegram، والبريد)، وتعديل التدفقات بلا نشر كود |

**التوصية: التنفيذ داخل خادم سَكينة، وعدم استخدام n8n في الـ MVP.**
السبب: المهام الحالية صغيرة ومرتبطة بمنطق المشروع نفسه (الترتيب، والتبديل، وسياق المشهد). n8n يضاعف عدد الأنظمة المنشورة دون أن يزيل أي جزء من الكود، ويُضعف الاختبار الآلي، وهو أهم ما يثبت صحة التبديل.

**متى نعيد التقييم؟** إذا احتجنا تنبيهات متعددة القنوات، أو اكتشافًا عبر منصات كثيرة بواجهات مختلفة، أو أن يعدّل شخص غير مطور التدفقات. **التحضير لذلك بلا تكلفة الآن:** منطق الفحص خلف واجهة `Scheduler`، ونقطة داخلية واحدة محمية بمفتاح (`POST /api/internal/sources/check`) تجعل استدعاءه من n8n لاحقًا ممكنًا دون إعادة كتابة. **الاستقبال واستخراج الإطارات والتحليل تبقى في سَكينة في كل الأحوال.**

## H. المصدر المرئي الأول (بحث 2026-10-15)

### H.1 الخيارات
| # | المصدر | التصنيف | الدليل |
|---|---|---|---|
| **1** | **صور وفيديوهات يرفعها المستخدم**، ومعها صور حرم مرخصة للاختبار من Wikimedia Commons (مثال مؤكد: [The Kaaba during Hajj.jpg](https://commons.wikimedia.org/wiki/File:The_Kaaba_during_Hajj.jpg)، تصوير Adli Wahid، 2018، طواف في موسم الحج، 4425×2955، رخصة **CC BY-SA 4.0**) | **`display_and_analyze`** | محتوى المستخدم نفسه (`user_owned`) بموافقته عند الرفع. وصور Commons رخصتها تسمح بالاستخدام والتعديل مع نسب العمل للمؤلف ومشاركة المشتق بنفس الرخصة. ناتجنا أرقام لا صور، والنسب يُذكر في ملف المجموعة |
| **2** | **البث الرسمي للحرم على يوتيوب** (قناة القرآن الكريم السعودية، هيئة الإذاعة والتلفزيون. يُشار إليها باسم «KSA Quran TV»، ويحتاج المعرف الدقيق للقناة وقابلية التضمين تحققًا تقنيًا في المرحلة 3) | **`display_only`** | **العرض:** التضمين بمشغل IFrame الرسمي من الطرق التي تسمح بها الخدمة نفسها. **التحليل ممنوع:** [شروط يوتيوب](https://www.youtube.com/t/terms) (سارية منذ 5 يناير 2022) تمنع «الوصول إلى أي محتوى أو إعادة إنتاجه أو تنزيله» و«الوصول إلى الخدمة بأي وسيلة آلية» (robots وscrapers)، إلا بإذن كتابي مسبق من يوتيوب أو ما يسمح به القانون. و[سياسات مطوري YouTube API](https://developers.google.com/youtube/terms/developer-policies) (آخر تحديث 2026-09-14): III.E.1.a يمنع تنزيل المحتوى المرئي أو تخزينه أو تخزينه مؤقتًا، وIII.I.7 يمنع فصل مكونات الفيديو أو عزلها، وIII.E.6 يمنع المحتوى المكشوط، وIII.E.4.h يمنع إنشاء بيانات أو مقاييس مشتقة من بيانات الـ API، وIII.I.6 يمنع تعديل المشغل أو حجب أجزائه. **الخلاصة:** لا ffmpeg على رابط يوتيوب، ولا yt-dlp، ولا التقاط canvas أو شاشة من المشغل |
| **3** | **بث الحرم عبر منصة «الأولى» (aloula.sa) أو أي HLS رسمي لهيئة الإذاعة والتلفزيون** | **`unavailable`** (حتى يوجد إذن) | لا توجد واجهة مطورين موثقة ولا شروط منشورة وجدتُها تسمح بإعادة الاستخدام. البث محتوى محمي، واستخراج رابط `.m3u8` من مشغل الموقع التفاف على المشغل لا استخدام مصرح به. الطريق الوحيد: إذن كتابي (القرار 8، ومتطلباته في H.4). **مواقع إعادة البث** (مثل makkahlive.net) `unavailable` أيضًا: إعادة بث غير موثقة الترخيص |

### H.2 التوصية
- **المصدر الأول للتحليل: الرفع (الخيار 1).** يثبت المسار كاملًا من البداية إلى النهاية في المرحلة 2 دون أي مخاطرة قانونية. ومجموعة الاختبار تبدأ بصور Commons مرخصة، ويوثق ملفها الوصفي المصدر والمؤلف والرخصة لكل صورة. **لا تُحفظ الصور في المستودع**؛ سكربت ينزلها من مصادرها.
- **المصدر الأول للبث: يوتيوب عرضًا فقط (الخيار 2)** في المرحلة 3، بشارة واضحة «عرض فقط، لا يُحلَّل»، وبجانبه دعوة لرفع صورة أو فيديو للتحليل. **لا يُعرض بجانبه أي رقم كأنه تحليل له.**
- **مصدر `display_and_analyze` حي:** غير موجود حاليًا للحرم. سأبحث في المرحلة 4 عن كاميرات عامة لأماكن أخرى بترخيص صريح يسمح بالتحليل (مثل بوابات البيانات المفتوحة الحكومية التي تنشر لقطات كاميرات بترخيص CC BY). لم أتحقق من أي منها بعد، فهي **افتراض** حتى تُراجع شروطها.
- **ما لن نفعله:** مشاركة الشاشة أو تبويب المتصفح لالتقاط إطارات من مشغل يوتيوب أو «الأولى». تقنيًا ممكن، لكنه إعادة إنتاج للمحتوى خارج ما تسمح به الشروط، فهو التفاف لا حل.

### H.3 ما ثبت وما بقي افتراضًا
- **ثبت:** نص شروط يوتيوب وسياسات المطورين أعلاه، وترخيص صورة Commons المذكورة.
- **افتراض يحتاج تحققًا تقنيًا (المرحلة 3):** معرف قناة البث الرسمي، وأنها تسمح بالتضمين، وأنها تبث 24 ساعة.
- **لم يُعثر عليه:** شروط استخدام «الأولى»، وأي ترخيص لبث الحرم يسمح بالتحليل.

### H.4 متطلبات طلب الإذن الرسمي لتحليل بث الحرم (القرار 8)
**ليس شرطًا** لتطوير بقية المشروع ولا لاختبار مصادر أخرى مسموح بها. المستخدم وحده يقرر الإرسال ويرسله، ولا يتواصل الفريق التقني مع أي جهة.

**الجهة:** هيئة الإذاعة والتلفزيون بصفتها مالكة البث. ويُتحقق قبل الإرسال هل يلزم إذن أو تنسيق مع جهة أخرى معنية بالتصوير في المسجد الحرام.

**ما يجب أن يحتويه الطلب:**
1. **التعريف:** المشروع وصاحبه، وطبيعته (مشروع شخصي في Portfolio، غير تجاري حاليًا)، ورابط عرض إن وُجد.
2. **الغرض:** تقدير مستوى ازدحام المطاف من البث وعرضه للزوار مع مستوى الثقة، دون أي توصية رسمية أو ادعاء بالأمان.
3. **ما يُطلب بالضبط:** الوصول التقني المسموح (رابط HLS أو واجهة رسمية)، والكاميرات أو القنوات المعنية، وأقل فاصل بين العينات (30 إلى 60 ثانية)، وأقصى عدد طلبات في الساعة.
4. **المعالجة:** إطارات مصغرة تُرسل إلى مزود تحليل خارجي (Anthropic) ثم تُحذف فورًا. لا تخزين لصور أو مقاطع، ولا تعرف على الوجوه أو الهوية. يُحفظ فقط ناتج رقمي (مستوى ومؤشر وثقة ووقت).
5. **المخرجات المعروضة:** مستوى الكثافة ومؤشرها والثقة والاتجاه. وسؤال صريح: هل يُسمح بالتقدير التجريبي للرجال والنساء أم يُستبعد من هذا المصدر؟
6. **العرض والنسب:** هل يُسمح بإعادة عرض البث بجانب النتائج أم النتائج فقط، وصيغة الإشارة إلى المصدر المطلوبة.
7. **النطاق والمدة:** مدة الإذن، والاستخدام التجاري لاحقًا إن حدث، وحق الهيئة في الإلغاء في أي وقت، وإيقاف الاستخدام فورًا عند الطلب.
8. **الضمانات التقنية:** حماية المفاتيح، وحدود الطلبات، وسجل الاستخدام، وإمكانية تزويد الهيئة بتقرير عنه.
9. **جهة الاتصال** المسؤولة.

**عند الموافقة:** يُضاف المصدر في `sources.ts` بـ `analyze.basis = "written_permission"` ورابط أو مرجع الإذن وتاريخه، ويخضع لنفس الفحص والترتيب (A.4).

## I. تقدير التكلفة (Anthropic API، أسعار 2026-10)

### I.1 الافتراضات
- **الإطار:** يُصغَّر إلى 1568px للضلع الطويل. إطار 16:9 يصير 1568×882، وتكلفته بالرموز المرئية `⌈1568/28⌉ × ⌈882/28⌉ = 56 × 32 = 1,792` رمزًا. (النماذج الحالية تقبل حتى 2576px و4,784 رمزًا، فالتصغير يوفر نحو 60% مقارنة بالحد الأعلى.)
- **التعليمات والمخطط:** نحو 1,200 رمز ثابتة، مخزنة بـ prompt caching (القراءة من الـ cache أرخص بكثير). ونحو 100 رمز متغيرة.
- **الإخراج:** نحو 700 رمز (JSON مختصر، مع تفكير قليل بمستوى `effort: low`). Opus 5.5 لا يسمح بإيقاف التفكير، فحُسب التفكير للنماذج الثلاثة احتياطًا.
- **الأسعار لكل مليون رمز (إدخال / إخراج):** Opus 5.5: $4 / $20 (قراءة الـ cache $0.20) · Sonnet 5.5: $2 / $10 (قراءة الـ cache $0.20) · Haiku 5.5: $0.10 / $0.50.

### I.2 النتيجة (تقديرية، تُستبدل بأرقام `usage` الفعلية في المرحلة 2)
| | Opus 5.5 | Sonnet 5.5 | Haiku 5.5 |
|---|---|---|---|
| **صورة واحدة (إطار واحد)** | ≈ $0.022 | ≈ $0.011 | ≈ $0.0007 |
| **فيديو (12 إطارًا)** | ≈ $0.26 | ≈ $0.13 | ≈ $0.008 |
| **دقيقة مراقبة (إطار كل 30 ثانية)** | ≈ $0.044 | ≈ $0.022 | ≈ $0.0013 |
| **ساعة مراقبة** | ≈ $2.6 | ≈ $1.3 | ≈ $0.08 |
| **مصدر واحد 24/7 بإطار كل دقيقة** | ≈ $31 يوميًا (≈ $950 شهريًا) | ≈ $16 يوميًا (≈ $475 شهريًا) | ≈ $0.95 يوميًا (≈ $29 شهريًا) |

الهامش المتوقع ±50% حسب طول الإخراج والتفكير الفعلي.

### I.3 ما يخفض التكلفة
1. **gate التغير:** إطار لا يختلف عن سابقه (dHash) لا يُرسل. في مشهد ثابت الكاميرا قد يوفر جزءًا كبيرًا من الاستدعاءات (يُقاس في المرحلة 5).
2. **الفاصل:** 60 ثانية بدل 30 يخفض التكلفة للنصف. الكثافة لا تتغير عادة خلال 30 ثانية.
3. **Batch API** (خصم 50%) للعينات التاريخية التي لا تحتاج نتيجة فورية، لا للمراقبة الحية.
4. **اختيار النموذج بالقياس:** النموذج يُحدَّد في `ANTHROPIC_MODEL`، ويُختار بعد التجربة في I.4 (القرار 6).
5. **حذف ما لا يلزم:** لا يُطلب التقدير الديموغرافي إلا عند تفعيله.

### I.4 تجربة مقارنة النماذج (المرحلة 2، القرار 6)
- **السقف:** **$20 للتجربة كلها**، يفرضه الكود: عدّاد تكلفة من `usage` الفعلي يوقف التشغيل قبل أي استدعاء يتجاوز السقف. لا إنفاق شهري متكرر قبل عرض النتائج والتكلفة على المستخدم.
- **المجموعة:** 30 إلى 50 مشهدًا مرخصًا (H.2)، موسومة يدويًا **قبل** تشغيل أي نموذج (SPEC §7.5)، وتشمل البعيد، والمزدحم جدًا، وضعيف الإضاءة، والخالي، وما ليس حشدًا.
- **التشغيل:** نفس البرومبت والتصغير (1568px) للنماذج الثلاثة، وكل صورة 3 مرات لقياس الثبات. التكلفة المتوقعة للتشغيلة الكاملة (50 صورة × 3 نماذج × 3 مرات) نحو $5، فيبقى هامش لتعديل البرومبت مرة أو مرتين.
- **التقرير المعروض على المستخدم:** لكل نموذج: دقة المستوى، ونسبة وقوع العدد الموسوم داخل النطاق، والثبات بين التكرارات، ونسبة المشاهد التي صنفها «غير كافية»، والتكلفة لكل إطار، وزمن الاستجابة.
- **حدود الاستنتاج:** النتيجة تقارن النماذج على هذه المجموعة فقط. لا تُعرض كدقة عامة للمنتج، ولا تغني عن الاختبار الأوسع في المرحلة 6.

## ملاحظات تنفيذ المرحلة 1 (الأساس)
- **الإصدارات:** Next 16.3 · React 19.2 · next-intl 4.14 · Tailwind 4.3 · Vitest 5 · TypeScript 5.9. في Next 16 اسم الملف `src/proxy.ts` بدل `middleware.ts`، والـ matcher يستثني `/api` و`_next` وأي مسار فيه نقطة.
- **الـ cookie:** في next-intl 4 تُكتب `NEXT_LOCALE` فقط حين تختلف اللغة المختارة عن لغة المتصفح (أو عن cookie سابقة)، ومدتها مضبوطة بسنة في `src/i18n/routing.ts`.
- **الخطوط:** `next/font/google` (تُستضاف محليًا، بلا طلبات لـ Google من المتصفح). متغيرا `--app-font-display` و`--app-font-body` يُعاد تعريفهما بـ `:lang()` داخل `@layer base`.
- **المسارات:** `useDirection` في `src/hooks/`، ومكونات الـ Layout في `src/components/layout/`. مجلدات `server/` و`lib/schemas/` تُنشأ مع أول ملف حقيقي في المرحلة 2 الجديدة.
- **404:** أي مسار غير معروف يُوجَّه إلى `/ar/...` أو `/en/...`، ثم يعرض `app/[locale]/not-found.tsx` عبر `[...rest]`. لم نستخدم `global-not-found` لأنه تجريبي.
- **Motion:** مثبت ومستخدم في `HeroStage` (`useReducedMotion`). `MotionConfig reducedMotion="user"` يُضاف في المرحلة 1 الجديدة.
- **`AGENTS.md`:** الملف الذي ينشئه قالب Next 16. وجوده يمنع `next dev` من تعديل `CLAUDE.md`.
- **قاعدة lint `sakinah/no-physical-direction`** (`eslint-rules/`): تفحص `className` ونداءات `cn`/`clsx`/`cva`/`twMerge`، ولها اختبارات في `tests/`.

## القرارات المعتمدة
**2026-09-30:**
1. **اللغة:** الموقع ثنائي اللغة بالكامل (عربي وإنجليزي) بنفس مستوى الجودة. فيه مبدّل لغة يحفظ الاختيار، وأول زيارة تعتمد لغة المتصفح والافتراضي العربية (انظر A.2.1).
2. **الأرقام:** لاتينية (0123) في اللغتين.
3. **الاسم:** «سَكينة | Sakinah» كما هو.
4. **المشهد:** هندسة إجرائية low-poly بدل نماذج جاهزة.
5. **خط العناوين الإنجليزية:** Marcellus (انظر A.2.1).

**2026-10-05:** الكعبة معتمدة بكل أجزائها، ووقفة حارس الحجر الأسود معتمدة (`docs/PHASE2-HANDOFF.md`).

**2026-10-15:** «التكليف الموحد» هو الاتجاه المعتمد، ويحل محل رسالة «Predictive & Personalized». واعتمد المستخدم القرارات التسعة في E.2، ومنها اعتماد الحراس والطائفين مبدئيًا.
