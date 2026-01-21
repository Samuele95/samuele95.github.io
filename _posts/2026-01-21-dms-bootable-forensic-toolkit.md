---
layout: post
title: "Building DMS: When I Got Tired of Juggling Forensic Tools"
date: 2026-01-21
category: Malware Analysis
tags: [Forensics, Malware Analysis, Linux, Security, Incident Response, ClamAV, YARA, Open Source]
excerpt: "The story behind DMS---a forensic toolkit born from frustration with the scattered state of malware analysis tools, and how it evolved into a bootable operating system."
---

It started with frustration.

Switching between terminal windows. ClamAV here, YARA there, strings somewhere else. Different output formats to correlate. The same dance on every investigation.

What if one tool just did all of it?

---

## What DMS Does

**DMS (Drive Malware Scan)** combines 12+ scanning engines into a single interface:

- **ClamAV** - 1M+ malware signatures
- **YARA rules** - Pattern matching across Windows, Linux, Android, documents
- **Entropy analysis** - Catches packed/encrypted payloads
- **File carving** - Recovers deleted files from raw disk
- **Binwalk** - Extracts embedded payloads
- **Bulk extractor** - Pulls emails, URLs, credit cards from corrupted data

The key difference: DMS operates at the **raw disk level**, not the filesystem level.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WHERE MALWARE HIDES                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Deleted Files     "Gone" to the OS, still on disk physically      │
│   Slack Space       Gaps between file ends and cluster boundaries   │
│   Boot Sectors      Execute before OS loads---before AV runs        │
│   Packed Binaries   Encrypted/compressed, signatures don't match    │
│   Alternate Streams NTFS hidden storage most scanners ignore        │
│                                                                     │
│   A filesystem-level scanner sees NONE of this. DMS sees all of it. │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Detection Methods

**Signature matching**: ClamAV and YARA catch known threats.

**Entropy analysis**: Packed or encrypted malware has high entropy. DMS flags anything above 7.5 bits/byte:

```
Normal text file:    ████░░░░░░░░░░░░  ~4.5 bits/byte
Compressed data:     ████████████░░░░  ~7.2 bits/byte
Encrypted payload:   ████████████████  ~7.99 bits/byte
                                 ↑
                    DMS alert threshold: 7.5
```

**Binary structure detection**: Finds executables hiding as other file types.

**Forensic recovery**: Carves deleted files by searching for headers/footers in raw disk data.

---

## Windows Forensic Artifacts

DMS analyzes the traces attacks leave behind:

**Persistence**: Registry Run keys, Services, Scheduled Tasks, WMI subscriptions.

| MITRE ATT&CK | Technique | What DMS Finds |
|--------------|-----------|----------------|
| T1547.001 | Registry Run Keys | Suspicious autorun entries |
| T1543.003 | Windows Service | Malicious service registrations |
| T1053.005 | Scheduled Task | Persistence via task scheduler |
| T1546.003 | WMI Subscription | Fileless persistence |

**Execution**: Prefetch files, Amcache, Shimcache---proof of what actually ran.

**Evasion**: Timestomping detection, Alternate Data Streams, double extensions.

---

## Deployment Options

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT OPTIONS                               │
├───────────────┬─────────┬─────────┬──────────┬─────────────────────┤
│ Mode          │ Size    │ Network │ Host OS  │ Forensic Safety     │
├───────────────┼─────────┼─────────┼──────────┼─────────────────────┤
│ Installed     │ ~50 MB  │ Updates │ Required │ Good                │
│ Portable      │ ~50 MB  │ Initial │ Required │ Good                │
│ USB Kit       │ ~1.2 GB │ None    │ Any Linux│ Better              │
│ Bootable ISO  │ ~2.5 GB │ None    │ None     │ Best                │
└───────────────┴─────────┴─────────┴──────────┴─────────────────────┘
```

**Portable mode**: Downloads tools to temp directory. Works with network access.

**USB Kit mode**: Complete offline kit. All binaries and signatures bundled.

**Bootable ISO**: Full forensic OS based on Debian. The evidence drive's OS never loads---maximum forensic safety.

---

## A Real Investigation

Let me walk through what using DMS actually looks like.

You arrive at a site with a potentially compromised laptop. You can't boot it normally---that would modify evidence. So you insert your DMS USB, change the BIOS boot order, and boot into the forensic environment.

The laptop's internal drive appears as `/dev/sda`, but it's not mounted. You plug in an external drive for output storage---DMS automatically detects it and offers to use it for saving results.

You launch the interactive TUI:

```bash
dms-scan --interactive
```

```
╔══════════════════════════════════════════════════════════════════════╗
║               DMS - DRIVE MALWARE SCAN                               ║
║        Use ↑↓ to navigate, Space/Enter to toggle, S to start         ║
╠══════════════════════════════════════════════════════════════════════╣
║  INPUT SOURCE                                                        ║
╟──────────────────────────────────────────────────────────────────────╢
║▶ Path: /dev/sda [block_device]                                       ║
╟──────────────────────────────────────────────────────────────────────╢
║  SCAN TYPE                                                           ║
╟──────────────────────────────────────────────────────────────────────╢
║  ( ) Quick Scan       Fast sample-based analysis                     ║
║  ( ) Standard Scan    ClamAV + YARA + Strings + Binwalk              ║
║  (●) Deep Scan        All scanners + entropy + carving               ║
╟──────────────────────────────────────────────────────────────────────╢
║  FORENSIC ANALYSIS                                                   ║
╟──────────────────────────────────────────────────────────────────────╢
║  [✓] Persistence artifacts (registry, tasks, services)               ║
║  [✓] Execution artifacts (prefetch, amcache, shimcache)              ║
║  [✓] File anomalies (timestomping, ADS, suspicious paths)            ║
╠══════════════════════════════════════════════════════════════════════╣
║      [S] Start Scan    [I] Set Input Path    [Q] Quit                ║
╚══════════════════════════════════════════════════════════════════════╝
```

You select the evidence drive, choose a deep scan (you want comprehensive coverage), enable the forensic analysis modules, and start the scan.

DMS begins working. Progress bars show what's happening. First it hashes the evidence drive---this documents the exact state before analysis. Then the scanning engines engage one by one. ClamAV chews through signature matching. YARA rules fire on suspicious patterns. The entropy analyzer flags a high-entropy region in an unexpected location.

An hour later, the scan completes.

The report shows three significant findings. A known Emotet sample in a carved deleted file. An unsigned executable with high entropy and suspicious imports in a user's temp folder. And registry artifacts showing a scheduled task that would execute a PowerShell command on system startup.

The MITRE mapping tells you this looks like initial access via phishing, followed by persistence establishment. The attack was interrupted---the scheduled task never executed because the system was shut down for analysis.

You export the report, document the evidence hashes, and unmount the output drive. The evidence drive was never written to. The chain of custody remains intact.

---

## The Philosophy Behind DMS

If I had to distill DMS's design philosophy into a single principle, it would be this: *smart defaults with escape hatches*.

The tool should do the right thing automatically for 90% of cases. A standard scan should be comprehensive enough to catch most threats. Forensic images should be handled correctly without special flags. Output formats should be readable without post-processing.

But when you need to deviate---when you're dealing with an unusual scenario or have specific requirements---the escape hatches are there. Every default can be overridden. Every module can be enabled or disabled individually. The configuration file lets you tune everything from chunk sizes to API rate limits.

This philosophy extends to reporting. The default text report is human-readable, designed to be skimmed quickly. But JSON output is available for SIEM integration, and HTML reports work for stakeholder communication. You shouldn't have to transform data just to use it.

---

## What's Next

DMS continues to evolve.

The forensic modules are expanding. MFT analysis for NTFS filesystems. USN journal parsing for file change history. Timeline generation that correlates events across all artifacts.

The detection engines are growing too. More YARA rule sources. Better heuristics for packed and obfuscated malware. Integration with threat intelligence feeds beyond VirusTotal.

And the infrastructure keeps improving. Better parallelization. Smarter memory management for scanning huge drives. More graceful handling of edge cases and corrupted data.

But the core remains the same: one tool that handles the complete forensic malware analysis workflow, from raw disk to actionable report.

---

## Getting Started

If you want to try DMS, the quickest path is:

```bash
git clone https://github.com/Samuele95/dms.git
cd dms
sudo ./malware_scan.sh --interactive --portable
```

Portable mode downloads dependencies automatically. The interactive TUI guides you through the rest.

For field work, build a USB kit:

```bash
sudo ./malware_scan.sh --build-full-kit --kit-target /media/your-usb
```

And for the full forensic OS experience:

```bash
sudo ./malware_scan.sh --build-iso --iso-output ~/dms-forensic.iso
```

The [GitHub repository](https://github.com/Samuele95/dms) has comprehensive documentation, and the [Wiki](https://github.com/Samuele95/dms/blob/main/WIKI.md) covers every option and configuration parameter.

---

## Final Thoughts

Building DMS taught me something about tools and workflows.

When you find yourself doing the same sequence of operations repeatedly, that's not just inefficiency---it's a design opportunity. Every manual integration point is a place where errors can creep in, where cognitive load accumulates, where time gets wasted.

Good tools don't just do things for you. They encode workflow knowledge. They capture the "right way" to do things and make it the default path. They free up your attention for the parts that actually require human judgment.

DMS isn't magic. It's just automation done thoughtfully. Every feature exists because I or someone else got frustrated with the manual alternative.

If you do forensic work, I hope it saves you the same frustration it was born from. And if you find something that should be automated but isn't---well, pull requests are welcome.

---

*DMS is open source under the MIT license. It's designed for Tsurugi Linux but runs on any Linux distribution. Find it at [github.com/Samuele95/dms](https://github.com/Samuele95/dms).*

