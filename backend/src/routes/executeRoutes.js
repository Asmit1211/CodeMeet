import express from "express";

const router = express.Router();

const JDOODLE_API = "https://api.jdoodle.com/v1/execute";

// Map frontend language keys to JDoodle's language + versionIndex
const LANGUAGE_MAP = {
  javascript: { language: "nodejs", versionIndex: "4" },
  python: { language: "python3", versionIndex: "4" },
  java: { language: "java", versionIndex: "4" },
  cpp: { language: "cpp17", versionIndex: "1" },
  go: { language: "go", versionIndex: "4" },
  rust: { language: "rust", versionIndex: "4" },
};

// POST /api/execute - proxy code execution to JDoodle API (public, no auth)
router.post("/", async (req, res) => {
  try {
    const { language, files } = req.body;

    if (!language || !files || !files[0]?.content) {
      return res.status(400).json({ message: "language and files are required" });
    }

    const mapped = LANGUAGE_MAP[language];
    if (!mapped) {
      return res.status(400).json({ message: `Unsupported language: ${language}` });
    }

    const response = await fetch(JDOODLE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: files[0].content,
        language: mapped.language,
        versionIndex: mapped.versionIndex,
      }),
    });

    if (!response.ok) {
      return res.status(response.status).json({
        message: `JDoodle API error: ${response.status}`,
      });
    }

    const data = await response.json();

    // Map JDoodle response back to Piston format so frontend doesn't break
    // .trim() removes trailing newlines/spaces that JDoodle appends
    const output = (data.output || "").trim();
    const stderr = (data.error || "").trim();

    res.status(200).json({
      run: {
        output,
        stderr,
      },
    });
  } catch (error) {
    console.error("Error proxying to JDoodle API:", error.message);
    res.status(500).json({ message: "Code execution failed" });
  }
});

export default router;
