"use client";
import React, { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_RNA_API_URL || "https://api.rna.id/v1/account/prices";

export default function DomainPage() {
  const [extension, setExtension] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function checkExtension(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setError("");
    setLoading(true);

    // Extract TLD if user enters a full domain
    let ext = extension.trim();
    if (ext.startsWith(".")) ext = ext.slice(1);
    // If user enters a full domain, extract the last part
    if (ext.includes(".")) ext = ext.split(".").pop() || ext;

    if (!/^[a-zA-Z0-9]+$/.test(ext)) {
      setError("Please enter a valid domain extension (e.g. .com, .id) or a domain name (e.g. example.com)");
      setLoading(false);
      return;
    }

    try {
      // You should set NEXT_PUBLIC_RNA_API_KEY and NEXT_PUBLIC_RNA_RESELLER_ID in your .env file
      const apiKey = process.env.NEXT_PUBLIC_RNA_API_KEY;
      const resellerId = process.env.NEXT_PUBLIC_RNA_RESELLER_ID;
      if (!apiKey || !resellerId) {
        setError("API credentials are not set.");
        setLoading(false);
        return;
      }
      // Fetch all prices, then filter client-side
      const res = await fetch(API_URL, {
        headers: {
          Authorization: "Basic " + btoa(`${resellerId}:${apiKey}`),
          Accept: "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "API error");
        setLoading(false);
        return;
      }
      const filtered = data.data?.find((item: any) => item.extension?.toLowerCase() === ext.toLowerCase());
      setResult(filtered || null);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-neutral-800 rounded-xl shadow-lg p-8 mt-16">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Domain Extension Info</h1>
        <form onSubmit={checkExtension} className="flex flex-col gap-4">
          <input
            type="text"
            className="px-4 py-3 rounded-lg bg-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter extension (e.g. .com, .id) or domain (e.g. example.com)"
            value={extension}
            onChange={e => setExtension(e.target.value)}
            required
          />
          <div className="text-xs text-neutral-400">You can enter a domain extension (e.g. <span className="text-white">.com</span>, <span className="text-white">.id</span>) or a full domain (e.g. <span className="text-white">example.com</span>). Only the extension will be checked.</div>
          <button
            type="submit"
            className="bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            disabled={loading || !extension}
          >
            {loading ? "Checking..." : "Check"}
          </button>
        </form>
        {result && (
          <div className="mt-6 text-center text-lg font-semibold text-green-400">
            <div>Extension: <span className="text-white">{result.extension}</span></div>
            <div>Price: <span className="text-white">{result.price}</span></div>
            <div>Promo: <span className="text-white">{result.promo ? "Yes" : "No"}</span></div>
            <div>Status: <span className="text-white">{result.status || "N/A"}</span></div>
          </div>
        )}
        {result === null && !loading && !error && (
          <div className="mt-6 text-center text-neutral-400 text-base">No data found for this extension.</div>
        )}
        {error && (
          <div className="mt-4 text-center text-red-400">{error}</div>
        )}
      </div>
    </div>
  );
} 