# DocuScan — AI-Powered Credit Card Statement Parser

DocuScan is a modern web application that extracts key financial data from credit card PDF statements using intelligent regex-based parsing. Built with Next.js, React, Tailwind CSS, and pdfjs-dist.

## Features

- **Multi-Issuer Support**: Works with Chase, American Express, Citi, Bank of America, and Capital One statements
- **Fast Extraction**: Parses PDFs and extracts data in seconds
- **Privacy-First**: Files processed in memory — no storage or tracking
- **Beautiful UI**: Dark theme with vibrant gradients, modern animations, and responsive design
- **Real-time Progress**: Visual upload progress indicator with status updates
- **Auto-Scroll**: Results automatically scroll into view for seamless UX

### Extracted Fields
- **Issuer**: Credit card company name
- **Card Last 4**: Final 4 digits of account number
- **Billing Cycle**: Statement period (opening/closing dates)
- **Payment Due Date**: When payment is due
- **Total Balance**: Current account balance

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development Server

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the site.

### Build for Production

```bash
npm run build
npm start
```

## Testing & Development

### Run Parser Tests

Test the parser against all sample statements (text parsing only):

```bash
npm test
# or
node src/parser/test-runner.mjs
```

**Output**: Tests all 6 sample statements (5 major issuers + student handout) and displays parsed JSON for each.

Example output:
```
--- TEXT: amex.txt
{
  "issuer": "American Express",
  "card_last4": "4321",
  "billing_cycle": "Sep 01, 2025 - Sep 30, 2025",
  "payment_due_date": "Oct 22, 2025",
  "total_balance": "234.56"
}
```

### Sample Statements

Sample credit card statement text files are provided in `src/parser/sample-statements/`:

```
src/parser/sample-statements/
├── amex.txt               # American Express sample
├── boa.txt                # Bank of America sample
├── capitalone.txt         # Capital One sample
├── chase.txt              # Chase sample
├── citi.txt               # Citi sample
└── student-handout.txt    # Student handout example
```

## Website Usage

### Uploading a Statement

1. **Visit the homepage** at http://localhost:3000 (or your deployed URL)
2. **Drop a PDF** into the upload box or click "Choose file" to browse
3. **Watch progress** as your file uploads and is parsed
4. **View results** in the "Extraction Results" section below

### Using the Sample PDF

Click the **"Use sample"** button to generate a demo PDF and see the parser in action instantly.

### Results Display

Parsed data is displayed in human-readable format:

```
Issuer: Chase
Card last 4: 1234
Billing cycle: 11/27/XX - 12/26/XX
Payment due date: 1/23/XX
Total balance: 1392.71
```

Missing fields show as "N.A." for clarity.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout with Tailwind setup
│   ├── page.tsx             # Landing page (hero + uploader + results)
│   ├── globals.css          # Global Tailwind styles
│   └── api/
│       └── parse/
│           └── route.js     # /api/parse endpoint (Node.js runtime)
├── components/
│   └── Uploader.tsx         # PDF upload component (client-side)
└── parser/
    ├── parser.mjs           # Core parsing logic (text + PDF)
    ├── patterns.mjs         # Regex patterns per issuer
    ├── pdf-parse-wrapper.mjs # Fallback wrapper for pdf-parse
    ├── test-runner.mjs      # Integration test harness
    └── sample-statements/   # Sample PDF texts for testing
```

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4 with custom dark theme
- **PDF Extraction**: pdfjs-dist (primary), pdf-parse (fallback)
- **PDF Generation** (demo): pdf-lib
- **Language**: TypeScript
- **Build Tool**: Turbopack/Webpack

## API Reference

### POST /api/parse

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: File field named `file` (PDF only)

**Response:**
```json
{
  "issuer": "Chase",
  "card_last4": "1234",
  "billing_cycle": "11/27/XX - 12/26/XX",
  "payment_due_date": "1/23/XX",
  "total_balance": "1392.71"
}
```

**Error Response:**
```json
{
  "error": "PDF parsing failed..."
}
```

## Adding a New Issuer

1. Add regex patterns to `src/parser/patterns.mjs`:
   ```javascript
   {
     issuer: 'Your Bank',
     cardLast4: /Account.*?(\d{4})/i,
     billingCycle: /Period.*?([0-9\/]+).*?to.*?([0-9\/]+)/i,
     dueDate: /Due.*?([0-9\/]+)/i,
     total: /Balance.*?\$([0-9,]+\.\d{2})/i
   }
   ```

2. Create a sample statement in `src/parser/sample-statements/yourbank.txt`

3. Run `npm test` to verify parsing works

## Deployment

### Deploy to Vercel

The easiest way to deploy is via [Vercel](https://vercel.com/new):

1. Push your repository to GitHub
2. Connect your repo to Vercel
3. Vercel auto-detects Next.js and deploys automatically

**Environment Notes:**
- The parser works in Vercel's Node.js runtime
- pdfjs-dist is used for PDF extraction (Linux compatible)
- pdf-parse serves as a fallback on module path differences

## Troubleshooting

### "PDF parsing failed" error
- Ensure the PDF is a valid text-based PDF (not scanned images)
- Try a different statement format

### "Cannot find module '@pdf-lib/standard-fonts'"
- This only affects local testing on Windows (npm TAR extraction issue)
- Tests gracefully skip PDF generation and test text parsing instead
- Vercel deployment is not affected (uses Linux)

### No results extracted
- Check if the statement format matches one of the 5 supported issuers
- Fields shown as "N.A." indicate parsing didn't find that specific data

## Performance

- **Text Extraction**: <100ms per PDF page
- **Parsing**: <50ms per statement
- **Total Time**: Typically <500ms for average statement

## Security & Privacy

- Files are **never stored** — processed in memory only
- No analytics or tracking
- No data sent to external services
- Safe for demo purposes (do not use with real sensitive data)

## License

MIT

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [pdfjs-dist](https://github.com/mozilla/pdf.js)

---

**Built for the assignment — demo only. Do not use with real sensitive financial data.**
