// by claude: small reusable scroll-reveal / fade-up animation (motion library)
import { motion } from "motion/react";

const FadeIn = ({ children, delay = 0, y = 24, className = "", as = "div" }) => {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </Tag>
  );
};

export default FadeIn;
