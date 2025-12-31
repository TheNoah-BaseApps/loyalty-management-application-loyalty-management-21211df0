export default function TierProgressBar({ currentPoints, nextTierPoints, currentTier, nextTier }) {
  const progress = nextTierPoints > 0 ? Math.min((currentPoints / nextTierPoints) * 100, 100) : 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium capitalize">{currentTier}</span>
        <span className="text-gray-600">{currentPoints} / {nextTierPoints} points</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {nextTier && (
        <p className="text-xs text-gray-500">
          {nextTierPoints - currentPoints} points to {nextTier}
        </p>
      )}
    </div>
  );
}