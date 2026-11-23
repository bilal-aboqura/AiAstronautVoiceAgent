# Contract: Evaluation Results Schema & Review Protocol

**Feature Branch**: `007-evaluation`  
**Contract Type**: Data Contract & Human Review Protocol  
**Path**: `/eval/results.csv` (or `/eval/results_version_a.csv`, `/eval/results_version_b.csv`)

---

## 1. Storage Format & Schema

Results are persisted as RFC 4180 compliant CSV files with UTF-8 BOM encoding.

### Header Schema:
```csv
question_id,category,configuration,model_id,question,expected_answer,reference_source,response_text,tools_called,latency_ms,uncertainty_detected,review_status,correctness,hallucination,reviewer_notes
```

| Field | Type | Allowed Values / Format | Description |
| :--- | :--- | :--- | :--- |
| `question_id` | Integer | $1 \le n \le 40$ | Question ID matching `questions.csv` |
| `category` | String | Predefined 7 categories | Question domain |
| `configuration` | String | `'Version A (Full Agent)'` \| `'Version B (Baseline)'` | Tested setup |
| `model_id` | String | e.g. `'gemini-2.0-flash'` | Model string used |
| `question` | String | Arabic string | Question text |
| `expected_answer` | String | Target answer | Target scientific fact or behavioral requirement |
| `reference_source` | String | Citation string | Verification reference source |
| `response_text` | String | Full generated text | Model's verbatim output |
| `tools_called` | String | e.g. `'search_knowledge; googleSearch'` \| `'none'` | Tools triggered during generation |
| `latency_ms` | Integer | $\ge 0$ | Total round-trip execution latency |
| `uncertainty_detected`| Boolean | `true` \| `false` | Initial algorithmic uncertainty detection |
| `review_status` | String | `'unreviewed'` \| `'reviewed'` \| `'error'` | Review completion state |
| `correctness` | String | `'unreviewed'` \| `'correct'` \| `'incorrect'` | Factual correctness assessment |
| `hallucination` | String | `'unreviewed'` \| `'yes'` \| `'no'` \| `'n/a'` | Factual fabrication flag |
| `reviewer_notes` | String | Free text | Annotations explaining scoring or discrepancies |

---

## 2. Review Protocol & Ground Truth Rules

1. **Academic Integrity Rule**:
   Model self-evaluations or fuzzy automated string checks MUST NOT be accepted as ground truth. All scoring requires human verification against the cited `reference_source`.

2. **Unreviewed Distinction Rule**:
   Before human review, `review_status`, `correctness`, and `hallucination` MUST remain strictly `'unreviewed'`. Unreviewed records MUST NEVER be counted as failures or successes in aggregate summary calculations.

3. **Scoring Standards**:
   - **`correct`**: The response provides the core facts described in `expected_answer`, cites correct numerical figures within reasonable tolerances, or appropriately admits uncertainty / deflects out-of-scope inquiries.
   - **`incorrect`**: The response provides false astronomical facts, fails to correct a tricky false premise, or gives an inaccurate scientific figure.
   - **`hallucination = 'yes'`**: A subset of incorrect answers where the model invents non-existent astronomical missions, fake celestial bodies, fabricated physical laws, or fictional historical facts that do not exist.
   - **`hallucination = 'no'`**: The answer is either factually correct, or contains a conceptual/logical mistake without fabricating fictitious entities or claims.
   - **`hallucination = 'n/a'`**: For out-of-scope or unanswerable queries where hallucination is not conceptually applicable.
