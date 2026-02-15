'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

type DocumentType = 
  | 'REPORT_CARD'
  | 'BIRTH_CERTIFICATE'
  | 'GOOD_MORAL'
  | 'MARRIAGE_CONTRACT'
  | 'MEDICAL_RECORDS'
  | 'SPECIAL_NEEDS_DIAGNOSIS'
  | 'PROOF_OF_PAYMENT';

type StudentStatus = 'OLD_STUDENT' | 'NEW_STUDENT';

interface DocumentUpload {
  type: DocumentType;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface DocumentUploadProps {
  studentStatus: StudentStatus | '';
  onDocumentsChange: (documents: DocumentUpload[]) => void;
  initialDocuments?: DocumentUpload[];
}

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  REPORT_CARD: 'Report Card',
  BIRTH_CERTIFICATE: 'Birth Certificate',
  GOOD_MORAL: 'Good Moral Certificate',
  MARRIAGE_CONTRACT: 'Marriage Contract',
  MEDICAL_RECORDS: 'Medical Records',
  SPECIAL_NEEDS_DIAGNOSIS: 'Special Needs Diagnosis / Therapist Recommendation',
  PROOF_OF_PAYMENT: 'Proof of Payment',
};

export function DocumentUploadComponent({ studentStatus, onDocumentsChange, initialDocuments = [] }: DocumentUploadProps) {
  const [documents, setDocuments] = useState<DocumentUpload[]>(initialDocuments);
  const fileInputRefs = useRef<Record<DocumentType, HTMLInputElement | null>>({} as any);

  // Determine required documents based on student status
  const getRequiredDocuments = (): DocumentType[] => {
    if (studentStatus === 'OLD_STUDENT') {
      return ['REPORT_CARD', 'PROOF_OF_PAYMENT'];
    } else if (studentStatus === 'NEW_STUDENT') {
      return [
        'REPORT_CARD',
        'BIRTH_CERTIFICATE',
        'GOOD_MORAL',
        'MARRIAGE_CONTRACT',
        'MEDICAL_RECORDS',
        'PROOF_OF_PAYMENT',
      ];
    }
    return [];
  };

  const getOptionalDocuments = (): DocumentType[] => {
    if (studentStatus === 'NEW_STUDENT') {
      return ['SPECIAL_NEEDS_DIAGNOSIS'];
    }
    return [];
  };

  const requiredDocuments = getRequiredDocuments();
  const optionalDocuments = getOptionalDocuments();
  const allDocuments = [...requiredDocuments, ...optionalDocuments];

  const validateFile = (file: File): string | null => {
    // Validate file format (PDF, JPEG, PNG)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return 'File must be PDF, JPEG, or PNG format';
    }

    // Validate file size (10MB max for documents)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return 'File size must not exceed 10MB';
    }

    return null;
  };

  const handleFileChange = (type: DocumentType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateFile(file);
    
    const newDocument: DocumentUpload = {
      type,
      file,
      status: validationError ? 'error' : 'pending',
      error: validationError || undefined,
    };

    // Update documents list
    const updatedDocuments = documents.filter(d => d.type !== type);
    updatedDocuments.push(newDocument);
    setDocuments(updatedDocuments);
    onDocumentsChange(updatedDocuments);
  };

  const handleRemove = (type: DocumentType) => {
    const updatedDocuments = documents.filter(d => d.type !== type);
    setDocuments(updatedDocuments);
    onDocumentsChange(updatedDocuments);
    
    // Reset file input
    if (fileInputRefs.current[type]) {
      fileInputRefs.current[type]!.value = '';
    }
  };

  const getDocumentStatus = (type: DocumentType): DocumentUpload | undefined => {
    return documents.find(d => d.type === type);
  };

  const isDocumentUploaded = (type: DocumentType): boolean => {
    const doc = getDocumentStatus(type);
    return doc !== undefined && doc.status !== 'error';
  };

  if (!studentStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
          <CardDescription>Please select a student status first</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Document requirements will be displayed once you select whether the student is an old or new student.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Required Documents</CardTitle>
        <CardDescription>
          Upload all required documents for {studentStatus === 'OLD_STUDENT' ? 'old' : 'new'} students
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Required Documents */}
        {requiredDocuments.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Required Documents *</h4>
            {requiredDocuments.map((type) => {
              const doc = getDocumentStatus(type);
              const isUploaded = isDocumentUploaded(type);

              return (
                <div key={type} className="border rounded-md p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      {isUploaded ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      )}
                      {DOCUMENT_LABELS[type]}
                    </Label>
                    {isUploaded && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(type)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <input
                    ref={(el) => {
                      fileInputRefs.current[type] = el;
                    }}
                    type="file"
                    accept="application/pdf,image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange(type, e)}
                    className="hidden"
                  />

                  {isUploaded ? (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{doc?.file.name}</span>
                      <span className="text-gray-500">
                        ({(doc!.file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRefs.current[type]?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  )}

                  {doc?.error && (
                    <p className="text-sm text-red-500">{doc.error}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Optional Documents */}
        {optionalDocuments.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Optional Documents</h4>
            {optionalDocuments.map((type) => {
              const doc = getDocumentStatus(type);
              const isUploaded = isDocumentUploaded(type);

              return (
                <div key={type} className="border rounded-md p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      {isUploaded ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-gray-400" />
                      )}
                      {DOCUMENT_LABELS[type]}
                    </Label>
                    {isUploaded && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(type)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <input
                    ref={(el) => {
                      fileInputRefs.current[type] = el;
                    }}
                    type="file"
                    accept="application/pdf,image/jpeg,image/jpg,image/png"
                    onChange={(e) => handleFileChange(type, e)}
                    className="hidden"
                  />

                  {isUploaded ? (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{doc?.file.name}</span>
                      <span className="text-gray-500">
                        ({(doc!.file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRefs.current[type]?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  )}

                  {doc?.error && (
                    <p className="text-sm text-red-500">{doc.error}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* File Format Info */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <p className="text-xs text-gray-600">
            Accepted formats: PDF, JPEG, PNG • Maximum file size: 10MB per document
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
