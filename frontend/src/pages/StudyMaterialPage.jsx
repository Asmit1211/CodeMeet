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
  },
  {
    id: 2,
    title: "System Design Interview Guide",
    description: "Learn how to design scalable systems — from load balancers to database sharding.",
    icon: BrainCircuitIcon,
    tag: "System Design",
    tagColor: "badge-secondary",
  },
  {
    id: 3,
    title: "Behavioral Interview Notes",
    description: "STAR method examples, common questions, and tips to ace behavioral rounds.",
    icon: FileTextIcon,
    tag: "Behavioral",
    tagColor: "badge-accent",
  },
  {
    id: 4,
    title: "JavaScript Deep Dive",
    description: "Closures, prototypal inheritance, event loop, promises, and async patterns explained.",
    icon: BookOpenIcon,
    tag: "JavaScript",
    tagColor: "badge-warning",
  },
  {
    id: 5,
    title: "React & Frontend Patterns",
    description: "Component architecture, hooks, state management, performance optimization techniques.",
    icon: SparklesIcon,
    tag: "React",
    tagColor: "badge-info",
  },
  {
    id: 6,
    title: "SQL & Database Essentials",
    description: "Joins, indexing, normalization, query optimization, and common interview queries.",
    icon: FileTextIcon,
    tag: "Database",
    tagColor: "badge-error",
  },
];

function StudyMaterialPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

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
                        <button className="btn btn-ghost btn-sm text-primary gap-1">
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
      </div>
    </div>
  );
}

export default StudyMaterialPage;
