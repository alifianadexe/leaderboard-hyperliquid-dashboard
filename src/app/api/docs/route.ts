import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const docsDirectory = path.join(process.cwd(), "src", "docs");

    // Check if docs directory exists
    if (!fs.existsSync(docsDirectory)) {
      return NextResponse.json(
        { error: "Documentation directory not found" },
        { status: 404 }
      );
    }

    const filenames = fs.readdirSync(docsDirectory);
    const markdownFiles = filenames.filter((name) => name.endsWith(".md"));

    const docs = markdownFiles.map((filename) => {
      const filePath = path.join(docsDirectory, filename);
      const content = fs.readFileSync(filePath, "utf8");

      // Extract title from filename (remove .md and replace underscores/hyphens with spaces)
      const id = filename.replace(".md", "").toLowerCase().replace(/_/g, "-");
      const title = filename
        .replace(".md", "")
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

      return {
        id,
        title,
        filename,
        content: content,
      };
    });

    // Sort docs alphabetically by title
    docs.sort((a, b) => a.title.localeCompare(b.title));

    return NextResponse.json(docs);
  } catch (error) {
    console.error("Error reading documentation files:", error);
    return NextResponse.json(
      { error: "Failed to load documentation files" },
      { status: 500 }
    );
  }
}
