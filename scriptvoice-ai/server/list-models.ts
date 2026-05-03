import 'dotenv/config';

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API KEY");
    return;
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
        console.log("Available Models:");
        data.models.forEach((m: any) => {
            console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
        });
    } else {
        console.log("No models found or error:", JSON.stringify(data, null, 2));
    }
  } catch (e: any) {
    console.error("Fetch error:", e.message);
  }
}

listModels();
