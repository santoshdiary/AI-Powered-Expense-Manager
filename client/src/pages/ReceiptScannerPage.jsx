import React from "react";
export function ReceiptScannerPage({
  busy,
  scanReceipt,
  receiptText,
  setReceiptText,
  onGoTransactions,
}) {
  return (
    <>
      <section className="receipt-hero">
        <div>
          <span className="hero-tag">LESS TYPING, MORE CLARITY</span>
          <h2>Your receipt. Digitised in seconds.</h2>
          <p>
            Upload a clear receipt image and let OCR extract text. Always review
            detected values before saving.
          </p>
        </div>
        <div className="receipt-illustration">
          ▤<span>OCR</span>
        </div>
      </section>
      <section className="panel receipt-panel">
        <div className="upload-zone">
          <div className="upload-large">↑</div>
          <h3>{busy ? "Reading your receipt…" : "Upload a receipt image"}</h3>
          <p className="muted">JPG, PNG or WEBP · Maximum 5 MB</p>
          <label className="upload-btn">
            {busy ? "Processing…" : "Choose image"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={scanReceipt}
              hidden
              disabled={busy}
            />
          </label>
        </div>
        {receiptText && (
          <div className="receipt-result">
            <div className="panel-head">
              <div>
                <h3>Extracted receipt text</h3>
                <p className="muted">
                  Check for OCR mistakes before using these details.
                </p>
              </div>
              <span className="pill">Needs review</span>
            </div>
            <textarea
              rows="9"
              value={receiptText}
              onChange={(e) => setReceiptText(e.target.value)}
            />
            <button onClick={onGoTransactions}>
              Continue to transaction form →
            </button>
          </div>
        )}
      </section>
      <p className="muted">
        Note: receipt scanning requires the configured backend OCR endpoint.
        This screen does not pretend to extract data until the server responds.
      </p>
    </>
  );
}
