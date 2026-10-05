# سَكينة — الوثيقة المعمارية

> الحالة: المرحلة 1 (الأساس) مكتملة، والمرحلة 2 قيد التنفيذ (الكعبة معتمدة، والتالي الحراس، والتفاصيل في `docs/PHASE2-HANDOFF.md`) · المرجع: `SPEC.md` · آخر تحديث: 2026-10-05

## A. Product Architecture

### A.1 نظرة عامة
تطبيق Next.js واحد (App Router) يعمل على Node runtime، ويحتوي الواجهة والـ API معًا. يناسب هذا الـ MVP: نشر واحد، وأنواع مشتركة، ولا خدمات إضافية. منطق الخادم كله داخل `src/server/` بطبقات مفصولة، وكل ملف فيه يبدأ بـ `import "server-only"` حتى لا يُستورد من الواجهة.

```mermaid
flowchart LR
  UI[UI · React/R3F] -->|HTTP + SSE فقط| API[Route Handlers /api]
  API --> ING[Ingestion<br/>image · video · stream]
  ING --> PRE[Preprocessing<br/>sharp: resize + quality]
  PRE --> AN[CrowdAnalyzer<br/>Claude | Mock]
  AN --> VAL[Zod Validation]
  VAL --> AGG[Aggregation]
  AGG --> REC[Recommendation Engine]
  AGG --> DB[(SQLite · Drizzle)]
  REC --> DB
  REC --> PT[Aladhan · Prayer Times]
  ING -.temp files.-> TMP[/tmp/sakinah/&lt;id&gt;/]
```

**قاعدة الاعتماد:** `app/(ui)` ← `lib/api-client` ← `/api` ← `server/*`. الواجهة لا تستورد من `server/` إطلاقًا، والمشترك الوحيد هو `lib/schemas` (Zod) و`lib/config`.

### A.2 Frontend
- Next.js App Router + TypeScript strict + Tailwind (Design tokens من SPEC §2 كمتغيرات CSS في `@theme`).
- Motion: `MotionConfig reducedMotion="user"` على مستوى الـ layout.
- المشهد 3D: Three.js + R3F + drei، ويُحمَّل عبر `dynamic(..., { ssr: false })` خلف صورة Poster ثابتة (هي الـ LCP).
- **الأرقام:** لاتينية (0123) في اللغتين. `Intl.NumberFormat(locale, { numberingSystem: "latn" })` مضبوط مرة واحدة في `lib/config/locale.ts`، مع `tabular-nums` دائمًا. الأوقات تُعرض بـ `Intl.DateTimeFormat` بتوقيت Asia/Riyadh وبنفس الأرقام اللاتينية.

### A.2.1 ثنائية اللغة (ar / en) بنفس مستوى الجودة
لا توجد لغة "ثانوية". كل صفحة وحالة (تحميل، وخطأ، وفراغ، ورسائل الخادم) مكتملة وملمّعة في اللغتين.

- **التوجيه:** next-intl بمسارات `/ar/...` و`/en/...` (`localePrefix: "always"`). لكل لغة رابط مستقل قابل للمشاركة، مع `hreflang` و`alternate` في الـ metadata.
- **أول زيارة:** الـ proxy يقرأ `Accept-Language`. إذا كانت الإنجليزية هي الأعلى تفضيلًا بين `ar` و`en` تُفتح `en`، وفي أي حالة أخرى تُفتح `ar` (الافتراضي).
- **حفظ الاختيار:** أي اختيار يدوي يُحفظ في cookie `NEXT_LOCALE` لمدة سنة، ويتقدم على لغة المتصفح في الزيارات التالية.
- **`LanguageSwitcher`:** في الـ Header، يعرض اسم اللغة الأخرى بلغتها («English» / «العربية») مع `lang` و`hreflang` على الرابط. يبقي المستخدم في نفس المسار ونفس الحالة (مثل `analyze/[id]`)، ولا يعيد تشغيل تسلسل الترحيب. هدف اللمس فيه 44px على الأقل.
- **الاتجاه:** `dir` و`lang` على `<html>` من الـ locale (`ar` = `rtl`، و`en` = `ltr`). نستخدم logical utilities فقط (`ms-`/`me-`/`ps-`/`start`/`end`)، مع قاعدة lint تمنع `ml-`/`mr-`/`left-`/`right-`.
- **الحركة حسب الاتجاه:** hook `useDirection()` يعطي `sign` (`-1` في RTL، و`+1` في LTR)، وكل إزاحة أفقية في Motion تُضرب فيه: الانزلاق، والظهور المتتابع، ودخول صفحة التحليل بعد التلاشي الذهبي. الأيقونات الاتجاهية (الأسهم وchevrons) تنعكس بـ `rtl:-scale-x-100`، والأيقونات غير الاتجاهية تبقى كما هي.
- **المحتوى المختلط:** الأرقام والأوقات والروابط والأسماء اللاتينية داخل نص عربي (وبالعكس) تُعزل بـ `<bdi>` أو `unicode-bidi: isolate`.
- **الترجمة:** كل النصوص في `messages/ar.json` و`messages/en.json`، ولا نص داخل المكونات. اختبار Vitest يفشل إذا اختلفت المفاتيح بين الملفين، والأنواع مستنتجة من `ar.json` حتى يُكتشف المفتاح الناقص وقت الـ build.
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
- القيد المعروف: هذا يعمل على instance واحد فقط. للتوسع لاحقًا نستبدل الـ runner بطابور (Redis/BullMQ) خلف نفس الواجهة `JobRunner`.
- **مهم:** الـ `proxy`/`middleware` الخاص بـ next-intl يُستثنى منه `/api` في الـ matcher، لأن الـ middleware يخزّن جسم الطلب مؤقتًا ويقصّه عند حد معين، وهذا يكسر رفع الفيديو.

### A.4 Ingestion
واجهة موحدة: `Ingestor.ingest(input) → AsyncIterable<FrameRef>`، ولها ثلاثة تنفيذات:

| النوع | الاستقبال | استخراج الإطارات |
|---|---|---|
| صورة | جسم الطلب الخام يُكتب إلى القرص بالتدفق مع عدّ البايتات وقطعه عند الحد | إطار واحد. التحقق من النوع عبر `sharp.metadata()` (magic bytes، لا الامتداد) |
| فيديو | نفس الطريقة | `ffmpeg-static`: قراءة المدة ثم أخذ عينات متساوية التباعد (`sampleEverySec` وسقف `maxFrames` في الإعدادات) |
| بث HLS | JSON `{ url }` | التحقق من الرابط (أدناه) ثم `ffmpeg -i <m3u8>` يلتقط K إطارات بفاصل N ثانية، مع Timeout صارم |

**لماذا الجسم الخام بدل multipart؟** يُكتب مباشرة إلى القرص بلا مكتبة parsing إضافية، مع تقدم رفع حقيقي عبر `XMLHttpRequest.upload.onprogress`.

**حماية روابط البث (SSRF):** `https` فقط، وفحص DNS يرفض العناوين الخاصة وloopback وlink-local، وجلب الـ playlist بأنفسنا أولًا للتحقق من `#EXTM3U` قبل تمريره إلى ffmpeg، و`-protocol_whitelist` محدودة. روابط YouTube وصفحات الويب تُرفض برسالة تشرح السبب والبديل.

### A.5 CV Pipeline
```
FrameRef → preprocess (sharp: تدوير حسب EXIF، إزالة كل metadata، resize إلى 1568px كحد أقصى، JPEG)
        → localQuality (sharp.stats: sharpness، entropy، brightness)
        → CrowdAnalyzer.analyzeFrame(jpeg) → FrameAnalysisRaw
        → Zod validate + normalize (men+women+unclear = 1)
        → Aggregator(frames[]) → AnalysisResult
```
- **`CrowdAnalyzer`** (واجهة): `analyzeFrame(image, ctx) → Promise<FrameAnalysis>`.
  - `ClaudeVisionAnalyzer`: يستخدم `@anthropic-ai/sdk`. الموديل من `ANTHROPIC_MODEL`. يُفرض الإخراج بـ **tool use بـ `tool_choice` إجباري** ومخطط مطابق لـ SPEC §6.2، فهذا أوثق من "JSON فقط" نصيًا. Timeout 30 ثانية، وإعادة محاولة واحدة عند فشل Zod أو 5xx، والـ system prompt مُخزَّن بـ prompt caching لتقليل تكلفة إطارات الفيديو.
  - `MockAnalyzer`: يعمل فقط عند `ANALYZER=mock`. كل نتيجة تحمل `analyzer: "mock"` و`isMock: true`، والواجهة تعرض `MockModeBanner` عند وجود ذلك في النتيجة نفسها، لا اعتمادًا على متغير بيئة في الواجهة. قراءات الـ Mock **لا تدخل** البيانات التاريخية أبدًا.
  - `DetectorAnalyzer` (مستقبلًا): نفس الواجهة.
- **الفصل المنطقي:** `FrameAnalysis` تُقسَّم فور التحقق إلى `CrowdEstimate` و`DemographicEstimate` و`QualityAssessment`، وكل واحدة يستهلكها جزء مستقل، حتى لو جاءت من استدعاء واحد في الـ MVP.
- **Aggregation** (دوال نقية قابلة للاختبار):
  1. استبعاد الإطارات التي فيها `is_haram_scene=false` أو جودة تحت `minFrameQuality`.
  2. إزالة القيم الشاذة في `crowd_score` بطريقة median ± k·MAD.
  3. متوسط مرجّح: وزن الكثافة `crowd_confidence × quality`، ووزن التوزيع `demographic_confidence × quality`.
  4. ثقة التجميع = f(متوسط الثقة، تشتت الإطارات، عدد الإطارات المستخدمة).
  5. تحديد `reliability`: `reliable` (تُعرض الأرقام) · `limited` (يُعرض المستوى والنطاق فقط) · `insufficient` (رسالة واقتراح لتحسين المصدر بلا أرقام).
- العدد التقريبي يُعرض كنطاق مقرَّب (مثل «≈ 1200–1500») وفقط إذا تجاوزت `crowd_confidence` حدًا محددًا.
- حدود المستويات والثقة كلها في `lib/config/analysis.ts` (القيم الأولية: منخفضة < 35 ≤ متوسطة < 65 ≤ مرتفعة).

### A.6 DB
- Drizzle ORM + SQLite (`better-sqlite3`) في `data/sakinah.db`، والمخطط مكتوب بطريقة قابلة للترحيل إلى Postgres (لا SQL خاص بـ SQLite في الـ repositories).
- **لا صور، ولا وجوه، ولا IP، ولا بيانات شخصية.** الجداول:
  - `analyses`: id، status، stage، sourceKind، analyzer، isMock، errorCode، result (JSON)، createdAt، completedAt.
  - `readings`: id، analysisId؟، capturedAt، timeTrust، sourceKind، crowdScore، crowdLevel، personMin/Max، men/women/unclear، quality، crowdConf، demoConf، reliability، isMock.
  - `prayer_times`: date (PK، بتوقيت Asia/Riyadh)، timings JSON، fetchedAt.
- كل الحسابات الزمنية (ساعة، يوم أسبوع، جمعة) بتوقيت **Asia/Riyadh**.

### A.7 Storage (ملفات مؤقتة)
- `os.tmpdir()/sakinah/<analysisId>/`، تُحذف في `finally` بعد التحليل مهما كانت النتيجة.
- job تنظيف احتياطي عبر `instrumentation.ts`: يعمل عند بدء التشغيل ثم كل 10 دقائق، ويحذف أي مجلد أقدم من 15 دقيقة.
- لا تخزين دائم للوسائط. الإطارات تُمرَّر إلى Anthropic API ولا تُحفظ عندنا.

### A.8 Recommendation Engine
دوال نقية في `server/recommendation/`، والأوزان والحدود في `lib/config/recommendation.ts`.

- **Input:** `currentReading` · `recentReadings` (آخر 60 دقيقة) · `todayStats` · `historicalBuckets[weekday][halfHour]` · `prayerTimes` · `visitType`.
- **Output:** `{ verdict, recommendedWindow, confidence, explanation }`.

**الخطوات:**
1. **الحكم الحالي:** درجة القراءة الحالية مقابل حدود معدَّلة حسب نوع الزيارة، والناتج `suitable | better_wait | high_density | unknown`.
2. **النوافذ المرشحة:** خانات نصف ساعة خلال الـ 18 ساعة القادمة. لكل خانة درجة متوقعة = مزج بين:
   - *نمط الصلاة (prior):* الدقائق [−X، +Y] حول كل صلاة ذروة محتملة، ونافذة أكبر لظهر الجمعة.
   - *التاريخ:* متوسط الخانة من `readings`، بوزن `w = n / (n + k)` يكبر مع عدد القراءات.
3. **أوزان نوع الزيارة:** عائلة وعامة: الكثافة فقط، بوزن أشد للعائلة. امرأة/رجل: الكثافة **أو** نسبة النساء/الرجال الأعلى، ويُستخدم عامل النسبة فقط إذا وُجدت بيانات توزيع تاريخية موثوقة، وإلا يُصرَّح بأن التوصية مبنية على الكثافة وحدها.
4. **البوابة:** إذا كانت الثقة أقل من `minWindowConfidence` تكون `recommendedWindow = null` مع `reason: "insufficient_data"`، ولا نافذة بلا أساس.
5. **`explanation`:** ليس نصًا مكتوبًا يدويًا، بل `{ code, params }` (مثل `code: "prayer_pattern_only", params: { prayer: "asr", from, to }`) تُترجم عبر next-intl. النص يُبنى من عوامل محسوبة فعلًا.
- `basis` لكل نافذة: `prayer_pattern | history | blend`، ويُعرض للمستخدم («مبنية على نمط عام لأوقات الصلاة»).

**أوقات الصلاة:** Aladhan API (مكة، طريقة أم القرى `method=4`)، مع Timeout 8 ثوانٍ وcache يومي في `prayer_times`. عند الفشل: آخر يوم مخزّن مع ملاحظة، وإلا توصية بدون عامل الصلاة وبثقة أقل.

**مصدر البيانات التاريخية وموثوقية الوقت:** الصورة المرفوعة لا نعرف متى التُقطت. لذلك لكل قراءة `timeTrust`:
- `live`: بث أو Sampler. وزن كامل.
- `user_confirmed`: المستخدم أكّد «التُقطت الآن». وزن مخفّض.
- `unknown`: لا تدخل التاريخ، وتُستخدم للتحليل الحالي فقط.

## B. Component Tree

```
src/app/[locale]/layout.tsx          ← fonts per locale, dir/lang, NextIntlClientProvider, MotionConfig, TransitionProvider
├─ SiteHeader → Wordmark · LanguageSwitcher
├─ MockModeBanner                    (يظهر فقط عند نتيجة isMock)
├─ page.tsx  (الافتتاحية)
│  ├─ IntroSequence                  (sessionStorage، زر «تخطي»، < 4 ثوانٍ)
│  └─ HeroStage
│     ├─ HeroPoster                  (صورة ثابتة، LCP، وبديل عدم دعم WebGL)
│     ├─ HaramScene  [dynamic, ssr:false]
│     │  └─ <Canvas> SceneLighting · MatafFloor · Kaaba (كسوة + حزام ذهبي)
│     │              · Guards (4 حراس ثابتون، هندسة مدمجة واحدة)
│     │              · TawafCrowd (InstancedMesh: إحرام / عباءة / حامل طفل)
│     │              · PigeonFlock (Instanced) · CameraRig (orbit + pointer + dolly)
│     ├─ SceneCursorTooltip (desktop) / TapHint (mobile)
│     ├─ EnterButton                 (بديل قابل للتركيز للوحة المفاتيح وقارئ الشاشة)
│     └─ GeometricPattern
├─ analyze/page.tsx
│  ├─ PrivacyNotice
│  ├─ SourcePicker → SourceCard ×3
│  └─ ImageDropzone | VideoUploader (UploadProgress) | StreamUrlForm
└─ analyze/[id]/page.tsx             (نتيجة قابلة للمشاركة برابط)
   ├─ ProcessingView → TawafRing (تقدم حقيقي) · StageList      (SSE مع fallback polling)
   ├─ ResultsDashboard
   │  ├─ RecommendationCard + VisitTypeAssistant → VisitTypeBubble ×4 · VisitTypeDetail
   │  ├─ DensityCard → DensityGauge · AnimatedNumber · ConfidenceBadge
   │  ├─ DemographicCard (رجال) · DemographicCard (نساء) · UnclearBar
   │  ├─ QualityCard
   │  └─ EstimateDisclaimer
   └─ ErrorState (حسب ErrorCode)
shared/ui: Button · Card · ConfidenceBadge · AnimatedNumber · GoldFadeOverlay · VisuallyHidden · DirectionalIcon
shared/hooks: useDirection
```

**الانتقال السينمائي:** `TransitionProvider` يعيش في الـ layout (لا يُعاد تركيبه بين الصفحات). الـ CameraRig يقترب نحو 700ms، ثم GoldFadeOverlay نحو 500ms، ثم `router.push` (من `next-intl/navigation` حتى يبقى الـ locale) عند ذروة التلاشي، وصفحة التحليل تظهر من الذهبي بإزاحة تتبع اتجاه اللغة. مسار `/analyze` يُعمل له prefetch مسبقًا.

**المشهد 3D، الحل المقترح (SPEC §3.4):** هندسة إجرائية low-poly بدل نماذج GLTF ثقيلة:
- الكعبة صندوق بمواد PBR، والحزام الذهبي شريط بنقش هندسي تجريدي. لا نحاول رسم خط قرآني، احترامًا وتجنبًا لأي خطأ.
- الطائفون ثلاث `InstancedMesh` (lathe geometry بلا ملامح). الحركة عكس عقارب الساعة، والسرعة وأنصاف الأقطار متفاوتة لكل instance.
- اتجاه الطواف وحركة الكاميرا **ثابتان في اللغتين** لأنهما واقع مكاني لا اتجاه قراءة. ما ينعكس هو طبقة الواجهة فوق المشهد فقط: النص، وموضع الـ Tooltip، وتلميح اللمس.
- الأعداد حسب مستوى الجهاز: 280 على الديسكتوب، و160 على الجوال، و90 على الأجهزة الضعيفة (60% إحرام، و35% عباية، و5% يحملون طفلًا). يبدأ المستوى من إشارات الجهاز، و`PerformanceMonitor` من drei ينزله خطوة فقط عند انخفاض مستمر في الإطارات، بعد 3 ثوانٍ من التحميل. بلا `flipflops`/`onFallback`، لأن drei يعدّ كل ارتفاع في الأداء «flip»، فكان الجهاز السريع ينزل إلى الأدنى.
- الطائفون يلتفون حول مقام إبراهيم بالتفاف ناعم في نصف القطر (`laneRadius` في `lib/tawaf.ts`)، ويظهرون بعد أول إطارين حتى لا تلتقطهم ظلال الأرضية التي تُرسم مرة واحدة. ومع reduced-motion يقفون ثابتين.
- `reduced-motion`: كاميرا ثابتة وحركة شبه متوقفة.
- الـ Poster نفسه لقطة حقيقية من المشهد تُلتقط بـ Playwright في المرحلة 2.

**أبعاد الكعبة (Phase 2، في `src/components/scene/lib/layout.ts`):** الأبعاد من الأرقام الموثقة، والصور القريبة للشكل فقط.
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

**الحراس (Phase 2، في `src/components/scene/figures/guards.ts`):**
- أربعة حراس ثابتون بلا ملامح ولا شارات: عند الحجر الأسود ببريهة حمراء (على درجة رخامية مستقلة خلف قطعة الرخام)، وعند الركن اليماني وبوابتي الحِجر ببريهة سوداء. مواضعهم في `GUARDS` داخل `layout.ts`.
- نموذج واحد تبنيه دالة واحدة، والوقفة معامل فيها (استرح، أو ذراع ممدودة تُحل بعظمتين). الأربعة ثابتون، فيُدمجون في هندسة واحدة بألوان في الرؤوس: draw call واحد. الـ instancing كان يحتاج اثنين على الأقل (وقفتان ولونا بريهة)، ولا فائدة منه لأجسام لا تتحرك.
- التمويه بثلاث درجات لكل مثلث من موضعه في العالم (value noise)، بلا texture.
- علاقة حارس الحجر الأسود: قماش أسود مطوي (TubeGeometry على منحنى مغلق) مع شبكة الحراس، وحلقتها مع المعادن، فلا draw call إضافي.

## C. Data Models
كل النماذج Zod في `src/lib/schemas/`، والأنواع عبر `z.infer`.

```ts
Locale           = "ar" | "en"                      // الافتراضي "ar"
VisitType        = "family" | "woman" | "man" | "general"
SourceKind       = "image" | "video" | "stream"
SourceInput      = { kind:"image"|"video"; mime; bytes } | { kind:"stream"; url }
Frame            = { index; timestampSec?; width; height; localQuality: { sharpness; brightness; entropy } }
FrameAnalysisRaw = /* SPEC §6.2 حرفيًا، snake_case، كل ratio ∈ [0,1] */
CrowdResult      = { score:0–100; level:"low"|"moderate"|"high"; personCount:{min;max}|null; confidence }
DemographicEstimate = { men; women; unclear; confidence; basis:"attire" }       // المجموع = 1
QualityAssessment   = { sourceQuality; sceneClarity; overallConfidence;
                        reliability:"reliable"|"limited"|"insufficient";
                        decisionReady:boolean; issues: QualityIssue[] }
Analysis         = { id; status:"queued"|"processing"|"completed"|"failed"; stage?: Stage;
                     source:{ kind; receivedAt; timeTrust }; analyzer:"claude-vision"|"mock"; isMock;
                     frames:{ sampled; used; discarded }; isHaramScene;
                     crowd?; demographics?; quality?; recommendation?; error?: ApiError }
Reading          = { id; analysisId?; capturedAt; timeTrust:"live"|"user_confirmed"|"unknown";
                     sourceKind; crowd; demographics; quality; isMock }
PrayerTimes      = { date; timezone:"Asia/Riyadh"; fajr; sunrise; dhuhr; asr; maghrib; isha;
                     method:"umm_al_qura"; fetchedAt }
Recommendation   = { visitType; verdict:"suitable"|"better_wait"|"high_density"|"unknown";
                     recommendedWindow:{ start; end; expectedLevel; basis:"prayer_pattern"|"history"|"blend" } | null;
                     confidence; explanation:{ code; params };
                     dataSufficiency:{ historicalReadings; recentReadings } }
Stage            = "reading_scene" | "estimating_density" | "analyzing_distribution" | "preparing_recommendation"
ApiError         = { code: ErrorCode; message /* بلغة الطلب */; hint? /* ماذا يفعل المستخدم */ }
ErrorCode        = "image_unclear" | "video_corrupt" | "unsupported_format" | "file_too_large"
                 | "invalid_url" | "stream_unreachable" | "no_people" | "not_haram_scene"
                 | "too_dense_to_estimate" | "analysis_failed" | "network" | "timeout"
                 | "rate_limited" | "not_found"
```

## D. API Contract
كل الأخطاء بشكل واحد: `{ error: ApiError }` مع HTTP status المناسب.

**لغة الاستجابة:** تُحدَّد من cookie `NEXT_LOCALE`، ثم `Accept-Language`، ثم `ar`. يُعاد `message` و`hint` بتلك اللغة من ملفات الترجمة نفسها، والواجهة تعتمد على `code` لاختيار الرسالة والإجراء المناسب، فلا تتأثر إذا بدّل المستخدم اللغة أثناء التحليل. البيانات نفسها (الأرقام والرموز) لا تتغير بتغير اللغة.

| Method · Path | Request | Response |
|---|---|---|
| `POST /api/analyses?kind=image\|video[&capturedNow=1]` | جسم خام، و`Content-Type` هو نوع الملف | `202 { analysisId, status:"queued" }` · 400 / 413 / 415 / 429 |
| `POST /api/analyses` | `application/json` `{ kind:"stream", url }` | `202 { analysisId }` · 400 `invalid_url` · 429 |
| `GET /api/analyses/:id/events` | SSE (يدعم `Last-Event-ID`) | أحداث `stage { stage, progress, frames?:{done,total} }` · `completed { analysisId }` · `failed { error }`، ونبضة كل 15 ثانية. عند الاتصال يُرسل الوضع الحالي فورًا |
| `GET /api/analyses/:id` | — | `200 Analysis` · 404 |
| `GET /api/recommendation?visitType=…[&analysisId=…]` | — | `200 Recommendation`. بدون `analysisId` تُستخدم أحدث قراءة موثوقة في آخر 60 دقيقة، أو الأنماط وحدها مع التصريح بذلك |
| `GET /api/prayer-times[?date=YYYY-MM-DD]` | — | `200 PrayerTimes` (cache يومي + `Cache-Control`) |

- **الحدود (في الإعدادات):** صورة ≤ 15MB (JPEG/PNG/WebP/HEIC)، فيديو ≤ 150MB (MP4/MOV/WebM)، و`maxFrames` = 12.
- **Rate limiting:** token bucket في الذاكرة لكل IP على `POST /api/analyses` (مثلًا 6 في الدقيقة و40 في اليوم). الـ IP لا يُخزَّن في DB.
- **Timeouts:** Anthropic 30 ثانية لكل إطار · Aladhan 8 ثوانٍ · ffmpeg للبث 25 ثانية · التحليل كاملًا 3 دقائق.

## E. خطة التنفيذ

| # | المرحلة | المخرجات | تُعتبر منتهية عندما |
|---|---|---|---|
| 1 | الأساس | Next.js + TS strict + Tailwind tokens + الخطوط لكل لغة + next-intl بمسارات `/ar` و`/en` + كشف لغة المتصفح + cookie `NEXT_LOCALE` + `LanguageSwitcher` + `dir` ديناميكي + `useDirection` + Layout (Header/Footer) + هيكل `src/` + ESLint (منع الخصائص الفيزيائية) + Vitest (تطابق مفاتيح الترجمة) + مقارنة خط العناوين الإنجليزي | `build` نظيف · لا تحذيرات console · الصفحة الهيكلية سليمة في ar/RTL وen/LTR على 390px و1440px (4 لقطات Playwright) · متصفح إنجليزي يفتح `/en` وغيره يفتح `/ar` · المبدّل يحفظ الاختيار ويبقي نفس الصفحة · تطابق مفاتيح `ar.json` و`en.json` |
| 2 | الافتتاحية + 3D | IntroSequence · HaramScene · Poster · Tooltip/TapHint · EnterButton · الانتقال الذهبي · بديل WebGL | 60fps على الديسكتوب، وأداء مقبول في محاكاة الجوال · reduced-motion يعمل · الانتقال نحو 1.2 ثانية |
| 3 | تحليل الصورة | Ingestion (صورة) · sharp · `ClaudeVisionAnalyzer` + `MockAnalyzer` · Zod · Aggregation · Job runner + SSE · لوحة النتائج كاملة · كل حالات الخطأ في §11 | تحليل صورة حقيقية من البداية للنهاية · اختبارات Vitest للتجميع · كل ErrorCode له واجهة |
| 4 | الفيديو | `ffmpeg-static` · Sampling · تجميع متعدد الإطارات · تقدم رفع حقيقي (XHR) + تقدم تحليل (SSE) | فيديو 60 ثانية يُحلَّل بتقدم حقيقي · فيديو تالف يعطي رسالة واضحة |
| 5 | DB + التوصية | Drizzle schema + migrations · Aladhan + cache · محرك التوصية · VisitTypeAssistant (localStorage) | اختبارات المحرك (بيانات كافية / ناقصة / جمعة) · لا نافذة بلا أساس |
| 6 | البث | HLS Ingestor + حماية SSRF · Sampler مجدول (معطّل افتراضيًا، ويُفعَّل بمتغير بيئة لمصدر مسموح) | بث `.m3u8` عام يُحلَّل · الروابط غير الصالحة والخاصة تُرفض برسالة واضحة |
| 7 | التلميع | الأداء · a11y (لوحة مفاتيح، قارئ شاشة، تباين، `lang` صحيح) · الجوال · **مراجعة تكافؤ اللغتين**: كل صفحة وكل حالة (تحميل، خطأ، فراغ) في RTL وLTR، والحركة والانتقالات في الاتجاهين، ومراجعة الصياغة الإنجليزية نصًا نصًا · code-review + security-review · README وARCHITECTURE | Definition of Done في SPEC §15، بما فيها تكافؤ اللغتين |

بعد كل مرحلة: تشغيل، ومراجعة بصرية بـ Playwright على 390px و1440px **في اللغتين** (4 لقطات لكل صفحة)، وإصلاح، ثم ملخص. أي ميزة جديدة لا تُعتبر منتهية إلا بنصوصها في `ar.json` و`en.json` معًا.

**الـ Dependencies وسبب كل منها:**

| المكتبة | سبب وجودها |
|---|---|
| `next` · `react` · `typescript` · `tailwindcss` | الأساس |
| `next-intl` | الترجمة، ومسارات اللغتين، وكشف لغة المتصفح، وتنسيق الأرقام والأوقات |
| `zod` | العقود والتحقق |
| `motion` | الحركة |
| `three` · `@react-three/fiber` · `@react-three/drei` | المشهد |
| `@anthropic-ai/sdk` | المحلّل |
| `sharp` | resize يقلل التكلفة، وإزالة الـ metadata للخصوصية، وقياس الجودة محليًا |
| `ffmpeg-static` | لا يوجد ffmpeg على الجهاز، وهذا يضمن نسخة ثابتة |
| `drizzle-orm` · `better-sqlite3` · `drizzle-kit` (dev) | قاعدة البيانات والترحيل |
| `vitest` (dev) | اختبار التجميع والتوصية |

**لا:** مكتبة UI جاهزة، ولا state manager، ولا axios، ولا مكتبة multipart.

**متغيرات البيئة (`.env.local`، مع `.env.example`):** `ANTHROPIC_API_KEY` · `ANTHROPIC_MODEL` · `ANALYZER=claude|mock` · `DATABASE_URL` · `SAMPLER_STREAM_URL` · `SAMPLER_INTERVAL_MIN`.

## F. تحليل المخاطر

| المخاطرة | الأثر | التخفيف |
|---|---|---|
| **Stream ingestion** | أغلب البثوث العامة (YouTube وغيره) لا تعطي `.m3u8` مباشرًا، وبعض البثوث محمية أو مقيّدة جغرافيًا، وفيها خطر SSRF | دعم HLS المباشر فقط بصراحة · رسائل تشرح البديل (رفع صورة أو فيديو) · حماية SSRF · Timeout · الـ Sampler فقط لمصدر مسموح باستخدامه |
| **دقة التحليل** | نماذج الرؤية العامة ضعيفة في عدّ الحشود الكثيفة، والتقدير بحسب اللباس يتأثر بالإضاءة والمسافة | `crowd_score` مؤشر لا عدّ · نطاقات بدل أرقام دقيقة · تجميع متعدد الإطارات · بوابة `reliability` · فئة «غير واضح» إجبارية · مسار `DetectorAnalyzer` لاحقًا |
| **قيود المتصفح** | WebGL غير مدعوم، وSafari iOS يحدّ الذاكرة، وتقدم الرفع لا يتوفر في `fetch` | فحص WebGL مع Poster بديل · XHR للرفع · EventSource مع fallback polling · HEIC يُحوَّل في الخادم |
| **الأداء** | المشهد ثقيل، ومكتبات 3D تكبّر الـ bundle | dynamic import · Instancing · هندسة إجرائية بلا GLTF · `PerformanceMonitor` · Poster هو الـ LCP · صفحة التحليل لا تحمّل three إطلاقًا |
| **الخصوصية** | وسائط مرفوعة لأماكن فيها أشخاص حقيقيون، وإرسالها لطرف ثالث | حذف فوري + تنظيف احتياطي · إزالة EXIF و GPS · لا Face/Identity recognition في البرومبت ولا في الكود · لا تخزين IP · إفصاح واضح في الواجهة بأن الإطارات تُرسل لمحلّل خارجي للمعالجة |
| **التكلفة** | كل إطار استدعاء Vision، والفيديو يضاعف ذلك، والـ Sampler مستمر | resize إلى 1568px · `maxFrames` · prompt caching · Rate limiting · فاصل Sampler قابل للضبط · تسجيل usage لكل تحليل لحساب التكلفة فعليًا في المرحلة 3 |
| **أداء الجوال** | حرارة وبطارية وإطارات متقطعة | أعداد أقل تلقائيًا · `dpr` محدود (≤1.5) · إيقاف الـ render عند خروج المشهد من الشاشة أو إخفاء التبويب · reduced-motion |
| **تلوّث البيانات التاريخية** | صور قديمة تُرفع على أنها «الآن»، أو قراءات Mock | `timeTrust` · استبعاد `unknown` و`isMock` من التاريخ |
| **حساسية المحتوى** | تمثيل الكعبة والأشخاص | شخصيات مجرّدة بلا ملامح · لا خط قرآني مولّد · لغة هادئة غير وعظية |
| **ثنائية اللغة** | انحراف الترجمات، وتخطيط أو حركة تنكسر في اتجاه واحد، وخلط اتجاه النص مع الأرقام والأوقات، وصياغة إنجليزية ركيكة | اختبار تطابق المفاتيح · أنواع مستنتجة من الترجمة · lint للخصائص المنطقية · `useDirection` للحركة · `<bdi>` للمحتوى المختلط · Playwright في الاتجاهين بعد كل مرحلة · مراجعة الصياغة في المرحلة 7 |

## ملاحظات تنفيذ المرحلة 1
- **الإصدارات:** Next 16.3 · React 19.2 · next-intl 4.14 · Tailwind 4.3 · Vitest 5 · TypeScript 5.9. في Next 16 اسم الملف `src/proxy.ts` بدل `middleware.ts`، والـ matcher يستثني `/api` و`_next` وأي مسار فيه نقطة.
- **الـ cookie:** في next-intl 4 تُكتب `NEXT_LOCALE` فقط حين تختلف اللغة المختارة عن لغة المتصفح (أو عن cookie سابقة)، ومدتها مضبوطة بسنة في `src/i18n/routing.ts`.
- **الخطوط:** `next/font/google` (تُستضاف محليًا، بلا طلبات لـ Google من المتصفح). متغيرا `--app-font-display` و`--app-font-body` يُعاد تعريفهما بـ `:lang()` داخل `@layer base`، حتى يأخذ أي مقطع `lang="ar"` داخل صفحة إنجليزية (وبالعكس) خطه الصحيح، ولا تطغى القواعد الأساسية على أدوات Tailwind.
- **المسارات:** `useDirection` في `src/hooks/`، ومكونات الـ Layout في `src/components/layout/`. مجلدات `server/` و`lib/schemas/` تُنشأ مع أول ملف حقيقي في المرحلة 3.
- **404:** أي مسار غير معروف يُوجَّه إلى `/ar/...` أو `/en/...`، ثم يعرض `app/[locale]/not-found.tsx` عبر `[...rest]`. لم نستخدم `global-not-found` لأنه تجريبي.
- **Motion:** لم يُثبَّت بعد (قاعدة 7). `MotionConfig reducedMotion="user"` يُضاف مع المرحلة 2، وفي `globals.css` قاعدة `prefers-reduced-motion` لانتقالات CSS.
- **`AGENTS.md`:** الملف الذي ينشئه قالب Next 16. وجوده يمنع `next dev` من تعديل `CLAUDE.md`.
- **قاعدة lint `sakinah/no-physical-direction`** (`eslint-rules/`): تفحص `className` ونداءات `cn`/`clsx`/`cva`/`twMerge`، ولها اختبارات في `tests/`.

## القرارات المعتمدة (2026-09-30)
1. **اللغة:** الموقع ثنائي اللغة بالكامل (عربي وإنجليزي) بنفس مستوى الجودة. فيه مبدّل لغة يحفظ الاختيار، وأول زيارة تعتمد لغة المتصفح والافتراضي العربية، والعربية RTL كاملة والإنجليزية LTR كاملة (انظر A.2.1).
2. **الأرقام:** لاتينية (0123) في اللغتين.
3. **الاسم:** «سَكينة | Sakinah» كما هو.
4. **المشهد:** هندسة إجرائية low-poly بدل نماذج جاهزة.
5. **خط العناوين الإنجليزية:** Marcellus (انظر A.2.1).
