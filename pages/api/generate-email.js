import { Configuration, OpenAIApi } from "openai";
import cheerio from "cheerio";
import axios from "axios";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { linkedinUrl, tone = "friendly" } = req.body;

  if (!linkedinUrl || !linkedinUrl.startsWith("http")) {
    return res.status(400).json({ error: "Invalid LinkedIn URL" });
  }

  let name = "";
  let headline = "";
  let about = "";
  let companyName = "";
  let companyDesc = "";

  try {
    const html = await axios.get(linkedinUrl).then(r => r.data);
    const $ = cheerio.load(html);

    name = $('h1').first().text().trim();
    headline = $('div.text-body-medium').first().text().trim();
    about = $('section.pv-about-section').text().trim();
    companyName = $('a[data-control-name="background_details_company"] span').first().text().trim();

    if (companyName) {
      try {
        const response = await axios.get(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(companyName)}`);
        const companyData = response.data[0];
        companyDesc = companyData?.description || "";
      } catch {
        companyDesc = "";
      }
    }
  } catch (scrapeError) {
    console.error("Enrichment error:", scrapeError);
  }

  const enrichedData = `Name: ${name}\nHeadline: ${headline}\nAbout: ${about}\nCompany: ${companyName} - ${companyDesc}`;

  const prompt = `You are a professional outbound sales assistant. Based on the following LinkedIn profile and company information, write 3 cold outreach emails and 2 follow-up messages in a ${tone} tone. Each message should be personalized, relevant, and include a CTA.\n\n${enrichedData}\n\nLinkedIn URL: ${linkedinUrl}`;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You generate outbound sales emails." },
        { role: "user", content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const result = completion.data.choices[0].message.content;
    res.status(200).json({ result });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "Failed to generate email content." });
  }
}
