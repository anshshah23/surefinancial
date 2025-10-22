// Issuer-specific regex patterns and extractors
export const patterns = [
  {
    issuer: 'Chase',
    // examples: "Card Ending in 1234", or account formats like "Account Number: 12345-67-8907"
    cardLast4: /(?:Card\s+Ending\s+in|Ending\s+in|Account\s+Number)[:\s]*[\*\d\s-]*?(\d{4})/i,
  billingCycle: /(?:Opening\/Closing Date|Billing\s+Period|Statement\s+Period)[:\s]*([0-9A-Za-z\/\-,\s]+?)\s*(?:-|–|—|to)\s*([0-9A-Za-z\/\-,\s]+)/i,
    dueDate: /Payment\s+(?:Due\s+Date|Due|Due\s+By)[:\s]*([0-9A-Za-z\/\-, ]+)/i,
    total: /New\s+Balance[:\s]+\$?([0-9,]+\.\d{2})/i
  },
  {
    issuer: 'American Express',
    cardLast4: /Account\s+ending\s+in\s*(\d{4})/i,
  billingCycle: /(?:Statement\s+Period|Opening\/Closing Date)[:\s]*([0-9A-Za-z\/\-,\s]+?)\s*(?:-|–|—|to)\s*([0-9A-Za-z\/\-,\s]+)/i,
    dueDate: /Payment\s+Due\s+By[:\s]*([0-9A-Za-z\/\-, ]+)/i,
    total: /Total\s+Amount\s+Due[:\s]+\$?([0-9,]+\.\d{2})/i
  },
  {
    issuer: 'Citi',
    cardLast4: /Ending\s+Account\s+Number[:\s]*[\*\d\s-]*?(\d{4})/i,
  billingCycle: /For\s+period\s+([0-9A-Za-z\/\-,\s]+?)\s+(?:to|-)\s*([0-9A-Za-z\/\-,\s]+)/i,
    dueDate: /Payment\s+Due\s+Date[:\s]*([0-9A-Za-z\/\-, ]+)/i,
    total: /Previous\s+Balance[:\s]+\$?([0-9,]+\.\d{2})/i
  },
  {
    issuer: 'Bank of America',
    cardLast4: /Account\s+Number[:\s]*[\*\d\s-]*?(\d{4})/i,
  billingCycle: /(?:Statement\s+Period|Opening\/Closing Date)[:\s]*([0-9A-Za-z\/\-,\s]+?)\s*(?:-|–|—|to)\s*([0-9A-Za-z\/\-,\s]+)/i,
    dueDate: /Payment\s+Due[:\s]*([0-9A-Za-z\/\-, ]+)/i,
    total: /Total\s+Due[:\s]+\$?([0-9,]+\.\d{2})/i
  },
  {
    issuer: 'Capital One',
    cardLast4: /\*{4}\s*(\d{4})|Account\s+Number[:\s]*[\*\d\s-]*?(\d{4})/i,
  billingCycle: /Statement\s+Date[:\s]*([0-9A-Za-z\/\-,\s]+?)\s*(?:-|–|—|to)\s*([0-9A-Za-z\/\-,\s]+)/i,
    dueDate: /Payment\s+Due\s+Date[:\s]*([0-9A-Za-z\/\-, ]+)/i,
    total: /New\s+Balance[:\s]+\$?([0-9,]+\.\d{2})/i
  }
  ,
  // Generic fallback patterns
  {
    issuer: 'Generic',
    cardLast4: /Account\s+Number[:\s]*[\*\d\s-]*?(\d{4})/i,
  billingCycle: /(?:Opening\/Closing Date|Billing\s+Period|Statement\s+Period|For\s+period)[:\s]*([0-9A-Za-z\/\-,\s]+?)\s*(?:-|–|—|to)\s*([0-9A-Za-z\/\-,\s]+)/i,
    dueDate: /Payment(?:\s+Due\s+Date|\s+Due|\s+Due\s+By)[:\s]*([0-9A-Za-z\/\-, ]+)/i,
    total: /New\s+Balance[:\s]+\$?([0-9,]+\.\d{2})/i
  }
];
