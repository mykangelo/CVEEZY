<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    /**
     * Display audit logs with filtering
     */
    public function index(Request $request): Response
    {
        $query = AuditLog::with('user')
            ->orderBy('created_at', 'desc');

        // Filter by event type
        if ($request->filled('event_type')) {
            $query->byEventType($request->event_type);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->byUser($request->user_id);
        }

        // Filter by IP address
        if ($request->filled('ip_address')) {
            $query->byIpAddress($request->ip_address);
        }

        // Filter by date range
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->dateRange($request->start_date, $request->end_date);
        }

        // Filter by search term
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('user_email', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhere('event_type', 'like', "%{$search}%");
            });
        }

        // Get paginated results
        $logs = $query->paginate(50)->withQueryString();

        // Get statistics
        $stats = $this->getAuditLogStats($request);

        // Get filter options
        $filterOptions = $this->getFilterOptions();

        return Inertia::render('Admin/AuditLogs', [
            'logs' => $logs,
            'stats' => $stats,
            'filterOptions' => $filterOptions,
            'filters' => $request->only([
                'event_type', 'status', 'user_id', 'ip_address', 
                'start_date', 'end_date', 'search'
            ]),
        ]);
    }

    /**
     * Show audit log details
     */
    public function show(AuditLog $auditLog): Response
    {
        $auditLog->load('user');

        return Inertia::render('Admin/AuditLogDetail', [
            'log' => $auditLog,
        ]);
    }

    /**
     * Get audit log statistics
     */
    private function getAuditLogStats(Request $request): array
    {
        $query = AuditLog::query();

        // Apply same filters as main query
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->dateRange($request->start_date, $request->end_date);
        }

        $totalLogs = $query->count();
        $securityEvents = $query->clone()->suspicious()->count();
        $recentLogs = $query->clone()->recent()->count();

        // Event type breakdown
        $eventTypeStats = $query->clone()
            ->select('event_type', DB::raw('count(*) as count'))
            ->groupBy('event_type')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get()
            ->pluck('count', 'event_type')
            ->toArray();

        // Status breakdown
        $statusStats = $query->clone()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->orderBy('count', 'desc')
            ->get()
            ->pluck('count', 'status')
            ->toArray();

        // Top IP addresses
        $topIpAddresses = $query->clone()
            ->select('ip_address', DB::raw('count(*) as count'))
            ->groupBy('ip_address')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'ip_address' => $item->ip_address,
                    'count' => $item->count,
                ];
            });

        // Recent activity (last 24 hours)
        $recentActivity = $query->clone()
            ->recent()
            ->select('event_type', DB::raw('count(*) as count'))
            ->groupBy('event_type')
            ->orderBy('count', 'desc')
            ->get()
            ->pluck('count', 'event_type')
            ->toArray();

        return [
            'total_logs' => $totalLogs,
            'security_events' => $securityEvents,
            'recent_logs' => $recentLogs,
            'event_type_stats' => $eventTypeStats,
            'status_stats' => $statusStats,
            'top_ip_addresses' => $topIpAddresses,
            'recent_activity' => $recentActivity,
        ];
    }

    /**
     * Get filter options for dropdowns
     */
    private function getFilterOptions(): array
    {
        return [
            'event_types' => [
                AuditLog::EVENT_LOGIN_SUCCESS => 'Login Success',
                AuditLog::EVENT_LOGIN_FAILED => 'Login Failed',
                AuditLog::EVENT_LOGOUT => 'Logout',
                AuditLog::EVENT_ACCOUNT_LOCKOUT => 'Account Lockout',
                AuditLog::EVENT_PASSWORD_RESET_REQUEST => 'Password Reset Request',
                AuditLog::EVENT_PASSWORD_RESET_COMPLETED => 'Password Reset Completed',
                AuditLog::EVENT_EMAIL_VERIFIED => 'Email Verified',
                AuditLog::EVENT_SOCIAL_LOGIN => 'Social Login',
                AuditLog::EVENT_SUSPICIOUS_ACTIVITY => 'Suspicious Activity',
                AuditLog::EVENT_RATE_LIMIT_EXCEEDED => 'Rate Limit Exceeded',
            ],
            'statuses' => [
                AuditLog::STATUS_INFO => 'Info',
                AuditLog::STATUS_WARNING => 'Warning',
                AuditLog::STATUS_ALERT => 'Alert',
                AuditLog::STATUS_ERROR => 'Error',
            ],
        ];
    }

    /**
     * Export audit logs to CSV
     */
    public function export(Request $request)
    {
        $query = AuditLog::with('user')->orderBy('created_at', 'desc');

        // Apply filters
        if ($request->filled('event_type')) {
            $query->byEventType($request->event_type);
        }
        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->dateRange($request->start_date, $request->end_date);
        }

        $logs = $query->get();

        $filename = 'audit_logs_' . now()->format('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function () use ($logs) {
            $file = fopen('php://output', 'w');
            
            // CSV headers
            fputcsv($file, [
                'ID', 'Event Type', 'User Email', 'User ID', 'IP Address', 
                'User Agent', 'Route', 'Status', 'Context', 'Created At'
            ]);

            // CSV data
            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->event_type,
                    $log->user_email,
                    $log->user_id,
                    $log->ip_address,
                    $log->user_agent,
                    $log->route_name,
                    $log->status,
                    json_encode($log->context),
                    $log->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Clean old audit logs
     */
    public function cleanup(Request $request)
    {
        $days = $request->input('days', 90);
        $deleted = AuditLog::where('created_at', '<', now()->subDays($days))->delete();

        return response()->json([
            'message' => "Deleted {$deleted} audit logs older than {$days} days",
            'deleted_count' => $deleted,
        ]);
    }
}
