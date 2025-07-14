// booking-script.js

document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('bookingForm');
    const priceOutput = document.getElementById('priceOutput');
    const discountMsg = document.getElementById('discountMsg');
    const errorMsg = document.getElementById('formError');
    const appointmentDate = document.getElementById('appointmentDate');

    // Set minimum appointment date to today
    appointmentDate.min = new Date().toISOString().split('T')[0];

    // Pricing configuration
    const basePrices = {
        standard: 100,
        premium: 180,
        deluxe: 250
    };

    const discountSegments = [
        'student', 'elderly', 'lgbtq', 'veteran', 'disabled'
    ];

    const discountRate = 0.15; // 15% off for vulnerable segments
    const subsidyRate = 0.10;  // 10% additional off if subsidy is checked

    // Helper for debouncing
    function debounce(func, delay) {
        let timer;
        return function (...args) {
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Accessibility announcement
    function announceAria(element, message) {
        element.textContent = message;
        element.setAttribute('aria-live', 'polite');
    }

    // Predict price based on time (simulated ML)
    function predictPriceAdjustment(dateStr, timeStr) {
        if (!dateStr || !timeStr) return 0;
        const hour = parseInt(timeStr.split(':')[0], 10);
        if (hour >= 6 && hour < 9) return -0.10; // Morning discount
        if (hour >= 12 && hour < 14) return 0.15; // Lunch peak
        if (hour >= 17 && hour < 20) return 0.20; // Evening rush
        return 0;
    }

    // Calculate final price
    function calculateFinalPrice() {
        // Get form values
        const serviceType = bookingForm.serviceType.value;
        const vulnerableSegment = discountSegments.some(
            seg => bookingForm[seg] && bookingForm[seg].checked
        );
        const isSubsidy = bookingForm.subsidy && bookingForm.subsidy.checked;
        const appointmentDateVal = appointmentDate.value;
        const appointmentTimeVal = bookingForm.appointmentTime.value;

        let price = basePrices[serviceType] || basePrices.standard;
        let discount = 0;
        let messages = [];

        // Segment discount
        if (vulnerableSegment) {
            discount += discountRate;
            messages.push('Vulnerable segment discount applied.');
        }

        // Subsidy discount
        if (isSubsidy) {
            discount += subsidyRate;
            messages.push('Community subsidy applied.');
        }

        // ML time adjustment
        const timeAdjustment = predictPriceAdjustment(appointmentDateVal, appointmentTimeVal);
        if (timeAdjustment < 0) {
            messages.push('Morning slot discount applied.');
        } else if (timeAdjustment > 0) {
            messages.push('Peak/rush hour adjustment applied.');
        }

        // Apply all adjustments
        price = price * (1 - discount);
        price += price * timeAdjustment;

        // Output price, rounded to 2 decimals
        priceOutput.textContent = `Estimated Price: $${price.toFixed(2)}`;
        priceOutput.setAttribute('aria-live', 'polite');

        // Show all messages for discounts
        announceAria(discountMsg, messages.join(' '));
    }

    // Validate form fields
    function validateForm() {
        let valid = true;
        errorMsg.textContent = '';
        errorMsg.setAttribute('aria-live', 'polite');

        // Remove previous error highlights
        Array.from(bookingForm.elements).forEach(el => {
            el.classList.remove('error');
        });

        // Required fields
        const requiredFields = [
            'fullName', 'email', 'phone', 'serviceType', 'appointmentDate', 'appointmentTime'
        ];

        for (const field of requiredFields) {
            const input = bookingForm[field];
            if (!input || !input.value.trim()) {
                input.classList.add('error');
                errorMsg.textContent = `Please fill out the ${input.getAttribute('aria-label') || field} field.`;
                input.focus();
                valid = false;
                break;
            }
        }

        // Email validation
        const email = bookingForm.email.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailPattern.test(email)) {
            bookingForm.email.classList.add('error');
            errorMsg.textContent = 'Please enter a valid email address.';
            bookingForm.email.focus();
            valid = false;
        }

        // Phone validation
        const phone = bookingForm.phone.value.trim();
        const phonePattern = /^\+?\d{7,15}$/;
        if (phone && !phonePattern.test(phone)) {
            bookingForm.phone.classList.add('error');
            errorMsg.textContent = 'Please enter a valid phone number.';
            bookingForm.phone.focus();
            valid = false;
        }

        return valid;
    }

    // Debounced price calculation on input change
    const debouncedPriceCalc = debounce(calculateFinalPrice, 250);

    bookingForm.addEventListener('input', debouncedPriceCalc);

    bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (validateForm()) {
            errorMsg.textContent = '';
            bookingForm.reset();
            priceOutput.textContent = '';
            discountMsg.textContent = '';
            announceAria(errorMsg, 'Booking submitted successfully!');
        }
    });

    // Animation for fade-in sections
    const fadeIns = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    fadeIns.forEach(section => observer.observe(section));
});
