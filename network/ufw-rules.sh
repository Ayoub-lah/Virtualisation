#!/bin/bash
# =============================================================================
# UFW Firewall Configuration — Infrastructure Virtualisee Big Data
# Auteur  : Ayoub Lahlaibi
# Module  : Virtualisation — Master SIT & Big Data — FST Tanger 2025/2026
# =============================================================================
set -e
VM_ROLE=${1:-"unknown"}
BASTION_IP="192.168.56.105"
echo "============================================="
echo " UFW Configuration — Role: $VM_ROLE"
echo "============================================="
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
case "$VM_ROLE" in
  vm-applicatif)
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 2049/tcp
    ufw allow 3260/tcp
    ufw allow 3000/tcp
    ufw allow 5000/tcp
    ufw allow 8080/tcp
    ;;
  vm-database)
    ufw allow from "$BASTION_IP" to any port 22 proto tcp
    ufw allow 3306/tcp
    ;;
  vm-gestion)
    ufw allow 22/tcp
    ;;
  *)
    echo "[ERROR] Usage: $0 [vm-applicatif|vm-database|vm-gestion]"
    exit 1
    ;;
esac
ufw --force enable
echo "[OK] UFW enabled pour $VM_ROLE"
ufw status verbose
