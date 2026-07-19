import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TransactionStatus, TransactionType } from "@prisma/client";
import * as nodemailer from "nodemailer"

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(private readonly config: ConfigService) {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
        });


        this.transporter.verify()
            .then(() => console.log("Email transporter is ready."))
            .catch((err) =>
                console.error("Email transporter verification failed:", err),
            );
    }

    async sendLoginOtp(email: string, otp: number) {
        await this.transporter.sendMail({
            from: `"MeraWealth" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `${otp} is your MeraWealth Login OTP`,
            html: `
            <h2>MeraWealth Login Verification</h2>
                <p>Your one-time password is:</p>
                <h1 style="letter-spacing:4px;">${otp}</h1>
                <p>This OTP expires in 5 minutes.</p>
                <p>If you didn't request this login, you can safely ignore this email.</p>
            `,
        });
    }

    async sendTransactionEmail(
        email: string,
        orderId: number,
        name: string,
        companyName: string,
        quantity: number,
        indicativePrice: string,
        orderValue: string,
        status: TransactionStatus,
        transactionType: TransactionType
    ) {
        await this.transporter.sendMail({
            from: `"MeraWealth" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Order Confirmation ID: ${orderId}`,
            html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff; color: #1f2937; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <h2 style="color: #2563eb; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 8px; border-bottom: 2px solid #eff6ff; padding-bottom: 12px;">
            Order Confirmation
        </h2>
        
        <p style="font-size: 16px; line-height: 1.5; color: #4b5563; margin-top: 16px;">
            Dear <strong>${name}</strong>,
        </p>
        <p style="font-size: 15px; line-height: 1.5; color: #4b5563; margin-bottom: 24px;">
            Thank you for your order. Here are your transaction details:
        </p>

        <!-- Order Summary Card -->
        <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Order ID</td>
                    <td style="padding: 10px 0; text-align: right; color: #0f172a; font-weight: 600; font-family: monospace;">${orderId}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Company Name</td>
                    <td style="padding: 10px 0; text-align: right; color: #0f172a; font-weight: 600;">${companyName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Transaction Type</td>
                    <td style="padding: 10px 0; text-align: right; color: ${transactionType.toLowerCase() === 'buy' ? '#16a34a' : '#dc2626'}; font-weight: bold; text-transform: uppercase;">${transactionType}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Quantity</td>
                    <td style="padding: 10px 0; text-align: right; color: #0f172a;">${quantity}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px 0; color: #64748b; font-weight: 500;">Price</td>
                    <td style="padding: 10px 0; text-align: right; color: #0f172a;">₹${indicativePrice}</td>
                </tr>
                <tr>
                    <td style="padding: 14px 0 0 0; color: #0f172a; font-weight: 700; font-size: 16px;">Total Order Value</td>
                    <td style="padding: 14px 0 0 0; text-align: right; color: #2563eb; font-weight: 700; font-size: 18px;">₹${orderValue}</td>
                </tr>
            </table>
        </div>

        <!-- Footer / Follow up with Gap -->
        <p style="font-size: 15px; color: #4b5563; line-height: 1.5; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            We'll get back to you shortly to finalize your request.
        </p>
        <p style="font-size: 13px; color: #9ca3af; margin-top: 24px; line-height: 1.4;">
            Best regards,<br>
            <strong>The MeraWealth Team</strong>
        </p>
    </div>
    `,
        });

    }
}