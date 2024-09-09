import OtpLogin from '@/components/OtpLogin';

const LoginPage = () => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-5 text-center font-bold">
        How to Add One-Time Password Phone Authentication
      </h1>
      <OtpLogin />
    </div>
  );
};

export default LoginPage;
