import React, { useRef, useState } from 'react';
import { View, TextInput, type NativeSyntheticEvent, type TextInputKeyPressEventData } from 'react-native';

const OTP_LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function OtpInput({ value, onChange }: OtpInputProps): React.ReactElement {
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length: OTP_LENGTH }, (_, idx) => value[idx] ?? ''),
  );

  const updateDigits = (next: string[]): void => {
    setDigits(next);
    onChange(next.join(''));
  };

  const handleChange = (text: string, index: number): void => {
    if (text.length > 1) {
      // Paste support
      const pasted = text.replace(/\D/g, '').slice(0, OTP_LENGTH);
      const next = Array.from(
        { length: OTP_LENGTH },
        (_, idx) => pasted[idx] ?? '',
      );
      updateDigits(next);
      const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
      inputRefs.current[focusIdx]?.focus();
      return;
    }

    const digit = text.replace(/\D/g, '');
    const next = [...digits];
    next[index] = digit;
    updateDigits(next);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ): void => {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const next = [...digits];
      next[index - 1] = '';
      updateDigits(next);
    }
  };

  return (
    <View className="flex-row gap-2 justify-center">
      {Array.from({ length: OTP_LENGTH }, (_, idx) => (
        <TextInput
          key={idx}
          ref={(ref) => {
            inputRefs.current[idx] = ref;
          }}
          value={digits[idx]}
          onChangeText={(text) => handleChange(text, idx)}
          onKeyPress={(event) => handleKeyPress(event, idx)}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          selectTextOnFocus
          className={[
            'w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-surface text-text',
            digits[idx] ? 'border-primary' : 'border-border',
          ].join(' ')}
        />
      ))}
    </View>
  );
}
