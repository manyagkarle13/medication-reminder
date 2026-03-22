"use client";

export default function OCRUpload() {
  return (
    <>
      <section className="upload-card">
        <p className="eyebrow">Prescription upload</p>
        <h1>Upload support is being prepared.</h1>
        <p className="copy">
          This page is now wired correctly so the app builds, and it gives you a
          clear placeholder for adding OCR-based prescription parsing next.
        </p>

        <div className="actions">
          <a href="/dashboard">Go to dashboard</a>
          <a href="/login" className="secondary">
            Back to login
          </a>
        </div>
      </section>

      <style jsx>{`
        .upload-card {
          max-width: 760px;
          margin: 0 auto;
          padding: 32px;
          border: 1px solid rgba(215, 121, 73, 0.18);
          border-radius: 28px;
          background:
            radial-gradient(circle at top left, rgba(255, 255, 255, 0.95), transparent 36%),
            linear-gradient(145deg, #fff7f0, #ffe9dc);
          box-shadow: 0 24px 54px rgba(143, 91, 66, 0.15);
          color: #2f3347;
        }

        .eyebrow {
          margin: 0 0 10px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 0.75rem;
          font-weight: 700;
          color: #a45b3a;
        }

        h1 {
          margin: 0 0 12px;
          font-size: clamp(2rem, 5vw, 3rem);
          line-height: 1.05;
        }

        .copy {
          margin: 0;
          max-width: 52ch;
          line-height: 1.7;
          color: #5a607a;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
        }

        a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 160px;
          padding: 12px 16px;
          border-radius: 14px;
          text-decoration: none;
          font-weight: 700;
          background: linear-gradient(135deg, #ff9b60, #ff7f49);
          color: #fff;
        }

        .secondary {
          background: rgba(76, 102, 170, 0.12);
          color: #36519a;
        }
      `}</style>
    </>
  );
}
