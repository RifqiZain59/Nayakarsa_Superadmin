import CryptoJS from "crypto-js";

const SECRET_KEY = "SUPERADMIN_SECURE_KEY_2026";

export async function sha256(message: string): Promise<string> {
    const msg = message.toLowerCase().trim();
    
    // Use CryptoJS for maximum compatibility (works in non-secure HTTP contexts)
    return CryptoJS.SHA256(msg).toString();
}

export function encryptData(text: string): string {
    if (!text) return "";
    text = text.toString();
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return btoa(unescape(encodeURIComponent(result)));
}

export function decryptData(encoded: string): string {
    if (!encoded) return "";
    try {
        const text = decodeURIComponent(escape(atob(encoded)));
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
        }
        return result;
    } catch (_e) {
        return encoded;
    }
}

export function generateApiKey(): string {
    // Generate a secure random string using CryptoJS for better compatibility
    return CryptoJS.lib.WordArray.random(20).toString();
}
