var focus_offer_key;
var focus_offer_amount;
var try_again;
var fb_tracking_amount = 0;

var stripeHandler = StripeCheckout.configure({
    key: STRIPE_KEY,
    image: 'media/Stripe-128x128.png',
    locale: 'auto',

    opened: function () {
    },
    closed: function () {
    },

    token: function (token) {
        token.event = 'stripeToken';
        token.offer = focus_offer_key;
        broadcast(token);
    }
});

function showStripe(amount, currency, description, offer_key) {
    fb_tracking_amount = parseInt(amount);
    fbq('track', 'InitiateCheckout', {currency: "USD", value: fb_tracking_amount});

    focus_offer_amount = parseInt(amount) / 100;
    amount *= 100;
    focus_offer_key = offer_key;


    stripeHandler.open({
        name: STRIPE_TITLE,
        amount,
        currency,
        description,

        billingAddress: true,
        shippingAddress: false,
        allowRememberMe: false,
    });
}


function trafficJamEventHandler(message) {
    try {
        message = JSON.parse(message.data);
    } catch (e) {
        return;
    }

    if (typeof message.package == 'undefined' || message.package != 'trafficjam' || typeof message.message == 'undefined') {
        return;
    }

    if (message.event == "purchaseResponse") {
        if (message.http_status != 200) {

            // Reformat the errors into HTML
            let formattedErrors = `<h2>${message.message}</h2><ul>`;
            for (const errorField in message.errors) {
                const errorMessages = message.errors[errorField];
                errorMessages.forEach(errorMessage => {
                    formattedErrors += `<li style="text-align: left;"><span style="color:#dd3333;">${errorField}:</span> ${errorMessage}</li>`;
                });
            }
            formattedErrors += '</ul>';

            if (try_again != undefined) {

                Swal.fire({
                    title: 'No worries. Try one more time,<br/>then just contact me.',
                    html: formattedErrors,
                    icon: 'error',
                    confirmButtonText: 'Try Again',
                    showCancelButton: true,
                    cancelButtonText: 'Contact Carey',
                    allowOutsideClick: false,

                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#999999',

                }).then((result) => {
                    if (result.isConfirmed) {
                        showStripe(...Object.values(try_again));
                        window.try_again = undefined;
                    } else {
                        window.location.href = 'mailto:carey@runningmoms.com';
                    }
                });
            } else {
                Swal.fire({
                    title: 'No worries. Just contact me.<br/>I\'ll get you setup!',
                    html: formattedErrors,
                    icon: 'error',
                    confirmButtonText: 'Contact Carey',
                    allowOutsideClick: false,
                    confirmButtonColor: '#3085d6',
                }).then((result) => {
                    window.location.href = 'mailto:carey@runningmoms.com';
                    Swal.close();
                });
            }
        } else {
            queConfetti();
            let el = Swal.fire({
                title: 'Success!',
                text: 'Please check your email for further details.',
                icon: 'success',
                confirmButtonText: 'Close',
                confirmButtonColor: '#3085d6',
            });

            if (fb_tracking_amount > 0) {
                fbq('track', 'Purchase', {currency: "USD", value: fb_tracking_amount});
                fb_tracking_amount = 0;
            }
        }
    }
}

bindEvent(window, "message", trafficJamEventHandler);
document.addEventListener("DOMContentLoaded", function () {

    function deferImgs() {
        Array
            .from(document.querySelectorAll("img[data-src-defer]"))
            .forEach((element) => {
                element.setAttribute("src", element.dataset.srcDefer);
            });
    }
    window.addEventListener("load", deferImgs());

    // Create an intersection observer
    let observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Check if the target div is in view
            if (entry.isIntersecting) {
                // Fire the Facebook tracking
                // for(var i = 0; i < offers.length; i++) {
                //     fbq('track', 'ViewContent', {content_category: "pricing option", value: offers[i].amount, currency: "USD"});
                // }
                fbq('track', 'ViewContent', {content_category: "pricing options"});
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 }); // Adjust threshold as needed

// Target the element to observe
    let target = document.getElementById('pricing-options');
    observer.observe(target);

});

function queConfetti() {
    var canvas = document.getElementById('confetti-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = 'block';
    startConfetti();
    var interval = setInterval(function () {
        party.sparkles(canvas);
        party.sparkles(canvas);
        party.sparkles(canvas);
        party.sparkles(canvas);
    }.bind(canvas), 500);

    setTimeout(function () {
        cleanupConfetti();
        clearInterval(interval)
    }.bind(interval), 4000);

}

function cleanupConfetti() {
    var canvas = document.getElementById('confetti-canvas');
    var opacity = 1;
    var fadeInterval = setInterval(function () {
        if (opacity > 0) {
            opacity -= 0.05; // Adjust the fading speed here
            canvas.style.opacity = opacity;
        } else {
            clearInterval(fadeInterval);
            canvas.style.display = 'none';
        }
    }, 50); // Adjust the fading interval here

    // Set display to 'none' after fade out is complete
    setTimeout(function () {
        canvas.style.display = 'none';
        canvas.style.opacity = 1;
    }, 50 * 20); // Adjust the delay here (50ms * 20 = 1000ms = 1 second)
}
