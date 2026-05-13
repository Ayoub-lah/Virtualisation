**Infrastructure Virtualisee Big Data — Master SIT & Big Data — FST Tanger 2025/2026**
**Auteur : Ayoub Lahlaibi**

## Architecture SAN

| Role | VM | IP | Port |
|------|----|----|------|
| iSCSI Target (Serveur) | vm-applicatif | 192.168.56.103 | 3260 |
| iSCSI Initiator (Client) | vm-database | 192.168.56.104 | — |

## 1. Serveur iSCSI — vm-applicatif

### Installation
```bash
sudo apt-get install -y tgt
sudo dd if=/dev/zero of=/mnt/iscsi-disk.img bs=1M count=2048
```

### /etc/tgt/conf.d/iscsi-target.conf
```xml
<target iqn.2026-04.com.bigdata:storage>
    backing-store /mnt/iscsi-disk.img
    initiator-address 192.168.56.104
</target>
```

### Demarrage
```bash
sudo systemctl enable tgt
sudo systemctl restart tgt
sudo tgtadm --mode target --op show
```

## 2. Client iSCSI — vm-database

```bash
sudo apt-get install -y open-iscsi
sudo iscsiadm -m discovery -t sendtargets -p 192.168.56.103:3260
sudo iscsiadm -m node --targetname iqn.2026-04.com.bigdata:storage --portal 192.168.56.103:3260 --login
sudo mkfs.ext4 /dev/sdb
sudo mkdir -p /mnt/san && sudo mount /dev/sdb /mnt/san
sudo systemctl enable open-iscsi iscsid
sudo iscsiadm -m node -o update -n node.startup -v automatic
```

### /etc/fstab

/dev/sdb  /mnt/san  ext4  defaults,_netdev,auto  0  0

## 3. Test de validation

```bash
echo "TEST SAN iSCSI - $(date)" | sudo tee /mnt/san/test.txt
cat /mnt/san/test.txt
``