import TestRunner from '@/components/TestRunner';

// Static params for export — the 10 weighted tests.
export function generateStaticParams() {
  return Array.from({ length: 10 }, (_, i) => ({ testId: `test-${String(i + 1).padStart(2, '0')}` }));
}

export default function TakeTestPage({ params }: { params: { testId: string } }) {
  return <TestRunner testId={params.testId} />;
}
