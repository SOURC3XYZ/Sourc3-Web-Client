import {
  createEffect, createEvent, restore, sample,
} from 'effector';

import { createAddress } from '@app/core/api';
import { compact, preventEvent } from '@app/core/utils';
import React from 'react';
import { gotoWallet } from '@app/model/view';

const copyToClipboard = (value: string) => navigator.clipboard.writeText(value);

export const getAddressFx = createEffect(createAddress);

export const $address = restore(getAddressFx.doneData, '');

export const $addressPreview = $address.map(compact);

export const copyToClipboardFx = createEffect(copyToClipboard);

export const onSubmit = createEvent<React.SyntheticEvent>();

onSubmit.watch((event) => {
  preventEvent(event);
  gotoWallet();
});

// copy address to clipboard on submit
sample({
  source: $address,
  clock: onSubmit,
  target: copyToClipboardFx,
});