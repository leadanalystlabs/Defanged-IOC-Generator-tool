# Defanged IOC Generator

A client-side tool that extracts and defangs Indicators of Compromise (IPs, domains, URLs, hashes) from raw threat-report text.

## Features
- Sanitizes input with DOMPurify before scanning.
- Extracts IPv4 addresses, domains, URLs, and hashes (MD5/SHA-1/SHA-256).
- Defangs everything except hashes.
- Per-row and copy-all clipboard buttons.
- 100% client-side — no server, no API calls, no logging.

## Usage
1. Paste raw text into the textarea.
2. Click **Generate Defanged IOCs**.
3. Copy individual rows or all results at once.
