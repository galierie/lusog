//Back-to-top button wow tenk u sidney
const backToTop = document.getElementById("back-to-top");
let topObserver = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach(entry => backToTop.style.transform = (entry.isIntersecting) ? "scale(0)" : "scale(1)");
    }
);
topObserver.observe(document.getElementsByClassName("top-observe")[0]);