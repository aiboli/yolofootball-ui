export function calculateCombinedOdd(selectedEvents = []) {
  if (!selectedEvents.length) {
    return 0;
  }

  // Accumulator odds are the product of each selected market.
  return selectedEvents.reduce((total, event) => {
    return total * (parseFloat(event.odd) || 1);
  }, 1);
}

export function calculatePotentialWin(totalBet, selectedEvents = []) {
  const normalizedBet = parseFloat(totalBet) || 0;
  const combinedOdd = calculateCombinedOdd(selectedEvents);

  return normalizedBet * combinedOdd;
}
