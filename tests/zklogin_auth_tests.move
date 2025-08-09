#[test_only]
module zklogin_auth::auth_tests {
    use zklogin_auth::auth::{Self, AuthRegistry, UserProfile, AdminCap};
    use zklogin_auth::utils;
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::clock::{Self, Clock};
    use std::string;

    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;

    #[test]
    fun test_init_auth_system() {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize the auth system
        auth::init_for_testing(ts::ctx(&mut scenario));
        
        ts::next_tx(&mut scenario, ADMIN);
        
        // Check that registry and admin cap were created
        assert!(ts::has_most_recent_shared<AuthRegistry>(), 0);
        assert!(ts::has_most_recent_for_sender<AdminCap>(&scenario), 1);
        
        ts::end(scenario);
    }

    #[test]
    fun test_user_registration() {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize
        auth::init_for_testing(ts::ctx(&mut scenario));
        
        ts::next_tx(&mut scenario, ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        ts::next_tx(&mut scenario, USER1);
        let mut registry = ts::take_shared<AuthRegistry>(&scenario);
        
        // Register user
        auth::register_user(
            &mut registry,
            string::utf8(b"google"),
            string::utf8(b"user@gmail.com"),
            string::utf8(b"Test User"),
            string::utf8(b"https://example.com/pic.jpg"),
            &clock,
            ts::ctx(&mut scenario)
        );
        
        // Verify user exists
        assert!(auth::user_exists(&registry, USER1), 2);
        
        let (provider, email, name, picture, _, _, login_count, is_active) = 
            auth::get_user_profile(&registry, USER1);
        
        assert!(provider == string::utf8(b"google"), 3);
        assert!(email == string::utf8(b"user@gmail.com"), 4);
        assert!(name == string::utf8(b"Test User"), 5);
        assert!(login_count == 1, 6);
        assert!(is_active == true, 7);
        
        ts::return_shared(registry);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_user_authentication() {
        let mut scenario = ts::begin(ADMIN);
        
        // Initialize and register user
        auth::init_for_testing(ts::ctx(&mut scenario));
        
        ts::next_tx(&mut scenario, ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        ts::next_tx(&mut scenario, USER1);
        let mut registry = ts::take_shared<AuthRegistry>(&scenario);
        
        auth::register_user(
            &mut registry,
            string::utf8(b"google"),
            string::utf8(b"user@gmail.com"),
            string::utf8(b"Test User"),
            string::utf8(b"https://example.com/pic.jpg"),
            &clock,
            ts::ctx(&mut scenario)
        );
        
        // Authenticate user
        auth::authenticate_user(
            &mut registry,
            string::utf8(b"test_nonce_123"),
            &clock,
            ts::ctx(&mut scenario)
        );
        
        // Check login count increased
        let (_, _, _, _, _, _, login_count, _) = 
            auth::get_user_profile(&registry, USER1);
        assert!(login_count == 2, 8);
        
        ts::return_shared(registry);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_zklogin_utils() {
        // Test address generation
        let jwt_payload = b"test_payload";
        let user_salt = b"test_salt";
        
        let address1 = utils::generate_zklogin_address(*jwt_payload, *user_salt);
        let address2 = utils::generate_zklogin_address(*jwt_payload, *user_salt);
        
        // Same inputs should generate same address
        assert!(address1 == address2, 9);
        
        // Test issuer validation
        let google_iss = string::utf8(b"https://accounts.google.com");
        let invalid_iss = string::utf8(b"https://invalid.com");
        
        assert!(utils::validate_issuer(&google_iss) == true, 10);
        assert!(utils::validate_issuer(&invalid_iss) == false, 11);
        
        // Test provider extraction
        let provider = utils::get_provider_from_issuer(&google_iss);
        assert!(provider == string::utf8(b"google"), 12);
    }

    #[test]
    #[expected_failure(abort_code = zklogin_auth::auth::EUserNotFound)]
    fun test_authenticate_nonexistent_user() {
        let mut scenario = ts::begin(ADMIN);
        
        auth::init_for_testing(ts::ctx(&mut scenario));
        
        ts::next_tx(&mut scenario, ADMIN);
        let clock = clock::create_for_testing(ts::ctx(&mut scenario));
        
        ts::next_tx(&mut scenario, USER1);
        let mut registry = ts::take_shared<AuthRegistry>(&scenario);
        
        // Try to authenticate non-existent user
        auth::authenticate_user(
            &mut registry,
            string::utf8(b"test_nonce"),
            &clock,
            ts::ctx(&mut scenario)
        );
        
        ts::return_shared(registry);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }
}
