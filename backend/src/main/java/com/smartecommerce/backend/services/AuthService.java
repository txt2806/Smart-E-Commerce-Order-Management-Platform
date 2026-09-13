package com.smartecommerce.backend.services;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.smartecommerce.backend.dto.AuthRes;
import com.smartecommerce.backend.dto.GoogleLoginReq;
import com.smartecommerce.backend.dto.LoginReq;
import com.smartecommerce.backend.dto.RegisterReq;
import com.smartecommerce.backend.entities.*;
import com.smartecommerce.backend.repositories.*;
import com.smartecommerce.backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final CustomerRepository customerRepository;
    private final SellerRepository sellerRepository;
    private final OAuthAccountRepository oAuthAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.google.client-id}")
    private String googleClientId;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository,
                       UserProfileRepository userProfileRepository, CustomerRepository customerRepository,
                       SellerRepository sellerRepository, OAuthAccountRepository oAuthAccountRepository,
                       PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.customerRepository = customerRepository;
        this.sellerRepository = sellerRepository;
        this.oAuthAccountRepository = oAuthAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public AuthRes register(RegisterReq req) {
        User user = new User();
        user.setUsername(req.getUsername());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        
        User.Role role = (req.getRole() != null && req.getRole().equals("SELLER")) ? User.Role.SELLER : User.Role.CUSTOMER;
        user.setRole(role);
        
        user = userRepository.save(user);

        UserProfile profile = new UserProfile();
        profile.setUser(user);
        profile.setFirstName(req.getFirstName());
        profile.setLastName(req.getLastName());
        profile.setPhone(req.getPhone());
        userProfileRepository.save(profile);

        if (role == User.Role.CUSTOMER) {
            Customer customer = new Customer();
            customer.setUser(user);
            customerRepository.save(customer);
        } else if (role == User.Role.SELLER) {
            Seller seller = new Seller();
            seller.setUser(user);
            // Will set identity later
            seller.setIdentityNumber("PENDING-" + user.getId());
            sellerRepository.save(seller);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateToken(authentication);
        
        return new AuthRes(jwt, user.getId(), user.getUsername(), user.getRole().name());
    }

    public AuthRes login(LoginReq req) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateToken(authentication);
        
        User user = userRepository.findByUsername(req.getUsername()).get();
        return new AuthRes(jwt, user.getId(), user.getUsername(), user.getRole().name());
    }

    @Transactional
    public AuthRes googleLogin(GoogleLoginReq req) throws Exception {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(googleClientId))
                .build();

        GoogleIdToken idToken = verifier.verify(req.getIdToken());
        if (idToken == null) {
            throw new RuntimeException("Invalid Google ID Token");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String pictureUrl = (String) payload.get("picture");

        Optional<OAuthAccount> oauthOpt = oAuthAccountRepository.findByProviderAndProviderId(OAuthAccount.Provider.GOOGLE, googleId);
        User user;

        if (oauthOpt.isPresent()) {
            user = oauthOpt.get().getUser();
            if (user.getRole() == User.Role.CUSTOMER) {
                user.setRole(User.Role.SELLER);
                user = userRepository.save(user);
                if (sellerRepository.findByUser(user).isEmpty()) {
                    Seller seller = new Seller();
                    seller.setUser(user);
                    seller.setIdentityNumber("GG-UPGRADED-" + user.getId());
                    sellerRepository.save(seller);
                }
            }
        } else {
            // Check if user exists by email (username)
            if (userRepository.existsByUsername(email)) {
                user = userRepository.findByUsername(email).get();
            } else {
                // Create new user
                user = new User();
                user.setUsername(email);
                user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setRole(User.Role.SELLER);
                user = userRepository.save(user);

                UserProfile profile = new UserProfile();
                profile.setUser(user);
                profile.setFirstName(name);
                profile.setLastName("");
                // Dummy phone since Google might not give it
                profile.setPhone("GG-" + UUID.randomUUID().toString().substring(0,8));
                profile.setEmail(email);
                profile.setAvatarUrl(pictureUrl);
                userProfileRepository.save(profile);

                Seller seller = new Seller();
                seller.setUser(user);
                seller.setIdentityNumber("GG-PENDING-" + user.getId());
                sellerRepository.save(seller);
            }
            
            // Link account
            OAuthAccount oAuthAccount = new OAuthAccount();
            oAuthAccount.setUser(user);
            oAuthAccount.setProvider(OAuthAccount.Provider.GOOGLE);
            oAuthAccount.setProviderId(googleId);
            oAuthAccountRepository.save(oAuthAccount);
        }

        String jwt = jwtTokenProvider.generateTokenFromUsername(user.getUsername());
        return new AuthRes(jwt, user.getId(), user.getUsername(), user.getRole().name());
    }
}