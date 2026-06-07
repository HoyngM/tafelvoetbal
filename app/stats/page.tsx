import StatsView from '@/components/StatsView';

export default function StatsPage() {
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Statistieken</h1>
      <StatsView />
    </div>
  );
}
