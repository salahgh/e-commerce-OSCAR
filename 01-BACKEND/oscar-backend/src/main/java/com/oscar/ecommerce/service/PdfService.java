package com.oscar.ecommerce.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.oscar.ecommerce.domain.Order;
import com.oscar.ecommerce.domain.OrderItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

/**
 * Service for generating PDF documents (invoices, receipts)
 * Uses iText 7 library
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PdfService {

    @Value("${oscar.app.name:OSCAR Fashion}")
    private String appName;

    @Value("${oscar.app.admin-email:contact@oscarfashion.dz}")
    private String companyEmail;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DeviceRgb PRIMARY_COLOR = new DeviceRgb(44, 62, 80); // #2C3E50
    private static final DeviceRgb ACCENT_COLOR = new DeviceRgb(201, 169, 146); // #C9A992

    /**
     * Generate invoice PDF for an order
     *
     * @param order The order to generate invoice for
     * @return PDF as byte array
     */
    public byte[] generateInvoice(Order order) {
        log.info("Generating invoice PDF for order: {}", order.getOrderNumber());

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);

            // Set margins
            document.setMargins(40, 40, 40, 40);

            // Add header
            addInvoiceHeader(document, order);

            // Add company and customer info
            addPartyInformation(document, order);

            // Add order items table
            addOrderItemsTable(document, order);

            // Add totals
            addOrderTotals(document, order);

            // Add footer
            addInvoiceFooter(document);

            document.close();

            log.info("Invoice PDF generated successfully for order: {}", order.getOrderNumber());
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error generating invoice PDF for order: {}", order.getOrderNumber(), e);
            throw new RuntimeException("Failed to generate invoice PDF", e);
        }
    }

    /**
     * Add invoice header
     */
    private void addInvoiceHeader(Document document, Order order) throws Exception {
        // Company name
        Paragraph companyName = new Paragraph(appName)
                .setFontSize(24)
                .setBold()
                .setFontColor(PRIMARY_COLOR)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(companyName);

        // Invoice title
        Paragraph invoiceTitle = new Paragraph("FACTURE / INVOICE")
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(10);
        document.add(invoiceTitle);

        // Order number and date
        Paragraph orderInfo = new Paragraph()
                .add("N° Commande / Order #: " + order.getOrderNumber() + "\n")
                .add("Date: " + order.getCreatedAt().format(DATE_FORMATTER))
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(orderInfo);
    }

    /**
     * Add party information (company and customer)
     */
    private void addPartyInformation(Document document, Order order) {
        // Create two-column table
        float[] columnWidths = {1, 1};
        Table table = new Table(UnitValue.createPercentArray(columnWidths));
        table.setWidth(UnitValue.createPercentValue(100));

        // Company information (left column)
        Cell companyCell = new Cell()
                .add(new Paragraph("Vendeur / Seller").setBold().setFontSize(12))
                .add(new Paragraph(appName).setFontSize(10))
                .add(new Paragraph("Algérie").setFontSize(10))
                .add(new Paragraph("Email: " + companyEmail).setFontSize(10))
                .setBorder(Border.NO_BORDER)
                .setPadding(10);

        // Customer information (right column)
        Cell customerCell = new Cell()
                .add(new Paragraph("Client / Customer").setBold().setFontSize(12))
                .add(new Paragraph(order.getUser().getFirstName() + " " + order.getUser().getLastName()).setFontSize(10))
                .add(new Paragraph(order.getShippingAddress()).setFontSize(10))
                .add(new Paragraph("Tél: " + order.getShippingPhone()).setFontSize(10))
                .add(new Paragraph("Email: " + order.getUser().getEmail()).setFontSize(10))
                .setBorder(Border.NO_BORDER)
                .setPadding(10);

        table.addCell(companyCell);
        table.addCell(customerCell);

        document.add(table);
        document.add(new Paragraph("\n"));
    }

    /**
     * Add order items table
     */
    private void addOrderItemsTable(Document document, Order order) {
        // Create table with 5 columns
        float[] columnWidths = {4, 1, 1.5f, 1.5f, 2};
        Table table = new Table(UnitValue.createPercentArray(columnWidths));
        table.setWidth(UnitValue.createPercentValue(100));

        // Header row
        table.addHeaderCell(createHeaderCell("Produit / Product"));
        table.addHeaderCell(createHeaderCell("Qté / Qty"));
        table.addHeaderCell(createHeaderCell("Prix / Price"));
        table.addHeaderCell(createHeaderCell("TVA / VAT"));
        table.addHeaderCell(createHeaderCell("Total"));

        // Add items
        for (OrderItem item : order.getItems()) {
            table.addCell(createDataCell(item.getProductNameFr() + "\n" + item.getProductNameEn()));
            table.addCell(createDataCell(String.valueOf(item.getQuantity())));
            table.addCell(createDataCell(String.format("%.2f DZD", item.getUnitPrice())));
            table.addCell(createDataCell("0%")); // No VAT for now
            table.addCell(createDataCell(String.format("%.2f DZD", item.getSubtotal())));
        }

        document.add(table);
        document.add(new Paragraph("\n"));
    }

    /**
     * Add order totals
     */
    private void addOrderTotals(Document document, Order order) {
        // Create table for totals (right-aligned)
        float[] columnWidths = {3, 1};
        Table table = new Table(UnitValue.createPercentArray(columnWidths));
        table.setWidth(UnitValue.createPercentValue(50));
        table.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.RIGHT);

        // Subtotal
        table.addCell(createTotalLabelCell("Sous-total / Subtotal:"));
        table.addCell(createTotalValueCell(String.format("%.2f DZD", order.getSubtotal())));

        // Shipping cost
        table.addCell(createTotalLabelCell("Frais de livraison / Shipping:"));
        table.addCell(createTotalValueCell(String.format("%.2f DZD", order.getShippingCost())));

        // Discount
        if (order.getDiscountAmount() != null && order.getDiscountAmount().doubleValue() > 0) {
            table.addCell(createTotalLabelCell("Réduction / Discount:"));
            table.addCell(createTotalValueCell(String.format("-%.2f DZD", order.getDiscountAmount())));
        }

        // Total
        table.addCell(createTotalLabelCell("TOTAL:").setBold().setFontSize(12));
        table.addCell(createTotalValueCell(String.format("%.2f DZD", order.getTotalAmount())).setBold().setFontSize(12));

        document.add(table);
        document.add(new Paragraph("\n"));

        // Payment method
        Paragraph paymentInfo = new Paragraph()
                .add("Mode de paiement / Payment method: " + getPaymentMethodLabel(order.getPaymentMethod().name()))
                .setFontSize(10)
                .setItalic();
        document.add(paymentInfo);
    }

    /**
     * Add invoice footer
     */
    private void addInvoiceFooter(Document document) {
        document.add(new Paragraph("\n\n"));

        Paragraph footer = new Paragraph()
                .add("Merci pour votre confiance / Thank you for your business\n")
                .add(appName + " - E-commerce de mode algérienne\n")
                .add("www.oscarfashion.dz")
                .setFontSize(9)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY);

        document.add(footer);
    }

    /**
     * Create header cell for table
     */
    private Cell createHeaderCell(String content) {
        return new Cell()
                .add(new Paragraph(content).setBold().setFontSize(10))
                .setBackgroundColor(PRIMARY_COLOR)
                .setFontColor(ColorConstants.WHITE)
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(8);
    }

    /**
     * Create data cell for table
     */
    private Cell createDataCell(String content) {
        return new Cell()
                .add(new Paragraph(content).setFontSize(9))
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(6);
    }

    /**
     * Create total label cell
     */
    private Cell createTotalLabelCell(String content) {
        return new Cell()
                .add(new Paragraph(content).setFontSize(10))
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(Border.NO_BORDER)
                .setPadding(4);
    }

    /**
     * Create total value cell
     */
    private Cell createTotalValueCell(String content) {
        return new Cell()
                .add(new Paragraph(content).setFontSize(10))
                .setTextAlignment(TextAlignment.RIGHT)
                .setBorder(Border.NO_BORDER)
                .setPadding(4);
    }

    /**
     * Get payment method label
     */
    private String getPaymentMethodLabel(String method) {
        return switch (method) {
            case "CASH_ON_DELIVERY" -> "Paiement à la livraison / Cash on Delivery";
            case "CIB" -> "Carte bancaire CIB / CIB Card";
            case "BARIDIMOB" -> "Baridimob";
            default -> method;
        };
    }

    /**
     * Generate order summary PDF (simpler version)
     */
    public byte[] generateOrderSummary(Order order) {
        log.info("Generating order summary PDF for order: {}", order.getOrderNumber());

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc, PageSize.A4);

            document.setMargins(40, 40, 40, 40);

            // Title
            Paragraph title = new Paragraph("Récapitulatif de commande / Order Summary")
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(title);

            // Order info
            Paragraph orderInfo = new Paragraph()
                    .add("Commande #: " + order.getOrderNumber() + "\n")
                    .add("Date: " + order.getCreatedAt().format(DATE_FORMATTER) + "\n")
                    .add("Statut: " + order.getStatus() + "\n\n")
                    .setFontSize(11);
            document.add(orderInfo);

            // Items table
            addOrderItemsTable(document, order);

            // Totals
            addOrderTotals(document, order);

            document.close();

            log.info("Order summary PDF generated successfully for order: {}", order.getOrderNumber());
            return baos.toByteArray();

        } catch (Exception e) {
            log.error("Error generating order summary PDF for order: {}", order.getOrderNumber(), e);
            throw new RuntimeException("Failed to generate order summary PDF", e);
        }
    }
}
