import matplotlib.pyplot as plt
import numpy as np

# ==================================================
# GRAPH 1: READABILITY IMPROVEMENT (BAR GRAPH ONLY)
# ==================================================

documents = ["Document 1", "Document 2"]
original_readability = [43.97, 33.01]
summary_readability = [61.0, 63.25]

x = np.arange(len(documents))
width = 0.20

plt.figure(figsize=(8, 5))
bars1 = plt.bar(x - width/2, original_readability, width, label="Original Legal Document")
bars2 = plt.bar(x + width/2, summary_readability, width, label="Proposed System Summary")

plt.xticks(x, documents)
plt.ylabel("Flesch Reading Ease Score")
plt.title("Readability Improvement using Proposed Legal AI System")
plt.legend()
plt.grid(axis="y", linestyle="--", alpha=0.6)

for bar in bars1 + bars2:
    plt.text(
        bar.get_x() + bar.get_width()/2,
        bar.get_height() + 1,
        f"{bar.get_height():.1f}",
        ha="center",
        fontsize=9
    )

plt.tight_layout()
plt.show()

# ==================================================
# GRAPH 2: INFORMATION COVERAGE COMPARISON (CLOSER BARS)
# ==================================================

systems = ["Existing Legal System\n(Literature)", "Proposed System"]
coverage_scores = [60,95]

x = np.array([0, 0.6])   # 🔹 reduced distance
width = 0.15

plt.figure(figsize=(5, 4))
bars = plt.bar(x, coverage_scores, width)

plt.xticks(x, systems)
plt.ylabel("Information Coverage (%)")
plt.title("Information Coverage Comparison")
plt.ylim(0, 110)
plt.grid(axis="y", linestyle="--", alpha=0.6)

for bar in bars:
    plt.text(
        bar.get_x() + bar.get_width()/2,
        bar.get_height() + 2,
        f"{bar.get_height()}%",
        ha="center",
        fontsize=10
    )

plt.tight_layout()
plt.show()

# ==================================================
# GRAPH 3: FACTUAL CONSISTENCY COMPARISON (CLOSER BARS)
# ==================================================

consistency_scores = [70, 95]

plt.figure(figsize=(5, 4))
bars = plt.bar(x, consistency_scores, width)

plt.xticks(x, systems)
plt.ylabel("Consistency Score (%)")
plt.title("Factual Consistency Comparison")
plt.ylim(0, 110)
plt.grid(axis="y", linestyle="--", alpha=0.6)

for bar in bars:
    plt.text(
        bar.get_x() + bar.get_width()/2,
        bar.get_height() + 2,
        f"{bar.get_height()}%",
        ha="center",
        fontsize=10
    )

plt.tight_layout()
plt.show()

# ==================================================
# GRAPH 4: SYSTEM CAPABILITY COMPARISON (SCORE-BASED)
# ==================================================

capabilities = [
    "Readable Summary",
    "Structured Output",
    "Automated Evaluation",
    "Consistency Check"
]

existing_system = [50, 40, 0, 60]
proposed_system = [63, 65, 70, 90]

x = np.arange(len(capabilities))
width = 0.15

plt.figure(figsize=(8, 5))
bars1 = plt.bar(x - width/2, existing_system, width, label="Existing Systems")
bars2 = plt.bar(x + width/2, proposed_system, width, label="Proposed System")

plt.xticks(x, capabilities, rotation=20)
plt.ylabel("Capability Score")
plt.ylim(0, 100)
plt.title("Score-based Capability Comparison of Legal AI Systems")
plt.legend()
plt.grid(axis="y", linestyle="--", alpha=0.6)

for bar in bars1 + bars2:
    plt.text(
        bar.get_x() + bar.get_width()/2,
        bar.get_height() + 2,
        f"{int(bar.get_height())}",
        ha="center",
        fontsize=9
    )

plt.tight_layout()
plt.show()
