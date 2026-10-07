import sys

filename = 'src/components/InstantPlanPaymentModal.tsx'
with open(filename, 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if line.strip() == ")}":
        if i + 1 < len(lines) and "Auto Verification Banner if triggered" in lines[i+1]:
            lines[i] = "                </>\n                )}\n"
            break

with open(filename, 'w') as f:
    f.writelines(lines)
