<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        
        <!-- Responsive Design Meta Tags -->
        <meta name="theme-color" content="#354eab">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="default">
        <meta name="apple-mobile-web-app-title" content="{{ config('app.name', 'CVeezy') }}">
        <meta name="mobile-web-app-capable" content="yes">
        
        <!-- Cross-browser compatibility -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="format-detection" content="telephone=no">
        
        <!-- Performance optimizations -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        
        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
        
        <!-- Critical CSS for better performance -->
        <style>
            /* Prevent layout shift during page load */
            html, body {
                height: 100%;
                overflow-x: hidden;
            }
            
            /* Ensure smooth scrolling on all devices */
            * {
                scroll-behavior: smooth;
            }
            
            /* Improve text rendering */
            body {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
                text-rendering: optimizeLegibility;
            }
            
            /* Prevent horizontal scroll on mobile */
            .container-responsive {
                max-width: 100vw;
                overflow-x: hidden;
            }
        </style>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
