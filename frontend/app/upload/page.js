import OCRUpload from "../../components/OCRUpload";

export default function UploadPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "24px",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.9), transparent 28%), linear-gradient(135deg, #fff1e7 0%, #ffe2d2 100%)",
      }}
    >
      <OCRUpload />
    </main>
  );
}
