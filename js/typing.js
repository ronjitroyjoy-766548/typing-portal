// Typing Engine & Portal Scripts (Fixed WPM Bugs)

function handlePracTyping() {
    const spans = document.getElementById("pracTextDisplay").querySelectorAll("span");
    const typed = document.getElementById("pracTypingInput").value.split("");
    let correct = 0;

    spans.forEach((span, i) => {
        if (typed[i] == null) {
            span.className = "";
        } else if (typed[i] === span.innerText) {
            span.className = "highlight-correct";
            correct++;
        } else {
            span.className = "highlight-incorrect";
        }
    });

    let accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;
    document.getElementById("pracAccuracy").innerText = accuracy;
    
    let words = typed.length / 5;
    let totalSecs = (parseInt(document.getElementById("pracTimeInput").value) * 60);
    let elapsedSecs = totalSecs - pracTimeLeft;
    let elapsedMins = elapsedSecs / 60;
    
    let wpm = (elapsedMins > 0.01) ? Math.round(words / elapsedMins) : 0;
    document.getElementById("pracWpm").innerText = isFinite(wpm) ? wpm : 0;
}
