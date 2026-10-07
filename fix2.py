import sys

filename = 'src/components/InstantPlanPaymentModal.tsx'
with open(filename, 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "}                {/* Auto Verification Banner if triggered */}" in line.replace(" ", ""):
        lines[i] = "                </>\n                )}\n                {/* Auto Verification Banner if triggered */}\n"

with open(filename, 'w') as f:
    f.writelines(lines)
