// Code execution via our backend proxy to JDoodle API

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  console.error("VITE_API_URL is not set in the environment variables!");
}

const LANGUAGE_VERSIONS = {
  javascript: "javascript",
  python: "python",
  java: "java",
  cpp: "cpp",
  go: "go",
  rust: "rust",
};

/**
 * @param {string} language - programming language key
 * @param {string} code - source code to execute
 * @returns {Promise<{success:boolean, output?:string, error?: string}>}
 */
export async function executeCode(language, code) {
  try {
    if (!LANGUAGE_VERSIONS[language]) {
      return {
        success: false,
        error: `Unsupported language: ${language}`,
      };
    }

    const response = await fetch(`${API_URL}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        files: [{ content: code }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return {
          success: false,
          error: "Rate limit exceeded. Please wait a few seconds before running code again.",
        };
      }
      return {
        success: false,
        error: `Compiler API error! status: ${response.status}`,
      };
    }

    const data = await response.json();

    const output = data.run?.output || "";
    const stderr = data.run?.stderr || "";

    if (stderr) {
      return {
        success: false,
        output: output,
        error: stderr,
      };
    }

    return {
      success: true,
      output: output || "No output",
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to execute code: ${error.message}`,
    };
  }
}