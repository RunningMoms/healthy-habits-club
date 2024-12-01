var try_again;

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

                // try again
        } else {
            queConfetti();
            signupBox.classList.remove("show");
            setTimeout(() => {
                signupBox.style.display = "none";
                successBox.style.display = "block";
                setTimeout(() => successBox.classList.add("show"), 10);
                queConfetti();
            }, 300); // Wait for hide animation
            actionButton.innerHTML = "Continue";
            currentStep = 'success';
        }
    }
}

bindEvent(window, "message", trafficJamEventHandler);


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
