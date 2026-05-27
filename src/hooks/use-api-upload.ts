import { useCallback, useEffect, useMemo, useState } from 'react';
import { type FileError, type FileRejection, useDropzone } from 'react-dropzone';
import { uploadFile } from '@/api/client';

interface FileWithPreview extends File {
  preview?: string;
  errors: readonly FileError[];
}

type UseApiUploadOptions = {
  path?: string;
  allowedMimeTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
};

type UseApiUploadReturn = ReturnType<typeof useApiUpload>;

const useApiUpload = (options: UseApiUploadOptions = {}) => {
  const {
    allowedMimeTypes = [],
    maxFileSize = Number.POSITIVE_INFINITY,
    maxFiles = 1,
  } = options;

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name: string; message: string }[]>([]);
  const [successes, setSuccesses] = useState<string[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});

  const isSuccess = useMemo(() => {
    if (errors.length === 0 && successes.length === 0) return false;
    return errors.length === 0 && successes.length === files.length;
  }, [errors.length, successes.length, files.length]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const validFiles = acceptedFiles
        .filter((file) => !files.find((x) => x.name === file.name))
        .map((file) => {
          (file as FileWithPreview).preview = URL.createObjectURL(file);
          (file as FileWithPreview).errors = [];
          return file as FileWithPreview;
        });

      const invalidFiles = fileRejections.map(({ file, errors: errs }) => {
        (file as FileWithPreview).preview = URL.createObjectURL(file);
        (file as FileWithPreview).errors = errs;
        return file as FileWithPreview;
      });

      setFiles([...files, ...validFiles, ...invalidFiles]);
    },
    [files],
  );

  const dropzoneProps = useDropzone({
    onDrop,
    noClick: true,
    accept: allowedMimeTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    maxFiles,
    multiple: maxFiles !== 1,
  });

  const onUpload = useCallback(async () => {
    setLoading(true);
    const filesWithErrors = errors.map((x) => x.name);
    const filesToUpload =
      filesWithErrors.length > 0
        ? [...files.filter((f) => filesWithErrors.includes(f.name)), ...files.filter((f) => !successes.includes(f.name))]
        : files;

    const responses = await Promise.all(
      filesToUpload.map(async (file) => {
        try {
          const url = await uploadFile(file);
          setUrls((prev) => ({ ...prev, [file.name]: url }));
          return { name: file.name, message: undefined as string | undefined };
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'Upload failed';
          return { name: file.name, message: msg };
        }
      }),
    );

    setErrors(responses.filter((x) => x.message).map((x) => ({ name: x.name, message: x.message! })));
    setSuccesses(Array.from(new Set([...successes, ...responses.filter((x) => !x.message).map((x) => x.name)])));
    setLoading(false);
  }, [files, errors, successes]);

  useEffect(() => {
    if (files.length === 0) setErrors([]);
    if (files.length <= maxFiles) {
      let changed = false;
      const newFiles = files.map((file) => {
        if (file.errors.some((e) => e.code === 'too-many-files')) {
          file.errors = file.errors.filter((e) => e.code !== 'too-many-files');
          changed = true;
        }
        return file;
      });
      if (changed) setFiles(newFiles);
    }
  }, [files.length, maxFiles, files]);

  return {
    files,
    setFiles,
    successes,
    urls,
    isSuccess,
    loading,
    errors,
    setErrors,
    onUpload,
    maxFileSize,
    maxFiles,
    allowedMimeTypes,
    ...dropzoneProps,
  };
};

export { useApiUpload, type UseApiUploadOptions, type UseApiUploadReturn };
