import type { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
  }
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 25 
    }
  }
};

export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren
    }
  }
});

export const cardHover = {
  rest: { 
    y: 0, 
    scale: 1, 
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.01)',
    borderColor: 'rgba(226, 232, 240, 0.6)'
  },
  hover: { 
    y: -4, 
    scale: 1.01,
    boxShadow: '0 12px 30px rgba(255, 107, 53, 0.06)',
    borderColor: 'rgba(255, 107, 53, 0.3)',
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  }
};

export const buttonHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02, y: -1 },
  tap: { scale: 0.98 }
};

export const pageTransition: Variants = {
  initial: { opacity: 0, scale: 0.99, filter: 'blur(4px)' },
  animate: { 
    opacity: 1, 
    scale: 1, 
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { 
    opacity: 0, 
    scale: 0.99, 
    filter: 'blur(4px)',
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  }
};
