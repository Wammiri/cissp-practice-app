/** CISSP exam domain weights (verbatim from the syllabus). */
export const DOMAIN_WEIGHTS: { number: number; name: string; weight: number }[] = [
  { number: 1, name: 'Security and Risk Management', weight: 16 },
  { number: 2, name: 'Asset Security', weight: 10 },
  { number: 3, name: 'Security Architecture and Engineering', weight: 13 },
  { number: 4, name: 'Communication and Network Security', weight: 13 },
  { number: 5, name: 'Identity and Access Management (IAM)', weight: 13 },
  { number: 6, name: 'Security Assessment and Testing', weight: 12 },
  { number: 7, name: 'Security Operations', weight: 13 },
  { number: 8, name: 'Software Development Security', weight: 10 },
];

export function weightFor(domainNumber: number): number {
  return DOMAIN_WEIGHTS.find((d) => d.number === domainNumber)?.weight ?? 0;
}

export function shortDomainName(name: string): string {
  return name.replace(/\s*\(IAM\)\s*/, ' ').trim();
}
