# سَكينة — الوثيقة المعمارية

> الحالة: المرحلة 0 (المراجعة والتخطيط وفق «التكليف الموحد») بانتظار موافقة المستخدم. الأساس منجز، والمشهد الافتتاحي متقدم (الكعبة معتمدة، والحراس والطائفون بانتظار الاعتماد، والتفاصيل في `docs/PHASE2-HANDOFF.md`). لا يوجد تحليل ولا خادم API بعد. · المرجع: `SPEC.md` · آخر تحديث: 2026-10-15

---

## سجل التغيير

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
| **E** | خطة المراحل 0 إلى 8، والقرارات المعلّقة | التكليف §13 و§15 |
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
| `CLAUDE.md` | «المشروع باختصار»، والقاعدة 5، وأنواع الزيارة، و«المراحل في SPEC §14» | يصف منتجًا محوره الحرم والتوصية حسب نوع الزيارة، ويحيل إلى ترقيم مراحل قديم | **لم يُعدَّل** (خارج نطاق المرحلة 0). قرار للمستخدم (E.2) |
| الوثائق القديمة: Crowd Score كرقم أساسي، وبطاقتا الرجال والنساء، ونوافذ «نمط الصلاة»، ورفض يوتيوب كليًا | `SPEC.md` و`ARCHITECTURE.md` السابقان | التكليف §6 و§7 و§9 و§10 و§4 | **عُدّلت في هذا الـ commit** |

---

## A. Product Architecture

### A.1 نظرة عامة
تطبيق Next.js واحد (App Router) يعمل على **عملية Node طويلة العمر**، ويحتوي الواجهة والـ API والمهام الخلفية. يناسب هذا الـ MVP: نشر واحد، وأنواع مشتركة، ولا خدمات إضافية. منطق الخادم كله داخل `src/server/` بطبقات مفصولة، وكل ملف فيه يبدأ بـ `import "server-only"`.

**قيد النشر:** الجدولة داخل العملية، وffmpeg، والـ SSE الطويل تحتاج خادمًا يبقى يعمل (VPS أو Render أو Fly أو Railway). على منصة serverless بحتة تتوقف الجدولة، وهذا قرار معلّق (E.2).

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
- الطائفون يلتفون حول مقام إبراهيم بالتفاف ناعم في نصف القطر (`laneRadius` في `lib/tawaf.ts`)، ويظهرون بعد أول إطارين حتى لا تلتقطهم ظلال الأرضية التي تُرسم مرة واحدة. ومع reduced-motion يقفون ثابتين.
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
| 1 | الواجهة الافتتاحية | `HeroLayout` بعمودين والجوال عمودي · `PrimaryCta` · الحمام · `HeroPoster` وبديل WebGL وفقد السياق · إيقاف الرسم خارج الشاشة · `MotionConfig` · نصوص لا تَعِد بما لم يُبنَ | الزر ظاهر دون تمرير على 390×844 · بديل ثابت عند تعطيل WebGL · reduced-motion · 30 draw call و150 ألف مثلث · قياس على جوال بمعالج مخفّض 4× · لقطات Playwright الأربع |
| 2 | أول مسار تحليل | `zod` · `@anthropic-ai/sdk` · `sharp` · `ffmpeg-static` · Drizzle · `ClaudeVisionAnalyzer` و`MockAnalyzer` · التجميع · Job runner وSSE · صفحة `/analyze` (صورة ثم فيديو) · تسجيل التكلفة | صورة حقيقية من البداية إلى النهاية · فيديو بتقدم حقيقي · اختبارات التجميع والتحقق · مجموعة الاختبار الأولى (H.2) |
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

### E.2 قرارات معلّقة للمستخدم
| # | القرار | توصيتي | يمنع ماذا؟ |
|---|---|---|---|
| 1 | اعتماد إعادة الصياغة في `SPEC.md` (النطاق، وتأخير التوصية، وتجريبية الرجال والنساء) | اعتمادها | كل ما بعد المرحلة 0 |
| 2 | جهة المشهد في الإنجليزية على الديسكتوب: ثابت يسارًا أم ينعكس مع اللغة | ينعكس: النص في بداية السطر دائمًا، اتساقًا مع قاعدة انعكاس الواجهة | المرحلة 1 |
| 3 | الحراس والطائفون: اعتمادهم الآن، أم ملاحظات قبل المتابعة | اعتمادهم ومتابعة الحمام، ثم أي تعديل في المرحلة 8 | المرحلة 1 |
| 4 | تسلسل الترحيب والانتقال السينمائي | تأجيلهما إلى المرحلة 8 | لا شيء |
| 5 | الاسم الفرعي «Haramain Crowd Intelligence» و`metadata.title` | «Crowd Intelligence»، والعنوان «سَكينة — هل أزور الآن أم أنتظر؟» | المرحلة 1 (النصوص) |
| 6 | مفتاح Anthropic API، والنموذج في `ANTHROPIC_MODEL`، وسقف إنفاق شهري | الافتراضي `claude-opus-5-5`، مع مقارنة Sonnet 5.5 وHaiku 5.5 على مجموعة الاختبار في المرحلة 2 قبل المراقبة المستمرة، وسقف يومي صغير (I) | المرحلة 2 |
| 7 | بيئة النشر: خادم Node طويل العمر أم serverless | خادم طويل العمر (VPS صغير أو Render أو Fly) | المرحلتان 4 و5 |
| 8 | طلب إذن كتابي من هيئة الإذاعة والتلفزيون لاستخدام بث الحرم في التحليل | يرسله المستخدم إن رغب. لن أتواصل مع أي جهة | بث حرم قابل للتحليل (H.1) |
| 9 | تحديث `CLAUDE.md` ليطابق التكليف | تحديث «المشروع باختصار» والقاعدة 5 والإحالة إلى المراحل | اتساق الجلسات القادمة |
| 10 | دمج `phase-2/intro-hero` في `main` | بعد انتهاء المرحلة 1 ومراجعتها | لا شيء الآن |

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
| **النشر** | الجدولة والمراقبة تتوقف على serverless | خادم طويل العمر (E.2 #7) |
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
| **3** | **بث الحرم عبر منصة «الأولى» (aloula.sa) أو أي HLS رسمي لهيئة الإذاعة والتلفزيون** | **`unavailable`** (حتى يوجد إذن) | لا توجد واجهة مطورين موثقة ولا شروط منشورة وجدتُها تسمح بإعادة الاستخدام. البث محتوى محمي، واستخراج رابط `.m3u8` من مشغل الموقع التفاف على المشغل لا استخدام مصرح به. الطريق الوحيد: إذن كتابي (قرار E.2 #8). **مواقع إعادة البث** (مثل makkahlive.net) `unavailable` أيضًا: إعادة بث غير موثقة الترخيص |

### H.2 التوصية
- **المصدر الأول للتحليل: الرفع (الخيار 1).** يثبت المسار كاملًا من البداية إلى النهاية في المرحلة 2 دون أي مخاطرة قانونية. ومجموعة الاختبار تبدأ بصور Commons مرخصة، ويوثق ملفها الوصفي المصدر والمؤلف والرخصة لكل صورة. **لا تُحفظ الصور في المستودع**؛ سكربت ينزلها من مصادرها.
- **المصدر الأول للبث: يوتيوب عرضًا فقط (الخيار 2)** في المرحلة 3، بشارة واضحة «عرض فقط، لا يُحلَّل»، وبجانبه دعوة لرفع صورة أو فيديو للتحليل. **لا يُعرض بجانبه أي رقم كأنه تحليل له.**
- **مصدر `display_and_analyze` حي:** غير موجود حاليًا للحرم. سأبحث في المرحلة 4 عن كاميرات عامة لأماكن أخرى بترخيص صريح يسمح بالتحليل (مثل بوابات البيانات المفتوحة الحكومية التي تنشر لقطات كاميرات بترخيص CC BY). لم أتحقق من أي منها بعد، فهي **افتراض** حتى تُراجع شروطها.
- **ما لن نفعله:** مشاركة الشاشة أو تبويب المتصفح لالتقاط إطارات من مشغل يوتيوب أو «الأولى». تقنيًا ممكن، لكنه إعادة إنتاج للمحتوى خارج ما تسمح به الشروط، فهو التفاف لا حل.

### H.3 ما ثبت وما بقي افتراضًا
- **ثبت:** نص شروط يوتيوب وسياسات المطورين أعلاه، وترخيص صورة Commons المذكورة.
- **افتراض يحتاج تحققًا تقنيًا (المرحلة 3):** معرف قناة البث الرسمي، وأنها تسمح بالتضمين، وأنها تبث 24 ساعة.
- **لم يُعثر عليه:** شروط استخدام «الأولى»، وأي ترخيص لبث الحرم يسمح بالتحليل.

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
4. **اختيار النموذج بالقياس:** النموذج يُحدَّد في `ANTHROPIC_MODEL`. أقترح مقارنة الثلاثة على مجموعة الاختبار في المرحلة 2، والقرار للمستخدم بعد رؤية الدقة والتكلفة معًا (E.2 #6).
5. **حذف ما لا يلزم:** لا يُطلب التقدير الديموغرافي إلا عند تفعيله.

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

**2026-10-15:** «التكليف الموحد» هو الاتجاه المعتمد، ويحل محل رسالة «Predictive & Personalized».
