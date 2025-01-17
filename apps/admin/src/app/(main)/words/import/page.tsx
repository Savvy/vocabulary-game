"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ImportResponse {
    success: boolean;
    created: number;
    updated: number;
    skipped: number;
    errors: Array<{ row: number; error: string }>;
    message?: string;
    error?: string;
}

export default function ImportPage() {
    const [uploadProgress, setUploadProgress] = useState(0);

    const importMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/import/words", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Import failed");
            }

            return response.json() as Promise<ImportResponse>;
        },
    });

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            "text/csv": [".csv"],
        },
        maxFiles: 1,
        onDrop: async (acceptedFiles) => {
            if (acceptedFiles.length === 0) return;

            const file = acceptedFiles[0];
            setUploadProgress(0);

            // Simulate upload progress
            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 95) {
                        clearInterval(interval);
                        return prev;
                    }
                    return prev + 5;
                });
            }, 100);

            try {
                await importMutation.mutateAsync(file);
                setUploadProgress(100);
            } catch (error) {
                console.error("Import failed:", error);
            } finally {
                clearInterval(interval);
            }
        },
    });

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Import Words</h1>

            <Card className="p-8">
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                        isDragActive
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/25 hover:border-primary"
                    )}
                >
                    <input {...getInputProps()} />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg mb-2">
                        {isDragActive
                            ? "Drop the CSV file here"
                            : "Drag and drop a CSV file here, or click to select"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Only CSV files are supported
                    </p>
                </div>

                {uploadProgress > 0 && (
                    <div className="mt-4">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-2">
                            {uploadProgress === 100 ? "Upload complete" : "Uploading..."}
                        </p>
                    </div>
                )}

                {importMutation.isSuccess && (
                    <Alert className="mt-4">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>Import Successful</AlertTitle>
                        <AlertDescription>
                            {importMutation.data.message}
                            <div className="mt-2">
                                <p>Created: {importMutation.data.created}</p>
                                <p>Updated: {importMutation.data.updated}</p>
                                <p>Skipped: {importMutation.data.skipped}</p>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {importMutation.data?.errors && importMutation.data.errors.length > 0 && (
                    <Alert className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Import Warnings</AlertTitle>
                        <AlertDescription>
                            <div className="mt-2 space-y-1">
                                {importMutation.data.errors.map((error, index) => (
                                    <p key={index}>
                                        Row {error.row}: {error.error}
                                    </p>
                                ))}
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {importMutation.isError && (
                    <Alert className="mt-4" variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Import Failed</AlertTitle>
                        <AlertDescription>
                            {importMutation.error instanceof Error
                                ? importMutation.error.message
                                : "An unknown error occurred"}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4">CSV Format</h2>
                    <div className="bg-muted p-4 rounded-lg">
                        <FileText className="w-6 h-6 mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                            Your CSV file should have the following columns:
                        </p>
                        <code className="text-sm">
                            category,imageUrl,lang_en,lang_es,lang_fr
                        </code>
                        <p className="text-sm text-muted-foreground mt-2">
                            Example:
                            <br />
                            animals,https://example.com/dog.jpg,dog,perro,chien
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
