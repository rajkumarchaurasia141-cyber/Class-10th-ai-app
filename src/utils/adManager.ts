// Ad manager to handle programmatic pop-up / popunder ad triggers
const POPUP_AD_SCRIPT_SRC = 'https://abscloud.org/1/0d674643633dcda9940775dbdcf0857e';

export const triggerAd = () => {
  try {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // 1. If the ad script exposes a global trigger function, invoke it
    if (typeof (window as any).show_ad_function === 'function') {
      (window as any).show_ad_function();
    }

    // 2. Dynamically inject a fresh Popunder/Popup script tag so the ad network
    // re-arms and triggers the pop-up ad on the current or next user interaction
    const existingDynamic = document.querySelectorAll('script[data-dynamic-popup-ad="true"]');
    existingDynamic.forEach((el) => el.remove());

    const script = document.createElement('script');
    script.setAttribute('data-cfasync', 'false');
    script.setAttribute('data-dynamic-popup-ad', 'true');
    script.src = POPUP_AD_SCRIPT_SRC;
    script.async = true;

    (document.body || document.head || document.documentElement).appendChild(script);
  } catch (err) {
    console.error('Error triggering popup ad:', err);
  }
};

