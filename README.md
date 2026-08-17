# Mawrid

**العربية** · [English](#en)

---

<a id="ar"></a>

## العربية

[العربية](#ar) · [English](#en)

### الوصف

مورِد مصدرٌ، بالعربية والإنجليزية، لمعرفة من كان أوائل المسلمين. يضم حاليًا أداة واحدة، **الصحابة** — شجرة نسب تفاعلية موثَّقة، وعرض زمني لأصحاب النبي ﷺ: من هم، وكيف تربطهم القرابة، ومتى ورد أن كلًّا منهم أسلم.

### لقطات الشاشة

![شجرة الصحابة بالعربية](./screenshots/tree-ar.png)
*شجرة الصحابة بالعربية — الواجهة الافتراضية للتطبيق.*

![الشجرة نفسها بالإنجليزية](./screenshots/tree-en.png)
*الشجرة نفسها بعد التبديل إلى الإنجليزية عبر زر تبديل اللغة.*

### المزايا

- شجرة نسب تفاعلية وموثَّقة لأصحاب النبي ﷺ
- عرض زمني بحسب وقت إسلام كل صحابي
- واجهة كاملة بالعربية والإنجليزية، مع دعم الكتابة من اليمين إلى اليسار
- بطاقة لكل صحابي فيها مصادره الخاصة
- بحث بالاسم (بالعربية أو الإنجليزية أو الأسماء الأخرى)

### التطوير

```bash
npm install
npm run dev
```

`npm run build` يُنتج نسخة ثابتة في `dist/` (تُنشر على GitHub Pages عند الدفع إلى `main`)؛ و`npm run preview` يعرض تلك النسخة محليًا.

### البنية

- `index.html` — صفحة مورِد الرئيسية.
- `sahaba-tree/index.html` — تطبيق شجرة الصحابة والعرض الزمني.
- `src/sahaba-tree/` — وحدات JS والأنماط والبيانات الخاصة بذلك التطبيق.
  - `data/*.json` — بيانات الصحابة (عُقد النسب، الأشخاص، القبائل، الفئات الزمنية، المصادر، نصوص الترجمة، الإحصاءات)، مقسّمة في ملفات مستقلة.
  - `data.js` / `model.js` — تحميل البيانات واستخراج شجرة النسب في الذاكرة.
  - `i18n.js`، `text-measure.js`، `collapse.js`، `layout.js` — منطق مساعد بلا حالة واجهة.
  - `render.js`، `pan-zoom.js`، `card.js`، `interaction.js`، `search.js`، `timeline.js`، `tabs.js` — واجهة الشجرة والعرض الزمني التفاعلية.
  - `main.js` — يربط كل ما سبق؛ نقطة دخول الصفحة.
- `src/shared/` — أنماط مشتركة بين الصفحات (الخطوط، التصفير، صفحة الرئيسية).

### البيانات والمنهجية

#### مستويات الثقة في النسب

لكل صحابي حقل `genKind` يوضح مدى توثيق نسبه:

- **موثَّق كاملًا** (صحابيان فقط) — النسب الكامل مسند إلى المصادر المذكورة.
- **موثَّق ثم مُتصل** (١٨ صحابيًا) — النسب مسند إلى المصادر حتى جدٍّ معيّن، ثم يتصل بعد ذلك عبر السلسلة النسبية العامة المعتمدة في هذا التطبيق (المأخوذة أساسًا من جمهرة أنساب العرب لابن حزم).
- **بحسب الانتساب القبلي** (٢٩ صحابيًا) — مصادره تذكر قبيلته أو بطنه، دون تحديد موضعه الدقيق داخل الأسرة.

هذه «السلسلة العامة» ليست ملفًا مستقلًا، بل هي بنية الأب/الابن (`p`) المدرَجة مباشرة في `nodes.json` عبر ٢٣٤ عقدة، ومصدرها الأساسي جمهرة أنساب العرب لابن حزم (انظر قسم المصادر أدناه).

#### حالات الخلاف الموثقة

محورٌ مختلف تمامًا: حقل `confidence` يصف مدى ثقة المصادر في **رواية بيوغرافية** معيّنة (مثل: من أسلم أولًا)، لا في موضع النسب. من ٤٩ صحابيًا، ٤٤ رواياتهم «مُثبتة» (`attested`) و٥ «مختلف فيها» (`disputed`) بين العلماء. يظهر هذا في التطبيق نفسه: عند فتح بطاقة صحابي عليه خلاف، تظهر علامة «اختلف العلماء في هذا».

### المصادر

سبعة مصادر كلاسيكية فقط — بعد حذف التكرار من ١٤٥ استشهادًا موزّعة على تراجم ٤٩ صحابيًا وبيانات الفئات الزمنية — يتصل بها كل ما في هذه الشجرة، مرتبة زمنيًا بحسب وفاة مؤلفها:

1. **السيرة النبوية** — محمد بن إسحاق (ت ١٥٠هـ)، برواية عبد الملك بن هشام (ت ٢١٣هـ).
   أقدم سيرة نبوية متصلة وصلتنا كاملة. أصل ابن إسحاق مفقود، وما وصلنا هو رواية ابن هشام المهذبة عنه. الطبعة المعتمدة هي طبعة القاهرة (تحقيق مصطفى السقا وإبراهيم الأبياري وعبد الحفيظ شلبي).
   *مصدرٌ لـ٤٢ من ٤٩ صحابيًا مُترجَمًا، و٤ فئات زمنية.*

2. **الطبقات الكبرى** — محمد بن سعد (ت ٢٣٠هـ).
   معجم تراجم للنبي ﷺ والصحابة، مرتب على الطبقات، وداخل كل طبقة غالبًا على القبائل والبطون. الطبعة المعتمدة: دار صادر، بيروت.
   *المصدر الوحيد المستشهَد به لكل الصحابة الـ٤٩ دون استثناء، وكل الفئات الزمنية.*

3. **الجامع الصحيح (صحيح البخاري)** — محمد بن إسماعيل البخاري (ت ٢٥٦هـ).
   أصح كتب الحديث عند أهل السنة. الترقيم المعتمد هنا يتبع ترقيم فتح الباري الشائع.
   *مصدرٌ لـ٢١ صحابيًا، و٤ فئات زمنية.*

4. **الجامع الصحيح، كتاب فضائل أصحاب النبي ﷺ** — محمد بن إسماعيل البخاري (ت ٢٥٦هـ).
   الكتاب المخصص داخل صحيح البخاري لفضائل الصحابة أفرادًا، وهو المصدر المباشر لكثير من فضائل هذا التطبيق.
   *مصدرٌ لأبي بكر الصديق فقط، وفئة زمنية واحدة — أضيق مصدر استُشهد به هنا.*

5. **المسند الصحيح (صحيح مسلم)** — مسلم بن الحجاج النيسابوري (ت ٢٦١هـ).
   ثاني أصح كتب الحديث عند أهل السنة بعد البخاري.
   *مصدرٌ لأبي ذر الغفاري فقط، وفئة زمنية واحدة.*

6. **جمهرة أنساب العرب** — علي بن أحمد بن حزم الأندلسي (ت ٤٥٦هـ).
   المرجع الكلاسيكي المعتمد في أنساب العرب، وهو مصدر السلسلة النسبية العامة في هذا التطبيق. حيث تكون صلة القرابة في الشجرة مأخوذة من هذه السلسلة لا من مصادر الشخص نفسه، يُشار إلى ذلك صراحة في بيانات الصحابي (`genKind`).
   *لا يُستشهَد به مباشرة في ترجمة أي صحابي، لكنه مصدر السلسلة النسبية العامة، ويُذكر بالاسم في ملاحظة النسب (`genNote`) لـ١٨ صحابيًا من الفئة «موثَّق ثم مُتصل».*

7. **الإصابة في تمييز الصحابة** — أحمد بن علي بن حجر العسقلاني (ت ٨٥٢هـ).
   أشمل معجم تراجم للصحابة في التراث الإسلامي، نحو ١٢٣٠٠ ترجمة، يجمع ما سبقه من المصنفات في الباب ويوازن بينها. يصنف ابن حجر كل ترجمة إلى واحدة من أربع طبقات بحسب قوة إثبات الصحبة — وهو سابقة كلاسيكية يستلهم حقل `confidence` في هذا التطبيق روحها.
   *مصدرٌ لـ١١ صحابيًا، وفئتين زمنيتين.*

### إمكانية الوصول

لوحة ألوان القبائل (١٤ لونًا، تتكرر على ٢٩ قبيلة/بطنًا) عُدِّلت حتى يحقق كل لون نسبة تباين **٧:١ على الأقل مع النص الأبيض** — وهو معيار WCAG AAA للنص العادي؛ أضعف نتيجة قِيست: **٧.١٤:١**. نص الصفحة الأساسي على الخلفية البيضاء: `--ink` **١٣.٦٣:١**، `--ink-soft` **٧.٠٦:١**، `--muted` **٧.٠٤:١** — جميعها ضمن معيار AAA أو أعلى منه. كذلك: رابط تخطٍّ لبداية المحتوى، أدوار ARIA (`combobox`، `listbox`، `dialog`، `status`)، تشغيل كامل بلوحة المفاتيح، تركيز مرئي (`:focus-visible`)، ودعم لتقليل الحركة (`prefers-reduced-motion`).

### شكر وتقدير

الخطوط عبر Google Fonts، وكلاهما مرخّص بترخيص OFL: [Baloo Bhaijaan 2](https://fonts.google.com/specimen/Baloo+Bhaijaan+2) (العناوين وكل النصوص العربية) و[Nunito](https://fonts.google.com/specimen/Nunito) (النص الأساسي وعناصر الواجهة).

### الترخيص

**الكود.** جميع الأكواد في هذا المستودع مرخّصة بترخيص [MIT](./LICENSE).

**البيانات.** بيانات الصحابة المنظَّمة في `src/sahaba-tree/data/` — اختيارها وبنيتها ونصوصها بالعربية والإنجليزية — تجميعٌ أصلي مبني على المصادر الكلاسيكية المذكورة أعلاه، ومرخّص كذلك بترخيص MIT بصفته تجميعًا. هذا لا يمتد إلى الحقائق التاريخية نفسها أو المصادر الكلاسيكية التي جُمعت منها، ولا يقيّد استخدامها.

**المصادر الكلاسيكية.** المصادر السبعة المذكورة أعلاه تراثٌ علمي، أغلبها يعود لقرون عديدة، وهي غير مملوكة لهذا المشروع ولا مرخّصة منه — ذُكرت للتوثيق والاستزادة فقط. طبعات أو ترجمات معيّنة مذكورة في الملاحظات قد تحمل حقوقًا خاصة بها؛ هذا المشروع لا يعيد نشر نصوصها، بل يستشهد بها ببليوغرافيًا فقط.

---

<a id="en"></a>

## English

[العربية](#ar) · **English**

### Description

Mawrid is a source, in Arabic and English, for who the early Muslims were. It's currently home to one tool, **The Companions** — an interactive, sourced family tree and timeline of the Sahaba: who they were, how they were related, and when each is recorded as having believed.

### Screenshots

![The Companions tree in Arabic](./screenshots/tree-ar.png)
*The Companions tree in Arabic — the app's default view.*

![The same tree in English](./screenshots/tree-en.png)
*The same tree after switching to English via the language toggle.*

### Features

- An interactive, sourced family tree of the Prophet's ﷺ Companions
- A timeline ordered by when each companion is recorded as having believed
- A fully bilingual Arabic/English interface, with right-to-left support
- A per-person card citing that companion's own sources
- Name search, in either language or by alternate names

### Development

```bash
npm install
npm run dev
```

`npm run build` produces a static `dist/` (deployed to GitHub Pages on push to `main`); `npm run preview` serves that build locally.

### Structure

- `index.html` — the Mawrid landing page.
- `sahaba-tree/index.html` — the Companions family tree/timeline app.
- `src/sahaba-tree/` — that app's JS modules, styles, and data.
  - `data/*.json` — the Sahaba dataset (genealogy nodes, people, clans, cohorts, sources, i18n strings, precomputed stats), split out for independent editing.
  - `data.js` / `model.js` — load the JSON and derive the in-memory genealogy graph.
  - `i18n.js`, `text-measure.js`, `collapse.js`, `layout.js` — supporting pure logic.
  - `render.js`, `pan-zoom.js`, `card.js`, `interaction.js`, `search.js`, `timeline.js`, `tabs.js` — the interactive tree/timeline UI.
  - `main.js` — wires the above together; the page's entry point.
- `src/shared/` — styles shared across pages (fonts, reset, landing page).

### Data & Methodology

#### Genealogical Confidence Tiers

Every companion has a `genKind` field describing how well-sourced their lineage is:

- **Sourced** (2 people) — the full lineage shown is individually sourced to the works below.
- **Extended** (18 people) — sourced back to a named ancestor, then continues via this app's genealogical backbone (drawn primarily from Ibn Hazm's *Jamharat Ansab al-Arab*).
- **Approximate** (29 people) — placed by clan/tribe attribution: the sources name their clan, but not their exact position within it.

That "backbone" isn't a separate file — it's the parent-pointer (`p`) structure baked directly into all 234 entries of `nodes.json`, primarily sourced from Ibn Hazm's *Jamharat Ansab al-Arab* (see Bibliography below).

#### Documented Scholarly Disputes

A separate axis entirely: the `confidence` field describes how settled a **biographical** claim is (e.g. who believed first), not genealogical placement. Of the 49 profiled companions, 44 are `attested` and 5 are `disputed` among scholars. This surfaces directly in the app — opening a disputed companion's card shows a "Scholars recorded this differently" flag.

### Bibliography

Exactly seven classical sources — deduplicated from 145 citations spread across all 49 profiled companions and the cohort data — everything in this tree traces back to. Ordered chronologically by the cited author's death date:

1. **al-Sira al-Nabawiyya** ("The Life of the Prophet") — Muhammad ibn Ishaq (d. 150 AH / 767 CE), in the recension of Abd al-Malik ibn Hisham (d. 213 AH / 828 CE).
   The earliest connected biography of the Prophet ﷺ to survive in full. Ibn Ishaq's own text is lost; it survives through Ibn Hisham's edited recension. The standard reference is the Cairo edition (Mustafa al-Saqa, Ibrahim al-Abyari, Abd al-Hafiz Shalabi, eds.); English readers commonly use A. Guillaume's 1955 translation, *The Life of Muhammad*.
   *Cited by 42 of 49 profiled companions · 4 cohorts.*

2. **al-Tabaqat al-Kubra** ("The Great Book of Generations") — Muhammad ibn Sa'd (d. 230 AH / 845 CE).
   A biographical dictionary of the Prophet ﷺ and the Companions, organized by generation (*tabaqa*) and, within Madinan entries, largely by tribe and clan — the closest classical structure to the cohort model this app uses. Standard reference: the Beirut, Dar Sadir edition.
   *The one source cited for every single one of the 49 profiled companions, and every cohort.*

3. **al-Jami al-Sahih** ("Sahih al-Bukhari") — Muhammad ibn Ismail al-Bukhari (d. 256 AH / 870 CE).
   The most authoritative hadith collection in Sunni Islam. Standard reference numbering follows the Fath al-Bari edition/numbering, widely mirrored online (e.g. sunnah.com).
   *Cited by 21 companions · 4 cohorts.*

4. **al-Jami al-Sahih, Book of the Virtues of the Companions of the Prophet ﷺ** — Muhammad ibn Ismail al-Bukhari (d. 256 AH / 870 CE).
   The specific book (*kitab*) within Sahih al-Bukhari devoted to the merits of individual companions — the direct source for many of the *fadail*-style facts in this dataset.
   *Cited by Abu Bakr al-Siddiq alone · 1 cohort — the narrowest-footprint source here.*

5. **al-Musnad al-Sahih** ("Sahih Muslim") — Muslim ibn al-Hajjaj al-Naysaburi (d. 261 AH / 875 CE).
   The second most authoritative Sunni hadith collection after Bukhari.
   *Cited by Abu Dharr al-Ghifari alone · 1 cohort.*

6. **Jamharat Ansab al-Arab** ("The Compendium of Arab Genealogies") — Ali ibn Ahmad ibn Hazm al-Andalusi (d. 456 AH / 1064 CE).
   The standard classical reference for Arab tribal genealogy, and the source for this app's genealogical backbone. Where an edge in the tree comes from this backbone rather than a person's own cited sources, the person's data says so explicitly (`genKind`).
   *Not cited directly in any individual companion's own sources, but the backbone source, and named directly in the lineage notes of the 18 "Extended"-tier companions.*

7. **al-Isaba fi Tamyiz al-Sahaba** ("Fair Judgment in Distinguishing the Companions") — Ahmad ibn Ali ibn Hajar al-Asqalani (d. 852 AH / 1449 CE).
   The most comprehensive classical biographical dictionary of the Companions, roughly 12,300 entries, absorbing and cross-checking every earlier work in the genre. Sorts entries into four classes by strength of evidence for actual companionship — the classical precedent this app's own `confidence` field draws on in spirit.
   *Cited by 11 companions · 2 cohorts.*

### Accessibility

The 14-color clan palette (cycled across the tree's 29 clans/tribes) was tuned so every swatch clears **7:1 contrast against white text** — WCAG AAA for normal-size text; worst case measured **7.14:1**. Body text against the page's white background: `--ink` **13.63:1**, `--ink-soft` **7.06:1**, `--muted` **7.04:1** — all meeting or exceeding AAA. A skip link, ARIA roles (`combobox`/`listbox`/`dialog`/`status`), full keyboard operability, visible focus (`:focus-visible`), and `prefers-reduced-motion` support are also built in.

### Credits

Typefaces via Google Fonts, both OFL-licensed: [Baloo Bhaijaan 2](https://fonts.google.com/specimen/Baloo+Bhaijaan+2) (headings, all Arabic text) and [Nunito](https://fonts.google.com/specimen/Nunito) (body/UI, English).

### License

**Code.** All code in this repository is licensed under the [MIT License](./LICENSE).

**Dataset.** The curated dataset in `src/sahaba-tree/data/` — its selection, structure, and English/Arabic prose — is an original compilation of facts drawn from the classical sources below, and is likewise released under the MIT License. This does not extend to, or restrict use of, the underlying historical facts or the classical works they come from.

**Classical sources.** The seven works in the Bibliography are historical scholarship, most many centuries old; they are not owned, licensed, or claimed by this project and are listed for attribution and further reading only. Specific modern editions or translations named in the notes may carry their own separate rights; this project doesn't reproduce their text, only cites them bibliographically.
