const inputs = [
    'prodFtadPercent', 'prodRadPercent', 'brandFtadPercent', 'brandFtadLimit', 
    'brandRecPercent', 'enforceBrandOverride',
    'globalFtadPercent', 'globalFtadLimit', 'globalRecPercent'
];

inputs.forEach(id => {
    document.getElementById(id).addEventListener('input', calculateMatrix);
    document.getElementById(id).addEventListener('change', calculateMatrix);
});

function calculateMatrix() {
    // Ingest parameters from text box properties
    const prodFtadPct = getNumValue('prodFtadPercent');
    const prodRadPct = getNumValue('prodRadPercent');
    
    const brandPct = getNumValue('brandFtadPercent');
    const brandLim = getNumValue('brandFtadLimit');
    const brandRec = getNumValue('brandRecPercent');
    const enforceOverride = document.getElementById('enforceBrandOverride').checked;

    const globalPct = getNumValue('globalFtadPercent') ?? 0;
    const globalLim = getNumValue('globalFtadLimit') ?? 0;
    const globalRec = getNumValue('globalRecPercent') ?? 0;

    // Update historical execution scope text notification based on switch state
    const noticeEl = document.getElementById('eligibilityNotice');
    if (enforceOverride) {
        noticeEl.innerText = "FirstTime Autoship Discount can be availed once per Brand";
    } else {
        noticeEl.innerText = "FirstTime Autoship Discount can be availed once per Product/SKU";
    }

    // -------------------------------------------------------------
    // RUN ENGINE MATRIX 1: UPFRONT CHECKOUT CALCULATOR (FTAD)
    // -------------------------------------------------------------
    let finalFtadPercent = 0;
    let ftadPercentSrc = 'None';
    let finalFtadLimit = 0;
    let ftadLimitSrc = 'None';

    // Step A: Resolve Percent Waterfall independently (Product > Brand > default)
    if (prodFtadPct !== null) {
        finalFtadPercent = prodFtadPct;
        ftadPercentSrc = 'P';
    } else if (brandPct !== null) {
        finalFtadPercent = brandPct;
        ftadPercentSrc = 'B';
    } else {
        finalFtadPercent = globalPct;
        ftadPercentSrc = 'G';
    }

    // Step B: Resolve Max Limit Cap Waterfall independently (Brand > default)
    if (brandLim !== null) {
        finalFtadLimit = brandLim;
        ftadLimitSrc = 'B';
    } else {
        finalFtadLimit = globalLim;
        ftadLimitSrc = 'G';
    }

    // -------------------------------------------------------------
    // RUN ENGINE MATRIX 2: SUBSCRIPTION RENEWAL CALCULATOR (RAD)
    // -------------------------------------------------------------
    let finalRadPercent = 0;
    let radPercentSrc = 'None';

    // Resolve RAD Percent Waterfall independently (Product > Brand > default)
    if (prodRadPct !== null) {
        finalRadPercent = prodRadPct;
        radPercentSrc = 'P';
    } else if (brandRec !== null) {
        finalRadPercent = brandRec;
        radPercentSrc = 'B';
    } else {
        finalRadPercent = globalRec;
        radPercentSrc = 'G';
    }

    // Output values out to UI result display parameters
    updateDisplay('outFtadPercent', `${finalFtadPercent}%`);
    updateDisplay('outFtadLimit', `$${finalFtadLimit.toFixed(2)}`);
    updateDisplay('outRadPercent', `${finalRadPercent}%`);
    
    // Synchronize telemetry indicator badges
    updateSourceBadge('srcFtadPercent', ftadPercentSrc);
    updateSourceBadge('srcFtadLimit', ftadLimitSrc);
    updateSourceBadge('srcRadPercent', radPercentSrc);
}

function getNumValue(id) {
    const val = document.getElementById(id).value;
    return val === '' ? null : parseFloat(val);
}

function updateDisplay(id, text) {
    document.getElementById(id).innerText = text;
}

function updateSourceBadge(id, src) {
    const el = document.getElementById(id);
    el.className = `source-indicator src-${src}`;
    const labelMap = { 'P': 'Prod (P)', 'B': 'Brand (B)', 'G': 'Glob (G)', 'None': 'N/A' };
    el.innerText = labelMap[src] || src;
}

// Initial programmatic computation loop invocation pass
calculateMatrix();