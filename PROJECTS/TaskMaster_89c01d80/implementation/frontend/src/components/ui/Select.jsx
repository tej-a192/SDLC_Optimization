import React from 'react';
import PropTypes from 'prop-types';

const Select = ({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  className,
  ...props
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        disabled ? 'bg-gray-100 text-gray-500' : 'bg-white'
      } ${className}`}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

Select.propTypes = {
  /**
   * Array of option objects with value and label properties
   */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  /**
   * Selected value
   */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /**
   * Change handler function
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Placeholder text
   */
  placeholder: PropTypes.string,
  /**
   * Whether the select is disabled
   */
  disabled: PropTypes.bool,
  /**
   * Additional CSS classes
   */
  className: PropTypes.string,
};

Select.defaultProps = {
  value: '',
  placeholder: '',
  disabled: false,
  className: '',
};

export default Select;