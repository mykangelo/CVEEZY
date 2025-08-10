# Resume Parsing Feature - Implementation Guide

## Overview

The resume parsing feature allows users to upload their existing resumes in various formats (PDF, DOC, DOCX, HTML, TXT) and automatically extract structured information to populate the resume builder.

## Features Implemented

### ✅ File Upload & Processing

-   **Drag & drop interface** with visual feedback
-   **Multiple file format support**: PDF, DOC, DOCX, HTML, TXT
-   **File validation**: Type and size (10MB limit) checking
-   **Real-time preview** of extracted data before creation

### ✅ Intelligent Data Extraction

-   **Contact Information**: Name, email, phone, address components
-   **Work Experience**: Job titles, companies, dates, descriptions
-   **Education**: Schools, degrees, dates, descriptions
-   **Skills**: Technical and soft skills with categorization
-   **Additional Sections**: Languages, certifications, awards, websites

### ✅ Quality Assessment

-   **Parsing confidence scoring** (High/Medium/Low)
-   **Section-by-section analysis** of extraction success
-   **Smart suggestions** for missing or incomplete data
-   **Preview interface** showing extracted information

### ✅ Seamless Integration

-   **Template selection** during upload process
-   **Automatic builder population** with parsed data
-   **Field mapping** to existing resume builder structure
-   **Real-time editing** after import

### ✅ Security & Performance

-   **Rate limiting**: 10 requests per minute per user
-   **Temporary file cleanup**: Automated hourly cleanup
-   **Secure file storage**: Private storage with automatic deletion
-   **Error handling**: Comprehensive fallback mechanisms

## Usage Flow

1. **Upload**: User visits `/uploader` and drags/drops resume file
2. **Preview**: System parses file and shows extraction preview
3. **Quality Check**: User reviews parsing quality and suggestions
4. **Creation**: System creates resume record with parsed data (using default template)
5. **Template Selection**: User redirected to `/choose-template` to select preferred template
6. **Template Application**: Selected template is applied to the imported resume
7. **Editing**: User redirected to builder for refinement

## File Structure

```
app/
├── Services/
│   └── ResumeParsingService.php      # Core parsing logic
├── Http/Controllers/
│   └── ResumeParsingController.php   # API endpoints
└── Console/Commands/
    └── CleanupTemporaryFiles.php     # File cleanup

resources/js/Pages/
└── Uploader.tsx                      # Enhanced upload interface

routes/
├── web.php                          # API routes for parsing
└── console.php                      # Cleanup scheduling
```

## API Endpoints

### POST `/api/resume/preview`

-   **Purpose**: Preview parsing results before creation
-   **Input**: `resume_file` (multipart/form-data)
-   **Output**: Parsed data + quality assessment

### POST `/api/resume/parse`

-   **Purpose**: Create resume from parsed data
-   **Input**: `resume_file`, `template_name`
-   **Output**: Resume ID + redirect URL

## Parsing Quality Metrics

-   **High Confidence (80-100%)**: All major sections found
-   **Medium Confidence (60-79%)**: Most sections found with minor gaps
-   **Low Confidence (0-59%)**: Significant data missing or unclear

## Supported File Formats

| Format | Library Used      | Extraction Quality |
| ------ | ----------------- | ------------------ |
| PDF    | smalot/pdfparser  | High               |
| DOCX   | phpoffice/phpword | High               |
| DOC    | phpoffice/phpword | Medium             |
| HTML   | Native PHP        | Medium             |
| TXT    | Native PHP        | Low-Medium         |

## Configuration

### File Size Limits

-   **Frontend validation**: 10MB
-   **Backend validation**: 10MB (configurable in controller)

### Rate Limiting

-   **Preview API**: 10 requests/minute
-   **Parse API**: 10 requests/minute

### Cleanup Schedule

-   **Frequency**: Every hour
-   **Retention**: 2 hours (configurable)
-   **Command**: `php artisan cleanup:temp-files --age=2`

## Error Handling

### Frontend Errors

-   File type validation
-   File size validation
-   Upload progress indication
-   Network error handling

### Backend Errors

-   Malformed file handling
-   Parsing failure recovery
-   Storage error management
-   Rate limit enforcement

## Security Features

1. **File Type Validation**: Strict MIME type checking
2. **Size Limits**: Prevent large file abuse
3. **Temporary Storage**: Auto-cleanup of uploaded files
4. **Rate Limiting**: Prevent API abuse
5. **Authentication**: Requires logged-in user
6. **Payment Validation**: Respects payment status

## Future Enhancements

-   **AI-powered parsing** for better accuracy
-   **Resume format detection** and optimization
-   **Batch processing** for multiple files
-   **Custom parsing rules** per industry
-   **Integration with job boards** for direct import

## Troubleshooting

### Common Issues

1. **"Failed to parse PDF"**

    - Try saving PDF as text-selectable (not scanned image)
    - Use simpler PDF creators

2. **"Low parsing confidence"**

    - Ensure resume has clear section headers
    - Use standard resume formatting

3. **"Missing contact information"**
    - Verify contact details are in header/top section
    - Check for standard email/phone formats

### Debug Commands

```bash
# Test file cleanup
php artisan cleanup:temp-files --age=0

# Check parsing logs
tail -f storage/logs/laravel.log | grep "Resume parsing"
```

## Performance Notes

-   **PDF parsing**: Fastest for text-based PDFs
-   **DOCX parsing**: Good performance for structured documents
-   **Large files**: May take 5-10 seconds for complex resumes
-   **Memory usage**: ~50MB peak for large files

---

_The resume parsing feature provides a seamless bridge between existing resumes and the CVEEZY builder, significantly reducing user onboarding time while maintaining data accuracy._
