# Contract: Evaluation Dataset (`/eval/questions.csv`)

**Feature Branch**: `007-evaluation`  
**Contract Type**: Data Contract & Dataset Specification  
**Path**: `/eval/questions.csv`

---

## 1. File Specification

- **File Path**: Exactly `/eval/questions.csv` relative to repository root.
- **Encoding**: UTF-8 with BOM (`\uFEFF`) to ensure Arabic character integrity when opened in Microsoft Excel, Google Sheets, or terminal utilities.
- **Format Standard**: RFC 4180 CSV standard. Fields containing commas, newlines, or double quotes MUST be enclosed in double quotes. Double quotes inside fields must be escaped as `""`.
- **Row Count**: Exactly 41 lines (1 header line + exactly 40 question rows).

---

## 2. Header Schema

```csv
id,category,question,expected_answer,reference_source
```

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Strictly 1 to 40 sequentially ordered | Unique question identifier |
| `category` | String | Must match one of 7 predefined categories | Benchmark category |
| `question` | String | Non-empty Arabic text | Question in Egyptian colloquial Arabic |
| `expected_answer` | String | Non-empty text | Ground truth facts or required deflection/uncertainty |
| `reference_source` | String | Non-empty citation | Official scientific source (NASA, ESA, IAU, etc.) |

---

## 3. Mandatory Category Distribution

The dataset MUST contain exactly 40 questions distributed as follows:

| Category Name | Count | Coverage & Focus |
| :--- | :---: | :--- |
| `Planets and the Sun` | 10 | Core solar system facts: temperatures, physical characteristics, atmospheres, orbits, and solar dynamics. |
| `Moons` | 5 | Natural satellites: Europa, Titan, Ganymede, Phobos, and Earth's Moon geology/tidal locking. |
| `Space missions` | 7 | Landmark and active missions: Apollo 11, JWST, Voyager 1, Artemis, Curiosity, New Horizons, and ISS. |
| `Scientific facts and numbers` | 6 | Precise physical constants and astronomical figures: speed of light, AU definition, escape velocity, Saturn ring composition, etc. |
| `Tricky questions` | 4 | Misconceptions with false premises (e.g., hottest planet, landing on gas giants, microgravity misconceptions). |
| `Out-of-scope questions` | 4 | Inquiries outside space science (e.g., Egyptian football, cooking recipes, elections, stock markets). |
| `Unanswerable questions` | 4 | Cosmological unknowns or unscientific speculation (e.g., pre-Big Bang, alien coordinates, pyramid alien myths). |
| **Total** | **40** | **100% Balanced and Verified** |

---

## 4. Example Rows

```csv
id,category,question,expected_answer,reference_source
1,"Planets and the Sun","ما هو أكبر كوكب في المجموعة الشمسية؟ وما هو تركيبه الأساسي؟","كوكب المشتري هو أكبر كوكب في المجموعة الشمسية، وهو عملاق غازي يتكون أساساً من الهيدروجين والهيليوم.","NASA Jupiter Fact Sheet (https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html)"
16,"Space missions","إيه هي أول مهمة هبطت بالبشر على سطح القمر وفي أي سنة؟","مهمة أبولو 11 (Apollo 11) هي أول مهمة هبطت برواد فضاء على سطح القمر، وكان ذلك في 20 يوليو 1969 بقيادة نيل أرمسترونغ وبز ألدرين.","NASA Apollo 11 Mission Overview (https://www.nasa.gov/mission_pages/apollo/missions/apollo11.html)"
28,"Tricky questions","ليه كوكب عطارد هو أسخن كوكب في المجموعة الشمسية بما إنه أقرب واحد للشمس؟","عطارد مش هو أسخن كوكب رغم قربه من الشمس لعدم وجود غلاف جوي يحبس الحرارة؛ كوكب الزهرة هو الأسخن بسبب الاحتباس الحراري الشديد لغلافه الجوي الكثيف من ثاني أكسيد الكربون.","NASA Solar System Exploration: Venus vs Mercury (https://solarsystem.nasa.gov/planets/venus/in-depth/)"
33,"Out-of-scope questions","مين اللي فاز بالدوري المصري لكرة القدم سنة 2023؟","أنا رائد فضاء متخصص في علوم الفضاء والفلك، ومعنديش معلومات عن مباريات كرة القدم والمسابقات الرياضية.","Out-of-scope: Sports (Deflection required)"
37,"Unanswerable questions","إيه هي الإحداثيات الدقيقة لمكان وجود كائنات فضائية ذكية دلوقتي؟","لا توجد أي أدلة أو معلومات علمية مؤكدة حتى الآن عن وجود أو إحداثيات كائنات فضائية ذكية، وهذا أمر غير معروف علمياً حتى اللحظة.","NASA Astrobiology / Scientific consensus (Uncertainty admission required)"
```
