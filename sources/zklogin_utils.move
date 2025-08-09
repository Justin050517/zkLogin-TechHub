/// ZkLogin Utilities Module
/// Helper functions for zkLogin proof verification and address generation
module zklogin_auth::utils {
    use std::string::{Self, String};
    use std::vector;
    use sui::hash;
    use sui::bcs;

    // ===== Constants =====
    const GOOGLE_ISS: vector<u8> = b"https://accounts.google.com";
    const FACEBOOK_ISS: vector<u8> = b"https://www.facebook.com";
    const APPLE_ISS: vector<u8> = b"https://appleid.apple.com";

    // ===== Error Codes =====
    const EInvalidJWT: u64 = 1;
    const EInvalidIssuer: u64 = 2;
    const EExpiredToken: u64 = 3;

    // ===== Structs =====

    /// JWT Claims structure
    public struct JWTClaims has copy, drop {
        sub: String,
        email: String,
        name: String,
        picture: String,
        iss: String,
        aud: String,
        exp: u64,
        iat: u64,
    }

    /// ZkLogin proof structure
    public struct ZkProof has copy, drop {
        jwt_header: vector<u8>,
        jwt_payload: vector<u8>,
        jwt_signature: vector<u8>,
        ephemeral_public_key: vector<u8>,
        max_epoch: u64,
        user_salt: vector<u8>,
    }

    // ===== Public Functions =====

    /// Generate zkLogin address from JWT and salt
    public fun generate_zklogin_address(
        jwt_payload: vector<u8>,
        user_salt: vector<u8>
    ): address {
        let mut combined = vector::empty<u8>();
        vector::append(&mut combined, jwt_payload);
        vector::append(&mut combined, user_salt);
        
        let hash_bytes = hash::keccak256(&combined);
        let mut address_bytes = vector::empty<u8>();
        
        // Take first 20 bytes for address
        let mut i = 0;
        while (i < 20) {
            vector::push_back(&mut address_bytes, *vector::borrow(&hash_bytes, i));
            i = i + 1;
        };
        
        bcs::peel_address(&mut bcs::new(address_bytes))
    }

    /// Validate JWT issuer
    public fun validate_issuer(issuer: &String): bool {
        let issuer_bytes = string::as_bytes(issuer);
        issuer_bytes == &GOOGLE_ISS || 
        issuer_bytes == &FACEBOOK_ISS || 
        issuer_bytes == &APPLE_ISS
    }

    /// Extract provider from issuer
    public fun get_provider_from_issuer(issuer: &String): String {
        let issuer_bytes = string::as_bytes(issuer);
        
        if (issuer_bytes == &GOOGLE_ISS) {
            string::utf8(b"google")
        } else if (issuer_bytes == &FACEBOOK_ISS) {
            string::utf8(b"facebook")
        } else if (issuer_bytes == &APPLE_ISS) {
            string::utf8(b"apple")
        } else {
            string::utf8(b"unknown")
        }
    }

    /// Generate user salt
    public fun generate_user_salt(seed: vector<u8>): vector<u8> {
        hash::keccak256(&seed)
    }

    /// Verify zkLogin proof (simplified for demo)
    public fun verify_zklogin_proof(
        proof: &ZkProof,
        expected_address: address
    ): bool {
        // In a real implementation, this would verify the zk-SNARK proof
        // For demo purposes, we'll do basic validation
        let generated_address = generate_zklogin_address(
            proof.jwt_payload,
            proof.user_salt
        );
        
        generated_address == expected_address
    }

    /// Create JWT claims from raw data
    public fun create_jwt_claims(
        sub: String,
        email: String,
        name: String,
        picture: String,
        iss: String,
        aud: String,
        exp: u64,
        iat: u64
    ): JWTClaims {
        JWTClaims {
            sub,
            email,
            name,
            picture,
            iss,
            aud,
            exp,
            iat
        }
    }

    /// Get claims from JWT claims struct
    public fun get_claims(claims: &JWTClaims): (String, String, String, String, String) {
        (claims.sub, claims.email, claims.name, claims.picture, claims.iss)
    }

    /// Validate token expiration
    public fun is_token_expired(claims: &JWTClaims, current_time: u64): bool {
        claims.exp < current_time
    }

    // ===== Helper Functions =====

    /// Convert string to bytes
    public fun string_to_bytes(s: &String): vector<u8> {
        *string::as_bytes(s)
    }

    /// Convert bytes to hex string
    public fun bytes_to_hex_string(bytes: &vector<u8>): String {
        let hex_chars = b"0123456789abcdef";
        let mut result = vector::empty<u8>();
        
        let mut i = 0;
        while (i < vector::length(bytes)) {
            let byte = *vector::borrow(bytes, i);
            let high = (byte >> 4) & 0x0f;
            let low = byte & 0x0f;
            
            vector::push_back(&mut result, *vector::borrow(&hex_chars, (high as u64)));
            vector::push_back(&mut result, *vector::borrow(&hex_chars, (low as u64)));
            i = i + 1;
        };
        
        string::utf8(result)
    }
}
