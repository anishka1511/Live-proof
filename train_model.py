#!/usr/bin/env python3
"""
LiveProof ML Model Training Script
Generates synthetic dataset and trains classification model
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import pickle
import json
from datetime import datetime

# Feature names
FEATURE_NAMES = [
    'avg_reaction_time',
    'reaction_time_variance',
    'task_accuracy',
    'hesitation_time',
    'cursor_path_length',
    'cursor_direction_changes',
    'speed_variance'
]

def generate_human_samples(n_samples=20):
    """Generate human-like behavioral samples"""
    print(f"Generating {n_samples} human samples...")
    
    samples = []
    for i in range(n_samples):
        sample = {
            # Humans have varying reaction times (1-3 seconds)
            'avg_reaction_time': np.random.normal(1.8, 0.5),
            
            # Humans show variance in reactions
            'reaction_time_variance': np.random.uniform(0.3, 0.8),
            
            # Humans are generally accurate but not perfect
            'task_accuracy': np.random.uniform(0.7, 1.0),
            
            # Humans hesitate slightly
            'hesitation_time': np.random.normal(0.6, 0.3),
            
            # Humans have curved mouse paths
            'cursor_path_length': np.random.uniform(300, 800),
            
            # Humans change direction frequently
            'cursor_direction_changes': np.random.randint(8, 25),
            
            # Humans have variable speed
            'speed_variance': np.random.uniform(0.02, 0.08),
            
            # Label: 1 = Human
            'label': 1
        }
        samples.append(sample)
    
    return samples

def generate_synthetic_samples(n_samples=20):
    """Generate synthetic/bot-like behavioral samples"""
    print(f"Generating {n_samples} synthetic samples...")
    
    samples = []
    for i in range(n_samples):
        sample = {
            # Bots have very consistent reaction times
            'avg_reaction_time': np.random.normal(0.8, 0.1),
            
            # Bots show minimal variance
            'reaction_time_variance': np.random.uniform(0.01, 0.1),
            
            # Bots are either perfect or very poor
            'task_accuracy': np.random.choice([0.0, 0.3, 1.0]),
            
            # Bots have minimal hesitation
            'hesitation_time': np.random.uniform(0.05, 0.2),
            
            # Bots have straight mouse paths
            'cursor_path_length': np.random.uniform(100, 300),
            
            # Bots change direction rarely
            'cursor_direction_changes': np.random.randint(0, 5),
            
            # Bots have consistent speed
            'speed_variance': np.random.uniform(0.001, 0.015),
            
            # Label: 0 = Synthetic
            'label': 0
        }
        samples.append(sample)
    
    return samples

def create_dataset(n_human=20, n_synthetic=20):
    """Create and save dataset"""
    print("\n" + "="*50)
    print("Creating LiveProof Training Dataset")
    print("="*50 + "\n")
    
    # Generate samples
    human_samples = generate_human_samples(n_human)
    synthetic_samples = generate_synthetic_samples(n_synthetic)
    
    # Combine
    all_samples = human_samples + synthetic_samples
    
    # Create DataFrame
    df = pd.DataFrame(all_samples)
    
    # Shuffle
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    # Save to CSV
    df.to_csv('training_data.csv', index=False)
    print(f"✓ Dataset saved to training_data.csv")
    print(f"  Total samples: {len(df)}")
    print(f"  Human samples: {n_human}")
    print(f"  Synthetic samples: {n_synthetic}")
    print(f"  Features: {len(FEATURE_NAMES)}")
    
    return df

def train_model(df, model_type='logistic'):
    """Train ML model"""
    print("\n" + "="*50)
    print(f"Training {model_type.upper()} Model")
    print("="*50 + "\n")
    
    # Prepare data
    X = df[FEATURE_NAMES].values
    y = df['label'].values
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    
    print(f"Training samples: {len(X_train)}")
    print(f"Testing samples: {len(X_test)}")
    
    # Normalize features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    if model_type == 'logistic':
        model = LogisticRegression(random_state=42, max_iter=1000)
    else:
        model = RandomForestClassifier(n_estimators=100, random_state=42)
    
    print("\nTraining model...")
    model.fit(X_train_scaled, y_train)
    print("✓ Training complete")
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)
    
    print("\n" + "="*50)
    print("Model Evaluation")
    print("="*50)
    
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nAccuracy: {accuracy:.2%}")
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, 
                                target_names=['Synthetic', 'Human']))
    
    # Feature importance
    if model_type == 'logistic':
        weights = model.coef_[0]
        print("\nFeature Weights (Logistic Regression):")
        for name, weight in zip(FEATURE_NAMES, weights):
            print(f"  {name:30s}: {weight:+.4f}")
    else:
        importances = model.feature_importances_
        print("\nFeature Importances (Random Forest):")
        for name, importance in zip(FEATURE_NAMES, importances):
            print(f"  {name:30s}: {importance:.4f}")
    
    # Save model and scaler together
    model_package = {
        'model': model,
        'scaler': scaler,
        'feature_names': FEATURE_NAMES,
        'model_type': model_type,
        'accuracy': accuracy,
        'trained_at': datetime.now().isoformat()
    }
    
    with open('model.pkl', 'wb') as f:
        pickle.dump(model_package, f)
    
    print(f"\n✓ Model saved to model.pkl")
    
    # Save metadata
    metadata = {
        'model_type': model_type,
        'accuracy': accuracy,
        'training_samples': len(X_train),
        'testing_samples': len(X_test),
        'features': FEATURE_NAMES,
        'trained_at': datetime.now().isoformat()
    }
    
    with open('model_metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print("✓ Metadata saved to model_metadata.json")
    
    return model, scaler

def main():
    """Main training pipeline"""
    print("\n")
    print("="*50)
    print("LiveProof ML Training Pipeline")
    print("="*50)
    
    # Create dataset
    df = create_dataset(n_human=20, n_synthetic=20)
    
    # Train model (Logistic Regression for explainability)
    model, scaler = train_model(df, model_type='logistic')
    
    print("\n" + "="*50)
    print("Training Complete!")
    print("="*50)
    print("\nFiles created:")
    print("  • training_data.csv - Training dataset")
    print("  • model.pkl - Trained model")
    print("  • model_metadata.json - Model metadata")
    print("\nNext steps:")
    print("  1. Run: python server.py")
    print("  2. Open: index.html in browser")
    print("  3. Start verification!")
    print("\n")

if __name__ == '__main__':
    main()
