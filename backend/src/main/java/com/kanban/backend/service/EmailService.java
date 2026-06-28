package com.kanban.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:kanban@localhost}")
    private String fromEmail;

    @Value("${app.mail.from-name:Kanban}")
    private String fromName;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public void sendWorkspaceInvitation(String toEmail, String workspaceName, String inviterName, String token) {
        String inviteLink = frontendUrl + "/invite/" + token;

        if (!mailEnabled) {
            log.info("[DEV] Invitation email to {} — link: {}", toEmail, inviteLink);
            return;
        }

        if (!StringUtils.hasText(mailUsername) || !StringUtils.hasText(fromEmail)) {
            throw new RuntimeException("Chưa cấu hình Gmail. Đặt GMAIL_USERNAME và GMAIL_APP_PASSWORD, chạy với profile gmail.");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromName + " <" + fromEmail + ">");
        message.setTo(toEmail);
        message.setReplyTo(fromEmail);
        message.setSubject("Bạn được mời tham gia Workspace \"" + workspaceName + "\" trên Kanban");
        message.setText(
                "Xin chào,\n\n"
                + inviterName + " đã mời bạn tham gia Workspace \"" + workspaceName + "\" trên Kanban.\n\n"
                + "Nhấn vào liên kết để chấp nhận lời mời:\n"
                + inviteLink + "\n\n"
                + "Liên kết có hiệu lực trong 7 ngày.\n"
                + "Đăng nhập bằng tài khoản Kanban (" + toEmail + ") để chấp nhận.\n\n"
                + "— Kanban Team"
        );

        try {
            mailSender.send(message);
            log.info("Invitation email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send invitation email to {}", toEmail, e);
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            if (msg.contains("Authentication failed") || msg.contains("535")) {
                throw new RuntimeException("Gmail tu choi dang nhap. Kiem tra App Password (khong dung mat khau thuong).");
            }
            if (msg.contains("Connection refused")) {
                throw new RuntimeException("Khong ket noi duoc SMTP. Kiem tra profile gmail va mang.");
            }
            throw new RuntimeException("Khong gui duoc email: " + msg);
        }
    }
}
