document.addEventListener('DOMContentLoaded', () => {
    const bookingForm = document.getElementById('bookingForm');
    const priceOutput = document.getElementById('calculatedPrice');
    const errorMsg = document.getElementById('errorMsg');
    const appointmentDate = document.getElementById('appointmentDate');

    // Set minimum appointment date to today
    appointmentDate.min = new Date().toISOString().split('T')[0];

    // Pricing configuration
    const basePrice = 800;
    const additionalPricePer10Min = 200;

    function calculatePrice() {
        const duration = parseInt(document.getElementById('duration').value, 10) || 60;
        let price = basePrice;
        if (duration > 60) {
            price += Math.ceil((duration - 60) / 10) * additionalPricePer10Min;
        }
        priceOutput.value = `₱${price.toFixed(2)}`;
        priceOutput.textContent = `₱${price.toFixed(2)}`;
        return price;
    }

    bookingForm.addEventListener('input', calculatePrice);

    function validateForm() {
        let valid = true;
        errorMsg.textContent = '';
        Array.from(bookingForm.elements).forEach(el => el.classList.remove('error'));

        const requiredFields = [
            'fullName', 'email', 'phone', 'address', 'dob', 'serviceType',
            'duration', 'appointmentDate', 'appointmentTime', 'concerns', 'consent'
        ];

        for (const field of requiredFields) {
            const input = bookingForm[field];
            if (!input || (input.type === "checkbox" ? !input.checked : !input.value.trim())) {
                input.classList.add('error');
                errorMsg.textContent = `Please fill out the ${field.replace(/([A-Z])/g, ' $1')}.`;
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
        const phonePattern = /^\+?[0-9\s\-]{7,15}$/;
        if (phone && !phonePattern.test(phone)) {
            bookingForm.phone.classList.add('error');
            errorMsg.textContent = 'Please enter a valid phone number.';
            bookingForm.phone.focus();
            valid = false;
        }

        return valid;
    }

    bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (validateForm()) {
            errorMsg.textContent = '';

            // Collect booking data
            const bookingData = {
                fullName: bookingForm.fullName.value,
                email: bookingForm.email.value,
                phone: bookingForm.phone.value,
                address: bookingForm.address.value,
                dob: bookingForm.dob.value,
                vulnerableSegment: bookingForm.vulnerableSegment.value,
                areaType: bookingForm.areaType.value,
                serviceType: bookingForm.serviceType.value,
                duration: bookingForm.duration.value,
                appointmentDate: bookingForm.appointmentDate.value,
                appointmentTime: bookingForm.appointmentTime.value,
                concerns: bookingForm.concerns.value,
                goals: bookingForm.goals.value,
                calculatedPrice: priceOutput.textContent
            };

            // Send booking data to backend for email
            fetch('/api/sendBookingEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    errorMsg.textContent = 'Booking submitted and summary email sent!';
                    bookingForm.reset();
                    priceOutput.textContent = '₱800.00';
                } else {
                    errorMsg.textContent = 'Booking submitted, but email sending failed.';
                }
            })
            .catch(err => {
                errorMsg.textContent = 'Booking submitted, but there was an error sending email.';
            });
        }
    });
});
