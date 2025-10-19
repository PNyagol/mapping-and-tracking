import { CONFIG } from 'src/config-global';
import { RequestResetPasswordView } from '../sections/auth/request-password-reset-view';
import { ResetPasswordView } from '../sections/auth/reset-password-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Request Reset Password - ${CONFIG.appName}`}</title>

      <ResetPasswordView />
    </>
  );
}
