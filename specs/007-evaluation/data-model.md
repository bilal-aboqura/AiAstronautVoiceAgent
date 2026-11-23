# Data Model: Evaluation Harness & Documentation

**Feature Branch**: `007-evaluation`  
**Date**: 2026-11-23  
**Status**: Completed  
**Spec Reference**: [specs/007-evaluation/spec.md](spec.md)

---

## Entity Definitions

### 1. `EvaluationQuestion`

Represents an individual curated benchmark question in the evaluation dataset (`/eval/questions.csv`).

```typescript
export type QuestionCategory =
  | 'Planets and the Sun'
  | 'Moons'
  | 'Space missions'
  | 'Scientific facts and numbers'
  | 'Tricky questions'
  | 'Out-of-scope questions'
  | 'Unanswerable questions';

export interface EvaluationQuestion {
  /** Unique sequential integer identifier (1 through 40) */
  id: number;

  /** One of the 7 designated space domains */
  category: QuestionCategory;

  /** Question text formulated in natural Egyptian colloquial Arabic */
  question: string;

  /** Concise verified ground truth or required behavioral deflection */
  expected_answer: string;

  /** Authoritative scientific citation or official reference URL */
  reference_source: string;
}
```

**Validation Rules**:
- `id`: Must be an integer strictly within $[1, 40]$ with zero duplicates.
- `category`: Must match one of the 7 predefined `QuestionCategory` string values.
  - Exactly 10 questions in `Planets and the Sun`.
  - Exactly 5 questions in `Moons`.
  - Exactly 7 questions in `Space missions`.
  - Exactly 6 questions in `Scientific facts and numbers`.
  - Exactly 4 questions in `Tricky questions`.
  - Exactly 4 questions in `Out-of-scope questions`.
  - Exactly 4 questions in `Unanswerable questions`.
  - Total count: strictly 40.
- `question`: Non-empty string; minimum 10 characters; must contain Arabic characters.
- `expected_answer`: Non-empty string specifying objective verifiable facts or explicit uncertainty/deflection requirement.
- `reference_source`: Non-empty string pointing to official space agency (NASA, ESA, IAU, etc.) or academic scientific reference.

---

### 2. `EvaluationResultRecord`

Represents the execution outcome of an evaluation question against a specific configuration, saved in CSV format under `/eval/`.

```typescript
export type EvaluationConfiguration = 'Version A (Full Agent)' | 'Version B (Baseline)';

export type ReviewStatus = 'unreviewed' | 'reviewed';

export type CorrectnessJudgment = 'unreviewed' | 'correct' | 'incorrect';

export type HallucinationJudgment = 'unreviewed' | 'yes' | 'no' | 'n/a';

export interface EvaluationResultRecord {
  /** Reference to EvaluationQuestion.id (1..40) */
  question_id: number;

  /** Category copied from EvaluationQuestion */
  category: QuestionCategory;

  /** Configuration variant under test */
  configuration: EvaluationConfiguration;

  /** The actual model string used during inference */
  model_id: string;

  /** The original prompt question text in Egyptian Arabic */
  question: string;

  /** Ground truth or behavioral expectation */
  expected_answer: string;

  /** Reference citation */
  reference_source: string;

  /** Full generated text response from the model */
  response_text: string;

  /** Semicolon-delimited list of tools invoked, e.g., 'search_knowledge; googleSearch' or 'none' */
  tools_called: string;

  /** Round-trip inference latency measured in milliseconds */
  latency_ms: number;

  /** Automated flag indicating whether the response expressed uncertainty or boundary deflection */
  uncertainty_detected: boolean;

  /** State of human verification */
  review_status: ReviewStatus;

  /** Human reviewer correctness evaluation */
  correctness: CorrectnessJudgment;

  /** Human reviewer hallucination evaluation */
  hallucination: HallucinationJudgment;

  /** Free-text notes or justification from the human evaluator */
  reviewer_notes: string;
}
```

---

### 3. `EvaluationSummary`

Represents the aggregated quantitative comparison between Version A and Version B.

```typescript
export interface ConfigurationMetrics {
  total_executed: number;
  total_reviewed: number;
  unreviewed_count: number;
  correct_count: number;
  incorrect_count: number;
  accuracy_percent: number;
  hallucination_count: number;
  hallucination_rate_percent: number;
  avg_latency_ms: number;
  median_latency_ms: number;
  min_latency_ms: number;
  max_latency_ms: number;
  tools_invoked_distribution: Record<string, number>;
}

export interface CategoryComparison {
  category: QuestionCategory;
  total_questions: number;
  version_a_accuracy_percent: number;
  version_a_hallucinations: number;
  version_b_accuracy_percent: number;
  version_b_hallucinations: number;
  accuracy_delta_percent: number;
}

export interface EvaluationSummary {
  timestamp: string;
  model_id: string;
  total_questions: number;
  version_a: ConfigurationMetrics;
  version_b: ConfigurationMetrics;
  category_breakdown: CategoryComparison[];
  key_findings: string[];
}
```

---

## State Transitions: Human Review Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Unreviewed: Evaluation Runner executes query & logs output
    
    state Unreviewed {
        [*] --> PendingInspection
        PendingInspection: review_status = 'unreviewed'
        PendingInspection: correctness = 'unreviewed'
        PendingInspection: hallucination = 'unreviewed'
    }

    Unreviewed --> EvaluatorReview: Human Evaluator inspects response vs expected_answer & reference_source
    
    state EvaluatorReview {
        state CorrectBranch <<choice>>
        EvaluatorReview --> CorrectBranch: Assess factuality
        
        CorrectBranch --> MarkCorrect: Facts match reference source
        CorrectBranch --> MarkIncorrect: Facts contradict reference or miss key facts
        
        state HallucinationBranch <<choice>>
        MarkIncorrect --> HallucinationBranch: Check fabricated data
        HallucinationBranch --> MarkHallucination: Invented non-existent entities/numbers
        HallucinationBranch --> MarkRegularError: Conceptual error without fabrication
    }

    MarkCorrect --> Reviewed: Set review_status = 'reviewed', correctness = 'correct', hallucination = 'no'
    MarkHallucination --> Reviewed: Set review_status = 'reviewed', correctness = 'incorrect', hallucination = 'yes'
    MarkRegularError --> Reviewed: Set review_status = 'reviewed', correctness = 'incorrect', hallucination = 'no'

    Reviewed --> [*]: Ready for Summary Generation
```

---

## CSV File Storage Schema

### 1. Benchmark Dataset: `/eval/questions.csv`

```csv
id,category,question,expected_answer,reference_source
1,"Planets and the Sun","ما هو أكبر كوكب في المجموعة الشمسية؟ وما هو تركيبه الأساسي؟","كوكب المشتري هو أكبر كوكب، وهو عملاق غازي يتكون أساساً من الهيدروجين والهيليوم.","NASA Jupiter Fact Sheet (https://nssdc.gsfc.nasa.gov/planetary/factsheet/jupiterfact.html)"
...
40,"Unanswerable questions","إيه هي الإحداثيات الدقيقة لمكان وجود كائنات فضائية ذكية دلوقتي؟","لا توجد أي أدلة أو معلومات علمية مؤكدة حتى الآن عن وجود أو إحداثيات كائنات فضائية ذكية، وهذا أمر غير معروف علمياً.","NASA Astrobiology / Search for Extraterrestrial Life"
```

### 2. Execution Results: `/eval/results.csv`

```csv
question_id,category,configuration,model_id,question,expected_answer,reference_source,response_text,tools_called,latency_ms,uncertainty_detected,review_status,correctness,hallucination,reviewer_notes
1,"Planets and the Sun","Version A (Full Agent)","gemini-2.0-flash","ما هو أكبر كوكب في المجموعة الشمسية؟...","كوكب المشتري...","NASA Jupiter Fact Sheet","كوكب المشتري هو العملاق الأكبر في مجموعتنا الشمسية...","search_knowledge",1420,false,"unreviewed","unreviewed","unreviewed",""
1,"Planets and the Sun","Version B (Baseline)","gemini-2.0-flash","ما هو أكبر كوكب في المجموعة الشمسية؟...","كوكب المشتري...","NASA Jupiter Fact Sheet","أكبر كوكب هو المشتري...","none",850,false,"unreviewed","unreviewed","unreviewed",""
```
