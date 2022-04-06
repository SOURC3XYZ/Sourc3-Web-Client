import React, { useState, useRef, useCallback } from 'react';

import {
  Popup, Button, Input, Splash,
} from '@app/shared/components';

import { ROUTES } from '@app/shared/constants';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { startWallet } from '@app/containers/Auth/store/actions';
import { setError } from '@app/shared/store/actions';
import { selectErrorMessage } from '@app/shared/store/selectors';
import { css } from '@linaria/core';

const formClassName = css`
position: absolute;
left: 40px;
top: 395px;
right: 40px;
`;
const buttonClassName = css`
margin-bottom: 20px !important;
`;

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [warningVisible, toggleWarning] = useState(false);

  const error = useSelector(selectErrorMessage());

  const inputRef = useRef<HTMLInputElement>();

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      const { value } = inputRef.current;

      dispatch(setError(null));
      dispatch(startWallet.request(value));
    },
    [dispatch],
  );

  return (
    <>
      <Splash size="large">
        <form autoComplete="off" noValidate onSubmit={handleSubmit} className={formClassName}>
          <Input
            autoFocus
            name="password"
            type="password"
            placeholder="Password"
            margin={40}
            valid={!error}
            label={error}
            ref={inputRef}
            password
          />
          <Button type="submit" className={buttonClassName}>
            Open
          </Button>
          <Button
            variant="link"
            onClick={(event) => {
              event.preventDefault();
              toggleWarning(true);
            }}
          >
            Restore or create new
          </Button>
        </form>
      </Splash>
      <Popup
        visible={warningVisible}
        title="Restore web client or create a new one"
        footer
        confirmButton={(
          <Button onClick={() => navigate(ROUTES.AUTH.BASE)}>
            I agree
          </Button>
        )}
        onCancel={() => {
          toggleWarning(false);
        }}
      >
        If you&apos;ll restore a wallet all transaction history and addresses will be lost
      </Popup>
    </>
  );
};

export default Login;
