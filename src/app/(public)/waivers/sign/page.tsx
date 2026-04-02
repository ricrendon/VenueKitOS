"use client";

import { useState, useRef, useCallback } from "react";
import { Button, Card, CardContent, Input, Stepper } from "@/components/ui";
import { ArrowRight, ArrowLeft, Check, Plus, X, FileCheck, Loader2 } from "lucide-react";

const steps = ["Your Info", "Children", "Emergency", "Review Waiver", "Sign", "Done"];

interface ChildForm {
  firstName: string;
  lastName: string;
  dob: string;
  allergies: string;
}

export default function WaiverSignPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [parent, setParent] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [children, setChildren] = useState<ChildForm[]>([
    { firstName: "", lastName: "", dob: "", allergies: "" },
  ]);

  const [emergency, setEmergency] = useState({
    name: "",
    phone: "",
    relationship: "",
  });

  const [agreed, setAgreed] = useState([false, false, false]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  // Waiver result state
  const [waiverCount, setWaiverCount] = useState(0);

  const addChild = () => {
    setChildren([...children, { firstName: "", lastName: "", dob: "", allergies: "" }]);
  };

  const removeChild = (index: number) => {
    if (children.length > 1) {
      setChildren(children.filter((_, i) => i !== index));
    }
  };

  const updateChild = (index: number, field: keyof ChildForm, value: string) => {
    setChildren((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  };

  // Drawing handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(true);
    setHasSigned(true);
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1F1D1A";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  // Submit waiver
  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError("");

    const canvas = canvasRef.current;
    const signatureDataUrl = canvas?.toDataURL("image/png") || "data:image/png;base64,SIGNATURE";

    try {
      const res = await fetch("/api/waivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentFirstName: parent.firstName,
          parentLastName: parent.lastName,
          parentEmail: parent.email,
          parentPhone: parent.phone,
          emergencyContactName: emergency.name,
          emergencyContactPhone: emergency.phone,
          children: children.map((c) => ({
            firstName: c.firstName,
            lastName: c.lastName,
            dateOfBirth: c.dob || null,
            allergies: c.allergies || null,
          })),
          signatureDataUrl,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.error || "Failed to submit waiver");
        setSubmitting(false);
        return;
      }

      const result = await res.json();
      setWaiverCount(result.count || children.length);
      setCurrentStep(5);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [parent, children, emergency]);

  // Step validation
  const canProceedStep0 = parent.firstName && parent.lastName && parent.email;
  const canProceedStep1 = children.every((c) => c.firstName && c.lastName);
  const allAgreed = agreed.every(Boolean);

  return (
    <div className="pt-24 pb-16">
      <div className="container-content max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-h1 text-ink">Sign your waiver</h1>
          <p className="mt-2 text-body-l text-ink-secondary">Takes less than 90 seconds.</p>
        </div>

        <Stepper steps={steps} currentStep={currentStep} className="mb-10" />

        {error && (
          <div className="mb-6 px-4 py-3 rounded-md bg-error-light border border-error/30 text-body-s text-error">
            {error}
          </div>
        )}

        {/* Step 0: Parent info */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <h2 className="font-display text-h3 text-ink">Parent / Guardian information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First name *" placeholder="Jane" value={parent.firstName} onChange={(e) => setParent((p) => ({ ...p, firstName: e.target.value }))} required />
              <Input label="Last name *" placeholder="Smith" value={parent.lastName} onChange={(e) => setParent((p) => ({ ...p, lastName: e.target.value }))} required />
            </div>
            <Input label="Email *" type="email" placeholder="jane@example.com" value={parent.email} onChange={(e) => setParent((p) => ({ ...p, email: e.target.value }))} required />
            <Input label="Phone" type="tel" placeholder="(555) 123-4567" value={parent.phone} onChange={(e) => setParent((p) => ({ ...p, phone: e.target.value }))} />
            <Button size="lg" className="w-full" onClick={() => setCurrentStep(1)} disabled={!canProceedStep0}>
              Continue <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* Step 1: Children */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="font-display text-h3 text-ink">Children playing today</h2>
            <p className="text-body-s text-ink-secondary">Add each child who will be visiting.</p>

            {children.map((child, index) => (
              <Card key={index}>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-h4 text-ink">Child {index + 1}</h3>
                    {children.length > 1 && (
                      <button onClick={() => removeChild(index)} className="text-ink-secondary hover:text-error">
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <Input label="First name *" placeholder="Emma" value={child.firstName} onChange={(e) => updateChild(index, "firstName", e.target.value)} />
                    <Input label="Last name *" placeholder="Smith" value={child.lastName} onChange={(e) => updateChild(index, "lastName", e.target.value)} />
                  </div>
                  <Input label="Date of birth" type="date" value={child.dob} onChange={(e) => updateChild(index, "dob", e.target.value)} />
                  <Input label="Allergies or medical notes (optional)" placeholder="None" className="mt-4" value={child.allergies} onChange={(e) => updateChild(index, "allergies", e.target.value)} />
                </CardContent>
              </Card>
            ))}

            <button
              onClick={addChild}
              className="flex items-center gap-2 w-full justify-center py-3 rounded-sm border-2 border-dashed border-cream-300 text-body-s text-ink-secondary hover:border-terracotta/50 hover:text-terracotta transition-colors"
            >
              <Plus className="h-5 w-5" /> Add another child
            </button>

            <div className="flex gap-3">
              <Button variant="secondary" size="lg" onClick={() => setCurrentStep(0)}>
                <ArrowLeft className="h-5 w-5" /> Back
              </Button>
              <Button size="lg" className="flex-1" onClick={() => setCurrentStep(2)} disabled={!canProceedStep1}>
                Continue <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Emergency Contact */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="font-display text-h3 text-ink">Emergency contact</h2>
            <p className="text-body-s text-ink-secondary">Someone we can reach if you&apos;re unavailable.</p>
            <Input label="Emergency contact name" placeholder="John Smith" value={emergency.name} onChange={(e) => setEmergency((em) => ({ ...em, name: e.target.value }))} />
            <Input label="Emergency contact phone" type="tel" placeholder="(555) 987-6543" value={emergency.phone} onChange={(e) => setEmergency((em) => ({ ...em, phone: e.target.value }))} />
            <Input label="Relationship" placeholder="Spouse, grandparent, etc." value={emergency.relationship} onChange={(e) => setEmergency((em) => ({ ...em, relationship: e.target.value }))} />
            <div className="flex gap-3">
              <Button variant="secondary" size="lg" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="h-5 w-5" /> Back
              </Button>
              <Button size="lg" className="flex-1" onClick={() => setCurrentStep(3)}>
                Continue <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Waiver Review */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="font-display text-h3 text-ink">Review the waiver</h2>
            <Card className="bg-cream-50">
              <CardContent>
                <p className="text-body-m text-ink font-medium mb-3">
                  In plain language: You agree to let your child play at our facility, understand the
                  inherent risks of physical play, and confirm that your child is healthy enough to
                  participate. You also agree to our safety rules and photography policy.
                </p>
                <div className="max-h-48 overflow-y-auto rounded-sm border border-cream-300 bg-white p-4 text-body-s text-ink-secondary leading-relaxed">
                  <p className="font-medium text-ink mb-2">WAIVER AND RELEASE OF LIABILITY</p>
                  <p>
                    I, the undersigned parent/guardian, acknowledge that participation in play activities
                    at this facility involves inherent risks including, but not limited to, slips, falls,
                    collisions with other participants, and other injuries. I voluntarily assume all risks
                    associated with participation and agree to release, indemnify, and hold harmless the
                    facility, its owners, employees, and agents from any claims arising from participation.
                  </p>
                  <p className="mt-3">
                    I confirm that my child is in good health and has no conditions that would prevent safe
                    participation. I agree to abide by all facility rules and guidelines. I consent to
                    photography for facility use unless I notify staff in writing. This waiver is valid
                    for 12 months from the date of signing.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {[
                "I have read and understand the waiver and release of liability above.",
                "I confirm that my child(ren) are in good health and able to participate safely.",
                "I agree to follow all facility rules and safety guidelines.",
              ].map((text, i) => (
                <label key={i} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded accent-terracotta mt-0.5"
                    checked={agreed[i]}
                    onChange={(e) =>
                      setAgreed((prev) => prev.map((v, idx) => (idx === i ? e.target.checked : v)))
                    }
                  />
                  <span className="text-body-s text-ink">{text}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" size="lg" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="h-5 w-5" /> Back
              </Button>
              <Button size="lg" className="flex-1" onClick={() => setCurrentStep(4)} disabled={!allAgreed}>
                Accept & sign <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Signature */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="font-display text-h3 text-ink">Sign below</h2>
            <p className="text-body-s text-ink-secondary">Use your finger or mouse to draw your signature.</p>

            <div className="relative rounded-md border-2 border-cream-300 bg-white">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full h-48 cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <button
                onClick={clearSignature}
                className="absolute top-2 right-2 text-caption text-ink-secondary hover:text-error transition-colors px-2 py-1 rounded bg-cream-50"
              >
                Clear
              </button>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" size="lg" onClick={() => setCurrentStep(3)}>
                <ArrowLeft className="h-5 w-5" /> Back
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={handleSubmit}
                disabled={!hasSigned || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Submitting…
                  </>
                ) : (
                  <>
                    Submit waiver <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {currentStep === 5 && (
          <div className="text-center py-8 space-y-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-success-light flex items-center justify-center">
              <FileCheck className="h-8 w-8 text-success" />
            </div>
            <h2 className="font-display text-h2 text-ink">Waiver signed successfully!</h2>
            <p className="text-body-l text-ink-secondary max-w-md mx-auto">
              No additional forms needed today. You&apos;re ready to play.
            </p>
            <Card className="max-w-sm mx-auto">
              <CardContent className="space-y-2">
                <div className="flex justify-between text-body-s">
                  <span className="text-ink-secondary">Status</span>
                  <span className="text-success font-medium flex items-center gap-1"><Check className="h-4 w-4" /> Signed</span>
                </div>
                <div className="flex justify-between text-body-s">
                  <span className="text-ink-secondary">Valid until</span>
                  <span className="text-ink font-medium">
                    {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-body-s">
                  <span className="text-ink-secondary">Children covered</span>
                  <span className="text-ink font-medium">{waiverCount || children.length}</span>
                </div>
              </CardContent>
            </Card>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="secondary" onClick={() => (window.location.href = "/booking/open-play")}>
                Book a session
              </Button>
              <Button onClick={() => (window.location.href = "/")}>
                Back to home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
