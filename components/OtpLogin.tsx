'use client';

import {
  RecaptchaVerifier,
  ConfirmationResult,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingIndicator } from '@/components/ui/loadingIndicator';
import { auth } from '@/firebase';

const OtpLogin = () => {
  const router = useRouter();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [recaptchaVerifier, setRecaptchaVerifier] =
    useState<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  useEffect(() => {
    const recaptchaVerifier = new RecaptchaVerifier(
      auth,
      'recaptcha-container',
      {
        size: 'invisible',
      }
    );

    setRecaptchaVerifier(recaptchaVerifier);

    return () => recaptchaVerifier.clear();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  const requestOtp = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();

    setResendCountdown(60);

    startTransition(async () => {
      setError('');

      if (!recaptchaVerifier) {
        return setError('RecaptchaVerifier is not initialized.');
      }

      try {
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          recaptchaVerifier
        );

        setConfirmationResult(confirmationResult);
        setSuccess('OTP sent successfully.');
      } catch (err: any) {
        console.log(err);
        setResendCountdown(0);

        if (err.code === 'auth/invalid-phone-number') {
          setError('Invalid phone number. Please check the number.');
        } else if (err.code === 'auth/too-many-requests') {
          setError('Too many requests. Please try again later.');
        } else {
          setError('Failed to send OTP. Please try again.');
        }
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {!confirmationResult && (
        <form onSubmit={requestOtp}>
          <Input
            className="text-black"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <p className="mt-2 text-xs text-gray-400">
            Please enter your number with the country code (i.e. +44 for UK)
          </p>
        </form>
      )}

      <Button
        disabled={!phoneNumber || isPending || resendCountdown > 0}
        onClick={() => requestOtp()}
        className="mt-5"
      >
        {resendCountdown > 0
          ? `Resend OTP in ${resendCountdown}`
          : isPending
          ? 'Sending OTP'
          : 'Send OTP'}
      </Button>

      <div className="p-10 text-center">
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
      </div>

      <div id="recaptcha-container" />

      {isPending && <LoadingIndicator />}
    </div>
  );
};

export default OtpLogin;
