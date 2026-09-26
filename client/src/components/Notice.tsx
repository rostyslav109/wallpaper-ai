export type NoticeVariant = "welcome" | "upsell" | "paid";

type Props = {
  variant: NoticeVariant;
  onClose: () => void;
  onGetCredits: () => void;
};

const CONTENT = {
  welcome: {
    title: "Welcome aboard! 🎨",
    text: "You've got 2 free generations to see the magic. Want gallery-quality results? Credits unlock our premium model.",
  },
  upsell: {
    title: "Like it? This is just the preview.",
    text: "Premium credits give you sharper details, richer brushstrokes, full resolution — and no watermark.",
  },
  paid: {
    title: "Thank you! 🎉",
    text: "Your payment went through. Credits appear in your balance within a few seconds.",
  },
};

// Невелике спливаюче повідомлення в правому нижньому куті
export function Notice({ variant, onClose, onGetCredits }: Props) {
  const { title, text } = CONTENT[variant];

  return (
    <div className="notice" role="status">
      <h3>{title}</h3>
      <p>{text}</p>

      <div className="notice-actions">
        {variant === "upsell" ? (
          <>
            <button className="btn btn-ghost" onClick={onClose}>
              Maybe later
            </button>
            <button className="btn btn-primary" onClick={onGetCredits}>
              Get credits
            </button>
          </>
        ) : (
          <button className="btn btn-primary" onClick={onClose}>
            {variant === "welcome" ? "Start creating" : "Got it"}
          </button>
        )}
      </div>
    </div>
  );
}
