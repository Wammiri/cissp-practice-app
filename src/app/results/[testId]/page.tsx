import ResultsView from '@/components/ResultsView';

export function generateStaticParams() {
  return Array.from({ length: 10 }, (_, i) => ({ testId: `test-${String(i + 1).padStart(2, '0')}` }));
}

export default function ResultsPage({ params }: { params: { testId: string } }) {
  return <ResultsView testId={params.testId} />;
}
