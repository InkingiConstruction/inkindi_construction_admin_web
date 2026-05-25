/**
 * ============================================================================
 * FILE HEADER COMMENT
 * ============================================================================
 * FILE NAME        : encryption.ts
 * WHAT THIS FILE DOES : Provides lightweight browser storage obfuscation helpers
 * HOW IT DOES IT      : Encodes and decodes strings with a local XOR key
 * DATA SOURCE         : Session strings from auth context
 * DATA DESTINATION    : Encrypted localStorage values
 * PRINCIPLE APPLIED   : DRY
 * ============================================================================
 */

const ENCRYPTION_KEY = "inkingipro-admin-session-key-2026";

/**
 * ============================================================================
 * FUNCTION: encrypt
 * ============================================================================
 * WHAT IT DOES: Converts readable text into a local obfuscated hex string
 * PARAMETERS:
 *   - text (string) : Plain text value to store
 * RETURNS: string - Obfuscated hex text
 * WHO CALLS IT: AuthContext
 * PRINCIPLE: DRY
 * ============================================================================
 */
export const encrypt = (text: string): string => {
  return text
    .split("")
    .map((character, index) => {
      const keyIndex = index % ENCRYPTION_KEY.length;
      const characterCode = character.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(keyIndex);
      return characterCode.toString(16).padStart(2, "0");
    })
    .join("");
};

/**
 * ============================================================================
 * FUNCTION: decrypt
 * ============================================================================
 * WHAT IT DOES: Converts locally obfuscated hex text back into readable text
 * PARAMETERS:
 *   - encodedText (string) : Obfuscated hex text from localStorage
 * RETURNS: string - Plain text value or an empty string when invalid
 * WHO CALLS IT: AuthContext and Axios interceptor replacements if needed
 * PRINCIPLE: DRY
 * ============================================================================
 */
export const decrypt = (encodedText: string): string => {
  try {
    const matches = encodedText.match(/.{1,2}/g);
    if (!matches) return "";

    return matches
      .map((hexPair, index) => {
        const keyIndex = index % ENCRYPTION_KEY.length;
        const characterCode = parseInt(hexPair, 16) ^ ENCRYPTION_KEY.charCodeAt(keyIndex);
        return String.fromCharCode(characterCode);
      })
      .join("");
  } catch {
    return "";
  }
};
