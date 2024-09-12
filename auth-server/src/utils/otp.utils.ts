const DEFAULT_OTP_LENGTH = 6;

export function generateOTP(optLength: number = DEFAULT_OTP_LENGTH) {
  let otp = "";

  for (let index = 0; index < optLength; index++) {
    otp += Math.floor(Math.random() * 10) + "";
  }

  return otp;
}
