// src/types/booking-iframe.d.ts
export {};

declare global {
    interface Window {
        BookingIframeAPI?: {
            resize: () => void;
            redirect: (url: string) => void;
        };
    }
}
