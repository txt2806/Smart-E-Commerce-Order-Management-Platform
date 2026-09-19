package com.smartecommerce.backend.services;

import com.smartecommerce.backend.entities.OneTimeToken;
import com.smartecommerce.backend.entities.User;
import com.smartecommerce.backend.entities.UserSession;
import com.smartecommerce.backend.repositories.OneTimeTokenRepository;
import com.smartecommerce.backend.repositories.UserSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class OneTimeTokenService {

    private final OneTimeTokenRepository oneTimeTokenRepository;
    private final UserSessionRepository userSessionRepository;

    public OneTimeTokenService(OneTimeTokenRepository oneTimeTokenRepository,
                               UserSessionRepository userSessionRepository) {
        this.oneTimeTokenRepository = oneTimeTokenRepository;
        this.userSessionRepository = userSessionRepository;
    }

    @Transactional
    public UserSession createSession(User user) {
        UserSession session = new UserSession();
        session.setUser(user);
        session.setSessionKey("SES-" + UUID.randomUUID().toString());
        session.setExpiresAt(LocalDateTime.now().plusDays(7));
        session.setIsRevoked(false);
        return userSessionRepository.save(session);
    }

    @Transactional
    public String issueOneTimeToken(User user) {
        OneTimeToken ott = new OneTimeToken();
        ott.setUser(user);
        ott.setToken("OTT-" + UUID.randomUUID().toString());
        ott.setIsUsed(false);
        ott.setCreatedAt(LocalDateTime.now());
        oneTimeTokenRepository.saveAndFlush(ott);
        return ott.getToken();
    }

    @Transactional
    public User consumeAndVerify(String tokenString) {
        if (tokenString == null || !tokenString.startsWith("OTT-")) {
            return null;
        }

        OneTimeToken ott = oneTimeTokenRepository.findByToken(tokenString).orElse(null);
        if (ott == null) {
            return null;
        }

        if (Boolean.TRUE.equals(ott.getIsUsed())) {
            // Token has already been used once! Replay attack attempt.
            return null;
        }

        // Burn token immediately
        ott.setIsUsed(true);
        ott.setUsedAt(LocalDateTime.now());
        oneTimeTokenRepository.saveAndFlush(ott);

        return ott.getUser();
    }

    @Transactional
    public String renewTokenFromSession(String sessionKey) {
        if (sessionKey == null || sessionKey.isBlank()) {
            throw new RuntimeException("Session key không hợp lệ.");
        }

        UserSession session = userSessionRepository.findBySessionKey(sessionKey)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiên đăng nhập tương ứng."));

        if (Boolean.TRUE.equals(session.getIsRevoked())) {
            throw new RuntimeException("Phiên đăng nhập này đã bị thu hồi.");
        }

        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Phiên đăng nhập đã hết hạn 7 ngày. Vui lòng đăng nhập lại.");
        }

        return issueOneTimeToken(session.getUser());
    }

    @Transactional
    public void revokeSession(String sessionKey) {
        if (sessionKey != null && !sessionKey.isBlank()) {
            userSessionRepository.findBySessionKey(sessionKey).ifPresent(session -> {
                session.setIsRevoked(true);
                userSessionRepository.save(session);
            });
        }
    }
}
