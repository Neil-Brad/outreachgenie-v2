import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function OutreachGenie() {
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [tone, setTone] = useState("friendly");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!linkedinUrl.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedinUrl, tone }),
      });
      const data = await res.json();
      setOutput(data.result);
    } catch (error) {
      setOutput("Failed to generate emails. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold mb-4">OutreachGenie AI</h1>
          <p className="text-gray-600 mb-2">
            Paste a LinkedIn profile URL below, choose a tone, and our AI will craft personalized cold emails and follow-ups.
          </p>
          <Input
            type="url"
            placeholder="https://linkedin.com/in/example"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="mb-4"
          />
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="mb-4 p-2 border rounded w-full"
          >
            <option value="friendly">🤝 Friendly</option>
            <option value="direct">🎯 Direct</option>
            <option value="authority">👑 Authority</option>
            <option value="humorous">😄 Humorous</option>
          </select>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate Emails"}
          </Button>
          <Textarea
            className="mt-4 h-60"
            value={output}
            readOnly
            placeholder="Your personalized email sequence will appear here."
          />
        </CardContent>
      </Card>
    </div>
  );
}
