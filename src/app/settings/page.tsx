
"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<{
    jira_url: string;
    jira_email: string;
    jira_api_key: string;
    jira_project: string;
    jira_filter_id: string;
  }>({
    jira_url: "",
    jira_email: "",
    jira_api_key: "",
    jira_project: "",
    jira_filter_id: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();
        setSettings({
          jira_url: data.jira_url || "",
          jira_email: data.jira_email || "",
          jira_api_key: data.jira_api_key || "",
          jira_project: data.jira_project || "",
          jira_filter_id: data.jira_filter_id || ""
        });
      } catch (err) {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setSuccess("Settings saved successfully!");
    } catch {
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-[var(--accent)]">Jira Settingxs</h1>
      {success && (
        <div className="mb-4 p-3 rounded bg-green-100 border border-green-300 text-green-800 flex items-center justify-between">
          <span>{success}</span>
          <button className="ml-4 text-green-600 hover:text-green-900 font-bold" onClick={() => setSuccess("")}>×</button>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 border border-red-300 text-red-800 flex items-center justify-between">
          <span>{error}</span>
          <button className="ml-4 text-red-600 hover:text-red-900 font-bold" onClick={() => setError("")}>×</button>
        </div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Jira URL</label>
            <input name="jira_url" value={settings.jira_url} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Jira Email</label>
            <input name="jira_email" value={settings.jira_email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="relative">
            <label className="block mb-1 font-medium">Jira API Key</label>
            <div className="flex items-center">
              <input
                name="jira_api_key"
                type={showApiKey ? "text" : "password"}
                value={settings.jira_api_key}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 pr-10"
              />
              <button
                type="button"
                className="ml-[-1.5rem] text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
                onClick={() => setShowApiKey((v) => !v)}
                aria-label={showApiKey ? "Hide API Key" : "Show API Key"}
                style={{ position: 'relative', zIndex: 1, right: '0.25rem' }}
              >
                {showApiKey ? (
                  // Eye open icon (Heroicons)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0 2.25 3.75 7.5 9.75 7.5s9.75-5.25 9.75-7.5-3.75-7.5-9.75-7.5S2.25 9.75 2.25 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  // Eye closed icon (Heroicons)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-5.12M6.53 6.53C4.06 8.36 2.25 12 2.25 12c0 2.25 3.75 7.5 9.75 7.5 2.13 0 4.09-.5 5.72-1.36M17.47 17.47C19.94 15.64 21.75 12 21.75 12c0-2.25-3.75-7.5-9.75-7.5-2.13 0-4.09.5-5.72 1.36" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Jira Project Name</label>
            <input name="jira_project" value={settings.jira_project} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Jira Filter ID</label>
            <input name="jira_filter_id" value={settings.jira_filter_id} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <button type="submit" className="bg-[var(--accent)] text-white px-4 py-2 rounded" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      )}
    </div>
  );
}
