import {useState, useEffect} from 'react';
import {logger} from '../../../util/logger';

const RegisterPwdValidator = ({inputPassword}: {inputPassword: string}) => {
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const validatePassword = (password: string) => {
    const lengthRegex = /.{8,}/;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const numberRegex = /\d/;
    const specialCharRegex = /[!@#$%^&*]/;

    setValidations({
      length: lengthRegex.test(password),
      uppercase: uppercaseRegex.test(password),
      lowercase: lowercaseRegex.test(password),
      number: numberRegex.test(password),
      specialChar: specialCharRegex.test(password),
    });
  };

  useEffect(() => {
    validatePassword(inputPassword);
    logger.log('pw validator active');
  }, [inputPassword]);

  return (
    <div>
      <div className="password-validation-messages">
        {validations.length || inputPassword === '' ? null : (
          <p>Password must be at least 8 characters long.</p>
        )}
        {validations.lowercase || inputPassword === '' ? null : (
          <p>Password must have at least one lowercase letter.</p>
        )}
        {validations.uppercase || inputPassword === '' ? null : (
          <p>Password must have at least one uppercase letter.</p>
        )}
        {validations.number || inputPassword === '' ? null : (
          <p>Password must have at least one number.</p>
        )}
        {validations.specialChar || inputPassword === '' ? null : (
          <p>Password must have at least one special character.</p>
        )}
      </div>
    </div>
  );
};

export default RegisterPwdValidator;
