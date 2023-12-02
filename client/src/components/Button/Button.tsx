import classNames from 'classnames';
import { ButtonProps } from './ButtonTypes';
import './Button.scss';

function Button({
  children,
  primary,
  secondary,
  success,
  warning,
  fail,
  rounded,
  ghost,
  large,
  ...rest
}: ButtonProps) {
  const classes = classNames(rest.className, 'btn', {
    'btn--primary': primary,
    'btn--second': secondary,
    'btn--success': success,
    'btn--warning': warning,
    'btn--fail': fail,
    'btn--rounded': rounded,
    'btn--ghost': ghost,
    'btn--large': large,
    'text--blue-500': primary && ghost,
    'text--cyan-500': secondary && ghost,
    'text--green-500': success && ghost,
    'text--yellow-500': warning && ghost,
    'text--red-500': fail && ghost,
  });

  //className makes sure the classes are correctly written. rest.className is important to make sure, that this object doesn't overwrite the custom classNames, passed in by props. Like this they get added to the object before being overwritten.

  return (
    <button type="button" {...rest} className={classes}>
      {children}
    </button>
  );
}

//with {...rest} we pass down all the other props (like different event handlers) directly down to the underlying button component

export default Button;
