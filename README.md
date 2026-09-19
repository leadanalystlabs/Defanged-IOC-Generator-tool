# Defanged IOC Generator

A secure tool for sanitizing raw text from threat reports and extracting defanged IOCs.

## Features
- Sanitizes input using DOMPurify (strips all HTML/tags).
- Extracts IPs, domains, URLs, and hashes.
- Defangs sensitive strings for safe use in logs/reports.
- Copy-to-clipboard functionality for defanged values.

## Security
- No server-side processing; all logic runs client-side.
- Regex patterns are validated to avoid vulnerabilities.
- No logging of user input.

## Usage
1. Paste raw text into the textarea.
2. Click "Generate Defanged IOCs".
3. Review and copy defanged values for reports.

## Example
**Input**:
