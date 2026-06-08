import TestsList from '@/components/TestsList';

export default function TestsPage() {
  return (
    <>
      <section className="page-head">
        <h1>Practice tests</h1>
        <p>Ten full-length, exam-weighted tests. Pick one to begin — your progress is saved automatically.</p>
      </section>
      <TestsList />
    </>
  );
}
