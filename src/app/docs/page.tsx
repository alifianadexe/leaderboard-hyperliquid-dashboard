"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Book, FileText, ChevronRight, ArrowLeft } from "lucide-react";
import { ApiStatus } from "@/components/ApiStatus";
import { UserDropdown } from "@/components/UserDropdown";
import { TrendingUp } from "lucide-react";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";

interface DocFile {
  id: string;
  title: string;
  filename: string;
  content: string;
}

export default function DocsPage() {
  const [docs, setDocs] = useState<DocFile[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configure marked with proper options
  const parseMarkdown = (content: string): string => {
    try {
      // Configure marked options
      marked.setOptions({
        breaks: true, // Convert \n to <br>
        gfm: true, // Enable GitHub Flavored Markdown
      });

      // Process the content and add syntax highlighting
      let html = marked.parse(content) as string;

      // Post-process to add syntax highlighting to code blocks
      html = html.replace(
        /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
        (match, lang, code) => {
          if (hljs.getLanguage(lang)) {
            try {
              const highlighted = hljs.highlight(code, {
                language: lang,
              }).value;
              return `<pre><code class="language-${lang} hljs">${highlighted}</code></pre>`;
            } catch (err) {
              console.error("Highlight error:", err);
            }
          }
          const auto = hljs.highlightAuto(code);
          return `<pre><code class="hljs">${auto.value}</code></pre>`;
        }
      );

      return html;
    } catch (err) {
      console.error("Markdown parsing error:", err);
      return content;
    }
  };

  useEffect(() => {
    async function loadDocs() {
      try {
        setLoading(true);
        const response = await fetch("/api/docs");
        if (!response.ok) throw new Error("Failed to load documentation");

        const docsData: DocFile[] = await response.json();
        setDocs(docsData);
        if (docsData.length > 0) {
          setSelectedDoc(docsData[0]);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load documentation"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDocs();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/5 via-zinc-950 to-blue-900/5" />

      <div className="relative">
        {/* Header */}
        <header className="border-b border-zinc-800/40 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-12xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-400" />
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Documentation
                  </h1>
                  <p className="text-xs text-zinc-500">Back to Dashboard</p>
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <ApiStatus />
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-emerald-400">
                    Live
                  </span>
                </div>
                <UserDropdown />
              </div>
            </div>
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="max-w-12xl mx-auto px-8 py-12">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              <span className="ml-4 text-zinc-400">
                Loading documentation...
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-12xl mx-auto px-8 py-12">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-red-400 mb-2">
                Error Loading Documentation
              </h3>
              <p className="text-red-300/80">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <div className="max-w-12xl mx-auto px-8 py-12">
            <div className="grid grid-cols-12 gap-8">
              {/* Sidebar */}
              <aside className="col-span-3">
                <div className="sticky top-32">
                  <div className="flex items-center gap-3 mb-8">
                    <Book className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-2xl font-bold text-white">
                      Documentation
                    </h2>
                  </div>
                  <nav className="space-y-2">
                    {docs.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDoc(doc)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                          selectedDoc?.id === doc.id
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg"
                            : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white border border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4" />
                          <span className="font-medium">{doc.title}</span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            selectedDoc?.id === doc.id ? "rotate-90" : ""
                          }`}
                        />
                      </button>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Content Area */}
              <section className="col-span-9">
                {selectedDoc ? (
                  <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl backdrop-blur-xl shadow-2xl">
                    {/* Document Header */}
                    <div className="px-8 py-6 border-b border-zinc-800/40">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h1 className="text-2xl font-bold text-white mb-1">
                            {selectedDoc.title}
                          </h1>
                          <p className="text-sm text-zinc-500">
                            {selectedDoc.filename}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Document Content */}
                    <div className="px-8 py-8">
                      <div className="prose-enhanced max-w-none">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: parseMarkdown(selectedDoc.content),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl backdrop-blur-xl shadow-2xl p-12 text-center">
                    <FileText className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">
                      Select a document to view its content.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
