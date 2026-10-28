"""Verify the /predict contract matches across backend, service, and form (formConfig.ts).

Usage: python scripts/check_contract.py
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP_PY = ROOT / "src/backend/app.py"
SERVICE_TS = ROOT / "src/frontend/src/services/predictService.ts"
FORM_TS = ROOT / "src/frontend/src/formConfig.ts"


def backend_keys():
    text = APP_PY.read_text(encoding="utf-8")
    body = re.search(r"class Pred_IP\(BaseModel\):(.*?)\n\S", text, re.S).group(1)
    return dict(re.findall(r"^\s+(\w+)\s*:\s*(\w+)", body, re.M))


def service_keys():
    text = SERVICE_TS.read_text(encoding="utf-8")
    body = re.search(r"interface PredIPPayload \{(.*?)\}", text, re.S).group(1)
    iface = dict(re.findall(r"(\w+)\s*:\s*(\w+);", body))
    built = re.search(r"const payload: PredIPPayload = \{(.*?)\};", text, re.S).group(1)
    sent = set(re.findall(r"^\s+(\w+)\s*:", built, re.M))
    return iface, sent


def form_keys():
    text = FORM_TS.read_text(encoding="utf-8")
    return set(re.findall(r'key:\s*"(\w+)"', text))


def main():
    errors = []
    be = backend_keys()
    iface, sent = service_keys()
    form = form_keys()

    type_map = {"int": "number", "str": "string"}
    for k, t in be.items():
        if k not in iface:
            errors.append(f"PredIPPayload missing {k}")
        elif iface[k] != type_map.get(t):
            errors.append(f"type mismatch {k}: backend {t}, service {iface[k]}")
    for name, keys in [("PredIPPayload", set(iface)), ("payload object", sent), ("formConfig.ts form", form)]:
        for k in set(be) - keys:
            errors.append(f"{name} missing {k}")
        for k in keys - set(be):
            errors.append(f"{name} has unknown key {k}")

    if errors:
        print("CONTRACT BROKEN:")
        for e in sorted(set(errors)):
            print("  -", e)
        sys.exit(1)
    print(f"OK: {len(be)} keys match across app.py, predictService.ts, formConfig.ts")


if __name__ == "__main__":
    main()
