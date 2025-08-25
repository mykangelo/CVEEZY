<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <title>CVeezy Payment Status Update</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 100% !important;
            background-color: #f8f9fc;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            -webkit-font-smoothing: antialiased;
            color: #475569;
        }
        .pre-header { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; }
        .email-container { padding: 20px; }
        .email-card {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            padding: 48px;
            box-shadow: 0 10px 40px -15px rgba(100, 116, 139, 0.2);
        }
        .logo { display: block; max-width: 220px; height: auto; margin: 0 auto 40px auto; }
        h1 { font-size: 28px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; text-align: center; }
        p { font-size: 16px; line-height: 1.7; margin: 0 0 32px 0; text-align: center; }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            margin: 20px auto;
        }
        .approved { background: #e6f4ea; color: #2e7d32; }
        .rejected { background: #fdecea; color: #c62828; }
        .pending { background: #fff4e5; color: #ff9800; }
        .footer { padding-top: 30px; text-align: center; }
        .footer p { font-size: 12px; line-height: 1.5; color: #94a3b8; margin: 0 0 10px 0; }
        @media (prefers-color-scheme: dark) {
            .dark-body { background-color: #0d1117 !important; }
            .dark-card { background-color: #161b22 !important; box-shadow: none !important; border: 1px solid #30363d !important;}
            .dark-h1, .dark-p { color: #f0f6fc !important; }
            .dark-footer p { color: #8b949e !important; }
        }
    </style>
</head>
<body>
    <span class="pre-header">Your CVeezy payment has been updated.</span>

    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8f9fc;" class="dark-body">
        <tr>
            <td>
                <div class="email-container">
                    <div class="email-card" class="dark-card">

                        <img src="https://i.imgur.com/sttYRMY.png" alt="CVeezy Logo" class="logo">

                        <h1 class="dark-h1">Payment Status Update</h1>

                        <p class="dark-p">Hi {{ $name }}, here’s the latest update regarding your payment:</p>

                        <div style="text-align:center;">
                            <span class="status-badge 
                                {{ $status == 'approved' ? 'approved' : ($status == 'rejected' ? 'rejected' : 'pending') }}">
                                {{ ucfirst($status) }}
                            </span>
                        </div>

                        @if($status == 'approved')
                            <p class="dark-p">🎉 Great news! Your payment has been <strong>approved</strong>. You can now access your account benefits on CVeezy.</p>
                        @elseif($status == 'rejected')
                            <p class="dark-p">Unfortunately, your payment was <strong>rejected</strong>. This might be due to invalid proof of payment. Please try again or contact support if needed.</p>
                        @else
                            <p class="dark-p">Your payment is still <strong>pending</strong>. We’ll notify you once it has been reviewed.</p>
                        @endif

                        <p class="dark-p" style="font-size: 14px; color: #94a3b8;">Thank you for choosing CVeezy. We appreciate your trust in us.</p>

                    </div>

                    <div class="footer">
                        <p class="dark-footer p">This is an automated message. Please do not reply directly.</p>
                        <p class="dark-footer p">&copy; {{ date('Y') }} CVeezy by Certicode</p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
