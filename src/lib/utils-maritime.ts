export function getSeverityColor(severity: string | undefined | null) {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return 'text-red-500 bg-red-900/30 border-red-500/20';
    case 'high':
      return 'text-orange-400 bg-orange-900/30 border-orange-500/20';
    case 'medium':
    case 'warning':
      return 'text-amber-400 bg-amber-900/30 border-amber-500/20';
    case 'low':
    case 'info':
    default:
      return 'text-sky-400 bg-sky-900/30 border-sky-500/20';
  }
}

export function formatCoordinate(coord: number, isLat: boolean): string {
  const dir = isLat ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
  const val = Math.abs(coord).toFixed(4);
  return `${val}\u00B0 ${dir}`;
}

export function formatRiskScore(score: number): string {
  return (score * 100).toFixed(0);
}

export function getRiskColor(score: number): string {
  if (score >= 0.75) return 'bg-red-500';
  if (score >= 0.4) return 'bg-amber-400';
  return 'bg-green-500';
}