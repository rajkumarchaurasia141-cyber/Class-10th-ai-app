
let cachedData: any = null;
let lastFetch = 0;

export async function getStaticData() {
  const now = Date.now();
  // 24 घंटे का कैश
  if (cachedData && (now - lastFetch < 24 * 60 * 60 * 1000)) {
    return cachedData;
  }

  try {
    // सापेक्ष पथ (Relative path) का उपयोग करें
    const res = await fetch('/app_data.json'); 
    if (!res.ok) throw new Error('Failed to fetch');
    
    const data = await res.json();
    cachedData = data;
    lastFetch = now;
    return data;
  } catch (e) {
    console.error("Static data load fail, cache try kar raha hu", e);
    return cachedData;
  }
}
