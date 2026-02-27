import { useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import CodeEditorPanel from "../components/CodeEditorPanel";
import OutputPanel from "../components/OutputPanel";
import { executeCode } from "../lib/piston";
import { LANGUAGE_CONFIG } from "../data/problems";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  PencilIcon,
  PlayIcon,
  Loader2Icon,
  SparklesIcon,
  FileTextIcon,
  TagIcon,
  AlignLeftIcon,
  ArrowRightLeftIcon,
} from "lucide-react";

const DEFAULT_STARTER = {
  javascript: `// Write your solution here\n\nconsole.log("Hello, World!");`,
  python: `# Write your solution here\n\nprint("Hello, World!")`,
  java: `class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n        System.out.println("Hello, World!");\n    }\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n    // Write your solution here\n    fmt.Println("Hello, World!")\n}`,
  rust: `fn main() {\n    // Write your solution here\n    println!("Hello, World!");\n}`,
};

function CustomProblemPage() {
  const navigate = useNavigate();

  // Setup form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [inputFormat, setInputFormat] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");

  // Solve mode state
  const [isSolving, setIsSolving] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState(DEFAULT_STARTER.javascript);
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleStartCoding = () => {
    if (!title.trim()) {
      toast.error("Please enter a problem title");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a problem description");
      return;
    }
    setIsSolving(true);
  };

  const handleBackToSetup = () => {
    setIsSolving(false);
    setOutput(null);
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(DEFAULT_STARTER[newLang]);
    setOutput(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    setIsRunning(false);

    if (result.success) {
      toast.success("Code executed successfully!");
    } else {
      toast.error("Code execution failed!");
    }
  };

  // ── SETUP MODE ──
  if (!isSolving) {
    return (
      <div className="min-h-screen bg-base-200">
        <Navbar />

        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Back button */}
          <button
            onClick={() => navigate("/problems")}
            className="btn btn-ghost btn-sm gap-2 mb-6"
          >
            <ArrowLeftIcon className="size-4" />
            Back to Problems
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
              <PencilIcon className="size-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Custom Question</h1>
              <p className="text-base-content/60">
                Create your own coding problem and solve it
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body space-y-6">
              {/* Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <FileTextIcon className="size-4 text-primary" />
                    Problem Title
                  </span>
                  <span className="label-text-alt text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Find the Missing Number"
                  className="input input-bordered w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <AlignLeftIcon className="size-4 text-primary" />
                    Problem Description
                  </span>
                  <span className="label-text-alt text-error">*</span>
                </label>
                <textarea
                  className="textarea textarea-bordered w-full h-32"
                  placeholder="Describe the problem, what the function should do, expected behavior, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Input / Output Format (optional) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <ArrowRightLeftIcon className="size-4 text-secondary" />
                      Input Format
                    </span>
                    <span className="label-text-alt opacity-50">Optional</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full h-20"
                    placeholder="e.g. An array of integers nums"
                    value={inputFormat}
                    onChange={(e) => setInputFormat(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold flex items-center gap-2">
                      <ArrowRightLeftIcon className="size-4 text-secondary" />
                      Output Format
                    </span>
                    <span className="label-text-alt opacity-50">Optional</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered w-full h-20"
                    placeholder="e.g. Return the missing number"
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                  />
                </div>
              </div>

              {/* Difficulty */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold flex items-center gap-2">
                    <TagIcon className="size-4 text-primary" />
                    Difficulty
                  </span>
                </label>
                <div className="flex gap-3">
                  {["Easy", "Medium", "Hard"].map((d) => (
                    <button
                      key={d}
                      className={`btn btn-sm ${
                        difficulty === d
                          ? d === "Easy"
                            ? "btn-success"
                            : d === "Medium"
                            ? "btn-warning"
                            : "btn-error"
                          : "btn-ghost border border-base-300"
                      }`}
                      onClick={() => setDifficulty(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-base-300">
                <button
                  className="btn btn-primary btn-lg gap-2 w-full"
                  onClick={handleStartCoding}
                >
                  <SparklesIcon className="size-5" />
                  Start Coding
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── SOLVE MODE ──
  return (
    <div className="h-screen bg-base-100 flex flex-col">
      <Navbar />

      <div className="flex-1">
        <PanelGroup direction="horizontal">
          {/* LEFT PANEL — Problem Description */}
          <Panel defaultSize={40} minSize={25}>
            <div className="h-full overflow-y-auto bg-base-200">
              {/* Header */}
              <div className="p-6 bg-base-100 border-b border-base-300">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={handleBackToSetup}
                    className="btn btn-ghost btn-sm btn-circle"
                  >
                    <ArrowLeftIcon className="size-4" />
                  </button>
                  <span className="text-sm text-base-content/50">
                    Back to Setup
                  </span>
                </div>

                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold text-base-content">
                    {title}
                  </h1>
                  <span
                    className={`badge ${getDifficultyBadgeClass(difficulty)}`}
                  >
                    {difficulty}
                  </span>
                </div>
                <p className="text-base-content/60">Custom Question</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Description */}
                <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                  <h2 className="text-xl font-bold mb-3 text-base-content">
                    Description
                  </h2>
                  <p className="text-base-content/90 leading-relaxed whitespace-pre-wrap">
                    {description}
                  </p>
                </div>

                {/* Input Format */}
                {inputFormat && (
                  <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                    <h2 className="text-xl font-bold mb-3 text-base-content">
                      Input Format
                    </h2>
                    <div className="bg-base-200 rounded-lg p-4 font-mono text-sm">
                      <p className="text-base-content/90 whitespace-pre-wrap">
                        {inputFormat}
                      </p>
                    </div>
                  </div>
                )}

                {/* Output Format */}
                {outputFormat && (
                  <div className="bg-base-100 rounded-xl shadow-sm p-5 border border-base-300">
                    <h2 className="text-xl font-bold mb-3 text-base-content">
                      Output Format
                    </h2>
                    <div className="bg-base-200 rounded-lg p-4 font-mono text-sm">
                      <p className="text-base-content/90 whitespace-pre-wrap">
                        {outputFormat}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* RIGHT PANEL — Code Editor + Output */}
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={70} minSize={30}>
                <CodeEditorPanel
                  selectedLanguage={selectedLanguage}
                  code={code}
                  isRunning={isRunning}
                  onLanguageChange={handleLanguageChange}
                  onCodeChange={setCode}
                  onRunCode={handleRunCode}
                />
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              <Panel defaultSize={30} minSize={15}>
                <OutputPanel output={output} />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default CustomProblemPage;
