import { useStyles, useState } from 'react';

interface Props {
  children: React.ReactNode;
  type?: 'submit' | 'button' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  className?: string;
}

export default function OcxBasicButton(props: Props) {
  const { type = 'button', children, onClick, className = '' } = props;
  return (
    <button
      className={`main-font border border-grey-light p-5 button-bg focus:outline-none rounded text-white hover-transition cursor-pointer rounded focus:outline-none focus:shadow-outline ${className}`}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
}