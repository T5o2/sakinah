# Interview Notes — Sakinah

How to explain each phase in a technical interview (co-op / internship). English first, with a short Arabic summary under each section. A new section is added after every phase.

ملاحظات لشرح كل مرحلة في مقابلة تقنية (تدريب تعاوني). النص بالإنجليزية، وتحت كل قسم ترجمة عربية مختصرة. يُضاف قسم جديد بعد كل مرحلة.

---

## Phase 1 — Foundation

### What we built and why

"Sakinah" is a platform that helps someone visiting the Haram in Makkah answer one question: **should I go now, or wait?** In later phases it will analyze a photo or video of the Haram and estimate how crowded it is.

Phase 1 is **the foundation**, like the building's structure before the rooms. I built:
- **A Next.js project with TypeScript**, a modern setup that catches errors before the user ever sees them.
- **A visual identity:** colors and fonts inspired by the Haram at night.
- **A bilingual system:** the site works in Arabic (right to left) and English (left to right) at the same quality. It picks your browser's language on the first visit and remembers your choice after that.
- **Automated quality checks** that stop bugs before they reach the site.

**Why start here?** Every later page is built on this foundation. If bilingual support isn't solid from day one, fixing it later means rewriting everything.

> **بالعربي:** سَكينة منصة تجيب الزائر: هل أزور الحرم الآن أم أنتظر؟ المرحلة 1 هي الأساس: مشروع Next.js بـ TypeScript، وهوية بصرية، ونظام لغتين (عربي RTL وإنجليزي LTR) بنفس الجودة يكشف لغة المتصفح ويحفظ الاختيار، وفحوصات جودة تلقائية. بدأنا بها لأن كل ما بعدها مبني عليها، وإصلاح ثنائية اللغة لاحقًا يعني إعادة كتابة كل شيء.

### The 3 most important technical decisions

**1. Each language gets its own URL (`/ar` and `/en`), and a manual choice is remembered**
- **The decision:** every page has two URLs. On a first visit I read the browser language, and when the user picks a language manually I save it in a cookie for a year.
- **Why:**
  - Each language gets a link that can be shared.
  - Search engines understand the two versions.
  - The user's choice takes priority over the browser's language.
  - I also excluded the API routes from this language routing so it won't break file uploads in later phases.

**2. Enforcing direction with a tool instead of memory**
- **The decision:** I use start/end CSS properties instead of left/right. Their effect flips automatically with the text direction. I also wrote my own ESLint rule that rejects any code using left or right.
- **Why:** in a bilingual site the most common bug is a layout that looks right in Arabic and breaks in English. Instead of relying on myself remembering, the tool enforces the rule on every line of code.

**3. Automated tests that stop a translation from going missing**
- **The decision:** all text lives in two files (`ar.json` and `en.json`). A test fails if the keys differ between them or if a text is empty.
- **Why:** we promised that neither language is "secondary." This test turns that promise into a hard constraint: nothing ships while one language is missing a translation.

> **بالعربي:**
> 1. **رابط لكل لغة (`/ar` و`/en`) مع حفظ الاختيار:** روابط قابلة للمشاركة، ومحركات البحث تفهم النسختين، واختيار المستخدم يتقدم على لغة المتصفح. واستثنينا مسارات الـ API حتى لا ينكسر رفع الملفات لاحقًا.
> 2. **فرض الاتجاه بأداة لا بالذاكرة:** خصائص start/end بدل left/right، وقاعدة ESLint خاصة ترفض left/right، لأن أشهر خطأ في المواقع الثنائية تصميم يسلم بالعربي وينكسر بالإنجليزي.
> 3. **اختبار يمنع نقص الترجمة:** يفشل إذا اختلفت مفاتيح `ar.json` و`en.json` أو وُجد نص فارغ، فلا تُعتمد أي ميزة ولغة ناقصة.

### 3 likely interview questions

**Q1: Why not just put `dir="rtl"` on the page and be done?**
> `dir` flips the text direction only. Margins, positions, and alignment written as left/right stay fixed and break. So I used logical properties (start/end), which flip automatically, and added a lint rule that rejects the old ones.

**Q2: How does the site decide which language to show?**
> In priority order:
> 1. The language in the URL.
> 2. The user's earlier saved choice (the cookie).
> 3. The browser's language.
> 4. Arabic by default.
>
> I tested every case: an English browser, an Arabic one, a French one, and one with no language at all.

**Q3: Tell me about a bug you found and how you handled it.**
> After the build succeeded, I tested the site's actual behavior with requests from different browser languages. I found the page for choosing a language only worked on the home page. The cause was a single backslash that got lost in a pattern. The build doesn't catch that kind of mistake; only a behavior test does.
>
> The lesson: **a successful build doesn't mean the site works.** Since then I test the behavior itself after every change.

> **بالعربي:**
> - **س1: لماذا لا يكفي `dir="rtl"`؟** لأنه يقلب اتجاه النص فقط، والهوامش والمواضع المكتوبة بـ left/right تبقى ثابتة وتنكسر. الحل خصائص start/end مع قاعدة lint.
> - **س2: كيف يحدد الموقع اللغة؟** بالترتيب: اللغة في الرابط، ثم الاختيار المحفوظ (cookie)، ثم لغة المتصفح، ثم العربية افتراضيًا. واختبرنا كل حالة.
> - **س3: خطأ اكتشفته؟** بعد نجاح الـ build اختبرت السلوك الفعلي، فوجدت أن اختيار اللغة يعمل في الرئيسية فقط، والسبب شرطة مائلة ضاعت من نمط. الدرس: نجاح الـ build لا يعني أن الموقع يعمل.

**Interview tip:** end your explanation with a number. "18 automated tests, and 4 screenshots in both languages on mobile and desktop after every phase" shows you work with a system, not by guesswork.

> **نصيحة:** اختم شرحك برقم، مثل «18 اختبارًا تلقائيًا و4 لقطات باللغتين على الجوال والديسكتوب بعد كل مرحلة»، فهذا يُظهر أنك تعمل بنظام لا بالتخمين.

---

## Phase 0 — Re-planning around a real, testable core

### What changed and why

The project's direction changed: the core product is now **crowd analysis you can trust**, not a recommendation. Recommendations and forecasts come later, on top of real data. Before writing any new code, I audited the repository against the new brief and sorted everything into three groups: what is actually built, what is only documented, and what now conflicts with the brief.

One finding: a WebGL-support helper existed in the code but nothing used it, so a browser without WebGL would show a black hero. The documentation said a fallback existed. That's why I check the code, not the docs.

> **بالعربي:** تغيّر اتجاه المشروع: المنتج الأساسي صار تحليل الحشد بثقة معلنة، والتوصية والتنبؤ يأتيان لاحقًا فوق بيانات حقيقية. قبل أي كود جديد، راجعت المستودع وقسّمته: ما بُني فعلًا، وما هو موثّق فقط، وما يتعارض مع التكليف. ومثال ما وجدته: دالة فحص WebGL موجودة ولا يستخدمها شيء، فالمتصفح بلا WebGL يرى خلفية سوداء رغم أن الوثائق تذكر بديلًا.

### The 3 most important decisions

**1. "Can we show it?" and "Can we analyze it?" are two separate questions**
- A YouTube live stream can be embedded with the official player, but YouTube's terms forbid downloading or scraping its content, so we can't extract frames from it. Each source carries two permissions with evidence, and the label the user sees (*display and analyze*, *display only*, *unavailable*) is derived from both.
- Automated discovery can only *suggest* candidates. A human approves the legal permission, because no crawler can read terms of service reliably.

**2. Scheduling inside the app instead of n8n**
- The periodic jobs are small and tightly tied to our own logic (ranking, failover). n8n would add a second system to deploy, secure, and monitor, and it would make the failover logic harder to unit-test.
- I kept a clean boundary (a `Scheduler` interface and one protected internal endpoint) so an external orchestrator can be added later without a rewrite.

**3. Honest numbers over impressive numbers**
- A vision model can estimate *how full* a scene looks, but people per square meter needs camera calibration we don't have. So we show a density level, a defined relative index (never a percentage), and a count range only at high confidence.
- The men/women estimate is experimental and off by default until it passes an accuracy test on labeled scenes.

> **بالعربي:**
> 1. **العرض والتحليل سؤالان منفصلان:** بث يوتيوب يُضمَّن بالمشغل الرسمي، لكن شروطه تمنع التنزيل والكشط، فلا نسحب منه إطارات. لكل مصدر إذنان بدليل، والتصنيف المعروض مشتق منهما، والاكتشاف الآلي يقترح فقط والموافقة بشرية.
> 2. **جدولة داخل التطبيق بدل n8n:** المهام صغيرة ومرتبطة بمنطقنا، وn8n يضيف نظامًا ثانيًا للنشر والحماية ويصعّب الاختبار. تركت واجهة واضحة تسمح بإضافته لاحقًا.
> 3. **أرقام صادقة لا مبهرة:** مستوى كثافة ومؤشر نسبي معرَّف لا نسبة مئوية، ونطاق للعدد عند الثقة العالية فقط. وتقدير الرجال والنساء تجريبي ومعطّل حتى يجتاز اختبار دقة.

### 3 likely interview questions

**Q1: Why not just pull frames from the YouTube stream? It's public.**
> Public to watch isn't the same as allowed to process. YouTube's terms forbid downloading or automated access, and the developer policies forbid storing or separating the video. So we embed it for display only, label it clearly, and analyze uploads instead until we have a licensed stream.

**Q2: How do you know a stream is really down, not just buffering?**
> Two signals together: no new segment for a threshold (20 seconds by default) *and* two failed checks in a row. Then a few retries with growing delays, and only then a switch. The switch logic is a pure state machine, so I can test every path without a network.

**Q3: How much does the analysis cost?**
> Each frame is resized so it costs about 1,800 image tokens. On the default model that's about two cents a frame, so a 30-second sampling interval is about $2.60 an hour. Skipping frames that haven't changed, and choosing the model by measured accuracy, are the main levers.

> **بالعربي:**
> - **س1: لماذا لا نسحب الإطارات من بث يوتيوب وهو عام؟** المتاح للمشاهدة ليس مسموحًا بمعالجته. الشروط تمنع التنزيل والوصول الآلي، فنعرضه فقط بشارة واضحة، ونحلل المرفوعات حتى يتوفر بث مرخص.
> - **س2: كيف تعرف أن البث انقطع فعلًا؟** إشارتان معًا: لا مقطع جديد لمدة 20 ثانية، وفشل فحصين متتاليين، ثم محاولات استعادة، ثم التبديل. والمنطق آلة حالات نقية تُختبر بلا شبكة.
> - **س3: كم تكلفة التحليل؟** الإطار المصغّر نحو 1,800 رمز، أي نحو سنتين للإطار على النموذج الافتراضي، ونحو $2.60 للساعة بعينة كل 30 ثانية. وأهم ما يخفضها: تجاهل الإطارات التي لم تتغير، واختيار النموذج بقياس الدقة.
