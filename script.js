// Smooth scroll animations
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".fade-up");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  sections.forEach(section => observer.observe(section));

  // Survey form interaction
  const form = document.getElementById("pulse-survey");
  const result = document.getElementById("survey-result");

  form.addEventListener("submit", e => {
    e.preventDefault();
    const slider = document.getElementById("wellbeing-slider");
    const score = parseInt(slider.value);
    const levels = ["Very Low", "Low", "Neutral", "Good", "Excellent"];
    result.textContent = `Your current well-being score: ${levels[score - 1]}`;
  });
});
