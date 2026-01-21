---
layout: post
title: "The Archaeology of Attack: How DMS Reads What Malware Tries to Erase"
date: 2026-01-21
category: Malware Analysis
tags: [Forensics, Malware Analysis, Linux, Security, Incident Response, ClamAV, YARA, Open Source, Digital Forensics, Disk Analysis]
excerpt: "What if your scanner could see what the operating system pretends doesn't exist? A deep dive into raw disk forensics, deleted file resurrection, and the philosophy of reading bytes that attackers thought were gone."
---

There is a moment in every digital forensics investigation that feels like archaeology.

You are staring at a disk that has been carefully sanitized. The malware is "gone"---deleted, overwritten, scrubbed. The user swears the machine is clean now. The IT department has run three different antivirus tools. Everyone wants to move on.

And yet.

There, in the unallocated space between file boundaries. In the slack at the end of a cluster. In a boot sector that loads before any operating system. The ghosts of deleted executables. The phantom traces of exfiltrated data. The fossilized remains of an attack that never fully disappeared.

This is what DMS was built to find.

---

## Part I: The Illusion of Deletion

### The Lie Your Filesystem Tells You

When you delete a file, what actually happens?

Most people imagine the data being erased---overwritten with zeros, perhaps, or somehow vaporized into the ether. The file is *gone*. The recycle bin was emptied. The deed is done.

This is a comforting fiction.

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                           THE DELETION ILLUSION                                ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║   WHAT USERS THINK HAPPENS              WHAT ACTUALLY HAPPENS                  ║
║   ─────────────────────────────         ────────────────────────────           ║
║                                                                                ║
║   File exists → Delete → Gone           File exists → Delete → Data remains    ║
║                   ↓                                       ↓                    ║
║              [Nothing]                             [Pointer removed]           ║
║                                                         ↓                      ║
║                                                  [Data still on disk]          ║
║                                                         ↓                      ║
║                                              [Marked "available" for reuse]    ║
║                                                         ↓                      ║
║                                          [Persists until physically overwritten]║
║                                                                                ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

When you delete a file, the filesystem does something remarkably lazy: it removes the *pointer* to the data, not the data itself. The Master File Table (on NTFS) or the inode (on ext4) gets updated to say "this space is available now." But the actual bytes---the executable code, the stolen documents, the malicious payload---remain physically present on the disk surface until something else happens to overwrite them.

Think of it like a library card catalog. When a book is "removed" from the library, the catalog card is thrown away. But the book itself might still be sitting on the shelf. Anyone who walks through the stacks can still find it. The catalog just stopped acknowledging its existence.

This is why attackers love deletion. It's fast. It's convincing to most users and most tools. And it's completely transparent to anyone who knows where to look.

> *"The filesystem is a map, not the territory. Deleting a file removes it from the map. But the territory---the actual magnetic domains, the actual charge states---those persist."*

### The Mathematics of Data Persistence

How long does deleted data persist? This depends on a fascinating interplay of disk usage patterns and probability theory.

Consider a 1TB drive that's 50% full. When you delete a 10MB file, that 10MB of sectors is marked as available. The probability that any given write operation will land on those specific sectors depends on:

1. **Write frequency**: How often new data is written
2. **Write size**: How large those writes are
3. **Filesystem allocation strategy**: How the OS chooses where to write

```
╭──────────────────────────────────────────────────────────────────────────────╮
│                    DATA PERSISTENCE PROBABILITY MODEL                         │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  P(survival after time t) ≈ e^(-λt)                                          │
│                                                                              │
│  Where:                                                                      │
│    λ = write_rate × (deleted_sectors / free_sectors)                         │
│    t = time since deletion                                                   │
│                                                                              │
│  Example: 500GB free, 10MB deleted file, 1GB/day write rate                  │
│                                                                              │
│    λ = (1GB/day) × (10MB / 500GB) = 0.00002 per day                          │
│                                                                              │
│    After 1 day:   P(intact) ≈ 99.998%                                        │
│    After 30 days: P(intact) ≈ 99.94%                                         │
│    After 1 year:  P(intact) ≈ 99.27%                                         │
│                                                                              │
│  On a lightly-used system, deleted files can persist for YEARS.              │
│                                                                              │
╰──────────────────────────────────────────────────────────────────────────────╯
```

This persistence is why forensic analysis is so powerful. Attackers may believe they've covered their tracks. The math says otherwise.

---

## Part II: The Three Layers of Invisibility

Sophisticated attackers don't rely on deletion alone. They understand that modern forensics can recover deleted files. So they layer their hiding techniques, creating a matryoshka doll of invisibility.

### Layer 1: Filesystem Invisibility

The most basic level. The file exists on disk but has no filesystem entry pointing to it. Traditional scanners that ask "what files exist here?" will never see it.

**How it works**: Delete the file normally. The MFT/inode entry is removed or marked as deleted. The data remains in unallocated space.

**Why attackers use it**: Simple, fast, requires no special tools or privileges.

**Detection method**: Raw disk scanning with file carving.

### Layer 2: Structural Hiding

The malware exists but disguises its nature. An executable renamed to `.jpg`. A DLL stored inside an Alternate Data Stream. A payload embedded in a legitimate document's unused space.

**How it works**: The file is visible in the filesystem, but its contents are misrepresented by its metadata.

**Why attackers use it**: Survives basic file listing, evades extension-based scanning.

**Detection method**: Magic number verification, ADS enumeration, format parsing.

### Layer 3: Temporal Hiding

The malware's *presence* is hidden, but so are the *traces of its presence*. Timestamps are modified to blend in (timestomping). Log entries are deleted. The registry keys that prove execution are wiped.

**How it works**: Anti-forensic techniques that destroy metadata and audit trails.

**Why attackers use it**: Makes incident timeline reconstruction difficult, creates reasonable doubt.

**Detection method**: Cross-artifact correlation, timeline analysis, anti-forensic detection.

```
╭────────────────────────────────────────────────────────────────────────────────╮
│                    THE HIDING HIERARCHY                                         │
│                                                                                 │
│     SURFACE LEVEL                                                               │
│     ──────────────                                                              │
│     ┌─────────────────────────────────────────────────┐                        │
│     │ Normal AV Visibility                            │ ← Traditional scanners  │
│     │ • Files in filesystem                           │                        │
│     │ • Running processes                             │                        │
│     └─────────────────────────────────────────────────┘                        │
│                          ↓                                                      │
│     BENEATH THE SURFACE                                                         │
│     ───────────────────                                                         │
│     ┌─────────────────────────────────────────────────┐                        │
│     │ Raw Disk Visibility                             │ ← DMS scan domain       │
│     │ • Deleted files in unallocated space            │                        │
│     │ • Slack space remnants                          │                        │
│     │ • Boot sector code                              │                        │
│     │ • Carved artifacts                              │                        │
│     └─────────────────────────────────────────────────┘                        │
│                          ↓                                                      │
│     THE DEEPEST LAYER                                                           │
│     ────────────────                                                            │
│     ┌─────────────────────────────────────────────────┐                        │
│     │ Forensic Artifact Analysis                      │ ← DMS forensic modules  │
│     │ • Registry persistence traces                   │                        │
│     │ • Execution artifacts (Prefetch, Amcache)       │                        │
│     │ • Timestamp anomalies                           │                        │
│     │ • Anti-forensic detection                       │                        │
│     └─────────────────────────────────────────────────┘                        │
│                                                                                 │
╰────────────────────────────────────────────────────────────────────────────────╯
```

DMS operates at all three layers. It's not just a malware scanner---it's a visibility multiplier.

---

## Part III: A Dialogue With Disk Bytes

Let me show you what raw disk analysis actually looks like. Imagine you're the investigator, and the disk is speaking to you.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ INVESTIGATOR:                                                                    │
│   What files exist on this drive?                                                │
│                                                                                  │
│ FILESYSTEM:                                                                      │
│   There are 47,832 files. Here are their names, sizes, and locations.            │
│   Everything is accounted for. No malware detected.                              │
│                                                                                  │
│ INVESTIGATOR:                                                                    │
│   What if I ask the disk directly instead of asking you?                         │
│                                                                                  │
│ FILESYSTEM:                                                                      │
│   That's... irregular. Why would you need to do that?                            │
│                                                                                  │
│ INVESTIGATOR:                                                                    │
│   *reads raw bytes from sector 8,447,231*                                        │
│                                                                                  │
│ DISK (raw):                                                                      │
│   4D 5A 90 00 03 00 00 00 04 00 00 00 FF FF 00 00   MZ..............             │
│   B8 00 00 00 00 00 00 00 40 00 00 00 00 00 00 00   ........@.......             │
│   00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00   ................             │
│   00 00 00 00 00 00 00 00 00 00 00 00 E8 00 00 00   ................             │
│                                                                                  │
│ INVESTIGATOR:                                                                    │
│   That's an MZ header. A Windows executable. In unallocated space.               │
│   Filesystem, why didn't you tell me about this?                                 │
│                                                                                  │
│ FILESYSTEM:                                                                      │
│   That space is marked as available. No file uses it.                            │
│                                                                                  │
│ INVESTIGATOR:                                                                    │
│   "No file uses it" and "nothing is there" are very different statements.        │
│                                                                                  │
│ DISK:                                                                            │
│   *quietly contains 2.3 GB of deleted malware*                                   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

This is the fundamental insight that DMS operationalizes. The filesystem is a narrator, and narrators can lie---or be misled. The disk itself is the primary source. It cannot deceive.

### The Philosophy of Primary Sources

There's an epistemological principle at work here that extends far beyond forensics.

Every layer of abstraction in computing exists to make something easier. The filesystem abstracts the complexity of raw block devices. The operating system abstracts the filesystem. Applications abstract the operating system. Each layer translates complexity into convenience.

But each layer also translates *reality* into *representation*. And representations can diverge from reality.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    THE ABSTRACTION TRUST HIERARCHY                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LAYER                        WHAT IT SHOWS         WHAT IT HIDES            │
│  ─────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Application (Explorer)       "47,832 files"        Deleted files            │
│        ↓                                            Slack space              │
│  Operating System (NTFS)      MFT entries only      Unallocated sectors      │
│        ↓                                            Boot sector details      │
│  Block Device Driver          Allocated blocks      Raw byte patterns        │
│        ↓                                            Forensic metadata        │
│  Physical Disk                EVERYTHING            NOTHING                  │
│                                                                              │
│  ════════════════════════════════════════════════════════════════════════    │
│                                                                              │
│  DMS operates HERE ───────────────────────────────►  at the physical layer   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

When security matters, you cannot trust abstractions. You must go to primary sources.

---

## Part IV: The Detection Gauntlet

When DMS analyzes a storage device, it subjects every chunk of data to what I call the "detection gauntlet"---a series of complementary analysis techniques that together catch what any single technique would miss.

### The Engine Taxonomy

DMS integrates twelve distinct scanning engines, each with different strengths and weaknesses:

| Engine | What It Detects | How It Works | Blind Spots | DMS Integration |
|--------|-----------------|--------------|-------------|-----------------|
| **ClamAV** | Known malware families | 1M+ signature matching | Unknown variants | Chunk-by-chunk scanning |
| **YARA** | Malware patterns & behaviors | Rule-based pattern matching | Requires rule updates | 4 rule categories |
| **Entropy Analysis** | Encrypted/packed payloads | Statistical randomness | Compressed data false positives | Sliding window |
| **Strings Extraction** | C2 URLs, credentials | Printable char sequences | Obfuscated strings | IOC extraction |
| **Binwalk** | Embedded files, firmware | Header signature scanning | Encrypted containers | Recursive analysis |
| **File Carving** | Deleted files | Header/footer reconstruction | Fragmented files | Foremost/scalpel |
| **Magic Analysis** | Disguised executables | Type vs. extension mismatch | Properly named files | libmagic integration |
| **Slack Space** | Hidden data fragments | Cluster boundary analysis | Already overwritten | Custom extraction |
| **Boot Sector** | MBR/VBR malware | Sector 0 analysis | Encrypted boot | Signature matching |
| **Bulk Extractor** | Artifacts, PII | Pattern extraction | Custom formats | Email, URL, crypto |
| **Hash Generation** | Known bad files | MD5/SHA1/SHA256 | Zero-days | VirusTotal integration |
| **Rootkit Detection** | Kernel compromises | chkrootkit/rkhunter | Novel rootkits | Signature-based |

### Why Multiple Engines Matter

Consider a packed executable. ClamAV won't detect it---the packer has transformed the signature. YARA might miss it too if the packer is custom. But entropy analysis will flag it immediately:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         ENTROPY ANALYSIS VISUALIZATION                        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  File: invoice_final.xlsx.exe                                                │
│                                                                              │
│  Byte Entropy by Section:                                                    │
│                                                                              │
│  Section     Entropy         Visualization              Status               │
│  ────────────────────────────────────────────────────────────────────────    │
│  .text       3.2 bits/byte   ████████░░░░░░░░░░░░░░░░  NORMAL (code)        │
│  .data       4.1 bits/byte   ██████████░░░░░░░░░░░░░░  NORMAL (data)        │
│  .rsrc       2.8 bits/byte   ███████░░░░░░░░░░░░░░░░░  NORMAL (resources)   │
│  .packed     7.94 bits/byte  ████████████████████████  ⚠ ANOMALY           │
│                                                   ↑                         │
│                                      Maximum theoretical: 8.0               │
│                                      Detection threshold: 7.5               │
│                                                                              │
│  Verdict: Section .packed exhibits near-maximum entropy, indicating          │
│           encryption or sophisticated packing. Recommend manual analysis.    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

The combination of engines creates a detection mesh where each technique covers the blind spots of the others.

### The Detection Matrix

This table shows how different malware evasion techniques fare against different detection engines:

```
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                         EVASION vs. DETECTION MATRIX                                  ║
╠══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║                    │ ClamAV │ YARA  │Entropy│Strings│Carving│ Magic │ Boot  │Forensic║
║  EVASION TECHNIQUE ├────────┼───────┼───────┼───────┼───────┼───────┼───────┼────────║
║  ─────────────────────────────────────────────────────────────────────────────────── ║
║  Simple deletion   │   ✗    │   ✗   │   ✗   │   ✗   │   ✓   │   ✓   │  n/a  │   ✓    ║
║  Packing (UPX)     │   ✗    │  ~✓   │   ✓   │   ✗   │   ✓   │   ✓   │  n/a  │   ✓    ║
║  Custom packer     │   ✗    │   ✗   │   ✓   │   ✗   │   ✓   │   ✓   │  n/a  │   ✓    ║
║  Encryption        │   ✗    │   ✗   │   ✓   │   ✗   │  ~✓   │  ~✓   │  n/a  │   ✓    ║
║  Extension rename  │   ✓    │   ✓   │   ✓   │   ✓   │   ✓   │   ✓   │  n/a  │   ✓    ║
║  ADS hiding        │   ✗    │   ✗   │   ✗   │   ✗   │   ✓   │   ✓   │  n/a  │   ✓    ║
║  Boot sector       │   ✗    │  ~✓   │   ✓   │   ✓   │  n/a  │  n/a  │   ✓   │   ✓    ║
║  Timestomping      │   ✓    │   ✓   │   ✓   │   ✓   │   ✓   │   ✓   │  n/a  │   ✓    ║
║                                                                                       ║
║  Legend: ✓ = Detected  ✗ = Evaded  ~✓ = Partially detected  n/a = Not applicable     ║
║                                                                                       ║
║  Note: No single engine catches everything. The power is in combination.              ║
║                                                                                       ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
```

### Engine Implementation Details

Let me pull back the curtain on how each engine actually works inside DMS:

#### 1. ClamAV: `scan_clamav()`

The workhorse signature scanner. DMS doesn't just run ClamAV on files---it streams raw chunks through `clamscan` via stdin, enabling scanning of data that has no file representation.

```
Implementation:
  • Chunk size: $CHUNK_SIZE MB (default: 500)
  • Database location: $CLAMDB_DIR (/tmp/clamdb)
  • Method: dd piped to clamscan --stdin
  • Update command: freshclam --datadir=$CLAMDB_DIR

Statistics tracked:
  • STATS[clamav_scanned]      - Total bytes processed
  • STATS[clamav_infected]     - Detection count
  • STATS[clamav_signatures]   - Matched signature names
```

#### 2. YARA: `scan_yara()` and `scan_yara_category()`

Pattern matching for behaviors, not just signatures. DMS ships with four distinct rule categories:

```
Rule Categories and Paths:
  • Windows:   /opt/Qu1cksc0pe/Systems/Windows/YaraRules_Windows/  (~2,000 rules)
  • Linux:     /opt/Qu1cksc0pe/Systems/Linux/YaraRules_Linux/       (~500 rules)
  • Android:   /opt/Qu1cksc0pe/Systems/Android/YaraRules/           (~300 rules)
  • Documents: /opt/oledump/                                         (~400 rules)

Performance optimization:
  • Rules compiled and cached to $YARA_CACHE_DIR
  • Default sample: 500MB from device
  • Parallel execution when --parallel enabled

Statistics tracked:
  • STATS[yara_rules_checked]  - Rules evaluated
  • STATS[yara_matches]        - Total matches
  • STATS[yara_match_details]  - Rule name, offset, matched string
```

#### 3. Entropy Analysis: `scan_entropy()`

Pure mathematics. Shannon entropy reveals encryption and packing that signatures miss entirely.

```
Implementation:
  • Algorithm: Shannon entropy via Python
  • Scan regions: 20 evenly-distributed chunks
  • Chunk size: 50MB per region
  • High threshold: > 7.5 bits/byte (suspicious)
  • Max possible: 8.0 bits/byte (uniform random)

Entropy calculation:
  H(B) = -Σ p(bᵢ) × log₂(p(bᵢ)) for i=0 to 255
  where p(bᵢ) = frequency of byte value i / total bytes

Statistics tracked:
  • STATS[entropy_regions_scanned]
  • STATS[entropy_high_count]
  • STATS[entropy_avg], STATS[entropy_max]
  • STATS[entropy_high_offsets]  - Comma-separated suspicious regions
```

#### 4. Strings Extraction: `scan_strings()`

Pattern recognition in text. Not as sophisticated as YARA, but fast and effective for IOC hunting.

```
Implementation:
  • Minimum string length: 8 characters
  • Tool: GNU strings

Patterns extracted:
  • URLs: http://, https://
  • Executables: .exe, .dll, .bat, .ps1, .vbs
  • Credentials: password, passwd, admin, root
  • Ransomware: bitcoin, wallet, encrypt, decrypt
  • Malware keywords: trojan, keylog, backdoor
  • Shell commands: cmd.exe, powershell, wscript

Statistics tracked:
  • STATS[strings_total]
  • STATS[strings_urls]
  • STATS[strings_executables]
  • STATS[strings_credentials]
```

#### 5. File Carving: `scan_file_carving()`

Resurrecting the deleted. This is where DMS finds what attackers thought was gone.

```
Implementation:
  • Primary tool: Foremost
  • Alternatives: Photorec, Scalpel (configurable)
  • Configuration: CARVING_TOOLS=foremost
  • Max files: MAX_CARVED_FILES=1000

Process:
  1. Extract unallocated space (via Sleuth Kit's blkls)
  2. Run foremost to recover files by header/footer signatures
  3. Scan recovered files with ClamAV
  4. Catalog by file type
  5. Flag executables for priority analysis

Statistics tracked:
  • STATS[carved_total]
  • STATS[carved_by_type]     - Breakdown by extension
  • STATS[carved_executables] - PE/ELF binaries recovered
```

#### 6. Bulk Extractor: `scan_bulk_extractor()`

Artifact extraction at scale. Finds the breadcrumbs---email addresses, URLs, credit cards, PE artifacts.

```
Implementation:
  • Tool: bulk_extractor
  • Timeout: 600 seconds

Artifacts extracted:
  • email.txt    - Email addresses found
  • url.txt      - URLs extracted
  • ccn.txt      - Potential credit card numbers
  • winpe.txt    - Windows PE artifacts
  • json.txt     - JSON fragments

Statistics tracked:
  • STATS[bulk_emails]
  • STATS[bulk_urls]
  • STATS[bulk_ccn]
```

#### 7. Executable Detection: `scan_executables()`

Direct header hunting. Finds every PE and ELF binary on the disk, whether the filesystem knows about them or not.

```
Implementation:
  • PE detection: Search for MZ header (4d5a hex)
  • ELF detection: Search for \x7fELF magic

Statistics tracked:
  • STATS[pe_headers]   - Windows executables
  • STATS[elf_headers]  - Linux executables
  • STATS[pe_offsets]   - Location of each PE header
  • STATS[elf_offsets]  - Location of each ELF header
```

---

## Part V: Technical Formalism

*This section provides mathematical and technical rigor for those interested. It can be skipped without losing the narrative thread.*

### 📐 The Entropy Equation

Shannon entropy measures the average information content per byte. For a sequence of bytes *B*, entropy is calculated as:

```
          256
H(B) = -  Σ   p(bᵢ) × log₂(p(bᵢ))
         i=0

Where:
  • p(bᵢ) = frequency of byte value i / total bytes
  • H(B) ranges from 0 (all bytes identical) to 8 (uniform distribution)

For a perfectly uniform random distribution:
  p(bᵢ) = 1/256 for all i
  H(B) = -256 × (1/256) × log₂(1/256) = log₂(256) = 8 bits/byte
```

**Entropy Signatures by File Type:**

| Content Type | Typical Entropy | Pattern | Detection Significance |
|--------------|-----------------|---------|------------------------|
| English text | 3.5 - 4.5 | Letter frequency clustering | Normal |
| Source code | 4.0 - 5.0 | Keywords, indentation | Normal |
| Compiled code | 5.0 - 6.5 | Instruction encoding | Normal |
| Compressed (ZIP) | 7.0 - 7.5 | Near-uniform, some structure | Expected for format |
| Compressed (LZMA) | 7.5 - 7.8 | Very uniform | Expected for format |
| Encrypted (AES) | 7.9 - 8.0 | Cryptographic randomness | Suspicious if unexpected |
| Packed malware | 7.8 - 8.0 | High entropy in code section | **RED FLAG** |

### 📐 File Carving Algorithms

File carving recovers files without filesystem metadata by recognizing file signatures (magic numbers) in raw data.

**Header-Footer Carving**:
```
1. Scan raw bytes for known headers (e.g., "MZ" for PE, "PK" for ZIP)
2. When header found, scan forward for corresponding footer
3. Extract bytes between header and footer as recovered file
4. Validate recovered file structure

Complexity: O(n) where n = total bytes scanned
False positive rate: ~15-25% (fragments, partial files)
```

**Structure-Based Carving** (used for formats without footers):
```
1. Identify header and parse format structure
2. Use format-specific size fields to determine file boundary
3. Validate structural integrity during extraction

Example for PE (Windows executable):
  - Parse DOS header to find PE offset
  - Parse PE header to find section table
  - Calculate total size from section addresses + sizes
  - Extract exactly that many bytes
```

### 📐 YARA Rule Anatomy

YARA rules define patterns that identify malware families or behaviors:

```yara
rule CobaltStrike_Beacon_Strings
{
    meta:
        description = "Detects Cobalt Strike beacon in memory or on disk"
        author = "DMS Project"
        severity = "high"
        mitre_attack = "T1071.001"

    strings:
        $beacon_config = { 00 01 00 01 00 02 ?? ?? 00 02 00 01 00 02 ?? ?? }
        $reflective_dll = "ReflectiveLoader" ascii wide
        $pipe_name = "\\\\.\\pipe\\msagent_" ascii
        $user_agent = "Mozilla/5.0 (compatible; MSIE" ascii
        $sleep_mask = { 48 8B 44 24 ?? 48 89 44 24 ?? 48 8B 4C 24 ?? }

    condition:
        3 of them
}
```

DMS ships with four YARA rule categories:
1. **Windows malware**: 2,000+ rules for common threats
2. **Linux malware**: 500+ rules for ELF-based threats
3. **Android malware**: 300+ rules for APK analysis
4. **Document exploits**: 400+ rules for malicious Office/PDF

---

## Part VI: The Forensic Artifact Orchestra

Raw disk scanning finds the malware. But forensic artifact analysis answers the harder questions: *When did the attack happen? How did the attacker persist? What did they do?*

Windows systems are remarkably verbose about their own history. They keep execution logs that survive the executables being deleted. Persistence mechanisms that outlive the malware they load. Timestamp metadata that can reveal when files were accessed versus when they claim to have been created.

DMS's forensic modules read this scattered evidence and synthesize it into a coherent narrative.

### The Persistence Module: `scan_persistence_artifacts()`

Persistence is how attackers survive reboots. They need something to reload their malware when the system restarts. DMS hunts for these mechanisms across five sub-modules:

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                         PERSISTENCE MECHANISM MAP                               ║
╠════════════════════════════════════════════════════════════════════════════════╣
║                                                                                 ║
║  REGISTRY-BASED                                                                 ║
║  ├── HKLM\Software\Microsoft\Windows\CurrentVersion\Run                         ║
║  ├── HKCU\Software\Microsoft\Windows\CurrentVersion\Run                         ║
║  ├── HKLM\Software\Microsoft\Windows\CurrentVersion\RunOnce                     ║
║  ├── HKLM\Software\Microsoft\Windows\CurrentVersion\RunOnceEx                   ║
║  ├── HKLM\Software\Microsoft\Windows\CurrentVersion\Policies\Explorer\Run       ║
║  ├── HKCU\Software\Microsoft\Windows NT\CurrentVersion\Windows\Load             ║
║  └── HKLM\System\CurrentControlSet\Services                                     ║
║                                                                                 ║
║  TASK-BASED                                                                     ║
║  ├── Scheduled Tasks (XML in \Windows\System32\Tasks\)                          ║
║  ├── Scheduled Tasks (registry in HKLM\SOFTWARE\Microsoft\Windows NT\...)       ║
║  └── AT jobs (legacy, rarely used but still checked)                            ║
║                                                                                 ║
║  WMI-BASED                                                                      ║
║  ├── __EventFilter subscriptions                                                ║
║  ├── __EventConsumer bindings                                                   ║
║  └── CommandLineEventConsumer instances                                         ║
║                                                                                 ║
║  FILESYSTEM-BASED                                                               ║
║  ├── Startup folder shortcuts (User)                                            ║
║  ├── Startup folder shortcuts (All Users)                                       ║
║  ├── DLL search order hijacking                                                 ║
║  └── Image File Execution Options debugger hijacking                            ║
║                                                                                 ║
║  COM-BASED                                                                      ║
║  ├── CLSID hijacking                                                            ║
║  └── InprocServer32 redirection                                                 ║
║                                                                                 ║
║                           ┌──────────────────────────┐                          ║
║                           │     MITRE ATT&CK         │                          ║
║                           │     MAPPING              │                          ║
║                           ├──────────────────────────┤                          ║
║                           │ T1547.001 Registry Run   │                          ║
║                           │ T1547.004 Winlogon       │                          ║
║                           │ T1543.003 Windows Service│                          ║
║                           │ T1053.005 Scheduled Task │                          ║
║                           │ T1546.003 WMI Event Sub  │                          ║
║                           │ T1546.012 Image File Exec│                          ║
║                           │ T1546.015 COM Hijacking  │                          ║
║                           └──────────────────────────┘                          ║
║                                                                                 ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

### The Execution Artifact Module: `scan_execution_artifacts()`

Windows logs more about program execution than most users realize. These artifacts prove that something *ran*, even after it's deleted.

DMS implements six dedicated sub-modules for execution artifacts:

```
Sub-module Functions:
  • scan_prefetch_artifacts()     - Prefetch file analysis
  • scan_amcache_artifacts()      - Application compatibility cache
  • scan_shimcache_artifacts()    - AppCompatCache registry data
  • scan_userassist_artifacts()   - ROT13-encoded execution history
  • scan_srum_artifacts()         - System Resource Usage Monitor
  • scan_bam_artifacts()          - Background Activity Moderator
```

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ARTIFACT: Prefetch                                                              │
│ LOCATION: C:\Windows\Prefetch\                                                  │
│ FILE FORMAT: EXECUTABLE-HASH.pf                                                │
│ SURVIVES: Program deletion, drive reimaging (if Prefetch dir preserved)        │
│ PROVES: Program executed, execution count, last 8 execution times              │
│ FORENSIC VALUE: ★★★★★                                                          │
│ EXAMPLE: MIMIKATZ.EXE-2F9A7C1B.pf                                              │
│                                                                                │
│ Key fields DMS extracts:                                                       │
│   • Executable name and path                                                   │
│   • Run count                                                                  │
│   • Last 8 execution timestamps                                                │
│   • Files and directories accessed during execution                            │
│   • Volume information                                                         │
├────────────────────────────────────────────────────────────────────────────────┤
│ ARTIFACT: Amcache                                                               │
│ LOCATION: C:\Windows\AppCompat\Programs\Amcache.hve                             │
│ FILE FORMAT: Registry hive                                                      │
│ SURVIVES: Program deletion, most cleanup attempts                               │
│ PROVES: Program existed, SHA1 hash, original path, first execution time        │
│ FORENSIC VALUE: ★★★★★                                                          │
│ EXAMPLE: Entry for deleted nc.exe with hash d7b4f...                           │
│                                                                                │
│ Key fields DMS extracts:                                                       │
│   • Full file path                                                             │
│   • SHA1 hash of executable                                                    │
│   • File size                                                                  │
│   • Link timestamp (first seen)                                                │
│   • PE header metadata (compile time, linker version)                          │
├────────────────────────────────────────────────────────────────────────────────┤
│ ARTIFACT: Shimcache (AppCompatCache)                                            │
│ LOCATION: SYSTEM registry hive                                                  │
│ KEY: ControlSet001\Control\Session Manager\AppCompatCache                       │
│ SURVIVES: Program deletion, user profile wipes                                  │
│ PROVES: File existed at path (NOT necessarily executed), last modified time    │
│ FORENSIC VALUE: ★★★★☆                                                          │
│ EXAMPLE: Entry showing psexec.exe existed at C:\temp\ two weeks ago            │
│                                                                                │
│ Important caveat:                                                              │
│   Shimcache entries are created when files are OPENED, not necessarily         │
│   executed. A file browser viewing a directory creates entries.                │
│   However, entries for .exe files in temp directories are highly suspicious.   │
├────────────────────────────────────────────────────────────────────────────────┤
│ ARTIFACT: UserAssist                                                            │
│ LOCATION: NTUSER.DAT (per-user)                                                 │
│ KEY: Software\Microsoft\Windows\CurrentVersion\Explorer\UserAssist              │
│ ENCODING: ROT13 on program names                                                │
│ SURVIVES: User profile deletion requires explicit action                        │
│ PROVES: GUI programs run by user, run count, focus time, last run              │
│ FORENSIC VALUE: ★★★★☆                                                          │
│ EXAMPLE: Entry showing cmd.exe launched 47 times by user "admin"               │
│                                                                                │
│ Key fields DMS extracts:                                                       │
│   • Program path (after ROT13 decoding)                                        │
│   • Run count                                                                  │
│   • Focus count (number of times window had focus)                             │
│   • Focus time (total duration of focus)                                       │
│   • Last execution timestamp                                                   │
├────────────────────────────────────────────────────────────────────────────────┤
│ ARTIFACT: SRUM (System Resource Usage Monitor)                                  │
│ LOCATION: C:\Windows\System32\sru\SRUDB.dat                                     │
│ FILE FORMAT: ESE database                                                       │
│ SURVIVES: Program deletion, significant cleanup attempts                        │
│ PROVES: Network usage per application, energy usage, execution                  │
│ FORENSIC VALUE: ★★★★★                                                          │
│ EXAMPLE: powershell.exe sent 500MB to IP 185.x.x.x over 72 hours               │
│                                                                                │
│ Key tables DMS queries:                                                        │
│   • Application Resource Usage (bytes sent/received per app)                   │
│   • Network Usage (connection data)                                            │
│   • Energy Usage (process energy consumption)                                  │
├────────────────────────────────────────────────────────────────────────────────┤
│ ARTIFACT: BAM/DAM (Background/Desktop Activity Moderator)                       │
│ LOCATION: SYSTEM hive                                                           │
│ KEY: ControlSet001\Services\bam\State\UserSettings\{SID}                        │
│ AVAILABLE: Windows 10 1709+                                                     │
│ SURVIVES: Program deletion                                                      │
│ PROVES: Full path of executed program, last execution time                      │
│ FORENSIC VALUE: ★★★★☆                                                          │
│ EXAMPLE: C:\Users\Public\beacon.exe last run 2026-01-15 14:32:17               │
└────────────────────────────────────────────────────────────────────────────────┘
```

### The Correlation Power

The power is in correlation. A malicious executable might be deleted, but if DMS finds:
- A Prefetch file showing it ran 12 times
- An Amcache entry with its SHA1 hash
- A Shimcache entry proving when it was installed
- A registry Run key pointing to its (now-empty) path
- SRUM data showing it transmitted 200MB to an external IP

...then the deletion becomes evidence itself. The attempt to hide proves there was something to hide.

### The MITRE ATT&CK Mapping

Every DMS finding is mapped to the MITRE ATT&CK framework, giving defenders a common language and enabling integration with threat intelligence platforms.

```
╔════════════════════════════════════════════════════════════════════════════════════╗
║                    DMS MITRE ATT&CK TECHNIQUE MAPPINGS                              ║
╠════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                     ║
║  PERSISTENCE TECHNIQUES                                                             ║
║  ─────────────────────────────────────────────────────────────────────────────     ║
║  Registry Run Keys      │ T1547.001 │ Boot or Logon Autostart Execution            ║
║  Windows Services       │ T1543.003 │ Create or Modify System Process: Service     ║
║  Scheduled Tasks        │ T1053.005 │ Scheduled Task/Job: Scheduled Task           ║
║  Startup Folders        │ T1547.001 │ Boot or Logon Autostart Execution            ║
║  WMI Event Subscription │ T1546.003 │ Event Triggered Execution: WMI               ║
║  DLL Search Hijacking   │ T1574.001 │ Hijack Execution Flow: DLL Search Order      ║
║                                                                                     ║
║  EXECUTION EVIDENCE                                                                 ║
║  ─────────────────────────────────────────────────────────────────────────────     ║
║  Prefetch Execution     │ T1059     │ Command and Scripting Interpreter            ║
║  Suspicious Exec Path   │ T1204.002 │ User Execution: Malicious File               ║
║  LOLBin Usage           │ T1218     │ System Binary Proxy Execution                ║
║                                                                                     ║
║  DEFENSE EVASION                                                                    ║
║  ─────────────────────────────────────────────────────────────────────────────     ║
║  Double Extension       │ T1036.007 │ Masquerading: Double File Extension          ║
║  Name/Type Mismatch     │ T1036.005 │ Masquerading: Match Legitimate Name          ║
║  General Masquerading   │ T1036     │ Masquerading                                 ║
║  Timestomping           │ T1070.006 │ Indicator Removal: Timestomp                 ║
║                                                                                     ║
║  PROCESS INJECTION                                                                  ║
║  ─────────────────────────────────────────────────────────────────────────────     ║
║  Process Hollowing      │ T1055.012 │ Process Injection: Process Hollowing         ║
║  General Injection      │ T1055     │ Process Injection                            ║
║                                                                                     ║
║  CREDENTIAL ACCESS                                                                  ║
║  ─────────────────────────────────────────────────────────────────────────────     ║
║  Credential Dumping     │ T1003     │ OS Credential Dumping                        ║
║  LSASS Memory           │ T1003.001 │ OS Credential Dumping: LSASS Memory          ║
║                                                                                     ║
╚════════════════════════════════════════════════════════════════════════════════════╝
```

These mappings appear in every DMS report, enabling security teams to:
- Correlate findings with threat intelligence
- Map incidents to known adversary playbooks
- Communicate findings in standardized terminology
- Feed data into SIEM/SOAR platforms

```
╭────────────────────────────────────────────────────────────────────────────────╮
│                    ARTIFACT CORRELATION EXAMPLE                                 │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  THE STORY THE ARTIFACTS TELL:                                                 │
│                                                                                │
│  Jan 06 10:23:15  [Shimcache] svchost.exe appeared at C:\Users\Public\         │
│  Jan 06 10:23:17  [Amcache]   SHA1: 7a3f1bc2... linked (first execution)       │
│  Jan 06 10:23:18  [Prefetch]  SVCHOST.EXE-2F9A7C1B.pf created (run #1)         │
│  Jan 06 10:24:02  [Registry]  HKCU\...\Run\WindowsUpdate = path                │
│  Jan 06-19       [Prefetch]  Run count increments to 23                       │
│  Jan 06-19       [SRUM]      500MB transmitted to 185.142.x.x                  │
│  Jan 19 16:15:00 [MFT]       $FILE_NAME deleted, data in unallocated          │
│  Jan 19 16:15:00 [Registry]  Run key still points to missing file             │
│  Jan 21 09:00:00 [DMS]       Carved executable from unallocated space         │
│                              Hash matches Amcache: 7a3f1bc2...                 │
│                                                                                │
│  CONCLUSION: Cobalt Strike beacon, active Jan 6-19, manually deleted,         │
│              persistence mechanism still in place, 500MB exfiltrated.         │
│                                                                                │
╰────────────────────────────────────────────────────────────────────────────────╯
```

---

## Part VII: The File Anomaly Detective: `scan_file_anomalies()`

Sometimes malware hides in plain sight. The file exists, visible in the filesystem, but disguised to avoid suspicion. DMS's anomaly detection module catches these masquerades through five detection sub-modules:

```
Sub-module Functions:
  • detect_magic_mismatch()           - File signature vs. extension
  • detect_alternate_data_streams()   - Hidden NTFS ADS
  • detect_timestomping()             - $SI/$FN timestamp anomalies
  • detect_packed_executables()       - High-entropy code sections
  • detect_suspicious_paths()         - Unusual installation directories
```

### Timestomping Detection

Timestomping is when attackers modify file timestamps to blend in. A malicious executable created yesterday might have its timestamps set to three years ago, making it look like a longstanding system file.

Windows maintains two sets of timestamps in NTFS:

| Timestamp Set | Location | Controllable | How to Modify | Forensic Value |
|---------------|----------|--------------|---------------|----------------|
| $STANDARD_INFORMATION | MFT record | Yes, easily | SetFileTime API, touch, timestomp tools | Low (assume manipulated) |
| $FILE_NAME | MFT record | Not directly | Requires raw disk write or specific kernel APIs | High (authentic) |

When these timestamps disagree, something is wrong.

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        TIMESTOMPING DETECTION                                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  FILE: C:\Windows\System32\drivers\svchost.sys                                ║
║  (Note: svchost is normally an .exe, not a .sys driver - another red flag)   ║
║                                                                               ║
║  $STANDARD_INFORMATION (user-controllable):                                   ║
║  ├── Created:   2019-03-14 10:24:17                                           ║
║  ├── Modified:  2019-03-14 10:24:17                                           ║
║  ├── Accessed:  2019-03-14 10:24:17                                           ║
║  └── MFT Mod:   2019-03-14 10:24:17                                           ║
║                                                                               ║
║  $FILE_NAME (authentic, cannot be easily modified):                           ║
║  ├── Created:   2026-01-15 14:32:51                                           ║
║  ├── Modified:  2026-01-15 14:32:51                                           ║
║  ├── Accessed:  2026-01-15 14:33:02                                           ║
║  └── MFT Mod:   2026-01-15 14:32:51                                           ║
║                                                                               ║
║  ⚠ ALERT: $SI timestamps predate $FN timestamps by 6+ years                  ║
║           This is logically impossible without deliberate manipulation        ║
║                                                                               ║
║  Detection logic:                                                             ║
║    IF $SI.Created < $FN.Created THEN timestomping_detected                    ║
║    IF $SI.Created < $FN.MFT_Modified THEN timestomping_detected               ║
║    IF all_four_timestamps_identical THEN timestomping_likely                  ║
║                                                                               ║
║  MITRE ATT&CK: T1070.006 (Timestomping)                                       ║
║  Confidence: HIGH (99%+ certainty of deliberate manipulation)                 ║
║                                                                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### Magic Number Mismatches

Every file format has a characteristic signature at its beginning---its "magic number." A JPEG starts with `FF D8 FF`. A PDF starts with `%PDF`. A Windows executable starts with `MZ`.

When the extension doesn't match the magic number, deception is afoot.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MAGIC NUMBER REFERENCE TABLE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Extension   │ Expected Magic          │ Hex Bytes                          │
│  ────────────┼─────────────────────────┼────────────────────────────────────│
│  .exe/.dll   │ MZ (DOS/PE)             │ 4D 5A                              │
│  .pdf        │ %PDF                    │ 25 50 44 46                        │
│  .zip        │ PK                      │ 50 4B 03 04                        │
│  .docx       │ PK (it's a ZIP)         │ 50 4B 03 04                        │
│  .jpg/.jpeg  │ JFIF header             │ FF D8 FF E0 xx xx 4A 46 49 46      │
│  .png        │ PNG signature           │ 89 50 4E 47 0D 0A 1A 0A            │
│  .gif        │ GIF87a or GIF89a        │ 47 49 46 38 37/39 61               │
│  .rar        │ Rar!                    │ 52 61 72 21 1A 07                  │
│  .7z         │ 7z signature            │ 37 7A BC AF 27 1C                  │
│  .elf        │ ELF                     │ 7F 45 4C 46                        │
│  .class      │ Java class              │ CA FE BA BE                        │
│  .ps1        │ (no magic - text)       │ Varies                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         MISMATCH DETECTION EXAMPLE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ FILE: quarterly_report.pdf                                                   │
│                                                                              │
│ EXTENSION CLAIMS: PDF document                                               │
│ MAGIC NUMBER SHOWS: 4D 5A 90 00 (MZ) - Windows PE executable                │
│                                                                              │
│ ⚠ TYPE MISMATCH DETECTED                                                    │
│                                                                              │
│   Expected header for .pdf:  25 50 44 46 (%PDF)                             │
│   Actual header found:       4D 5A 90 00 (MZ..)                             │
│                                                                              │
│   Verdict: Executable masquerading as document                               │
│   Risk: Social engineering vector - user may double-click expecting PDF      │
│                                                                              │
│   Additional analysis:                                                       │
│     PE compile time: 2026-01-14 09:15:32                                     │
│     Imphash: a1b2c3d4e5f6789...                                              │
│     Sections: .text, .rdata, .data, .rsrc, .reloc                           │
│     Suspicious imports: VirtualAlloc, CreateRemoteThread                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Alternate Data Streams (ADS)

NTFS allows files to have multiple "streams" of data. The default stream is what you see when you open a file. But additional named streams can exist, invisible to most file browsers and scanners.

```
╭────────────────────────────────────────────────────────────────────────────────╮
│                    ALTERNATE DATA STREAM DETECTION                              │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  NORMAL FILE:                                                                  │
│    C:\Users\Admin\report.docx                                                  │
│    └── [default stream]: 45,231 bytes (Word document)                          │
│                                                                                │
│  FILE WITH HIDDEN ADS:                                                         │
│    C:\Users\Admin\readme.txt                                                   │
│    ├── [default stream]: 1,024 bytes (innocent text)                           │
│    └── [payload:$DATA]: 524,288 bytes ← HIDDEN EXECUTABLE                     │
│                                                                                │
│  Access hidden stream: type "readme.txt:payload" or more +s                   │
│  Execute hidden stream: start readme.txt:payload                              │
│                                                                                │
│  DMS DETECTION:                                                                │
│    1. Parse MFT $DATA attributes for each file                                 │
│    2. Count streams per file                                                   │
│    3. Flag files with non-default streams                                      │
│    4. Analyze stream contents (magic number, entropy)                          │
│    5. Alert on executable content in ADS                                       │
│                                                                                │
│  MITRE ATT&CK: T1564.004 (NTFS File Attributes)                                │
│                                                                                │
╰────────────────────────────────────────────────────────────────────────────────╯
```

### Packer Detection

Packers compress or encrypt executables, changing their appearance to evade signature detection. DMS identifies known packer signatures and flags suspicious packing.

| Packer | Signature Pattern | Legitimate Use | Malware Use |
|--------|-------------------|----------------|-------------|
| UPX | "UPX0", "UPX1" section names | Reduce distribution size | Hide from AV |
| Themida | Proprietary VM sections | Software protection | Heavy obfuscation |
| VMProtect | ".vmp0", ".vmp1" sections | License protection | Extreme obfuscation |
| ASPack | ".aspack" section | Size reduction | Moderate obfuscation |
| PECompact | "PEC2" marker | Size reduction | Legacy packing |
| Custom | High entropy + small sections | Rare | **Most suspicious** |

---

## Part VIII: The Interactive Interface

For investigators who prefer guided workflows over command-line flags, DMS provides a full-featured text user interface (TUI) via the `--interactive` flag.

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║               DMS - DRIVE MALWARE SCAN v2.1.0                                     ║
║          Use ↑↓ to navigate, Space/Enter to toggle, S to start                    ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║  INPUT SOURCE                                                                     ║
║  ▶ Path: /dev/nvme0n1 [block_device] 512GB                                        ║
║    Detected: Samsung NVMe SSD, GPT partition table                                ║
║    Partitions: 3 (EFI System, Microsoft Reserved, Windows NTFS)                   ║
╟──────────────────────────────────────────────────────────────────────────────────╢
║  SCAN TYPE                                                                        ║
║    ( ) Quick Scan       Sample-based triage                     ~5 min            ║
║    (●) Standard Scan    ClamAV + YARA + Strings                 ~30 min           ║
║    ( ) Deep Scan        Full analysis + carving                 ~90 min           ║
║    ( ) Slack Only       Unallocated space focus                 ~45 min           ║
╟──────────────────────────────────────────────────────────────────────────────────╢
║  FORENSIC ANALYSIS MODULES                                                        ║
║    [✓] Persistence artifacts    Registry, tasks, services, WMI                    ║
║    [✓] Execution artifacts      Prefetch, Amcache, Shimcache, SRUM, BAM           ║
║    [✓] File anomalies           Timestomping, ADS, magic mismatches               ║
║    [ ] MFT analysis             Master File Table parsing                         ║
║    [ ] RE triage                Imports, Capa, shellcode detection                ║
╟──────────────────────────────────────────────────────────────────────────────────╢
║  OUTPUT OPTIONS                                                                   ║
║    [✓] Generate baseline hash   SHA256 of entire device (chain of custody)        ║
║    [✓] HTML report              Formatted for legal/management                    ║
║    [✓] JSON report              Machine-readable for SIEM                         ║
║    [✓] Preserve carved files    Keep recovered files for analysis                 ║
║    Output path: /mnt/output/case_20260121_093000/                                 ║
╟──────────────────────────────────────────────────────────────────────────────────╢
║  PERFORMANCE                                                                      ║
║    [✓] Parallel scanning        Use all CPU cores                                 ║
║    [ ] Auto-chunk sizing        Calculate optimal chunk size                      ║
║    Chunk size: 500 MB                                                             ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║      [S] Start Scan        [I] Change Input        [C] Config        [Q] Quit     ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

The TUI provides:

- **Device auto-detection**: Enumerates available block devices, shows sizes and types
- **Partition analysis**: Displays partition table and filesystem information
- **Module toggles**: Enable/disable individual forensic modules
- **Time estimates**: Approximate scan duration based on device size and options
- **Progress display**: Real-time scan progress with statistics
- **Interactive reports**: Browse findings before export

---

## Part IX: Deployment Models

I built DMS to work anywhere, under any conditions. This led to a tiered deployment model where the tool adapts to its environment.

### The Trust Spectrum

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           DEPLOYMENT SPECTRUM                                    │
│                                                                                  │
│  TRUST IN HOST OS ─────────────────────────────────────────────────► NONE       │
│        HIGH                       MEDIUM                                         │
│                                                                                  │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐            │
│  │  INSTALLED   │         │  USB KIT     │         │ BOOTABLE ISO │            │
│  │              │         │              │         │              │            │
│  │ Run directly │   OR    │ External USB │   OR    │ Boot from    │            │
│  │ on host      │         │ with tools   │         │ external     │            │
│  │              │         │              │         │ media        │            │
│  └──────────────┘         └──────────────┘         └──────────────┘            │
│         │                        │                        │                     │
│         ▼                        ▼                        ▼                     │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐            │
│  │ Uses host's  │         │ Self-contained│        │ DMS is the   │            │
│  │ OS + tools   │         │ No install   │         │ entire OS    │            │
│  │ Fast setup   │         │ Air-gapped OK│         │ Host never   │            │
│  │ Needs install│         │ 1.2 GB size  │         │ boots        │            │
│  │              │         │              │         │ 2.5 GB size  │            │
│  └──────────────┘         └──────────────┘         └──────────────┘            │
│                                                                                  │
│  USE WHEN:                USE WHEN:                USE WHEN:                     │
│  • Your workstation       • Client site visit      • Deep compromise suspected  │
│  • Trusted environment    • No software install    • Rootkit possible           │
│  • Regular analysis       • Air-gapped network     • Legal evidence collection  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Mode 1: Installed / Portable

The simplest deployment. Clone the repository, run with `--portable` to auto-download dependencies.

**Pros**: Fastest setup, smallest footprint, always up-to-date
**Cons**: Requires network for first run, trusts host OS
**Best for**: Routine analysis on your own forensic workstation

```bash
git clone https://github.com/Samuele95/dms.git
cd dms
sudo ./malware_scan.sh --interactive --portable
```

### Mode 2: USB Kit

A complete, self-contained forensic toolkit on a USB drive. No network required. No installation on target system.

**Minimal Kit** (~10 MB): Script + configs, downloads tools on first use
**Full Kit** (~1.2 GB): All binaries, all signature databases, completely offline

**Pros**: Works air-gapped, no host modification, portable
**Cons**: Signature databases can become stale, trusts host OS
**Best for**: Client site visits, networks without internet access

```bash
# Build minimal kit (downloads tools on first use)
sudo ./malware_scan.sh --build-minimal-kit --kit-target /media/usb

# Build full offline kit
sudo ./malware_scan.sh --build-full-kit --kit-target /media/usb
```

The full kit creates a complete directory structure:

```
/media/usb/
├── dms/
│   ├── malware_scan.sh              # Main scanner (9,136 lines)
│   ├── lib/
│   │   ├── kit_builder.sh           # Kit creation (547 lines)
│   │   ├── iso_builder.sh           # ISO generation (751 lines)
│   │   ├── usb_mode.sh              # Environment detection (481 lines)
│   │   ├── output_storage.sh        # Case management (549 lines)
│   │   └── update_manager.sh        # Database updates (449 lines)
│   ├── tools/bin/                   # Portable binaries
│   │   ├── clamav/                  # ClamAV scanner
│   │   ├── yara/                    # YARA engine
│   │   ├── foremost                 # File carving
│   │   └── ...                      # Other tools
│   ├── databases/
│   │   ├── clamav/                  # Signature database (~350MB)
│   │   │   ├── main.cvd
│   │   │   ├── daily.cvd
│   │   │   └── bytecode.cvd
│   │   └── yara/                    # YARA rules (~100MB)
│   │       ├── windows/
│   │       ├── linux/
│   │       ├── android/
│   │       └── documents/
│   └── cache/                       # Compiled YARA rules
├── .dms_kit_manifest.json           # Kit metadata & version
├── run-dms.sh                       # Quick launcher
└── output/                          # Default results location
```

The `.dms_kit_manifest.json` file contains:

```json
{
  "version": "2.1.0",
  "kit_type": "full",
  "created": "2026-01-21T10:30:00Z",
  "clamav_db_date": "2026-01-21",
  "yara_rules_version": "2026.01",
  "tools_included": [
    "clamav", "yara", "foremost", "binwalk",
    "bulk_extractor", "sleuthkit", "ssdeep"
  ]
}
```

### Mode 3: Bootable ISO

The ultimate in forensic integrity. A complete Linux operating system that boots from USB, never touching the evidence drive's installed OS.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        BOOT SEQUENCE COMPARISON                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  NORMAL BOOT (compromised):            DMS BOOT (forensically sound):            │
│                                                                                  │
│  ┌─────────────────────────┐          ┌─────────────────────────────┐           │
│  │ BIOS/UEFI               │          │ BIOS/UEFI                   │           │
│  └───────────┬─────────────┘          └─────────────┬───────────────┘           │
│              ▼                                      ▼                            │
│  ┌─────────────────────────┐          ┌─────────────────────────────┐           │
│  │ Bootloader (MBR/GPT)    │◀─ Could  │ DMS USB bootloader          │           │
│  │ from evidence drive     │   be     └─────────────┬───────────────┘           │
│  └───────────┬─────────────┘   infected             ▼                            │
│              ▼                         ┌─────────────────────────────┐           │
│  ┌─────────────────────────┐          │ DMS Linux kernel (RAM)      │           │
│  │ Windows kernel          │◀─ Rootkit└─────────────┬───────────────┘           │
│  │ from evidence drive     │   hiding               ▼                            │
│  └───────────┬─────────────┘   here    ┌─────────────────────────────┐           │
│              ▼                         │ DMS forensic environment    │           │
│  ┌─────────────────────────┐          │ Evidence drive = raw block  │           │
│  │ Windows services        │◀─ More   │ device, never mounted       │           │
│  │ Drivers loading         │   hiding └─────────────┬───────────────┘           │
│  └───────────┬─────────────┘                        ▼                            │
│              ▼                         ┌─────────────────────────────┐           │
│  ┌─────────────────────────┐          │ TRUE visibility of all      │           │
│  │ Your AV scanner         │          │ data, no OS mediation       │           │
│  │ Sees what Windows shows │          │                             │           │
│  │ CANNOT see hidden files │          │ ✓ Deleted files visible     │           │
│  └─────────────────────────┘          │ ✓ Rootkits cannot hide      │           │
│                                        │ ✓ Chain of custody intact   │           │
│                                        └─────────────────────────────┘           │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Pros**: Maximum forensic integrity, rootkit-immune, legally defensible
**Cons**: Requires boot from USB, 2.5 GB image, hardware compatibility
**Best for**: Legal evidence collection, suspected rootkits, high-stakes investigations

```bash
# Build the ISO
sudo ./malware_scan.sh --build-iso --iso-output ~/dms-forensic.iso

# Flash to USB
sudo dd if=~/dms-forensic.iso of=/dev/sdX bs=4M status=progress
```

---

## Part X: A Day in the Field

Let me walk you through an actual investigation workflow, showing how DMS operates from arrival to final report.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 08:30 - BRIEFING                                                                  │
│                                                                                   │
│ A law firm calls. Three laptops belonging to partners are suspected of           │
│ compromise. Two weeks ago, a partner received a phishing email with an           │
│ attachment. They opened it. The IT contractor has since run Windows Defender     │
│ and declared the machines "clean."                                               │
│                                                                                   │
│ Legal counsel isn't convinced. They need forensic certainty for potential        │
│ litigation. They need to know: Was data exfiltrated? When? How much?             │
│                                                                                   │
│ You pack:                                                                         │
│   • DMS bootable USB (2.5 GB image on 32 GB drive)                               │
│   • Empty USB drive for output storage                                           │
│   • Chain of custody forms                                                       │
│   • Write blocker (for paranoia, though DMS is read-only by design)             │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 09:00 - ARRIVAL                                                                   │
│                                                                                   │
│ First laptop: Partner A's ThinkPad. You document serial number, current state.   │
│ You do NOT power it on normally---that would modify evidence.                    │
│                                                                                   │
│ Instead:                                                                          │
│   1. Insert DMS USB                                                               │
│   2. Enter BIOS (F12 on ThinkPad)                                                │
│   3. Select USB boot                                                              │
│   4. DMS environment loads into RAM                                              │
│                                                                                   │
│ The laptop's internal NVMe appears as /dev/nvme0n1. It is NOT mounted.           │
│ The evidence drive's operating system never loads. Any rootkit present           │
│ has no opportunity to hide itself.                                               │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 09:15 - SCAN INITIATION                                                           │
│                                                                                   │
│ You plug in the output USB. DMS detects it:                                      │
│                                                                                   │
│   "External storage detected: /dev/sdb1 (SanDisk 64GB)"                          │
│   "Use as output destination? [Y/n]"                                             │
│                                                                                   │
│ You confirm. DMS mounts it read-write at /mnt/output.                            │
│                                                                                   │
│ You launch the interactive interface:                                             │
│                                                                                   │
│   $ dms-scan --interactive                                                       │
│                                                                                   │
│ ╔══════════════════════════════════════════════════════════════════════════════╗ │
│ ║               DMS - DRIVE MALWARE SCAN v2.1.0                                 ║ │
│ ║          Use ↑↓ to navigate, Space/Enter to toggle, S to start               ║ │
│ ╠══════════════════════════════════════════════════════════════════════════════╣ │
│ ║  INPUT SOURCE                                                                 ║ │
│ ║  ▶ Path: /dev/nvme0n1 [block_device] 512GB                                    ║ │
│ ╟──────────────────────────────────────────────────────────────────────────────╢ │
│ ║  SCAN TYPE                                                                    ║ │
│ ║    ( ) Quick Scan       Fast sample-based triage (~5 min)                     ║ │
│ ║    ( ) Standard Scan    ClamAV + YARA + Strings (~30 min)                     ║ │
│ ║    (●) Deep Scan        Full analysis + carving (~90 min)                     ║ │
│ ╟──────────────────────────────────────────────────────────────────────────────╢ │
│ ║  FORENSIC ANALYSIS MODULES                                                    ║ │
│ ║    [✓] Persistence artifacts (registry, tasks, services, WMI)                 ║ │
│ ║    [✓] Execution artifacts (prefetch, amcache, shimcache, SRUM)               ║ │
│ ║    [✓] File anomalies (timestomping, ADS, mismatches, packers)                ║ │
│ ║    [✓] MFT analysis (deleted files, timeline)                                 ║ │
│ ║    [✓] RE triage (imports, capabilities, hashes)                              ║ │
│ ╟──────────────────────────────────────────────────────────────────────────────╢ │
│ ║  OUTPUT                                                                       ║ │
│ ║    [✓] Generate baseline hash before scan                                     ║ │
│ ║    [✓] Export HTML report                                                     ║ │
│ ║    [✓] Export JSON report                                                     ║ │
│ ║    [✓] Preserve carved artifacts                                              ║ │
│ ╠══════════════════════════════════════════════════════════════════════════════╣ │
│ ║      [S] Start Scan        [I] Input Path        [Q] Quit                     ║ │
│ ╚══════════════════════════════════════════════════════════════════════════════╝ │
│                                                                                   │
│ You press S. Scan begins.                                                        │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 09:20 - BASELINE HASH                                                             │
│                                                                                   │
│ First, DMS computes a cryptographic hash of the entire evidence drive:           │
│                                                                                   │
│   "Computing SHA256 of /dev/nvme0n1 (512GB)..."                                  │
│   "Progress: ████████████████████ 100%"                                          │
│   "Baseline hash: 9f8c2d7a1b3e4f5c..."                                           │
│                                                                                   │
│ This hash is your proof that the evidence was not modified. If anyone            │
│ challenges your findings in court, you can demonstrate that the drive's          │
│ state at analysis time matches this hash exactly.                                │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 10:45 - SCAN COMPLETE                                                             │
│                                                                                   │
│ The report appears. Your heart rate increases.                                   │
│                                                                                   │
│ ═══════════════════════════════════════════════════════════════════════════════  │
│                        DMS SCAN REPORT - PARTNER A LAPTOP                        │
│ ═══════════════════════════════════════════════════════════════════════════════  │
│                                                                                   │
│ EXECUTIVE SUMMARY                                                                │
│ ─────────────────                                                                │
│ Threat Level: CRITICAL                                                           │
│ Findings: 4 high-severity, 2 medium-severity                                    │
│ Active Compromise: YES (persistence mechanism still present)                     │
│ Data Exfiltration: LIKELY (500+ MB network transfer detected)                   │
│                                                                                   │
│ HIGH SEVERITY FINDINGS                                                           │
│ ─────────────────────                                                            │
│                                                                                   │
│ 1. CARVED MALWARE IN UNALLOCATED SPACE                                          │
│    Location: Sectors 847231-851890 (unallocated)                                │
│    SHA256: 7a3f1bc2e4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1    │
│    Size: 524,288 bytes                                                          │
│    Type: Windows PE executable                                                  │
│                                                                                   │
│    Detection Results:                                                            │
│    ├─ ClamAV: Trojan.GenericKD.46847123                                         │
│    ├─ YARA: Cobalt_Strike_Beacon_v4 (confidence: HIGH)                          │
│    ├─ YARA: Reflective_DLL_Injection (confidence: HIGH)                         │
│    └─ Entropy: 7.82 bits/byte (packed/encrypted)                                │
│                                                                                   │
│    VirusTotal: 58/72 detections                                                  │
│    First Seen: 2025-12-20                                                        │
│    Malware Family: Cobalt Strike                                                 │
│                                                                                   │
│ 2. ACTIVE PERSISTENCE MECHANISM                                                  │
│    Type: Registry Run Key                                                        │
│    Location: HKCU\Software\Microsoft\Windows\CurrentVersion\Run                  │
│    Value: "WindowsUpdate"                                                        │
│    Data: C:\Users\Public\svchost.exe                                            │
│    Target Status: FILE MISSING (deleted but persistence remains)                │
│    MITRE: T1547.001                                                              │
│                                                                                   │
│ 3. EXECUTION EVIDENCE                                                            │
│    Prefetch: SVCHOST.EXE-2F9A7C1B.pf                                            │
│    ├─ Run Count: 23                                                              │
│    ├─ First Run: 2026-01-06 10:23:18                                            │
│    ├─ Last Run: 2026-01-19 14:15:02                                             │
│    └─ Files Accessed: [list of DLLs, including ws2_32.dll for networking]       │
│                                                                                   │
│    Amcache Entry:                                                                │
│    ├─ SHA1: 7a3f1bc2e4... (matches carved sample)                               │
│    ├─ Original Path: C:\Users\Public\svchost.exe                                │
│    └─ First Execution: 2026-01-06 10:23:17                                      │
│                                                                                   │
│ 4. TIMESTOMPING DETECTED                                                         │
│    File: C:\Windows\Temp\update.dll                                             │
│    $STANDARD_INFORMATION: Created 2018-04-15 (fake)                             │
│    $FILE_NAME: Created 2026-01-06 10:25:33 (real)                               │
│    Delta: 7.7 years (impossible without manipulation)                           │
│    MITRE: T1070.006                                                              │
│                                                                                   │
│ MEDIUM SEVERITY FINDINGS                                                         │
│ ───────────────────────                                                          │
│                                                                                   │
│ 5. SUSPICIOUS NETWORK ACTIVITY (SRUM)                                           │
│    Application: svchost.exe (malicious, not system)                             │
│    Bytes Sent: 524,891,776 (~500 MB)                                            │
│    Bytes Received: 12,451,328 (~12 MB)                                          │
│    Time Range: 2026-01-06 to 2026-01-19                                         │
│    Note: 500 MB outbound suggests significant data exfiltration                 │
│                                                                                   │
│ 6. SECONDARY PAYLOAD                                                             │
│    Location: C:\Users\PartnerA\AppData\Local\Temp\update.ps1                    │
│    Type: PowerShell script                                                       │
│    Contents: Base64-encoded command, downloads secondary payload                │
│    Status: File still present                                                    │
│                                                                                   │
│ TIMELINE RECONSTRUCTION                                                          │
│ ───────────────────────                                                          │
│                                                                                   │
│ Jan 06 10:22:45  Phishing email opened                                          │
│ Jan 06 10:23:15  update.ps1 created in Temp                                     │
│ Jan 06 10:23:17  svchost.exe dropped to C:\Users\Public\                        │
│ Jan 06 10:23:18  First execution (Prefetch created)                             │
│ Jan 06 10:24:02  Registry persistence established                               │
│ Jan 06 10:25:33  update.dll created (then timestomped)                          │
│ Jan 06-19       Active beaconing, 23 total executions                          │
│ Jan 06-19       ~500 MB data exfiltrated                                        │
│ Jan 19 16:00:00 IT contractor runs Defender                                     │
│ Jan 19 16:15:00 svchost.exe deleted (data remains)                              │
│ Jan 21 09:20:00 DMS analysis reveals full scope                                 │
│                                                                                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 11:00 - DOCUMENTATION                                                             │
│                                                                                   │
│ You export:                                                                       │
│   /mnt/output/PartnerA_Laptop/                                                   │
│   ├── evidence_hash.txt (SHA256 of entire drive)                                │
│   ├── scan_report.html (formatted for legal team)                               │
│   ├── scan_report.json (for SIEM/automation)                                    │
│   ├── carved_artifacts/                                                          │
│   │   ├── sector_847231_pe.exe (the malware)                                    │
│   │   └── sector_847231_pe.exe.analysis.txt                                     │
│   └── timeline.csv (all events chronologically)                                 │
│                                                                                   │
│ The evidence drive was never written to. Chain of custody: intact.              │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 11:30 - LAPTOPS B AND C                                                           │
│                                                                                   │
│ You repeat the process. Laptop B shows similar infection (same attacker).        │
│ Laptop C is clean---it was never compromised.                                    │
│                                                                                   │
│ The pattern is clear: targeted spear-phishing against two specific partners.    │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 14:00 - BRIEFING                                                                  │
│                                                                                   │
│ You present findings to the legal team:                                          │
│                                                                                   │
│ "Partners A and B were compromised by Cobalt Strike beacons starting            │
│  January 6th. The malware was active for 13 days before the IT contractor's     │
│  scan, which deleted the executables but left the persistence mechanisms        │
│  and forensic artifacts intact. Approximately 500 MB of data was transmitted    │
│  to external servers. The data likely includes documents from both users'       │
│  profiles based on the access patterns in the Prefetch files."                  │
│                                                                                   │
│ The legal team has what they need for their breach notification obligations     │
│ and potential litigation.                                                        │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Part XI: The Architecture

DMS is a **9,136-line Bash script** with an additional **2,777 lines** across five library modules. This might seem unconventional for a security tool. The choice was deliberate.

### Why Bash?

**Universality**: Bash runs everywhere. Every Linux distribution has it. Every live forensic environment has it. There's no Python version mismatch, no Node.js installation, no Go compilation. The script *is* the tool.

**Transparency**: Bash scripts are readable. A forensic tool that defenders can't inspect is a liability. With DMS, you can read every line of code that touches your evidence.

**Portability**: Copy one file to a USB drive and you have a forensic toolkit. No virtual environments, no package managers, no dependency hell.

**Shell Integration**: Forensic work involves coordinating many command-line tools. Bash is the natural glue language for this.

### Core Metrics

```
╭───────────────────────────────────────────────────────────────────────────╮
│                         DMS v2.1 SPECIFICATIONS                            │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  COMPONENT                     LINES        SIZE       PURPOSE             │
│  ─────────────────────────────────────────────────────────────────────    │
│  malware_scan.sh               9,136       ~320KB     Main scanner         │
│  lib/kit_builder.sh              547        ~18KB     USB kit creation     │
│  lib/iso_builder.sh              751        ~25KB     Bootable ISO         │
│  lib/usb_mode.sh                 481        ~16KB     Kit detection        │
│  lib/output_storage.sh           549        ~18KB     Case management      │
│  lib/update_manager.sh           449        ~15KB     Database updates     │
│  ─────────────────────────────────────────────────────────────────────    │
│  TOTAL                        11,913       ~412KB                          │
│                                                                            │
│  SCANNING ENGINES:              12+                                        │
│  YARA RULE CATEGORIES:           4                                         │
│  FORENSIC MODULES:               6                                         │
│  TRACKED STATISTICS:            60+                                        │
│  SUPPORTED PLATFORMS:  Tsurugi, Debian, Ubuntu, Fedora, RHEL, Arch        │
│  BASH REQUIREMENT:     4.0+ (associative array support)                   │
│                                                                            │
╰───────────────────────────────────────────────────────────────────────────╯
```

### The Modular Architecture

```
                              ┌────────────────────────┐
                              │     DMS CORE           │
                              │   (malware_scan.sh)    │
                              │      ~9,000 lines      │
                              └───────────┬────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              │                           │                           │
              ▼                           ▼                           ▼
    ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
    │  INPUT LAYER    │         │  SCAN LAYER     │         │  OUTPUT LAYER   │
    ├─────────────────┤         ├─────────────────┤         ├─────────────────┤
    │ • Block devices │         │ • ClamAV        │         │ • Text reports  │
    │ • EWF images    │         │ • YARA (4 cats) │         │ • HTML reports  │
    │ • Raw DD dumps  │         │ • Entropy       │         │ • JSON export   │
    │ • Partitions    │         │ • Strings       │         │ • Hash logs     │
    │ • Auto-detect   │         │ • Binwalk       │         │ • Carved files  │
    └────────┬────────┘         │ • Carving       │         └────────▲────────┘
             │                  │ • Boot sector   │                  │
             │                  │ • Forensics     │                  │
             │                  └────────┬────────┘                  │
             │                           │                           │
             └───────────────────────────┴───────────────────────────┘
                                    │
                       ┌────────────┴────────────┐
                       │     LIBRARY MODULES     │
                       │     (lib/ directory)    │
                       ├─────────────────────────┤
                       │ usb_mode.sh (~800 lines)│
                       │   • Kit detection       │
                       │   • Environment setup   │
                       │   • Tool path resolution│
                       ├─────────────────────────┤
                       │ output_storage.sh       │
                       │   • Device detection    │
                       │   • Safe mounting       │
                       │   • Case directory mgmt │
                       ├─────────────────────────┤
                       │ kit_builder.sh          │
                       │   • Minimal kit creation│
                       │   • Full kit creation   │
                       │   • Manifest generation │
                       ├─────────────────────────┤
                       │ iso_builder.sh          │
                       │   • Debian Live base    │
                       │   • Tool injection      │
                       │   • UEFI/BIOS boot      │
                       ├─────────────────────────┤
                       │ update_manager.sh       │
                       │   • ClamAV DB updates   │
                       │   • YARA rule updates   │
                       │   • Kit versioning      │
                       └─────────────────────────┘
```

### Configuration Hierarchy

DMS uses a cascading configuration system that balances smart defaults with full customizability:

```
Priority (highest to lowest):
1. Command-line flags        --chunk-size 1024
2. Environment variables     DMS_CHUNK_SIZE=1024
3. User config file          ~/.malscan.conf
4. System config file        /etc/malscan.conf
5. Current directory         ./malscan.conf
6. Built-in defaults         CHUNK_SIZE=500
```

This means:
- New users get sensible defaults with zero configuration
- Power users can create personal config files
- Enterprises can deploy system-wide configs
- Any default can be overridden at runtime

### The Configuration Deep Dive

Every aspect of DMS behavior can be tuned via configuration. Here's a complete reference:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         DMS CONFIGURATION REFERENCE                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  PERFORMANCE TUNING                                                           ║
║  ─────────────────────────────────────────────────────────────────────────── ║
║  CHUNK_SIZE=500              │ MB per scan chunk (memory/speed tradeoff)     ║
║  MAX_PARALLEL_JOBS=4         │ Concurrent threads (defaults to CPU cores)    ║
║  SLACK_EXTRACT_TIMEOUT=600   │ Maximum seconds for slack space extraction    ║
║  SLACK_MIN_SIZE_MB=10        │ Skip slack spaces smaller than this           ║
║  MAX_CARVED_FILES=1000       │ Limit recovered files from carving            ║
║                                                                               ║
║  SCAN ENGINE PATHS                                                            ║
║  ─────────────────────────────────────────────────────────────────────────── ║
║  CLAMDB_DIR=/tmp/clamdb                                                       ║
║  YARA_RULES_BASE=/opt/Qu1cksc0pe/Systems                                      ║
║  OLEDUMP_RULES=/opt/oledump                                                   ║
║  YARA_CACHE_DIR=/tmp/yara_cache                                               ║
║  CARVING_TOOLS=foremost       │ Options: foremost, photorec, scalpel         ║
║                                                                               ║
║  EWF/FORENSIC IMAGING                                                         ║
║  ─────────────────────────────────────────────────────────────────────────── ║
║  EWF_SUPPORT=true            │ Enable Expert Witness Format support          ║
║  EWF_VERIFY_HASH=false       │ Verify image integrity on mount               ║
║  EWF_MOUNT_OPTIONS=""        │ Additional ewfmount parameters                ║
║  TEMP_MOUNT_BASE=/tmp        │ Temporary mount point directory               ║
║                                                                               ║
║  VIRUSTOTAL INTEGRATION                                                       ║
║  ─────────────────────────────────────────────────────────────────────────── ║
║  VT_API_KEY=                 │ Your VirusTotal API key (optional)            ║
║  VT_RATE_LIMIT=4             │ Requests per minute (free API: 4)             ║
║                                                                               ║
║  PORTABLE MODE                                                                ║
║  ─────────────────────────────────────────────────────────────────────────── ║
║  PORTABLE_TOOLS_DIR=/tmp/malscan_portable_tools                               ║
║  YARA_VERSION=4.5.0          │ Version to download                           ║
║  CLAMAV_VERSION=1.3.1        │ Version to download                           ║
║                                                                               ║
║  USB KIT SETTINGS                                                             ║
║  ─────────────────────────────────────────────────────────────────────────── ║
║  USB_MODE=auto               │ Options: auto, minimal, full                  ║
║  KIT_MIN_FREE_SPACE_MB=2000  │ Required for full kit build                   ║
║  USB_TOOLS_DIR=tools         │ Relative to USB root                          ║
║  USB_DATABASES_DIR=databases │ Signature storage location                    ║
║                                                                               ║
║  ISO BUILDER                                                                  ║
║  ─────────────────────────────────────────────────────────────────────────── ║
║  DEBIAN_LIVE_URL=https://cdimage.debian.org/.../debian-live-12.5.0-amd64.iso ║
║  ISO_OUTPUT_PATTERN=dms-forensic-VERSION.iso                                  ║
║  ISO_EXTRA_PACKAGES="sleuthkit ewf-tools dc3dd exiftool testdisk"            ║
║  ISO_WORK_DIR=/tmp/dms-iso-build    │ Requires ~5GB free                     ║
║  ISO_INCLUDE_CLAMAV_DB=true         │ Adds ~350MB to ISO                     ║
║  ISO_INCLUDE_YARA_RULES=true        │ Adds ~100MB to ISO                     ║
║                                                                               ║
║  OUTPUT STORAGE                                                               ║
║  ─────────────────────────────────────────────────────────────────────────── ║
║  OUTPUT_MOUNT_POINT=/mnt/dms-output                                           ║
║  CASE_NAME_PATTERN=case_%Y%m%d_%H%M%S                                         ║
║  OUTPUT_TMPFS_WARN=true      │ Warn before using RAM for output              ║
║                                                                               ║
║  FORENSIC ANALYSIS (all default to false)                                     ║
║  ─────────────────────────────────────────────────────────────────────────── ║
║  FORENSIC_ANALYSIS=false     │ Master switch for all forensic modules        ║
║  PERSISTENCE_SCAN=false      │ Registry, tasks, services, WMI                ║
║  EXECUTION_SCAN=false        │ Prefetch, Amcache, Shimcache, SRUM, BAM       ║
║  FILE_ANOMALIES=false        │ Timestomping, ADS, magic mismatches           ║
║  RE_TRIAGE=false             │ Reverse engineering triage                    ║
║  MFT_ANALYSIS=false          │ Master File Table analysis                    ║
║                                                                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Part XII: Practical Templates

Here are ready-to-use command templates for common scenarios:

### Template 1: Quick Triage

*When you need fast results and thoroughness is secondary*

```bash
sudo ./malware_scan.sh \
    --input /dev/sda \
    --quick \
    --parallel \
    --output /tmp/triage-$(date +%Y%m%d) \
    --report-format text
```

Runtime: ~5 minutes for 500GB
Coverage: Sampled scan, high-confidence detections only

### Template 2: Full Forensic Analysis

*When you need complete analysis with legal-quality documentation*

```bash
sudo ./malware_scan.sh \
    --input /dev/sda \
    --deep \
    --verify-hash \
    --forensic-all \
    --output /media/evidence-usb/case-$(date +%Y%m%d) \
    --report-format html,json \
    --carve-all
```

Runtime: ~90 minutes for 500GB
Coverage: Full disk, all engines, complete artifact analysis

### Template 3: EWF Forensic Image

*When analyzing an acquired disk image*

```bash
sudo ./malware_scan.sh \
    --input /evidence/suspect.E01 \
    --deep \
    --verify-hash \
    --output /analysis/case-2026-001 \
    --report-format html,json
```

DMS auto-detects EWF format, mounts via ewfmount, verifies image integrity

### Template 4: Air-Gapped Environment

*When no network is available*

```bash
# From USB kit:
/media/dms-kit/malware_scan.sh \
    --input /dev/sda \
    --standard \
    --offline \
    --output /media/output-usb/scan-results
```

No network calls attempted, uses bundled signature databases

### Template 5: Slack Space Focus

*When you specifically want to find deleted content*

```bash
sudo ./malware_scan.sh \
    --input /dev/sda \
    --slack-only \
    --carve-all \
    --output /tmp/carved-files \
    --report-format json
```

Focuses on unallocated space, maximizes file recovery

### Template 6: Build Bootable ISO

*Creating your own forensic live environment*

```bash
sudo ./malware_scan.sh \
    --build-iso \
    --iso-output ~/dms-forensic-$(date +%Y%m%d).iso \
    --iso-include-persistence \
    --iso-uefi-support
```

Produces hybrid ISO bootable on UEFI and legacy BIOS systems

---

## Part XIII: The Complete Command Reference

For those who want to understand every capability, here's the complete command-line interface:

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                         DMS COMMAND-LINE REFERENCE                                ║
╠══════════════════════════════════════════════════════════════════════════════════╣
║                                                                                   ║
║  USAGE: ./malware_scan.sh [OPTIONS] <input>                                       ║
║                                                                                   ║
║  BASIC OPTIONS                                                                    ║
║  ─────────────────────────────────────────────────────────────────────────────── ║
║  <input>              │ Device or image path (e.g., /dev/sda, image.E01)         ║
║  -m, --mount          │ Mount device before scanning                             ║
║  -u, --update         │ Update ClamAV signature databases                        ║
║  -d, --deep           │ Enable deep forensic scan (all engines)                  ║
║  -o, --output FILE    │ Custom output file path                                  ║
║  -i, --interactive    │ Launch interactive TUI mode                              ║
║  -h, --help           │ Display help message                                     ║
║                                                                                   ║
║  INPUT FORMAT OPTIONS                                                             ║
║  ─────────────────────────────────────────────────────────────────────────────── ║
║  --verify-hash        │ Verify EWF image integrity (chain of custody)            ║
║  --input-format TYPE  │ Force input type: auto, block, ewf, raw                  ║
║                                                                                   ║
║  SCAN SCOPE                                                                       ║
║  ─────────────────────────────────────────────────────────────────────────────── ║
║  --scan-mode MODE     │ Scan mode: full (entire disk) or slack (unallocated)     ║
║  --slack              │ Shortcut for --scan-mode slack                           ║
║  --slack-only         │ Alias for --slack                                        ║
║                                                                                   ║
║  PERFORMANCE OPTIONS                                                              ║
║  ─────────────────────────────────────────────────────────────────────────────── ║
║  -p, --parallel       │ Enable parallel scanning (ClamAV, YARA, etc.)            ║
║  --auto-chunk         │ Auto-calculate chunk size based on RAM                   ║
║  --quick              │ Fast sample-based scan (~5 min for 500GB)                ║
║                                                                                   ║
║  FEATURE OPTIONS                                                                  ║
║  ─────────────────────────────────────────────────────────────────────────────── ║
║  --virustotal         │ Enable VirusTotal hash lookup                            ║
║  --rootkit            │ Run rootkit detection (requires --mount)                 ║
║  --timeline           │ Generate file timeline with fls/mactime                  ║
║  --resume FILE        │ Resume interrupted scan from checkpoint                  ║
║  --carve-all          │ Recover all carved files (not just executables)          ║
║                                                                                   ║
║  FORENSIC ANALYSIS                                                                ║
║  ─────────────────────────────────────────────────────────────────────────────── ║
║  --forensic-analysis  │ Enable ALL forensic modules                              ║
║  --forensic-all       │ Alias for --forensic-analysis                            ║
║  --persistence-scan   │ Persistence mechanisms only                              ║
║  --execution-scan     │ Execution artifacts only                                 ║
║  --file-anomalies     │ File anomaly detection only                              ║
║  --re-triage          │ Reverse engineering triage only                          ║
║  --mft-analysis       │ MFT/filesystem forensics only                            ║
║  --attack-mapping     │ Include MITRE ATT&CK IDs (default: on)                   ║
║  --no-attack-mapping  │ Disable ATT&CK technique mapping                         ║
║                                                                                   ║
║  OUTPUT OPTIONS                                                                   ║
║  ─────────────────────────────────────────────────────────────────────────────── ║
║  --html               │ Generate HTML report                                     ║
║  --json               │ Generate JSON report (for SIEM integration)              ║
║  --report-format FMT  │ Comma-separated: text,html,json                          ║
║  -q, --quiet          │ Minimal output (errors only)                             ║
║  -v, --verbose        │ Debug-level output                                       ║
║                                                                                   ║
║  DISPLAY OPTIONS                                                                  ║
║  ─────────────────────────────────────────────────────────────────────────────── ║
║  --no-color           │ Disable colored terminal output                          ║
║  --high-contrast      │ Bold text only (accessibility)                           ║
║                                                                                   ║
║  ADVANCED OPTIONS                                                                 ║
║  ─────────────────────────────────────────────────────────────────────────────── ║
║  --dry-run            │ Preview actions without executing                        ║
║  --config FILE        │ Use custom configuration file                            ║
║  --log-file FILE      │ Write logs to specified file                             ║
║  --keep-output        │ Preserve temporary directory after scan                  ║
║                                                                                   ║
║  PORTABLE MODE                                                                    ║
║  ─────────────────────────────────────────────────────────────────────────────── ║
║  --portable           │ Auto-download missing tools                              ║
║  --portable-keep      │ Keep downloaded tools after scan                         ║
║  --portable-dir DIR   │ Custom directory for portable tools                      ║
║                                                                                   ║
║  USB KIT OPERATIONS                                                               ║
║  ─────────────────────────────────────────────────────────────────────────────── ║
║  --update-kit         │ Update kit signature databases                           ║
║  --build-full-kit     │ Build complete offline kit (~1.2GB)                      ║
║  --build-minimal-kit  │ Build script-only kit (~10MB)                            ║
║  --kit-target DIR     │ Kit destination directory                                ║
║                                                                                   ║
║  ISO/LIVE IMAGE                                                                   ║
║  ─────────────────────────────────────────────────────────────────────────────── ║
║  --build-iso          │ Build bootable forensic ISO (~2.5GB)                     ║
║  --iso-output FILE    │ ISO output file path                                     ║
║  --flash-iso DEV      │ Flash ISO directly to USB device                         ║
║  --create-persistence │ Add writable persistence partition                       ║
║  --force              │ Override safety checks                                   ║
║                                                                                   ║
║  OUTPUT STORAGE                                                                   ║
║  ─────────────────────────────────────────────────────────────────────────────── ║
║  --output-device DEV  │ Specific device for storing results                      ║
║  --output-path PATH   │ Specific directory for results                           ║
║  --output-tmpfs       │ Store results in RAM (lost on reboot)                    ║
║  --case-name NAME     │ Custom case directory name                               ║
║                                                                                   ║
║  EXIT CODES                                                                       ║
║  ─────────────────────────────────────────────────────────────────────────────── ║
║  0                    │ Successful completion                                    ║
║  1                    │ Error or scan failed                                     ║
║  130                  │ Interrupted (Ctrl+C / SIGINT)                            ║
║  143                  │ Terminated (SIGTERM)                                     ║
║                                                                                   ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

## Part XIV: The Statistics Engine

DMS tracks over 60 metrics during every scan, providing forensic investigators with precise quantitative data for their reports.

### Statistics Categories

```
╭────────────────────────────────────────────────────────────────────────────────────╮
│                         DMS STATISTICS TRACKING SYSTEM                              │
├────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  CLAMAV STATISTICS                                                                  │
│    STATS[clamav_scanned]       │ Total bytes scanned                               │
│    STATS[clamav_infected]      │ Detection count                                   │
│    STATS[clamav_signatures]    │ Matched signature names                           │
│                                                                                     │
│  YARA STATISTICS                                                                    │
│    STATS[yara_rules_checked]   │ Total rules evaluated                             │
│    STATS[yara_matches]         │ Total matches found                               │
│    STATS[yara_match_details]   │ Rule name, offset, matched string                 │
│                                                                                     │
│  ENTROPY STATISTICS                                                                 │
│    STATS[entropy_regions_scanned] │ Regions analyzed                               │
│    STATS[entropy_high_count]   │ High-entropy regions (>7.5)                       │
│    STATS[entropy_avg]          │ Average entropy across disk                       │
│    STATS[entropy_max]          │ Peak entropy value                                │
│    STATS[entropy_high_offsets] │ Locations of suspicious regions                   │
│                                                                                     │
│  STRINGS STATISTICS                                                                 │
│    STATS[strings_total]        │ Total strings extracted                           │
│    STATS[strings_urls]         │ URLs found                                        │
│    STATS[strings_executables]  │ Executable references                             │
│    STATS[strings_credentials]  │ Credential patterns                               │
│                                                                                     │
│  FILE CARVING STATISTICS                                                            │
│    STATS[carved_total]         │ Files recovered                                   │
│    STATS[carved_by_type]       │ Breakdown by extension                            │
│    STATS[carved_executables]   │ PE/ELF binaries found                             │
│                                                                                     │
│  SLACK SPACE STATISTICS                                                             │
│    STATS[slack_size_mb]        │ Unallocated space extracted                       │
│    STATS[slack_data_recovered_mb] │ Data recovered                                 │
│    STATS[slack_files_recovered]│ Files reconstructed                               │
│                                                                                     │
│  PERSISTENCE ARTIFACT STATISTICS                                                    │
│    STATS[persistence_findings] │ Total persistence indicators                      │
│    STATS[persistence_registry_run] │ Registry run keys                             │
│    STATS[persistence_services] │ Suspicious services                               │
│    STATS[persistence_tasks]    │ Scheduled task anomalies                          │
│    STATS[persistence_startup]  │ Startup folder entries                            │
│    STATS[persistence_wmi]      │ WMI subscriptions                                 │
│                                                                                     │
│  EXECUTION ARTIFACT STATISTICS                                                      │
│    STATS[execution_findings]   │ Total execution indicators                        │
│    STATS[execution_prefetch]   │ Suspicious prefetch entries                       │
│    STATS[execution_amcache]    │ Amcache anomalies                                 │
│    STATS[execution_shimcache]  │ Shimcache entries                                 │
│    STATS[execution_userassist] │ UserAssist records                                │
│    STATS[execution_srum]       │ SRUM entries (network/energy usage)               │
│    STATS[execution_bam]        │ BAM/DAM records                                   │
│                                                                                     │
│  FILE ANOMALY STATISTICS                                                            │
│    STATS[file_anomalies]       │ Total anomalies detected                          │
│    STATS[file_timestomping]    │ Timestomped files                                 │
│    STATS[file_ads]             │ Files with Alternate Data Streams                 │
│    STATS[file_extension_mismatch] │ Magic/extension mismatches                     │
│    STATS[file_suspicious_paths]│ Files in unusual locations                        │
│    STATS[file_packed]          │ Packed executables                                │
│                                                                                     │
│  RE TRIAGE STATISTICS                                                               │
│    STATS[re_triaged_files]     │ Files analyzed                                    │
│    STATS[re_packed_files]      │ Packed files detected                             │
│    STATS[re_suspicious_imports]│ Dangerous API imports found                       │
│    STATS[re_capa_matches]      │ MITRE ATT&CK techniques                           │
│    STATS[re_shellcode_detected]│ Potential shellcode count                         │
│                                                                                     │
│  FILESYSTEM FORENSICS STATISTICS                                                    │
│    STATS[mft_deleted_recovered]│ Deleted files found via MFT                       │
│    STATS[mft_timestomping]     │ $SI/$FN timestamp anomalies                       │
│    STATS[usn_entries]          │ USN journal entries parsed                        │
│    STATS[filesystem_anomalies] │ Filesystem inconsistencies                        │
│                                                                                     │
╰────────────────────────────────────────────────────────────────────────────────────╯
```

### The Scan Processing Pipeline

Every scan follows a deterministic pipeline, ensuring consistent and complete analysis:

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                          DMS SCAN PROCESSING PIPELINE                                 │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  PHASE 1: INPUT VALIDATION                                                            │
│  ─────────────────────────────────────────────────────────────────────────────────── │
│  ┌──────────────────┐                                                                │
│  │ Detect input type│───► block device? ───► /dev/sda, /dev/nvme0n1                 │
│  │ (auto/manual)    │───► EWF image?    ───► .E01, .Ex01 (ewfmount)                 │
│  └──────────────────┘───► raw image?    ───► .dd, .raw, .img                        │
│           │                                                                          │
│           ▼                                                                          │
│  ┌──────────────────┐                                                                │
│  │ Mount if needed  │───► EWF: ewfmount → /tmp/ewf_mount                            │
│  │ (read-only!)     │───► --verify-hash: Validate image integrity                   │
│  └──────────────────┘                                                                │
│                                                                                       │
│  PHASE 2: STANDARD SCANS (always run)                                                 │
│  ─────────────────────────────────────────────────────────────────────────────────── │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐                   │
│  │ ClamAV           │  │ YARA (4 cats)    │  │ Binwalk          │                   │
│  │ scan_clamav()    │  │ scan_yara()      │  │ scan_binwalk()   │                   │
│  │ ~1M signatures   │  │ ~3,200 rules     │  │ embedded files   │                   │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘                   │
│           │                     │                      │                             │
│           │    ┌────────────────┴────────────────┐     │                             │
│           └────┤   Parallel if --parallel flag   ├─────┘                             │
│                └────────────────┬────────────────┘                                   │
│                                 ▼                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │ scan_strings() ─── Extract IOCs: URLs, executables, credentials, keywords    │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                       │
│  PHASE 3: QUICK MODE (if --quick)                                                     │
│  ─────────────────────────────────────────────────────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │ Sample-based rapid assessment ─── ~5 minutes for 500GB                        │   │
│  │ Scans representative chunks, generates confidence-weighted results            │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                       │
│  PHASE 4: DEEP SCANS (if --deep)                                                      │
│  ─────────────────────────────────────────────────────────────────────────────────── │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐         │
│  │ scan_entropy()│  │ scan_file_   │  │ scan_        │  │ scan_boot_   │         │
│  │ Shannon       │  │ carving()    │  │ executables()│  │ sector()     │         │
│  │ entropy       │  │ foremost     │  │ PE/ELF hunt  │  │ MBR/VBR      │         │
│  └───────────────┘  └───────────────┘  └───────────────┘  └───────────────┘         │
│         │                  │                  │                  │                   │
│         └──────────────────┴──────────────────┴──────────────────┘                   │
│                                    │                                                 │
│  ┌───────────────┐  ┌───────────────┐                                               │
│  │ scan_bulk_   │  │ scan_hashes()│                                               │
│  │ extractor()  │  │ MD5/SHA/ssdeep│                                               │
│  └───────────────┘  └───────────────┘                                               │
│                                                                                       │
│  PHASE 5: SLACK SPACE (if --slack or --scan-mode slack)                               │
│  ─────────────────────────────────────────────────────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │ extract_slack_space() ─── Sleuth Kit's blkls                                  │   │
│  │       ↓                                                                       │   │
│  │ Reconstruct deleted files ─── foremost on extracted slack                     │   │
│  │       ↓                                                                       │   │
│  │ Scan recovered data ─── ClamAV + YARA on carved files                         │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                       │
│  PHASE 6: FORENSIC ANALYSIS (if --forensic-analysis)                                  │
│  ─────────────────────────────────────────────────────────────────────────────────── │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                      │
│  │ scan_persistence│  │ scan_execution_ │  │ scan_file_     │                      │
│  │ _artifacts()    │  │ artifacts()     │  │ anomalies()    │                      │
│  │ Registry, Tasks │  │ Prefetch, SRUM  │  │ Timestomping   │                      │
│  │ Services, WMI   │  │ Amcache, BAM    │  │ ADS, Magic     │                      │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                      │
│         │                     │                     │                               │
│         └─────────────────────┴─────────────────────┘                               │
│                              │                                                       │
│  ┌─────────────────┐  ┌─────────────────┐                                           │
│  │ scan_re_triage()│  │ scan_filesystem_│                                           │
│  │ Imports, Capa   │  │ forensics()     │                                           │
│  │ Shellcode       │  │ MFT, USN Journal│                                           │
│  └─────────────────┘  └─────────────────┘                                           │
│                                                                                       │
│  PHASE 7: OPTIONAL ENHANCEMENTS                                                       │
│  ─────────────────────────────────────────────────────────────────────────────────── │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │ --virustotal  ───► scan_virustotal() ───► Hash reputation lookup              │  │
│  │ --rootkit     ───► scan_rootkit() ───► chkrootkit/rkhunter (needs mount)      │  │
│  │ --timeline    ───► generate_timeline() ───► fls + mactime                     │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                       │
│  PHASE 8: REPORT GENERATION                                                           │
│  ─────────────────────────────────────────────────────────────────────────────────── │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐                            │
│  │ Text Report   │  │ HTML Report   │  │ JSON Report   │                            │
│  │ (always)      │  │ (if --html)   │  │ (if --json)   │                            │
│  │ scan_report   │  │ Styled,       │  │ SIEM-ready,   │                            │
│  │ _TIMESTAMP.txt│  │ interactive   │  │ automatable   │                            │
│  └───────────────┘  └───────────────┘  └───────────────┘                            │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Part XV: Open Questions

Building DMS has surfaced questions I haven't fully answered. These are the frontiers where the tool's current capabilities meet the limits of what's possible.

### The Encryption Problem

Full-disk encryption (BitLocker, LUKS, FileVault) is increasingly standard. When a drive is encrypted:

- DMS can detect the encryption (entropy analysis, partition signatures)
- DMS cannot analyze the encrypted contents without keys
- Deleted files inside the encrypted volume are truly unrecoverable without decryption

As encryption becomes ubiquitous, what happens to disk-level forensics?

**Possible futures**:
1. Legal frameworks force key disclosure (controversial, varies by jurisdiction)
2. Memory forensics becomes primary (capture keys from RAM)
3. Cloud/endpoint telemetry replaces disk analysis
4. Cold boot attacks for key recovery (highly specialized)

DMS currently reports encrypted volumes as a finding, enabling investigators to pursue appropriate key recovery procedures. But the trend is clear: raw disk analysis assumes access to plaintext storage, and that assumption is eroding.

### The Cloud Migration

Modern attacks increasingly target cloud infrastructure. The evidence lives in:
- API logs (AWS CloudTrail, Azure Activity Log)
- Ephemeral containers (no persistent disk)
- SaaS application logs (Google Workspace, Microsoft 365)
- Network flow data

DMS's entire paradigm assumes local storage. Is that paradigm becoming obsolete?

**My current thinking**: Hybrid. Local workstations still matter (they're where phishing lands, where documents are edited, where credentials are cached). But a complete forensic capability needs cloud log analysis alongside disk forensics. DMS handles the disk; other tools handle the cloud.

### The AI Arms Race

Both detection and evasion are becoming ML-driven:

**Attackers use AI for**:
- Generating polymorphic malware
- Creating realistic phishing content
- Automating attack adaptation
- Evading sandbox detection

**Defenders use AI for**:
- Anomaly detection beyond signatures
- Behavioral analysis
- Automated threat hunting
- Predictive indicators

Where does a rule-based tool like DMS fit in this landscape?

**My answer**: AI augments but doesn't replace traditional analysis. YARA rules catch what ML models might miss due to training bias. Entropy analysis is mathematically grounded, not dependent on training data. File carving is deterministic. The detection gauntlet approach---many complementary techniques---remains valid even as individual techniques evolve.

### The Ephemeral Malware Problem

Modern malware increasingly lives only in memory. Fileless attacks use:
- PowerShell in-memory execution
- Reflective DLL injection
- Living-off-the-land binaries (LOLBins)
- Process hollowing

If malware never touches disk, DMS can't find it directly. However:
- Execution artifacts (Prefetch, Amcache) still record that *something* ran
- PowerShell logging captures script blocks
- Memory forensics (separate discipline) captures runtime state
- Persistence mechanisms often require disk writes

DMS finds the traces that even fileless attacks leave behind. It's not a memory forensics tool, but it complements memory analysis by providing the disk-level view.

---

## Part XVI: Getting Started

### Quickstart: 60 Seconds to First Scan

```bash
# Clone the repository
git clone https://github.com/Samuele95/dms.git
cd dms

# Run with auto-downloading tools (requires network)
sudo ./malware_scan.sh --interactive --portable

# DMS will:
# 1. Download required tools to /tmp/malscan_portable_tools
# 2. Present an interactive menu
# 3. Guide you through scan configuration
# 4. Generate reports in your chosen format
```

### Building a USB Kit

For situations where you can't or don't want to install software:

```bash
# Minimal kit (downloads tools on first use, ~10 MB)
sudo ./malware_scan.sh --build-minimal-kit --kit-target /media/your-usb

# Full kit (completely offline, ~1.2 GB)
sudo ./malware_scan.sh --build-full-kit --kit-target /media/your-usb
```

### Building the Forensic ISO

For maximum forensic integrity:

```bash
# Build the ISO
sudo ./malware_scan.sh --build-iso --iso-output ~/dms-forensic.iso

# Flash to USB (replace sdX with your USB device)
sudo dd if=~/dms-forensic.iso of=/dev/sdX bs=4M status=progress sync

# Boot target system from USB, evidence drive appears as raw block device
```

### Documentation

- **[README](https://github.com/Samuele95/dms)**: Quick start, features, use cases
- **[WIKI](https://github.com/Samuele95/dms/blob/main/WIKI.md)**: Complete technical reference (~75 KB)
- **[Configuration](https://github.com/Samuele95/dms/blob/main/malscan.conf)**: Example config with all options documented

---

## Part XVII: The Philosophy of Forensics

I want to end with something larger than the tool itself.

### The Principle of Primary Sources

Every layer of abstraction in computing is a trade-off. The operating system abstracts hardware. The filesystem abstracts storage. Applications abstract the operating system. Each layer translates complexity into convenience.

But each layer also translates *reality* into *representation*. And representations can diverge from reality.

When you ask "what's on this disk?", you're usually asking the filesystem. The filesystem is a helpful intermediary---without it, you'd be reading raw sectors by hand. But it's also a potential point of deception. Attackers exploit this gap. They hide in the difference between what the filesystem reports and what the hardware contains.

Forensics, at its core, is about closing that gap. It's about reading the primary sources---the actual bytes on the disk---rather than trusting intermediaries. It's about treating every abstraction layer as potentially compromised until verified otherwise.

### The Map and the Territory

This principle extends beyond forensics.

In security: Don't trust the logs; verify the underlying systems.
In science: Don't trust the summary; read the original data.
In epistemology: Don't trust the narrative; examine the primary sources.

The abstraction is not the reality. The map is not the territory. And sometimes, the difference between them is where the attackers live.

### Why This Matters

We live in a world of increasing abstraction. Cloud services hide infrastructure. APIs hide implementation. AI models hide reasoning. Each layer makes things easier to use and harder to understand.

This is fine for most purposes. You don't need to understand TCP/IP to send an email. You don't need to understand filesystems to save a document.

But when something goes wrong---when security matters, when truth matters, when the stakes are high---you need to be able to peel back the abstractions and look at what's actually there.

DMS is a tool for peeling back one specific abstraction: the filesystem's view of storage. It looks at the raw bytes and tells you what's actually present, not what the filesystem claims is present.

That capability---the ability to bypass abstractions when necessary---is increasingly rare and increasingly valuable. Most users never need it. Forensic investigators always need it. And the gap between "what the system shows" and "what's actually there" is exactly where the most sophisticated threats operate.

---

*DMS is open source under the MIT license. It's designed for forensic Linux distributions like Tsurugi but runs on any Linux system. The code, documentation, and signature databases are all freely available.*

*Find it at [github.com/Samuele95/dms](https://github.com/Samuele95/dms).*

*Contributions, bug reports, and feature requests are welcome. The best forensic tools are built by communities, not individuals.*

