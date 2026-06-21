import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Document, DocumentChunk
from app.services.document_processor import extract_text, chunk_text
from app.services.ai_service import generate_embedding

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("")
def list_documents(db: Session = Depends(get_db)):
    """List all documents."""
    documents = db.query(Document).order_by(Document.created_at.desc()).all()
    return {
        "documents": [
            {
                "id": str(doc.id),
                "filename": doc.filename,
                "subject": doc.subject,
                "file_type": doc.file_type,
                "page_count": doc.page_count,
                "file_size": doc.file_size,
                "status": doc.status,
                "created_at": doc.created_at.isoformat() if doc.created_at else None,
            }
            for doc in documents
        ]
    }


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    subject: str = Form(...),
    db: Session = Depends(get_db),
):
    """Upload and process a document (PDF, DOCX, PPTX)."""
    # Validate file type
    filename = file.filename or "unknown"
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if extension not in ("pdf", "docx", "pptx"):
        raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF, DOCX, or PPTX.")

    # Read file
    file_bytes = await file.read()
    file_size = len(file_bytes)

    # Create document record
    doc = Document(
        id=uuid.uuid4(),
        filename=filename,
        subject=subject,
        file_type=extension.upper(),
        file_size=file_size,
        status="processing",
    )
    db.add(doc)
    db.commit()

    try:
        # Extract text
        text = extract_text(file_bytes, extension)

        if not text or len(text.strip()) < 50:
            doc.status = "error"
            db.commit()
            raise HTTPException(status_code=400, detail="Could not extract enough text from the document")

        # Estimate page count
        page_count = len(text) // 3000 + 1

        # Chunk text
        chunks = chunk_text(text)

        # Generate embeddings and store chunks
        for i, chunk_content in enumerate(chunks):
            embedding = generate_embedding(chunk_content)
            chunk = DocumentChunk(
                id=uuid.uuid4(),
                document_id=doc.id,
                content=chunk_content,
                chunk_index=i,
                embedding=embedding,
            )
            db.add(chunk)

        # Update document status
        doc.status = "ready"
        doc.page_count = page_count
        doc.updated_at = datetime.now(timezone.utc)
        db.commit()

        return {
            "success": True,
            "document": {
                "id": str(doc.id),
                "filename": filename,
                "subject": subject,
                "file_type": extension.upper(),
                "chunks_count": len(chunks),
                "status": "ready",
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        doc.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
