#!/bin/bash
# =============================================================================
# NFS Server & Client Setup — Infrastructure Virtualisee Big Data
# Auteur  : Ayoub Lahlaibi
# Module  : Virtualisation — Master SIT & Big Data — FST Tanger 2025/2026
# =============================================================================
set -e
MODE=${1:-"server"}
SERVER_IP="192.168.56.103"
NETWORK="192.168.56.0/24"
if [ "$MODE" = "server" ]; then
  echo "NFS Server Setup — vm-applicatif"
  apt-get update -q && apt-get install -y nfs-kernel-server
  mkdir -p /mnt/shared /mnt/nas/data /mnt/nas/backup /mnt/nas/logs
  chown -R nobody:nogroup /mnt/shared /mnt/nas
  chmod -R 777 /mnt/shared /mnt/nas/data /mnt/nas/backup
  chmod -R 755 /mnt/nas/logs
  cat > /etc/exports << EXPORTS
/mnt/shared     $NETWORK(sync,wdelay,hide,no_subtree_check,sec=sys,rw,secure,root_squash,no_all_squash)
/mnt/nas/data   $NETWORK(sync,wdelay,hide,no_subtree_check,sec=sys,rw,secure,root_squash,no_all_squash)
/mnt/nas/backup $NETWORK(sync,wdelay,hide,no_subtree_check,sec=sys,rw,secure,root_squash,no_all_squash)
/mnt/nas/logs   $NETWORK(sync,wdelay,hide,no_subtree_check,sec=sys,ro,secure,root_squash,no_all_squash)
EXPORTS
  exportfs -ra
  systemctl enable nfs-kernel-server
  systemctl restart nfs-kernel-server
  echo "[OK] NFS Server configure"
  exportfs -v
elif [ "$MODE" = "client" ]; then
  echo "NFS Client Setup"
  apt-get update -q && apt-get install -y nfs-common
  mkdir -p /mnt/nas/data /mnt/nas/backup /mnt/nas/logs
  cat >> /etc/fstab << FSTAB
$SERVER_IP:/mnt/nas/data    /mnt/nas/data    nfs defaults,_netdev,auto 0 0
$SERVER_IP:/mnt/nas/backup  /mnt/nas/backup  nfs defaults,_netdev,auto 0 0
$SERVER_IP:/mnt/nas/logs    /mnt/nas/logs    nfs defaults,_netdev,auto,ro 0 0
FSTAB
  mount -a
  echo "[OK] NFS Client configure"
  df -h | grep nas
else
  echo "[ERROR] Usage: $0 [server|client]"
  exit 1
fi
