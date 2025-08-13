<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <title>Secure Your CVeezy Account</title>
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
        .pre-header {
            display: none !important;
            visibility: hidden;
            opacity: 0;
            color: transparent;
            height: 0;
            width: 0;
        }
        .email-container {
            padding: 20px;
        }
        .email-card {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            padding: 48px;
            box-shadow: 0 10px 40px -15px rgba(100, 116, 139, 0.2);
        }
        .logo {
            display: block;
            max-width: 220px;
            height: auto;
            margin: 0 auto 40px auto;
        }
        h1 {
            font-size: 28px;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 16px 0;
            text-align: center;
        }
        p {
            font-size: 16px;
            line-height: 1.7;
            margin: 0 0 32px 0;
            text-align: center;
        }
        .button-wrapper {
            text-align: center;
            margin: 40px 0;
        }
        .button {
            display: inline-block;
            background-image: linear-gradient(to top, #0575E6, #028AFA);
            color: #ffffff !important;
            padding: 16px 40px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(2, 138, 250, 0.3);
            transition: transform 0.2s ease-in-out;
        }
        .button:hover {
            transform: scale(1.05);
        }
        .footer {
            padding-top: 30px;
            text-align: center;
        }
        .footer p {
            font-size: 12px;
            line-height: 1.5;
            color: #94a3b8;
            margin: 0 0 10px 0;
        }
        @media (prefers-color-scheme: dark) {
            .dark-body { background-color: #0d1117 !important; }
            .dark-card { background-color: #161b22 !important; box-shadow: none !important; border: 1px solid #30363d !important;}
            .dark-h1, .dark-p { color: #f0f6fc !important; }
            .dark-footer p { color: #8b949e !important; }
        }
    </style>
</head>
<body>
    <span class="pre-header">Use this link to securely reset your CVeezy password.</span>

    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f8f9fc;" class="dark-body">
        <tr>
            <td>
                <div class="email-container">
                    <div class="email-card" class="dark-card">
                        
                        <img src="https://i.imgur.com/sttYRMY.png" alt="CVeezy Logo" class="logo">
                        
                        <h1 class="dark-h1">Secure Your Account</h1>
                        
                        <p class="dark-p">Hi there, we received a request to reset the password for your CVeezy account. To continue, please click the button below.</p>
                        
                        <div class="button-wrapper">
                            <a href="{{ $url }}" class="button">Create My New Password</a>
                        </div>

                        <p class="dark-p" style="font-size: 14px; color: #94a3b8;">If you didn't request this, you can safely disregard this email. This secure link is valid for the next 60 minutes.</p>

                    </div>
                    
                    <div class="footer">
                        <p class="dark-footer p">You received this email because a password reset was initiated for your account.</p>
                        <p class="dark-footer p">&copy; {{ date('Y') }} CVeezy by Certicode</p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>