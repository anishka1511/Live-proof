# LiveProof – ML-Based Human Presence Verification (PoC)

## Overview
LiveProof is a document-less, real-time human presence verification system.
This Proof of Concept (PoC) uses **behavioral machine learning** to distinguish between
**human-like** and **synthetic/scripted** interactions during a live session.

The system verifies **human presence, not identity**, and does not rely on documents,
OTPs, or stored biometric data.

This is an **early-stage ML prototype**, focused on feasibility, explainability,
and trusted AI principles.

---

## Core Idea
Instead of verifying *who* a user is, LiveProof verifies **whether a real human is actively present** by analyzing short-term interaction behavior using machine learning.

---

## Objectives
- Capture real-time interaction behavior
- Extract meaningful behavioral features
- Use ML to classify interactions as human-like or synthetic
- Generate a Human Confidence Score
- Provide explainable, auditable decisions
- Maintain privacy-first design

---

## Scope

### Included
- Web-based interaction flow
- Multiple dynamic challenges
- Behavioral signal capture
- Feature extraction
- ML-based classification
- Explainable confidence scoring

### Explicitly Excluded
- Face recognition
- Voice identity analysis
- Deepfake media detection
- Large-scale datasets
- Continuous tracking
- Identity verification

---

## Tech Stack

### Frontend
- HTML
- CSS
- Vanilla JavaScript
- Browser interaction APIs

### ML / Backend (Offline or Local)
- Python
- scikit-learn
- CSV-based dataset
- Lightweight ML models (Logistic Regression / Random Forest)

---

## System Architecture

User Interaction  
→ Behavioral Signal Capture  
→ Feature Extraction  
→ ML Inference  
→ Human Confidence Score  
→ Explanation + Audit Output  

---

## Application Flow

### Step 1: Start Verification
- Display a button: **"Start LiveProof Verification"**
- Generate a unique session ID
- Initialize signal capture

---

### Step 2: Dynamic Challenge Sequence
Randomly select **2–3 challenges**, such as:
- Click a randomly appearing target
- Follow an instruction in sequence
- Timed reaction task

Each challenge must be:
- One-time
- Time-bound
- Unpredictable

---

### Step 3: Behavioral Signal Capture
Capture real interaction data:
- Reaction time (ms)
- Delay before first action
- Mouse cursor path length
- Mouse direction changes
- Cursor speed variance
- Task completion accuracy

No raw video, audio, or identity data is stored.

---

## Feature Extraction (ML Input)

Each session is converted into a feature vector, for example:

- avg_reaction_time
- reaction_time_variance
- cursor_path_length
- cursor_entropy
- speed_variance
- hesitation_time
- task_accuracy

Each feature represents **behavioral dynamics**, not personal identity.

---

## Dataset Strategy (PoC)

### Human Samples
- Collect 10–20 sessions from real users
- Label as `1 = Human`

### Synthetic Samples
Generate scripted or simulated sessions with:
- Fixed reaction times
- Perfect accuracy
- Linear cursor paths
- Zero variance

Label as `0 = Synthetic`

Store dataset as CSV.

---

## Machine Learning Model

### Problem Type
Binary classification:
- Human-like vs Synthetic-like behavior

### Model Options
Choose ONE:
- Logistic Regression (preferred for explainability)
- Random Forest (for non-linear behavior)

### Training (Offline)
1. Load dataset
2. Normalize features
3. Train model
4. Evaluate on validation data
5. Export:
   - Model parameters
   - Feature weights / importance
   - Classification threshold

---

## ML Inference (Runtime)

During verification:
- Extract features from live session
- Pass feature vector to trained model
- Output probability score

Example:Human Confidence = 0.84


Convert probability to percentage for UI display.

---

## Explainability (MANDATORY)

Display a transparent explanation of the ML decision.

Example:Human Confidence Score: 84%

Top Contributing Factors:

Reaction time variance (+0.22)

Cursor movement entropy (+0.18)

Task accuracy (+0.15)

Overly consistent timing (-0.06)


All explanations must be derived from model weights or feature importance.

---

## Confidence Levels
- 70–100 → High Confidence (Human Present)
- 40–69 → Medium Confidence (Uncertain)
- <40 → Low Confidence (Potential Synthetic Interaction)

No hard rejection — confidence degrades gracefully.

---

## Audit Output
Generate a structured session summary:
- Session ID
- Challenges used
- Features extracted
- Final confidence score
- Explanation

This is for transparency and compliance demonstration.

---

## Privacy Principles
- No documents or OTPs
- No biometric identity storage
- No face or voice recognition
- Behavioral data only
- Session-scoped processing

---

## Non-Functional Requirements
- Minimal latency
- Deterministic inference
- Explainable decisions
- ML model runs locally or server-side
- No external APIs required

---

## Demo Talking Points
- This system verifies **presence, not identity**
- ML is behavioral, not biometric
- Decisions are explainable and auditable
- Dataset is intentionally small for PoC
- Architecture is ML-ready for scale

---

## Success Criteria
- User completes verification in < 1 minute
- ML model outputs confidence score
- Explanation is shown clearly
- Demo runs reliably
- Design decisions are defensible

---

## Disclaimer
This is a Proof of Concept intended to demonstrate feasibility,
architecture, and trust-focused ML design.
It is not a production identity verification system.