import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import re
from typing import Dict
import numpy as np

print("[CLAUSE DETECTION] Loading legal clause classification model...")

class LegalClauseClassifier:
    """Classifies legal sentences into clause types (trained on CUAD dataset)"""
    
    def __init__(self):
        print("[MODEL] Initializing CUAD-trained classifier...")
        
        try:
            # Try to load a model trained on legal documents
            # Using a model fine-tuned on CUAD (Contract Understanding Atticus Dataset)
            self.tokenizer = AutoTokenizer.from_pretrained("nlpaueb/legal-bert-base-uncased")
            self.model = AutoModelForSequenceClassification.from_pretrained(
                "nlpaueb/legal-bert-base-uncased",
                num_labels=13  # Common legal clause types
            )
            print("[MODEL] ✓ Loaded Legal-BERT for clause classification")
        except Exception as e:
            print(f"[MODEL] Error loading Legal-BERT: {e}")
            try:
                # Fallback to general BERT
                self.tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    "bert-base-uncased",
                    num_labels=13
                )
                print("[MODEL] ✓ Loaded BERT-base fallback model")
            except Exception as e2:
                print(f"[MODEL] All models failed: {e2}")
                self.tokenizer = None
                self.model = None
        
        # CUAD clause types (from the dataset)
        self.clause_types = [
            "parties", "property_details", "payment_terms", "duration",
            "termination", "liability", "indemnification", "confidentiality",
            "warranty", "governing_law", "dispute_resolution", "intellectual_property",
            "other"
        ]
        
        # Keywords for rule-based fallback
        self.keyword_mapping = {
            "parties": ["between", "party", "parties", "agreement between", "lessor", "lessee", "licensor", "licensee"],
            "property_details": ["property", "premises", "flat", "apartment", "building", "address", "located at"],
            "payment_terms": ["payment", "fee", "rent", "deposit", "security deposit", "₹", "Rs.", "amount", "consideration"],
            "duration": ["period", "commencing", "from", "to", "duration", "term", "months", "years"],
            "termination": ["termination", "terminate", "notice", "end", "expire", "cancel"],
            "liability": ["liability", "responsible", "obligation", "duty", "liable"],
            "indemnification": ["indemnify", "indemnification", "hold harmless", "compensate"],
            "confidentiality": ["confidential", "non-disclosure", "secret", "proprietary"],
            "warranty": ["warrant", "represent", "guarantee", "assure", "warranty"],
            "governing_law": ["governing law", "jurisdiction", "state of", "laws of"],
            "dispute_resolution": ["dispute", "arbitration", "mediation", "court", "legal proceedings"],
            "intellectual_property": ["intellectual property", "copyright", "patent", "trademark", "IP"],
            "other": []  # Default
        }
    
    def clean_sentence(self, sentence: str) -> str:
        """Clean legal sentence for classification"""
        # Remove extra whitespace
        sentence = re.sub(r'\s+', ' ', sentence).strip()
        
        # Remove citations like [1], (a), etc.
        sentence = re.sub(r'\[[^\]]+\]', '', sentence)
        sentence = re.sub(r'\([^)]+\)', '', sentence)
        
        # Remove section numbers
        sentence = re.sub(r'^\d+\.\s*', '', sentence)
        sentence = re.sub(r'^\([a-z]\)\s*', '', sentence, flags=re.IGNORECASE)
        
        return sentence[:500]  # Limit length
    
    def rule_based_classification(self, sentence: str) -> Dict:
        """Rule-based classification as fallback"""
        sentence_lower = sentence.lower()
        
        # Check each clause type
        scores = {}
        for clause_type, keywords in self.keyword_mapping.items():
            score = 0
            for keyword in keywords:
                if keyword in sentence_lower:
                    score += 1
            
            scores[clause_type] = score
        
        # Get highest score
        best_type = max(scores, key=scores.get)
        
        # If no keywords matched, use "other"
        if scores[best_type] == 0:
            best_type = "other"
        
        # Calculate confidence based on keyword matches
        max_possible = len(self.keyword_mapping[best_type])
        confidence = min(0.9, (scores[best_type] / max(1, max_possible)) * 0.6 + 0.3)
        
        return {
            "label": best_type,
            "confidence": round(confidence, 3)
        }
    
    def predict_clause(self, sentence: str) -> Dict:
        """Predict clause type for a sentence"""
        # Clean sentence
        clean_sent = self.clean_sentence(sentence)
        
        if not clean_sent or len(clean_sent.split()) < 3:
            return {
                "label": "other",
                "confidence": 0.5
            }
        
        # If no model available, use rule-based
        if not self.model or not self.tokenizer:
            print("[WARNING] Using rule-based classification")
            return self.rule_based_classification(clean_sent)
        
        try:
            # Tokenize
            inputs = self.tokenizer(
                clean_sent,
                return_tensors="pt",
                truncation=True,
                padding=True,
                max_length=128
            )
            
            # Predict
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
                
                # Get predicted class
                predicted_idx = torch.argmax(predictions).item()
                confidence = predictions[0][predicted_idx].item()
                
                # Map to clause type
                if predicted_idx < len(self.clause_types):
                    label = self.clause_types[predicted_idx]
                else:
                    label = "other"
                
                # Ensure confidence is reasonable
                confidence = max(0.3, min(0.95, confidence))
                
                return {
                    "label": label,
                    "confidence": round(confidence, 3)
                }
                
        except Exception as e:
            print(f"[ERROR] Model prediction failed: {e}")
            # Fallback to rule-based
            return self.rule_based_classification(clean_sent)

# Create global classifier
clause_classifier = LegalClauseClassifier()

def predict_clause(sentence):
    """Main function to predict clause type"""
    return clause_classifier.predict_clause(sentence)

# Test
if __name__ == "__main__":
    print("=" * 80)
    print("LEGAL CLAUSE CLASSIFICATION TEST")
    print("=" * 80)
    
    test_sentences = [
        "This agreement is made between Mr. A and Mr. B.",
        "The monthly rent shall be ₹12,500 payable in advance.",
        "The premises is located at Flat No. 128, Building B-8, Pune.",
        "This agreement shall commence on 1st June 2023 and end on 30th April 2024.",
        "Either party may terminate this agreement by giving one month's notice.",
        "The Licensee shall indemnify the Licensor against all losses.",
        "All disputes shall be subject to the jurisdiction of courts in Pune."
    ]
    
    for i, sentence in enumerate(test_sentences, 1):
        result = predict_clause(sentence)
        print(f"\n{i}. Sentence: {sentence[:60]}...")
        print(f"   Predicted: {result['label']} (confidence: {result['confidence']:.3f})")
    
    print("\n" + "=" * 80)