// Global variables
let model;
let word_index;

// DOM elements
const reviewInput = document.getElementById('review-text');
const analyzeButton = document.getElementById('analyze-button');
const modelStatus = document.getElementById('model-status');
const resultDiv = document.getElementById('result');

// Initialize when page loads
window.onload = async function() {
    try {
        // Load word index
        updateStatus('Loading word index...');
        const response = await fetch('word_index.json');
        word_index = await response.json();
        
        // Load model
        updateStatus('Loading model...');
        model = await tf.loadLayersModel('model.json');
        
        // Enable button
        analyzeButton.disabled = false;
        updateStatus('Ready! Enter a restaurant review.');
    } catch (error) {
        console.error('Error initializing:', error);
        updateStatus('Error loading model. Please refresh the page.');
    }
};

// Update status message
function updateStatus(message) {
    modelStatus.textContent = message;
}

// Preprocess text similar to training
function preprocessReview(text) {
    // Convert to lowercase and split into words
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
    
    // Convert words to indices with padding/truncating to length 20
    const sequence = words.map(word => word_index[word] || word_index['<OOV>'] || 0);
    const paddedSequence = sequence.slice(0, 20);
    while (paddedSequence.length < 20) {
        paddedSequence.push(0);
    }
    
    return paddedSequence;
}

// Analyze the review
async function analyzeReview() {
    try {
        if (!model || !word_index) {
            updateStatus('Please wait, model is still loading...');
            return;
        }

        const text = reviewInput.value.trim();
        if (!text) {
            alert('Please enter a review first.');
            return;
        }

        // Preprocess input
        const processedInput = preprocessReview(text);
        
        // Make prediction
        const tensorInput = tf.tensor2d([processedInput]);
        const prediction = await model.predict(tensorInput).data();
        
        // Display result
        const sentiment = prediction[0] >= 0.5 ? 'positive' : 'negative';
        const confidence = (prediction[0] >= 0.5 ? prediction[0] : 1 - prediction[0]) * 100;
        
        resultDiv.innerHTML = `
            This review appears to be <strong>${sentiment}</strong> 
            (${confidence.toFixed(2)}% confidence)
        `;
        resultDiv.className = sentiment;

        // Cleanup
        tensorInput.dispose();
    } catch (error) {
        console.error('Error during analysis:', error);
        updateStatus('Error analyzing review. Please try again.');
    }
}

// Event listeners
analyzeButton.addEventListener('click', analyzeReview);
reviewInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        analyzeReview();
    }
});   
