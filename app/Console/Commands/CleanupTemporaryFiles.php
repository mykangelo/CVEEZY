<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class CleanupTemporaryFiles extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'cleanup:temp-files {--age=1 : Delete files older than X hours}';

    /**
     * The console command description.
     */
    protected $description = 'Clean up temporary resume files older than specified hours';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $ageInHours = (int) $this->option('age');
        $this->info("Cleaning up temporary files older than {$ageInHours} hour(s)...");
        
        $deletedCount = 0;
        
        // Clean up temporary resume files
        $tempPath = storage_path('app/temp/resumes');
        
        if (!File::exists($tempPath)) {
            $this->info('No temporary files directory found.');
            return 0;
        }
        
        $cutoffTime = now()->subHours($ageInHours);
        $files = File::files($tempPath);
        
        foreach ($files as $file) {
            $fileModifiedTime = File::lastModified($file);
            
            if ($fileModifiedTime < $cutoffTime->timestamp) {
                try {
                    File::delete($file);
                    $deletedCount++;
                    $this->line("Deleted: " . basename($file));
                } catch (\Exception $e) {
                    $this->error("Failed to delete: " . basename($file) . " - " . $e->getMessage());
                }
            }
        }
        
        $this->info("Cleanup completed. Deleted {$deletedCount} temporary file(s).");
        
        return 0;
    }
}