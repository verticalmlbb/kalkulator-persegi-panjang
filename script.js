const calculatorForm = document.querySelector("#calculator-form");
const lengthInput = document.querySelector("#length");
const widthInput = document.querySelector("#width");
const formError = document.querySelector("#form-error");
const results = document.querySelector("#results");
const visualLength = document.querySelector("#visual-length");
const visualWidth = document.querySelector("#visual-width");
const visualRectangle = document.querySelector("#visual-rectangle");
const visualDiagonal = document.querySelector("#visual-diagonal");
const lengthDimension = document.querySelector("#length-dimension");
const widthDimension = document.querySelector("#width-dimension");
const visualDiagonalLabel = document.querySelector("#visual-diagonal-label");
const diagramDescription = document.querySelector("#diagram-description");
const areaResult = document.querySelector("#area-result");
const perimeterResult = document.querySelector("#perimeter-result");
const diagonalResult = document.querySelector("#diagonal-result");

const numberFormatter = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
});
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let rectangleAnimationFrame;

function setRectangleGeometry(left, top, shapeWidth, shapeHeight) {
    const right = left + shapeWidth;
    const bottom = top + shapeHeight;
    const widthDimensionX = left - 28;
    const widthLabelX = widthDimensionX - 15;
    const centerX = left + shapeWidth / 2;
    const centerY = top + shapeHeight / 2;

    visualRectangle.setAttribute("x", left);
    visualRectangle.setAttribute("y", top);
    visualRectangle.setAttribute("width", shapeWidth);
    visualRectangle.setAttribute("height", shapeHeight);
    visualDiagonal.setAttribute("d", `M${left} ${top} ${right} ${bottom}`);
    lengthDimension.setAttribute("d", `M${left} ${bottom + 27}H${right}`);
    widthDimension.setAttribute("d", `M${widthDimensionX} ${top}V${bottom}`);
    visualLength.setAttribute("x", centerX);
    visualWidth.setAttribute("x", widthLabelX);
    visualWidth.setAttribute("y", centerY);
    visualWidth.setAttribute("transform", `rotate(-90 ${widthLabelX} ${centerY})`);
    visualDiagonalLabel.setAttribute("x", centerX + 8);
    visualDiagonalLabel.setAttribute("y", centerY - 5);
}

function animateRectangleGeometry(targetWidth, targetHeight) {
    if (rectangleAnimationFrame) {
        cancelAnimationFrame(rectangleAnimationFrame);
    }

    const start = {
        left: Number(visualRectangle.getAttribute("x")),
        top: Number(visualRectangle.getAttribute("y")),
        width: Number(visualRectangle.getAttribute("width")),
        height: Number(visualRectangle.getAttribute("height")),
    };
    const target = {
        left: 180 - targetWidth / 2,
        top: 92 - targetHeight / 2,
        width: targetWidth,
        height: targetHeight,
    };

    if (prefersReducedMotion) {
        setRectangleGeometry(target.left, target.top, target.width, target.height);
        return;
    }

    const duration = 320;
    let startTime;

    function animate(timestamp) {
        if (startTime === undefined) {
            startTime = timestamp;
        }

        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easedProgress = 1 - (1 - progress) ** 3;
        const left = start.left + (target.left - start.left) * easedProgress;
        const top = start.top + (target.top - start.top) * easedProgress;
        const shapeWidth = start.width + (target.width - start.width) * easedProgress;
        const shapeHeight = start.height + (target.height - start.height) * easedProgress;

        setRectangleGeometry(left, top, shapeWidth, shapeHeight);

        if (progress < 1) {
            rectangleAnimationFrame = requestAnimationFrame(animate);
        } else {
            rectangleAnimationFrame = undefined;
        }
    }

    rectangleAnimationFrame = requestAnimationFrame(animate);
}

function updateRectangleLabels() {
    const length = lengthInput.valueAsNumber;
    const width = widthInput.valueAsNumber;
    const hasLength = Number.isFinite(length) && length > 0;
    const hasWidth = Number.isFinite(width) && width > 0;
    let shapeWidth = 200;
    let shapeHeight = 110;

    visualLength.textContent = hasLength ? `${numberFormatter.format(length)} cm` : "Panjang";
    visualWidth.textContent = hasWidth ? `${numberFormatter.format(width)} cm` : "Lebar";

    if (hasLength && hasWidth) {
        const largestSide = Math.max(length, width);
        const normalizedLength = length / largestSide;
        const normalizedWidth = width / largestSide;
        const scale = Math.min(220 / normalizedLength, 110 / normalizedWidth);
        shapeWidth = Math.max(2, normalizedLength * scale);
        shapeHeight = Math.max(2, normalizedWidth * scale);
        diagramDescription.textContent = `Ilustrasi persegi panjang dengan panjang ${numberFormatter.format(length)} cm dan lebar ${numberFormatter.format(width)} cm.`;
    } else {
        diagramDescription.textContent = "Ilustrasi persegi panjang dengan garis diagonal serta penanda panjang dan lebar.";
    }

    animateRectangleGeometry(shapeWidth, shapeHeight);
}

lengthInput.addEventListener("input", updateRectangleLabels);
widthInput.addEventListener("input", updateRectangleLabels);

calculatorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formError.textContent = "";

    const length = lengthInput.valueAsNumber;
    const width = widthInput.valueAsNumber;

    if (!Number.isFinite(length) || !Number.isFinite(width) || length <= 0 || width <= 0) {
        formError.textContent = "Masukkan panjang dan lebar berupa angka yang lebih dari 0.";
        results.hidden = true;
        (!Number.isFinite(length) || length <= 0 ? lengthInput : widthInput).focus();
        return;
    }

    areaResult.textContent = numberFormatter.format(length * width);
    perimeterResult.textContent = numberFormatter.format(2 * (length + width));
    diagonalResult.textContent = numberFormatter.format(Math.hypot(length, width));
    results.hidden = false;
});

calculatorForm.addEventListener("reset", () => {
    formError.textContent = "";
    results.hidden = true;
    requestAnimationFrame(updateRectangleLabels);
});