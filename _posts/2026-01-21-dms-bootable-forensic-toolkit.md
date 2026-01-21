---
layout: post
title: "DMS: The Swiss Army Knife of Digital Forensics & Malware Detection"
date: 2026-01-21
category: Digital Forensics
tags: [Forensics, Malware Analysis, Linux, Security, Incident Response, ClamAV, YARA, Tsurugi Linux, Open Source]
excerpt: "Introducing DMS (Drive Malware Scan)---an all-in-one malware detection and forensic analysis toolkit that combines 12+ scanning engines, operates at the raw disk level, and now deploys as a bootable forensic OS. From quick triage to deep forensic analysis, in a single tool."
---

Every security professional has been there: you're staring at a potentially compromised system, and you need answers. Is there malware? What did it do? What's the damage?

The traditional approach involves juggling a dozen different tools---ClamAV for signatures, YARA for patterns, strings for IOCs, foremost for carving, sleuthkit for filesystem analysis... Each tool has its own syntax, its own quirks, its own output format. By the time you've correlated everything, hours have passed.

I got tired of the juggling act. So I built something better.

---

## What is DMS?

**DMS (Drive Malware Scan)** is a comprehensive malware detection and forensic analysis toolkit that combines everything you need into a single, intelligent interface.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DMS AT A GLANCE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   12+ Scanning Engines      Unified Interface      Smart Reports    │
│   ════════════════════      ════════════════       ═════════════    │
│                                                                     │
│   • ClamAV signatures       • Interactive TUI      • Text/HTML/JSON │
│   • YARA pattern rules      • Command-line mode    • Actionable     │
│   • Entropy analysis        • Portable mode          guidance       │
│   • File carving            • Bootable ISO         • Prioritized    │
│   • Strings extraction      • USB Kit mode           findings       │
│   • Binwalk firmware                                                │
│   • Bulk extraction                                                 │
│   • Boot sector scan                                                │
│   • Rootkit detection                                               │
│   • VirusTotal lookup                                               │
│   • Forensic artifacts                                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

But DMS isn't just a wrapper script. It's designed from the ground up for **forensic investigators** and **incident responders**, with features you won't find in typical antivirus tools:

- **Raw disk scanning**: Analyzes unmounted drives, forensic images, and even deleted data
- **EWF/E01 support**: Native support for forensic disk images with hash verification
- **Slack space analysis**: Scans unallocated regions where deleted malware hides
- **Forensic integrity**: Read-only operations that preserve evidence
- **Chain of custody**: Automatic documentation of evidence handling

---

## The Problem DMS Solves

Traditional malware scanning has a fundamental limitation: it only sees what the operating system shows it. But attackers know this. They hide malware in:

| Hidden Location | Why It's Missed | How DMS Finds It |
|-----------------|-----------------|------------------|
| **Deleted files** | OS says "file doesn't exist" | Raw disk scanning, file carving |
| **Slack space** | Space between file end and cluster end | Slack space extraction |
| **Boot sectors** | OS boots before AV loads | Direct boot sector analysis |
| **Packed binaries** | Signatures don't match | Entropy analysis (7.5+ threshold) |
| **Forensic images** | Can't mount E01 normally | Native EWF support |

DMS operates at the **raw disk level**, bypassing the operating system entirely. It sees everything---including what the malware doesn't want you to see.

---

## The Scanning Engines

DMS integrates 12+ specialized scanning engines, each targeting different threat vectors:

### Signature-Based Detection

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SIGNATURE ENGINES                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ClamAV                    YARA Rules (4 Categories)               │
│   ════════                  ═════════════════════════               │
│   • 1M+ malware signatures  • Windows malware patterns              │
│   • Daily updates           • Linux rootkits & backdoors            │
│   • Low false positives     • Android mobile threats                │
│   • Packed file support     • Malicious documents (Office/PDF)      │
│                                                                     │
│   Integration:              Source: Qu1cksc0pe + signature-base     │
│   freshclam updates         Custom rules: YARA_RULES_BASE config    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Behavioral & Heuristic Detection

Not all malware is in a signature database. DMS uses multiple heuristic approaches:

**Entropy Analysis**: Packed, encrypted, or compressed malware has high entropy (randomness). DMS flags any region with entropy > 7.5 bits/byte:

```
Normal text file:    ████░░░░░░  ~4.5 bits/byte
Compressed data:     ████████░░  ~7.8 bits/byte
Encrypted payload:   ██████████  ~7.99 bits/byte
                                  ↑
                     DMS alert threshold: 7.5
```

**PE/ELF Header Detection**: Finds executables hidden in unexpected locations---like a `.jpg` file that's actually an `.exe`.

**Binwalk Analysis**: Extracts embedded files from firmware, archives, and compound documents.

### Forensic Recovery

**File Carving** (via foremost/scalpel): Recovers deleted files by searching for file headers and footers in raw disk data.

**Bulk Extractor**: Extracts artifacts even from corrupted or partially overwritten data:
- Email addresses and URLs
- Credit card numbers
- Phone numbers
- GPS coordinates

---

## The Interactive TUI

For most users, the **Interactive TUI** is the recommended way to use DMS:

```bash
sudo ./malware_scan.sh --interactive
```

```
╔══════════════════════════════════════════════════════════════════════╗
║               DMS - DRIVE MALWARE SCAN                               ║
║        Use ↑↓ to navigate, Space/Enter to toggle, S to start         ║
╠══════════════════════════════════════════════════════════════════════╣
║  INPUT SOURCE                                                        ║
╟──────────────────────────────────────────────────────────────────────╢
║▶ Path: /dev/sdb1 [block_device]                                      ║
╟──────────────────────────────────────────────────────────────────────╢
║  SCAN TYPE                                                           ║
╟──────────────────────────────────────────────────────────────────────╢
║  ( ) Quick Scan       Fast sample-based analysis                     ║
║  (●) Standard Scan    ClamAV + YARA + Strings + Binwalk              ║
║  ( ) Deep Scan        All scanners + entropy + carving               ║
╟──────────────────────────────────────────────────────────────────────╢
║  SCAN SCOPE                                                          ║
╟──────────────────────────────────────────────────────────────────────╢
║  (●) Full Drive       Scan entire device including all data          ║
║  ( ) Slack Space      Scan only unallocated/deleted areas            ║
╟──────────────────────────────────────────────────────────────────────╢
║  OPTIONS                                                             ║
╟──────────────────────────────────────────────────────────────────────╢
║  [✓] Update ClamAV databases                                         ║
║  [✓] Parallel scanning mode                                          ║
║  [ ] Verify EWF hash before scan (forensic integrity)                ║
╟──────────────────────────────────────────────────────────────────────╢
║  FORENSIC ANALYSIS (Windows artifacts)                               ║
╟──────────────────────────────────────────────────────────────────────╢
║  [ ] Persistence artifacts (registry, tasks, services)               ║
║  [ ] Execution artifacts (prefetch, amcache, shimcache)              ║
║  [ ] File anomalies (timestomping, ADS, suspicious paths)            ║
║  [ ] RE triage (capa, imports, entropy)                              ║
╠══════════════════════════════════════════════════════════════════════╣
║      [S] Start Scan    [I] Set Input Path    [Q] Quit                ║
╚══════════════════════════════════════════════════════════════════════╝
```

The TUI:
- **Auto-detects input types** (block device, EWF image, raw image)
- **Validates settings** before scanning
- **Suggests options** based on input (e.g., hash verification for E01 files)
- **Shows real-time progress** during scanning

---

## Scan Modes Explained

DMS offers four distinct scan modes, each optimized for different scenarios:

### Quick Scan
*"Is this worth investigating?"*

```bash
sudo ./malware_scan.sh /dev/sdb1 --quick
```

- **Time**: Minutes
- **Coverage**: Strategic sampling of disk regions
- **Best for**: Rapid triage, determining if deeper analysis is needed
- **Engines**: Entropy checks on samples, signature spot-checks

### Standard Scan (Default)
*"Find known threats"*

```bash
sudo ./malware_scan.sh /dev/sdb1
```

- **Time**: 30-60 minutes (500GB drive)
- **Coverage**: Full allocated data
- **Best for**: General malware detection
- **Engines**: ClamAV, YARA (all categories), Binwalk, Strings

### Deep Scan
*"Leave no stone unturned"*

```bash
sudo ./malware_scan.sh /dev/sdb1 --deep
```

- **Time**: 1-3 hours (500GB drive)
- **Coverage**: Everything including unallocated space
- **Best for**: Full forensic analysis, incident response
- **Engines**: All standard engines PLUS entropy analysis, file carving, bulk extraction, boot sector analysis

### Slack Space Scan
*"What did they delete?"*

```bash
sudo ./malware_scan.sh /dev/sdb1 --slack
```

- **Time**: 30-90 minutes
- **Coverage**: Unallocated space only
- **Best for**: Finding deleted malware, hidden data
- **Engines**: File carving, signature scanning on recovered data

---

## Forensic Image Support

DMS natively supports **EWF/E01 forensic images**---the industry standard for forensic disk acquisition:

```bash
# Scan an E01 image (auto-detected)
sudo ./malware_scan.sh case001.E01

# Verify hash integrity first (recommended for legal cases)
sudo ./malware_scan.sh case001.E01 --verify-hash

# Scan slack space in forensic image
sudo ./malware_scan.sh case001.E01 --scan-mode slack
```

DMS handles the complexity:
1. Detects EWF format automatically
2. Mounts the image as a virtual block device (using ewfmount)
3. Optionally verifies MD5/SHA1 hash against acquisition hash
4. Performs scanning in read-only mode
5. Unmounts cleanly when complete

<details markdown="1">
<summary><strong>📐 Technical Note: EWF Hash Verification</strong></summary>

When you use `--verify-hash`, DMS:

1. Extracts the stored hash from the EWF metadata
2. Computes the actual hash of the raw data
3. Compares them before scanning

This takes extra time but provides **chain of custody verification**---proof that the image hasn't been tampered with since acquisition.

```bash
# Verification output
[INFO] Verifying EWF image integrity...
[INFO] Stored MD5: d41d8cd98f00b204e9800998ecf8427e
[INFO] Computed MD5: d41d8cd98f00b204e9800998ecf8427e
[INFO] ✓ Hash verification PASSED
```

</details>

---

## Windows Forensic Artifact Analysis

DMS includes specialized modules for **Windows forensic artifacts**---the traces that malware leaves behind even after it's deleted:

### Persistence Mechanisms

```bash
sudo ./malware_scan.sh evidence.E01 --persistence-scan
```

Analyzes:
- **Registry Run keys**: NTUSER.DAT, SOFTWARE hives
- **Services**: SYSTEM hive service entries
- **Scheduled Tasks**: Windows/System32/Tasks/*.xml
- **Startup folders**: Start Menu/Programs/Startup
- **WMI subscriptions**: OBJECTS.DATA

| MITRE ATT&CK | Technique | What DMS Finds |
|--------------|-----------|----------------|
| T1547.001 | Registry Run Keys | Suspicious autorun entries |
| T1543.003 | Windows Service | Malicious service registrations |
| T1053.005 | Scheduled Task | Persistence via task scheduler |
| T1546.003 | WMI Event Subscription | Fileless persistence |

### Execution Artifacts

```bash
sudo ./malware_scan.sh evidence.E01 --execution-scan
```

Proves what programs actually ran:
- **Prefetch**: Program execution with timestamps
- **Amcache**: Executables that ran, including SHA1 hashes
- **Shimcache**: Programs that existed (even if deleted)
- **UserAssist**: GUI programs launched by user
- **SRUM**: Network/energy usage per application

### File Anomaly Detection

```bash
sudo ./malware_scan.sh evidence.E01 --file-anomalies
```

Detects evasion techniques:
- **Magic/extension mismatch**: A "photo.jpg" that's actually an EXE
- **Timestomping**: $STANDARD_INFORMATION vs $FILE_NAME discrepancy
- **Alternate Data Streams**: Hidden data in NTFS ADS
- **Suspicious paths**: Executables in TEMP, Recycle Bin, System Volume Information
- **Double extensions**: `document.pdf.exe`

### RE Triage

```bash
sudo ./malware_scan.sh evidence.E01 --re-triage
```

Automated reverse engineering analysis:
- **capa analysis**: Maps capabilities to MITRE ATT&CK techniques
- **Import analysis**: Flags suspicious APIs (CreateRemoteThread, NtMapViewOfSection)
- **Similarity hashing**: ssdeep, imphash, TLSH for malware family identification
- **Shellcode detection**: Identifies position-independent code patterns

---

## Deployment Options

DMS adapts to your operational needs:

### 1. Portable Mode (Zero Install)

```bash
# Downloads all tools automatically
sudo ./malware_scan.sh /dev/sdb1 --portable
```

Perfect for: Systems without forensic tools installed

### 2. USB Kit Mode

```bash
# Build a complete offline kit
sudo ./malware_scan.sh --build-full-kit --kit-target /media/usb

# Run from any Linux system
sudo /media/usb/run-dms.sh /dev/sda1 --deep
```

Perfect for: Field operations with any Linux host

### 3. Bootable Forensic ISO

```bash
# Build a complete forensic OS
sudo ./malware_scan.sh --build-iso --iso-output ~/dms-forensic.iso

# Flash to USB
sudo dd if=~/dms-forensic.iso of=/dev/sdb bs=4M status=progress
```

Perfect for: Air-gapped environments, maximum forensic safety

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT COMPARISON                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Mode          │ Size    │ Network │ Host OS  │ Forensic Safety   │
│   ══════════════╪═════════╪═════════╪══════════╪═════════════════  │
│   Installed     │ ~50 MB  │ Updates │ Required │ Good              │
│   Portable      │ ~50 MB  │ Initial │ Required │ Good              │
│   USB Kit       │ ~1.2 GB │ None    │ Any Linux│ Better            │
│   Bootable ISO  │ ~2.5 GB │ None    │ None     │ Best              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Smart Reporting

Every DMS scan produces reports in multiple formats:

### Text Report
Clean, readable output for terminal viewing and logs:

```
════════════════════════════════════════════════════════════════════
                    DMS SCAN REPORT
════════════════════════════════════════════════════════════════════

SCAN SUMMARY
  Target:     /dev/sdb1
  Duration:   00:47:23
  Data Scanned: 487.3 GB

FINDINGS (12 items)
  CRITICAL:  2 items
  HIGH:      4 items
  MEDIUM:    6 items

────────────────────────────────────────────────────────────────────
CRITICAL FINDINGS
────────────────────────────────────────────────────────────────────
[1] MALWARE: Win.Trojan.Emotet-9856234-0
    Location: chunk_003.bin @ offset 0x4A2F8800
    Engine:   ClamAV
    Action:   Isolate system, investigate lateral movement
```

### HTML Report
Styled, clickable report for sharing with stakeholders:

```bash
sudo ./malware_scan.sh /dev/sdb1 --html
# Produces: report.html with collapsible sections, syntax highlighting
```

### JSON Report
Machine-readable output for SIEM integration:

```bash
sudo ./malware_scan.sh /dev/sdb1 --json
```

```json
{
  "scan_metadata": {
    "target": "/dev/sdb1",
    "timestamp": "2026-01-21T14:30:22Z",
    "dms_version": "2.1.0"
  },
  "findings": [
    {
      "severity": "critical",
      "type": "malware",
      "engine": "clamav",
      "signature": "Win.Trojan.Emotet-9856234-0",
      "location": {"chunk": 3, "offset": "0x4A2F8800"},
      "mitre_attack": ["T1566", "T1204"]
    }
  ]
}
```

---

## Performance Features

### Parallel Scanning

```bash
sudo ./malware_scan.sh /dev/sdb1 --parallel
```

Splits the disk into chunks and scans them concurrently. On a 4-core system, this typically provides 2-3x speedup.

### Auto Chunk Sizing

```bash
sudo ./malware_scan.sh /dev/sdb1 --auto-chunk
```

Automatically calculates optimal chunk size based on:
- Available RAM
- Disk size
- Number of CPU cores

### Checkpoint/Resume

```bash
# Scan gets interrupted
sudo ./malware_scan.sh /dev/sdb1 --deep
# ^C (interrupted at 47%)

# Resume from checkpoint
sudo ./malware_scan.sh --resume /tmp/malscan_checkpoint_*.json
```

Never lose progress on long-running scans again.

---

## Integration: VirusTotal

```bash
sudo ./malware_scan.sh /dev/sdb1 --virustotal
```

DMS can enrich findings with VirusTotal threat intelligence:
- Looks up hashes of detected files
- Returns detection ratios from 70+ AV engines
- Respects rate limits (configurable)

```bash
# Configure in malscan.conf
VT_API_KEY=your_api_key_here
VT_RATE_LIMIT=4  # Free API: 4 req/min
```

---

## Getting Started

### Quick Start (60 seconds)

```bash
# Clone
git clone https://github.com/Samuele95/dms.git && cd dms

# Run (portable mode downloads tools automatically)
sudo ./malware_scan.sh --interactive --portable
```

### Configuration

Create `~/.malscan.conf` or `/etc/malscan.conf`:

```bash
# Performance
CHUNK_SIZE=500              # MB per chunk
MAX_PARALLEL_JOBS=4         # Match your CPU cores

# VirusTotal
VT_API_KEY=your_key_here

# Forensic
EWF_VERIFY_HASH=false       # Set true for legal cases

# Custom YARA rules
YARA_RULES_BASE=/path/to/your/rules
```

### Full Documentation

See the **[Wiki](https://github.com/Samuele95/dms/blob/main/WIKI.md)** for comprehensive documentation covering:
- All CLI options
- Configuration reference
- Troubleshooting guide
- Custom YARA rule integration

---

## Why I Built DMS

Digital forensics shouldn't require a PhD in tool integration. When I started doing incident response, I spent more time wrestling with tool compatibility than actually analyzing malware.

DMS is the tool I wished I had:
- **One command** to run comprehensive analysis
- **Smart defaults** that work for 90% of cases
- **Flexible enough** for advanced users
- **Forensically sound** by design

It's open source because security tools should be accessible to everyone defending against threats---not just those with enterprise budgets.

---

## Contributing

DMS is actively developed and welcomes contributions:

```bash
git clone https://github.com/Samuele95/dms.git
cd dms
# Make changes
./malware_scan.sh --help  # Test
# Submit PR
```

**Areas for contribution:**
- Additional YARA rule sets
- New detection engines
- Performance optimizations
- Documentation improvements
- Bug fixes and testing

---

## Links

- **GitHub**: [github.com/Samuele95/dms](https://github.com/Samuele95/dms)
- **Wiki**: [Full documentation](https://github.com/Samuele95/dms/blob/main/WIKI.md)
- **Issues**: [Report bugs or request features](https://github.com/Samuele95/dms/issues)

---

*DMS is built for [Tsurugi Linux](https://tsurugi-linux.org/) but works on any Linux distribution. MIT Licensed.*

