document.getElementById('bookingForm').addEventListener('submit', e => {
  e.preventDefault();
   
    <!-- Dynamic Price Calculation & Form Validation -->
    <script>
    // Accessibility and usability improvement: Set min date for appointment (today)
    document.addEventListener('DOMContentLoaded', () => {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('appointmentDate').setAttribute('min', today);

        // Dynamic price calculation (refactored and unified logic)
        const form = e.target;
        const time = form.consultTime.value;
        const hour = parseInt(time.split(':')[0]);
        const durationInput = document.getElementById('duration');
        const priceOutput = document.getElementById('calculatedPrice');
        const vulnerableSegmentInput = document.getElementById('vulnerableSegment');
        const areaTypeInput = document.getElementById('areaType');
        const discountInfo = document.getElementById('discountInfo');

        function calculatePrice() {
            let duration = parseInt(durationInput.value, 10) || 60;
            let base = 800;
            let extra = duration > 60 ? (duration - 60) * 200 : 0;
            let total = base + extra;
            let discountNotice = '';

            // Vulnerable segment discount
            const vulnerableSegments = [
                'student', 'school_leaver', 'solo_parent', 'elderly', 'pwd',
                'low_income_family', 'victims_of_disasters', 'informal_settler', 'lgbtq+'
            ];
            let vulnerableSegment = vulnerableSegmentInput.value;
            if (vulnerableSegments.includes(vulnerableSegment)) {
                total *= 0.85; // 15% discount
                discountNotice += '15% discount applied for selected segment. ';
            }

            // Area type price adjustment
            if (areaTypeInput.value === 'huc') {
                total *= 1.05; // 5% increase
                discountNotice += '5% price increase for HUC area.';
            }
  // Discount rates by subsidy type
  const subsidyRates = {
    "low-income": 0.5,
    student: 0.3,
    pwd: 0.7,
    none: 1.0
  };

  // Simulate ML model predicting price based on date/time (Time Series)
  function predictPriceBasedOnTime(dateStr, timeStr) {
    const date = new Date(`${dateStr}T${timeStr}`);
    const hour = date.getHours();
    let multiplier = 1.0;

    if (hour >= 8 && hour < 12) multiplier = 0.9; // Morning discount
    else if (hour >= 12 && hour < 14) multiplier = 1.1; // Lunch peak
    else if (hour >= 18 && hour <= 20) multiplier = 1.2; // Evening rush

    return multiplier;
  }

  // Dynamic pricing engine
  function calculateFinalPrice(serviceType, dateStr, timeStr, subsidyType) {
    let price = basePrices[serviceType];

    // Apply time-based multiplier
    const timeMultiplier = predictPriceBasedOnTime(dateStr, timeStr);
    price *= timeMultiplier;

    // Apply subsidy
    const subsidyDiscount = subsidyRates[subsidyType];
    price *= subsidyDiscount;

    return Math.round(price);
  }

  form.addEventListener("submit", e => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    const finalPrice = calculateFinalPrice(
      data["service-type"],
      data["Preferred Date"],
      data["Preferred Time"],
      data["means-test"]
    );

    result.textContent = `Your Final Price: ₱${finalPrice}`;
  });

  // Fade-in animation
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
});
            // Accessibility: update discount info with aria-live
            discountInfo.textContent = discountNotice;

            // Output price, accessible and visible
            priceOutput.value = `₱${total.toFixed(2)}`;
            priceOutput.textContent = `₱${total.toFixed(2)}`;
        }

        durationInput.addEventListener('input', calculatePrice);
        vulnerableSegmentInput.addEventListener('change', calculatePrice);
        areaTypeInput.addEventListener('change', calculatePrice);
        calculatePrice();

        // Form validation with inline feedback
        const bookingForm = document.getElementById('bookingForm');
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let valid = true;
            let errorMsg = '';

            // Required fields
            const requiredFields = [
                'fullName', 'email', 'phone', 'dob',
                'serviceType', 'duration', 'appointmentDate',
                'appointmentTime', 'concerns', 'consent'
            ];
            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field.type === 'checkbox' && !field.checked) {
                    valid = false;
                    errorMsg = 'Please agree to the consent and policy.';
                } else if (!field.value) {
                    valid = false;
                    errorMsg = 'Please fill out all required fields.';
                }
            });

            // Email validation
            const email = document.getElementById('email').value;
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                valid = false;
                errorMsg = 'Please enter a valid email address.';
            }

            // Phone validation
            const phone = document.getElementById('phone').value;
            if (phone && !/^\+?[0-9\s\-]{7,15}$/.test(phone)) {
                valid = false;
                errorMsg = 'Please enter a valid phone number.';
            }

            // Visual feedback for errors
            if (!valid) {
                document.getElementById('errorMsg').textContent = errorMsg;
                document.getElementById('errorMsg').focus();
                return;
            }

            // Clear errors and simulate submission
            document.getElementById('errorMsg').textContent = '';
            bookingForm.reset();
            calculatePrice();
            alert('Your appointment has been booked! We will contact you soon.');
        });
    });
