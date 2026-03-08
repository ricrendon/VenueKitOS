"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui";
import { Camera, AlertCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export function QrScannerModal({ open, onClose, onScan }: QrScannerModalProps) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      hasScannedRef.current = false;
      return;
    }

    setError(null);
    const readerId = "qr-reader-container";

    // Small delay to let the modal DOM render
    const timer = setTimeout(() => {
      const scanner = new Html5Qrcode(readerId);
      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (hasScannedRef.current) return;
            hasScannedRef.current = true;

            // Stop the scanner and notify parent
            scanner
              .stop()
              .then(() => {
                scanner.clear();
                scannerRef.current = null;
                onScan(decodedText);
              })
              .catch(() => {
                onScan(decodedText);
              });
          },
          () => {
            // Ignore scan failures (no QR found in frame)
          }
        )
        .catch((err: Error) => {
          if (
            err.message?.includes("Permission") ||
            err.message?.includes("NotAllowedError")
          ) {
            setError(
              "Camera permission denied. Please allow camera access in your browser settings."
            );
          } else if (
            err.message?.includes("NotFoundError") ||
            err.message?.includes("device")
          ) {
            setError(
              "No camera found. Please connect a camera and try again."
            );
          } else {
            setError("Unable to start camera. Please try again.");
          }
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          })
          .catch(() => {
            scannerRef.current = null;
          });
      }
    };
  }, [open, onScan]);

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
          onClose();
        })
        .catch(() => {
          scannerRef.current = null;
          onClose();
        });
    } else {
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Scan QR Code" size="md">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-body-s text-ink-secondary">
          <Camera className="h-4 w-4" />
          <span>Point the camera at the ticket QR code</span>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <AlertCircle className="h-10 w-10 text-error" />
            <p className="text-body-s text-error text-center">{error}</p>
          </div>
        ) : (
          <div
            id="qr-reader-container"
            className="rounded-sm overflow-hidden"
          />
        )}
      </div>
    </Modal>
  );
}
