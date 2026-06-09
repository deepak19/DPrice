/**
 * Omnichannel Pricing Logic Engine Module
 * Multi-Variable Rule Matrix Implementation
 */

// Bind DOM Target Nodes
const listField = document.getElementById('listField');
const ppcField = document.getElementById('ppcField');
const imapField = document.getElementById('imapField');
const mapField = document.getElementById('mapField');
const exceptionField = document.getElementById('exceptionField');
const displayWrapper = document.getElementById('displayWrapper');
const tilePriceContainer = document.getElementById('tilePriceContainer');
const tileActionButton = document.getElementById('tileActionButton');

const sessionIndicator = document.getElementById('sessionIndicator');
const conditionalStoreTile = document.getElementById('conditionalStoreTile');
const storeFinalPrice = document.getElementById('storeFinalPrice');
const storeOnlinePrice = document.getElementById('storeOnlinePrice');
const storeFinalPrice2 = document.getElementById('storeFinalPrice2');

const cartSubtotal = document.getElementById('cartSubtotal');
const cartDiscount = document.getElementById('cartDiscount');
const cartFinal = document.getElementById('cartFinal');

const logPath = document.getElementById('logPath');
const logInStore = document.getElementById('logInStore');
const logEcomm = document.getElementById('logEcomm');
const logMask = document.getElementById('logMask');

function calculateOmnichannelPricing() {
    // Graceful zero-fallbacks for empty user values
    const list = parseFloat(listField.value) || 0;
    const ppc = parseFloat(ppcField.value) || 0;
    const imap = parseFloat(imapField.value) || 0;
    const map = parseFloat(mapField.value) || 0;
    const brandException = exceptionField.checked;

    // Secure radio choice parameters
    const activeRadio = document.querySelector('input[name="userAuth"]:checked');
    const userAuth = activeRadio ? activeRadio.value : 'neighbor';

    let hasPPC = ppc > 0 && ppc < list;
    let inStorePrice = 0;
    let guestPrice = 0;
    let neighborPrice = 0;
    let scenarioId = "Undetermined";
    let tileDisplay = "Visible";

    // --- Pricing Engine Matrix Core Logic ---
    if (!hasPPC) {
        // Business Rule Exception Patch: Category 2 (No PPC) defaults Register Price directly to List
        inStorePrice = list;

        if (imap > 0 && map === 0 && imap > list) {
            scenarioId = "2a"; guestPrice = imap; neighborPrice = imap;
        } else if (map > 0 && imap === 0 && map > list) {
            scenarioId = "2b"; guestPrice = map; neighborPrice = map;
        } else if (imap > map && map > list) {
            scenarioId = "2c"; guestPrice = imap; neighborPrice = imap;
        } else if (map > imap && imap > list) {
            scenarioId = "2d"; guestPrice = imap; neighborPrice = imap;
        } else if (imap === map && imap > list) {
            scenarioId = "2e"; guestPrice = imap; neighborPrice = imap;
        } else {
            scenarioId = "5"; guestPrice = list; neighborPrice = list;
        }
    } else {
        // Categories 1, 3, and 4 (Valid promotion sits below active list price baseline)
        inStorePrice = ppc;

        if (list < imap || list < map) {
            // Category 1 Paths: Protection floors override list thresholds
            if (imap > 0 && map === 0) { scenarioId = "1a"; guestPrice = imap; neighborPrice = imap; }
            else if (map > 0 && imap === 0) { scenarioId = "1b"; guestPrice = map; neighborPrice = map; }
            else if (imap > map) { scenarioId = "1c"; guestPrice = imap; neighborPrice = imap; }
            else if (map > imap) { scenarioId = "1d"; guestPrice = imap; neighborPrice = imap; }
            else if (imap === map) { scenarioId = "1e"; guestPrice = imap; neighborPrice = imap; }
        } else {
            // Categories 3 & 4: Room for digital promotions configuration
            if (ppc < imap || ppc < map) {
                // Category 3 Nest conflicts
                if (imap > 0 && map === 0) {
                    scenarioId = "3a"; guestPrice = list; neighborPrice = imap;
                } else if (map > 0 && imap === 0) {
                    scenarioId = "3b"; guestPrice = list; neighborPrice = map;
                } else if (imap > map) {
                    scenarioId = "3c"; guestPrice = list; neighborPrice = imap;
                } else if (map > imap) {
                    scenarioId = "3d"; guestPrice = list; neighborPrice = map;
                } else if (imap === map) {
                    scenarioId = "3e"; guestPrice = list; neighborPrice = imap;
                }
            } else {
                scenarioId = "4"; guestPrice = list; neighborPrice = ppc;
            }
        }
    }

    // Determine current processing pricing structure path from input state selectors
    const ecommPrice = (userAuth === 'neighbor') ? neighborPrice : guestPrice;

    // Run MAP Policy Hiding Rules Engine Evaluation
    if (inStorePrice < map || ecommPrice < map) {
        if (scenarioId !== "5" && scenarioId !== "2a" && scenarioId !== "3a" && scenarioId !== "4") {
            tileDisplay = "Hidden";
        }
    }

    // Master Exception Override Rule Check
    if (brandException) {
        tileDisplay = "Visible";
    }

    // --- DOM Template Content Injection Sequence ---
    displayWrapper.className = "display-outputs " + (tileDisplay === "Visible" ? "mode-visible" : "mode-hidden");

    // 0. Update User Auth State Header Badge Layout
    if (userAuth === 'neighbor') {
        sessionIndicator.innerText = "👤 Logged-In Neighbor";
        sessionIndicator.className = "session-badge badge-neighbor";
    } else {
        sessionIndicator.innerText = "👤 Anonymous Guest";
        sessionIndicator.className = "session-badge badge-guest";
    }

    // 1. Render Product Tile Layout elements
    if (tileDisplay === "Visible") {
        if (ecommPrice < list) {
            tilePriceContainer.innerHTML = `
                <div class="strike-price">Reg: $${list.toFixed(2)}</div>
                <div class="main-rendered-price">$${ecommPrice.toFixed(2)}</div>
            `;
        } else {
            tilePriceContainer.innerHTML = `
                <div class="main-rendered-price">$${ecommPrice.toFixed(2)}</div>
            `;
        }
        conditionalStoreTile.style.display = "none";
    } else {
        tilePriceContainer.innerHTML = `
            <div class="view-store-link-wrapper">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;"><path d="M3 3h18v4H3zM3 7l1 12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2l1-12M10 12h4"/></svg>
                <span class="underline-text">View in-store price</span> ➔
            </div>
        `;
        conditionalStoreTile.style.display = "flex";
    }

    // 2. Render In-Store Card Data Channels
    storeFinalPrice.innerText = `$${inStorePrice.toFixed(2)}`;
    storeOnlinePrice.innerText = `$${ecommPrice.toFixed(2)}`;
    storeFinalPrice2.innerText = `$${inStorePrice.toFixed(2)}`;

    // 3. Compute Shopping Cart Metrics from Custom Prompt Math Layer Specifications
    cartSubtotal.innerText = `$${guestPrice.toFixed(2)}`;
    const calculationDelta = guestPrice - ecommPrice;
    cartDiscount.innerText = `-$${calculationDelta.toFixed(2)}`;
    cartFinal.innerText = `$${ecommPrice.toFixed(2)}`;

    // 4. Update the diagnostics telemetry control console log window stream
    logPath.innerText = "Scenario Matrix Reference #" + scenarioId;
    logInStore.innerText = "$" + inStorePrice.toFixed(2);
    logEcomm.innerText = "$" + ecommPrice.toFixed(2);
    logMask.innerText = tileDisplay === "Visible" 
        ? "None (Fully Advertised on Product Tile Grid)" 
        : (brandException ? "Overridden via Active Brand Exception Configuration" : "Enforced Compliance Hiding Active (Cart Mask)");
}

// Map Calculator Execution Hooks to Inputs
[listField, ppcField, imapField, mapField, exceptionField].forEach(element => {
    element.addEventListener('input', calculateOmnichannelPricing);
    element.addEventListener('change', calculateOmnichannelPricing);
});

document.querySelectorAll('input[name="userAuth"]').forEach(radio => {
    radio.addEventListener('change', calculateOmnichannelPricing);
});

// Fire dynamic run calculation on initial load
calculateOmnichannelPricing();