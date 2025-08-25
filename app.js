// Constants and configuration
const CURRENCY_SYMBOLS = {
    USD: '$',
    AUD: 'A$',
    MYR: 'RM'
};

const PRESETS = {
    golf: {
        turfSize: 25,
        laborCost: 40000,
        workerCount: 4,
        fuelMaintenance: 20000,
        robotInvestment: 120000,
        savingsFactor: 60,
        currency: 'USD'
    },
    stadium: {
        turfSize: 1.2,
        laborCost: 40000,
        workerCount: 2,
        fuelMaintenance: 8000,
        robotInvestment: 60000,
        savingsFactor: 55,
        currency: 'USD'
    },
    municipal: {
        turfSize: 50,
        laborCost: 40000,
        workerCount: 6,
        fuelMaintenance: 35000,
        robotInvestment: 180000,
        savingsFactor: 65,
        currency: 'USD'
    }
};

const DEFAULTS = {
    turfSize: 10,
    laborCost: 40000,
    workerCount: 3,
    fuelMaintenance: 15000,
    robotInvestment: 60000,
    savingsFactor: 60,
    currency: 'USD'
};

// DOM elements
let form, calculateBtn, resetBtn, copyLinkBtn, resultsSection, tooltip;

// Initialize DOM elements after page loads
function initializeDOM() {
    form = document.getElementById('calculatorForm');
    calculateBtn = document.getElementById('calculateBtn');
    resetBtn = document.getElementById('resetBtn');
    copyLinkBtn = document.getElementById('copyLinkBtn');
    resultsSection = document.getElementById('resultsSection');
    tooltip = document.getElementById('tooltip');
}

// Input elements
let inputs = {};

// Result elements
let results = {};

function initializeInputs() {
    inputs = {
        turfSize: document.getElementById('turfSize'),
        laborCost: document.getElementById('laborCost'),
        workerCount: document.getElementById('workerCount'),
        fuelMaintenance: document.getElementById('fuelMaintenance'),
        robotInvestment: document.getElementById('robotInvestment'),
        savingsFactor: document.getElementById('savingsFactor'),
        currency: document.getElementById('currency')
    };
}

function initializeResults() {
    results = {
        currentCost: document.getElementById('currentCost'),
        robotCost: document.getElementById('robotCost'),
        annualSavings: document.getElementById('annualSavings'),
        paybackPeriod: document.getElementById('paybackPeriod'),
        paybackMonths: document.getElementById('paybackMonths')
    };
}

// Utility functions
function formatMoney(amount, currency) {
    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    const absAmount = Math.abs(amount);
    
    if (absAmount >= 1000000) {
        return `${symbol}${(amount / 1000000).toFixed(1)}M`;
    } else if (absAmount >= 1000) {
        return `${symbol}${Math.round(amount).toLocaleString()}`;
    } else {
        return `${symbol}${Math.round(amount)}`;
    }
}

function validateInputs() {
    let isValid = true;
    
    // Validate numeric inputs only (exclude currency which is a string)
    const numericInputs = ['turfSize', 'laborCost', 'workerCount', 'fuelMaintenance', 'robotInvestment', 'savingsFactor'];
    
    numericInputs.forEach(inputKey => {
        const input = inputs[inputKey];
        if (input) {
            const value = parseFloat(input.value);
            if (isNaN(value) || value < 0) {
                isValid = false;
            }
        }
    });
    
    // Special validation for savings factor
    const savingsValue = parseFloat(inputs.savingsFactor.value);
    if (savingsValue < 0 || savingsValue > 90) {
        isValid = false;
    }
    
    // Validate currency is selected
    if (!inputs.currency || !inputs.currency.value) {
        isValid = false;
    }
    
    return isValid;
}

function clampSavingsFactor() {
    const savingsInput = inputs.savingsFactor;
    let value = parseFloat(savingsInput.value);
    
    if (isNaN(value)) value = 0;
    if (value < 0) value = 0;
    if (value > 90) value = 90;
    
    savingsInput.value = value;
}

// Calculation functions
function calcCurrentAnnualCost(laborPerWorker, workers, fuelMaint) {
    return (laborPerWorker * workers) + fuelMaint;
}

function calcRobotAnnualCost(currentAnnual, savingsPct) {
    return currentAnnual * (1 - savingsPct / 100);
}

function calcAnnualSavings(currentAnnual, robotAnnual) {
    return Math.max(0, currentAnnual - robotAnnual);
}

function calcPaybackYears(robotInvestment, annualSavings) {
    return annualSavings > 0 ? robotInvestment / annualSavings : Infinity;
}

// Animation function for counting numbers
function animateNumber(element, startValue, endValue, duration = 1000) {
    const startTime = performance.now();
    const startNum = parseFloat(startValue) || 0;
    const endNum = parseFloat(endValue);
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startNum + (endNum - startNum) * easeOutQuart;
        
        // Format the current value based on the element
        if (element.id === 'paybackPeriod') {
            const years = currentValue;
            if (years === Infinity || years > 100) {
                element.textContent = '> 100 years';
            } else {
                element.textContent = `${years.toFixed(1)} years`;
            }
        } else if (element.id === 'paybackMonths') {
            const months = currentValue;
            if (months === Infinity || months > 1200) {
                element.textContent = '> 1200 months';
            } else {
                element.textContent = `${Math.round(months)} months`;
            }
        } else {
            // Money formatting
            const currency = inputs.currency.value;
            element.textContent = formatMoney(currentValue, currency);
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Main calculation function
function calculateROI() {
    if (!validateInputs()) {
        alert('Please ensure all inputs are valid positive numbers and savings factor is between 0-90%.');
        return;
    }
    
    // Get input values
    const turfSize = parseFloat(inputs.turfSize.value);
    const laborPerWorker = parseFloat(inputs.laborCost.value);
    const workers = parseFloat(inputs.workerCount.value);
    const fuelMaint = parseFloat(inputs.fuelMaintenance.value);
    const robotInvestment = parseFloat(inputs.robotInvestment.value);
    const savingsPct = parseFloat(inputs.savingsFactor.value);
    const currency = inputs.currency.value;
    
    // Perform calculations
    const currentAnnual = calcCurrentAnnualCost(laborPerWorker, workers, fuelMaint);
    const robotAnnual = calcRobotAnnualCost(currentAnnual, savingsPct);
    const annualSavings = calcAnnualSavings(currentAnnual, robotAnnual);
    const paybackYears = calcPaybackYears(robotInvestment, annualSavings);
    const paybackMonths = paybackYears * 12;
    
    // Validation warnings
    if (annualSavings <= 0) {
        alert('Savings must be greater than 0 to compute payback. Please adjust your inputs.');
        return;
    }
    
    if (annualSavings < 1000) {
        alert('Warning: Payback may exceed 10 years with current savings.');
    }
    
    // Show results section
    resultsSection.classList.add('visible');
    
    // Get current values for animation start points
    const currentCurrentCost = results.currentCost.textContent;
    const currentRobotCost = results.robotCost.textContent;
    const currentSavings = results.annualSavings.textContent;
    const currentPayback = results.paybackPeriod.textContent;
    
    // Animate the results
    setTimeout(() => {
        animateNumber(results.currentCost, 0, currentAnnual);
        animateNumber(results.robotCost, 0, robotAnnual);
        animateNumber(results.annualSavings, 0, annualSavings);
        animateNumber(results.paybackPeriod, 0, paybackYears);
        animateNumber(results.paybackMonths, 0, paybackMonths);
        
        // Add animation class for CSS effects
        Object.values(results).forEach(el => {
            el.classList.add('animate');
            setTimeout(() => el.classList.remove('animate'), 500);
        });
    }, 100);
}

// Preset functions
function applyPreset(presetName) {
    const preset = PRESETS[presetName];
    if (!preset) return;
    
    Object.keys(preset).forEach(key => {
        if (inputs[key]) {
            inputs[key].value = preset[key];
        }
    });
    
    updateCalculateButtonState();
}

// Reset function
function resetForm() {
    Object.keys(DEFAULTS).forEach(key => {
        if (inputs[key]) {
            inputs[key].value = DEFAULTS[key];
        }
    });
    
    resultsSection.classList.remove('visible');
    updateCalculateButtonState();
    clearUrlParams();
}

// URL state management
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        turf: params.get('turf'),
        labor: params.get('labor'),
        workers: params.get('workers'),
        fuel: params.get('fuel'),
        robot: params.get('robot'),
        savings: params.get('savings'),
        ccy: params.get('ccy')
    };
}

function setUrlParams() {
    const params = new URLSearchParams();
    
    params.set('turf', inputs.turfSize.value);
    params.set('labor', inputs.laborCost.value);
    params.set('workers', inputs.workerCount.value);
    params.set('fuel', inputs.fuelMaintenance.value);
    params.set('robot', inputs.robotInvestment.value);
    params.set('savings', inputs.savingsFactor.value);
    params.set('ccy', inputs.currency.value);
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
}

function clearUrlParams() {
    window.history.replaceState({}, '', window.location.pathname);
}

function loadFromUrl() {
    const params = getUrlParams();
    
    if (params.turf) inputs.turfSize.value = params.turf;
    if (params.labor) inputs.laborCost.value = params.labor;
    if (params.workers) inputs.workerCount.value = params.workers;
    if (params.fuel) inputs.fuelMaintenance.value = params.fuel;
    if (params.robot) inputs.robotInvestment.value = params.robot;
    if (params.savings) inputs.savingsFactor.value = params.savings;
    if (params.ccy) inputs.currency.value = params.ccy;
}

// Copy link functionality
function copyLink() {
    setUrlParams();
    
    navigator.clipboard.writeText(window.location.href).then(() => {
        const originalText = copyLinkBtn.textContent;
        copyLinkBtn.textContent = 'Link Copied!';
        setTimeout(() => {
            copyLinkBtn.textContent = originalText;
        }, 2000);
    }).catch(() => {
        // Fallback for browsers that don't support clipboard API
        const textarea = document.createElement('textarea');
        textarea.value = window.location.href;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        const originalText = copyLinkBtn.textContent;
        copyLinkBtn.textContent = 'Link Copied!';
        setTimeout(() => {
            copyLinkBtn.textContent = originalText;
        }, 2000);
    });
}

// Button state management
function updateCalculateButtonState() {
    calculateBtn.disabled = !validateInputs();
}

// Tooltip functionality
function showTooltip(element, text) {
    tooltip.textContent = text;
    tooltip.classList.add('visible');
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
}

function hideTooltip() {
    tooltip.classList.remove('visible');
}

// Event listeners moved to setupEventListeners() function

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all DOM elements
    initializeDOM();
    initializeInputs();
    initializeResults();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load from URL parameters if present
    loadFromUrl();
    
    // Update button state
    updateCalculateButtonState();
    
    // Focus first input for better UX
    if (inputs.turfSize) {
        inputs.turfSize.focus();
    }
});

// Setup all event listeners
function setupEventListeners() {
    if (!form || !calculateBtn || !resetBtn || !copyLinkBtn) {
        return;
    }
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateROI();
    });
    
    // Calculate button
    calculateBtn.addEventListener('click', (e) => {
        e.preventDefault();
        calculateROI();
    });
    
    // Reset button
    resetBtn.addEventListener('click', resetForm);
    
    // Copy link button
    copyLinkBtn.addEventListener('click', copyLink);
    
    // Input validation listeners
    Object.values(inputs).forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                if (input === inputs.savingsFactor) {
                    clampSavingsFactor();
                }
                updateCalculateButtonState();
            });
            
            input.addEventListener('blur', () => {
                if (input === inputs.savingsFactor) {
                    clampSavingsFactor();
                }
            });
        }
    });
    
    // Preset button listeners
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = btn.dataset.preset;
            applyPreset(preset);
        });
    });
    
    // Tooltip listeners
    document.querySelectorAll('.info-icon').forEach(icon => {
        icon.addEventListener('mouseenter', (e) => {
            const tooltipText = e.target.dataset.tooltip;
            showTooltip(e.target, tooltipText);
        });
        
        icon.addEventListener('mouseleave', hideTooltip);
        
        icon.addEventListener('focus', (e) => {
            const tooltipText = e.target.dataset.tooltip;
        });
        
        icon.addEventListener('blur', hideTooltip);
    });
}

// Handle window resize for tooltip positioning
window.addEventListener('resize', hideTooltip);
