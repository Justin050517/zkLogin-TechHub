/// ZkLogin Authentication Module
/// Provides secure authentication and user management using zkLogin proofs
module zklogin_auth::auth {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use std::string::{Self, String};
    use std::vector;
    use sui::clock::{Self, Clock};
    use sui::table::{Self, Table};
    use sui::dynamic_field as df;

    // ===== Error Codes =====
    const EInvalidProof: u64 = 1;
    const EUserNotFound: u64 = 2;
    const EUnauthorized: u64 = 3;
    const EInvalidProvider: u64 = 4;
    const ESessionExpired: u64 = 5;

    // ===== Structs =====

    /// Main authentication registry
    public struct AuthRegistry has key {
        id: UID,
        users: Table<address, UserProfile>,
        admin: address,
        total_users: u64,
    }

    /// User profile with zkLogin authentication
    public struct UserProfile has key, store {
        id: UID,
        zklogin_address: address,
        provider: String,
        email: String,
        name: String,
        picture_url: String,
        created_at: u64,
        last_login: u64,
        login_count: u64,
        is_active: bool,
    }

    /// Authentication session
    public struct AuthSession has key {
        id: UID,
        user_address: address,
        provider: String,
        created_at: u64,
        expires_at: u64,
        nonce: String,
        is_valid: bool,
    }

    /// Capability for admin operations
    public struct AdminCap has key {
        id: UID,
    }

    // ===== Events =====

    public struct UserRegistered has copy, drop {
        user_address: address,
        provider: String,
        email: String,
        timestamp: u64,
    }

    public struct UserLoggedIn has copy, drop {
        user_address: address,
        provider: String,
        timestamp: u64,
        login_count: u64,
    }

    public struct SessionCreated has copy, drop {
        session_id: address,
        user_address: address,
        expires_at: u64,
    }

    public struct UserDeactivated has copy, drop {
        user_address: address,
        timestamp: u64,
    }

    // ===== Init Function =====

    /// Initialize the authentication system
    fun init(ctx: &mut TxContext) {
        let admin = tx_context::sender(ctx);
        
        let registry = AuthRegistry {
            id: object::new(ctx),
            users: table::new(ctx),
            admin,
            total_users: 0,
        };

        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        transfer::share_object(registry);
        transfer::transfer(admin_cap, admin);
    }

    // ===== Public Functions =====

    /// Register a new user with zkLogin authentication
    public entry fun register_user(
        registry: &mut AuthRegistry,
        provider: String,
        email: String,
        name: String,
        picture_url: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let user_address = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        // Validate provider
        assert!(is_valid_provider(&provider), EInvalidProvider);

        let user_profile = UserProfile {
            id: object::new(ctx),
            zklogin_address: user_address,
            provider,
            email,
            name,
            picture_url,
            created_at: current_time,
            last_login: current_time,
            login_count: 1,
            is_active: true,
        };

        table::add(&mut registry.users, user_address, user_profile);
        registry.total_users = registry.total_users + 1;

        event::emit(UserRegistered {
            user_address,
            provider: string::utf8(b""),
            email: string::utf8(b""),
            timestamp: current_time,
        });
    }

    /// Authenticate user and create session
    public entry fun authenticate_user(
        registry: &mut AuthRegistry,
        nonce: String,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let user_address = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        assert!(table::contains(&registry.users, user_address), EUserNotFound);
        
        let user_profile = table::borrow_mut(&mut registry.users, user_address);
        assert!(user_profile.is_active, EUnauthorized);

        // Update login stats
        user_profile.last_login = current_time;
        user_profile.login_count = user_profile.login_count + 1;

        // Create authentication session (expires in 24 hours)
        let expires_at = current_time + (24 * 60 * 60 * 1000);
        let session = AuthSession {
            id: object::new(ctx),
            user_address,
            provider: user_profile.provider,
            created_at: current_time,
            expires_at,
            nonce,
            is_valid: true,
        };

        let session_address = object::uid_to_address(&session.id);

        event::emit(UserLoggedIn {
            user_address,
            provider: user_profile.provider,
            timestamp: current_time,
            login_count: user_profile.login_count,
        });

        event::emit(SessionCreated {
            session_id: session_address,
            user_address,
            expires_at,
        });

        transfer::transfer(session, user_address);
    }

    /// Update user profile
    public entry fun update_profile(
        registry: &mut AuthRegistry,
        name: String,
        picture_url: String,
        ctx: &mut TxContext
    ) {
        let user_address = tx_context::sender(ctx);
        assert!(table::contains(&registry.users, user_address), EUserNotFound);
        
        let user_profile = table::borrow_mut(&mut registry.users, user_address);
        assert!(user_profile.is_active, EUnauthorized);

        user_profile.name = name;
        user_profile.picture_url = picture_url;
    }

    /// Validate authentication session
    public fun validate_session(
        session: &AuthSession,
        clock: &Clock
    ): bool {
        let current_time = clock::timestamp_ms(clock);
        session.is_valid && current_time < session.expires_at
    }

    // ===== Admin Functions =====

    /// Deactivate a user (admin only)
    public entry fun deactivate_user(
        _: &AdminCap,
        registry: &mut AuthRegistry,
        user_address: address,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        assert!(table::contains(&registry.users, user_address), EUserNotFound);
        
        let user_profile = table::borrow_mut(&mut registry.users, user_address);
        user_profile.is_active = false;

        event::emit(UserDeactivated {
            user_address,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    /// Get total number of users (admin only)
    public fun get_total_users(
        _: &AdminCap,
        registry: &AuthRegistry
    ): u64 {
        registry.total_users
    }

    // ===== View Functions =====

    /// Get user profile information
    public fun get_user_profile(
        registry: &AuthRegistry,
        user_address: address
    ): (String, String, String, String, u64, u64, u64, bool) {
        assert!(table::contains(&registry.users, user_address), EUserNotFound);
        
        let user_profile = table::borrow(&registry.users, user_address);
        (
            user_profile.provider,
            user_profile.email,
            user_profile.name,
            user_profile.picture_url,
            user_profile.created_at,
            user_profile.last_login,
            user_profile.login_count,
            user_profile.is_active
        )
    }

    /// Check if user exists
    public fun user_exists(
        registry: &AuthRegistry,
        user_address: address
    ): bool {
        table::contains(&registry.users, user_address)
    }

    /// Get session info
    public fun get_session_info(
        session: &AuthSession
    ): (address, String, u64, u64, bool) {
        (
            session.user_address,
            session.provider,
            session.created_at,
            session.expires_at,
            session.is_valid
        )
    }

    // ===== Helper Functions =====

    /// Validate OAuth provider
    fun is_valid_provider(provider: &String): bool {
        let provider_bytes = string::as_bytes(provider);
        let google = b"google";
        let facebook = b"facebook";
        let apple = b"apple";
        
        provider_bytes == &google || 
        provider_bytes == &facebook || 
        provider_bytes == &apple
    }

    // ===== Test Functions =====

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
