<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <title>CVeezy Payment Status Update</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 100% !important;
            background: #f8fafc;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            color: #1e293b;
        }
        .pre-header { 
            display: none !important; 
            visibility: hidden; 
            opacity: 0; 
            color: transparent; 
            height: 0; 
            width: 0; 
        }
        .email-container { 
            padding: 20px 10px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .email-card {
            max-width: 600px;
            width: 100%;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            padding: 0;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }
        .email-header {
            background: rgba(53, 78, 171, 0.2);
            padding: 8px 24px 6px 24px;
            text-align: center;
            position: relative;
            border-bottom: 1px solid #e2e8f0;
        }
        .logo { 
            display: block; 
            max-width: 448px; 
            height: auto; 
            margin: 0 auto 2px auto;
            filter: none;
            position: relative;
            z-index: 1;
            opacity: 1;
        }
        .email-title {
            font-size: 32px;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 12px 0;
            text-align: center;
            letter-spacing: -0.025em;
        }
        .email-subtitle {
            font-size: 18px;
            font-weight: 500;
            color: #64748b;
            margin: 0 0 32px 0;
            text-align: center;
        }
        .email-content {
            padding: 24px 24px;
        }
        .greeting {
            font-size: 17px;
            font-weight: 500;
            color: #1e293b;
            margin: 0 0 16px 0;
            line-height: 1.5;
            letter-spacing: -0.025em;
        }
        .status-container {
            text-align: center;
            margin: 20px 0 24px 0;
        }
        .status-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 700;
            margin: 0 auto;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
            position: relative;
            min-width: 120px;
        }
        .approved { 
            background: #10b981;
            color: #ffffff;
        }
        .rejected { 
            background: #ef4444;
            color: #ffffff;
        }
        .pending { 
            background: #f59e0b;
            color: #ffffff;
        }
        .message-container {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid #e2e8f0;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        .message-container.approved {
            border-left: 4px solid #10b981;
            background: #f0fdf4;
        }
        .message-container.rejected {
            border-left: 4px solid #ef4444;
            background: #fef2f2;
        }
        .message-container.pending {
            border-left: 4px solid #f59e0b;
            background: #fffbeb;
        }
        .message-title {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 12px 0;
            line-height: 1.3;
            letter-spacing: -0.025em;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        .message-text {
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
            margin: 0 0 16px 0;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        .message-text strong {
            color: #1e293b;
            font-weight: 600;
        }
        .message-text:last-child {
            margin-bottom: 0;
        }
        .action-button {
            display: inline-block;
            background: #1e293b;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            text-align: center;
            box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
            border: none;
            cursor: pointer;
            text-shadow: none;
        }
        .action-button:hover {
            background: #334155;
            transform: translateY(-1px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .features-list {
            background: #ffffff;
            border-radius: 6px;
            padding: 16px;
            margin: 16px 0;
            border: 1px solid #e2e8f0;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        .features-list h3 {
            font-size: 15px;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 12px 0;
            letter-spacing: -0.025em;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }
        .features-list ul {
            margin: 0;
            padding: 0;
            list-style: none;
        }
        .features-list li {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 6px 0;
            font-size: 13px;
            color: #475569;
            line-height: 1.5;
            visibility: visible !important;
            opacity: 1 !important;
        }
        .features-list li::before {
            content: '';
            width: 6px;
            height: 6px;
            background: #10b981;
            border-radius: 50%;
            margin-top: 6px;
            flex-shrink: 0;
        }
        .features-list.rejected li::before {
            background: #ef4444;
        }
        .features-list.pending li::before {
            background: #f59e0b;
        }
        .divider {
            height: 1px;
            background: #e2e8f0;
            margin: 20px 0;
        }
        .footer {
            background: #f8fafc;
            padding: 20px 24px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            font-size: 14px;
            line-height: 1.6;
            color: #64748b;
            margin: 0 0 8px 0;
        }
        .footer .brand {
            font-weight: 600;
            color: #1e293b;
        }
        .social-links {
            margin: 12px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 12px;
            color: #64748b;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            transition: color 0.2s ease;
        }
        .social-links a:hover {
            color: #1e293b;
        }
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 8px;
        }
        .status-indicator.approved {
            background: #10b981;
        }
        .status-indicator.rejected {
            background: #ef4444;
        }
        .status-indicator.pending {
            background: #f59e0b;
        }
        @media (max-width: 600px) {
            .email-container { padding: 10px 5px; }
            .email-header { padding: 6px 16px 4px 16px; }
            .email-content { padding: 16px 16px; }
            .footer { padding: 16px; }
            .email-title { font-size: 20px; }
            .status-badge { padding: 10px 20px; font-size: 12px; }
            .message-container { padding: 16px; }
            .action-button { padding: 10px 20px; font-size: 12px; }
        }
        @media (prefers-color-scheme: dark) {
            .dark-body { background: #0f172a !important; }
            .dark-card { 
                background-color: #1e293b !important; 
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1) !important;
                border-color: #334155 !important;
            }
            .dark-h1, .dark-p, .greeting, .message-title, .message-text { color: #f1f5f9 !important; }
            .dark-footer p { color: #94a3b8 !important; }
            .features-list { 
                background-color: #334155 !important; 
                border-color: #475569 !important; 
            }
            .footer { 
                background-color: #1e293b !important; 
                border-color: #475569 !important; 
            }
            .message-container {
                background-color: #334155 !important;
                border-color: #475569 !important;
            }
        }
    </style>
</head>
<body>
    <span class="pre-header">Your CVeezy payment has been updated.</span>

    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" class="dark-body">
        <tr>
            <td>
                <div class="email-container">
                    <div class="email-card dark-card">
                        <!-- Header Section -->
                        <div class="email-header">
                            <img src="https://i.imgur.com/C6b7UqN.png" alt="CVeezy Logo" class="logo" style="max-width: 392px; height: auto; display: block; margin: 0 auto;">
                        </div>

                        <!-- Content Section -->
                        <div class="email-content" style="padding: 24px; display: block; visibility: visible;">
                            <h1 class="email-title" style="font-size: 32px; font-weight: 700; color: #1e293b; margin: 0 0 12px 0; text-align: center; letter-spacing: -0.025em; display: block;">Payment Status Update</h1>
                            <p class="email-subtitle" style="font-size: 18px; font-weight: 500; color: #64748b; margin: 0 0 32px 0; text-align: center; display: block;">Your payment has been {{ ucfirst($status) }}</p>
                            
                            <p class="greeting" style="font-size: 17px; font-weight: 500; color: #1e293b; margin: 0 0 16px 0; line-height: 1.5; letter-spacing: -0.025em; display: block;">Hi {{ $name }},</p>
                            
                            <div class="status-container" style="text-align: center; margin: 20px 0 24px 0; display: block;">
                                <span class="status-badge {{ $status == 'approved' ? 'approved' : ($status == 'rejected' ? 'rejected' : 'pending') }}" style="display: inline-flex; align-items: center; justify-content: center; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 700; margin: 0 auto; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1); position: relative; min-width: 120px;">
                                    {{ ucfirst($status) }}
                                </span>
                            </div>

                            <!-- Status-specific content -->
                            <div class="message-container {{ $status }}" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
                                @if($status == 'approved')
                                    <h3 class="message-title" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
                                        Payment Approved Successfully
                                    </h3>
                                    <p class="message-text" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
                                        Congratulations! Your payment has been <strong>approved</strong> and your resume is now ready for download. 
                                        You can access all premium features and download your professional resume in PDF format.
                                    </p>
                                    <p class="message-text" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
                                        Your account has been upgraded with full access to our premium features. 
                                        You can now create, edit, and download unlimited professional resumes.
                                    </p>
                                    
                                    <div class="features-list" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
                                        <h3 style="display: block !important; visibility: visible !important; opacity: 1 !important;">What's Next?</h3>
                                        <ul>
                                            <li style="visibility: visible !important; opacity: 1 !important;">Download your professional resume in PDF format</li>
                                            <li style="visibility: visible !important; opacity: 1 !important;">Access premium resume templates</li>
                                            <li style="visibility: visible !important; opacity: 1 !important;">Unlock advanced editing features</li>
                                            <li style="visibility: visible !important; opacity: 1 !important;">Get priority customer support</li>
                                        </ul>
                                    </div>
                                    
                                    <div style="text-align: center; margin-top: 24px;">
                                        <a href="{{ url('/dashboard') }}" class="action-button">
                                            Go to Dashboard
                                        </a>
                                    </div>
                                    
                                @elseif($status == 'rejected')
                                    <h3 class="message-title" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
                                        Payment Rejected
                                    </h3>
                                    <p class="message-text" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
                                        Unfortunately, your payment was <strong>rejected</strong>. This might be due to one of the following reasons:
                                    </p>
                                    
                                    <div class="features-list rejected" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
                                        <h3 style="display: block !important; visibility: visible !important; opacity: 1 !important;">Common Reasons for Rejection:</h3>
                                        <ul>
                                            <li style="visibility: visible !important; opacity: 1 !important;">Invalid or unclear payment proof</li>
                                            <li style="visibility: visible !important; opacity: 1 !important;">Incorrect payment amount</li>
                                            <li style="visibility: visible !important; opacity: 1 !important;">Missing transaction details</li>
                                            <li style="visibility: visible !important; opacity: 1 !important;">Unreadable screenshot or image</li>
                                        </ul>
                                    </div>
                                    
                                    <p class="message-text" style="display: block !important; visibility: visible !important; opacity: 1 !important;">
                                        <strong>Next Steps:</strong> Please upload a clear, valid proof of payment with the correct amount and transaction details. 
                                        If you need assistance, please contact our support team.
                                    </p>
                                    
                                    <div style="text-align: center; margin-top: 24px;">
                                        <a href="{{ url('/payment') }}" class="action-button">
                                            Upload New Payment Proof
                                        </a>
                                    </div>
                                    
                                @else
                                    <h3 class="message-title">
                                        Payment Under Review
                                    </h3>
                                    <p class="message-text">
                                        Your payment is currently <strong>pending review</strong>. Our team is carefully examining your payment proof 
                                        and will notify you once the review is complete.
                                    </p>
                                    <p class="message-text">
                                        We appreciate your patience as we verify your payment details to ensure a secure transaction.
                                    </p>
                                    
                                    <div class="features-list pending">
                                        <h3>Review Process:</h3>
                                        <ul>
                                            <li>Payment proof verification</li>
                                            <li>Amount and details validation</li>
                                            <li>Security checks</li>
                                            <li>Final approval process</li>
                                        </ul>
                                    </div>
                                    
                                    <p class="message-text">
                                        <strong>Estimated Time:</strong> 1-2 business hours during regular business days.
                                    </p>
                                @endif
                            </div>

                            <div class="divider"></div>

                            <p style="text-align: center; font-size: 14px; color: #64748b; margin: 0;">
                                Thank you for choosing <strong>CVeezy</strong>. We appreciate your trust in us.
                            </p>
                        </div>

                        <!-- Footer Section -->
                        <div class="footer">
                            <p>This is an automated message. Please do not reply directly to this email.</p>
                            <p>If you have any questions, please contact our support team.</p>
                            
                            <div class="social-links">
                                <a href="{{ url('/') }}">Visit Website</a>
                                <a href="{{ url('/contact') }}">Contact Support</a>
                                <a href="{{ url('/dashboard') }}">Dashboard</a>
                            </div>
                            
                            <p class="brand">&copy; {{ date('Y') }} CVeezy by Certicode. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>