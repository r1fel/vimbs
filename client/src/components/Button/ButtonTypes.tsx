export interface ButtonProps {
  children: React.ReactNode;
  primary?: boolean;
  secondary?: boolean;
  success?: boolean;
  warning?: boolean;
  fail?: boolean;
  rounded?: boolean;
  ghost?: boolean;
  large?: boolean;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onHover?: () => void;
}
