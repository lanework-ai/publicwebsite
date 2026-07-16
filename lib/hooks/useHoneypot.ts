import { useState, useCallback } from 'react';

export interface HoneypotField {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  props: {
    type: string;
    name: string;
    tabIndex: number;
    autoComplete: string;
    style: React.CSSProperties;
    'aria-hidden': boolean;
  };
}

export interface UseHoneypotReturn {
  honeypotField: HoneypotField;
  isBot: boolean;
  reset: () => void;
}


export function useHoneypot(): UseHoneypotReturn {
  const [honeypotValue, setHoneypotValue] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHoneypotValue(e.target.value);
  }, []);

  const reset = useCallback(() => {
    setHoneypotValue('');
  }, []);

  const honeypotField: HoneypotField = {
    value: honeypotValue,
    onChange: handleChange,
    props: {
      type: 'text',
      name: 'website',
      tabIndex: -1,
      autoComplete: 'off',
      style: {
        position: 'absolute',
        left: '-9999px',
        width: '1px',
        height: '1px',
        opacity: 0,
      },
      'aria-hidden': true,
    },
  };

  return {
    honeypotField,
    isBot: honeypotValue.trim() !== '',
    reset,
  };
}
