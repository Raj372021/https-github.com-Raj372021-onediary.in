export interface RazorpayCheckoutOptions {
  amount: number;
  planName?: string;
  userName?: string;
  userPhone?: string;
  userEmail?: string;
  keyId?: string;
  keySecret?: string;
  razorpayPlanId?: string;
  onSuccess: (paymentId: string) => void;
  onFailure?: (error: any) => void;
}

/**
 * Dynamically loads Razorpay checkout script if not present
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function triggerRazorpayPayment(options: RazorpayCheckoutOptions) {
  const {
    amount,
    planName = "Subscription / Recharge",
    userName = "Contractor",
    userPhone = "9876543210",
    userEmail = "customer@onediary.in",
    keyId,
    keySecret,
    razorpayPlanId,
    onSuccess,
    onFailure,
  } = options;

  try {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      const err = new Error("Razorpay SDK script failed to load");
      if (onFailure) onFailure(err);
      else alert("⚠️ Razorpay SDK लोडिंग विफल रही। कृपया अपना इंटरनेट कनेक्शन जाँचें।");
      return;
    }

    let checkoutData: any;
    let endpoint = "/api/create-order";
    let bodyPayload: any = { amount, keyId, keySecret };
    let isSubscriptionAttempt = false;

    if (razorpayPlanId && (razorpayPlanId.startsWith("plan_") || razorpayPlanId.startsWith("sub_"))) {
      endpoint = "/api/create-subscription";
      bodyPayload = { 
        planId: razorpayPlanId, 
        amount, 
        planName, 
        duration: amount >= 2000 ? 'year' : 'month', 
        keyId, 
        keySecret 
      };
      isSubscriptionAttempt = true;
    }

    let res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyPayload),
    });

    checkoutData = await res.json();

    if (!res.ok || checkoutData?.error || !checkoutData) {
      const errReason = checkoutData?.error || "Subscription creation failed from Razorpay API.";
      throw new Error(errReason);
    }

    const activeKey = checkoutData.keyId || keyId || ((import.meta as any).env?.VITE_RAZORPAY_KEY_ID as string) || "rzp_test_mock";

    if (checkoutData.mock && (!activeKey || activeKey === "rzp_test_mock")) {
      const errorMsg = "⚠️ Razorpay Key ID सेट नहीं है! एडमिन पैनल में अपनी Razorpay Key ID डालें या UPI QR से भुगतान करें।";
      if (onFailure) {
        onFailure(new Error(errorMsg));
      } else {
        alert(errorMsg);
      }
      return;
    }

    const rzpOptions: any = {
      key: activeKey,
      name: "OneDiary (onediary.in)",
      description: `${planName}`,
      handler: function (response: any) {
        const payId = response?.razorpay_payment_id || response?.razorpay_subscription_id || "sub_success_" + Date.now();
        if (payId) {
          onSuccess(payId);
        } else {
          if (onFailure) onFailure(new Error("No payment/subscription ID returned"));
        }
      },
      prefill: {
        name: userName,
        email: userEmail,
        contact: userPhone,
      },
      theme: { color: "#1d4ed8" },
      modal: {
        ondismiss: function () {
          console.log("Razorpay checkout modal dismissed by user");
          if (onFailure) onFailure(new Error("User closed payment window"));
        }
      }
    };

    if (isSubscriptionAttempt && checkoutData.id && checkoutData.id.startsWith("sub_")) {
      rzpOptions.subscription_id = checkoutData.id;
    } else {
      rzpOptions.amount = checkoutData.amount || amount * 100;
      rzpOptions.currency = checkoutData.currency || "INR";
      rzpOptions.order_id = checkoutData.id.startsWith("order_mock_") ? undefined : checkoutData.id;
    }

    const rzp = new (window as any).Razorpay(rzpOptions);
    rzp.on("payment.failed", function (response: any) {
      const errDesc = response.error?.description || "Payment failed or cancelled";
      console.warn("Razorpay payment failed:", errDesc);
      if (onFailure) {
        onFailure(new Error(errDesc));
      } else {
        alert(`❌ पेमेंट विफल: ${errDesc}`);
      }
    });

    rzp.open();
  } catch (err: any) {
    console.error("Razorpay trigger error:", err);
    if (onFailure) {
      onFailure(err);
    } else {
      alert(`⚠️ Razorpay Error: ${err.message || 'Payment initiation failed'}`);
    }
  }
}
