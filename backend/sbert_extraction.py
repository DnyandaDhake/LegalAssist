from sentence_transformers import SentenceTransformer, util
import nltk

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download("punkt")

from nltk.tokenize import sent_tokenize

try:
    model = SentenceTransformer("all-MiniLM-L6-v2")
    print("[SBERT] Model loaded successfully!")
except Exception as e:
    print(f"[SBERT] Error loading model: {e}")
    model = None

KEYWORDS = [
    "payment", "termination", "confidentiality", "liability", "indemnification",
    "warranty", "intellectual property", "dispute resolution", "governing law",
    "assignment", "renewal", "insurance", "notice", "tax", "audit", 
    "force majeure", "non-compete", "data protection", "severability",
    "deposit", "maintenance", "agreement", "contract", "license", 
    "leave and license", "tenant", "landlord", "premises", "term"
]

def extract_relevant_sentences(text):
    if model is None:
        # Fallback: return first 15 sentences
        sentences = sent_tokenize(text)
        return sentences[:60]

    sentences = sent_tokenize(text)
    
    # Filter out very short sentences
    sentences = [s for s in sentences if len(s.split()) > 3]
    
    if len(sentences) == 0:
        return []

    try:
        keyword_embeddings = model.encode(KEYWORDS, convert_to_tensor=True)
        sent_embeddings = model.encode(sentences, convert_to_tensor=True)

        relevance_scores = util.cos_sim(sent_embeddings, keyword_embeddings).cpu().numpy().max(axis=1)

        ranked = sorted(list(zip(sentences, relevance_scores)), key=lambda x: x[1], reverse=True)
        
        # Take top 20 or all if less than 20
        top_sentences = [s for s, score in ranked[:20]]  
        return top_sentences
    except Exception as e:
        print(f"Error in SBERT extraction: {e}")
        # Fallback: return first 15 sentences
        return sentences[:15]