import PlayersManager from '@/components/PlayersManager';

export default function PlayersPage() {
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>Spelers</h1>
      <PlayersManager />
    </div>
  );
}
