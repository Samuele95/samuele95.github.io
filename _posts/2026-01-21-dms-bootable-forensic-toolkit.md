---
layout: post
title: "Building DMS: When I Got Tired of Juggling Forensic Tools"
date: 2026-01-21
category: Malware Analysis
tags: [Forensics, Malware Analysis, Linux, Security, Incident Response, ClamAV, YARA, Open Source]
excerpt: "The story behind DMS---a forensic toolkit born from frustration with the scattered state of malware analysis tools, and how it evolved into a bootable operating system."
---

It started, as many projects do, with frustration.

I was sitting in front of a laptop suspected of harboring malware. The client was anxious. The clock was ticking. And I was doing what I always did: switching between terminal windows, running ClamAV here, YARA there, strings somewhere else, trying to remember which tool's output format I needed to cross-reference with which other tool's results.

That's when it hit me: I'd done this exact dance dozens of times before. The same sequence of commands. The same mental juggling. The same context-switching overhead that ate into the time I should have been spending actually *analyzing* threats.

What if there was one tool that just... did all of it?

---

## The Problem With Forensic Tools

Here's the dirty secret of digital forensics: the tools are excellent individually, but terrible together.

ClamAV gives you world-class signature detection with over a million malware signatures. YARA lets you write custom pattern rules that can catch entire malware families. Foremost can carve deleted files from raw disk. Binwalk extracts embedded payloads. Each tool is a precision instrument, honed over years of development.

But integrating them? That's your problem.

You write shell scripts. You parse different output formats. You build mental maps of which tool finds what and where that output lives. Every investigation becomes a bespoke integration project.

And that's before you even get to the *real* problem.

---

## What Traditional Scanners Miss

Most antivirus tools operate at the filesystem level. They ask the operating system "what files exist here?" and then scan what the OS shows them.

Attackers know this.

They hide malware in deleted files---technically gone from the filesystem, but still physically present on the disk until overwritten. They tuck payloads into slack space, the gaps between file boundaries and disk cluster boundaries. They inject code into boot sectors that execute before the operating system even loads.

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
│   A filesystem-level scanner sees NONE of this.                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

It's like searching a house but only looking in rooms the owner shows you.

I wanted a tool that would look everywhere. One that would operate at the raw disk level, reading bytes directly from the storage medium without the operating system mediating what it could and couldn't see.

---

## Birth of DMS

DMS---Drive Malware Scan---started as a weekend project. A bash script that automated my usual forensic workflow. Run ClamAV on raw disk chunks. Run YARA rules. Check entropy levels for packed executables. Generate one unified report.

That first version was rough. Hard-coded paths. Brittle error handling. But it worked, and more importantly, it saved me hours on every investigation.

Then I added support for forensic images. EWF files (the `.E01` format that's industry standard for disk acquisition) needed special handling, so I integrated ewfmount. While I was at it, I added hash verification---the ability to confirm that an evidence image hadn't been tampered with since acquisition.

Then came the interactive TUI, because sometimes you want to adjust settings without memorizing CLI flags. Then parallel scanning for performance. Then file carving for deleted data recovery. Then document analysis with oledump for malicious Office files.

The "weekend project" grew teeth.

---

## How It Actually Works

At its core, DMS does something deceptively simple: it reads storage devices in chunks and throws every detection engine it has at each chunk.

When you point DMS at a drive or forensic image, it first figures out what it's dealing with. Is this a raw block device? A partition? An EWF forensic image? A raw `.dd` dump? Each type gets handled appropriately---EWF images get mounted to virtual block devices, partitions get mounted read-only (or not at all, for pure raw scanning).

Then the scanning begins. Each chunk of data passes through the detection gauntlet:

**ClamAV** checks against its signature database---over a million known malware samples. This catches the known threats, the mass-distributed malware that's already been identified and catalogued.

**YARA rules** look for patterns. Not specific files, but characteristics. A YARA rule might say "find any PE executable that imports VirtualProtect and CreateRemoteThread and contains the string 'cmd.exe'"---capturing an entire class of process injection techniques rather than a specific sample.

**Entropy analysis** flags suspiciously random data. Normal files have predictable entropy patterns:

```
Normal text file:    ████░░░░░░░░░░░░  ~4.5 bits/byte
Compressed data:     ████████████░░░░  ~7.2 bits/byte
Encrypted payload:   ████████████████  ~7.99 bits/byte
                                 ↑
                    DMS alert threshold: 7.5
```

When DMS sees a region with entropy above 7.5 in an unexpected context---say, inside what claims to be a text file---that's a red flag.

**Binary structure detection** identifies executables hiding in disguise. That "vacation-photo.jpg" with a PE header? DMS notices.

All these engines run, their outputs get correlated, and at the end you get a single unified report that tells you what was found, where, and what it might mean.

---

## The Forensic Artifact Problem

Raw malware detection is only part of the story.

Modern attacks leave traces throughout a Windows system, breadcrumbs that tell you not just *what* was there, but *what it did*. Registry keys that survive malware deletion. Prefetch files that prove execution. Scheduled tasks that reveal persistence mechanisms.

Traditional antivirus doesn't look at these. Why would it? Its job is to find and remove threats, not reconstruct attack timelines.

But for forensic investigators, these artifacts are gold. They're how you prove that an attacker maintained access for six months. They're how you identify patient zero in a network-wide compromise. They're how you build a legal case.

So DMS grew forensic analysis modules.

The **persistence scanner** digs through registry hives looking for autorun entries---the Run keys, the Services, the scheduled tasks that attackers use to survive reboots. It parses Windows Task Scheduler XML files. It examines WMI subscriptions that can trigger code execution on system events.

| MITRE ATT&CK | Technique | What DMS Finds |
|--------------|-----------|----------------|
| T1547.001 | Registry Run Keys | Suspicious autorun entries |
| T1543.003 | Windows Service | Malicious service registrations |
| T1053.005 | Scheduled Task | Persistence via task scheduler |
| T1546.003 | WMI Subscription | Fileless persistence |

The **execution artifact analyzer** processes Prefetch files (Windows' attempt to speed up program launches, which conveniently records what programs actually ran and when). It parses Amcache, which logs executable metadata including SHA1 hashes. It examines Shimcache, which records programs that *existed* even if they've since been deleted.

The **file anomaly detector** looks for evasion techniques. Timestomping---when attackers modify file timestamps to blend in. Alternate Data Streams---NTFS's hidden file storage that many scanners ignore. Double extensions designed to fool users into clicking executables disguised as documents.

Each module maps its findings to MITRE ATT&CK technique IDs, connecting artifacts to known adversary behaviors.

---

## The Deployment Dilemma

I hit a wall when I tried to use DMS in the field.

The tool worked beautifully on my forensic workstation with all tools pre-installed. But at a client site, on their compromised system? I couldn't just install a bunch of forensic packages on evidence. That would modify the system, contaminating the very thing I was trying to investigate.

The first solution was **portable mode**. DMS could download its dependencies to a temporary directory, running self-contained without touching the host system's package manager. This worked if you had network access.

But what about air-gapped environments? Sensitive networks where you can't just download software from the internet?

That led to **USB Kit mode**. You build a complete offline kit on a USB drive---all the binaries, all the signature databases, everything needed to run without network access. Plug in the USB, run the launcher script, and you're scanning.

Then came the question: what if you don't trust the host operating system at all?

If a system is deeply compromised, running any tool on it is suspect. The malware might be hiding itself from any scanner running under the infected OS. Rootkits do exactly this---they intercept system calls to hide their files, processes, and network connections.

The only way to get a clean view is to boot from external media. Don't trust the installed OS at all. Boot your own operating system that the malware never had a chance to infect.

That's how DMS became a **bootable forensic OS**.

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

---

## Building a Forensic Operating System

The bootable ISO took the project in a direction I hadn't originally planned.

The concept is straightforward: package DMS and all its dependencies into a Debian-based live system that boots from USB. The evidence drive's operating system never loads. DMS runs from RAM, reading the evidence drive directly as a raw block device.

The implementation was... educational.

Live Linux distributions have their quirks. You need to balance image size against functionality. You need to handle UEFI and legacy BIOS boot. You need to think about persistence---investigators might want to save their work across reboots. And you need to be forensically sound by default, which means not automounting any drives.

The build process downloads a minimal Debian Live base, injects DMS and its tools, adds forensic utilities (sleuthkit, ewf-tools, dc3dd), configures the boot menu with options for different scenarios, and produces a hybrid ISO that can be burned to DVD or flashed to USB.

The result is a ~2.5 GB image that boots into a clean Linux environment with DMS ready to run. No installation. No configuration. Just boot and scan.

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

