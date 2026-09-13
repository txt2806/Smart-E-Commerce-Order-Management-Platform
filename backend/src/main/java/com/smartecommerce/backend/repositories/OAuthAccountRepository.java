package com.smartecommerce.backend.repositories;
import com.smartecommerce.backend.entities.OAuthAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface OAuthAccountRepository extends JpaRepository<OAuthAccount, Long> {
    Optional<OAuthAccount> findByProviderAndProviderId(OAuthAccount.Provider provider, String providerId);
}