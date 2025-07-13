document.getElementById('bookingForm').addEventListener('submit', e => {
  e.preventDefault();

  const form = e.target;
  const time = form.consultTime.value;
  const hour = parseInt(time.split(':')[0]);

  const timeMultiplier = () => {
    return (hour >= 18 && hour <= 21) ? 1.2 : 1; // 20% higher price in peak hours
  };

  const subsidyRates = {
    lowIncome: 0.8,
    standard: 1,
    highRisk: 0.6
  };

  let basePrice = 1000;

  // Placeholder: regression/neural/forest (future backend)
  // Placeholder: reinforcement learning could adjust dynamically

  const price = basePrice * timeMultiplier() * subsidyRates.standard;
  document.getElementById('price').textContent = price.toFixed(0);
  let basePrice = 1000;

   alert('Booking submitted! Your preferred date & time is noted.\nDynamic price: PHP ' + price.toFixed(0));
});
