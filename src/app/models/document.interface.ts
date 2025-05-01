export interface Document {
  id: number;
  title: string;
  content: string;
  created_date: string;
  modified: string;
  added: string;
  file_type: string;
  correspondent?: number;
  document_type?: number;
  storage_path?: number;
  archive_serial_number?: string;
  original_file_name?: string;
  archived_file_name?: string;
  tags?: number[];
  notes?: string[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DocumentListResponse extends PaginatedResponse<Document> {}

export interface DocumentType {
  id: number;
  name: string;
  match?: string;
  matching_algorithm?: number;
  is_insensitive?: boolean;
  document_count?: number;
}

export interface DocumentTypeListResponse extends PaginatedResponse<DocumentType> {}
