import sys

filename = 'src/components/InstantPlanPaymentModal.tsx'
with open(filename, 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "Auto Verification Banner" in line:
        # Check a few lines back for )}
        for j in range(i-1, i-5, -1):
            if ")}" in lines[j]:
                lines[j] = "                </>\n" + lines[j]
                print(f"Patched at line {j}")
                break
        break

with open(filename, 'w') as f:
    f.writelines(lines)
