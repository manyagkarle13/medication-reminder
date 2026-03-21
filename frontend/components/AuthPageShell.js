"use client";

export default function AuthPageShell({
  eyebrow = "Medication Adherence",
  title,
  description,
  badge,
  formTitle,
  formDescription,
  footer,
  children,
}) {
  return (
    <>
      <main className="auth-shell">
        <section className="hero-panel">
          <div className="hero-glow glow-a" />
          <div className="hero-glow glow-b" />

          <div className="hero-copy">
            <span className="eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          <div className="hero-art" aria-hidden="true">
            <div className="bubble bubble-a" />
            <div className="bubble bubble-b" />
            <div className="bubble bubble-c" />
            <div className="pill pill-blue" />
            <div className="pill pill-white" />
            <div className="ring-pill" />
            <div className="phone-shadow" />
            <div className="phone">
              <div className="phone-screen">
                <div className="screen-header">
                  <span>Today</span>
                  <strong>3 of 4 doses</strong>
                </div>
                <div className="screen-progress">
                  <span />
                </div>
                <div className="screen-card card-done">
                  <em />
                  <div>
                    <strong>Vitamin D</strong>
                    <small>08:00 AM</small>
                  </div>
                </div>
                <div className="screen-card card-next">
                  <em />
                  <div>
                    <strong>Metformin</strong>
                    <small>01:30 PM</small>
                  </div>
                </div>
                <div className="screen-pill-row">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div className="capsule capsule-main">
                <span />
              </div>
            </div>
          </div>
        </section>

        <section className="form-panel">
          <div className="form-card">
            <div className="card-intro">
              <span className="badge">{badge}</span>
              <h2>{formTitle}</h2>
              <p>{formDescription}</p>
            </div>

            {children}

            <div className="footer-text">{footer}</div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .auth-shell {
          --ink-900: #2f364f;
          --ink-700: #485272;
          --ink-500: #667299;
          --rose-100: #ffe7e6;
          --rose-200: #ffd8d4;
          --orange-400: #ff9956;
          --orange-500: #ff8540;
          --sky-400: #6da8ff;

          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          background:
            radial-gradient(circle at 12% 8%, rgba(255, 255, 255, 0.72), transparent 30%),
            radial-gradient(circle at 88% 86%, rgba(255, 189, 151, 0.24), transparent 34%),
            linear-gradient(140deg, #fff1ee 0%, #ffe5df 38%, #ffeede 100%);
          overflow: hidden;
          font-family: "Sora", "Manrope", "Segoe UI", sans-serif;
        }

        .hero-panel {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 76px 56px 76px 84px;
        }

        .hero-glow {
          position: absolute;
          border-radius: 999px;
          filter: blur(34px);
          pointer-events: none;
          z-index: 0;
        }

        .glow-a {
          width: 260px;
          height: 180px;
          left: 8%;
          top: 8%;
          background: rgba(255, 153, 86, 0.28);
          animation: pulse 8s ease-in-out infinite;
        }

        .glow-b {
          width: 230px;
          height: 170px;
          left: 44%;
          bottom: 8%;
          background: rgba(109, 168, 255, 0.24);
          animation: pulse 7s ease-in-out infinite reverse;
        }

        .hero-copy {
          max-width: 430px;
          position: relative;
          z-index: 2;
        }

        .eyebrow {
          display: inline-block;
          margin-bottom: 18px;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          font-size: 0.72rem;
          color: rgba(72, 82, 114, 0.58);
        }

        .hero-copy h1 {
          margin: 0;
          font-size: clamp(2.4rem, 4.6vw, 4.3rem);
          line-height: 0.96;
          letter-spacing: -0.05em;
          color: var(--ink-900);
          max-width: 540px;
          text-wrap: balance;
        }

        .hero-copy p {
          margin: 22px 0 0;
          max-width: 360px;
          font-size: 1.02rem;
          line-height: 1.68;
          color: var(--ink-700);
        }

        .hero-art {
          position: absolute;
          right: 4%;
          top: 51%;
          width: min(39vw, 520px);
          height: min(34vw, 460px);
          transform: translateY(-50%);
          pointer-events: none;
          filter: saturate(1.08);
        }

        .bubble {
          position: absolute;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: radial-gradient(circle at 35% 30%, #8bb8ff, #4477d9 68%);
          box-shadow: 0 10px 20px rgba(68, 119, 217, 0.24);
          animation: floaty 5.2s ease-in-out infinite;
        }

        .bubble-a {
          top: 12%;
          left: 18%;
          animation-delay: -0.8s;
        }

        .bubble-b {
          top: 34%;
          left: 6%;
          width: 14px;
          height: 14px;
          animation-delay: -2s;
        }

        .bubble-c {
          right: 8%;
          top: 46%;
          width: 12px;
          height: 12px;
          animation-delay: -1.2s;
        }

        .phone-shadow {
          position: absolute;
          inset: auto 6% 10% auto;
          width: 218px;
          height: 38px;
          border-radius: 999px;
          background: rgba(116, 79, 84, 0.22);
          filter: blur(22px);
          transform: rotate(-12deg);
          animation: sway-shadow 5.5s ease-in-out infinite;
        }

        .phone {
          position: absolute;
          right: 12%;
          top: 18%;
          width: 232px;
          height: 324px;
          border-radius: 36px;
          background: linear-gradient(160deg, #8f8c98, #d3ccd5 38%, #7f7b89 100%);
          box-shadow:
            0 44px 64px rgba(115, 88, 92, 0.29),
            inset 0 3px 6px rgba(255, 255, 255, 0.5);
          transform: rotate(18deg);
          animation: sway 5.5s ease-in-out infinite;
        }

        .phone-screen {
          position: absolute;
          inset: 12px;
          border-radius: 28px;
          background:
            radial-gradient(circle at 18% 10%, rgba(255, 255, 255, 0.9), transparent 28%),
            linear-gradient(180deg, #ffffff 0%, #f0ecf3 100%);
          box-shadow: inset 0 2px 10px rgba(105, 92, 99, 0.08);
          padding: 18px 14px 14px;
          display: grid;
          align-content: start;
          gap: 10px;
          overflow: hidden;
        }

        .screen-header {
          display: grid;
          gap: 2px;
        }

        .screen-header span {
          font-size: 0.58rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(70, 83, 121, 0.62);
          font-weight: 700;
        }

        .screen-header strong {
          font-size: 0.82rem;
          color: #364164;
          letter-spacing: -0.01em;
        }

        .screen-progress {
          height: 8px;
          border-radius: 999px;
          background: rgba(125, 151, 210, 0.2);
          overflow: hidden;
        }

        .screen-progress span {
          display: block;
          width: 72%;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #78adff 0%, #4e88f7 100%);
        }

        .screen-card {
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 12px;
          padding: 9px 8px;
          box-shadow: 0 8px 16px rgba(64, 84, 132, 0.08);
        }

        .screen-card em {
          width: 26px;
          height: 26px;
          border-radius: 999px;
          display: block;
          flex-shrink: 0;
          position: relative;
        }

        .screen-card div {
          display: grid;
          line-height: 1.1;
        }

        .screen-card strong {
          font-size: 0.64rem;
          color: #2f3c62;
          letter-spacing: 0.01em;
        }

        .screen-card small {
          font-size: 0.54rem;
          color: rgba(65, 80, 119, 0.66);
        }

        .card-done {
          background: rgba(122, 190, 132, 0.16);
          border: 1px solid rgba(92, 159, 103, 0.2);
        }

        .card-done em {
          background: linear-gradient(160deg, #8ad596 0%, #56b86d 100%);
        }

        .card-done em::after {
          content: "";
          position: absolute;
          left: 9px;
          top: 6px;
          width: 6px;
          height: 10px;
          border: solid rgba(255, 255, 255, 0.95);
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .card-next {
          background: rgba(118, 153, 255, 0.14);
          border: 1px solid rgba(97, 132, 235, 0.2);
        }

        .card-next em {
          background: linear-gradient(160deg, #8db4ff 0%, #5a89ea 100%);
        }

        .card-next em::after {
          content: "";
          position: absolute;
          left: 8px;
          top: 8px;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.88);
        }

        .screen-pill-row {
          margin-top: 2px;
          display: flex;
          justify-content: space-between;
          gap: 5px;
        }

        .screen-pill-row span {
          height: 7px;
          border-radius: 999px;
          background: rgba(140, 155, 200, 0.26);
          flex: 1;
        }

        .capsule {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
        }

        .capsule-main {
          width: 122px;
          height: 66px;
          left: -30px;
          top: 110px;
          background: linear-gradient(135deg, #ffffff 0%, #fffef8 46%, #ff9a32 47%, #ff7d18 100%);
          box-shadow:
            0 30px 34px rgba(255, 128, 39, 0.32),
            inset 0 2px 3px rgba(255, 255, 255, 0.7);
        }

        .capsule-main span {
          width: 52px;
          height: 52px;
          border-radius: 999px;
          background: #f8f4ef;
          box-shadow: inset 0 -3px 5px rgba(0, 0, 0, 0.05);
        }

        .pill {
          position: absolute;
          border-radius: 999px;
          box-shadow: 0 22px 28px rgba(104, 80, 87, 0.17);
        }

        .pill-blue {
          width: 98px;
          height: 44px;
          left: 17%;
          bottom: 14%;
          background: linear-gradient(90deg, #ffffff 0%, #ffffff 49%, #63a8ff 50%, #3f82f0 100%);
          transform: rotate(24deg);
          animation: floaty 5.8s ease-in-out infinite;
          animation-delay: -1.3s;
        }

        .pill-white {
          width: 90px;
          height: 90px;
          left: 10%;
          top: 44%;
          border-radius: 50%;
          background: linear-gradient(160deg, #ffffff 0%, #f1eef3 100%);
          box-shadow:
            0 26px 36px rgba(116, 91, 95, 0.16),
            inset 0 -4px 8px rgba(121, 100, 107, 0.09);
          animation: floaty 6s ease-in-out infinite;
          animation-delay: -0.9s;
        }

        .pill-white::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 16%;
          width: 3px;
          height: 68%;
          transform: translateX(-50%);
          border-radius: 999px;
          background: rgba(120, 110, 122, 0.14);
        }

        .ring-pill {
          position: absolute;
          width: 116px;
          height: 116px;
          left: 28%;
          top: 6%;
          border-radius: 50%;
          border: 20px solid #f5b03b;
          box-shadow:
            0 24px 34px rgba(197, 138, 38, 0.24),
            inset 0 4px 6px rgba(255, 255, 255, 0.4);
          transform: rotate(18deg);
          animation: floaty 5.2s ease-in-out infinite;
        }

        .form-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          position: relative;
        }

        .form-card {
          width: min(100%, 440px);
          padding: 36px;
          border-radius: 34px;
          background: rgba(255, 252, 250, 0.76);
          border: 1px solid rgba(255, 255, 255, 0.86);
          box-shadow:
            0 30px 90px rgba(146, 104, 109, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
          position: relative;
          overflow: hidden;
        }

        .form-card::before {
          content: "";
          position: absolute;
          inset: -30% auto auto -20%;
          width: 170px;
          height: 170px;
          border-radius: 50%;
          background: rgba(255, 153, 86, 0.18);
          filter: blur(16px);
          pointer-events: none;
        }

        .card-intro {
          position: relative;
          z-index: 1;
        }

        .card-intro h2 {
          margin: 14px 0 8px;
          font-size: 2rem;
          letter-spacing: -0.04em;
          color: var(--ink-900);
        }

        .card-intro p {
          margin: 0 0 24px;
          color: rgba(72, 82, 114, 0.78);
          line-height: 1.58;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.82);
          color: #d5635f;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .footer-text {
          margin: 24px 0 0;
          text-align: center;
          color: rgba(80, 63, 70, 0.72);
          position: relative;
          z-index: 1;
        }

        .footer-text :global(a) {
          color: #da6454;
          text-decoration: none;
          font-weight: 700;
        }

        @keyframes floaty {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }

          50% {
            transform: translateY(-10px) rotate(2deg);
          }
        }

        @keyframes sway {
          0%,
          100% {
            transform: rotate(18deg) translateY(0px);
          }

          50% {
            transform: rotate(16deg) translateY(-7px);
          }
        }

        @keyframes sway-shadow {
          0%,
          100% {
            transform: rotate(-12deg) translateY(0px);
          }

          50% {
            transform: rotate(-10deg) translateY(-7px);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.75;
            transform: scale(1);
          }

          50% {
            opacity: 0.95;
            transform: scale(1.08);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bubble,
          .pill-blue,
          .pill-white,
          .ring-pill,
          .phone,
          .phone-shadow,
          .glow-a,
          .glow-b {
            animation: none;
          }
        }

        @media (max-width: 980px) {
          .auth-shell {
            grid-template-columns: 1fr;
          }

          .hero-panel {
            min-height: 50vh;
            padding: 44px 24px 8px;
          }

          .hero-copy {
            max-width: 100%;
          }

          .hero-art {
            position: relative;
            right: auto;
            top: auto;
            width: min(88vw, 420px);
            height: 300px;
            transform: none;
            margin: 28px auto 0;
          }

          .form-panel {
            padding: 8px 18px 32px;
          }
        }

        @media (max-width: 640px) {
          .hero-panel {
            padding: 28px 18px 0;
          }

          .hero-copy h1 {
            font-size: 2.25rem;
          }

          .hero-copy p {
            font-size: 0.95rem;
          }

          .hero-art {
            height: 240px;
          }

          .phone {
            width: 170px;
            height: 244px;
            right: 12%;
          }

          .capsule-main {
            width: 90px;
            height: 48px;
            top: 82px;
            left: -20px;
          }

          .pill-blue {
            width: 72px;
            height: 34px;
          }

          .pill-white {
            width: 68px;
            height: 68px;
          }

          .ring-pill {
            width: 82px;
            height: 82px;
            border-width: 15px;
          }

          .form-card {
            padding: 24px 18px;
            border-radius: 24px;
          }
        }
      `}</style>
    </>
  );
}
