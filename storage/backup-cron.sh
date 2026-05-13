#!/bin/bash
# =============================================================================
# Backup Automatique MySQL — Infrastructure Virtualisee Big Data
# Auteur  : Ayoub Lahlaibi
# Module  : Virtualisation — Master SIT & Big Data — FST Tanger 2025/2026
# =============================================================================
# Crontab sur vm-gestion: 0 2 * * * bash /home/ayoub/backup-cron.sh
# =============================================================================
DB_HOST="192.168.56.104"
DB_NAME="bigdata_db"
BACKUP_DIR="/mnt/nas/backup"
DATE=$(date +%F)
BACKUP_FILE="$BACKUP_DIR/backup-$DATE.sql"
LOG_FILE="/mnt/nas/logs/backup.log"
RETENTION_DAYS=7
echo "[$DATE] Backup start..." >> "$LOG_FILE"
ssh ayoub@$DB_HOST "sudo mysqldump $DB_NAME" > "$BACKUP_FILE"
if [ $? -eq 0 ]; then
  SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
  echo "[$DATE] OK — $BACKUP_FILE ($SIZE)" >> "$LOG_FILE"
else
  echo "[$DATE] ERROR — Backup failed" >> "$LOG_FILE"
  exit 1
fi
find "$BACKUP_DIR" -name "backup-*.sql" -mtime +$RETENTION_DAYS -delete
echo "[$DATE] Cleanup done (retention: $RETENTION_DAYS days)" >> "$LOG_FILE"
