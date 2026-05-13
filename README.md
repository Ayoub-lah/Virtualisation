<div align="center">

# 🖥️ Infrastructure Virtualisée Sécurisée — Big Data

![VirtualBox](https://img.shields.io/badge/VirtualBox-Type%202-183A61?style=for-the-badge&logo=virtualbox&logoColor=white)
![Ubuntu](https://img.shields.io/badge/Ubuntu-22.04%20LTS-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![License](https://img.shields.io/badge/License-Academic-blue?style=for-the-badge)

**Master SIT & Big Data — Faculté des Sciences et Techniques de Tanger**
**Université Abdelmalek Essaâdi — 2025/2026**

*Auteurs : **Ayoub Lahlaibi** & **El Mehdi El Khaldi***

</div>

---

## 📋 Résumé

Ce projet présente la conception et la mise en œuvre d'une **infrastructure virtualisée complète, sécurisée et orientée Big Data**, réalisée dans le cadre du module de Virtualisation.

L'infrastructure repose sur **Oracle VirtualBox** comme hyperviseur de Type 2, hébergeant **trois machines virtuelles Ubuntu Server 22.04 LTS** aux rôles distincts, interconnectées via une architecture réseau segmentée en VLANs, avec une stack applicative Big Data complète déployée via Docker Compose.

> **Mots-clés** : Virtualisation, VirtualBox, Docker, VLANs, NFS, iSCSI, Big Data, React.js, Node.js, MySQL, UFW, Bastion Host, SSH RSA 4096, LVM, Thin Provisioning

---

## 🏗️ Architecture Globale

```
┌──────────────────────────────────────────────────────────────────────┐
│          Machine Hôte — Windows 10 Pro | RAM 20GB | SSD 413GB        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │             Oracle VirtualBox — Hyperviseur Type 2             │  │
│  │                                                                │  │
│  │  ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐  │  │
│  │  │vm-applicatif │   │ vm-database  │   │   vm-gestion     │  │  │
│  │  │  VLAN 10     │   │  VLAN 20     │   │    VLAN 30       │  │  │
│  │  │ 10.10.10.3   │   │ 10.10.20.3   │   │  10.10.30.3      │  │  │
│  │  │ 192.168.56.103│  │ 192.168.56.104│  │ 192.168.56.105   │  │  │
│  │  │  60GB VDI    │   │  25GB VDI    │   │   25GB VDI       │  │  │
│  │  │              │   │              │   │                  │  │  │
│  │  │ Docker Compose│  │ MySQL 8.0    │   │ Bastion Host     │  │  │
│  │  │ NFS Server   │   │ NFS Client   │   │ Monitoring       │  │  │
│  │  │ iSCSI Target │   │ iSCSI Client │   │ Backup cron      │  │  │
│  │  │ UFW Firewall │   │ UFW Firewall │   │ UFW Firewall     │  │  │
│  │  └──────────────┘   └──────────────┘   └──────────────────┘  │  │
│  │                                                                │  │
│  │         Host-Only Network — 192.168.56.0/24                   │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🖥️ Machines Virtuelles

| VM | Rôle | VLAN | IP VLAN | IP Host-Only | Disque | RAM |
|----|------|------|---------|--------------|--------|-----|
| **vm-applicatif** | Docker + NFS Server + iSCSI Target | VLAN 10 | 10.10.10.3 | 192.168.56.103 | 60GB | 4GB |
| **vm-database** | MySQL + NFS Client + iSCSI Client | VLAN 20 | 10.10.20.3 | 192.168.56.104 | 25GB | 4GB |
| **vm-gestion** | Bastion Host + Monitoring + Backup | VLAN 30 | 10.10.30.3 | 192.168.56.105 | 25GB | 4GB |

---

## 🌐 Virtualisation Réseau

### Segmentation VLANs

| VLAN | Nom réseau | Plage IP | VM | Rôle |
|------|-----------|----------|----|------|
| VLAN 10 | vlan10-prod | 10.10.10.0/24 | vm-applicatif | Production |
| VLAN 20 | vlan20-db | 10.10.20.0/24 | vm-database | Base de données |
| VLAN 30 | vlan30-mgmt | 10.10.30.0/24 | vm-gestion | Administration |

### Preuve d'isolation

```bash
# Depuis vm-applicatif vers vm-database
ping -c 3 10.10.20.3
# 3 packets transmitted, 0 received, 100% packet loss
# Les VLANs sont correctement isolés
```

### Règles UFW par VM

| VM | Ports autorisés | Justification |
|----|----------------|---------------|
| vm-applicatif | 22, 80, 443, 2049, 3260, 3000, 5000, 8080 | SSH, Web, NFS, iSCSI, Docker |
| vm-database | 22 (bastion only), 3306 | SSH restreint, MySQL |
| vm-gestion | 22 | Administration uniquement |

### Bastion Host

```bash
# Connexion via Bastion (succes)
ssh -J ayoub@192.168.56.105 ayoub@192.168.56.103

# Connexion directe (bloquee par UFW)
ssh ayoub@192.168.56.103
# ssh: connect to host port 22: Connection timed out
```

---

## 💾 Virtualisation du Stockage

### Trois niveaux complémentaires

| Type | Technologie | Protocole | Emplacement | Usage |
|------|------------|-----------|-------------|-------|
| **DAS** | Disques VDI + LVM | Direct | Chaque VM | OS et données locales |
| **NAS** | NFS | TCP 2049 | /mnt/nas/* | Partage inter-VMs |
| **SAN** | iSCSI | TCP 3260 | /mnt/san | Stockage dédié vm-database |

### Thin Provisioning

```
Disque virtuel : 60 GB
Espace réel    : 11 GB  (économie de 49 GB)
```

### Dossiers NFS partagés

| Dossier | Permissions | Usage |
|---------|------------|-------|
| `/mnt/shared` | rw | Partage général inter-VMs |
| `/mnt/nas/data` | rw | Données partagées |
| `/mnt/nas/backup` | rw | Sauvegardes MySQL automatiques |
| `/mnt/nas/logs` | ro | Journaux système centralisés |

### Test NAS — Lecture simultanée

```bash
# vm-applicatif (serveur)
echo "TEST NAS - $(date)" | sudo tee /mnt/nas/data/test.txt
# TEST NAS - jeu. 23 avril 2026 20:30:05 UTC

# vm-database (client) — Lecture immédiate
cat /mnt/nas/data/test.txt
# TEST NAS - jeu. 23 avril 2026 20:30:05 UTC [OK]

# vm-gestion (client) — Lecture immédiate
cat /mnt/nas/data/test.txt
# TEST NAS - jeu. 23 avril 2026 20:30:05 UTC [OK]
```

### SAN iSCSI

```bash
# vm-database
lsblk | grep sdb
# sdb   8:16   0   2G   0 disk /mnt/san

df -h | grep san
# /dev/sdb   2.0G   28K   1.8G   1%   /mnt/san
```

### Snapshots VirtualBox

| Snapshot | VM | État capturé |
|----------|----|-------------|
| snapshot-docker-installe | vm-applicatif | Après installation Docker |
| snapshot-mysql-installe | vm-database | Après installation MySQL |
| snapshot-gestion-base | vm-gestion | Configuration de base |

---

## 🐳 Stack Docker — Application Big Data

### Containers déployés

| Container | Image | Port | Rôle |
|-----------|-------|------|------|
| mon-app_web_1 | nginx:latest | 80 | Serveur web |
| mon-app_frontend_1 | node:18-alpine | 3000 | Dashboard React.js |
| mon-app_backend_1 | node:18-alpine | 5000 | API REST Node.js |
| mon-app_db_1 | mysql:8.0 | 3306 | Base de données |
| mon-app_phpmyadmin_1 | phpmyadmin | 8080 | Interface admin DB |

### Architecture 3-Tiers

```
Utilisateur (Navigateur)
        │
        ▼
┌───────────────┐
│  nginx:latest │  ── Tier 1 — Présentation
│    Port :80   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ React.js :3000│  ── Tier 1 — Dashboard CRUD
└───────┬───────┘
        │  fetch API
        ▼
┌───────────────┐
│ Node.js :5000 │  ── Tier 2 — Logique métier
│  API REST     │
│  Express.js   │
└───────┬───────┘
        │  MySQL connector
        ▼
┌───────────────┐
│  MySQL 8.0    │  ── Tier 3 — Données
│  bigdata_db   │
│  Port :3306   │
└───────────────┘
```

### API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/status | Statut de l'API |
| GET | /api/donnees | Liste toutes les données |
| POST | /api/donnees | Ajouter une donnée |
| DELETE | /api/donnees/:id | Supprimer une donnée |

### Réponse API Status

```json
{
  "status": "OK",
  "message": "API Big Data fonctionne",
  "timestamp": "2026-04-24T17:52:01.268Z"
}
```

### Démarrage automatique systemd

```ini
[Unit]
Description=BigData Docker App
Requires=docker.service
After=docker.service network.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/ayoub/mon-app
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down

[Install]
WantedBy=multi-user.target
```

---

## 🔒 Sécurité — Defense in Depth

| Couche | Technologie | Protection assurée |
|--------|------------|-------------------|
| Réseau | VLANs isolés | Segmentation et isolation inter-VMs |
| Réseau | UFW Firewall | Filtrage des ports par VM |
| Accès | Bastion Host | Point d'entrée SSH unique |
| Accès | SSH RSA 4096 | Chiffrement asymétrique sans mot de passe |
| Données | mysql_secure_installation | Sécurisation MySQL |
| Données | Backup automatique | Sauvegarde quotidienne via cron |

---

## 📁 Structure du Projet

```
Virtualisation/
├── network/
│   ├── ufw-rules.sh          # Automatisation règles UFW par VM
│   └── network-topology.png  # Schéma des VLANs
├── storage/
│   ├── nfs-setup.sh          # Configuration NFS server/client
│   ├── iscsi-config.md       # Documentation SAN iSCSI
│   └── backup-cron.sh        # Sauvegarde automatique MySQL
├── docker/
│   ├── docker-compose.yml    # Stack Nginx+React+Node+MySQL+phpMyAdmin
│   ├── frontend/             # Code source React.js
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── nginx.conf
│   │   └── src/App.js
│   └── backend/              # Code source Node.js
│       ├── Dockerfile
│       ├── package.json
│       └── server.js
├── scripts/
│   └── monitoring-sla.py     # Monitoring disponibilité SLA 99.5%
└── README.md
```

---

## 🚀 Démarrage Rapide

### 1. Cloner le repo

```bash
git clone https://github.com/Ayoub-lah/Virtualisation.git
cd Virtualisation
```

### 2. Configurer UFW sur chaque VM

```bash
# Sur vm-applicatif
sudo bash network/ufw-rules.sh vm-applicatif

# Sur vm-database
sudo bash network/ufw-rules.sh vm-database

# Sur vm-gestion
sudo bash network/ufw-rules.sh vm-gestion
```

### 3. Configurer NFS

```bash
# Sur vm-applicatif (serveur)
sudo bash storage/nfs-setup.sh server

# Sur vm-database et vm-gestion (clients)
sudo bash storage/nfs-setup.sh client
```

### 4. Lancer la stack Docker

```bash
cd docker
sudo docker-compose up -d
sudo docker-compose ps
```

### 5. Vérifier les services

```bash
# Nginx
curl http://192.168.56.103

# API Backend
curl http://192.168.56.103:5000/api/status

# Dashboard React
curl http://192.168.56.103:3000

# phpMyAdmin
curl http://192.168.56.103:8080
```

### 6. Monitoring SLA

```bash
# Lancement manuel
python3 scripts/monitoring-sla.py

# Crontab sur vm-gestion (automatique toutes les 5 min)
*/5 * * * * python3 /home/ayoub/scripts/monitoring-sla.py
```

---

## 📊 Monitoring SLA

```json
{
  "availability_pct": 99.800,
  "sla_target_pct": 99.5,
  "sla_status": "CONFORME",
  "last_check": "2026-04-24 22:00:00",
  "total_checks": 500,
  "total_ok": 499
}
```

---

## ⚠️ Difficultés Rencontrées

| # | Problème | Solution |
|---|----------|----------|
| 1 | Erreur installation Ubuntu — miroir réseau | Désactivation miroir pendant installation |
| 2 | Conflit IPs après clonage VMs | IPs statiques via Netplan + DHCP désactivé |
| 3 | Disque vm-applicatif saturé (97%) | Extension VDI 25→60GB + LVM à chaud |
| 4 | Docker Compose KeyError ContainerConfig | docker system prune + rebuild complet |
| 5 | SAN iSCSI non monté au démarrage | systemctl enable open-iscsi + fstab |
| 6 | Backend Node.js ECONNREFUSED MySQL | Retry automatique toutes les 5 secondes |

---

<div align="center">

*Infrastructure entièrement opérationnelle, reproductible et documentée*

⭐ **Star ce repo si le projet vous a été utile !**

</div>
