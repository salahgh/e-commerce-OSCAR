package com.oscar.ecommerce.service;

import com.oscar.ecommerce.domain.Order;
import com.oscar.ecommerce.domain.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

/**
 * Service for sending emails
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${oscar.app.name:OSCAR Fashion}")
    private String appName;

    @Value("${oscar.app.base-url:http://localhost:3000}")
    private String appBaseUrl;

    @Value("${spring.mail.username:noreply@oscarfashion.dz}")
    private String fromEmail;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Send welcome email to new user
     */
    @Async
    public void sendWelcomeEmail(User user) {
        log.info("Sending welcome email to: {}", user.getEmail());

        try {
            String htmlContent = buildSimpleEmailTemplate(
                    "Bienvenue sur " + appName + " !",
                    "Bonjour " + user.getFirstName() + " " + user.getLastName() + ",",
                    "Merci de vous être inscrit sur " + appName + ". Nous sommes ravis de vous compter parmi nos clients.",
                    "Commencer vos achats",
                    appBaseUrl + "/products"
            );

            sendEmail(
                    user.getEmail(),
                    "Bienvenue sur " + appName,
                    htmlContent
            );

            log.info("Welcome email sent successfully to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", user.getEmail(), e);
        }
    }

    /**
     * Send password reset email
     */
    @Async
    public void sendPasswordResetEmail(User user, String resetToken) {
        log.info("Sending password reset email to: {}", user.getEmail());

        try {
            String resetUrl = appBaseUrl + "/reset-password?token=" + resetToken;

            String htmlContent = buildSimpleEmailTemplate(
                    "Réinitialisation de votre mot de passe",
                    "Bonjour " + user.getFirstName() + ",",
                    "Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe. " +
                            "Ce lien est valide pendant 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.",
                    "Réinitialiser mon mot de passe",
                    resetUrl
            );

            sendEmail(
                    user.getEmail(),
                    "Réinitialisation de votre mot de passe - " + appName,
                    htmlContent
            );

            log.info("Password reset email sent successfully to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", user.getEmail(), e);
        }
    }

    /**
     * Send order confirmation email
     */
    @Async
    public void sendOrderConfirmationEmail(Order order) {
        log.info("Sending order confirmation email for order: {}", order.getOrderNumber());

        try {
            User user = order.getUser();
            String orderDetailsUrl = appBaseUrl + "/orders/" + order.getId();

            String htmlContent = buildOrderEmailTemplate(
                    "Confirmation de commande",
                    "Bonjour " + user.getFirstName() + ",",
                    "Votre commande a été confirmée avec succès !",
                    order,
                    "Voir ma commande",
                    orderDetailsUrl
            );

            sendEmail(
                    user.getEmail(),
                    "Confirmation de commande #" + order.getOrderNumber() + " - " + appName,
                    htmlContent
            );

            log.info("Order confirmation email sent successfully for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.error("Failed to send order confirmation email for order: {}", order.getOrderNumber(), e);
        }
    }

    /**
     * Send order status update email
     */
    @Async
    public void sendOrderStatusUpdateEmail(Order order) {
        log.info("Sending order status update email for order: {}", order.getOrderNumber());

        try {
            User user = order.getUser();
            String orderDetailsUrl = appBaseUrl + "/orders/" + order.getId();

            String statusMessage = getStatusMessage(order.getStatus().name());

            String htmlContent = buildOrderEmailTemplate(
                    "Mise à jour de votre commande",
                    "Bonjour " + user.getFirstName() + ",",
                    statusMessage,
                    order,
                    "Suivre ma commande",
                    orderDetailsUrl
            );

            sendEmail(
                    user.getEmail(),
                    "Mise à jour de commande #" + order.getOrderNumber() + " - " + appName,
                    htmlContent
            );

            log.info("Order status update email sent successfully for order: {}", order.getOrderNumber());
        } catch (Exception e) {
            log.error("Failed to send order status update email for order: {}", order.getOrderNumber(), e);
        }
    }

    /**
     * Send email using JavaMailSender
     */
    private void sendEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    /**
     * Build simple email template
     */
    private String buildSimpleEmailTemplate(String title, String greeting, String message, String buttonText, String buttonUrl) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background-color: #2C3E50; color: white; padding: 20px; text-align: center; }" +
                ".content { padding: 30px 20px; background-color: #f9f9f9; }" +
                ".button { display: inline-block; padding: 12px 30px; background-color: #2C3E50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }" +
                ".footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>" + appName + "</h1></div>" +
                "<div class='content'>" +
                "<h2>" + title + "</h2>" +
                "<p>" + greeting + "</p>" +
                "<p>" + message + "</p>" +
                "<a href='" + buttonUrl + "' class='button'>" + buttonText + "</a>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". Tous droits réservés.</p>" +
                "<p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    /**
     * Build order email template
     */
    private String buildOrderEmailTemplate(String title, String greeting, String message, Order order, String buttonText, String buttonUrl) {
        StringBuilder itemsHtml = new StringBuilder();
        order.getItems().forEach(item -> {
            itemsHtml.append("<tr>")
                    .append("<td>").append(item.getProductNameEn()).append("</td>")
                    .append("<td>").append(item.getQuantity()).append("</td>")
                    .append("<td>").append(String.format("%.2f DZD", item.getUnitPrice())).append("</td>")
                    .append("<td>").append(String.format("%.2f DZD", item.getSubtotal())).append("</td>")
                    .append("</tr>");
        });

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background-color: #2C3E50; color: white; padding: 20px; text-align: center; }" +
                ".content { padding: 30px 20px; background-color: #f9f9f9; }" +
                ".button { display: inline-block; padding: 12px 30px; background-color: #2C3E50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }" +
                ".order-summary { margin: 20px 0; }" +
                ".order-table { width: 100%; border-collapse: collapse; margin-top: 10px; }" +
                ".order-table th, .order-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }" +
                ".order-table th { background-color: #f0f0f0; }" +
                ".total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }" +
                ".footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'><h1>" + appName + "</h1></div>" +
                "<div class='content'>" +
                "<h2>" + title + "</h2>" +
                "<p>" + greeting + "</p>" +
                "<p>" + message + "</p>" +
                "<div class='order-summary'>" +
                "<p><strong>Numéro de commande:</strong> " + order.getOrderNumber() + "</p>" +
                "<p><strong>Date:</strong> " + order.getCreatedAt().format(DATE_FORMATTER) + "</p>" +
                "<p><strong>Statut:</strong> " + getStatusLabel(order.getStatus().name()) + "</p>" +
                "<table class='order-table'>" +
                "<thead><tr><th>Produit</th><th>Quantité</th><th>Prix</th><th>Sous-total</th></tr></thead>" +
                "<tbody>" + itemsHtml + "</tbody>" +
                "</table>" +
                "<div class='total'>Total: " + String.format("%.2f DZD", order.getTotalAmount()) + "</div>" +
                "</div>" +
                "<a href='" + buttonUrl + "' class='button'>" + buttonText + "</a>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>&copy; 2024 " + appName + ". Tous droits réservés.</p>" +
                "<p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    /**
     * Get status message in French
     */
    private String getStatusMessage(String status) {
        return switch (status) {
            case "CONFIRMED" -> "Votre commande a été confirmée et est en cours de traitement.";
            case "PROCESSING" -> "Votre commande est en cours de préparation.";
            case "SHIPPED" -> "Votre commande a été expédiée et est en route vers vous !";
            case "DELIVERED" -> "Votre commande a été livrée avec succès. Merci pour votre achat !";
            case "CANCELLED" -> "Votre commande a été annulée.";
            case "REFUNDED" -> "Votre commande a été remboursée.";
            default -> "Le statut de votre commande a été mis à jour.";
        };
    }

    /**
     * Get status label in French
     */
    private String getStatusLabel(String status) {
        return switch (status) {
            case "PENDING" -> "En attente";
            case "CONFIRMED" -> "Confirmée";
            case "PROCESSING" -> "En préparation";
            case "SHIPPED" -> "Expédiée";
            case "DELIVERED" -> "Livrée";
            case "CANCELLED" -> "Annulée";
            case "REFUNDED" -> "Remboursée";
            default -> status;
        };
    }
}
