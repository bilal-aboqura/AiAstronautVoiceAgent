# Contract: Evaluation Summary Report (`/eval/summary.md`)

**Feature Branch**: `007-evaluation`  
**Contract Type**: Reporting & Metrics Contract  
**Path**: `/eval/summary.md`

---

## 1. Summary Generator Script (`/eval/summarize-results.ts`)

- **Execution**: `npm run eval:summary` (or `npx tsx eval/summarize-results.ts`).
- **Input**: `/eval/results.csv` (or the respective result CSVs).
- **Output**: `/eval/summary.md` and formatted ASCII table output to the terminal console.

---

## 2. Mathematical Metrics Definitions

### 1. Factual Accuracy Percentage
$$\text{Accuracy} = \frac{N_{\text{correct}}}{N_{\text{reviewed}}} \times 100\%$$
Where:
- $N_{\text{correct}}$ is the number of records with `correctness == 'correct'`.
- $N_{\text{reviewed}}$ is the number of records with `review_status == 'reviewed'`.
- If $N_{\text{reviewed}} = 0$, accuracy is reported as `Pending Review`.

### 2. Hallucination Count & Rate
$$\text{Hallucination Rate} = \frac{N_{\text{hallucination\_yes}}}{N_{\text{reviewed}}} \times 100\%$$
Where $N_{\text{hallucination\_yes}}$ is the count of records with `hallucination == 'yes'`.

### 3. Response Latency Metrics
- **Mean Latency**: $\bar{L} = \frac{1}{N} \sum_{i=1}^N L_i$ (in ms).
- **Median Latency**: $\tilde{L} = \text{median}(L_1, \dots, L_N)$ (in ms).

---

## 3. Required Report Structure (`/eval/summary.md`)

```markdown
# Egyptian Astronaut Voice Agent: Evaluation Benchmark Summary

**Date**: [ISO Date]
**Model Tested**: [Resolved Model ID, e.g. gemini-2.0-flash]
**Benchmark Dataset**: [40 Questions across 7 categories](/eval/questions.csv)
**Raw Results**: [/eval/results.csv](/eval/results.csv)

## Executive Summary Table

| Metric | Version A (Full Agent) | Version B (Baseline) | Delta / Improvement |
| :--- | :---: | :---: | :---: |
| **Total Questions** | 40 | 40 | - |
| **Questions Reviewed** | [Count] | [Count] | - |
| **Unreviewed Pending** | [Count] | [Count] | - |
| **Factual Accuracy** | **[X.X%]** | **[Y.Y%]** | **[+(X-Y)%]** |
| **Hallucination Count**| **[N]** | **[M]** | **[-(M-N)]** |
| **Average Latency** | [Z] ms | [W] ms | [Delta] ms |

## Category-by-Category Comparison

| Category | Questions | Version A Accuracy | Version A Hallucinations | Version B Accuracy | Version B Hallucinations |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Planets and the Sun | 10 | ... | ... | ... | ... |
| Moons | 5 | ... | ... | ... | ... |
| Space missions | 7 | ... | ... | ... | ... |
| Scientific facts and numbers | 6 | ... | ... | ... | ... |
| Tricky questions | 4 | ... | ... | ... | ... |
| Out-of-scope questions | 4 | ... | ... | ... | ... |
| Unanswerable questions | 4 | ... | ... | ... | ... |

## Key Findings & Grounding Analysis

- Impact of local RAG knowledge retrieval on numerical facts.
- Impact of Google Search grounding on active missions and recent space events.
- Latency trade-offs of multi-turn function calling vs single-turn baseline generation.
- Known limitations and future improvement directions.
```
