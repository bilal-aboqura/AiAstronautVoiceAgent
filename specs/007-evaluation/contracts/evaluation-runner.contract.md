# Contract: Evaluation Runner Script (`/eval/run-evaluation.ts`)

**Feature Branch**: `007-evaluation`  
**Contract Type**: CLI & Execution Contract  
**Path**: `/eval/run-evaluation.ts`

---

## 1. Execution Interface

The evaluation runner is invoked from the command line using Node.js/TypeScript execution (e.g. `npx tsx eval/run-evaluation.ts` or `npm run eval`).

```bash
# Full execution across both Version A and Version B
npm run eval

# Optional selective execution
npm run eval -- --config=a       # Run Version A only
npm run eval -- --config=b       # Run Version B only
npm run eval -- --limit=5        # Run first 5 questions (smoke test)
```

---

## 2. Configuration Contract

### Environment Resolution
The runner MUST resolve configuration from environment variables without hardcoding model IDs:

```typescript
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable. Please set it in .env before running evaluation.");
}

const MODEL_ID = process.env.GEMINI_EVAL_MODEL 
  || process.env.GEMINI_LIVE_MODEL 
  || process.env.GEMINI_MODEL 
  || "gemini-2.0-flash";
```

### Version A Specification (Full Agent)
- **Model**: `MODEL_ID`
- **System Instruction**: Egyptian Astronaut system prompt embedding:
  - Natural Egyptian colloquial Arabic persona.
  - Identity disclosure: `"الشخصية دي ذكاء اصطناعي"`.
  - Fact-checking disclaimer.
  - Grounding hierarchy: consult local knowledge (`search_knowledge`) first, fallback to Google Search, communicate honest uncertainty if missing.
  - Child-safe tone.
- **Tools**:
  - `search_knowledge`: Custom function calling mapped to `server/services/knowledge-search.ts`.
  - `googleSearch`: Built-in Google Search grounding tool `{}`.
  - 3D agent tools (`focus_planet`, `show_fact_card`, `reset_view`).

### Version B Specification (Baseline)
- **Model**: Identical `MODEL_ID`
- **System Instruction**: None or minimal neutral prompt without tools.
- **Tools**: Empty array `[]` (strictly zero tools, zero search grounding, zero custom functions).

---

## 3. Execution Lifecycle & Telemetry Contract

For each question row $(Q_1 \dots Q_{40})$:
1. **Timestamp Start**: Record $T_{\text{start}} = \text{Date.now()}$.
2. **Dispatch Query**: Send question prompt to the configuration.
3. **Handle Tool Loop (Version A)**:
   - If the model issues a `functionCall` for `search_knowledge({ query })`:
     - Execute local vector search via `knowledgeSearchService(query)`.
     - Log `tools_called += 'search_knowledge;'`.
     - Return function response to model and await final text.
   - If the model invokes `googleSearch`:
     - Log `tools_called += 'googleSearch;'`.
   - If the model invokes 3D actions:
     - Log tool name and return success.
4. **Timestamp End**: Record $T_{\text{end}} = \text{Date.now()}$. Compute $\Delta T = T_{\text{end}} - T_{\text{start}}$ in milliseconds.
5. **Extract Text**: Extract final response text from candidate content.
6. **Detect Uncertainty (Heuristic)**:
   - Inspect response text for common Arabic uncertainty cues (e.g., `"معنديش معلومة"`, `"غير مؤكد"`, `"مش معروف"`, `"لا توجد أدلة"`). Set `uncertainty_detected = true/false`.
7. **Record Output**: Construct `EvaluationResultRecord` with:
   - `review_status = 'unreviewed'`
   - `correctness = 'unreviewed'`
   - `hallucination = 'unreviewed'`
   - `reviewer_notes = ''`
8. **Fault Tolerance**: If an API call fails with 429/503, retry up to 3 times with exponential backoff ($1\text{s}, 2\text{s}, 4\text{s}$). If fatal failure occurs, record error message in `response_text` and flag `review_status = 'error'`, preserving prior successful results.
