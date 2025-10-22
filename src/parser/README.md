Credit Card Statement Parser

This folder contains the parser implementation and tests for extracting key fields from credit card statements for 5 issuers.

Fields extracted:
- issuer
- card_last4
- billing_cycle (start - end)
- payment_due_date
- total_balance

How it works:
- For sample statements (plain text), the parser uses issuer-specific regex heuristics.
- For PDFs, use `pdf-parse` to extract text, then run the same parser.

Run tests:
- npm install
- npm test

Add patterns:
- Update `src/parser/patterns.ts` to add or refine issuer regexes.