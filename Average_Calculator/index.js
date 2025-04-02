const express = require('express')
const fetch = require('node-fetch')

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

// Map to store our window of numbers
let numberWindow = [];

// API endpoint mapping
const API_ENDPOINTS = {
  'p': 'http://20.244.56.144/evaluation-service/primes',
  'f': 'http://20.244.56.144/evaluation-service/fibo',
  'e': 'http://20.244.56.144/evaluation-service/even',
  'r': 'http://20.244.56.144/evaluation-service/rand'
};

// Function to calculate average of numbers
const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return (sum / numbers.length).toFixed(2);
};

// Main API endpoint
app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;
  console.log(numberid)

  // Store previous state
  const windowPrevState = [...numberWindow];

  try {
    // Generate fresh token
    // const authResponse = await fetch("http://20.244.56.144/evaluation-service/auth", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.stringify({
    //     email: "2206289@kiit.ac.in",
    //     name: "sakshi",
    //     rollNo: "2206289",
    //     accessCode: "nwpwrZ",
    //     clientID: "654d0cf8-03dc-4252-b9a7-04c778d24383",
    //     clientSecret: "uzzatuUBhHBferzK"
    //   })
    // });
    
    // if (!authResponse.ok) {
    //   throw new Error(`Authentication failed (HTTP ${authResponse.status}). Please check if the credentials are still valid.`);
    // }
    
    // const authData = await authResponse.json();
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzNjA0MzQwLCJpYXQiOjE3NDM2MDQwNDAsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjY1NGQwY2Y4LTAzZGMtNDI1Mi1iOWE3LTA0Yzc3OGQyNDM4MyIsInN1YiI6IjIyMDYyODlAa2lpdC5hYy5pbiJ9LCJlbWFpbCI6IjIyMDYyODlAa2lpdC5hYy5pbiIsIm5hbWUiOiJzYWtzaGkiLCJyb2xsTm8iOiIyMjA2Mjg5IiwiYWNjZXNzQ29kZSI6Im53cHdyWiIsImNsaWVudElEIjoiNjU0ZDBjZjgtMDNkYy00MjUyLWI5YTctMDRjNzc4ZDI0MzgzIiwiY2xpZW50U2VjcmV0IjoidXp6YXR1VUJoSEJmZXJ6SyJ9.rxV-f-MGBolP4_NhPla19pk_jurqRth4jrqnQIMsz5c";

    // Fetch numbers from third-party API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(API_ENDPOINTS[numberid], {
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      }
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API request failed (HTTP ${response.status})`);
    }

    const data = await response.json();
    const fetchedNumbers = data.numbers || [];

    // Add unique numbers to the window
    for (const num of fetchedNumbers) {
      if (!numberWindow.includes(num)) {
        if (numberWindow.length >= WINDOW_SIZE) {
          numberWindow.shift();
        }
        numberWindow.push(num);
      }
    }

    // Calculate average
    const avg = calculateAverage(numberWindow);

    // Prepare response
    const responseData = {
      windowPrevState,
      windowCurrState: [...numberWindow],
      numbers: fetchedNumbers,
      avg: parseFloat(avg)
    };

    res.json(responseData);

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      error: error.message,
      windowPrevState,
      windowCurrState: [...numberWindow],
      numbers: [],
      avg: parseFloat(calculateAverage(numberWindow))
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
