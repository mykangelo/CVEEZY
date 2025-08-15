<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Thank You for Contacting CVeezy</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #354eab; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
        .footer { text-align: center; padding: 20px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thank You, {{ $name }}!</h1>
        </div>
        <div class="content">
            <p>We’ve received your message and appreciate you reaching out to CVeezy.</p>

            <p>Our team will review your inquiry and get back to you as soon as possible. In the meantime, feel free to explore more of what we offer on our website.</p>

            <p><strong>Note:</strong> This is an automated confirmation. Please do not reply to this email.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} CVeezy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
