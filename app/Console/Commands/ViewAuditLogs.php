<?php

namespace App\Console\Commands;

use App\Models\AuditLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ViewAuditLogs extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'audit:logs 
                            {--recent : Show only recent logs (last 24 hours)}
                            {--suspicious : Show only security events}
                            {--type= : Filter by event type}
                            {--status= : Filter by status}
                            {--user= : Filter by user email}
                            {--ip= : Filter by IP address}
                            {--limit=50 : Number of logs to show}
                            {--export : Export to CSV file}';

    /**
     * The console command description.
     */
    protected $description = 'View and monitor authentication audit logs';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $query = AuditLog::with('user')->orderBy('created_at', 'desc');

        // Apply filters
        if ($this->option('recent')) {
            $query->recent();
            $this->info('Showing logs from last 24 hours...');
        }

        if ($this->option('suspicious')) {
            $query->suspicious();
            $this->info('Showing only security events...');
        }

        if ($this->option('type')) {
            $query->byEventType($this->option('type'));
            $this->info("Filtering by event type: {$this->option('type')}");
        }

        if ($this->option('status')) {
            $query->byStatus($this->option('status'));
            $this->info("Filtering by status: {$this->option('status')}");
        }

        if ($this->option('user')) {
            $query->where('user_email', 'like', "%{$this->option('user')}%");
            $this->info("Filtering by user: {$this->option('user')}");
        }

        if ($this->option('ip')) {
            $query->byIpAddress($this->option('ip'));
            $this->info("Filtering by IP: {$this->option('ip')}");
        }

        $limit = (int) $this->option('limit');
        $logs = $query->limit($limit)->get();

        if ($logs->isEmpty()) {
            $this->warn('No audit logs found matching the criteria.');
            return;
        }

        // Show statistics
        $this->showStatistics($query);

        // Show logs in table format
        $this->showLogsTable($logs);

        // Export option
        if ($this->option('export')) {
            $this->exportToCsv($logs);
        }
    }

    /**
     * Show audit log statistics
     */
    private function showStatistics($query): void
    {
        $this->newLine();
        $this->info('📊 AUDIT LOG STATISTICS');
        $this->info('========================');

        $totalLogs = $query->count();
        $securityEvents = $query->clone()->suspicious()->count();
        $recentLogs = $query->clone()->recent()->count();

        $this->table(
            ['Metric', 'Count'],
            [
                ['Total Logs', $totalLogs],
                ['Security Events', $securityEvents],
                ['Recent (24h)', $recentLogs],
            ]
        );

        // Top event types
        $eventTypeStats = $query->clone()
            ->select('event_type', DB::raw('count(*) as count'))
            ->groupBy('event_type')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get();

        if ($eventTypeStats->isNotEmpty()) {
            $this->info('🔍 TOP EVENT TYPES');
            $this->table(
                ['Event Type', 'Count'],
                $eventTypeStats->map(fn($item) => [$item->event_type, $item->count])->toArray()
            );
        }

        // Top IP addresses
        $topIpAddresses = $query->clone()
            ->select('ip_address', DB::raw('count(*) as count'))
            ->groupBy('ip_address')
            ->orderBy('count', 'desc')
            ->limit(5)
            ->get();

        if ($topIpAddresses->isNotEmpty()) {
            $this->info('🌐 TOP IP ADDRESSES');
            $this->table(
                ['IP Address', 'Count'],
                $topIpAddresses->map(fn($item) => [$item->ip_address, $item->count])->toArray()
            );
        }
    }

    /**
     * Show logs in table format
     */
    private function showLogsTable($logs): void
    {
        $this->newLine();
        $this->info('📋 AUDIT LOGS');
        $this->info('=============');

        $tableData = $logs->map(function ($log) {
            return [
                $log->id,
                $log->event_type,
                $log->user_email ?? 'N/A',
                $log->ip_address,
                $log->status,
                $log->created_at->format('Y-m-d H:i:s'),
                $log->context_summary,
            ];
        })->toArray();

        $this->table(
            ['ID', 'Event', 'User', 'IP', 'Status', 'Time', 'Context'],
            $tableData
        );
    }

    /**
     * Export logs to CSV
     */
    private function exportToCsv($logs): void
    {
        $filename = 'audit_logs_' . now()->format('Y-m-d_H-i-s') . '.csv';
        $filepath = storage_path('app/' . $filename);

        $file = fopen($filepath, 'w');

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

        $this->info("✅ Audit logs exported to: {$filepath}");
    }
}
