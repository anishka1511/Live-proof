# LiveProof – ML-Based Human Presence Verification

## Overview
LiveProof is a document-less, real-time human presence verification system that uses **behavioral machine learning** to distinguish between human-like and synthetic/scripted interactions during a live session.

This Proof of Concept (PoC) demonstrates:
- ✅ Real-time behavioral signal capture
- ✅ ML-based classification (Logistic Regression)
- ✅ Explainable AI with feature importance
- ✅ Privacy-first design (no biometric data)
- ✅ Transparent decision-making

## System Architecture

```
User Interaction (Frontend)
    ↓
Behavioral Signal Capture (Mouse tracking, Reaction time)
    ↓
Feature Extraction (7 behavioral features)
    ↓
ML Inference (Python/scikit-learn)
    ↓
Human Confidence Score + Explanation
```

## Tech Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Browser APIs (mouse tracking, timing)

### Backend
- Python 3.8+
- Flask (REST API)
- scikit-learn (ML)
- NumPy, Pandas

## Project Structure

```
Live-proof/
├── index.html              # Frontend UI
├── styles.css              # Styling
├── app.js                  # JavaScript logic & signal capture
├── server.py               # Flask ML backend
├── train_model.py          # ML training script
├── requirements.txt        # Python dependencies
├── README.md               # This file
├── structure.md            # Project specification
│
├── training_data.csv       # Generated dataset (after training)
├── model.pkl               # Trained ML model (after training)
└── model_metadata.json     # Model info (after training)
```

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Step 1: Install Python Dependencies

```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Train the ML Model

```bash
python train_model.py
```

This will:
- Generate 40 training samples (20 human, 20 synthetic)
- Train a Logistic Regression model
- Save `model.pkl` and `training_data.csv`
- Display model accuracy and feature weights

Expected output:
```
Training Complete!
Accuracy: 90-100%
✓ Model saved to model.pkl
```

### Step 3: Start the Backend Server

```bash
python server.py
```

Server will start on `http://localhost:5000`

### Step 4: Open the Frontend

Open `index.html` in your browser:
- **Option 1**: Double-click `index.html`
- **Option 2**: Use a local server (recommended)
  ```bash
  # Python
  python -m http.server 8000
  # Then open: http://localhost:8000
  ```

## Usage

1. **Start Verification**: Click "Start LiveProof Verification"
2. **Complete Challenges**: Follow on-screen instructions for 3 challenges:
   - Click randomly appearing targets
   - Follow number sequences
   - Timed reaction tasks
3. **View Results**: See your Human Confidence Score with ML explanation

## Features

### Behavioral Signals Captured
- **Reaction Time**: Time to complete each challenge
- **Reaction Time Variance**: Consistency of responses
- **Mouse Movement Path**: Cursor trajectory length
- **Direction Changes**: Cursor movement entropy
- **Speed Variance**: Acceleration/deceleration patterns
- **Hesitation Time**: Delay before first action
- **Task Accuracy**: Challenge completion success

### ML Model
- **Type**: Logistic Regression (for explainability)
- **Input**: 7 behavioral features
- **Output**: Probability (0-1) of human presence
- **Confidence Levels**:
  - 70-100%: High Confidence (Human Present)
  - 40-69%: Medium Confidence (Uncertain)
  - <40%: Low Confidence (Potential Synthetic)

### Explainability
Every decision includes:
- Feature importance weights
- Plain-English explanations
- Transparent scoring breakdown
- Session audit log

## Demo Mode

If the ML backend is not running, the system automatically falls back to rule-based scoring for demonstration purposes. The UI remains fully functional.

## Privacy & Security

### Privacy-First Design
- ✅ No documents or OTPs required
- ✅ No biometric identity storage
- ✅ No face or voice recognition
- ✅ No data persistence (session-scoped)
- ✅ All processing happens locally

### What We DON'T Collect
- ❌ Personal identification
- ❌ Biometric data
- ❌ Video or audio
- ❌ IP addresses
- ❌ Long-term behavioral profiles

### What We Analyze
- ✅ Reaction times (temporary)
- ✅ Mouse movement patterns (temporary)
- ✅ Challenge completion (temporary)

All data is discarded after the session ends.

## API Documentation

### POST `/verify`

Verify user behavior and return confidence score.

**Request:**
```json
{
  "sessionId": "LP-1234567890-ABC123",
  "features": {
    "avg_reaction_time": 1800,
    "reaction_time_variance": 0.5,
    "task_accuracy": 0.85,
    "hesitation_time": 600,
    "cursor_path_length": 450,
    "cursor_direction_changes": 12,
    "speed_variance": 0.04
  }
}
```

**Response:**
```json
{
  "sessionId": "LP-1234567890-ABC123",
  "confidence": 0.87,
  "featureImportance": [
    {"name": "reaction_time_variance", "weight": 0.22, "positive": true},
    {"name": "avg_reaction_time", "weight": 0.18, "positive": true}
  ],
  "features": {...},
  "timestamp": "2026-02-09T10:30:00",
  "modelUsed": "ML"
}
```

### GET `/stats`

Get model statistics.

**Response:**
```json
{
  "model_loaded": true,
  "feature_count": 7,
  "features": ["avg_reaction_time", ...],
  "model_path": "model.pkl"
}
```

## Development

### Running Tests
```bash
# Test the backend
python server.py
# Visit http://localhost:5000 in browser

# Test the frontend
# Open index.html and complete a verification
```

### Retraining the Model
```bash
python train_model.py
```

### Customizing Challenges
Edit challenge logic in `app.js`:
- Modify `showClickTargetChallenge()`
- Modify `showSequenceChallenge()`
- Modify `showTimedReactionChallenge()`

### Adjusting ML Model
Edit `train_model.py`:
- Change `n_human` and `n_synthetic` for more samples
- Switch to RandomForest: `model_type='random_forest'`
- Add/remove features in `FEATURE_NAMES`

## Troubleshooting

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### CORS errors
Ensure Flask-CORS is installed:
```bash
pip install flask-cors
```

### Model not found
Run training first:
```bash
python train_model.py
```

### Frontend can't connect to backend
1. Check server is running: `http://localhost:5000`
2. Check browser console for errors
3. Ensure CORS is enabled in `server.py`

## Performance

- **Verification Time**: < 1 minute
- **Backend Latency**: < 100ms
- **Model Inference**: < 10ms
- **Frontend**: Runs on any modern browser

## Limitations (By Design)

This is a **Proof of Concept** with intentional limitations:

1. **Small Dataset**: 40 synthetic samples (not production-scale)
2. **Simple Features**: 7 basic behavioral signals
3. **No Advanced Detection**: No deepfake or sophisticated bot detection
4. **Session-Only**: No persistent user profiles
5. **Local Deployment**: Single-machine setup

## Future Enhancements

### Phase 2
- [ ] More challenge types
- [ ] Advanced mouse analytics
- [ ] Larger training dataset
- [ ] Cross-validation

### Phase 3
- [ ] Deep learning models
- [ ] Real-time adaptive challenges
- [ ] Multi-session analysis
- [ ] Production deployment

## Contributing

This is a PoC project. For improvements:
1. Fork the repository
2. Create a feature branch
3. Test thoroughly
4. Submit pull request

## License

This project is a Proof of Concept for educational and demonstration purposes.

## Disclaimer

⚠️ **This is NOT a production system**

LiveProof is a Proof of Concept intended to demonstrate:
- Technical feasibility
- ML architecture patterns
- Privacy-first design
- Explainable AI principles

**DO NOT USE** for:
- Real-world identity verification
- Security-critical applications
- Production authentication
- Compliance requirements

## Support

For issues or questions:
1. Check this README
2. Review `structure.md`
3. Check browser/server console logs
4. Verify all dependencies are installed

## Acknowledgments

Built following ML best practices:
- Explainable AI (XAI) principles
- Privacy-by-design
- Transparent decision-making
- Minimal data collection

## Version

**v1.0.0** - Initial PoC Release
- ML-based classification
- 3 dynamic challenges
- 7 behavioral features
- Explainable results
- Full documentation

---

**Built with ❤️ for privacy-first ML verification**
