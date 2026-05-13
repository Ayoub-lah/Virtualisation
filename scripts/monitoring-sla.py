#!/usr/bin/env python3
# =============================================================================
# Monitoring SLA — Infrastructure Virtualisee Big Data
# Auteur  : Ayoub Lahlaibi
# Crontab : */5 * * * * python3 /home/ayoub/scripts/monitoring-sla.py
# =============================================================================
import subprocess, json, os
from datetime import datetime

SLA_TARGET  = 99.5
REPORT_FILE = "/mnt/nas/logs/rapport_sla.json"
LOG_FILE    = "/mnt/nas/logs/monitoring.log"

SERVICES = {
    "vm-applicatif": {
        "checks": [
            {"name": "SSH",         "cmd": ["ssh", "-o", "ConnectTimeout=5", "ayoub@192.168.56.103", "echo OK"]},
            {"name": "Nginx :80",   "cmd": ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "5", "http://192.168.56.103"]},
            {"name": "React :3000", "cmd": ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "5", "http://192.168.56.103:3000"]},
            {"name": "API :5000",   "cmd": ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "5", "http://192.168.56.103:5000/api/status"]},
        ]
    },
    "vm-database": {
        "checks": [
            {"name": "SSH",   "cmd": ["ssh", "-o", "ConnectTimeout=5", "ayoub@192.168.56.104", "echo OK"]},
            {"name": "MySQL", "cmd": ["ssh", "ayoub@192.168.56.104", "sudo systemctl is-active mysql"]},
        ]
    }
}

def run_check(cmd):
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        return result.stdout.strip() in ["OK", "active", "200", "301", "302"]
    except:
        return False

def load_report():
    if os.path.exists(REPORT_FILE):
        with open(REPORT_FILE) as f:
            return json.load(f)
    return {"total_checks": 0, "total_ok": 0, "history": []}

def save_report(report):
    with open(REPORT_FILE, "w") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

def main():
    now    = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    report = load_report()
    results = []
    for vm, config in SERVICES.items():
        for check in config["checks"]:
            ok = run_check(check["cmd"])
            report["total_checks"] += 1
            if ok: report["total_ok"] += 1
            results.append({"vm": vm, "service": check["name"], "status": "UP" if ok else "DOWN", "timestamp": now})
            log_line = f"[{now}] {vm} — {check['name']}: {'UP' if ok else 'DOWN'}"
            print(log_line)
            with open(LOG_FILE, "a") as f:
                f.write(log_line + "\n")
    availability = (report["total_ok"] / report["total_checks"] * 100) if report["total_checks"] > 0 else 0
    sla_status   = "CONFORME" if availability >= SLA_TARGET else "NON CONFORME"
    report.update({"availability_pct": round(availability, 3), "sla_target_pct": SLA_TARGET, "sla_status": sla_status, "last_check": now})
    report["history"].append({"timestamp": now, "results": results})
    report["history"] = report["history"][-100:]
    save_report(report)
    print(f"\n[SLA] Disponibilite: {availability:.3f}% — Cible: {SLA_TARGET}% — {sla_status}")

if __name__ == "__main__":
    main()
