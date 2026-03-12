import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import {
  LockIcon,
  CrownIcon,
  BookOpenIcon,
  FileTextIcon,
  CodeIcon,
  BrainCircuitIcon,
  CheckCircleIcon,
  Loader2Icon,
  SparklesIcon,
  StarIcon,
  XIcon,
  ArrowLeftIcon,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { userApi } from "../api/users";
import { paymentApi } from "../api/payment";

const STUDY_MATERIALS = [
  {
    id: 1,
    title: "Data Structures & Algorithms",
    description: "Master arrays, linked lists, trees, graphs, and advanced data structures with detailed explanations.",
    icon: CodeIcon,
    tag: "DSA",
    tagColor: "badge-primary",
    notes: [
      { title: "Arrays & Hashing", content: "Use hash maps to reduce O(n²) brute force to O(n). Common patterns: frequency counting, prefix sums, sliding window.", example: "Two Sum → Use a map to store complements. O(n) time, O(n) space." },
      { title: "Linked Lists", content: "Master the two-pointer technique (fast/slow) for cycle detection, middle finding, and reversal.", example: "Floyd's Cycle Detection: slow.next, fast.next.next. If they meet → cycle exists." },
      { title: "Trees & Graphs", content: "BFS (queue) for shortest path, DFS (stack/recursion) for exhaustive search. Know when to use each.", example: "Binary Tree Level Order: use BFS with a queue, process level-by-level." },
      { title: "Dynamic Programming", content: "Identify overlapping subproblems and optimal substructure. Start with recursion → memoization → tabulation.", example: "Fibonacci: dp[i] = dp[i-1] + dp[i-2]. Classic bottom-up approach." },
    ],
  },
  {
    id: 2,
    title: "System Design Interview Guide",
    description: "Learn how to design scalable systems — from load balancers to database sharding.",
    icon: BrainCircuitIcon,
    tag: "System Design",
    tagColor: "badge-secondary",
    notes: [
      { title: "Load Balancing", content: "Distribute traffic across servers using Round Robin, Least Connections, or Consistent Hashing.", example: "NGINX as reverse proxy → upstream servers with health checks." },
      { title: "Database Sharding", content: "Split data horizontally across multiple databases. Choose shard key carefully to avoid hotspots.", example: "Shard by user_id % N. Range-based for time-series data." },
      { title: "Caching Strategies", content: "Use Redis/Memcached for read-heavy workloads. Know Cache-Aside, Write-Through, and Write-Behind patterns.", example: "Cache-Aside: Read from cache → miss → read DB → populate cache." },
      { title: "Message Queues", content: "Kafka/RabbitMQ for async processing, decoupling services, and handling traffic spikes.", example: "Order service → publishes to queue → payment service consumes asynchronously." },
    ],
  },
  {
    id: 3,
    title: "Behavioral Interview Notes",
    description: "STAR method examples, common questions, and tips to ace behavioral rounds.",
    icon: FileTextIcon,
    tag: "Behavioral",
    tagColor: "badge-accent",
    notes: [
      { title: "STAR Method", content: "Structure every answer: Situation → Task → Action → Result. Keep answers under 2 minutes.", example: "S: Team missed deadline. T: I was tech lead. A: Broke tasks into sprints. R: Delivered 1 week early." },
      { title: "Conflict Resolution", content: "Show empathy, active listening, and compromise. Never badmouth a teammate.", example: "'I scheduled a 1-on-1, listened to their concerns, proposed a middle ground that satisfied both.'" },
      { title: "Leadership Stories", content: "Highlight initiative, mentoring, and impact. Use metrics when possible.", example: "'I mentored 2 junior devs, reducing their PR review cycle from 3 days to 1 day.'" },
      { title: "Failure & Learning", content: "Be honest about mistakes. Focus 80% on what you learned and how you improved.", example: "'I shipped without enough testing. Added CI/CD pipeline after that — zero regressions since.'" },
    ],
  },
  {
    id: 4,
    title: "JavaScript Deep Dive",
    description: "Closures, prototypal inheritance, event loop, promises, and async patterns explained.",
    icon: BookOpenIcon,
    tag: "JavaScript",
    tagColor: "badge-warning",
    notes: [
      { title: "Closures", content: "A closure is a function that remembers variables from its outer scope even after the outer function returns.", example: "function counter() { let n=0; return () => ++n; } // Each call remembers n." },
      { title: "Event Loop", content: "Call Stack → Web APIs → Callback Queue → Microtask Queue. Microtasks (Promises) run before macrotasks (setTimeout).", example: "Promise.resolve().then(f) runs BEFORE setTimeout(f, 0)." },
      { title: "Prototypal Inheritance", content: "Every object has a __proto__ chain. Object.create() sets up the prototype link.", example: "const dog = Object.create(animal); // dog.__proto__ === animal" },
      { title: "Async/Await", content: "Syntactic sugar over Promises. Always wrap in try/catch. Use Promise.all() for parallel execution.", example: "const [a, b] = await Promise.all([fetchA(), fetchB()]); // Parallel, not sequential." },
    ],
  },
  {
    id: 5,
    title: "React & Frontend Patterns",
    description: "Component architecture, hooks, state management, performance optimization techniques.",
    icon: SparklesIcon,
    tag: "React",
    tagColor: "badge-info",
    notes: [
      { title: "Custom Hooks", content: "Extract reusable stateful logic into custom hooks. Prefix with 'use'. Return state and handlers.", example: "useDebounce(value, delay) → returns debounced value. Reuse across search inputs." },
      { title: "useEffect Cleanup", content: "Always return a cleanup function for subscriptions, timers, and event listeners to prevent memory leaks.", example: "useEffect(() => { const id = setInterval(fn, 1000); return () => clearInterval(id); }, []);" },
      { title: "Memoization", content: "Use React.memo for expensive components, useMemo for computed values, useCallback for stable references.", example: "const filtered = useMemo(() => items.filter(predicate), [items, predicate]);" },
      { title: "State Management", content: "Local state (useState) → Lifted state → Context API → TanStack Query (server state) → Zustand/Redux (complex global).", example: "TanStack Query: useQuery({ queryKey: ['todos'], queryFn: fetchTodos });" },
    ],
  },
  {
    id: 6,
    title: "SQL & Database Essentials",
    description: "Joins, indexing, normalization, query optimization, and common interview queries.",
    icon: FileTextIcon,
    tag: "Database",
    tagColor: "badge-error",
    notes: [
      { title: "JOIN Types", content: "INNER = both match. LEFT = all from left + matches. RIGHT = all from right. FULL = all from both.", example: "SELECT * FROM users LEFT JOIN orders ON users.id = orders.user_id;" },
      { title: "Indexing", content: "B-Tree indexes speed up WHERE, ORDER BY, and JOIN. Don't over-index — writes become slower.", example: "CREATE INDEX idx_email ON users(email); — Speeds up WHERE email = '...'." },
      { title: "Normalization", content: "1NF: no repeating groups. 2NF: no partial dependencies. 3NF: no transitive dependencies.", example: "Split 'orders' table: orders → order_items → products (3NF)." },
      { title: "Query Optimization", content: "Use EXPLAIN ANALYZE. Avoid SELECT *. Use LIMIT. Index columns in WHERE and JOIN clauses.", example: "EXPLAIN ANALYZE SELECT name FROM users WHERE email = 'x@y.com';" },
    ],
  },
];

function StudyMaterialPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Fetch user data from our backend to check isPremium
  const { data: userData, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: userApi.getMe,
    enabled: !!user,
  });

  const isPremium = userData?.user?.isPremium || false;

  const handlePayment = async () => {
    setIsPaymentProcessing(true);

    try {
      // Step 1: Create order on backend
      const orderData = await paymentApi.createOrder();

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CodeMeet",
        description: "Premium Study Materials - Lifetime Access",
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            // Step 3: Verify payment on backend
            await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            toast.success("🎉 Payment successful! Welcome to Premium!");
            // Refresh user data to reflect isPremium = true
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        theme: {
          color: "#1eb854",
        },
        modal: {
          ondismiss: () => {
            setIsPaymentProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        toast.error("Payment failed: " + response.error.description);
        setIsPaymentProcessing(false);
      });
      rzp.open();
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-300">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2Icon className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-300">
      <Navbar />

      <div className="container mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <BookOpenIcon className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-extrabold text-base-content">Study Materials</h1>
          </div>
          <p className="text-base-content/60 text-lg max-w-xl mx-auto">
            Curated interview prep notes and guides to help you ace your next technical interview.
          </p>
        </div>

        {!isPremium ? (
          /* ── Locked UI ── */
          <div className="flex items-center justify-center">
            <div className="card w-full max-w-lg bg-base-100 shadow-2xl border border-primary/20">
              <div className="card-body items-center text-center py-12">
                {/* Lock Icon */}
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <LockIcon className="w-12 h-12 text-primary" />
                </div>

                <h2 className="card-title text-2xl font-bold mb-2">Unlock Premium Materials</h2>
                <p className="text-base-content/60 mb-6 max-w-sm">
                  Get lifetime access to all study materials, interview notes, and prep guides with a single payment.
                </p>

                {/* Features List */}
                <div className="text-left w-full max-w-xs mb-8 space-y-3">
                  {[
                    "6+ comprehensive study guides",
                    "DSA & System Design notes",
                    "Behavioral interview prep",
                    "Lifetime access, no recurring fees",
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-base-content/80 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Price + CTA */}
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-primary">₹499</span>
                  <span className="text-base-content/50 text-sm">one-time payment</span>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isPaymentProcessing}
                  className="btn btn-primary btn-lg gap-2 px-8 shadow-lg hover:shadow-primary/30 transition-all duration-200"
                >
                  {isPaymentProcessing ? (
                    <Loader2Icon className="w-5 h-5 animate-spin" />
                  ) : (
                    <CrownIcon className="w-5 h-5" />
                  )}
                  Upgrade to Premium for ₹499
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Premium Content Grid ── */
          <div>
            {/* Premium Badge */}
            <div className="flex items-center justify-center mb-8">
              <div className="badge badge-lg badge-primary gap-2 py-4 px-6 text-base">
                <StarIcon className="w-4 h-4" />
                Premium Member
              </div>
            </div>

            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {STUDY_MATERIALS.map((material) => {
                const IconComponent = material.icon;
                return (
                  <div
                    key={material.id}
                    className="card bg-base-100 shadow-lg border border-base-300 hover:border-primary/40 hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  >
                    <div className="card-body">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <span className={`badge ${material.tagColor} badge-sm`}>
                          {material.tag}
                        </span>
                      </div>

                      <h3 className="card-title text-lg font-bold">{material.title}</h3>
                      <p className="text-base-content/60 text-sm leading-relaxed">
                        {material.description}
                      </p>

                      <div className="card-actions justify-end mt-4">
                        <button
                          className="btn btn-ghost btn-sm text-primary gap-1"
                          onClick={() => setSelectedMaterial(material)}
                        >
                          <BookOpenIcon className="w-4 h-4" />
                          Read Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes Viewer Modal */}
        {selectedMaterial && (
          <div className="modal modal-open">
            <div className="modal-box max-w-3xl max-h-[85vh]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button
                    className="btn btn-ghost btn-sm btn-circle"
                    onClick={() => setSelectedMaterial(null)}
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="font-bold text-xl">{selectedMaterial.title}</h3>
                    <span className={`badge ${selectedMaterial.tagColor} badge-sm mt-1`}>
                      {selectedMaterial.tag}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-sm btn-circle"
                  onClick={() => setSelectedMaterial(null)}
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-5 overflow-y-auto">
                {selectedMaterial.notes.map((note, idx) => (
                  <div key={idx} className="bg-base-200 rounded-xl p-5 border border-base-300">
                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <span className="badge badge-primary badge-sm">{idx + 1}</span>
                      {note.title}
                    </h4>
                    <p className="text-base-content/70 text-sm leading-relaxed mb-3">
                      {note.content}
                    </p>
                    <div className="bg-base-300 rounded-lg p-3">
                      <p className="text-xs text-base-content/50 mb-1 font-semibold">Example</p>
                      <code className="text-sm font-mono text-primary">{note.example}</code>
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-action">
                <button className="btn btn-primary" onClick={() => setSelectedMaterial(null)}>
                  Close
                </button>
              </div>
            </div>
            <div className="modal-backdrop" onClick={() => setSelectedMaterial(null)}></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyMaterialPage;
