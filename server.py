#!/usr/bin/env python3
"""
LiveProof ML Backend Server
Flask API for ML-based human presence verification
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pickle
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Load trained model
MODEL_PATH = 'model.pkl'
model = None
feature_names = [
    'avg_reaction_time',
    'reaction_time_variance',
    'task_accuracy',
    'hesitation_time',
    'cursor_path_length',
    'cursor_direction_changes',
    'speed_variance'
]

def load_model():
    """Load the trained ML model"""
    global model
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        print(f"✓ Model loaded from {MODEL_PATH}")
    else:
        print(f"⚠ Model not found at {MODEL_PATH}. Run train_model.py first.")
        print("  Operating in demo mode with rule-based fallback.")

def extract_feature_vector(features):
    """Extract feature vector in correct order"""
    return np.array([[
        features.get('avg_reaction_time', 0),
        features.get('reaction_time_variance', 0),
        features.get('task_accuracy', 0),
        features.get('hesitation_time', 0),
        features.get('cursor_path_length', 0),
        features.get('cursor_direction_changes', 0),
        features.get('speed_variance', 0)
    ]])

def normalize_features(X):
    """Simple feature normalization"""
    # Normalize reaction times to seconds (if in ms)
    if X[0, 0] > 100:
        X[0, 0] /= 1000
        X[0, 3] /= 1000
    
    # Normalize variance
    if X[0, 1] > 100000:
        X[0, 1] /= 1000000
    
    # Normalize path length
    if X[0, 4] > 1000:
        X[0, 4] /= 1000
    
    return X

def get_feature_importance(features, confidence):
    """Calculate feature importance/weights for explainability"""
    feature_importance = []
    
    # Reaction time analysis
    rt = features.get('avg_reaction_time', 0) / 1000  # Convert to seconds
    if rt < 2:
        feature_importance.append({
            'name': 'avg_reaction_time',
            'weight': 0.22,
            'positive': True
        })
    else:
        feature_importance.append({
            'name': 'avg_reaction_time',
            'weight': -0.12,
            'positive': False
        })
    
    # Variance analysis (humans have variance)
    variance = features.get('reaction_time_variance', 0)
    if variance > 100000:
        feature_importance.append({
            'name': 'reaction_time_variance',
            'weight': 0.18,
            'positive': True
        })
    else:
        feature_importance.append({
            'name': 'reaction_time_variance',
            'weight': -0.15,
            'positive': False
        })
    
    # Task accuracy
    accuracy = features.get('task_accuracy', 0)
    if accuracy > 0.6:
        feature_importance.append({
            'name': 'task_accuracy',
            'weight': 0.15,
            'positive': True
        })
    else:
        feature_importance.append({
            'name': 'task_accuracy',
            'weight': -0.10,
            'positive': False
        })
    
    # Cursor movement entropy
    direction_changes = features.get('cursor_direction_changes', 0)
    if direction_changes > 5:
        feature_importance.append({
            'name': 'cursor_entropy',
            'weight': 0.12,
            'positive': True
        })
    else:
        feature_importance.append({
            'name': 'cursor_entropy',
            'weight': 0.05,
            'positive': True
        })
    
    # Speed variance
    speed_var = features.get('speed_variance', 0)
    if speed_var > 0.01:
        feature_importance.append({
            'name': 'speed_variance',
            'weight': 0.14,
            'positive': True
        })
    else:
        feature_importance.append({
            'name': 'speed_variance',
            'weight': -0.08,
            'positive': False
        })
    
    # Hesitation time (some hesitation is human)
    hesitation = features.get('hesitation_time', 0) / 1000
    if 0.2 < hesitation < 1.5:
        feature_importance.append({
            'name': 'hesitation_time',
            'weight': 0.10,
            'positive': True
        })
    elif hesitation < 0.2:
        feature_importance.append({
            'name': 'hesitation_time',
            'weight': -0.06,
            'positive': False
        })
    else:
        feature_importance.append({
            'name': 'hesitation_time',
            'weight': 0.03,
            'positive': True
        })
    
    # Sort by absolute weight
    feature_importance.sort(key=lambda x: abs(x['weight']), reverse=True)
    
    return feature_importance

@app.route('/')
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'running',
        'service': 'LiveProof ML Backend',
        'model_loaded': model is not None
    })

@app.route('/verify', methods=['POST'])
def verify():
    """Main verification endpoint"""
    try:
        data = request.json
        session_id = data.get('sessionId')
        features = data.get('features', {})
        
        print(f"\n📊 Verification Request")
        print(f"Session ID: {session_id}")
        print(f"Features: {features}")
        
        # Extract and normalize features
        X = extract_feature_vector(features)
        X = normalize_features(X)
        
        # ML Inference
        if model is not None:
            try:
                # Get probability from model
                confidence = model.predict_proba(X)[0][1]  # Probability of human class
                print(f"✓ ML Model Prediction: {confidence:.2%}")
            except Exception as e:
                print(f"⚠ Model prediction failed: {e}")
                confidence = fallback_scoring(features)
        else:
            # Fallback to rule-based scoring
            confidence = fallback_scoring(features)
        
        # Get feature importance for explainability
        feature_importance = get_feature_importance(features, confidence)
        
        # Prepare response
        response = {
            'sessionId': session_id,
            'confidence': float(confidence),
            'featureImportance': feature_importance,
            'features': features,
            'timestamp': datetime.now().isoformat(),
            'modelUsed': 'ML' if model is not None else 'Rule-based'
        }
        
        print(f"✓ Confidence Score: {confidence:.2%}\n")
        
        return jsonify(response)
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return jsonify({
            'error': str(e),
            'sessionId': data.get('sessionId') if 'data' in locals() else None
        }), 500

def fallback_scoring(features):
    """Rule-based scoring when ML model is not available"""
    score = 0.5  # Start at medium confidence
    
    # Reaction time
    rt = features.get('avg_reaction_time', 0) / 1000
    if rt < 2:
        score += 0.15
    elif rt > 5:
        score -= 0.10
    
    # Variance (humans have variance)
    variance = features.get('reaction_time_variance', 0)
    if variance > 100000:
        score += 0.15
    else:
        score -= 0.10
    
    # Accuracy
    accuracy = features.get('task_accuracy', 0)
    if accuracy > 0.6:
        score += 0.10
    else:
        score -= 0.05
    
    # Cursor movement
    direction_changes = features.get('cursor_direction_changes', 0)
    if direction_changes > 5:
        score += 0.10
    
    # Speed variance
    speed_var = features.get('speed_variance', 0)
    if speed_var > 0.01:
        score += 0.10
    
    # Clamp to valid range
    return max(0.2, min(0.95, score))

@app.route('/stats', methods=['GET'])
def stats():
    """Get model statistics"""
    return jsonify({
        'model_loaded': model is not None,
        'feature_count': len(feature_names),
        'features': feature_names,
        'model_path': MODEL_PATH
    })

if __name__ == '__main__':
    print("=" * 50)
    print("LiveProof ML Backend Server")
    print("=" * 50)
    load_model()
    print("\n🚀 Starting Flask server on http://localhost:5000")
    print("   Press Ctrl+C to stop\n")
    app.run(debug=True, port=5000)
