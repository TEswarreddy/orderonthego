import { useState } from "react";
import { Shield, Mail, Phone, RefreshCw } from "lucide-react";
import axios from "../api/axios";

const VerificationModal = ({ email, phone, onVerificationComplete, onSkip }) => {
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(true); // Email is sent automatically on registration
  const [phoneSent, setPhoneSent] = useState(false);

  const verifyEmail = async () => {
    if (!emailCode || emailCode.length !== 6) {
      alert("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/verification/verify-email", {
        email,
        code: emailCode,
      });
      setEmailVerified(true);
      alert("✅ Email verified successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyPhone = async () => {
    if (!phoneCode || phoneCode.length !== 6) {
      alert("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/verification/verify-phone", {
        email,
        code: phoneCode,
      });
      setPhoneVerified(true);
      alert("✅ Phone verified successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async () => {
    setLoading(true);
    try {
      await axios.post("/verification/send-email", { email });
      setEmailSent(true);
      alert("📧 Verification code sent to your email!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const sendPhoneCode = async () => {
    if (!phone) {
      alert("Phone number is required for verification");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/verification/send-phone", { email, phone });
      setPhoneSent(true);
      alert("📱 Verification code sent to your email (SMS coming soon)!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    if (onVerificationComplete) {
      onVerificationComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Verify Your Account</h2>
              <p className="text-sm opacity-90">Secure your account with verification</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Email Verification */}
          <div className="border border-gray-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${emailVerified ? 'bg-green-100' : 'bg-orange-100'}`}>
                  <Mail className={`w-6 h-6 ${emailVerified ? 'text-green-600' : 'text-orange-600'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Email Verification</h3>
                  <p className="text-sm text-gray-600">{email}</p>
                </div>
              </div>
              {emailVerified && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                  ✓ Verified
                </span>
              )}
            </div>

            {!emailVerified && (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  {emailSent ? "Enter the 6-digit code sent to your email" : "Click send to receive verification code"}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength="6"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-2xl font-bold tracking-widest"
                  />
                  <button
                    onClick={verifyEmail}
                    disabled={loading || emailCode.length !== 6}
                    className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    Verify
                  </button>
                </div>
                <button
                  onClick={resendEmail}
                  disabled={loading}
                  className="mt-3 text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Resend Code
                </button>
              </>
            )}
          </div>

          {/* Phone Verification (Optional) */}
          {phone && (
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${phoneVerified ? 'bg-green-100' : 'bg-blue-100'}`}>
                    <Phone className={`w-6 h-6 ${phoneVerified ? 'text-green-600' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Phone Verification</h3>
                    <p className="text-sm text-gray-600">{phone}</p>
                    <p className="text-xs text-gray-500">(Optional)</p>
                  </div>
                </div>
                {phoneVerified && (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    ✓ Verified
                  </span>
                )}
              </div>

              {!phoneVerified && (
                <>
                  {!phoneSent ? (
                    <button
                      onClick={sendPhoneCode}
                      disabled={loading}
                      className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold"
                    >
                      Send Verification Code
                    </button>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-3">
                        Enter the 6-digit code sent to your email
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="000000"
                          maxLength="6"
                          value={phoneCode}
                          onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, ""))}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-bold tracking-widest"
                        />
                        <button
                          onClick={verifyPhone}
                          disabled={loading || phoneCode.length !== 6}
                          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                          Verify
                        </button>
                      </div>
                      <button
                        onClick={sendPhoneCode}
                        disabled={loading}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Resend Code
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {emailVerified ? (
              <button
                onClick={handleComplete}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 font-semibold"
              >
                Continue to Login
              </button>
            ) : (
              <button
                onClick={onSkip}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Skip for Now
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            Verification codes expire in 10 minutes. You can verify later from your account settings.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
