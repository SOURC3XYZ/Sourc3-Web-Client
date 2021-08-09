import React from 'react';

export const isNil = (value: any) => value == null;

export const createChangeHandler = (setFn: (value: string) => void) => (
  event: React.ChangeEvent<HTMLInputElement>,
) => {
  setFn(event.target.value);
};